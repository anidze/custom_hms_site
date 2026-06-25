import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { LOCALES } from "@/lib/i18n/locales";
import { LOCALE_COOKIE } from "@/lib/i18n/server";

// POST /api/locale  body: { locale: 'ka' | 'en' | 'ru' }
export async function POST(req: NextRequest) {
  let body: { locale?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const locale = body.locale;
  if (!locale || !(LOCALES as readonly string[]).includes(locale))
    return NextResponse.json({ error: "Unsupported locale" }, { status: 400 });

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
  return NextResponse.json({ success: true, locale });
}
