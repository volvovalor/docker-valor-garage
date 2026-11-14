// Photo Lightbox
// Provides a fullscreen photo viewer with navigation and captions.

"use client";

// IMPORTS
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";


// PhotoLightboxItem Interface
// Represents a single photo in the lightbox, including its source, alt text, caption, and optional detail.
export interface PhotoLightboxItem {
  src: string;
  alt: string;
  caption?: string;
  detail?: string;
  type?: "image" | "video";
  poster?: string;
}


type OpenPhoto = (index: number, trigger: HTMLButtonElement) => void;
const PhotoLightboxContext = createContext<OpenPhoto | null>(null);


// PhotoLightboxProvider Component
// Wraps children components and provides lightbox functionality for a list of photos.
export function PhotoLightboxProvider({
  photos,
  children,
}: {
  photos: PhotoLightboxItem[];
  children: ReactNode;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const isOpen = activeIndex !== null;
  const activePhoto = activeIndex === null ? null : photos[activeIndex];

  useEffect(() => {
    if (!isOpen) {
      returnFocusRef.current?.focus();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);


  // Show Previous
  // Moves to the previous photo in the lightbox, wrapping around to the last photo if at the beginning.
  function showPrevious() {
    setActiveIndex((index) =>
      index === null ? null : (index - 1 + photos.length) % photos.length,
    );
  }

  // Show Next
  // Advances to the next photo in the lightbox, wrapping around to the first photo if at the end.
  function showNext() {
    setActiveIndex((index) =>
      index === null ? null : (index + 1) % photos.length,
    );
  }


  // Open Photo
  // Opens the lightbox for a specific photo and stores the trigger button for focus return.
  function openPhoto(index: number, trigger: HTMLButtonElement) {
    returnFocusRef.current = trigger;
    setActiveIndex(index);
  }

  return (
    <PhotoLightboxContext.Provider value={openPhoto}>
      {children}
      {activePhoto && activeIndex !== null ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          tabIndex={-1}
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white"
          onClick={() => setActiveIndex(null)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setActiveIndex(null);
            if (event.key === "ArrowLeft") showPrevious();
            if (event.key === "ArrowRight") showNext();
          }}
        >
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-3 sm:px-6">
            <p className="text-sm text-white/75">
              {activeIndex + 1} / {photos.length}
            </p>
            <button
              type="button"
              aria-label="Close photo viewer"
              title="Close"
              onClick={() => setActiveIndex(null)}
              className="flex size-10 items-center justify-center rounded-full bg-white/10 text-2xl transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-3 pt-16 sm:px-14"
            onClick={(event) => event.stopPropagation()}
          >
            {activePhoto.type === "video" ? (
              <video
                key={activePhoto.src}
                src={activePhoto.src}
                poster={activePhoto.poster}
                aria-label={activePhoto.alt}
                controls
                autoPlay
                muted
                playsInline
                className="h-full w-full min-h-0 min-w-0 object-contain"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activePhoto.src}
                alt={activePhoto.alt}
                className="max-h-full max-w-full select-none object-contain"
                draggable={false}
              />
            )}
            {photos.length > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  title="Previous photo"
                  onClick={showPrevious}
                  className="absolute inset-y-0 left-0 flex w-1/5 items-center justify-center text-white opacity-100 transition sm:opacity-0 sm:hover:bg-white/5 sm:hover:opacity-100 focus-visible:opacity-100"
                >
                  <Chevron direction="left" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  title="Next photo"
                  onClick={showNext}
                  className="absolute inset-y-0 right-0 flex w-1/5 items-center justify-center text-white opacity-100 transition sm:opacity-0 sm:hover:bg-white/5 sm:hover:opacity-100 focus-visible:opacity-100"
                >
                  <Chevron direction="right" />
                </button>
              </>
            ) : null}
          </div>

          <div className="min-h-16 px-4 pb-5 text-center sm:px-8">
            {activePhoto.caption ? (
              <p className="font-medium">{activePhoto.caption}</p>
            ) : null}
            {activePhoto.detail ? (
              <p className="mt-1 text-sm text-white/60">{activePhoto.detail}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </PhotoLightboxContext.Provider>
  );
}


// PhotoLightboxTrigger Component
// A button that opens the lightbox for a specific photo when clicked.
export function PhotoLightboxTrigger({
  index,
  type = "image",
  children,
  className = "",
}: {
  index: number;
  type?: "image" | "video";
  children: ReactNode;
  className?: string;
}) {
  const openPhoto = useContext(PhotoLightboxContext);
  if (!openPhoto) throw new Error("PhotoLightboxTrigger requires a PhotoLightboxProvider.");

  return (
    <button
      type="button"
      aria-label={`Open ${type} ${index + 1} in fullscreen`}
      onClick={(event) => openPhoto(index, event.currentTarget)}
      className={`block w-full cursor-zoom-in text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${className}`}
    >
      {children}
    </button>
  );
}


// Photo Thumbnail
// Displays a still image or video poster in the shared gallery grid.
export function PhotoThumbnail({
  src,
  alt,
  type = "image",
}: {
  src: string;
  alt: string;
  type?: "image" | "video";
}) {
  return (
    <span className="relative block aspect-[4/3] overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {type === "video" ? (
        <span className="absolute inset-0 flex items-end justify-between bg-black/10 p-2 text-[10px] font-semibold uppercase text-white">
          <span className="rounded bg-black/70 px-2 py-1">Video</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-9 drop-shadow">
            <path d="M8 5.5v13l10-6.5z" />
          </svg>
        </span>
      ) : null}
    </span>
  );
}


// Chevron Component
// Renders a left or right chevron icon for navigation in the lightbox.
function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="size-10 rounded-full bg-black/35 p-2 sm:size-12"
    >
      {direction === "left" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
      )}
    </svg>
  );
}
