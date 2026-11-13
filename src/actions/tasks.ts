// TASKS
// This file contains server-side actions related to task management within the application. 
// It includes functions for adding, toggling, updating, and deleting tasks, 
// as well as handling associated data and revalidating paths to ensure the UI reflects the latest state of the database.

"use server";

// IMPORTS
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { tasks } from "@/db/schema";
import { newId } from "@/lib/ids";


// Add Task
// Handles creation of a new task entry in the database. 
// Validates required fields, generates a new ID, and inserts the task data into the database. 
// After insertion, it revalidates the relevant paths.
export async function addTask(form: FormData) {
  const projectId = String(form.get("projectId") ?? "");
  const carId = String(form.get("carId") ?? "");
  const title = String(form.get("title") ?? "").trim();
  const parentTaskId = String(form.get("parentTaskId") ?? "").trim() || null;
  if (!projectId || !title) throw new Error("Task title is required.");
  const now = new Date();
  const db = getDb();
  await db.insert(tasks).values({
    id: newId(),
    projectId,
    parentTaskId,
    title,
    status: "todo",
    notes: null,
    sortOrder: Date.now(),
    createdAt: now,
    updatedAt: now,
  });
  revalidatePath(`/cars/${carId}/jobs/${projectId}`);
  revalidatePath(`/cars/${carId}/jobs`);
}


// Toggle Task
// Toggles status of a specific task between "done" and "todo". 
// Retrieves task ID, car ID, and project ID from the form data, updates the task's status in the database.
// Revalidates the relevant paths to reflect the change in the UI.
export async function toggleTask(form: FormData) {
  const id = String(form.get("id") ?? "");
  const carId = String(form.get("carId") ?? "");
  const projectId = String(form.get("projectId") ?? "");
  const status = String(form.get("status") ?? "") === "done" ? "todo" : "done";
  const db = getDb();
  await db.update(tasks).set({ status, updatedAt: new Date() }).where(eq(tasks.id, id));
  revalidatePath(`/cars/${carId}/jobs/${projectId}`);
}


// Update Task Title
// Updates title of a specific task. 
// Retrieves task ID, car ID, project ID, and new title from the form data. updates the task's title in the database. 
// Revalidates the relevant paths to reflect the change in the UI.
export async function updateTaskTitle(form: FormData) {
  const id = String(form.get("id") ?? "");
  const carId = String(form.get("carId") ?? "");
  const projectId = String(form.get("projectId") ?? "");
  const title = String(form.get("title") ?? "").trim();
  if (!title) return;
  const db = getDb();
  await db.update(tasks).set({ title, updatedAt: new Date() }).where(eq(tasks.id, id));
  revalidatePath(`/cars/${carId}/jobs/${projectId}`);
}


// Delete Task
// Feletes a specific task from the database. 
// Retrieves the task ID, car ID, and project ID from the form data, removes the task from the database. 
// Revalidates the relevant paths to update the UI.
export async function deleteTask(form: FormData) {
  const id = String(form.get("id") ?? "");
  const carId = String(form.get("carId") ?? "");
  const projectId = String(form.get("projectId") ?? "");
  const db = getDb();
  await db.delete(tasks).where(eq(tasks.id, id));
  revalidatePath(`/cars/${carId}/jobs/${projectId}`);
}
