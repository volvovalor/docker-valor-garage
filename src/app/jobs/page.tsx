// JOBS
// This page lists all jobs across the fleet, with optional filtering by category and status.

// IMPORTS
import Link from "next/link";
import { Suspense } from "react";
import { CategoryBadge, StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui";
import { PageHero } from "@/components/PageHero";
import { listProjects } from "@/db/queries";
import { JOB_STATUSES, PROJECT_CATEGORIES } from "@/lib/types";


// MAIN FUNCTION
export default function AllJobsPage({ searchParams }: {
  searchParams: Promise<{ category?: string | string[]; status?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<JobsFallback />}>
      <JobsContent searchParams={searchParams} />
    </Suspense>
  );
}


// JOBS CONTENT
// Filters and renders jobs after the URL search parameters resolve.
async function JobsContent({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[]; status?: string | string[] }>;
}) {
  const sp = await searchParams;
  const category = Array.isArray(sp.category) ? sp.category[0] : sp.category;
  const status = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const projects = (await listProjects()).filter((p) => {
    if (category && p.category !== category) return false;
    if (status && p.status !== status) return false;
    return true;
  });

  const activeCount = projects.filter((p) => p.status === "in_progress").length;

  return (
    <div>
      {/* Cinematic page header with workshop-themed background */}
      <PageHero
        imageSrc="/images/bg-jobs.jpg"
        imageAlt="Workshop tools and workbench"
        title="Jobs & Projects"
        subtitle="Everything on the board, across the fleet."
        kicker={
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-surface/80 px-4 py-1.5 backdrop-blur-md shadow-xl shadow-black/40">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-accent">
              {activeCount} Active · {projects.length} Total
            </span>
          </span>
        }
      >
        {/* FILTER PILLS */}
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/jobs"
            className={`rounded-full px-3.5 py-1.5 transition-all duration-200 backdrop-blur-md border ${
              !category && !status
                ? "bg-accent/20 border-accent/40 text-accent-strong shadow-sm shadow-accent/10"
                : "bg-surface/50 border-border/50 text-muted hover:text-foreground hover:border-accent/30"
            }`}
          >
            All
          </Link>
          {PROJECT_CATEGORIES.map((c) => (
            <Link
              key={c.value}
              href={`/jobs?category=${c.value}`}
              className={`rounded-full px-3.5 py-1.5 transition-all duration-200 backdrop-blur-md border ${
                category === c.value
                  ? "bg-accent/20 border-accent/40 text-accent-strong shadow-sm shadow-accent/10"
                  : "bg-surface/50 border-border/50 text-muted hover:text-foreground hover:border-accent/30"
              }`}
            >
              {c.label}
            </Link>
          ))}
          {JOB_STATUSES.map((s) => (
            <Link
              key={s.value}
              href={`/jobs?status=${s.value}`}
              className={`rounded-full px-3.5 py-1.5 transition-all duration-200 backdrop-blur-md border ${
                status === s.value
                  ? "bg-accent/20 border-accent/40 text-accent-strong shadow-sm shadow-accent/10"
                  : "bg-surface/50 border-border/50 text-muted hover:text-foreground hover:border-accent/30"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </PageHero>

      {/* JOB CARDSs */}
      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="animate-fade-in-up delay-300 rounded-xl border border-dashed border-border/60 bg-surface/40 p-12 text-center backdrop-blur-md">
            <p className="text-sm text-muted">No jobs match this filter.</p>
          </div>
        ) : (
          projects.map((project, i) => (
            <Link key={project.id} href={`/cars/${project.carId}/jobs/${project.id}`}>
              <Card
                className="mb-3 transition-all duration-300 hover:border-accent hover:shadow-lg hover:shadow-accent/5 hover:scale-[1.01] hover-glow animate-slide-in-scale"
                style={{ animationDelay: `${200 + i * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">{project.carNickname}</p>
                    <h3 className="font-medium">{project.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <CategoryBadge category={project.category} />
                    <StatusBadge status={project.status} />
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}


// JOBS FALLBACK
// Displays a loading state while the jobs data is being fetched.
function JobsFallback() {
  return (
    <div>
      <PageHero
        imageSrc="/images/bg-jobs.jpg"
        imageAlt="Workshop tools and workbench"
        title="Jobs & Projects"
        subtitle="Everything on the board, across the fleet."
      />
      <Card className="py-16 text-center">
        <p className="text-sm text-muted" role="status">Loading jobs...</p>
      </Card>
    </div>
  );
}
