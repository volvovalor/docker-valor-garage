// GARAGE SETTINGS
// Defines functions for reading, writing, and managing garage settings.

// IMPORTS
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getDb } from "@/db";
import { garageDefaults, normalizeGarageOptions, type Feature } from "./garage-options";


// Read Garage Settings
// Reads the current garage settings from the database, returning defaults if not found.
export function readGarageSettings() {
  const row = getDb().$client.prepare("SELECT value FROM garage_settings WHERE id = 1").get() as { value: string } | undefined;
  if (!row) return garageDefaults;
  const values: unknown = JSON.parse(row.value);
  return values && typeof values === "object" ? normalizeGarageOptions(values as Record<string, unknown>) : garageDefaults;
}


// Garage Settings
// Provides functions to access and require specific garage features.
export async function garageSettings() {
  await connection();
  return readGarageSettings();
}


// Require Feature
// Ensures that a specific garage feature is enabled, otherwise triggers a not found response.
export async function requireFeature(feature: Feature) {
  if (!(await garageSettings())[feature]) notFound();
}


// Write Garage Settings
// Writes the provided garage settings to the database, updating existing settings if necessary.
export function writeGarageSettings(settings: typeof garageDefaults) {
  getDb().$client.prepare("INSERT INTO garage_settings (id, value) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET value = excluded.value")
    .run(JSON.stringify(settings));
}
