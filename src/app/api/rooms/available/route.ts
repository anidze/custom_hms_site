import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

// GET /api/rooms/available?roomType=Double&checkIn=2026-04-28&checkOut=2026-04-30
//                          &excludeBookingId=42&includeRoomId=15
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("hms-session")?.value;
    const session = token ? await verifySession(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roomType         = searchParams.get("roomType");
    const checkIn          = searchParams.get("checkIn");
    const checkOut         = searchParams.get("checkOut");
    const excludeBookingId = searchParams.get("excludeBookingId");
    const includeRoomId    = searchParams.get("includeRoomId");

    const pool    = await getDB();
    const request = pool.request().input("hotel_id", sql.Int, session.hotelId);

    // Base: available + clean rooms, OR the explicitly included room
    let query = `
      SELECT r.id, r.room_number, r.floor,
             rt.name_eng AS room_type_name,
             CAST(r.price_per_night AS DECIMAL(10,2)) AS price_per_night,
             ISNULL(r.room_status, N'Vacant Clean') AS room_status
      FROM rooms r
      LEFT JOIN room_type    rt ON rt.id = r.room_type_id
      LEFT JOIN housekeeping hk ON hk.room_id = r.id AND hk.hotel_id = r.hotel_id
      WHERE r.hotel_id = @hotel_id
        AND (
          (r.is_available = 1
           AND ISNULL(hk.status, N'CLEAN') NOT IN (N'DIRTY', N'OUT OF SERVICE')
           AND ISNULL(r.room_status, N'Vacant Clean') NOT IN (N'Out Of Order')
          )
    `;

    if (includeRoomId) {
      request.input("include_room_id", sql.Int, parseInt(includeRoomId));
      query += " OR r.id = @include_room_id";
    }
    query += " )";

    if (roomType) {
      query += " AND (rt.name_eng = @room_type OR @room_type = N'')";
      request.input("room_type", sql.NVarChar(100), roomType);
    }

    if (checkIn && checkOut) {
      request.input("check_in",  sql.Date, checkIn);
      request.input("check_out", sql.Date, checkOut);

      const excludeClause = excludeBookingId
        ? `AND b.id != @exclude_booking_id`
        : "";

      if (excludeBookingId) {
        request.input("exclude_booking_id", sql.Int, parseInt(excludeBookingId));
      }

      // Exclude rooms overlapping this period (from both booking_rooms and bookings.room_id)
      query += `
        AND r.id NOT IN (
          SELECT DISTINCT br.room_id
          FROM booking_rooms br
          JOIN bookings b ON b.id = br.booking_id
          WHERE b.hotel_id  = @hotel_id
            AND b.check_in  < @check_out
            AND b.check_out > @check_in
            ${excludeClause}
          UNION
          SELECT b.room_id
          FROM bookings b
          WHERE b.room_id IS NOT NULL
            AND b.hotel_id  = @hotel_id
            AND b.check_in  < @check_out
            AND b.check_out > @check_in
            ${excludeClause}
        )
      `;
    }

    query += " ORDER BY r.floor ASC, r.room_number ASC";

    const result = await request.query(query);
    return NextResponse.json(result.recordset);
  } catch (err) {
    console.error("Available rooms error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
