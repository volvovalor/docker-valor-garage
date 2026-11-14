// Warehouse Page
// Displays the warehouse inventory and allows users to manage stock, storage locations, and reorder needs.

// IMPORTS
import { Suspense } from "react";
import { connection } from "next/server";
import { Card } from "@/components/ui";
import { WarehouseClient } from "@/components/WarehouseClient";
import { listWarehouseItems } from "@/db/queries";


// MAIN FUNCTION
export default function WarehousePage() {
  return (
    <Suspense fallback={<WarehouseFallback />}>
      <WarehouseContent />
    </Suspense>
  );
}


// Warehouse Content
// Fetches the warehouse inventory and renders the page content.
async function WarehouseContent() {
  await connection();
  const items = await listWarehouseItems();
  return <WarehouseClient items={items} />;
}


// Warehouse Fallback
// Displays a loading state while the warehouse inventory is being fetched.
function WarehouseFallback() {
  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <p className="text-xs font-mono uppercase text-accent">Parts & supplies</p>
        <h1 className="mt-1 text-2xl font-semibold">The Warehouse</h1>
        <p className="mt-1 text-sm text-muted">Track stock, storage locations, and reorder needs.</p>
      </header>
      <Card className="py-10 text-center">
        <p className="text-sm text-muted" role="status">Loading inventory...</p>
      </Card>
    </div>
  );
}
