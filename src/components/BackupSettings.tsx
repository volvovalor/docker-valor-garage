// BACKUP SETTINGS
// Component for managing backup operations, including creating, restoring, and downloading backups.

// IMPORTS
import { changeBackups } from "@/actions/backups";
import { backupDirectory, listBackups, restoreFailed, restoreQueued } from "@/lib/backups";

// CONSTANTS
const messages: Record<string, string> = {
  "backup-created": "Backup created.",
  "backup-canceled": "Queued restore canceled.",
  "backup-queued": "Restore queued. Restart the garage service to apply it.",
  "backup-denied": "The backup token was not accepted.",
  "backup-confirm": "Select a backup and confirm that it will replace current data.",
  "backup-error": "The backup operation failed. Check the garage server logs for details.",
};

const fieldClass = "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground";
const buttonClass = "rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-surface-2";


// MAIN FUNCTION
export function BackupSettings({ folder, updated }: { folder: string; updated?: string | string[] }) {
  const enabled = Boolean(process.env.BACKUP_ADMIN_TOKEN);
  const pending = restoreQueued();
  let directory = "";
  let backups: ReturnType<typeof listBackups> = [];
  let folderError = false;
  try {
    directory = backupDirectory(folder);
    if (enabled) backups = listBackups(folder);
  } catch {
    folderError = true;
  }
  return (
    <section id="backups" className="space-y-4 border-b border-border py-6" aria-labelledby="backups-heading">
      <div>
        <h2 id="backups-heading" className="text-lg font-semibold">Backups</h2>
        <p className="mt-1 break-all text-sm text-muted">{directory}</p>
      </div>
      {!enabled && <p className="text-sm text-muted">Set <code>BACKUP_ADMIN_TOKEN</code> on the server to enable backup operations.</p>}
      {folderError && <p role="alert" className="text-sm text-danger">The backup folder is unavailable. Check its location and permissions.</p>}
      {pending && <p className="text-sm font-medium text-accent">Restore queued. Current garage data will be replaced on restart.</p>}
      {!pending && restoreFailed() && <p role="alert" className="text-sm text-danger">The last restore failed. The original garage was retained. Check the server logs.</p>}
      {enabled && <form action={changeBackups} className="space-y-3">
        <label className="grid max-w-sm gap-1.5 text-sm font-medium">
          Backup token
          <input type="password" name="token" autoComplete="off" required className={fieldClass} />
        </label>
        {backups.length > 0 && <label className="grid gap-1.5 text-sm font-medium">
          Saved backup
          <select name="file" className={fieldClass}>
            {backups.map(({ name, size }) => <option key={name} value={name}>{name} ({(size / 1024 / 1024).toFixed(1)} MiB)</option>)}
          </select>
        </label>}
        {backups.length > 0 && !pending && <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="confirm" className="size-4 accent-accent" />
          Replace the current database and uploads on restart
        </label>}
        <div className="flex flex-wrap gap-2">
          {!folderError && <button name="intent" value="create" className={buttonClass}>Create backup</button>}
          {backups.length > 0 && <button formAction="/api/backups" formMethod="post" className={buttonClass}>Download</button>}
          {backups.length > 0 && !pending && <button name="intent" value="restore" className={`${buttonClass} text-danger`}>Queue restore</button>}
          {pending && <button name="intent" value="cancel" className={buttonClass}>Cancel restore</button>}
        </div>
      </form>}
      {typeof updated === "string" && Object.hasOwn(messages, updated) && <p role="status" className="text-sm text-muted">{messages[updated]}</p>}
    </section>
  );
}
