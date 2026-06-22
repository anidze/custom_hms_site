import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getGateway } from "@/lib/gateway";

// GET /api/payments/gateway/status — active provider and configuration state
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("hms-session")?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const g = getGateway();
  return NextResponse.json({
    provider: g.name,
    configured: g.configured,
    isStub: g.name === "stub",
  });
}
