// JOBS PAGE
// Lists all jobs in the system, with links to their details.

// IMPORTS
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createProject } from "@/actions/projects";
import { CarNav } from "@/components/CarNav";
import { PageHero } from "@/components/PageHero";
import { CategoryBadge, StatusBadge } from "@/components/StatusBadge";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { getCar, listProjects } from "@/db/queries";
import { JOB_STATUSES, PROJECT_CATEGORIES } from "@/lib/types";


// MAIN FUNCTION
export default async function JobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ category?: string | string[]; status?: string | string[] }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const car = await getCar(id);
  if (!car) notFound();
  const category = first(sp.category);
  const status = first(sp.status);
  const projects = (await listProjects(id)).filter((p) => {
    if (category && p.category !== category) return false;
    if (status && p.status !== status) return false;
    return true;
  });

  const activeCount = projects.filter((p) => p.status === "in_progress").length;

  return (
    <div>
      {/* Cinematic header */}
      <PageHero
        imageSrc="/images/bg-jobs.jpg"
        imageAlt="Workshop tools"
        title={`${car.nickname} Jobs`}
        subtitle="Track maintenance, builds, and upgrades for this vehicle."
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
        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 text-sm">
          <FilterLink href={`/cars/${id}/jobs`} active={!category && !status}>
            All
          </FilterLink>
          {PROJECT_CATEGORIES.map((c) => (
            <FilterLink
              key={c.value}
              href={`/cars/${id}/jobs?category=${c.value}`}
              active={category === c.value}
            >
              {c.label}
            </FilterLink>
          ))}
          {JOB_STATUSES.map((s) => (
            <FilterLink
              key={s.value}
              href={`/cars/${id}/jobs?status=${s.value}`}
              active={status === s.value}
            >
              {s.label}
            </FilterLink>
          ))}
        </div>
      </PageHero>

      <CarNav car={car} segment="jobs" />

      {/* New job form */}
      <Card className="mb-6 animate-slide-in-scale delay-200 hover-glow animate-shimmer">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Job
        </h2>
        <form action={createProject} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="carId" value={car.id} />
          <Field label="Title">
            <Input name="title" required placeholder="Oil change or custom fuel system" />
          </Field>
          <Field label="Category">
            <Select name="category" defaultValue="maintenance">
              {PROJECT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select name="status" defaultValue="todo">
              {JOB_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Target date">
            <Input name="targetDate" type="date" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <Textarea name="notes" rows={2} />
            </Field>
          </div>
          <div>
            <Button type="submit">Create job</Button>
          </div>
        </form>
      </Card>

      {/* Jobs list */}
      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="animate-fade-in-up delay-300 rounded-xl border border-dashed border-border/60 bg-surface/40 p-12 text-center backdrop-blur-md">
            <p className="text-sm text-muted">No jobs in this filter.</p>
          </div>
        ) : (
          projects.map((project, i) => (
            <Link key={project.id} href={`/cars/${id}/jobs/${project.id}`}>
              <Card
                className="mb-3 transition-all duration-300 hover:border-accent hover:shadow-lg hover:shadow-accent/5 hover:scale-[1.01] hover-glow animate-slide-in-scale"
                style={{ animationDelay: `${300 + i * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium">{project.title}</h3>
                    {project.targetDate ? (
                      <p className="text-xs text-muted">Target {project.targetDate}</p>
                    ) : null}
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

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3.5 py-1.5 transition-all duration-200 backdrop-blur-md border ${
        active
          ? "bg-accent/20 border-accent/40 text-accent-strong shadow-sm shadow-accent/10"
          : "bg-surface/50 border-border/50 text-muted hover:text-foreground hover:border-accent/30"
      }`}
    >
      {children}
    </Link>
  );
}
