// STATUS BADGE
// This component is used to display a badge for a given status or category.

// IMPORTS
import { Badge } from "@/components/ui";
import { JOB_STATUSES, PROJECT_CATEGORIES, type JobStatus, type ProjectCategory } from "@/lib/types";


// Status Badge
// Takes a status string as a prop and displays a badge with the corresponding label. 
// Tone is determined based on the status value: 
// - "done" mapping to "ok"
// - "in_progress" mapping to "warn"
// - any other status mapping to "muted"
export function StatusBadge({ status }: { status: string }) {
  const tone = status === "done" ? "ok" : status === "in_progress" ? "warn" : "muted";
  const label = JOB_STATUSES.find((s) => s.value === (status as JobStatus))?.label ?? status;
  return <Badge tone={tone}>{label}</Badge>;
}

// Category Badge
// Takes a category string as a prop and displays a badge with the corresponding label.
export function CategoryBadge({ category }: { category: string }) {
  const label =
    PROJECT_CATEGORIES.find((c) => c.value === (category as ProjectCategory))?.label ?? category;
  return <Badge tone="accent">{label}</Badge>;
}
