import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("hms-session")?.value;
    const session = token ? await verifySession(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rooms = await prisma.rooms.findMany({
      where: { hotel_id: session.hotelId },
      select: {
        id: true,
        room_number: true,
        floor: true,
        room_type: {
          select: { name_eng: true },
        },
      },
      orderBy: { room_number: "asc" },
    });

    return NextResponse.json(rooms);
  } catch (err) {
    console.error("Rooms fetch error:", err);
    return NextResponse.json({ error: "სერვერის შეცდომა" }, { status: 500 });
  }
}
