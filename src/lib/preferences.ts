export const preferenceOptions = {
  theme: [
    { value: "dark", label: "Dark" },
    { value: "light", label: "Light" },
    { value: "system", label: "Match device" },
  ],
  motion: [
    { value: "system", label: "Match device" },
    { value: "reduce", label: "Reduce motion" },
  ],
  home: [
    { value: "/", label: "Front page" },
    { value: "/cars", label: "Fleet" },
    { value: "/jobs", label: "Jobs" },
    { value: "/warehouse", label: "Warehouse" },
    { value: "/gallery", label: "Gallery" },
  ],
  fleetOrder: [
    { value: "name", label: "Nickname (A to Z)" },
    { value: "newest", label: "Newest model year" },
    { value: "oldest", label: "Oldest model year" },
  ],
  jobsOrder: [
    { value: "recent", label: "Recently updated" },
    { value: "oldest", label: "Least recently updated" },
    { value: "title", label: "Title (A to Z)" },
  ],
  galleryOrder: [
    { value: "oldest", label: "Oldest first" },
    { value: "newest", label: "Newest first" },
  ],
} as const;

type Choice = keyof typeof preferenceOptions;

export type Preferences = {
  [Name in Choice]: (typeof preferenceOptions)[Name][number]["value"];
} & { showArchived: boolean };

export const defaultPreferences: Preferences = {
  theme: "dark",
  motion: "system",
  home: "/",
  fleetOrder: "name",
  jobsOrder: "recent",
  galleryOrder: "oldest",
  showArchived: false,
};

function readChoice<Value extends string>(
  options: readonly { value: Value }[],
  input: unknown,
  fallback: Value,
): Value {
  return options.find((option) => option.value === input)?.value ?? fallback;
}

export function normalizePreferences(input: unknown): Preferences {
  const values = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  return {
    theme: readChoice(preferenceOptions.theme, values.theme, defaultPreferences.theme),
    motion: readChoice(preferenceOptions.motion, values.motion, defaultPreferences.motion),
    home: readChoice(preferenceOptions.home, values.home, defaultPreferences.home),
    fleetOrder: readChoice(preferenceOptions.fleetOrder, values.fleetOrder, defaultPreferences.fleetOrder),
    jobsOrder: readChoice(preferenceOptions.jobsOrder, values.jobsOrder, defaultPreferences.jobsOrder),
    galleryOrder: readChoice(preferenceOptions.galleryOrder, values.galleryOrder, defaultPreferences.galleryOrder),
    showArchived: values.showArchived === true,
  };
}

export function parsePreferences(value: string | undefined): Preferences {
  try {
    return normalizePreferences(value ? JSON.parse(value) : null);
  } catch {
    return defaultPreferences;
  }
}

