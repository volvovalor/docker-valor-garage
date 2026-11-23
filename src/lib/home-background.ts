// HOME BACKGROUNDS
// Defines functions and utilities for managing home background images.

// IMPORTS
import fs from "node:fs";
import path from "node:path";
import { randomInt } from "node:crypto";
import { listAllPhotos } from "@/db/queries";
import type { garageDefaults } from "./garage-options";
import { mediaTypeForFilename } from "./media";
import { uploadsDir } from "./paths";

// CONSTANTS
const defaultImage = "/images/hero-garage.jpg";
const backgroundRoot = () => path.resolve(process.env.BACKGROUND_DIR || "backgrounds");


// Safe Segment
// Utility function to validate a file or directory segment for safety and correctness.
function safeSegment(value: string) {
  return Boolean(value && !/[\\/:<>"|?*\x00-\x1f]|[. ]$/.test(value)
    && !/^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(value));
}


// Entries
// Utility function to read the contents of a directory safely, returning an empty array if the directory does not exist.
function entries(directory: string) {
  try {
    return fs.readdirSync(directory, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}


// Background Directories
// Returns a sorted list of available background directories, including the root.
export function backgroundDirectories() {
  return ["", ...entries(backgroundRoot()).filter((entry) => entry.isDirectory() && safeSegment(entry.name)).map((entry) => entry.name)].sort();
}


// Background File
// Returns the full path to a background file if it exists and is valid, otherwise undefined.
export function backgroundFile(segments: string[]) {
  if (segments.length < 1 || segments.length > 2 || !segments.every(safeSegment)) return undefined;
  const filename = segments.at(-1)!;
  if (!mediaTypeForFilename(filename).startsWith("image/")) return undefined;
  const file = path.join(backgroundRoot(), ...segments);
  const parent = segments.length === 2 ? fs.lstatSync(path.dirname(file), { throwIfNoEntry: false }) : undefined;
  if (segments.length === 2 && !parent?.isDirectory()) return undefined;
  return fs.lstatSync(file, { throwIfNoEntry: false })?.isFile() ? file : undefined;
}


// Directory Images
// Returns a list of image files within a specified background directory.
function directoryImages(directory: string) {
  const root = directory ? path.join(backgroundRoot(), directory) : backgroundRoot();
  return entries(root).filter((entry) => entry.isFile() && safeSegment(entry.name) && mediaTypeForFilename(entry.name).startsWith("image/"))
    .map((entry) => {
      const segments = directory ? [directory, entry.name] : [entry.name];
      return { id: `directory:${segments.join("/")}`, label: segments.join(" / "), url: `/api/backgrounds/${segments.map(encodeURIComponent).join("/")}` };
    });
}


// Owned Images
// Returns a list of images owned by the user, filtered for safety and existence.
async function ownedImages() {
  return (await listAllPhotos()).filter((photo) => safeSegment(photo.carId) && safeSegment(photo.filename)
    && mediaTypeForFilename(photo.filename).startsWith("image/")
    && fs.existsSync(path.join(uploadsDir(), photo.carId, photo.filename)))
    .map((photo) => ({
      id: `photo:${photo.id}`,
      carId: photo.carId,
      label: `${photo.carNickname}: ${photo.caption || photo.filename}`,
      url: `/api/files/${encodeURIComponent(photo.carId)}/${encodeURIComponent(photo.filename)}`,
    }));
}


// Background Choices
// Returns an object containing available background directories and images, including owned images and directory images.
export async function backgroundChoices() {
  const directories = backgroundDirectories();
  return { directories, images: [...await ownedImages(), ...directories.flatMap(directoryImages)] };
}


// Homepage Background
// Determines the appropriate background image URL for the homepage based on user settings.
export async function homepageBackground(settings: typeof garageDefaults) {
  if (settings.backgroundMode === "fixed") {
    if (settings.backgroundImage.startsWith("photo:")) {
      return (await ownedImages()).find((image) => image.id === settings.backgroundImage)?.url ?? defaultImage;
    }
    if (settings.backgroundImage.startsWith("directory:")) {
      const segments = settings.backgroundImage.slice("directory:".length).split("/");
      if (backgroundFile(segments)) return `/api/backgrounds/${segments.map(encodeURIComponent).join("/")}`;
    }
    return defaultImage;
  }
  const images = settings.backgroundMode === "directory"
    ? backgroundDirectories().includes(settings.backgroundDirectory) ? directoryImages(settings.backgroundDirectory) : []
    : (await ownedImages()).filter((image) => settings.backgroundMode === "all" || image.carId === settings.backgroundCar);
  return images.length ? images[randomInt(images.length)].url : defaultImage;
}
