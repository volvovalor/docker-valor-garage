// Wiring Detail Page
// Displays the details of a specific wiring diagram, including its flow and background image.

// IMPORTS
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  clearDiagramBackground,
  deleteDiagram,
  updateDiagramMeta,
  uploadDiagramBackground,
} from "@/actions/diagrams";
import { CarNav } from "@/components/CarNav";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { WiringEditor } from "@/components/wiring/WiringEditor";
import { getCar, getDiagram, listDiagrams, photoUrl } from "@/db/queries";
import { EMPTY_FLOW } from "@/lib/types";


// MAIN FUNCTION
export default async function DiagramPage({
  params,
}: {
  params: Promise<{ id: string; diagramId: string }>;
}) {
  const { id, diagramId } = await params;
  const car = await getCar(id);
  const diagram = await getDiagram(diagramId);
  if (!car || !diagram || diagram.carId !== id) notFound();
  const diagrams = await listDiagrams(id);
  const backgroundUrl = diagram.backgroundFilename
    ? photoUrl(car.id, diagram.backgroundFilename)
    : null;

  return (
    <div>
      <CarNav car={car} segment="wiring" />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href={`/cars/${id}/wiring`} className="text-sm text-muted hover:text-accent">
            All diagrams
          </Link>
          <h2 className="text-xl font-semibold">{diagram.title}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {diagrams.map((d) => (
            <Link
              key={d.id}
              href={`/cars/${id}/wiring/${d.id}`}
              className={
                d.id === diagram.id
                  ? "rounded-full bg-accent/15 px-3 py-1 text-sm text-accent-strong"
                  : "rounded-full bg-surface-2 px-3 py-1 text-sm text-muted hover:text-foreground"
              }
            >
              {d.title}
            </Link>
          ))}
        </div>
      </div>
      <details className="mb-4 rounded-xl border border-border bg-surface p-4">
        <summary className="cursor-pointer text-sm font-medium">Diagram settings</summary>
        <form action={updateDiagramMeta} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="id" value={diagram.id} />
          <input type="hidden" name="carId" value={car.id} />
          <Field label="Title">
            <Input name="title" defaultValue={diagram.title} required />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <Textarea name="description" rows={2} defaultValue={diagram.description ?? ""} />
            </Field>
          </div>
          <Button type="submit">Save details</Button>
        </form>
        <form action={uploadDiagramBackground} className="mt-4 flex flex-wrap items-end gap-3">
          <input type="hidden" name="diagramId" value={diagram.id} />
          <input type="hidden" name="carId" value={car.id} />
          <label className="text-xs font-medium uppercase tracking-wide text-muted">
            Background photo
            <input name="file" type="file" accept="image/*" className="mt-1 block text-sm" />
          </label>
          <Button type="submit" variant="outline">
            Upload background
          </Button>
        </form>
        {diagram.backgroundFilename ? (
          <form action={clearDiagramBackground.bind(null, diagram.id, car.id)} className="mt-2">
            <Button type="submit" variant="ghost">
              Clear background
            </Button>
          </form>
        ) : null}
        <form action={deleteDiagram.bind(null, car.id, diagram.id)} className="mt-4">
          <Button type="submit" variant="danger">
            Delete diagram
          </Button>
        </form>
      </details>
      <WiringEditor
        carId={car.id}
        diagramId={diagram.id}
        initial={diagram.flowJson ?? EMPTY_FLOW}
        backgroundUrl={backgroundUrl}
        diagrams={diagrams.map((d) => ({ id: d.id, title: d.title }))}
      />
    </div>
  );
}
