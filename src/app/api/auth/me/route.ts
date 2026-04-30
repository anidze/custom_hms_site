import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("hms-session")?.value;
    const session = token ? await verifySession(token) : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ roleName: session.roleName, fullName: session.fullName, userId: session.userId });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
