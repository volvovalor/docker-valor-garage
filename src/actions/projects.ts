// PROJECTS
// This file contains server-side actions related to project management.
// It includes functions for creating, updating, and deleting projects, 
// as well as handling associated data and revalidating paths to ensure the UI reflects the latest state of the database.

"use server";

// IMPORTS
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { newId } from "@/lib/ids";


// String Helper
// Retrieves string value from FormData object based on the provided key.
// Ensures the value is trimmed and returns empty string if key does not exist in the form data.
function str(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}


// Create Project
// Handles creation of new project entry in the database.
// Validates required fields, generates a new ID, and inserts the project data into the database. 
// After insertion, it revalidates the relevant paths and redirects to the newly created project's page.
export async function createProject(form: FormData) {
  const carId = str(form, "carId");
  const title = str(form, "title");
  if (!carId || !title) throw new Error("Title is required.");
  const id = newId();
  const now = new Date();
  const db = getDb();
  await db.insert(projects).values({
    id,
    carId,
    title,
    category: str(form, "category") || "maintenance",
    status: str(form, "status") || "todo",
    notes: str(form, "notes") || null,
    targetDate: str(form, "targetDate") || null,
    createdAt: now,
    updatedAt: now,
  });
  revalidatePath(`/cars/${carId}/jobs`);
  revalidatePath("/jobs");
  redirect(`/cars/${carId}/jobs/${id}`);
}


// Update Project
// Updates existing project entry in the database.
// Validates required fields, updates the project data, and revalidates the relevant paths. 
// After updating, it redirects to the updated project's page.
export async function updateProject(form: FormData) {
  const id = str(form, "id");
  const carId = str(form, "carId");
  const title = str(form, "title");
  if (!id || !carId || !title) throw new Error("Title is required.");
  const db = getDb();
  await db
    .update(projects)
    .set({
      title,
      category: str(form, "category") || "maintenance",
      status: str(form, "status") || "todo",
      notes: str(form, "notes") || null,
      targetDate: str(form, "targetDate") || null,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id));
  revalidatePath(`/cars/${carId}/jobs`);
  revalidatePath(`/cars/${carId}/jobs/${id}`);
  revalidatePath("/jobs");
}


// Delete Project
// Deletes a project entry from the database. 
// Removes the project, revalidates the relevant paths, and redirects to the jobs page of the car.
export async function deleteProject(carId: string, projectId: string) {
  const db = getDb();
  await db.delete(projects).where(eq(projects.id, projectId));
  revalidatePath(`/cars/${carId}/jobs`);
  revalidatePath("/jobs");
  redirect(`/cars/${carId}/jobs`);
}
