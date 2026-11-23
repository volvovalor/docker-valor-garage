// SETTINGS PAGE
// Renders the settings page for the Valor Garage application, including garage and user preferences.

// IMPORTS
import { Suspense } from "react";
import { savePreferences } from "@/actions/preferences";
import { getPreferences } from "@/lib/browser-preferences";
import { preferenceOptions } from "@/lib/preferences";
import { saveGarageSettings } from "@/actions/garage-settings";
import { listCars } from "@/db/queries";
import { features } from "@/lib/garage-options";
import { garageSettings } from "@/lib/garage-settings";
import { backgroundChoices } from "@/lib/home-background";
import { BackupSettings } from "@/components/BackupSettings";

// TYPES
type SettingsParams = Promise<{ updated?: string | string[] }>;


// MAIN FUNCTION
export default function SettingsPage({ searchParams }: { searchParams: SettingsParams }) {
  return (
    <div className="max-w-3xl">
      <header className="border-b border-border pb-5">
        <p className="text-xs font-mono uppercase text-accent">Valor Garage</p>
        <h1 className="mt-1 text-2xl font-semibold">Settings</h1>
      </header>
      <Suspense fallback={<p className="py-6 text-sm text-muted" role="status">Loading settings...</p>}>
        <GarageSettingsForm searchParams={searchParams} />
        <SettingsForm searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const selectClass = "w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus:border-accent";


// Garage Settings Form
// Renders the form for updating garage-wide settings, including features and homepage preferences.
async function GarageSettingsForm({ searchParams }: { searchParams: SettingsParams }) {
  const [settings, { updated }] = await Promise.all([garageSettings(), searchParams]);
  const [cars, { directories, images }] = await Promise.all([listCars(true), backgroundChoices()]);
  return (
    <>
    <section className="border-b border-border py-6" aria-labelledby="garage-settings-heading">
      <h2 id="garage-settings-heading" className="text-lg font-semibold">Garage settings</h2>
      <p className="mt-1 text-sm text-muted">Applies to everyone using this garage.</p>
      <form action={saveGarageSettings} key={JSON.stringify(settings)} className="space-y-5">
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-3 pt-5 font-semibold">Features</legend>
          {Object.entries(features).map(([name, label]) => (
            <label key={name} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name={name} defaultChecked={settings[name as keyof typeof features]} className="size-4 accent-accent" />
              {label}
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="homeStats" defaultChecked={settings.homeStats} className="size-4 accent-accent" />
            Homepage statistics
          </label>
        </fieldset>
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 font-semibold">Homepage and units</legend>
          <GarageSelect name="backgroundMode" label="Background mode" value={settings.backgroundMode} options={[
            { value: "fixed", label: "Fixed image" }, { value: "all", label: "Rotate all garage photos" },
            { value: "car", label: "Rotate one vehicle's photos" }, { value: "directory", label: "Rotate images from a folder" },
          ]} />
          <GarageSelect name="backgroundImage" label="Fixed image" value={settings.backgroundImage} options={[
            { value: "default", label: "Original Volvo photo" }, ...images.map(({ id, label }) => ({ value: id, label })),
          ]} />
          <GarageSelect name="backgroundCar" label="Vehicle for rotation" value={settings.backgroundCar} options={[
            { value: "", label: "Select a vehicle" }, ...cars.map((car) => ({ value: car.id, label: car.nickname })),
          ]} />
          <GarageSelect name="backgroundDirectory" label="Folder for rotation" value={settings.backgroundDirectory} options={
            directories.map((directory) => ({ value: directory, label: directory || "Backgrounds root" }))
          } />
          <GarageSelect name="units" label="Engine displacement units" value={settings.units} options={[
            { value: "metric", label: "Metric (L)" }, { value: "imperial", label: "Imperial (cu in)" },
          ]} />
        </fieldset>
        <label className="grid max-w-sm gap-1.5 text-sm font-medium">
          Backup subfolder
          <input name="backupFolder" defaultValue={settings.backupFolder} maxLength={64} pattern="[a-zA-Z0-9][a-zA-Z0-9_\-]{0,63}" placeholder="Backup volume root" className={selectClass} />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background hover:bg-accent-strong">Save garage settings</button>
          {updated === "garage" && <p role="status" className="text-sm text-muted">Garage settings saved.</p>}
        </div>
      </form>
    </section>
    <BackupSettings folder={settings.backupFolder} updated={updated} />
    </>
  );
}


// Garage Select
// Renders a labeled select input for garage settings, such as background vehicle and folder preferences.
function GarageSelect({ name, label, value, options }: { name: string; label: string; value: string; options: { value: string; label: string }[] }) {
  return (
    <label className="grid min-w-0 gap-1.5 text-sm font-medium">
      {label}
      <select name={name} defaultValue={value} className={selectClass}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}


// Settings Form
// Renders the form for updating user preferences, including browser appearance, workspace, and browsing options.
async function SettingsForm({ searchParams }: { searchParams: SettingsParams }) {
  const [preferences, { updated }] = await Promise.all([getPreferences(), searchParams]);

  return (
    <form key={JSON.stringify(preferences)} action={savePreferences}>
      <h2 className="pt-6 text-lg font-semibold">Browser preferences</h2>
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


// Preference Select
// Renders a labeled select input for user preference options.
function PreferenceSelect({ name, label, value }: { name: keyof typeof preferenceOptions; label: string; value: string }) {
  return (
    <label className="grid min-w-0 gap-1.5 text-sm font-medium">
      {label}
      <select name={name} defaultValue={value} className={selectClass}>
        {preferenceOptions[name].map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
