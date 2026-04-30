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

    // Room stays is_available = 0 (pending housekeeping clean).
    // Housekeeping marks it clean → is_available = 1 → returns to available inventory.

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Check-out error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
