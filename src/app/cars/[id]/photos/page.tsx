import { Suspense } from "react";
import { notFound } from "next/navigation";
import { deletePhoto, setCoverPhoto, updatePhotoCaption, uploadPhotos } from "@/actions/photos";
import { CarNav } from "@/components/CarNav";
import { PageHero } from "@/components/PageHero";
import { Button, Card, Input } from "@/components/ui";
import { getCar, listPhotos, photoUrl } from "@/db/queries";

export default function PhotosPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PhotosFallback />}>
      <PhotosContent params={params} />
    </Suspense>
  );
}


// PHOTOS CONTENT
// Loads and renders the selected vehicle's photos after route params resolve.
async function PhotosContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCar(id);
  if (!car) notFound();
  const photos = await listPhotos(id);

  return (
    <div>
      {/* Cinematic header with studio/photos background */}
      <PageHero
        imageSrc="/images/bg-photos.jpg"
        imageAlt="Photography studio with automotive subject"
        title="Photo Gallery"
        subtitle="Bay shots, glamour photos, and build progress — all in one place."
        kicker={
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-surface/80 px-4 py-1.5 backdrop-blur-md shadow-xl shadow-black/40">
            <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-accent">
              {car.nickname} · {photos.length} Photo{photos.length !== 1 ? "s" : ""}
            </span>
          </span>
        }
      />

      <CarNav car={car} segment="photos" />

      {/* Upload form */}
      <Card className="mb-6 animate-slide-in-scale delay-200 hover-glow animate-shimmer">
        <form action={uploadPhotos} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <input type="hidden" name="carId" value={car.id} />
          <label className="flex-1 text-xs font-medium uppercase tracking-wide text-accent">
            Add photos
            <input
              name="files"
              type="file"
              accept="image/*"
              multiple
              className="mt-1 block w-full text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-background file:cursor-pointer file:transition file:hover:bg-accent-strong"
            />
          </label>
          <label className="flex-1 text-xs font-medium uppercase tracking-wide text-accent">
            Caption
            <Input name="caption" className="mt-1" placeholder="Engine bay, 2026" />
          </label>
          <Button type="submit">Upload</Button>
        </form>
      </Card>

      {/* Photo grid */}
      {photos.length === 0 ? (
        <div className="animate-fade-in-up delay-300 rounded-xl border border-dashed border-border/60 bg-surface/40 p-12 text-center backdrop-blur-md">
          <svg className="mx-auto h-10 w-10 text-muted/40 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
          </svg>
          <p className="text-sm text-muted">No pictures yet. Drop in a bay shot or a glamour photo.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, i) => (
            <Card
              key={photo.id}
              className="overflow-hidden p-0 transition-all duration-300 hover:border-accent hover:shadow-lg hover:shadow-accent/5 hover-glow animate-slide-in-scale"
              style={{ animationDelay: `${300 + i * 80}ms` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl(car.id, photo.filename)}
                alt={photo.caption ?? ""}
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-110"
              />
              <div className="space-y-2 p-3">
                <form action={updatePhotoCaption} className="flex gap-2">
                  <input type="hidden" name="id" value={photo.id} />
                  <input type="hidden" name="carId" value={car.id} />
                  <Input name="caption" defaultValue={photo.caption ?? ""} placeholder="Caption" />
                  <Button type="submit" variant="outline">
                    Save
                  </Button>
                </form>
                <div className="flex gap-2">
                  <form action={setCoverPhoto.bind(null, car.id, photo.id)} className="flex-1">
                    <Button type="submit" variant="outline" className="w-full" disabled={car.coverPhotoId === photo.id}>
                      {car.coverPhotoId === photo.id ? "✓ Cover" : "Set cover"}
                    </Button>
                  </form>
                  <form action={deletePhoto.bind(null, car.id, photo.id)}>
                    <Button type="submit" variant="danger">
                      Delete
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


// PHOTOS FALLBACK
// Displays a loading state while the gallery is being fetched.
function PhotosFallback() {
  return (
    <div>
      <PageHero
        imageSrc="/images/bg-photos.jpg"
        imageAlt="Photography studio with automotive subject"
        title="Photo Gallery"
        subtitle="Bay shots, glamour photos, and build progress — all in one place."
      />
      <Card className="py-16 text-center">
        <p className="text-sm text-muted" role="status">Loading photos...</p>
      </Card>
    </div>
  );
}
