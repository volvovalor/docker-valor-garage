// DIAGRAMS
// This file contains server-side actions related to diagram management, 
// - creating
// - updating
// - saving flow data
// - uploading backgrounds
// - clearing backgrounds
// - deleting diagrams. 
// Each function interacts with the database and handles necessary validations and revalidations of paths.

"use server";

// IMPORTS
import fs from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { diagramLinks, diagrams } from "@/db/schema";
import { newId } from "@/lib/ids";
import { carUploadDir } from "@/lib/paths";
import { EMPTY_FLOW, type FlowDocument } from "@/lib/types";


// String helper
// Extract and trim values from FormData
function str(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}


// Create Diagram
// Handles the creation of a new diagram entry in the database.
// Validates required fields, generates new ID, inserts the diagram data into the database.
// Revalidates the relevant paths and redirects to the newly created diagram's page.
export async function createDiagram(form: FormData) {
  const carId = str(form, "carId");
  const title = str(form, "title");
  if (!carId || !title) throw new Error("Title is required.");
  const id = newId();
  const now = new Date();
  const db = getDb();
  await db.insert(diagrams).values({
    id,
    carId,
    title,
    description: str(form, "description") || null,
    flowJson: EMPTY_FLOW,
    sortOrder: Date.now(),
    createdAt: now,
    updatedAt: now,
  });
  revalidatePath(`/cars/${carId}/wiring`);
  redirect(`/cars/${carId}/wiring/${id}`);
}


// Update Diagram Meta
// Updates the metadata of an existing diagram entry in the database.
// Validates required fields and revalidates the relevant paths.
export async function updateDiagramMeta(form: FormData) {
  const id = str(form, "id");
  const carId = str(form, "carId");
  const title = str(form, "title");
  if (!id || !title) throw new Error("Title is required.");
  const db = getDb();
  await db
    .update(diagrams)
    .set({
      title,
      description: str(form, "description") || null,
      updatedAt: new Date(),
    })
    .where(eq(diagrams.id, id));
  revalidatePath(`/cars/${carId}/wiring`);
  revalidatePath(`/cars/${carId}/wiring/${id}`);
}


// Save Diagram Flow
// Saves the flow data of a diagram in the database.
// Updates the flow JSON and manages the links between diagrams based on the nodes in the flow.
// Revalidates the relevant paths.
export async function saveDiagramFlow(diagramId: string, carId: string, flow: FlowDocument) {
  const db = getDb();
  await db
    .update(diagrams)
    .set({ flowJson: flow, updatedAt: new Date() })
    .where(eq(diagrams.id, diagramId));

  const nodes = Array.isArray(flow.nodes) ? flow.nodes : [];
  await db.delete(diagramLinks).where(eq(diagramLinks.fromDiagramId, diagramId));
  const now = new Date();
  for (const node of nodes) {
    const n = node as { id?: string; type?: string; data?: { targetDiagramId?: string; targetNodeId?: string } };
    if (n.type !== "portal" || !n.id || !n.data?.targetDiagramId) continue;
    await db.insert(diagramLinks).values({
      id: newId(),
      fromDiagramId: diagramId,
      fromNodeId: n.id,
      toDiagramId: n.data.targetDiagramId,
      toNodeId: n.data.targetNodeId || null,
      createdAt: now,
    });
  }
  void carId;
}


// Upload Diagram Background
// Handles the upload of a background image for a diagram.
// Validates file, saves to the appropriate directory, updates diagram entry in the database with the filename.
// Revalidates the relevant paths.
export async function uploadDiagramBackground(form: FormData) {
  const diagramId = str(form, "diagramId");
  const carId = str(form, "carId");
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Choose an image");
  await fs.mkdir(carUploadDir(carId), { recursive: true });
  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const filename = `bg-${diagramId}${ext}`;
  await fs.writeFile(path.join(carUploadDir(carId), filename), Buffer.from(await file.arrayBuffer()));
  const db = getDb();
  await db
    .update(diagrams)
    .set({ backgroundFilename: filename, updatedAt: new Date() })
    .where(eq(diagrams.id, diagramId));
  revalidatePath(`/cars/${carId}/wiring/${diagramId}`);
}


// Clear Diagram Background
// Clears background image of diagram by setting the background filename to null in the database.
// Revalidates the relevant paths to reflect the change.
export async function clearDiagramBackground(diagramId: string, carId: string) {
  const db = getDb();
  await db
    .update(diagrams)
    .set({ backgroundFilename: null, updatedAt: new Date() })
    .where(eq(diagrams.id, diagramId));
  revalidatePath(`/cars/${carId}/wiring/${diagramId}`);
}


// Delete Diagram
// Deletes diagram entry from the database. 
// Removes the diagram and its associated links. 
// Revalidates the relevant paths, and redirects to the wiring page of the car.
export async function deleteDiagram(carId: string, diagramId: string) {
  const db = getDb();
  await db.delete(diagrams).where(eq(diagrams.id, diagramId));
  revalidatePath(`/cars/${carId}/wiring`);
  redirect(`/cars/${carId}/wiring`);
}
