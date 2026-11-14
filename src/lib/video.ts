// Video Utilities
// Provides functions for transcoding video files and generating poster images.

// IMPORTS
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

// CONSTANTS
const execFileAsync = promisify(execFile);
const pendingVideos = new Map<string, Promise<string>>();
const pendingPosters = new Map<string, Promise<void>>();
const videoCompatibility = new Map<string, { compatible: boolean; modifiedAt: number }>();

// Probe Result Type
// Represents the structure of the JSON output from ffprobe, containing information about the streams in a media file.
type ProbeResult = {
  streams?: Array<{
    codec_name?: string;
    codec_type?: string;
    pix_fmt?: string;
  }>;
};


// Run FFmpeg
// Executes the ffmpeg command with the specified arguments.
// Ensuring that it runs without user interaction and captures errors.
async function runFfmpeg(args: string[]) {
  await execFileAsync(
    "ffmpeg",
    ["-nostdin", "-hide_banner", "-loglevel", "error", "-y", ...args],
    { maxBuffer: 1024 * 1024, timeout: 5 * 60 * 1000 },
  );
}


// Probe Video
// Uses ffprobe to analyze a video file and extract information about its streams.
// Returns a structured object containing codec names, types, and pixel formats.
async function probeVideo(filename: string) {
  const { stdout } = await execFileAsync(
    "ffprobe",
    [
      "-v", "error",
      "-show_entries", "stream=codec_name,codec_type,pix_fmt",
      "-of", "json",
      filename,
    ],
    { maxBuffer: 1024 * 1024, timeout: 30_000 },
  );
  return JSON.parse(stdout) as ProbeResult;
}


// Browser Video Filename
// Generates a filename for a browser-compatible version of a video file by appending ".browser.mp4" to the original name.
function browserVideoFilename(filename: string) {
  const extension = path.extname(filename);
  return path.join(path.dirname(filename), `${path.basename(filename, extension)}.browser.mp4`);
}


// Temporary Filename
// Creates a unique temporary filename based on the original filename, process ID, and a random UUID.
// This is used to avoid conflicts during video transcoding and poster generation.
function temporaryFilename(filename: string) {
  return `${filename}.${process.pid}.${crypto.randomUUID()}.tmp${path.extname(filename)}`;
}


// Create Browser Video
// Transcodes a video file to a browser-compatible format (H.264 video, AAC audio, MP4 container).
// Uses ffmpeg to perform the conversion and saves the output to a temporary file before renaming it to the final destination.
async function createBrowserVideo(source: string, destination: string) {
  const temporary = temporaryFilename(destination);
  try {
    await runFfmpeg([
      "-i", source,
      "-map", "0:v:0",
      "-map", "0:a?",
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-crf", "24",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      temporary,
    ]);
    await fs.rename(temporary, destination);
  } catch (error) {
    await fs.rm(temporary, { force: true });
    throw error;
  }
}


// Transcode Video
// Converts a video file to a browser-compatible format and caches the result to avoid redundant processing.
// If a transcoding operation is already in progress for the same destination, it returns the existing promise.
export function transcodeVideo(source: string, destination: string) {
  const existing = pendingVideos.get(destination);
  if (existing) return existing;

  const conversion = createBrowserVideo(source, destination).then(() => destination);
  pendingVideos.set(destination, conversion);
  void conversion.then(
    () => pendingVideos.delete(destination),
    () => pendingVideos.delete(destination),
  );
  return conversion;
}


// Ensure Browser Video
// Checks if a video file is already in a browser-compatible format. If not, it transcodes the video.
// Uses ffprobe to determine compatibility and caches the result to avoid redundant checks.
export async function ensureBrowserVideo(source: string) {
  const sourceStat = await fs.stat(source);
  let probe = videoCompatibility.get(source);
  if (!probe || probe.modifiedAt !== sourceStat.mtimeMs) {
    const metadata = await probeVideo(source);
    const streams = metadata.streams ?? [];
    const video = streams.find((stream) => stream.codec_type === "video");
    const audio = streams.find((stream) => stream.codec_type === "audio");
    if (!video) throw new Error("The uploaded file does not contain a video stream.");
    probe = {
      compatible:
        path.extname(source).toLowerCase() === ".mp4" &&
        video.codec_name === "h264" &&
        video.pix_fmt === "yuv420p" &&
        (!audio || audio.codec_name === "aac"),
      modifiedAt: sourceStat.mtimeMs,
    };
    videoCompatibility.set(source, probe);
  }
  if (probe.compatible) return source;

  const destination = browserVideoFilename(source);
  try {
    const stat = await fs.stat(destination);
    if (stat.size > 0 && stat.mtimeMs >= sourceStat.mtimeMs) return destination;
  } catch {
    // Generate the compatible rendition below.
  }
  return transcodeVideo(source, destination);
}


// Create Poster
// Generates a poster image for a video file, either from the video itself or from a provided custom image.
// Uses ffmpeg to extract a frame from the video or to process the custom image, and saves it to a temporary file before renaming it to the final destination.
async function createPoster(source: string, destination: string, customImage?: string) {
  const temporary = temporaryFilename(destination);
  try {
    const browserVideo = customImage ? null : await ensureBrowserVideo(source);
    await runFfmpeg([
      ...(customImage ? ["-i", customImage] : ["-ss", "0.1", "-i", browserVideo!]),
      "-frames:v", "1",
      "-vf", "scale=min(1280\\,iw):-2",
      "-q:v", "3",
      temporary,
    ]);
    await fs.rename(temporary, destination);
  } catch (error) {
    await fs.rm(temporary, { force: true });
    throw error;
  }
}


// Ensure Video Poster
// Checks if a poster image for a video file already exists. If not, it generates one.
// If a poster generation operation is already in progress for the same destination, it returns the existing promise.
export function ensureVideoPoster(source: string, destination: string, customImage?: string) {
  const existing = pendingPosters.get(destination);
  if (existing) return existing;

  const generation = (async () => {
    try {
      const stat = await fs.stat(destination);
      if (stat.size > 0) return;
    } catch {
      // Generate the poster below.
    }
    await createPoster(source, destination, customImage);
  })();
  pendingPosters.set(destination, generation);
  void generation.then(
    () => pendingPosters.delete(destination),
    () => pendingPosters.delete(destination),
  );
  return generation;
}
