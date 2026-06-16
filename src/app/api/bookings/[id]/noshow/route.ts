import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

// POST /api/bookings/[id]/noshow
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

    // Verify ownership + load current status
    const bookingResult = await pool
      .request()
      .input("id",       sql.Int, bookingId)
      .input("hotel_id", sql.Int, session.hotelId)
      .query(`
        SELECT b.id, b.room_id, bs.name_eng AS status_name
        FROM bookings b
        JOIN booking_status bs ON bs.id = b.status_id
        WHERE b.id = @id AND b.hotel_id = @hotel_id
      `);
    if (bookingResult.recordset.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const booking   = bookingResult.recordset[0];
    const statusLow = (booking.status_name ?? "").toLowerCase();

    if (statusLow.includes("check") && statusLow.includes("in"))
      return NextResponse.json({ error: "Cannot mark as No Show: guest is already checked in." }, { status: 400 });
    if (statusLow.includes("check") && statusLow.includes("out"))
      return NextResponse.json({ error: "Cannot mark as No Show: booking is already checked out." }, { status: 400 });
    if (statusLow.includes("no") && statusLow.includes("show"))
      return NextResponse.json({ error: "Booking is already marked as No Show." }, { status: 400 });
    if (statusLow.includes("cancel"))
      return NextResponse.json({ error: "Cannot mark as No Show: booking is cancelled." }, { status: 400 });

    // Find No Show status
    const nsStatus = await pool.request().query(`
      SELECT TOP 1 id FROM booking_status
      WHERE is_active = 1
        AND (LOWER(name_eng) LIKE '%no%show%' OR LOWER(name_eng) = 'noshow')
      ORDER BY sort_order ASC
    `);
    if (nsStatus.recordset.length === 0)
      return NextResponse.json({ error: "No Show status not configured (run enterprise_v3_migration.sql)." }, { status: 500 });

    await pool.request()
      .input("status_id", sql.Int, nsStatus.recordset[0].id)
      .input("id",        sql.Int, bookingId)
      .query("UPDATE bookings SET status_id = @status_id WHERE id = @id");

    // Release the assigned room back to available if one was pre-assigned
    if (booking.room_id) {
      await pool.request()
        .input("room_id", sql.Int, booking.room_id)
        .query("UPDATE rooms SET is_available = 1 WHERE id = @room_id");
      try {
        await pool.request()
          .input("room_id", sql.Int, booking.room_id)
          .query("UPDATE rooms SET room_status = N'Vacant Clean' WHERE id = @room_id");
      } catch { /* column added by migration */ }
    }

    // Audit log
    try {
      await pool.request()
        .input("hotel_id",     sql.Int,          session.hotelId)
        .input("booking_id",   sql.Int,          bookingId)
        .input("action",       sql.NVarChar(100), "NO_SHOW")
        .input("performed_by", sql.Int,          session.userId)
        .input("details",      sql.NVarChar(sql.MAX), JSON.stringify({ previousStatus: booking.status_name }))
        .query(`
          INSERT INTO audit_logs (hotel_id, booking_id, action, performed_by, details)
          VALUES (@hotel_id, @booking_id, @action, @performed_by, @details)
        `);
    } catch { /* audit table added by migration */ }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("No-show error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
