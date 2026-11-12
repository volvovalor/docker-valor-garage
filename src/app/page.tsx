// HOMEPAGE
// Main landing page

// IMPORTS
import Link from "next/link";
// import { listCars, listProjects } from "@/db/queries";

export default async function FrontPage() {
  // Query live garage stats from SQLite
  // const cars = await listCars(true);
  // const projects = await listProjects();
  // const activeProjects = projects.filter((p) => p.status === "in_progress");

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-background select-none">
      {/* -----------------------------------------------------------------
          1. Fullscreen Background Image with Slow Ambient Ken-Burns Zoom
          ----------------------------------------------------------------- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* The classic Volvo hero photograph */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-garage.jpg"
          alt="Valor Garage Classic Volvo"
          className="h-full w-full object-cover object-center animate-slow-zoom opacity-45 sm:opacity-50 scale-105"
        />

        {/* Multi-layered cinematic overlays */}
        {/* Radial vignette spotlighting the center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(12,11,10,0.1)_0%,rgba(12,11,10,0.7)_65%,#0c0b0a_100%)]" />

        {/* Vertical gradients top and bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-transparent to-background/95" />

        {/* Technical blueprint grid texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle, #f5f0e8 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* -----------------------------------------------------------------
          2. Transparent Top Navigation Bar
          ----------------------------------------------------------------- */}
      <header className="relative z-30 w-full px-6 py-5 sm:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo brand mark */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/40 bg-surface/70 backdrop-blur-md transition group-hover:border-accent group-hover:shadow-[0_0_15px_rgba(196,165,116,0.25)]">
              <svg
                className="h-4 w-4 text-accent transition group-hover:scale-110"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V4.875c0-.621-.504-1.125-1.125-1.125H5.25c-.621 0-1.125.504-1.125 1.125v13.875"
                />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-accent">
                Valor
              </div>
              <div className="text-sm font-bold tracking-tight text-foreground">
                Garage
              </div>
            </div>
          </Link>

          {/* Center navigation links */}
          <nav className="hidden md:flex items-center gap-1 rounded-full border border-border/60 bg-surface/60 px-4 py-1.5 backdrop-blur-md shadow-lg shadow-black/20">
            <Link
              href="/cars"
              className="rounded-full px-3.5 py-1 text-xs font-medium text-muted transition hover:text-accent hover:bg-surface-2/60"
            >
              Fleet Bay
            </Link>
            <Link
              href="/jobs"
              className="rounded-full px-3.5 py-1 text-xs font-medium text-muted transition hover:text-accent hover:bg-surface-2/60"
            >
              Jobs & Projects
            </Link>
            <Link
              href="/cars/new"
              className="rounded-full px-3.5 py-1 text-xs font-medium text-muted transition hover:text-accent hover:bg-surface-2/60"
            >
              + Add Vehicle
            </Link>
          </nav>

          {/* Right status badge & quick entrance */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border/50 bg-surface/40 px-3 py-1 text-[11px] text-muted backdrop-blur-md font-mono">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>Local Garage Node</span>
            </div>

            <Link
              href="/cars"
              className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-xs font-medium text-accent transition hover:border-accent hover:bg-accent/20 hover:text-accent-strong"
            >
              <span>Open Fleet</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* -----------------------------------------------------------------
          3. Center Hero: Big Animated Title, Subtitle & Action Buttons
          ----------------------------------------------------------------- */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-6 pt-6 pb-12 sm:pt-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Top Pill Kicker */}
          <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-surface/80 px-4 py-1.5 backdrop-blur-md shadow-xl shadow-black/40">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-accent">
              Self-Hosted Hobby Fleet & Wiring Studio
            </span>
          </div>

          {/* Big Bold Animated Project Title */}
          <h1 className="animate-fade-in-up delay-100 text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight leading-[0.92]">
            <span className="block bg-gradient-to-b from-white via-zinc-100 to-amber-100/90 bg-clip-text text-transparent drop-shadow-2xl">
              Valor
            </span>
            <span className="block bg-gradient-to-r from-accent via-accent-strong to-amber-200 bg-clip-text text-transparent drop-shadow-[0_4px_25px_rgba(196,165,116,0.3)]">
              Garage
            </span>
          </h1>

          {/* Subtitle / Description */}
          <p className="animate-fade-in-up delay-200 mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-muted font-normal leading-relaxed">
            Profiles, nested jobs, and linked wiring diagrams for the cars you
            actually wrench on. Kept private, persistent, and entirely local.
          </p>

          {/* Action Buttons to Get Started */}
          <div className="animate-fade-in-up delay-300 mt-9 flex flex-wrap items-center justify-center gap-4">
            {/* Primary Action Button */}
            <Link
              href="/cars"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-accent to-accent-strong px-7 py-3.5 text-sm font-semibold text-background shadow-xl shadow-accent/20 transition-all duration-200 hover:shadow-accent/40 hover:scale-[1.03] active:scale-[0.98]"
            >
              <svg
                className="h-4 w-4 text-background transition-transform duration-200 group-hover:scale-110"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.45"
                />
              </svg>
              <span>Explore Fleet</span>
              <span className="text-base transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>

            {/* Secondary Action Button */}
            <Link
              href="/jobs"
              className="group inline-flex items-center gap-2.5 rounded-xl border border-border bg-surface/70 px-6 py-3.5 text-sm font-medium text-foreground backdrop-blur-md transition-all duration-200 hover:border-accent hover:bg-surface-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg
                className="h-4 w-4 text-muted transition group-hover:text-accent"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.42 15.17 17.25 21A2.67 2.67 0 0 0 21 17.25l-5.83-5.83M11.42 15.17l2.496-3.03c.315-.384.74-.67 1.209-.831a4.99 4.99 0 0 0 2.446-2.446c.162-.47.447-.894.832-1.21L21 4.5l-2.5 2.5-1.5-1.5L19.5 3l-2.363 2.597c-.316.385-.74.67-1.21.832a4.99 4.99 0 0 0-2.446 2.446c-.161.47-.447.894-.831 1.21L9.65 13.08"
                />
              </svg>
              <span>Manage Jobs</span>
            </Link>

            {/* Tertiary Action Button */}
            <Link
              href="/cars/new"
              className="group inline-flex items-center gap-2 rounded-xl border border-dashed border-accent/40 bg-accent/5 px-5 py-3.5 text-sm font-medium text-accent backdrop-blur-sm transition-all duration-200 hover:border-accent hover:bg-accent/15 hover:text-accent-strong hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg
                className="h-4 w-4 transition-transform group-hover:rotate-90 duration-200"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              <span>Add Vehicle</span>
            </Link>
          </div>

          {/* Quick Real-Time Metrics Strip */}
          <div className="animate-fade-in-up delay-400 mt-10 flex flex-wrap items-center justify-center gap-8 border-t border-border/40 pt-6 text-xs text-muted font-mono">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-sm">
                {/* {cars.length} */}
              </span>
              {/* <span>{cars.length === 1 ? "Vehicle" : "Vehicles"} Docked</span> */}
            </div>
            <div className="h-3 w-px bg-border/60" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-accent text-sm">
                {/* {activeProjects.length} */}
              </span>
              {/* <span>Active {activeProjects.length === 1 ? "Job" : "Jobs"}</span> */}
            </div>
            <div className="h-3 w-px bg-border/60" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-sm">
                {/* {projects.length} */}
              </span>
              <span>Total Projects</span>
            </div>
          </div>
        </div>
      </main>

      {/* -----------------------------------------------------------------
          4. Bottom Feature Highlight Cards
          ----------------------------------------------------------------- */}
      <footer className="relative z-20 w-full px-6 pb-6 pt-4 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Feature 1: Fleet Profiles */}
            <Link
              href="/cars"
              className="group rounded-xl border border-border/60 bg-surface/50 p-4 backdrop-blur-md transition-all duration-200 hover:border-accent/60 hover:bg-surface/80 hover:shadow-lg hover:shadow-black/40"
            >
              <div className="flex items-center justify-between text-xs text-accent font-mono uppercase tracking-wider mb-1.5">
                <span>01 / Fleet Bay</span>
                <span className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent">
                  →
                </span>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-accent transition">
                Vehicle Profiles & Builds
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Log VINs, engine specs, modifications, and high-resolution photo
                journals for every project.
              </p>
            </Link>

            {/* Feature 2: Nested Jobs */}
            <Link
              href="/jobs"
              className="group rounded-xl border border-border/60 bg-surface/50 p-4 backdrop-blur-md transition-all duration-200 hover:border-accent/60 hover:bg-surface/80 hover:shadow-lg hover:shadow-black/40"
            >
              <div className="flex items-center justify-between text-xs text-accent font-mono uppercase tracking-wider mb-1.5">
                <span>02 / Nested Jobs</span>
                <span className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent">
                  →
                </span>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-accent transition">
                Structured Workflows
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Break major restorations down into sub-tasks with live status,
                parts tracking, and milestones.
              </p>
            </Link>

            {/* Feature 3: Interactive Wiring */}
            <Link
              href="/cars"
              className="group rounded-xl border border-border/60 bg-surface/50 p-4 backdrop-blur-md transition-all duration-200 hover:border-accent/60 hover:bg-surface/80 hover:shadow-lg hover:shadow-black/40"
            >
              <div className="flex items-center justify-between text-xs text-accent font-mono uppercase tracking-wider mb-1.5">
                <span>03 / Schematics</span>
                <span className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent">
                  →
                </span>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-accent transition">
                Interactive Wiring Canvas
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Node-based harness visualizer with custom pinouts, color coding,
                and live connection tracing.
              </p>
            </Link>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted/70 gap-2 border-t border-border/30 pt-3">
            <div>Valor Garage · Self-hosted hobby fleet manager</div>
            <div className="flex items-center gap-4">
              <span>SQLite + Next.js</span>
              <span>•</span>
              <Link href="/cars" className="hover:text-accent transition">
                Enter Fleet Bay
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
