// ROUTE (photos)
// Srves files from the uploads directory. 
// Ensuring that only valid paths are accessed and that the correct MIME type is returned based on the file extension.

// IMPORTS
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isVideoFilename, mediaTypeForFilename } from "@/lib/media";
import { uploadsDir } from "@/lib/paths";
import { ensureBrowserVideo, ensureVideoPoster } from "@/lib/video";


// GET
// Serves a file from the uploads directory based on the requested path segments.
export async function GET(
  request: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await ctx.params;
  const rel = segments.join("/");
  if (rel.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }
  const file = path.join(uploadsDir(), rel);
  const root = path.resolve(uploadsDir());
  if (!path.resolve(file).startsWith(root)) {
    return new NextResponse("Not found", { status: 404 });
  }
  try {
    let servingFile = file;
    let contentType = mediaTypeForFilename(file);
    let isVideo = isVideoFilename(file);
    if (path.basename(file).endsWith(".poster.jpg")) {
      const videoStem = path.basename(file).replace(/\.poster\.jpg$/i, "");
      let videoFile: string | undefined;
      for (const extension of [".mp4", ".m4v", ".mov", ".webm"]) {
        const candidate = path.join(path.dirname(file), `${videoStem}${extension}`);
        try {
          await fs.access(candidate);
          videoFile = candidate;
          break;
        } catch {
          continue;
        }
      }
      if (!videoFile) return new NextResponse("Not found", { status: 404 });
      await ensureVideoPoster(videoFile, file);
      contentType = "image/jpeg";
      isVideo = false;
    } else if (isVideo) {
      servingFile = await ensureBrowserVideo(file);
      contentType = "video/mp4";
    }

    const { size } = await fs.stat(servingFile);
    const range = request.headers.get("range");
    const headers = {
      "Accept-Ranges": "bytes",
      "Cache-Control": isVideo ? "public, max-age=0, must-revalidate" : "public, max-age=31536000, immutable",
      "Content-Type": contentType,
    };

    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
      if (!match || (!match[1] && !match[2]) || size === 0) {
        return new NextResponse(null, {
          status: 416,
          headers: { ...headers, "Content-Range": `bytes */${size}` },
        });
      }

      const suffixLength = match[1] ? null : Number(match[2]);
      const start = match[1] ? Number(match[1]) : Math.max(size - (suffixLength ?? 0), 0);
      const end = match[2] && match[1] ? Math.min(Number(match[2]), size - 1) : size - 1;
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: { ...headers, "Content-Range": `bytes */${size}` },
        });
      }

      const handle = await fs.open(servingFile, "r");
      const buffer = Buffer.alloc(end - start + 1);
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, start);
      await handle.close();
      const lastByte = start + bytesRead - 1;
      return new NextResponse(new Uint8Array(buffer.subarray(0, bytesRead)), {
        status: 206,
        headers: {
          ...headers,
          "Content-Length": String(bytesRead),
          "Content-Range": `bytes ${start}-${lastByte}/${size}`,
        },
      });
    }

    const buf = await fs.readFile(servingFile);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        ...headers,
        "Content-Length": String(size),
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
