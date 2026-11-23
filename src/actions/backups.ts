// Backups Action
// Handles backup-related actions for the Valor Garage project, including creating, canceling, and restoring backups.
"use server";

// IMPORTS
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { backupAuthorized, backupFile, cancelRestore, createBackup, queueRestore } from "@/lib/backups";
import { readGarageSettings } from "@/lib/garage-settings";


// Change Backups
// Handles the creation, cancellation, and restoration of garage backups based on the submitted form data.
export async function changeBackups(form: FormData) {
  if (!backupAuthorized(form.get("token"))) redirect("/settings?updated=backup-denied#backups");
  const intent = form.get("intent");
  let result: string;
  try {
    const { backupFolder } = readGarageSettings();
    const sqlite = getDb().$client;
    if (intent === "create") {
      await createBackup(sqlite, backupFolder);
      result = "backup-created";
    } else if (intent === "cancel") {
      cancelRestore();
      result = "backup-canceled";
    } else if (intent === "restore" && form.get("confirm") === "on") {
      const file = backupFile(backupFolder, form.get("file"));
      if (!file) throw new Error("Backup file not found.");
      queueRestore(sqlite, file);
      result = "backup-queued";
    } else {
      result = "backup-confirm";
    }
  } catch (error) {
    console.error("Garage backup operation failed", error);
    result = "backup-error";
  }
  redirect(`/settings?updated=${result}#backups`);
}
