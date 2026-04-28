import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

// GET /api/rooms/available?roomType=Double&checkIn=2026-04-28&checkOut=2026-04-30
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("hms-session")?.value;
    const session = token ? await verifySession(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roomType = searchParams.get("roomType");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");

    const pool = await getDB();
    const request = pool.request().input("hotel_id", sql.Int, session.hotelId);

    let query = `
      SELECT r.id, r.room_number, r.floor,
             rt.name_eng AS room_type_name,
             CAST(r.price_per_night AS DECIMAL(10,2)) AS price_per_night
      FROM rooms r
      LEFT JOIN room_type rt ON rt.id = r.room_type_id
      WHERE r.hotel_id = @hotel_id
        AND r.is_available = 1
    `;

    if (roomType) {
      query += " AND rt.name_eng = @room_type";
      request.input("room_type", sql.NVarChar(100), roomType);
    }

    if (checkIn && checkOut) {
      // Exclude rooms already booked for the requested period
      query += `
        AND r.id NOT IN (
          SELECT b.room_id FROM bookings b
          WHERE b.room_id IS NOT NULL
            AND b.hotel_id = @hotel_id
            AND b.check_in  < @check_out
            AND b.check_out > @check_in
        )
      `;
      request.input("check_in", sql.Date, checkIn);
      request.input("check_out", sql.Date, checkOut);
    }

    query += " ORDER BY r.room_number ASC";

    const result = await request.query(query);
    return NextResponse.json(result.recordset);
  } catch (err) {
    console.error("Available rooms error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
