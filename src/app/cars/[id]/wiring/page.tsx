// Wiring Page
// Displays a list of wiring diagrams for a specific car, allowing users to create new diagrams and view existing ones.

// IMPORTS
import Link from "next/link";
import { notFound } from "next/navigation";
import { createDiagram } from "@/actions/diagrams";
import { CarNav } from "@/components/CarNav";
import { PageHero } from "@/components/PageHero";
import { Button, Card, Field, Input, Textarea } from "@/components/ui";
import { getCar, listDiagrams } from "@/db/queries";


// MAIN FUNCTION
export default async function WiringIndexPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCar(id);
  if (!car) notFound();
  const diagrams = await listDiagrams(id);

  return (
    <div>
      {/* Cinematic header with blueprint/wiring background */}
      <PageHero
        imageSrc="/images/bg-wiring.jpg"
        imageAlt="Automotive wiring harness blueprint"
        title="Wiring Studio"
        subtitle="Keep harnesses split — ECU, engine bay, dash — and jump between them instead of one giant drawing."
        kicker={
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-surface/80 px-4 py-1.5 backdrop-blur-md shadow-xl shadow-black/40">
            <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-accent">
              {car.nickname} · {diagrams.length} Diagram{diagrams.length !== 1 ? "s" : ""}
            </span>
          </span>
        }
      />

      <CarNav car={car} segment="wiring" />

      {/* New diagram form */}
      <Card className="mb-6 animate-slide-in-scale delay-200 hover-glow animate-shimmer">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Diagram
        </h2>
        <form action={createDiagram} className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input type="hidden" name="carId" value={car.id} />
          <Field label="Title">
            <Input name="title" required placeholder="ECU pinout / engine bay power" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <Textarea name="description" rows={2} />
            </Field>
          </div>
          <div>
            <Button type="submit">Create diagram</Button>
          </div>
        </form>
      </Card>

      {/* Diagram grid */}
      {diagrams.length === 0 ? (
        <div className="animate-fade-in-up delay-300 rounded-xl border border-dashed border-border/60 bg-surface/40 p-12 text-center backdrop-blur-md">
          <svg className="mx-auto h-10 w-10 text-muted/40 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
          <p className="text-sm text-muted">No diagrams yet. Create your first wiring diagram above.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {diagrams.map((diagram, i) => (
            <Link key={diagram.id} href={`/cars/${id}/wiring/${diagram.id}`}>
              <Card
                className="transition-all duration-300 hover:border-accent hover:shadow-lg hover:shadow-accent/5 hover:scale-[1.02] hover-glow animate-slide-in-scale"
                style={{ animationDelay: `${300 + i * 80}ms` }}
              >
                <h3 className="font-medium flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent/60" />
                  {diagram.title}
                </h3>
                {diagram.description ? <p className="mt-1 text-sm text-muted">{diagram.description}</p> : null}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
