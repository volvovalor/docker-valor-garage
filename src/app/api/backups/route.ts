// Backups API Route
// Handles retrieval of backup files based on the submitted form data.
// Validates the backup token and returns the requested backup file with appropriate headers or an error response if not found.

// IMPORTS
import fs from "node:fs/promises";
import { Readable } from "node:stream";
import path from "node:path";
import { backupAuthorized, backupFile } from "@/lib/backups";
import { readGarageSettings } from "@/lib/garage-settings";


// POST Handler
// Handles the submission of backup retrieval requests. 
// Validates the backup token, locates the requested backup file, and streams it back to the client with appropriate headers. 
// Returns error responses for invalid tokens or missing files.
export async function POST(request: Request) {
  const form = await request.formData();
  if (!backupAuthorized(form.get("token"))) return new Response("Invalid backup token.", { status: 403 });
  const file = backupFile(readGarageSettings().backupFolder, form.get("file"));
  if (!file) return new Response("Backup not found.", { status: 404 });
  const handle = await fs.open(file, "r");
  return new Response(Readable.toWeb(handle.createReadStream()) as ReadableStream<Uint8Array>, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${path.basename(file)}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
