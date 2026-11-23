// AppShell Component
// Wraps the header, main content area, and footer.

"use client";

// IMPORTS
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Preferences } from "@/lib/preferences";


// MAIN FUNCTION
export function AppShell({ children, theme, motion }: {
  children: React.ReactNode;
  theme: Preferences["theme"];
  motion: Preferences["motion"];
}) {
  const pathname = usePathname();
  const isLanding = pathname === "/";



  // Case: Homepage
  // Style: Fullscreen container without sidebar for the landing page
  if (isLanding) {
    return <main data-garage-theme={theme} data-garage-motion={motion} className="min-h-screen w-full">{children}</main>;
  }



  // Case: Other pages
  // Style: Sidebar navigation with main content area
  return (
    <div data-garage-theme={theme} data-garage-motion={motion} className="flex min-h-full flex-col md:flex-row">

      {/* Sidebar */}
      <aside className="flex shrink-0 flex-col border-b border-border bg-surface/90 px-4 py-3 backdrop-blur-xl md:sticky md:top-0 md:h-screen md:w-56 md:border-b-0 md:border-r md:py-6">
        <Link href="/" className="group mb-3 block px-1 md:mb-8">
          <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent transition group-hover:text-accent-strong">
            Valor
          </div>
          <div className="font-semibold tracking-tight text-foreground transition group-hover:text-accent">
            Garage
          </div>
        </Link>

        {/* Navigation links */}
        <nav aria-label="Garage" className="flex flex-wrap gap-1 text-sm md:flex-col">
          <NavLink
            href="/cars"
            active={pathname === "/cars" || (pathname.startsWith("/cars/") && pathname !== "/cars/new")}
          >
            Fleet
          </NavLink>
          <NavLink href="/warehouse" active={pathname.startsWith("/warehouse")}>
            Warehouse
          </NavLink>
          <NavLink href="/gallery" active={pathname.startsWith("/gallery")}>
            Gallery
          </NavLink>
          <NavLink href="/jobs" active={pathname.startsWith("/jobs")}>
            Jobs
          </NavLink>
          <NavLink href="/cars/new" active={pathname === "/cars/new"}>
            Add car
          </NavLink>
          <NavLink href="/settings" active={pathname === "/settings"}>
            Settings
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="mt-auto hidden border-t border-border/40 px-1 pt-6 md:block">
          <Link
            href="/"
            className="mb-2 inline-flex items-center gap-1.5 text-[11px] text-muted transition hover:text-accent"
          >
            <span>←</span> Home
          </Link>
          <p className="text-[11px] leading-relaxed text-muted">
            Hobby fleet notes, builds, and wiring — kept local.
          </p>
        </div>
      </aside>


      {/* Main content area */}
      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-7xl px-6 py-8">{children}</div>
      </div>


    </div>
  );
}


// NAVLINK COMPONENT
function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg px-2 py-1.5 text-sm transition ${
        active
          ? "bg-surface-2 font-medium text-accent"
          : "text-muted hover:bg-surface-2 hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
