// CAR FORM
// This component renders a form for adding or editing car profiles. 

"use client";

// IMPORTS
import { useMemo, useState } from "react";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { newId } from "@/lib/ids";
import type { CarSpecs, CustomPart } from "@/lib/types";
import type { Car } from "@/db/schema";


// MAIN FUNCTION
export function CarForm({
  car,
  action,
}: {
  car?: Car;
  action: (form: FormData) => Promise<void>;
}) {
  const [parts, setParts] = useState<CustomPart[]>(car?.customParts ?? []);
  const specs = (car?.specs ?? {}) as CarSpecs;
  const encoded = useMemo(() => JSON.stringify(parts), [parts]);


  // Add Part
  // This function adds a new empty custom part to the parts state array.
  // It generates a unique ID for the new part using the newId() utility function and appends it to the current list of parts.
  function addPart() {
    setParts((current) => [...current, { id: newId(), name: "", category: "", notes: "" }]);
  }


  // RENDER FORM
  return (
    <form action={action} className="space-y-8">
      {car ? <input type="hidden" name="id" value={car.id} /> : null}
      <input type="hidden" name="customParts" value={encoded} />

      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Nickname">
          <Input name="nickname" required defaultValue={car?.nickname ?? ""} placeholder="The wagon" />
        </Field>
        <Field label="Year">
          <Input name="year" type="number" defaultValue={car?.year ?? ""} placeholder="1994" />
        </Field>
        <Field label="Make">
          <Input name="make" required defaultValue={car?.make ?? ""} placeholder="BMW" />
        </Field>
        <Field label="Model">
          <Input name="model" required defaultValue={car?.model ?? ""} placeholder="E36 325i" />
        </Field>
        <Field label="Color">
          <Input name="color" defaultValue={car?.color ?? ""} placeholder="Hellrot" />
        </Field>
        <Field label="VIN">
          <Input name="vin" defaultValue={car?.vin ?? ""} />
        </Field>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Specs</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Engine">
            <Input name="engine" defaultValue={specs.engine ?? ""} placeholder="M50B25" />
          </Field>
          <Field label="Displacement">
            <Input name="displacement" defaultValue={specs.displacement ?? ""} placeholder="2.5L" />
          </Field>
          <Field label="Transmission">
            <Input name="transmission" defaultValue={specs.transmission ?? ""} placeholder="ZF 5-speed" />
          </Field>
          <Field label="Drivetrain">
            <Input name="drivetrain" defaultValue={specs.drivetrain ?? ""} placeholder="RWD" />
          </Field>
          <Field label="Fuel system">
            <Input name="fuel" defaultValue={specs.fuel ?? ""} placeholder="Return-style, 340lph" />
          </Field>
          <Field label="ECU">
            <Input name="ecu" defaultValue={specs.ecu ?? ""} placeholder="Haltech Elite 1500" />
          </Field>
        </div>
      </section>

      <Field label="Notes">
        <Textarea name="notes" rows={4} defaultValue={car?.notes ?? ""} />
      </Field>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Custom parts</h2>
          <Button type="button" variant="outline" onClick={addPart}>
            Add part
          </Button>
        </div>
        <div className="space-y-3">
          {parts.length === 0 ? (
            <p className="text-sm text-muted">No custom parts yet — intakes, cages, pumps, whatever lives here.</p>
          ) : (
            parts.map((part, index) => (
              <div key={part.id} className="grid gap-2 rounded-lg border border-border bg-surface-2 p-3 sm:grid-cols-7">
                <Input
                  className="sm:col-span-2"
                  placeholder="Name"
                  value={part.name}
                  onChange={(e) =>
                    setParts((current) =>
                      current.map((p, i) => (i === index ? { ...p, name: e.target.value } : p)),
                    )
                  }
                />
                <Input
                  placeholder="Category"
                  value={part.category}
                  onChange={(e) =>
                    setParts((current) =>
                      current.map((p, i) => (i === index ? { ...p, category: e.target.value } : p)),
                    )
                  }
                />
                <Input
                  className="sm:col-span-3"
                  placeholder="Notes"
                  value={part.notes}
                  onChange={(e) =>
                    setParts((current) =>
                      current.map((p, i) => (i === index ? { ...p, notes: e.target.value } : p)),
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setParts((current) => current.filter((_, i) => i !== index))}
                >
                  Remove
                </Button>
              </div>
            ))
          )}
        </div>
      </section>

      <Button type="submit">{car ? "Save profile" : "Add to fleet"}</Button>
    </form>
  );
}
