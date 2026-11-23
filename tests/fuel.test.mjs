

import assert from "node:assert/strict";
import { test } from "node:test";
import { fuelAnalytics, fuelCost } from "../src/lib/fuel.ts";

const at = (day) => Date.parse(`${day}T00:00:00Z`);
const reading = (id, day, odometerKm, liters, extra = {}) => ({
  id, loggedAt: at(day), odometerKm, liters, fuelType: "Petrol", pricePerLiter: 2, discount: 0, fullTank: 1, missedPrevious: 0, ...extra,
});

test("discounted cost rounds per fill-up", () => {
  assert.equal(fuelCost(reading("first", "2026-01-03", 1000, 40.12, { pricePerLiter: 1.779, discount: 10 })), 64.24);
});

test("weighted consumption includes partial fills and breaks at missed fills or odometer resets", () => {
  const rows = [
    reading("first", "2026-01-30", 1000, 40),
    reading("partial", "2026-02-01", 1200, 10, { fullTank: 0 }),
    reading("second", "2026-02-03", 1400, 20),
    reading("missed", "2026-02-07", 1800, 40, { missedPrevious: 1 }),
    reading("third", "2026-02-09", 2000, 20),
    reading("reset", "2026-02-14", 100, 34),
  ];
  const result = fuelAnalytics(rows, at("2026-01-01"), at("2026-03-01") - 1);
  assert.deepEqual([...result.intervals], [["second", 7.5], ["third", 10]]);
  assert.equal(result.average, 50 * 100 / 600);
  assert.equal(result.totals.distance, 1000);
});

test("distance is apportioned across months and clipped to the selected period", () => {
  const rows = [reading("first", "2026-01-30", 1000, 40), reading("second", "2026-02-03", 1400, 30)];
  const both = fuelAnalytics(rows, at("2026-01-01"), at("2026-03-01") - 1);
  assert.deepEqual(both.months.map((month) => month.distance), [200, 200]);
  const february = fuelAnalytics(rows, at("2026-02-01"), at("2026-03-01") - 1);
  assert.equal(february.totals.distance, 200);
  assert.equal(february.totals.fills, 1);
  assert.equal(february.average, 7.5);
});

test("the first full tank establishes a baseline without inventing distance or consumption", () => {
  const result = fuelAnalytics([reading("first", "2026-01-05", 1000, 30)], at("2026-01-01"), at("2026-02-01") - 1);
  assert.equal(result.average, null);
  assert.equal(result.totals.distance, 0);
  assert.equal(result.totals.spending, 60);
});

test("switching fuel types starts a new consumption baseline without losing distance", () => {
  const rows = [reading("petrol", "2026-01-03", 1000, 40), reading("lpg", "2026-01-07", 1300, 35, { fuelType: "LPG" })];
  const result = fuelAnalytics(rows, at("2026-01-01"), at("2026-02-01") - 1);
  assert.equal(result.totals.distance, 300);
  assert.equal(result.average, null);
});

