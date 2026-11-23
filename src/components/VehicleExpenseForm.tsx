"use client";

import { useActionState, useState } from "react";
import { saveVehicleExpense } from "@/actions/fuel";
import { expenseCategories } from "@/lib/fuel";

const fieldClass = "w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm";

export function VehicleExpenseForm({ carId, currency }: { carId: string; currency: string }) {
  const [message, action, pending] = useActionState(saveVehicleExpense.bind(null, carId), "");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(expenseCategories[0]);
  const [amount, setAmount] = useState("");
  return <form action={action} className="space-y-3">
    <div className="grid gap-3 sm:grid-cols-3">
      <label className="grid gap-1 text-sm">Description<input name="title" maxLength={150} required className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Monthly insurance" /></label>
      <label className="grid gap-1 text-sm">Category<select name="category" value={category} onChange={(event) => setCategory(event.target.value)} className={fieldClass}>{expenseCategories.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className="grid gap-1 text-sm">Amount ({currency})<input name="amount" type="number" min="0.01" max="1000000" step="0.01" inputMode="decimal" required className={fieldClass} value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
    </div>
    {message && <p role="alert" className="text-sm text-danger">{message}</p>}
    <button type="submit" disabled={pending} className="rounded-lg border border-accent px-4 py-2 text-sm font-medium text-accent hover:bg-surface-2 disabled:opacity-50">{pending ? "Saving..." : "Log expense"}</button>
  </form>;
}

