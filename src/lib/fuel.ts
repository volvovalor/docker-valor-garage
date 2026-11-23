export const fuelTypes = ["Petrol", "Diesel", "LPG", "E85", "Other"] as const;
export const expenseCategories = ["Maintenance", "Insurance", "Tax", "Parking", "Tolls", "Other"] as const;
export const kmPerMile = 1.609344;
export const litersPerUsGallon = 3.785411784;

export type FuelReading = {
  id: string;
  loggedAt: number;
  odometerKm: number;
  liters: number;
  fuelType: string;
  pricePerLiter: number;
  discount: number;
  fullTank: number;
  missedPrevious: number;
};

export function fuelCost(reading: FuelReading) {
  return Math.round((reading.liters * reading.pricePerLiter * (1 - reading.discount / 100) + Number.EPSILON) * 100) / 100;
}

type Month = {
  key: string;
  spending: number;
  liters: number;
  distance: number;
  fills: number;
  measuredLiters: number;
  measuredKm: number;
};

export function fuelAnalytics(readings: FuelReading[], from: number, through: number) {
  const months = new Map<string, Month>();
  const first = new Date(from);
  const cursor = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1));
  while (cursor.getTime() <= through) {
    const key = cursor.toISOString().slice(0, 7);
    months.set(key, { key, spending: 0, liters: 0, distance: 0, fills: 0, measuredLiters: 0, measuredKm: 0 });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  let previous: FuelReading | undefined;
  let fullAnchor: FuelReading | undefined;
  let intervalLiters = 0;
  const intervals = new Map<string, number>();
  const sorted = [...readings].sort((first, second) => first.loggedAt - second.loggedAt || first.odometerKm - second.odometerKm || first.id.localeCompare(second.id));
  for (const reading of sorted) {
    if (reading.loggedAt > through) break;
    const month = reading.loggedAt >= from ? months.get(new Date(reading.loggedAt).toISOString().slice(0, 7)) : undefined;
    if (month) {
      month.spending += fuelCost(reading);
      month.liters += reading.liters;
      month.fills++;
    }
    if (previous && reading.odometerKm > previous.odometerKm) {
      const duration = reading.loggedAt - previous.loggedAt;
      const distance = reading.odometerKm - previous.odometerKm;
      if (month && duration === 0) month.distance += distance;
      if (duration > 0) {
        const start = new Date(Math.max(from, previous.loggedAt));
        while (start.getTime() < reading.loggedAt) {
          const next = Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1);
          const bucket = months.get(start.toISOString().slice(0, 7));
          if (bucket) bucket.distance += distance * (Math.min(next, reading.loggedAt) - start.getTime()) / duration;
          start.setTime(next);
        }
      }
    }

    if (reading.missedPrevious || (previous && (reading.odometerKm < previous.odometerKm || reading.fuelType !== previous.fuelType))) {
      fullAnchor = undefined;
      intervalLiters = 0;
    }
    if (fullAnchor) intervalLiters += reading.liters;
    if (reading.fullTank && (!fullAnchor || reading.odometerKm > fullAnchor.odometerKm)) {
      if (fullAnchor) {
        const km = reading.odometerKm - fullAnchor.odometerKm;
        if (month) {
          month.measuredKm += km;
          month.measuredLiters += intervalLiters;
          intervals.set(reading.id, intervalLiters * 100 / km);
        }
      }
      fullAnchor = reading;
      intervalLiters = 0;
    }
    previous = reading;
  }

  const totals = [...months.values()].reduce((total, month) => ({
    spending: total.spending + month.spending,
    liters: total.liters + month.liters,
    distance: total.distance + month.distance,
    fills: total.fills + month.fills,
    measuredKm: total.measuredKm + month.measuredKm,
    measuredLiters: total.measuredLiters + month.measuredLiters,
  }), { spending: 0, liters: 0, distance: 0, fills: 0, measuredKm: 0, measuredLiters: 0 });
  return { months: [...months.values()], totals, intervals, average: totals.measuredKm ? totals.measuredLiters * 100 / totals.measuredKm : null };
}

