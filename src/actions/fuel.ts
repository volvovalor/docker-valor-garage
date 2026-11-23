"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { getCar } from "@/db/queries";
import { expenseCategories, fuelTypes, kmPerMile } from "@/lib/fuel";
import { readGarageSettings } from "@/lib/garage-settings";
import { newId } from "@/lib/ids";

const maxReceipt = 8 * 1024 * 1024;

function amount(form: FormData, name: string, label: string, min: number, max: number, optional = false) {
  const raw = String(form.get(name) ?? "").trim();
  if (!raw && optional) return 0;
  const value = Number(raw.replace(",", "."));
  if (!/^\d+(?:[.,]\d+)?$/.test(raw) || !Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${label} must be between ${min} and ${max}.`);
  }
  return value;
}

function receiptType(bytes: Buffer) {
  if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return "image/jpeg";
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP") return "image/webp";
  throw new Error("Choose a JPG, PNG, or WebP receipt image.");
}

export async function saveFuelEntry(carId: string, entryId: string | null, _previous: string, form: FormData) {
  if (!await getCar(carId)) return "Vehicle not found.";
  let input: Record<string, string | number | Buffer | null>;
  try {
    const units = readGarageSettings().units;
    if (form.get("odometerUnits") !== units) return "The garage's units changed. Refresh the page before saving.";
    const odometerKm = amount(form, "odometer", "Odometer", 0, 10_000_000) * (units === "imperial" ? kmPerMile : 1);
    const liters = amount(form, "liters", "Liters", 0.001, 1000);
    const price = amount(form, "price", "Price per liter", 0, 1000);
    const discount = amount(form, "discount", "Discount", 0, 100, true);
    const fuelType = fuelTypes.find((type) => type === form.get("fuelType"));
    if (!fuelType) return "Select a fuel type.";
    const station = String(form.get("station") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();
    if (station.length > 150 || notes.length > 2000) return "Station or notes exceed the character limit.";
    const photo = form.get("receipt");
    let receipt: Buffer | null = null;
    let mime: string | null = null;
    if (photo instanceof File && photo.size) {
      if (photo.size > maxReceipt) return "The receipt image must be 8 MiB or smaller.";
      receipt = Buffer.from(await photo.arrayBuffer());
      mime = receiptType(receipt);
    }
    input = { carId, id: entryId ?? newId(), loggedAt: Date.now(), odometerKm, liters, fuelType, price, discount,
      fullTank: Number(form.has("fullTank")), missedPrevious: Number(form.has("missedPrevious")),
      station, notes, receipt, mime, replaceReceipt: Number(Boolean(receipt) || form.has("removeReceipt")) };
  } catch (error) {
    return error instanceof Error ? error.message : "Invalid fuel entry.";
  }

  const sqlite = getDb().$client;
  if (entryId) {
    const result = sqlite.prepare(`UPDATE fuel_entries SET odometer_km = @odometerKm, liters = @liters, fuel_type = @fuelType,
      price_per_liter = @price, discount = @discount, full_tank = @fullTank, missed_previous = @missedPrevious,
      station = @station, notes = @notes, receipt = CASE WHEN @replaceReceipt THEN @receipt ELSE receipt END,
      receipt_mime = CASE WHEN @replaceReceipt THEN @mime ELSE receipt_mime END WHERE id = @id AND car_id = @carId`).run(input);
    if (result.changes !== 1) return "This entry no longer exists.";
  } else {
    sqlite.prepare(`INSERT INTO fuel_entries (id, car_id, logged_at, odometer_km, liters, fuel_type, price_per_liter,
      discount, full_tank, missed_previous, station, notes, receipt_mime, receipt) VALUES (@id, @carId, @loggedAt,
      @odometerKm, @liters, @fuelType, @price, @discount, @fullTank, @missedPrevious, @station, @notes, @mime, @receipt)`).run(input);
  }
  revalidatePath(`/cars/${carId}/costs`);
  redirect(`/cars/${carId}/costs?status=${entryId ? "updated" : "saved"}#fuel-log`);
}

export async function deleteFuelEntry(carId: string, entryId: string, form: FormData) {
  if (form.get("confirmDelete") !== "on") return;
  getDb().$client.prepare("DELETE FROM fuel_entries WHERE id = ? AND car_id = ?").run(entryId, carId);
  revalidatePath(`/cars/${carId}/costs`);
  redirect(`/cars/${carId}/costs?status=deleted#fuel-log`);
}

export async function saveVehicleExpense(carId: string, _previous: string, form: FormData) {
  if (!await getCar(carId)) return "Vehicle not found.";
  const category = expenseCategories.find((value) => value === form.get("category"));
  const title = String(form.get("title") ?? "").trim();
  if (!category || !title || title.length > 150) return "Enter a description and choose a category.";
  let cents: number;
  try {
    cents = Math.round(amount(form, "amount", "Amount", 0.01, 1_000_000) * 100);
  } catch (error) {
    return error instanceof Error ? error.message : "Invalid expense amount.";
  }
  getDb().$client.prepare("INSERT INTO vehicle_expenses VALUES (?, ?, ?, ?, ?, ?)").run(newId(), carId, Date.now(), category, title, cents);
  revalidatePath(`/cars/${carId}/costs`);
  redirect(`/cars/${carId}/costs?status=expense-saved#other-costs`);
}

export async function deleteVehicleExpense(carId: string, entryId: string, form: FormData) {
  if (form.get("confirmDelete") !== "on") return;
  getDb().$client.prepare("DELETE FROM vehicle_expenses WHERE id = ? AND car_id = ?").run(entryId, carId);
  revalidatePath(`/cars/${carId}/costs`);
  redirect(`/cars/${carId}/costs?status=expense-deleted#other-costs`);
}

