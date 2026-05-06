import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

// POST /api/bookings/[id]/checkout
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("hms-session")?.value;
    const session = token ? await verifySession(token) : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const bookingId = parseInt(id);
    if (isNaN(bookingId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const pool = await getDB();

    const booking = await pool
      .request()
      .input("id", sql.Int, bookingId)
      .input("hotel_id", sql.Int, session.hotelId)
      .query("SELECT id, room_id FROM bookings WHERE id = @id AND hotel_id = @hotel_id");
    if (booking.recordset.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Locate "Checked-Out" status by name
    const statusResult = await pool.request().query(`
      SELECT TOP 1 id FROM booking_status
      WHERE is_active = 1
        AND (LOWER(name_eng) LIKE '%checked%out%'
          OR LOWER(name_eng) LIKE '%check-out%'
          OR LOWER(name_eng) LIKE '%checkout%')
      ORDER BY sort_order ASC
    `);
    if (statusResult.recordset.length === 0) {
      return NextResponse.json({ error: "Check-out status not configured" }, { status: 500 });
    }

    await pool
      .request()
      .input("status_id", sql.Int, statusResult.recordset[0].id)
      .input("id", sql.Int, bookingId)
      .query("UPDATE bookings SET status_id = @status_id WHERE id = @id");

    // Mark all rooms for this booking as DIRTY in housekeeping.
    // is_available stays 0 until housekeeping marks them CLEAN.
    const roomRows = await pool
      .request()
      .input("id", sql.Int, bookingId)
      .query(
        `SELECT room_id FROM booking_rooms WHERE booking_id = @id
         UNION
         SELECT room_id FROM bookings WHERE id = @id AND room_id IS NOT NULL`
      );

    for (const row of roomRows.recordset) {
      await pool
        .request()
        .input("hotel_id",   sql.Int, session.hotelId)
        .input("room_id",    sql.Int, row.room_id)
        .input("updated_by", sql.Int, session.userId)
        .query(`
          MERGE housekeeping AS target
          USING (SELECT @hotel_id AS hotel_id, @room_id AS room_id) AS source
          ON target.hotel_id = source.hotel_id AND target.room_id = source.room_id
          WHEN MATCHED THEN
            UPDATE SET status = N'DIRTY', updated_by = @updated_by, updated_at = GETDATE()
          WHEN NOT MATCHED THEN
            INSERT (hotel_id, room_id, status, updated_by)
            VALUES (@hotel_id, @room_id, N'DIRTY', @updated_by);
        `);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Check-out error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
