// Media Utilities
// Provides functions for determining media types, handling video files, and generating poster images.

// CONSTANTS
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".m4v": "video/x-m4v",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};

const EXTENSIONS_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "video/x-m4v": ".m4v",
  "video/quicktime": ".mov",
  "video/webm": ".webm",
};

const VIDEO_EXTENSIONS = new Set([".m4v", ".mov", ".mp4", ".webm"]);


// Extension Of
// Returns the file extension of a given filename in lowercase, including the dot.
// If the filename has no extension, returns an empty string.
function extensionOf(filename: string) {
  const dot = filename.lastIndexOf(".");
  return dot < 0 ? "" : filename.slice(dot).toLowerCase();
}


// Media Type For Filename
// Returns the MIME type for a given filename based on its extension.
// If the extension is not recognized, returns "application/octet-stream" as a default.
export function mediaTypeForFilename(filename: string) {
  return MIME_TYPES[extensionOf(filename)] ?? "application/octet-stream";
}


// Is Video Filename
// Determines if a given filename corresponds to a video file based on its extension.
export function isVideoFilename(filename: string) {
  return VIDEO_EXTENSIONS.has(extensionOf(filename));
}


// Video Poster Filename
// Generates a poster image filename for a given video filename by replacing its extension with ".poster.jpg".
export function videoPosterFilename(filename: string) {
  const extensionIndex = filename.lastIndexOf(".");
  const stem = extensionIndex < 0 ? filename : filename.slice(0, extensionIndex);
  return `${stem}.poster.jpg`;
}


// Video Poster URL
// Constructs the URL for accessing the poster image of a video file for a specific car.
export function videoPosterUrl(carId: string, filename: string) {
  return `/api/files/${carId}/${videoPosterFilename(filename)}`;
}


// Upload Extension
// Determines the appropriate file extension for an uploaded file based on its MIME type and original filename.
// Returns ".mp4" for recognized video types, the corresponding image extension for recognized image types,
// or null if the file type is not supported.
export function uploadExtension(type: string, filename: string) {
  const extension = extensionOf(filename);
  if (VIDEO_EXTENSIONS.has(extension) || type.toLowerCase().startsWith("video/")) {
    return ".mp4";
  }
  if (MIME_TYPES[extension]) return extension === ".jpeg" ? ".jpg" : extension;
  return EXTENSIONS_BY_MIME[type.toLowerCase()] ?? null;
}
