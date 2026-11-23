import { Suspense } from "react";
import { savePreferences } from "@/actions/preferences";
import { getPreferences } from "@/lib/browser-preferences";
import { preferenceOptions } from "@/lib/preferences";

type SettingsParams = Promise<{ updated?: string | string[] }>;

export default function SettingsPage({ searchParams }: { searchParams: SettingsParams }) {
  return (
    <div className="max-w-3xl">
      <header className="border-b border-border pb-5">
        <p className="text-xs font-mono uppercase text-accent">Valor Garage</p>
        <h1 className="mt-1 text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted">Preferences for this browser.</p>
      </header>
      <Suspense fallback={<p className="py-6 text-sm text-muted" role="status">Loading settings...</p>}>
        <SettingsForm searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SettingsForm({ searchParams }: { searchParams: SettingsParams }) {
  const [preferences, { updated }] = await Promise.all([getPreferences(), searchParams]);

  return (
    <form key={JSON.stringify(preferences)} action={savePreferences}>
      <fieldset className="grid gap-4 border-b border-border pb-6 sm:grid-cols-2">
        <legend className="mb-4 pt-6 font-semibold">Appearance</legend>
        <PreferenceSelect name="theme" label="Theme" value={preferences.theme} />
        <PreferenceSelect name="motion" label="Motion" value={preferences.motion} />
      </fieldset>
      <fieldset className="grid gap-4 border-b border-border pb-6 sm:grid-cols-2">
        <legend className="mb-4 pt-6 font-semibold">Workspace</legend>
        <PreferenceSelect name="home" label="Start page" value={preferences.home} />
      </fieldset>
      <fieldset className="grid gap-4 border-b border-border pb-6 sm:grid-cols-2">
        <legend className="mb-4 pt-6 font-semibold">Browsing</legend>
        <PreferenceSelect name="fleetOrder" label="Fleet order" value={preferences.fleetOrder} />
        <PreferenceSelect name="jobsOrder" label="Jobs order" value={preferences.jobsOrder} />
        <PreferenceSelect name="galleryOrder" label="Gallery order" value={preferences.galleryOrder} />
        <label className="flex items-center gap-2 self-end py-2 text-sm">
          <input type="checkbox" name="showArchived" defaultChecked={preferences.showArchived} className="size-4 accent-accent" />
          Include archived vehicles by default
        </label>
      </fieldset>
      <div className="flex flex-wrap items-center gap-3 py-6">
        <button type="submit" name="intent" value="save" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background hover:bg-accent-strong">
          Save preferences
        </button>
        <button type="submit" name="intent" value="reset" className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-2">
          Restore defaults
        </button>
        <p role="status" className="text-sm text-muted">
          {updated === "saved" ? "Preferences saved." : updated === "reset" ? "Defaults restored." : null}
        </p>
      </div>
    </form>
  );
}

function PreferenceSelect({ name, label, value }: { name: keyof typeof preferenceOptions; label: string; value: string }) {
  return (
    <label className="grid min-w-0 gap-1.5 text-sm font-medium">
      {label}
      <select name={name} defaultValue={value} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus:border-accent">
        {preferenceOptions[name].map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

