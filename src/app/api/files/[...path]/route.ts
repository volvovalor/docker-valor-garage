// ROUTE (photos)
// Srves files from the uploads directory. 
// Ensuring that only valid paths are accessed and that the correct MIME type is returned based on the file extension.

// IMPORTS
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { uploadsDir } from "@/lib/paths";


// TYPES
const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};


// GET
// Serves a file from the uploads directory based on the requested path segments.
export async function GET(
  _request: Request,
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
    const buf = await fs.readFile(file);
    const ext = path.extname(file).toLowerCase();
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
