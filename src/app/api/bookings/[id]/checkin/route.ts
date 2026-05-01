import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

// POST /api/bookings/[id]/checkin
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

    const owns = await pool
      .request()
      .input("id", sql.Int, bookingId)
      .input("hotel_id", sql.Int, session.hotelId)
      .query("SELECT id FROM bookings WHERE id = @id AND hotel_id = @hotel_id");
    if (owns.recordset.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Locate "Checked-In" status by name
    const statusResult = await pool.request().query(`
      SELECT TOP 1 id FROM booking_status
      WHERE is_active = 1
        AND (LOWER(name_eng) LIKE '%checked%in%'
          OR LOWER(name_eng) LIKE '%check-in%'
          OR LOWER(name_eng) LIKE '%checkin%')
      ORDER BY sort_order ASC
    `);
    if (statusResult.recordset.length === 0) {
      return NextResponse.json({ error: "Check-in status not configured" }, { status: 500 });
    }

    await pool
      .request()
      .input("status_id", sql.Int, statusResult.recordset[0].id)
      .input("id", sql.Int, bookingId)
      .query("UPDATE bookings SET status_id = @status_id WHERE id = @id");

    // Mark room as occupied
    await pool
      .request()
      .input("id", sql.Int, bookingId)
      .query(`
        UPDATE rooms
        SET is_available = 0
        WHERE id = (SELECT room_id FROM bookings WHERE id = @id AND room_id IS NOT NULL)
      `);

    // Set housekeeping status to DIRTY on check-in
    await pool
      .request()
      .input("id",         sql.Int,        bookingId)
      .input("hotel_id",   sql.Int,        session.hotelId)
      .input("updated_by", sql.Int,        session.userId)
      .query(`
        MERGE housekeeping AS target
        USING (
          SELECT room_id, @hotel_id AS hotel_id
          FROM bookings
          WHERE id = @id AND room_id IS NOT NULL
        ) AS source
        ON target.room_id = source.room_id AND target.hotel_id = source.hotel_id
        WHEN MATCHED THEN
          UPDATE SET status = N'DIRTY', updated_by = @updated_by, updated_at = GETDATE()
        WHEN NOT MATCHED THEN
          INSERT (hotel_id, room_id, status, updated_by)
          VALUES (source.hotel_id, source.room_id, N'DIRTY', @updated_by);
      `);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Check-in error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
