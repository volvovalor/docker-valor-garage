import { getDb } from "@/db";

export async function GET(_request: Request, { params }: { params: Promise<{ carId: string; entryId: string }> }) {
  const { carId, entryId } = await params;
  const row = getDb().$client.prepare("SELECT receipt, receipt_mime AS mime FROM fuel_entries WHERE id = ? AND car_id = ?")
    .get(entryId, carId) as { receipt: Buffer | null; mime: string | null } | undefined;
  if (!row?.receipt || !row.mime || !["image/jpeg", "image/png", "image/webp"].includes(row.mime)) {
    return new Response(null, { status: 404 });
  }
  return new Response(new Uint8Array(row.receipt), { headers: {
    "Content-Type": row.mime,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  } });
}

