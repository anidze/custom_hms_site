import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("hms-session")?.value;
    const session = token ? await verifySession(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pool = await getDB();
    const result = await pool
      .request()
      .input("hotel_id", session.hotelId)
      .query(`
        SELECT r.id, r.room_number, r.floor, rt.name_eng AS room_type_name
        FROM rooms r
        LEFT JOIN room_type rt ON rt.id = r.room_type_id
        WHERE r.hotel_id = @hotel_id
        ORDER BY r.room_number ASC
      `);

    return NextResponse.json(result.recordset);
  } catch (err) {
    console.error("Rooms fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
