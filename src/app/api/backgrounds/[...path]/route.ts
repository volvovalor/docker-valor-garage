// Backgrounds API Route
// Handles retrieval of background images based on the requested path. 
// Returns the image file with appropriate content type headers or a 404 response if not found.

// IMPORTS
import fs from "node:fs/promises";
import { backgroundFile } from "@/lib/home-background";
import { mediaTypeForFilename } from "@/lib/media";


// GET Handler
// Retrieves the background image file based on the requested path and returns it with appropriate headers. 
// If the file is not found, responds with a 404 status.
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const file = backgroundFile((await params).path);
  if (!file) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(await fs.readFile(file)), {
    headers: { "Content-Type": mediaTypeForFilename(file), "X-Content-Type-Options": "nosniff" },
  });
}
