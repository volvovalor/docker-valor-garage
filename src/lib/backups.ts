// BACKUPS
// Provides functions for managing backup files and directories, including creation, listing, and validation.

// IMPORTS
import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import Database from "better-sqlite3";
import { validBackupFolder } from "./garage-options";
import { databaseFile, uploadsDir } from "./paths";

// CONSTANTS
const filesTable = "garage_backup_v1_files";
const filesSchema = `CREATE TABLE ${filesTable} (filename TEXT PRIMARY KEY, content BLOB NOT NULL)`;
const marker = () => `${databaseFile()}.restore-pending`;
const failedRestore = () => `${databaseFile()}.restore-failed`;
const restoreLock = () => `${databaseFile()}.restore-in-progress`;
const namePattern = /^garage-[a-zA-Z0-9][a-zA-Z0-9._-]{0,125}\.sqlite$/;


// Backup Authorized
// Checks if the provided value matches the backup admin token for authorization.
export function backupAuthorized(value: unknown) {
  const token = process.env.BACKUP_ADMIN_TOKEN;
  if (!token || typeof value !== "string") return false;
  const digest = (input: string) => createHash("sha256").update(input).digest();
  return timingSafeEqual(digest(token), digest(value));
}


// Backup Directory
// Resolves and optionally creates the backup directory for the specified folder.
export function backupDirectory(folder: string, create = false) {
  if (!validBackupFolder(folder)) throw new Error("Invalid backup folder.");
  const root = path.resolve(process.env.BACKUP_DIR || "backups");
  if (create) fs.mkdirSync(root, { recursive: true });
  const target = path.join(root, folder);
  if (create && folder) {
    try { fs.mkdirSync(target); } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    }
  }
  if (folder && fs.existsSync(target) && !fs.lstatSync(target).isDirectory()) throw new Error("Backup folder is not a directory.");
  return target;
}


// List Backups
// Retrieves a list of backup files in the specified folder, sorted by modification time.
export function listBackups(folder: string) {
  const directory = backupDirectory(folder);
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && namePattern.test(entry.name))
    .map(({ name }) => ({ name, ...fs.statSync(path.join(directory, name)) }))
    .sort((first, second) => second.mtimeMs - first.mtimeMs)
    .map(({ name, size, mtime }) => ({ name, size, modified: mtime }));
}


// Backup File
// Retrieves the full path of a backup file if it exists and is valid.
export function backupFile(folder: string, name: unknown) {
  if (typeof name !== "string" || !namePattern.test(name)) return undefined;
  const file = path.join(backupDirectory(folder), name);
  return fs.lstatSync(file, { throwIfNoEntry: false })?.isFile() ? file : undefined;
}


// Safe Parts
// Splits a filename into safe path components, ensuring it does not contain unsafe characters or reserved names.
function safeParts(filename: string) {
  const parts = filename.split("/");
  if (!parts.every((part) => part && part !== "." && part !== ".." && !/[\\:<>"|?*\x00-\x1f]|[. ]$/.test(part)
    && !/^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(part))) throw new Error("Unsafe upload filename in backup.");
  return parts;
}


// Upload Entries
// Recursively yields all file paths under the specified root directory, prefixed with the given string.
function* uploadEntries(root: string, prefix = ""): Generator<string> {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const filename = `${prefix}${entry.name}`;
    if (entry.isDirectory()) yield* uploadEntries(path.join(root, entry.name), `${filename}/`);
    else if (entry.isFile()) yield filename;
  }
}


// Create Backup
// Creates a new backup of the SQLite database and uploads directory, storing it in the specified folder.
export async function createBackup(sqlite: Database.Database, folder: string) {
  const directory = backupDirectory(folder, true);
  const name = `garage-${new Date().toISOString().replaceAll(":", "-")}-${randomUUID().slice(0, 8)}.sqlite`;
  const target = path.join(directory, name);
  const temporary = `${target}.partial`;
  try {
    await sqlite.backup(temporary);
    const archive = new Database(temporary, { fileMustExist: true });
    try {
      archive.pragma("journal_mode = DELETE");
      archive.exec(filesSchema);
      const insert = archive.prepare(`INSERT INTO ${filesTable} VALUES (?, ?)`);
      archive.transaction(() => {
        for (const filename of uploadEntries(uploadsDir())) {
          insert.run(filename, fs.readFileSync(path.join(uploadsDir(), ...safeParts(filename))));
        }
      })();
    } finally { archive.close(); }
    fs.renameSync(temporary, target);
  } finally { fs.rmSync(temporary, { force: true }); }
}


// Schema Of
// Retrieves the schema of the specified SQLite database, excluding internal SQLite tables and the files table.
function schemaOf(sqlite: Database.Database) {
  return sqlite.prepare("SELECT type, name, tbl_name, sql FROM sqlite_schema WHERE name NOT GLOB 'sqlite_*' AND name != ? ORDER BY name")
    .all(filesTable);
}


// Validate Archive
// Validates that the given archive database is compatible with the live database and contains the expected schema.
function validateArchive(archive: Database.Database, live: Database.Database) {
  archive.pragma("trusted_schema = OFF");
  const schema = archive.prepare("SELECT sql FROM sqlite_schema WHERE type = 'table' AND name = ?").pluck().get(filesTable);
  if (schema !== filesSchema || JSON.stringify(schemaOf(archive)) !== JSON.stringify(schemaOf(live))
    || archive.pragma("quick_check", { simple: true }) !== "ok") throw new Error("Invalid or incompatible garage backup.");
}


// Restore Queued
// Checks if a restore operation has been queued.
export function restoreQueued() {
  return fs.existsSync(marker());
}


// Restore Failed
// Checks if the last restore operation failed.
export function restoreFailed() {
  return fs.existsSync(failedRestore());
}


// Cancel Restore
// Cancels any queued restore operation.
export function cancelRestore() {
  fs.rmSync(marker(), { force: true });
}


// Queue Restore
// Queues a restore operation by validating the given archive and preparing it for application.
export function queueRestore(sqlite: Database.Database, file: string) {
  if (restoreQueued()) throw new Error("A restore is already queued.");
  const temporary = `${marker()}.${randomUUID()}.partial`;
  try {
    fs.copyFileSync(file, temporary, fs.constants.COPYFILE_EXCL);
    const archive = new Database(temporary, { readonly: true, fileMustExist: true });
    try {
      validateArchive(archive, sqlite);
      const entries = archive.prepare(`SELECT filename FROM ${filesTable}`).pluck().iterate() as Iterable<string>;
      for (const filename of entries) safeParts(filename);
    } finally { archive.close(); }
    fs.renameSync(temporary, marker());
  } finally { fs.rmSync(temporary, { force: true }); }
}


// Apply Queued Restore
// Applies a previously queued restore operation, handling staging, validation, and atomic replacement of the live database and uploads.
export function applyQueuedRestore() {
  if (fs.existsSync(restoreLock())) throw new Error("An interrupted garage restore needs operator recovery. See README.");
  if (!restoreQueued()) return;
  const database = databaseFile();
  const uploads = uploadsDir();
  const freshDb = `${database}.restore-next`;
  const freshUploads = `${uploads}.restore-next`;
  const previous = `.before-restore-${randomUUID()}`;
  if (fs.existsSync(freshDb) || fs.existsSync(freshUploads)) throw new Error("Restore staging paths already exist. See README.");
  fs.closeSync(fs.openSync(restoreLock(), "wx"));
  const moves: [string, string][] = [];
  let releaseLock = true;
  try {
    fs.copyFileSync(marker(), freshDb, fs.constants.COPYFILE_EXCL);
    fs.mkdirSync(freshUploads, { recursive: true });
    const archive = new Database(freshDb, { fileMustExist: true });
    try {
      const live = new Database(database, { readonly: true, fileMustExist: true });
      try { validateArchive(archive, live); } finally { live.close(); }
      const rows = archive.prepare(`SELECT filename, content FROM ${filesTable}`).iterate() as Iterable<{ filename: string; content: Buffer }>;
      for (const { filename, content } of rows) {
        const target = path.join(freshUploads, ...safeParts(filename));
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, content, { flag: "wx" });
      }
      archive.exec(`DROP TABLE ${filesTable}`);
      archive.pragma("journal_mode = DELETE");
      archive.exec("VACUUM");
    } finally { archive.close(); }
    const move = (from: string, to: string) => { fs.renameSync(from, to); moves.push([from, to]); };
    for (const suffix of ["", "-wal", "-shm"]) {
      if (fs.existsSync(database + suffix)) move(database + suffix, database + previous + suffix);
    }
    if (fs.existsSync(uploads)) move(uploads, uploads + previous);
    move(freshDb, database);
    move(freshUploads, uploads);
    fs.rmSync(failedRestore(), { force: true });
    fs.unlinkSync(marker());
  } catch (error) {
    try { for (const [from, to] of moves.reverse()) fs.renameSync(to, from); }
    catch {
      releaseLock = false;
      throw error;
    }
    fs.renameSync(marker(), failedRestore());
    console.error("Queued garage restore failed; the original garage was retained", error);
  } finally {
    if (releaseLock) {
      fs.rmSync(freshDb, { force: true });
      fs.rmSync(freshUploads, { force: true, recursive: true });
      fs.unlinkSync(restoreLock());
    }
  }
}
