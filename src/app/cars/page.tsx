// FLEET PAGE
// Lists all cars in the fleet, with links to their profiles.

// IMPORTS
import Link from "next/link";
import { Suspense } from "react";
import { listCars, listPhotos, coverUrl } from "@/db/queries";
import { Badge, Button, Card } from "@/components/ui";
import { PageHero } from "@/components/PageHero";


// MAIN FUNCTION
export default function FleetPage({ searchParams }: {
  searchParams: Promise<{ archived?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<FleetFallback />}>
      <FleetContent searchParams={searchParams} />
    </Suspense>
  );
}


// FLEET CONTENT
// Fetches the fleet data and renders the page content.
async function FleetContent({
  searchParams,
}: {
  searchParams: Promise<{ archived?: string | string[] }>;
}) {
  const sp = await searchParams;
  const archived = Array.isArray(sp.archived) ? sp.archived[0] : sp.archived;
  const showArchived = archived === "1";
  const cars = await listCars(showArchived);
  const withCovers = await Promise.all(
    cars.map(async (car) => {
      const photos = await listPhotos(car.id);
      return { car, cover: coverUrl(car, photos) };
    }),
  );

  
  return (
    <div>

      {/* Cinematic page header with fleet-themed background */}
      <PageHero
        imageSrc="/images/bg-fleet.jpg"
        imageAlt="Classic car fleet lineup"
        title="Fleet Bay"
        subtitle="Profiles, jobs, and wiring for the cars you actually wrench on."
        kicker={
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-surface/80 px-4 py-1.5 backdrop-blur-md shadow-xl shadow-black/40">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-accent">
              {cars.length} Vehicle{cars.length !== 1 ? "s" : ""} Registered
            </span>
          </span>
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={showArchived ? "/cars" : "/cars?archived=1"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-surface/60 px-3.5 py-2 text-xs font-medium text-muted backdrop-blur-md transition hover:border-accent hover:text-accent"
          >
            {showArchived ? "Hide archived" : "Show archived"}
          </Link>
          <Link href="/cars/new">
            <Button>+ Add car</Button>
          </Link>
        </div>
      </PageHero>


      {/* CAR GRID */}
      {withCovers.length === 0 ? (
        <Card className="py-16 text-center animate-fade-in-up delay-300">
          <p className="text-lg font-medium">Empty bay</p>
          <p className="mt-1 text-sm text-muted">Add the first car and start documenting the fleet.</p>
          <Link href="/cars/new" className="mt-4 inline-block">
            <Button>Add car</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withCovers.map(({ car, cover }, i) => (
            <Link key={car.id} href={`/cars/${car.id}`}>
              <Card
                className="overflow-hidden p-0 transition-all duration-300 hover:border-accent hover:shadow-lg hover:shadow-accent/5 hover:scale-[1.02] hover-glow animate-slide-in-scale"
                style={{ animationDelay: `${150 + i * 80}ms` }}
              >
                <div className="aspect-[16/10] bg-surface-2 overflow-hidden">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="h-full w-full object-cover transition-transform duration-700 hover:scale-110" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-muted">
                      No photo
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold">{car.nickname}</h2>
                    {car.archivedAt ? <Badge>Archived</Badge> : null}
                  </div>
                  <p className="text-sm text-muted">
                    {[car.year, car.make, car.model].filter(Boolean).join(" ")}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}


// FLEET FALLBACK
// Displays a loading state while the fleet data is being fetched.
function FleetFallback() {
  return (
    <div>
      <PageHero
        imageSrc="/images/bg-fleet.jpg"
        imageAlt="Classic car fleet lineup"
        title="Fleet Bay"
        subtitle="Profiles, jobs, and wiring for the cars you actually wrench on."
      />
      <Card className="py-16 text-center">
        <p className="text-sm text-muted" role="status">Loading fleet...</p>
      </Card>
    </div>
  );
}
