import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

// GET /api/frontdesk/bookings?year=2026&month=4
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("hms-session")?.value;
    const session = token ? await verifySession(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const year  = parseInt(searchParams.get("year")  ?? String(new Date().getFullYear()));
    const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1)); // 1-based

    const pool = await getDB();

    // All rooms for this hotel (each becomes a Gantt row)
    const roomsResult = await pool
      .request()
      .input("hotel_id", sql.Int, session.hotelId)
      .query(`
        SELECT r.id, r.room_number, rt.name_eng AS room_type_name
        FROM rooms r
        LEFT JOIN room_type rt ON rt.id = r.room_type_id
        WHERE r.hotel_id = @hotel_id
        ORDER BY r.room_number ASC
      `);

    // Bookings that overlap with the requested month AND have a room assigned
    const bookingsResult = await pool
      .request()
      .input("hotel_id", sql.Int, session.hotelId)
      .input("year",  sql.Int, year)
      .input("month", sql.Int, month)
      .query(`
        SELECT
          b.id,
          b.room_id,
          g.full_name AS guest_name,
          CONVERT(varchar(10), b.check_in,  120) AS check_in,
          CONVERT(varchar(10), b.check_out, 120) AS check_out
        FROM bookings b
        JOIN guests g ON g.id = b.guest_id
        WHERE b.hotel_id = @hotel_id
          AND b.room_id IS NOT NULL
          AND b.check_in  < DATEADD(MONTH, 1, DATEFROMPARTS(@year, @month, 1))
          AND b.check_out > DATEFROMPARTS(@year, @month, 1)
        ORDER BY b.check_in ASC
      `);

    return NextResponse.json({
      rooms:    roomsResult.recordset,
      bookings: bookingsResult.recordset,
    });
  } catch (err) {
    console.error("Frontdesk bookings error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
