// CARS (actions)

// This file contains server actions related to car management:
// - creating
// - updating
// - archiving
// - restoring
// - deleting 

"use server";

// IMPORTS
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { cars } from "@/db/schema";
import { newId } from "@/lib/ids";
import type { CarSpecs, CustomPart } from "@/lib/types";


// String helper
// Extract and trim values from FormData
function str(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}


// Parse Parts
// Takes raw JSON string and attempts to parse it into an array of CustomPart objects. 
// If parsing fails or the result is not an array, it returns an empty array.
function parseParts(raw: string): CustomPart[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CustomPart[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}


// Specs From
// Extracts car specifications from FormData and returns a CarSpecs object. 
// Uses str helper to get values for each specification, returning undefined for any missing values.
function specsFrom(form: FormData): CarSpecs {
  return {
    engine: str(form, "engine") || undefined,
    transmission: str(form, "transmission") || undefined,
    drivetrain: str(form, "drivetrain") || undefined,
    fuel: str(form, "fuel") || undefined,
    ecu: str(form, "ecu") || undefined,
    displacement: str(form, "displacement") || undefined,
  };
}


// Year From
// Extracts year from FormData, converts it to a number, and returns it. 
// If the value is not a valid number, it returns null.
function yearFrom(form: FormData) {
  const raw = str(form, "year");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}


// Create Car
// Handles creation of a new car entry in the database. 
// Validates required fields, generates new ID, and inserts the car data into the database. 
// After insertion, it revalidates the relevant paths and redirects to the newly created car's page.
export async function createCar(form: FormData) {
  const nickname = str(form, "nickname");
  const make = str(form, "make");
  const model = str(form, "model");
  if (!nickname || !make || !model) {
    throw new Error("Nickname, make, and model are required.");
  }
  const id = newId();
  const now = new Date();
  const db = getDb();
  await db.insert(cars).values({
    id,
    nickname,
    make,
    model,
    year: yearFrom(form),
    vin: str(form, "vin") || null,
    color: str(form, "color") || null,
    notes: str(form, "notes") || null,
    specs: specsFrom(form),
    customParts: parseParts(str(form, "customParts")),
    createdAt: now,
    updatedAt: now,
  });
  revalidatePath("/");
  redirect(`/cars/${id}`);
}


// Update Car
// Updates existing car entry in the database. 
// Validates required fields, updates car data, and revalidates the relevant paths. 
// After updating, it redirects to the updated car's page.
export async function updateCar(form: FormData) {
  const id = str(form, "id");
  const nickname = str(form, "nickname");
  const make = str(form, "make");
  const model = str(form, "model");
  if (!id || !nickname || !make || !model) {
    throw new Error("Nickname, make, and model are required.");
  }
  const db = getDb();
  await db
    .update(cars)
    .set({
      nickname,
      make,
      model,
      year: yearFrom(form),
      vin: str(form, "vin") || null,
      color: str(form, "color") || null,
      notes: str(form, "notes") || null,
      specs: specsFrom(form),
      customParts: parseParts(str(form, "customParts")),
      updatedAt: new Date(),
    })
    .where(eq(cars.id, id));
  revalidatePath("/");
  revalidatePath(`/cars/${id}`);
  redirect(`/cars/${id}`);
}


// Archive Car
// Marks car as archived in the database by setting the archivedAt timestamp. 
// It revalidates the relevant paths to reflect the change.
export async function archiveCar(id: string) {
  const db = getDb();
  await db
    .update(cars)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(eq(cars.id, id));
  revalidatePath("/");
  revalidatePath(`/cars/${id}`);
}


// Restore Car
// Restores archived car by clearing the archivedAt timestamp. 
// Revalidates the relevant paths to reflect the change.
export async function restoreCar(id: string) {
  const db = getDb();
  await db
    .update(cars)
    .set({ archivedAt: null, updatedAt: new Date() })
    .where(eq(cars.id, id));
  revalidatePath("/");
  revalidatePath(`/cars/${id}`);
}


// Delete Car
// Permanently deletes car entry from the database. 
// Revalidates the relevant paths and redirects to the home page after deletion.
export async function deleteCar(id: string) {
  const db = getDb();
  await db.delete(cars).where(eq(cars.id, id));
  revalidatePath("/");
  revalidatePath("/cars");
  redirect("/cars");
}
