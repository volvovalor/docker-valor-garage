import { cookies } from "next/headers";
import { parsePreferences } from "./preferences";

export const preferencesCookie = "valor-garage-preferences";

export async function getPreferences() {
  return parsePreferences((await cookies()).get(preferencesCookie)?.value);
}

