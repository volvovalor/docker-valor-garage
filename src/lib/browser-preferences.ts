// BROWSER PREFERENCES
// Provides functions for reading and managing user preferences stored in browser cookies.

// IMPORTS
import { cookies } from "next/headers";
import { parsePreferences } from "./preferences";

// CONSTANTS
export const preferencesCookie = "valor-garage-preferences";


// Get Preferences
// Retrieves the user preferences from the browser cookies.
export async function getPreferences() {
  return parsePreferences((await cookies()).get(preferencesCookie)?.value);
}
