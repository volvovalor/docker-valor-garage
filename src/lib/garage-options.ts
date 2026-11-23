// GARAGE OPTIONS
// Defines the available garage features, default settings, and utility functions for managing garage options.

// CONSTANTS
export const features = { gallery: "Gallery", jobs: "Jobs", wiring: "Wiring designer" } as const;
export type Feature = keyof typeof features;

export const garageDefaults = {
  gallery: true,
  jobs: true,
  wiring: true,
  homeStats: true,
  units: "metric" as "metric" | "imperial",
  backgroundMode: "fixed" as "fixed" | "all" | "car" | "directory",
  backgroundImage: "default",
  backgroundCar: "",
  backgroundDirectory: "",
  backupFolder: "",
};


// Valid Backup Folder
// Utility function to validate the backup folder name for correctness and safety.
export function validBackupFolder(value: unknown): value is string {
  return typeof value === "string" && /^(?:[a-zA-Z0-9][a-zA-Z0-9_-]{0,63})?$/.test(value)
    && !/^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])$/i.test(value);
}


// Normalize Garage Options
// Converts raw input into a structured format matching the garage defaults, ensuring valid values.
export function normalizeGarageOptions(input: Record<string, unknown>): typeof garageDefaults {
  const { backgroundMode } = input;
  return {
    gallery: input.gallery !== false,
    jobs: input.jobs !== false,
    wiring: input.wiring !== false,
    homeStats: input.homeStats !== false,
    units: input.units === "imperial" ? "imperial" : "metric",
    backgroundMode: backgroundMode === "all" || backgroundMode === "car" || backgroundMode === "directory" ? backgroundMode : "fixed",
    backgroundImage: typeof input.backgroundImage === "string" ? input.backgroundImage : "default",
    backgroundCar: typeof input.backgroundCar === "string" ? input.backgroundCar : "",
    backgroundDirectory: typeof input.backgroundDirectory === "string" ? input.backgroundDirectory : "",
    backupFolder: validBackupFolder(input.backupFolder) ? input.backupFolder : "",
  };
}


// Display Displacement
// Formats the engine displacement value according to the specified units.
export function displayDisplacement(value: string | undefined, units: typeof garageDefaults.units) {
  const match = value?.trim().match(/^(\d+(?:[.,]\d+)?)\s*(l|liters?|litres?|cc|cm3|cm³|ci|cid|in3|in³|cu\.?\s*in\.?)$/i);
  if (!match) return value;
  const amount = Number(match[1].replace(",", "."));
  if (!Number.isFinite(amount)) return value;
  const unit = match[2].toLowerCase();
  const imperial = /^(ci|in|cu)/.test(unit);
  const liters = imperial ? amount * 0.016387064 : unit.startsWith("l") ? amount : amount / 1000;
  const formatted = new Intl.NumberFormat("en-US", { maximumFractionDigits: units === "metric" ? 3 : 1 });
  return units === "metric" ? `${formatted.format(liters)} L` : `${formatted.format(liters / 0.016387064)} cu in`;
}
