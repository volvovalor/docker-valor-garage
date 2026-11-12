// PAGE HERO
// Reusable cinematic background + animated header component
// Adds a fullscreen faded background image with overlays, animated title, and optional subtitle.
// Used across all pages to maintain consistent styling with the front page.

// IMPORTS
import type { ReactNode } from "react";

interface PageHeroProps {
  /** Path to the background image in /public, e.g. "/images/bg-jobs.jpg" */
  imageSrc: string;
  /** Alt text for the background image */
  imageAlt?: string;
  /** Page title, displayed as a large animated heading */
  title: string;
  /** Optional subtitle / description below the title */
  subtitle?: string;
  /** Optional icon or badge rendered above the title */
  kicker?: ReactNode;
  /** Extra content rendered below subtitle (buttons, filters, etc.) */
  children?: ReactNode;
}


// MAIN FUNCTION
export function PageHero({
  imageSrc,
  imageAlt = "",
  title,
  subtitle,
  kicker,
  children,
}: PageHeroProps) {
  return (
    <div className="relative -mx-6 -mt-8 mb-8 overflow-hidden rounded-b-2xl">
      {/* Background image with slow zoom animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-full w-full object-cover object-center animate-slow-zoom opacity-30 scale-105"
        />

        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(12,11,10,0.1)_0%,rgba(12,11,10,0.8)_70%,#0c0b0a_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background" />

        {/* Blueprint grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #f5f0e8 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 pt-10 pb-8 sm:pt-14 sm:pb-10">
        {/* Optional kicker badge */}
        {kicker && (
          <div className="animate-fade-in-up mb-4">
            {kicker}
          </div>
        )}

        {/* Animated title */}
        <h1 className="animate-fade-in-up delay-100 text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight">
          <span className="bg-gradient-to-b from-white via-zinc-100 to-amber-100/90 bg-clip-text text-transparent drop-shadow-2xl">
            {title}
          </span>
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="animate-fade-in-up delay-200 mt-3 max-w-2xl text-sm sm:text-base text-muted leading-relaxed">
            {subtitle}
          </p>
        )}

        {/* Extra content (filters, buttons, etc.) */}
        {children && (
          <div className="animate-fade-in-up delay-300 mt-5">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
