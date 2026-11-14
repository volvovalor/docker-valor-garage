// Gallery page
// Displays all photos across the fleet, sorted from oldest to newest.

// IMPORTS
import { Suspense } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { PageHero } from "@/components/PageHero";
import { PhotoLightboxProvider, PhotoLightboxTrigger, PhotoSlideshowControls, PhotoThumbnail } from "@/components/PhotoLightbox";
import { listAllPhotos, photoUrl } from "@/db/queries";
import { isVideoFilename, videoPosterUrl } from "@/lib/media";


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
    <PhotoLightboxProvider
      photos={photos.map((photo) => {
        const vehicle = [photo.year, photo.make, photo.model].filter(Boolean).join(" ");
        return {
          src: photoUrl(photo.carId, photo.filename),
          type: isVideoFilename(photo.filename) ? "video" : "image",
          poster: isVideoFilename(photo.filename) ? videoPosterUrl(photo.carId, photo.filename) : undefined,
          alt: photo.caption || `${photo.carNickname} ${isVideoFilename(photo.filename) ? "video" : "photo"}`,
          caption: photo.caption || vehicle || "Untitled photo",
          detail: `${photo.carNickname}${vehicle ? ` · ${vehicle}` : ""} · ${photoDateFormatter.format(photo.createdAt)}`,
        };
      })}
    >
      <div>
        <PageHero
          imageSrc="/images/bg-photos.jpg"
          imageAlt="Photography studio with automotive subject"
          title="Gallery"
          subtitle="Every photo across the fleet, arranged from oldest to newest."
          kicker={
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-surface/80 px-4 py-1.5 backdrop-blur-md shadow-xl shadow-black/40">
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-accent">
                {photos.length} Item{photos.length !== 1 ? "s" : ""} · Oldest First
              </span>
            </span>
          }
        >
          {photos.length > 0 ? <PhotoSlideshowControls /> : null}
        </PageHero>

        {photos.length === 0 ? (
          <Card className="py-16 text-center">
            <p className="text-lg font-medium">No photos yet</p>
            <p className="mt-1 text-sm text-muted">
              Photos uploaded to any vehicle will appear here.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, index) => {
              const vehicle = [photo.year, photo.make, photo.model]
                .filter(Boolean)
                .join(" ");

              return (
                <Card key={photo.id} className="overflow-hidden p-0">
                  <PhotoLightboxTrigger
                    index={index}
                    type={isVideoFilename(photo.filename) ? "video" : "image"}
                    className="group relative overflow-hidden"
                  >
                    {isVideoFilename(photo.filename) ? (
                      <PhotoThumbnail
                        src={videoPosterUrl(photo.carId, photo.filename)}
                        alt={photo.caption || `${photo.carNickname} video`}
                        type="video"
                      />
                    ) : (
                      <PhotoThumbnail
                        src={photoUrl(photo.carId, photo.filename)}
                        alt={photo.caption || `${photo.carNickname} photo`}
                      />
                    )}
                  </PhotoLightboxTrigger>
                  <Link href={`/cars/${photo.carId}/photos`} className="block space-y-1 p-3">
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
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PhotoLightboxProvider>
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
