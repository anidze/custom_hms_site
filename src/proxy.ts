import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";

// Routes that don't require authentication
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/hotels",
];

// Routes that logged-in users shouldn't visit
const AUTH_ONLY_PATHS = ["/login", "/register"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("hms-session")?.value;
  const session = token ? await verifySession(token) : null;

  // If logged in and trying to access login/register → redirect to dashboard
  if (session && AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If not logged in and trying to access protected route → redirect to login
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (!session && !isPublic) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    // Clear invalid/expired cookie if present
    if (token) response.cookies.delete("hms-session");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
