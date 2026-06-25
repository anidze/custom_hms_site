import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "./locales";

export const LOCALE_COOKIE = "hms-locale";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value;
  return (LOCALES as readonly string[]).includes(raw ?? "")
    ? (raw as Locale)
    : DEFAULT_LOCALE;
}
