"use client";

import { useActionState, useState } from "react";
import { saveFuelEntry } from "@/actions/fuel";
import { findFuelStation } from "@/actions/fuel-station";
import type { FuelEntry } from "@/db/fuel";
import { fuelTypes, kmPerMile } from "@/lib/fuel";

const fieldClass = "w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent";

export function FuelEntryForm({ carId, entry, last, units, currency }: {
  carId: string;
  entry?: FuelEntry;
  last?: FuelEntry;
  units: "metric" | "imperial";
  currency: string;
}) {
  const distanceUnit = units === "imperial" ? "mi" : "km";
  const convert = (km: number) => Number((km / (units === "imperial" ? kmPerMile : 1)).toFixed(3));
  const [values, setValues] = useState({
    odometer: entry ? String(convert(entry.odometerKm)) : "",
    liters: String(entry?.liters ?? ""),
    price: String(entry?.pricePerLiter ?? ""),
    fuelType: entry?.fuelType ?? last?.fuelType ?? "Petrol",
    station: entry?.station ?? "",
    discount: String(entry?.discount || ""),
    notes: entry?.notes ?? "",
    fullTank: entry ? Boolean(entry.fullTank) : true,
    missedPrevious: Boolean(entry?.missedPrevious),
    removeReceipt: false,
  });
  const [message, action, pending] = useActionState(saveFuelEntry.bind(null, carId, entry?.id ?? null), "");
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const update = <Key extends keyof typeof values>(key: Key, value: (typeof values)[Key]) => setValues((current) => ({ ...current, [key]: value }));
  const total = Number(values.liters) * Number(values.price) * (1 - Number(values.discount) / 100);

  function locate() {
    if (!window.isSecureContext || !navigator.geolocation) {
      setLocationMessage("Location requires HTTPS or localhost. Enter the station manually.");
      return;
    }
    setLocating(true);
    setLocationMessage("Finding nearby stations...");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const result = await findFuelStation(coords.latitude, coords.longitude, coords.accuracy);
        if (result.station) update("station", result.station);
        setLocationMessage(result.station ? "Nearby station found. Check the name before saving." : result.error ?? "No station found.");
      } catch {
        setLocationMessage("Station lookup failed. Enter the station manually.");
      } finally {
        setLocating(false);
      }
    }, () => {
      setLocating(false);
      setLocationMessage("Location is unavailable or permission was denied. Enter the station manually.");
    }, { enableHighAccuracy: true, timeout: 9000, maximumAge: 0 });
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="odometerUnits" value={units} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <label className="grid gap-1.5 text-sm">Odometer ({distanceUnit})
          <input name="odometer" type="number" min="0" max="10000000" step="any" required inputMode="decimal" value={values.odometer} onChange={(event) => update("odometer", event.target.value)} placeholder={last ? String(convert(last.odometerKm)) : undefined} className={fieldClass} />
        </label>
        <label className="grid gap-1.5 text-sm">Fuel (L)
          <input name="liters" type="number" min="0.001" max="1000" step="any" required inputMode="decimal" value={values.liters} onChange={(event) => update("liters", event.target.value)} className={fieldClass} />
        </label>
        <label className="grid gap-1.5 text-sm">Price per liter ({currency})
          <input name="price" type="number" min="0" max="1000" step="any" required inputMode="decimal" value={values.price} onChange={(event) => update("price", event.target.value)} placeholder={last ? String(last.pricePerLiter) : undefined} className={fieldClass} />
        </label>
        <label className="grid gap-1.5 text-sm">Fuel type
          <select name="fuelType" value={values.fuelType} onChange={(event) => update("fuelType", event.target.value)} className={fieldClass}>
            {fuelTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">Discount (%)
          <input name="discount" type="number" min="0" max="100" step="any" inputMode="decimal" value={values.discount} onChange={(event) => update("discount", event.target.value)} placeholder="0" className={fieldClass} />
        </label>
        <label className="grid min-w-0 gap-1.5 text-sm">Receipt photo (optional)
          <input name="receipt" type="file" accept="image/jpeg,image/png,image/webp" className={`${fieldClass} file:mr-2 file:text-accent`} />
        </label>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="grid min-w-44 flex-1 gap-1.5 text-sm">Station
          <input name="station" maxLength={150} value={values.station} onChange={(event) => update("station", event.target.value)} className={fieldClass} />
        </label>
        <button type="button" title="Share your current location with OpenStreetMap Overpass" disabled={locating} onClick={locate} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface-2 disabled:opacity-50">{locating ? "Locating..." : "Find nearby station"}</button>
      </div>
      {locationMessage && <p role="status" className="text-xs text-muted">{locationMessage}</p>}
      <label className="grid gap-1.5 text-sm">Notes
        <textarea name="notes" rows={2} maxLength={2000} value={values.notes} onChange={(event) => update("notes", event.target.value)} className={fieldClass} />
      </label>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="fullTank" checked={values.fullTank} onChange={(event) => update("fullTank", event.target.checked)} className="size-4 accent-accent" /> Full tank</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="missedPrevious" checked={values.missedPrevious} onChange={(event) => update("missedPrevious", event.target.checked)} className="size-4 accent-accent" /> Missed previous fill-up</label>
        {Boolean(entry?.hasReceipt) && <label className="flex items-center gap-2"><input type="checkbox" name="removeReceipt" checked={values.removeReceipt} onChange={(event) => update("removeReceipt", event.target.checked)} className="size-4 accent-accent" /> Remove existing receipt</label>}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <span className="text-sm text-muted">Net total <strong className="ml-2 text-base text-foreground">{new Intl.NumberFormat("en", { style: "currency", currency }).format(Math.max(0, total))}</strong></span>
        <button type="submit" disabled={pending || locating} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background hover:bg-accent-strong disabled:opacity-50">{pending ? "Saving..." : entry ? "Save changes" : "Log fill-up"}</button>
      </div>
      {message && <p role="alert" className="text-sm text-danger">{message}</p>}
    </form>
  );
}

