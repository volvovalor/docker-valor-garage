// Gallery page
// Displays all photos across the fleet, sorted from oldest to newest.

// IMPORTS
import { Suspense } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { PageHero } from "@/components/PageHero";
import { listAllPhotos, photoUrl } from "@/db/queries";


// DATE FORMATTER
const photoDateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});


// MAIN FUNCTION
export default function GalleryPage() {
  return (
    <Suspense fallback={<GalleryFallback />}>
      <GalleryContent />
    </Suspense>
  );
}


// GALLERY CONTENT
// Fetches all photos and renders the gallery.
async function GalleryContent() {
  const photos = await listAllPhotos();

  return (
    <div>
      <PageHero
        imageSrc="/images/bg-photos.jpg"
        imageAlt="Photography studio with automotive subject"
        title="Gallery"
        subtitle="Every photo across the fleet, arranged from oldest to newest."
        kicker={
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-surface/80 px-4 py-1.5 backdrop-blur-md shadow-xl shadow-black/40">
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-accent">
              {photos.length} Photo{photos.length !== 1 ? "s" : ""} · Oldest First
            </span>
          </span>
        }
      />

      {photos.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-lg font-medium">No photos yet</p>
          <p className="mt-1 text-sm text-muted">
            Photos uploaded to any vehicle will appear here.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => {
            const vehicle = [photo.year, photo.make, photo.model]
              .filter(Boolean)
              .join(" ");

            return (
              <Card key={photo.id} className="overflow-hidden p-0">
                <Link href={`/cars/${photo.carId}/photos`} className="group block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl(photo.carId, photo.filename)}
                    alt={photo.caption || `${photo.carNickname} photo`}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="space-y-1 p-3">
                    <time
                      dateTime={photo.createdAt.toISOString()}
                      className="block text-xs text-muted"
                    >
                      {photoDateFormatter.format(photo.createdAt)}
                    </time>
                    <p className="font-medium">
                      {photo.caption || vehicle || "Untitled photo"}
                    </p>
                    <p className="text-sm text-muted">
                      {photo.carNickname}{vehicle ? ` · ${vehicle}` : ""}
                    </p>
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}


// GALLERY FALLBACK
// Displays a loading state while the gallery content is being fetched.
function GalleryFallback() {
  return (
    <div>
      <PageHero
        imageSrc="/images/bg-photos.jpg"
        imageAlt="Photography studio with automotive subject"
        title="Gallery"
        subtitle="Every photo across the fleet, arranged from oldest to newest."
      />
      <Card className="py-16 text-center">
        <p className="text-sm text-muted" role="status">Loading gallery...</p>
      </Card>
    </div>
  );
}
