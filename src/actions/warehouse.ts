// Warehouse Actions
// Server-side functions for managing warehouse inventory, including creating, updating, adjusting stock, and deleting items.

"use server";

// IMPORTS
import { eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { warehouseItems } from "@/db/schema";
import { newId } from "@/lib/ids";
import { WAREHOUSE_CATEGORIES, WAREHOUSE_UNITS } from "@/lib/warehouse";


// Value
// Retrieves a trimmed string value from a FormData object for a given key, returning an empty string if the key is not present.
function value(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}


// Number Value
// Retrieves a numeric value from a FormData object for a given key, returning a fallback value if the key is not present or the value is not a valid number.
function numberValue(form: FormData, key: string, fallback = 0) {
  const raw = value(form, key);
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) throw new Error(`${key} must be a valid number.`);
  return parsed;
}


// Item Fields
// Extracts and validates the fields for a warehouse item from a FormData object, ensuring required fields are present and valid.
function itemFields(form: FormData) {
  const name = value(form, "name");
  const category = value(form, "category");
  const unit = value(form, "unit");
  const quantity = numberValue(form, "quantity");
  const reorderAt = numberValue(form, "reorderAt");
  const cost = value(form, "unitCost");
  const unitCostCents = cost ? Math.round(numberValue(form, "unitCost") * 100) : null;

  if (!name) throw new Error("Item name is required.");
  if (!WAREHOUSE_CATEGORIES.includes(category as (typeof WAREHOUSE_CATEGORIES)[number])) {
    throw new Error("Choose a valid item category.");
  }
  if (!WAREHOUSE_UNITS.includes(unit as (typeof WAREHOUSE_UNITS)[number])) {
    throw new Error("Choose a valid unit.");
  }
  if (quantity < 0 || reorderAt < 0 || (unitCostCents !== null && unitCostCents < 0)) {
    throw new Error("Quantity, reorder point, and cost cannot be negative.");
  }

  return {
    name,
    category,
    description: value(form, "description") || null,
    sku: value(form, "sku") || null,
    barcode: value(form, "barcode") || null,
    location: value(form, "location") || "Unassigned",
    quantity,
    unit,
    reorderAt,
    supplier: value(form, "supplier") || null,
    unitCostCents,
    purchaseDate: value(form, "purchaseDate") || null,
  };
}


// Ensure Codes Available
// Checks if the provided SKU and barcode are unique across warehouse items, excluding the current item if updating.
// Throws an error if a duplicate code is found.
async function ensureCodesAvailable(sku: string | null, barcode: string | null, itemId?: string) {
  const db = getDb();
  const codes = new Set([sku, barcode].filter((code): code is string => Boolean(code)));
  for (const code of codes) {
    const [existing] = await db
      .select({ id: warehouseItems.id })
      .from(warehouseItems)
      .where(or(eq(warehouseItems.sku, code), eq(warehouseItems.barcode, code)))
      .limit(1);
    if (existing && existing.id !== itemId) {
      throw new Error(`The code ${code} is already assigned to another item.`);
    }
  }
}


// Create Warehouse Item
// Creates a new warehouse item in the database with the provided form data.
// Validates that the SKU and barcode are unique before insertion.
// Revalidates the warehouse path to update the UI.
export async function createWarehouseItem(form: FormData) {
  const fields = itemFields(form);
  await ensureCodesAvailable(fields.sku, fields.barcode);
  const db = getDb();
  const now = new Date();
  await db.insert(warehouseItems).values({
    id: newId(),
    ...fields,
    createdAt: now,
    updatedAt: now,
  });
  revalidatePath("/warehouse");
}


// Update Warehouse Item
// Updates an existing warehouse item in the database with the provided form data.
// Validates that the SKU and barcode are unique before updating.
// Revalidates the warehouse path to update the UI.
export async function updateWarehouseItem(form: FormData) {
  const id = value(form, "id");
  if (!id) throw new Error("Missing inventory item ID.");
  const fields = itemFields(form);
  await ensureCodesAvailable(fields.sku, fields.barcode, id);
  const db = getDb();
  await db.update(warehouseItems)
    .set({ ...fields, updatedAt: new Date() })
    .where(eq(warehouseItems.id, id));
  revalidatePath("/warehouse");
}


// Adjust Warehouse Stock
// Adjusts the stock quantity of a warehouse item based on the provided form data.
// Supports receiving new stock, consuming stock, or marking an item as out of stock.
// Revalidates the warehouse path to update the UI.
export async function adjustWarehouseStock(form: FormData) {
  const id = value(form, "id");
  const mode = value(form, "mode");
  if (!id) throw new Error("Missing inventory item ID.");
  const db = getDb();
  const [item] = await db.select().from(warehouseItems).where(eq(warehouseItems.id, id)).limit(1);
  if (!item) return;

  let quantity: number;
  if (mode === "out") {
    quantity = 0;
  } else {
    const amount = numberValue(form, "amount", 1);
    if (amount <= 0) throw new Error("Enter a quantity greater than zero.");
    if (mode === "receive") quantity = item.quantity + amount;
    else if (mode === "consume") quantity = Math.max(0, item.quantity - amount);
    else throw new Error("Choose receive, consume, or out-of-stock.");
  }

  await db.update(warehouseItems)
    .set({ quantity, updatedAt: new Date() })
    .where(eq(warehouseItems.id, id));
  revalidatePath("/warehouse");
}


// Delete Warehouse Item
// Deletes a warehouse item from the database based on the provided form data.
// Revalidates the warehouse path to update the UI.
export async function deleteWarehouseItem(form: FormData) {
  const id = value(form, "id");
  if (!id) throw new Error("Missing inventory item ID.");
  const db = getDb();
  await db.delete(warehouseItems).where(eq(warehouseItems.id, id));
  revalidatePath("/warehouse");
}
