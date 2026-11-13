// CAR DETAIL PAGE

// IMPORTS
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { archiveCar, deleteCar, restoreCar } from "@/actions/cars";
import { CarNav } from "@/components/CarNav";
import { PageHero } from "@/components/PageHero";
import { Badge, Button, Card } from "@/components/ui";
import { getCar, listPhotos, coverUrl } from "@/db/queries";


// MAIN FUNCTION
export default function CarOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<CarOverviewFallback />}>
      <CarOverviewContent params={params} />
    </Suspense>
  );
}


// CAR OVERVIEW CONTENT
// Loads and renders the selected vehicle after route params resolve.
async function CarOverviewContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCar(id);
  if (!car) notFound();
  const photos = await listPhotos(id);
  const cover = coverUrl(car, photos);
  const specs = car.specs ?? {};

  return (
    <div>
      {/* Cinematic hero with car-themed background */}
      <PageHero
        imageSrc={cover || "/images/bg-car-detail.jpg"}
        imageAlt={`${car.nickname} - ${car.year} ${car.make} ${car.model}`}
        title={car.nickname}
        subtitle={[car.year, car.make, car.model].filter(Boolean).join(" ")}
        kicker={
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-surface/80 px-4 py-1.5 backdrop-blur-md shadow-xl shadow-black/40">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-accent">
              Vehicle Profile
            </span>
          </span>
        }
      />

      <CarNav car={car} segment="overview" />


      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">


          {/* Cover photo card */}
          <Card className="overflow-hidden p-0 animate-slide-in-scale delay-100 hover-glow">
            <div className="aspect-[16/9] bg-surface-2 overflow-hidden">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt="" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted">No cover photo yet</div>
              )}
            </div>
          </Card>


          {/* Specs card */}
          <Card className="animate-slide-in-scale delay-200 hover-glow animate-shimmer">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              Specs
            </h2>
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <Spec label="Engine" value={specs.engine} />
              <Spec label="Displacement" value={specs.displacement} />
              <Spec label="Transmission" value={specs.transmission} />
              <Spec label="Drivetrain" value={specs.drivetrain} />
              <Spec label="Fuel" value={specs.fuel} />
              <Spec label="ECU" value={specs.ecu} />
              <Spec label="VIN" value={car.vin} />
              <Spec label="Color" value={car.color} />
            </dl>
            {car.notes ? <p className="mt-4 whitespace-pre-wrap text-sm text-muted">{car.notes}</p> : null}
          </Card>


          {/* Custom parts card */}
          <Card className="animate-slide-in-scale delay-300 hover-glow">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
              </svg>
              Custom Parts
            </h2>
            {car.customParts.length === 0 ? (
              <p className="text-sm text-muted">Nothing logged yet.</p>
            ) : (
              <ul className="space-y-2">
                {car.customParts.map((part, i) => (
                  <li
                    key={part.id}
                    className="rounded-lg border border-border bg-surface-2/60 px-3 py-2 transition-all duration-200 hover:border-accent/30 hover:bg-surface-2 animate-slide-in-scale"
                    style={{ animationDelay: `${400 + i * 60}ms` }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{part.name || "Untitled part"}</span>
                      {part.category ? <Badge>{part.category}</Badge> : null}
                    </div>
                    {part.notes ? <p className="text-sm text-muted">{part.notes}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>


        {/* Sidebar actions */}
        <div className="space-y-3 animate-fade-in-up delay-300">
          <Link href={`/cars/${car.id}/edit`}>
            <Button className="w-full group">
              <span className="transition-transform duration-200 group-hover:scale-105">Edit profile</span>
            </Button>
          </Link>
          {car.archivedAt ? (
            <form action={restoreCar.bind(null, car.id)}>
              <Button type="submit" variant="outline" className="w-full">
                Restore
              </Button>
            </form>
          ) : (
            <form action={archiveCar.bind(null, car.id)}>
              <Button type="submit" variant="outline" className="w-full">
                Archive
              </Button>
            </form>
          )}
          <form
            action={deleteCar.bind(null, car.id)}
          >
            <Button type="submit" variant="danger" className="w-full">
              Delete car
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}


// CAR OVERVIEW FALLBACK
// Displays a loading state while the vehicle profile is being fetched.
function CarOverviewFallback() {
  return (
    <div>
      <PageHero
        imageSrc="/images/bg-car-detail.jpg"
        imageAlt="Vehicle profile"
        title="Vehicle Profile"
        subtitle="Loading vehicle details..."
      />
      <Card className="py-16 text-center">
        <p className="text-sm text-muted" role="status">Loading vehicle...</p>
      </Card>
    </div>
  );
}

// SPEC COMPONENT
function Spec({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg bg-surface-2/40 px-3 py-2 transition hover:bg-surface-2/70">
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="font-medium">{value || "—"}</dd>
    </div>
  );
}
