// Preferences Action
// Handles the saving and resetting of user preferences based on the submitted form data.
"use server";

// IMPORTS
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { preferencesCookie } from "@/lib/browser-preferences";
import { normalizePreferences } from "@/lib/preferences";


// Save Preferences
// Processes the form data, normalizes the preferences, sets the cookie, and redirects to the settings page.
export async function savePreferences(formData: FormData) {
  const store = await cookies();
  if (formData.get("intent") === "reset") {
    store.delete(preferencesCookie);
    redirect("/settings?updated=reset");
  }

  const preferences = normalizePreferences({
    ...Object.fromEntries(formData),
    showArchived: formData.get("showArchived") === "on",
  });
  store.set(preferencesCookie, JSON.stringify(preferences), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect("/settings?updated=saved");
}
