// PROJECT DETAIL PAGE
// Displays the details of a specific job, including its tasks and status.

// IMPORTS
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProject, updateProject } from "@/actions/projects";
import { CarNav } from "@/components/CarNav";
import { PageHero } from "@/components/PageHero";
import { TaskTree } from "@/components/TaskTree";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { getCar, getProject, listTasks } from "@/db/queries";
import { JOB_STATUSES, PROJECT_CATEGORIES } from "@/lib/types";


// MAIN FUNCTION
export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}) {
  return (
    <Suspense fallback={<ProjectFallback />}>
      <ProjectContent params={params} />
    </Suspense>
  );
}


// PROJECT CONTENT
// Loads and renders the selected job after route params resolve.
async function ProjectContent({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}) {
  const { id, projectId } = await params;
  const car = await getCar(id);
  const project = await getProject(projectId);
  if (!car || !project || project.carId !== id) notFound();
  const tasks = await listTasks(projectId);

  return (
    <div>
      {/* Cinematic header */}
      <PageHero
        imageSrc="/images/bg-jobs.jpg"
        imageAlt="Workshop tools and project board"
        title={project.title}
        subtitle={`${car.nickname} — ${car.year ?? ""} ${car.make ?? ""} ${car.model ?? ""}`.trim()}
        kicker={
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-surface/80 px-4 py-1.5 backdrop-blur-md shadow-xl shadow-black/40">
            <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
            </svg>
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-accent">
              Job Detail
            </span>
          </span>
        }
      />

      <CarNav car={car} segment="jobs" />

      <Link
        href={`/cars/${id}/jobs`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-accent animate-fade-in-up delay-100"
      >
        <span>←</span> All jobs
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Task tree card */}
        <Card className="animate-slide-in-scale delay-200 hover-glow">
          <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            {project.title}
          </h2>
          <TaskTree carId={car.id} projectId={project.id} tasks={tasks} />
        </Card>

        {/* Job details form */}
        <Card className="animate-slide-in-scale delay-300 hover-glow animate-shimmer">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            Job Details
          </h2>
          <form action={updateProject} className="space-y-3">
            <input type="hidden" name="id" value={project.id} />
            <input type="hidden" name="carId" value={car.id} />
            <Field label="Title">
              <Input name="title" defaultValue={project.title} required />
            </Field>
            <Field label="Category">
              <Select name="category" defaultValue={project.category}>
                {PROJECT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Status">
              <Select name="status" defaultValue={project.status}>
                {JOB_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Target date">
              <Input name="targetDate" type="date" defaultValue={project.targetDate ?? ""} />
            </Field>
            <Field label="Notes">
              <Textarea name="notes" rows={4} defaultValue={project.notes ?? ""} />
            </Field>
            <Button type="submit">Save job</Button>
          </form>
          <form action={deleteProject.bind(null, car.id, project.id)} className="mt-4">
            <Button type="submit" variant="danger">
              Delete job
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}


// PROJECT FALLBACK
// Displays a loading state while the project details are being fetched.
function ProjectFallback() {
  return (
    <div>
      <PageHero
        imageSrc="/images/bg-jobs.jpg"
        imageAlt="Workshop tools and project board"
        title="Job Details"
        subtitle="Loading project details..."
      />
      <Card className="py-16 text-center">
        <p className="text-sm text-muted" role="status">Loading job...</p>
      </Card>
    </div>
  );
}
