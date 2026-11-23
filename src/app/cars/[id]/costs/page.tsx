import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteFuelEntry, deleteVehicleExpense } from "@/actions/fuel";
import { CarNav } from "@/components/CarNav";
import { FuelChart } from "@/components/FuelChart";
import { FuelEntryForm } from "@/components/FuelEntryForm";
import { VehicleExpenseForm } from "@/components/VehicleExpenseForm";
import { fuelCurrency, listFuelEntries, listVehicleExpenses } from "@/db/fuel";
import { getCar } from "@/db/queries";
import { fuelAnalytics, fuelCost, kmPerMile, litersPerUsGallon } from "@/lib/fuel";
import { garageSettings } from "@/lib/garage-settings";

type CostsProps = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const periods = [6, 12, 24];
const pageSize = 15;
const control = "inline-flex items-center rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-foreground";
const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

export default function CostsPage(props: CostsProps) {
  return <Suspense fallback={<p role="status" className="py-8 text-sm text-muted">Loading vehicle costs...</p>}><CostsContent {...props} /></Suspense>;
}

async function CostsContent({ params, searchParams }: CostsProps) {
  const [{ id }, query, { units }] = await Promise.all([params, searchParams, garageSettings()]);
  const car = await getCar(id);
  if (!car) notFound();
  const readings = listFuelEntries(id);
  const expenses = listVehicleExpenses(id);
  const currency = fuelCurrency();
  const base = `/cars/${id}/costs`;
  const period = periods.find((value) => String(value) === query.months) ?? 12;
  const requestedPage = typeof query.page === "string" && /^\d+$/.test(query.page) ? Number(query.page) : 1;
  const lastPage = Math.max(1, Math.ceil(readings.length / pageSize));
  const page = Math.max(1, Math.min(lastPage, requestedPage));
  const visible = readings.slice((page - 1) * pageSize, page * pageSize);
  const now = new Date();
  const from = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - period + 1, 1);
  const { months, totals, average } = fuelAnalytics(readings, from, now.getTime());
  const historyAnalytics = fuelAnalytics(readings, readings.at(-1)?.loggedAt ?? from, now.getTime());
  const imperial = units === "imperial";
  const numeric = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
  const price = new Intl.NumberFormat("en", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 4 });
  const money = new Intl.NumberFormat("en", { style: "currency", currency });
  const cost = (value: number) => money.format(value);
  const distance = (km: number) => `${numeric.format(km / (imperial ? kmPerMile : 1))} ${imperial ? "mi" : "km"}`;
  const volume = (liters: number) => `${numeric.format(liters)} L`;
  const efficiency = (value: number) => imperial ? `${numeric.format(100 * litersPerUsGallon / (kmPerMile * value))} mpg (US)` : `${numeric.format(value)} L/100 km`;
  const perLiter = (value: number) => `${price.format(value)}/L`;
  const monthKeys = months.map((month) => month.key);
  const otherByMonth = new Map<string, number>();
  for (const expense of expenses) {
    const key = new Date(expense.loggedAt).toISOString().slice(0, 7);
    otherByMonth.set(key, (otherByMonth.get(key) ?? 0) + expense.amountCents);
  }
  const otherSpending = monthKeys.reduce((total, key) => total + (otherByMonth.get(key) ?? 0), 0) / 100;
  const expenseLimit = query.expenses === "all" ? expenses.length : 10;
  const historyUrl = `${base}?months=${period}&page=${page}`;
  const message = query.status === "saved" ? "Fill-up logged." : query.status === "updated" ? "Fill-up updated." : query.status === "deleted" ? "Fill-up deleted." : null;

  return (
    <div className="space-y-8">
      <CarNav car={car} segment="costs" />
      <section aria-labelledby="costs-heading" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="text-xs font-mono uppercase text-accent">Vehicle costs</p>
            <h2 id="costs-heading" className="mt-1 text-2xl font-semibold">Running costs</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="#other-costs" className={control}>Other expenses</a>
            <a href="#new-fill" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background hover:bg-accent-strong">Log a fill-up</a>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2" aria-label="Dashboard time range">
          {periods.map((value) => <Link key={value} href={`${base}?months=${value}`} aria-current={value === period ? "true" : undefined} className={`${control} ${value === period ? "border-accent text-accent" : ""}`}>{value} months</Link>)}
        </nav>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-border py-4 sm:grid-cols-4">
          <Metric label="Total spending" value={cost(totals.spending + otherSpending)} />
          <Metric label="Fuel spending" value={cost(totals.spending)} />
          <Metric label="Estimated distance" value={distance(totals.distance)} />
          <Metric label="Average consumption" value={average === null ? "Not measured yet" : efficiency(average)} />
        </dl>
        {expenses.length > 0 && <FuelChart title="Monthly total spending" months={monthKeys} values={months.map((month) => month.spending + (otherByMonth.get(month.key) ?? 0) / 100)} format={cost} />}
        {readings.length === 0 ? <p className="border-b border-border pb-5 text-sm text-muted">No fuel entries yet. Log your first fill-up to start tracking costs.</p> : <>
          <div className="grid gap-x-7 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
            <FuelChart title="Monthly fuel spending" months={monthKeys} values={months.map((month) => month.spending)} format={cost} />
            <FuelChart title="Monthly distance (estimated)" months={monthKeys} values={months.map((month) => month.distance)} format={distance} tone="sky" />
            <FuelChart title="Monthly fuel volume" months={monthKeys} values={months.map((month) => month.liters)} format={volume} tone="teal" />
            <FuelChart title="Average net price per liter" months={monthKeys} values={months.map((month) => month.liters ? month.spending / month.liters : null)} format={perLiter} />
            <FuelChart title="Measured consumption" months={monthKeys} values={months.map((month) => month.measuredKm ? month.measuredLiters * 100 / month.measuredKm : null)} format={efficiency} tone="teal" />
            <FuelChart title="Monthly fill-ups" months={monthKeys} values={months.map((month) => month.fills)} format={(value) => String(value)} tone="sky" />
          </div>
          <p className="text-xs leading-relaxed text-muted">Months use UTC. Distance is estimated between readings. Consumption uses full-to-full intervals of the same fuel type, includes partial fills, and skips gaps marked as missed. An interval counts in the month it ends.</p>
        </>}
      </section>

      <section id="new-fill" aria-labelledby="new-fill-heading" className="scroll-mt-4 border-y border-border py-5">
        <h2 id="new-fill-heading" className="mb-4 text-lg font-semibold">New fill-up</h2>
        <FuelEntryForm key={`${readings[0]?.id ?? "new"}-${units}`} carId={id} last={readings[0]} units={units} currency={currency} />
      </section>

      <section id="fuel-log" aria-labelledby="fuel-log-heading" className="space-y-3 scroll-mt-4">
        <h2 id="fuel-log-heading" className="text-lg font-semibold">Fill-up history <span className="font-normal text-muted">({readings.length})</span></h2>
        {message && <p role="status" className="text-sm text-accent">{message}</p>}
        {visible.length === 0 && <p className="text-sm text-muted">No fill-ups logged.</p>}
        <ul className="divide-y divide-border border-y border-border empty:hidden">
          {visible.map((entry) => {
            const measured = historyAnalytics.intervals.get(entry.id);
            const editing = query.edit === entry.id;
            return (
              <li key={entry.id} className="min-w-0 space-y-3 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold wrap-anywhere">{entry.station || entry.fuelType}</p>
                    <time className="text-xs text-muted" dateTime={new Date(entry.loggedAt).toISOString()}>{dateFormat.format(entry.loggedAt)} UTC</time>
                  </div>
                  <div className="text-right"><p className="font-semibold tabular-nums">{cost(fuelCost(entry))}</p><p className="text-xs text-muted">{perLiter(entry.pricePerLiter)}{entry.discount ? ` · ${entry.discount}% off` : ""}</p></div>
                </div>
                <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted"><span>{distance(entry.odometerKm)}</span><span>{volume(entry.liters)} {entry.fuelType}</span><span>{entry.fullTank ? "Full tank" : "Partial fill"}</span>{Boolean(entry.missedPrevious) && <span>Missed previous fill</span>}{measured !== undefined && <span className="text-accent">{efficiency(measured)}</span>}</p>
                {entry.notes && <p className="whitespace-pre-wrap wrap-anywhere text-sm">{entry.notes}</p>}
                <div className="flex flex-wrap gap-2">
                  {Boolean(entry.hasReceipt) && <a className={control} href={`/api/fuel-receipts/${id}/${entry.id}`} target="_blank" rel="noreferrer">View receipt</a>}
                  <Link className={control} href={editing ? `${historyUrl}#fuel-log` : `${historyUrl}&edit=${entry.id}#edit-fill`}>{editing ? "Cancel edit" : "Edit fill-up"}</Link>
                </div>
                {editing && <div id="edit-fill" className="space-y-3 border-t border-border pt-3 scroll-mt-4">
                  <FuelEntryForm key={`${entry.id}-${units}`} carId={id} entry={entry} units={units} currency={currency} />
                  <form action={deleteFuelEntry.bind(null, id, entry.id)} className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="confirmDelete" required className="accent-accent" /> Confirm deletion</label>
                    <button className={`${control} text-danger`}>Delete fill-up</button>
                  </form>
                </div>}
              </li>
            );
          })}
        </ul>
        {lastPage > 1 && <nav aria-label="Fill-up history pages" className="flex flex-wrap items-center gap-2">
          {page > 1 && <Link className={control} href={`${base}?months=${period}&page=${page - 1}#fuel-log`}>Newer</Link>}
          <span className="text-sm text-muted">Page {page} of {lastPage}</span>
          {page < lastPage && <Link className={control} href={`${base}?months=${period}&page=${page + 1}#fuel-log`}>Older</Link>}
        </nav>}
      </section>
      <section id="other-costs" aria-labelledby="other-costs-heading" className="space-y-4 scroll-mt-4 border-t border-border pt-5">
        <h2 id="other-costs-heading" className="text-lg font-semibold">Other expenses</h2>
        {query.status === "expense-saved" && <p role="status" className="text-sm text-accent">Expense logged.</p>}
        {query.status === "expense-deleted" && <p role="status" className="text-sm text-accent">Expense deleted.</p>}
        <VehicleExpenseForm key={expenses[0]?.id ?? "new"} carId={id} currency={currency} />
        {expenses.length === 0 && <p className="text-sm text-muted">No other expenses logged.</p>}
        <ul className="divide-y divide-border border-y border-border empty:hidden">
          {expenses.slice(0, expenseLimit).map((expense) => <li key={expense.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
            <div className="min-w-0"><p className="font-medium wrap-anywhere">{expense.title}</p><p className="text-xs text-muted">{expense.category} · {dateFormat.format(expense.loggedAt)} UTC</p></div>
            <div className="text-right"><p className="font-semibold tabular-nums">{cost(expense.amountCents / 100)}</p>
              <details className="text-xs text-muted"><summary className="cursor-pointer">Remove expense</summary>
                <form action={deleteVehicleExpense.bind(null, id, expense.id)} className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1"><input type="checkbox" name="confirmDelete" required /> Confirm</label><button className={`${control} text-danger`}>Delete</button>
                </form>
              </details>
            </div>
          </li>)}
        </ul>
        {expenses.length > 10 && <Link className={control} href={`${historyUrl}${query.expenses === "all" ? "" : "&expenses=all"}#other-costs`}>{query.expenses === "all" ? "Show recent expenses" : "Show all expenses"}</Link>}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs text-muted">{label}</dt><dd className="mt-1 text-lg font-semibold tabular-nums sm:text-xl">{value}</dd></div>;
}

