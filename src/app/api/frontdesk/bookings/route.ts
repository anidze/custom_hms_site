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

    // Bookings that overlap with the requested month
    // Tries booking_rooms junction first, falls back to bookings.room_id
    const bookingsResult = await pool
      .request()
      .input("hotel_id", sql.Int, session.hotelId)
      .input("year",  sql.Int, year)
      .input("month", sql.Int, month)
      .query(`
        DECLARE @monthStart DATE = DATEFROMPARTS(@year, @month, 1);
        DECLARE @monthEnd   DATE = DATEADD(MONTH, 1, @monthStart);

        SELECT
          b.id,
          COALESCE(br.room_id, b.room_id) AS room_id,
          ISNULL(g.full_name, 'Guest #' + CAST(b.id AS VARCHAR)) AS guest_name,
          CONVERT(varchar(10), b.check_in,  120) AS check_in,
          CONVERT(varchar(10), b.check_out, 120) AS check_out,
          ISNULL(bs.name_eng,  'Pending')        AS booking_status,
          ISNULL(bs.color_hex, '#64748b')        AS status_color
        FROM bookings b
        LEFT JOIN guests g         ON g.id  = b.guest_id
        LEFT JOIN booking_status bs ON bs.id = b.status_id
        LEFT JOIN (
          SELECT booking_id, MIN(room_id) AS room_id
          FROM booking_rooms
          GROUP BY booking_id
        ) br ON br.booking_id = b.id
        WHERE b.hotel_id = @hotel_id
          AND COALESCE(br.room_id, b.room_id) IS NOT NULL
          AND b.check_in  < @monthEnd
          AND b.check_out > @monthStart
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
