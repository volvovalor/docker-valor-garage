// UI COMPONENTS
// Reusable UI components
// - Button
// - Input
// - Textarea
// - Select
// - Label
// - Field
// - Card
// - Badge
// Each component is styled using Tailwind CSS classes and can be customized via props.

// IMPORTS
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";


// Button
// Renders button element with customizable styles based on the variant prop. 
// "primary", "ghost", "danger", and "outline". Also accepts additional props such as className and other HTML button attributes.
export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "outline";
}) {
  const styles = {
    primary: "bg-accent text-background hover:bg-accent-strong",
    ghost: "bg-transparent text-foreground hover:bg-surface-2",
    danger: "bg-danger/15 text-danger hover:bg-danger/25",
    outline: "border border-border bg-surface-2 text-foreground hover:border-accent",
  }[variant];
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:opacity-50",
        styles,
        className,
      )}
      {...props}
    />
  );
}


// Input
// Renders input element with customizable styles.
// Accepts all standard input attributes and can be styled via the className prop.
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent",
        className,
      )}
      {...props}
    />
  );
}


// Textarea
// Renders textarea element with customizable styles.
// Accepts all standard textarea attributes and can be styled via the className prop.
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent",
        className,
      )}
      {...props}
    />
  );
}


// Select
// Renders select element with customizable styles.
// Accepts all standard select attributes and can be styled via the className prop.
export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none focus:border-accent",
        className,
      )}
      {...props}
    />
  );
}


// Label
// Renders a label element with customizable styles.
// Accepts all standard label attributes and can be styled via the className prop.
export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1 block text-xs font-medium uppercase tracking-wide text-muted", className)} {...props} />;
}


// Field
// Wrapper for form fields, rendering a label and its associated input or control.
// Accepts a label prop for the field's label text and children for the input or control element.
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}


// Card
// Renders a card element with customizable styles.
// Accepts all standard div attributes and can be styled via the className prop.
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-border bg-surface p-4", className)} {...props} />;
}


// Badge
// Renders a badge element with customizable styles based on the tone prop.
// "muted", "accent", "ok", and "warn".
// The badge also accepts children for the content to be displayed inside the badge.
export function Badge({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "accent" | "ok" | "warn";
}) {
  const color = {
    muted: "bg-surface-2 text-muted",
    accent: "bg-accent/15 text-accent-strong",
    ok: "bg-emerald-500/15 text-emerald-400",
    warn: "bg-amber-500/15 text-amber-300",
  }[tone];
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide", color)}>
      {children}
    </span>
  );
}
