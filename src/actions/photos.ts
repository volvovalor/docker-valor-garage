// PHOTOS
// This file contains server-side actions related to photo and video management for cars.
// - uploading media
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
import { isVideoFilename, uploadExtension, videoPosterFilename } from "@/lib/media";
import { carUploadDir } from "@/lib/paths";
import { ensureVideoPoster, transcodeVideo } from "@/lib/video";


// CONSTANTS
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const MAX_THUMBNAIL_BYTES = 20 * 1024 * 1024;


// File Stem
// Returns the base name of a file without its extension, in lowercase.
// Used to match video files with their corresponding thumbnail images.
function fileStem(filename: string) {
  return path.basename(filename, path.extname(filename)).toLowerCase();
}


// Upload Photos
// Handles upload of images and video clips for a specific car.
// Validates car ID and the uploaded files
// Saves the files to the appropriate directory, inserts photo records into the database.
// Revalidates relevant paths to update the UI.
export async function uploadPhotos(form: FormData) {
  const carId = String(form.get("carId") ?? "");
  if (!carId) throw new Error("Missing car");
  const caption = String(form.get("caption") ?? "").trim() || null;
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const thumbnails = form.getAll("thumbnails").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) throw new Error("Choose at least one photo or video");

  const uploads = files.map((file) => ({
    file,
    extension: uploadExtension(file.type, file.name),
  }));
  const videoStems = new Set(
    uploads
      .filter((upload) => upload.extension === ".mp4")
      .map((upload) => fileStem(upload.file.name)),
  );
  if (uploads.some((upload) => !upload.extension)) {
    throw new Error("Use JPG, PNG, GIF, WebP, MP4, M4V, MOV, or WebM files.");
  }
  if (files.reduce((total, file) => total + file.size, 0) > MAX_UPLOAD_BYTES) {
    throw new Error("The combined upload size must be 100 MB or less.");
  }
  if (
    thumbnails.some((thumbnail) => {
      const extension = uploadExtension(thumbnail.type, thumbnail.name);
      return !extension || ![".jpg", ".png", ".gif", ".webp"].includes(extension);
    }) ||
    thumbnails.reduce((total, thumbnail) => total + thumbnail.size, 0) > MAX_THUMBNAIL_BYTES
  ) {
    throw new Error("Video thumbnails must be JPG, PNG, GIF, or WebP images under 20 MB total.");
  }
  if (thumbnails.some((thumbnail) => !videoStems.has(fileStem(thumbnail.name)))) {
    throw new Error("Name each thumbnail to match its video, such as drive.mp4 and drive.jpg.");
  }


  // Thumbnail by Stem Map
  // Creates a mapping of thumbnail files by their base name (stem) to facilitate matching with video files.
  const thumbnailByStem = new Map(thumbnails.map((thumbnail) => [fileStem(thumbnail.name), thumbnail]));


  // Ensure Upload Directory
  // Creates the upload directory for the car if it doesn't already exist.
  await fs.mkdir(carUploadDir(carId), { recursive: true });


  // Get Database
  // Retrieves a database connection to perform insertions and updates related to the uploaded photos.
  const db = getDb();


  // Current Timestamp
  // Used for setting the creation time of uploaded photos in the database.
  const now = new Date();


  // Process Each Upload
  // Iterates through each uploaded file, handling video and image files differently.
  for (const { file, extension } of uploads) {
    const id = newId();
    const filename = `${id}${extension}`;
    const dest = path.join(carUploadDir(carId), filename);
    if (isVideoFilename(filename)) {
      const source = `${dest}.${process.pid}.upload`;
      const thumbnail = thumbnailByStem.get(fileStem(file.name));
      const customPoster = thumbnail ? `${dest}.${process.pid}.poster-upload` : undefined;
      const poster = path.join(carUploadDir(carId), videoPosterFilename(filename));
      try {
        await fs.writeFile(source, Buffer.from(await file.arrayBuffer()));
        if (thumbnail && customPoster) {
          await fs.writeFile(customPoster, Buffer.from(await thumbnail.arrayBuffer()));
        }
        await transcodeVideo(source, dest);
        await ensureVideoPoster(dest, poster, customPoster);
      } catch (error) {
        await fs.rm(dest, { force: true });
        await fs.rm(poster, { force: true });
        throw error;
      } finally {
        await fs.rm(source, { force: true });
        if (customPoster) await fs.rm(customPoster, { force: true });
      }
    } else {
      const buf = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(dest, buf);
    }
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
  revalidatePath("/gallery");
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
  revalidatePath("/gallery");
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
  if (isVideoFilename(row.filename)) {
    const directory = carUploadDir(carId);
    await Promise.all([
      fs.rm(path.join(directory, videoPosterFilename(row.filename)), { force: true }),
      fs.rm(path.join(directory, `${path.parse(row.filename).name}.browser.mp4`), { force: true }),
    ]);
  }
  revalidatePath(`/cars/${carId}`);
  revalidatePath(`/cars/${carId}/photos`);
  revalidatePath("/gallery");
  revalidatePath("/");
}
