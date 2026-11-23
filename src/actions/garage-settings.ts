// Garage Settings Action
// Handles the saving of garage settings based on the submitted form data.
"use server";

// IMPORTS
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { normalizeGarageOptions } from "@/lib/garage-options";
import { writeGarageSettings } from "@/lib/garage-settings";


// Save Garage Settings
// Processes the form data, normalizes the garage options, writes the settings, revalidates the relevant paths, and redirects to the settings page.
export async function saveGarageSettings(form: FormData) {
  writeGarageSettings(normalizeGarageOptions({
    ...Object.fromEntries(form),
    gallery: form.has("gallery"),
    jobs: form.has("jobs"),
    wiring: form.has("wiring"),
    homeStats: form.has("homeStats"),
  }));
  revalidatePath("/", "layout");
  redirect("/settings?updated=garage");
}
