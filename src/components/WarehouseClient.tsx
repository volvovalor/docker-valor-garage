// Warehouse Client
// A React component for managing warehouse inventory, including item intake, stock adjustments, and label printing.

"use client";

// IMPORTS
import { BrowserMultiFormatReader } from "@zxing/browser";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import {
  adjustWarehouseStock,
  createWarehouseItem,
  deleteWarehouseItem,
  updateWarehouseItem,
} from "@/actions/warehouse";
import { Button, Input, Select, Textarea } from "@/components/ui";
import type { WarehouseItem } from "@/db/schema";
import { WAREHOUSE_CATEGORIES, WAREHOUSE_UNITS } from "@/lib/warehouse";


// Stock filter type
type StockFilter = "all" | "low" | "out";


// Stock State
// Determines the stock state of an item based on its quantity and reorder point.
function stockState(item: WarehouseItem) {
  if (item.quantity <= 0) return "out";
  if (item.reorderAt > 0 && item.quantity <= item.reorderAt) return "low";
  return "in";
}


// Stock Label
// Returns a human-readable label for the stock state of an item.
function stockLabel(item: WarehouseItem) {
  const state = stockState(item);
  if (state === "out") return "Out of stock";
  if (state === "low") return "Low stock";
  return "In stock";
}


// Item Fields
// Renders form fields for creating or updating a warehouse item, pre-filling values if an existing item is provided.
function ItemFields({ item }: { item?: WarehouseItem }) {
  return (
    <>
      <label className="grid gap-1 text-xs text-muted">
        Item name
        <Input name="name" required defaultValue={item?.name} placeholder="Oil filter" />
      </label>
      <label className="grid gap-1 text-xs text-muted">
        Category
        <Select name="category" defaultValue={item?.category ?? WAREHOUSE_CATEGORIES[0]}>
          {WAREHOUSE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
        </Select>
      </label>
      <label className="grid gap-1 text-xs text-muted">
        Quantity
        <Input name="quantity" type="number" min="0" step="any" required defaultValue={item?.quantity ?? 1} />
      </label>
      <label className="grid gap-1 text-xs text-muted">
        Unit
        <Select name="unit" defaultValue={item?.unit ?? "pcs"}>
          {WAREHOUSE_UNITS.map((unit) => <option key={unit}>{unit}</option>)}
        </Select>
      </label>
      <label className="grid gap-1 text-xs text-muted">
        Storage location
        <Input name="location" defaultValue={item?.location ?? ""} placeholder="Rack A / Bin 3" />
      </label>
      <label className="grid gap-1 text-xs text-muted">
        Reorder at
        <Input name="reorderAt" type="number" min="0" step="any" defaultValue={item?.reorderAt ?? 0} />
      </label>
      <label className="grid gap-1 text-xs text-muted">
        SKU
        <Input name="sku" defaultValue={item?.sku ?? ""} placeholder="Optional" />
      </label>
      <label className="grid gap-1 text-xs text-muted">
        Barcode / QR value
        <Input name="barcode" defaultValue={item?.barcode ?? ""} placeholder="Scan or enter a code" />
      </label>
      <label className="grid gap-1 text-xs text-muted">
        Supplier
        <Input name="supplier" defaultValue={item?.supplier ?? ""} placeholder="Optional" />
      </label>
      <label className="grid gap-1 text-xs text-muted">
        Unit cost
        <Input name="unitCost" type="number" min="0" step="0.01" defaultValue={item?.unitCostCents == null ? "" : (item.unitCostCents / 100).toFixed(2)} placeholder="0.00" />
      </label>
      <label className="grid gap-1 text-xs text-muted">
        Purchase date
        <Input name="purchaseDate" type="date" defaultValue={item?.purchaseDate ?? ""} />
      </label>
      <label className="grid gap-1 text-xs text-muted sm:col-span-2">
        Notes
        <Textarea name="description" rows={2} defaultValue={item?.description ?? ""} placeholder="Part number, fitment, or other details" />
      </label>
    </>
  );
}


// Camera Scanner
// A modal component that uses the device camera to scan barcodes or QR codes, invoking a callback with the scanned code.
function CameraScanner({
  onCode,
  onClose,
}: {
  onCode: (code: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const onCodeRef = useRef(onCode);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCodeRef.current = onCode;
    onCloseRef.current = onClose;
  }, [onCode, onClose]);

  useEffect(() => {
    let cancelled = false;
    let stopScanning: (() => void) | undefined;

    async function startCamera() {
      try {
        const videoElement = videoRef.current;
        if (!videoElement) return;
        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromVideoDevice(undefined, videoElement, (result, _error, callbackControls) => {
          if (!result || cancelled) return;
          cancelled = true;
          callbackControls.stop();
          onCodeRef.current(result.getText());
          onCloseRef.current();
        });
        stopScanning = controls.stop;
        if (cancelled) controls.stop();
      } catch {
        setError("Camera unavailable. Check browser permission or enter the code in search.");
      }
    }

    void startCamera();
    return () => {
      cancelled = true;
      stopScanning?.();
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Scan an item barcode or QR code"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-xl rounded-lg border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Scan item code</h2>
          <button type="button" onClick={onClose} aria-label="Close scanner" className="rounded px-2 py-1 text-muted hover:bg-surface-2 hover:text-foreground">Close</button>
        </div>
        <video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full rounded bg-black object-cover" />
        <p role="status" className="mt-3 min-h-5 text-sm text-muted">
          {error || "Point the camera at an item barcode or QR code."}
        </p>
      </div>
    </div>
  );
}


// Item Label
// A component that generates and displays a QR code and barcode for a warehouse item, with an option to print the label.
function ItemLabel({ item }: { item: WarehouseItem }) {
  const code = item.barcode || item.sku || item.id;
  const barcodeRef = useRef<SVGSVGElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(code, { width: 180, margin: 1, errorCorrectionLevel: "M" })
      .then((dataUrl) => { if (!cancelled) setQrDataUrl(dataUrl); })
      .catch(() => { if (!cancelled) setQrDataUrl(""); });
    return () => { cancelled = true; };
  }, [code]);

  useEffect(() => {
    if (!barcodeRef.current) return;
    try {
      JsBarcode(barcodeRef.current, code, {
        format: "CODE128",
        height: 44,
        margin: 4,
        displayValue: true,
        fontSize: 12,
        lineColor: "#161412",
      });
    } catch {
      barcodeRef.current.replaceChildren();
    }
  }, [code]);


  // Print Label
  // Opens a new window with the item label and triggers the print dialog.
  function printLabel() {
    if (!qrDataUrl || !barcodeRef.current) return;
    const printWindow = window.open("", "_blank", "width=440,height=520");
    if (!printWindow) return;

    const document = printWindow.document;
    document.title = `Warehouse label - ${item.name}`;
    const style = document.createElement("style");
    style.textContent = "@page{margin:8mm}body{font:14px Arial,sans-serif;color:#111}.label{text-align:center;max-width:360px;margin:0 auto}.label img{width:150px;height:150px}.label svg{width:100%;height:auto}.label h1{font-size:20px;margin:8px 0}.label p{margin:4px 0}";
    const label = document.createElement("main");
    label.className = "label";
    const title = document.createElement("h1");
    title.textContent = item.name;
    const qr = document.createElement("img");
    qr.src = qrDataUrl;
    qr.alt = "QR code";
    const barcode = document.importNode(barcodeRef.current, true);
    const codeText = document.createElement("p");
    codeText.textContent = code;
    label.append(title, qr, barcode, codeText);
    document.head.append(style);
    document.body.replaceChildren(label);
    window.setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 250);
  }

  return (
    <details className="warehouse-label-details">
      <summary className="cursor-pointer text-xs text-accent hover:text-accent-strong">Codes / print label</summary>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt={`QR code for ${item.name}`} className="size-24 border border-border bg-white p-1" />
        ) : null}
        <svg ref={barcodeRef} aria-label={`Barcode for ${item.name}`} className="h-16 max-w-56" />
        <div>
          <p className="font-mono text-xs">{code}</p>
          <Button type="button" variant="outline" className="mt-2" onClick={printLabel} disabled={!qrDataUrl}>
            Print label
          </Button>
        </div>
      </div>
    </details>
  );
}


// Warehouse Client
// A React component for managing warehouse inventory, including item intake, stock adjustments, and label printing.
export function WarehouseClient({ items }: { items: WarehouseItem[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanCode, setScanCode] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");

  const lowCount = items.filter((item) => item.quantity > 0 && item.reorderAt > 0 && item.quantity <= item.reorderAt).length;
  const outCount = items.filter((item) => item.quantity <= 0).length;
  const filteredItems = items.filter((item) => {
    const term = query.trim().toLowerCase();
    const matchesText = !term || [item.name, item.category, item.sku, item.barcode, item.location, item.description]
      .some((value) => value?.toLowerCase().includes(term));
    const state = stockState(item);
    return matchesText && (filter === "all" || (filter === "low" && state === "low") || (filter === "out" && state === "out"));
  });
  const scannedItem = scanCode
    ? items.find((item) => [item.id, item.sku, item.barcode].some((value) => value?.toLowerCase() === scanCode.toLowerCase()))
    : undefined;
  const scanMessage = scanCode
    ? scannedItem
      ? `Found ${scannedItem.name} · ${scannedItem.quantity} ${scannedItem.unit} at ${scannedItem.location}.`
      : `No item matches code ${scanCode}.`
    : "";


  // Locate Code
  // Searches for an item by its code (ID, SKU, or barcode) and scrolls it into view if found.
  function locateCode(rawCode: string) {
    const code = rawCode.trim();
    const item = items.find((candidate) =>
      [candidate.id, candidate.sku, candidate.barcode].some((value) => value?.toLowerCase() === code.toLowerCase()),
    );
    setQuery(code);
    setScanCode(code);
    if (!item) {
      setSelectedItemId("");
      return;
    }
    setSelectedItemId(item.id);
    requestAnimationFrame(() => document.getElementById(`warehouse-item-${item.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }


  // Search by Code
  // Triggers a search for an item when the Enter key is pressed in the search input.
  function searchByCode(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    locateCode(query);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-xs font-mono uppercase text-accent">Parts & supplies</p>
          <h1 className="mt-1 text-2xl font-semibold">The Warehouse</h1>
          <p className="mt-1 text-sm text-muted">Track stock, storage locations, and reorder needs.</p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm">
          <SummaryMetric label="Items" value={items.length} />
          <SummaryMetric label="Low stock" value={lowCount} tone="warn" />
          <SummaryMetric label="Out of stock" value={outCount} tone="danger" />
        </div>
      </header>

      <details className="rounded-lg border border-border bg-surface">
        <summary className="flex cursor-pointer items-center justify-between px-4 py-3 font-medium hover:bg-surface-2">
          Intake an item
          <span className="text-xs text-muted">Add stock and label details</span>
        </summary>
        <form action={createWarehouseItem} className="grid gap-3 border-t border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
          <ItemFields />
          <div className="sm:col-span-2 lg:col-span-4">
            <Button type="submit">Add to warehouse</Button>
          </div>
        </form>
      </details>

      <section aria-label="Inventory" className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={searchByCode}
            placeholder="Search or scan a barcode / QR code"
            aria-label="Search inventory or scan a code"
            className="min-w-60 flex-1"
          />
          <Button type="button" variant="outline" onClick={() => setScannerOpen(true)}>
            Scan with camera
          </Button>
          <div role="group" aria-label="Stock filter" className="flex gap-1">
            {(["all", "low", "out"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={`rounded px-3 py-2 text-sm transition ${filter === value ? "bg-surface-2 text-accent" : "text-muted hover:bg-surface-2 hover:text-foreground"}`}
              >
                {value === "all" ? "All" : value === "low" ? `Low (${lowCount})` : `Out (${outCount})`}
              </button>
            ))}
          </div>
        </div>
        <p aria-live="polite" className="min-h-5 text-sm text-accent">{scanMessage}</p>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
            <thead className="bg-surface-2 text-xs uppercase text-muted">
              <tr>
                <th className="px-3 py-3 font-medium">Item</th>
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-3 py-3 font-medium">Location</th>
                <th className="px-3 py-3 font-medium">On hand</th>
                <th className="px-3 py-3 font-medium">Reorder at</th>
                <th className="px-3 py-3 font-medium">Unit cost</th>
                <th className="px-3 py-3 font-medium">Stock actions</th>
                <th className="px-3 py-3 font-medium">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((item) => (
                <WarehouseRow key={item.id} item={item} selected={selectedItemId === item.id} />
              ))}
              {filteredItems.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted">No items match this view.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {scannerOpen ? (
        <CameraScanner onCode={locateCode} onClose={() => setScannerOpen(false)} />
      ) : null}
    </div>
  );
}


// Summary Metric
// A small component to display a labeled numeric metric, with optional color coding for warnings or danger.
function SummaryMetric({ label, value, tone = "normal" }: { label: string; value: number; tone?: "normal" | "warn" | "danger" }) {
  const color = tone === "danger" ? "text-danger" : tone === "warn" ? "text-accent-strong" : "text-foreground";
  return <div><p className="text-xs text-muted">{label}</p><p className={`text-lg font-semibold ${color}`}>{value}</p></div>;
}


// Warehouse Row
// A table row component for displaying a single warehouse item, including its details and stock management actions.
function WarehouseRow({ item, selected }: { item: WarehouseItem; selected: boolean }) {
  const state = stockState(item);
  const stateColor = state === "out" ? "text-danger" : state === "low" ? "text-accent-strong" : "text-emerald-400";
  const codeValue = item.barcode || item.sku || item.id;

  return (
    <tr id={`warehouse-item-${item.id}`} className={selected ? "bg-accent/10" : "bg-background hover:bg-surface/60"}>
      <td className="max-w-72 px-3 py-3 align-top">
        <p className="font-medium">{item.name}</p>
        {item.description ? <p className="mt-0.5 truncate text-xs text-muted" title={item.description}>{item.description}</p> : null}
        <p className="mt-1 font-mono text-[11px] text-muted">{item.sku || codeValue}</p>
      </td>
      <td className="px-3 py-3 align-top text-muted">{item.category}</td>
      <td className="px-3 py-3 align-top">{item.location}</td>
      <td className="px-3 py-3 align-top">
        <span className="font-semibold">{formatQuantity(item.quantity)}</span> <span className="text-muted">{item.unit}</span>
        <p className={`mt-1 text-xs ${stateColor}`}>{stockLabel(item)}</p>
      </td>
      <td className="px-3 py-3 align-top text-muted">{item.reorderAt > 0 ? `${formatQuantity(item.reorderAt)} ${item.unit}` : "—"}</td>
      <td className="px-3 py-3 align-top text-muted">{item.unitCostCents == null ? "—" : `$${(item.unitCostCents / 100).toFixed(2)}`}</td>
      <td className="px-3 py-3 align-top">
        <div className="flex flex-wrap items-center gap-1.5">
          <form action={adjustWarehouseStock} className="flex items-center gap-1">
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="mode" value="consume" />
            <Input name="amount" type="number" min="0.01" step="any" defaultValue="1" aria-label={`Quantity consumed for ${item.name}`} className="w-20 px-2 py-1.5" />
            <Button type="submit" variant="outline" className="px-2 py-1.5">Use</Button>
          </form>
          <form action={adjustWarehouseStock} className="flex items-center gap-1">
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="mode" value="receive" />
            <Input name="amount" type="number" min="0.01" step="any" defaultValue="1" aria-label={`Quantity received for ${item.name}`} className="w-20 px-2 py-1.5" />
            <Button type="submit" variant="outline" className="px-2 py-1.5">Add</Button>
          </form>
          <form action={adjustWarehouseStock}>
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="mode" value="out" />
            <Button type="submit" variant="ghost" className="px-2 py-1.5 text-danger" disabled={state === "out"}>Out</Button>
          </form>
        </div>
      </td>
      <td className="px-3 py-3 align-top">
        <div className="flex flex-col gap-2">
          <ItemLabel item={item} />
          <details>
            <summary className="cursor-pointer text-xs text-muted hover:text-foreground">Edit details</summary>
            <div className="absolute right-8 z-20 mt-2 grid w-[min(42rem,calc(100vw-2rem))] gap-3 rounded-lg border border-border bg-surface p-4 shadow-xl">
              <form action={updateWarehouseItem} className="grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={item.id} />
                <ItemFields item={item} />
                <div className="sm:col-span-2">
                  <Button type="submit">Save item</Button>
                </div>
              </form>
              <form action={deleteWarehouseItem}>
                <input type="hidden" name="id" value={item.id} />
                <Button type="submit" variant="danger">Delete item</Button>
              </form>
            </div>
          </details>
        </div>
      </td>
    </tr>
  );
}


// Format Quantity
// Formats a numeric quantity to a string with up to three decimal places, using the user's locale.
function formatQuantity(quantity: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 }).format(quantity);
}
