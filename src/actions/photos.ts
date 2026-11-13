// PHOTOS
// This file contains server-side actions related to photo management for cars. 
// - uploading photos
// - setting cover photos
// - updating photo captions
// - deleting photos. 
// Each function interacts with the database and the file system as needed, 
// and revalidates relevant paths to ensure the UI reflects the latest changes.

"use server";

// IMPORTS
import fs from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { cars, photos } from "@/db/schema";
import { newId } from "@/lib/ids";
import { carUploadDir } from "@/lib/paths";


// Allowed formats
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

// Extension Helper
// Determines appropriate file extension for an uploaded photo
// Ensures that the file is saved with a correct and consistent extension
// Defaulting to ".jpg" if the type is unrecognized.
function extFor(type: string, name: string) {
  const fromName = path.extname(name).toLowerCase();
  if (fromName && [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(fromName)) {
    return fromName === ".jpeg" ? ".jpg" : fromName;
  }
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/gif") return ".gif";
  return ".jpg";
}


// Upload Photos
// Handles upload of photos for a specific car. 
// Validates car ID and the uploaded files
// Saves the files to the appropriate directory, inserts photo records into the database.
// Revalidates relevant paths to update the UI.
export async function uploadPhotos(form: FormData) {
  const carId = String(form.get("carId") ?? "");
  if (!carId) throw new Error("Missing car");
  const caption = String(form.get("caption") ?? "").trim() || null;
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) throw new Error("Choose at least one photo");

  await fs.mkdir(carUploadDir(carId), { recursive: true });
  const db = getDb();
  const now = new Date();

  for (const file of files) {
    if (!ALLOWED.has(file.type) && !/\.(jpe?g|png|webp|gif)$/i.test(file.name)) {
      continue;
    }
    const id = newId();
    const filename = `${id}${extFor(file.type, file.name)}`;
    const dest = path.join(carUploadDir(carId), filename);
    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(dest, buf);
    await db.insert(photos).values({
      id,
      carId,
      filename,
      caption,
      sortOrder: 0,
      createdAt: now,
    });
  }
  revalidatePath(`/cars/${carId}`);
  revalidatePath(`/cars/${carId}/photos`);
  revalidatePath("/");
}


// Set Cover Photo
// Sets specific photo as the cover photo for a car. 
// Updates car's record in the database with the new cover photo ID.
// Revalidates relevant paths to ensure the UI reflects the change.
export async function setCoverPhoto(carId: string, photoId: string) {
  const db = getDb();
  await db
    .update(cars)
    .set({ coverPhotoId: photoId, updatedAt: new Date() })
    .where(eq(cars.id, carId));
  revalidatePath(`/cars/${carId}`);
  revalidatePath(`/cars/${carId}/photos`);
  revalidatePath("/");
}


// Update Photo Caption
// Updates caption of a specific photo.
// Retrieves the photo ID and new caption from the form data
// Updates the photo record in the database. 
// Revalidates the relevant paths to reflect the change in the UI.
export async function updatePhotoCaption(form: FormData) {
  const id = String(form.get("id") ?? "");
  const carId = String(form.get("carId") ?? "");
  const caption = String(form.get("caption") ?? "").trim() || null;
  const db = getDb();
  await db.update(photos).set({ caption }).where(eq(photos.id, id));
  revalidatePath(`/cars/${carId}/photos`);
}


// Delete Photo
// Deletes a specific photo from the database and the file system. 
// Checks if the photo exists, removes it from the database, deletes the associated file. 
// Revalidates relevant paths to update the UI. 
// If the deleted photo was set as the cover photo for the car, it also clears the cover photo reference in the car's record.
export async function deletePhoto(carId: string, photoId: string) {
  const db = getDb();
  const row = (await db.select().from(photos).where(eq(photos.id, photoId)).limit(1))[0];
  if (!row) return;
  await db.delete(photos).where(eq(photos.id, photoId));
  const car = (await db.select().from(cars).where(eq(cars.id, carId)).limit(1))[0];
  if (car?.coverPhotoId === photoId) {
    await db.update(cars).set({ coverPhotoId: null, updatedAt: new Date() }).where(eq(cars.id, carId));
  }
  try {
    await fs.unlink(path.join(carUploadDir(carId), row.filename));
  } catch {
    // file already gone
  }
  revalidatePath(`/cars/${carId}`);
  revalidatePath(`/cars/${carId}/photos`);
  revalidatePath("/");
}
