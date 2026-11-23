import { getDb } from "@/db";
import type { FuelReading } from "@/lib/fuel";

export type FuelEntry = FuelReading & { station: string; notes: string; hasReceipt: number };

export function listFuelEntries(carId: string) {
  return getDb().$client.prepare(`
    SELECT id, logged_at AS loggedAt, odometer_km AS odometerKm, liters, fuel_type AS fuelType,
      price_per_liter AS pricePerLiter, discount, full_tank AS fullTank, missed_previous AS missedPrevious,
      station, notes, receipt_mime IS NOT NULL AS hasReceipt
    FROM fuel_entries WHERE car_id = ? ORDER BY logged_at DESC, odometer_km DESC, id DESC
  `).all(carId) as FuelEntry[];
}

export function fuelCurrency() {
  const currency = process.env.FUEL_CURRENCY?.trim().toUpperCase();
  return currency && /^[A-Z]{3}$/.test(currency) ? currency : "EUR";
}

export function listVehicleExpenses(carId: string) {
  return getDb().$client.prepare(`SELECT id, logged_at AS loggedAt, category, title, amount_cents AS amountCents
    FROM vehicle_expenses WHERE car_id = ? ORDER BY logged_at DESC, id DESC`).all(carId) as {
    id: string; loggedAt: number; category: string; title: string; amountCents: number;
  }[];
}

