// PATHS
// Utility functions for managing file paths in the project

// IMPORTS
import path from "node:path";


// Data directory
// Returns the absolute path to the data directory
export function dataDir() {
  return path.join(process.cwd(), "data");
}


// Uploads directory
// Returns the absolute path to the uploads directory within the data directory
export function uploadsDir() {
  return path.join(dataDir(), "uploads");
}


// Car upload directory
// Returns the absolute path to the upload directory for a specific car, identified by carId
export function carUploadDir(carId: string) {
  return path.join(uploadsDir(), carId);
}


// Database file path
// Returns the absolute path to the database file, based on the DATABASE_URL environment variable or a default value
export function databaseFile() {
  const raw = process.env.DATABASE_URL ?? "file:./data/garage.db";
  const withoutScheme = raw.replace(/^file:/, "");
  if (path.isAbsolute(withoutScheme)) return withoutScheme;
  return path.join(process.cwd(), withoutScheme);
}
