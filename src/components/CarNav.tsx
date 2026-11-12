// CAR NAVIGATION
// This component renders a navigation bar for a specific car profile. 

// IMPORTS
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Car } from "@/db/schema";


// MAIN FUNCTION
export function CarNav({ car, segment }: { car: Car; segment: "overview" | "photos" | "jobs" | "wiring" }) {
  const base = `/cars/${car.id}`;
  const tabs = [
    { id: "overview" as const, href: base, label: "Overview" },
    { id: "photos" as const, href: `${base}/photos`, label: "Photos" },
    { id: "jobs" as const, href: `${base}/jobs`, label: "Jobs" },
    { id: "wiring" as const, href: `${base}/wiring`, label: "Wiring" },
  ];
  return (
    <div className="mb-8">
      <div className="mb-4">
        <Link href="/cars" className="text-xs text-muted hover:text-accent">
          Fleet
        </Link>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{car.nickname}</h1>
        <p className="text-sm text-muted">
          {[car.year, car.make, car.model].filter(Boolean).join(" ")}
          {car.archivedAt ? " · archived" : ""}
        </p>
      </div>
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm transition",
              segment === tab.id
                ? "border-accent text-foreground"
                : "border-transparent text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
