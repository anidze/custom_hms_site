import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

// POST /api/bookings/[id]/checkout
// Body: { paymentAmount?, paymentMethod?, notes? }
export async function POST(
  req: NextRequest,
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

    let body: { paymentAmount?: number; paymentMethod?: string; notes?: string } = {};
    try { body = await req.json(); } catch { /* no body */ }

    const pool = await getDB();

    // ── 1. Load + validate booking ────────────────────────────────────────────
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

    if (statusLow.includes("check") && statusLow.includes("out"))
      return NextResponse.json({ error: "Booking is already checked out." }, { status: 400 });
    if (statusLow.includes("cancel"))
      return NextResponse.json({ error: "Cannot check-out a cancelled reservation." }, { status: 400 });

    // ── 2. Record final payment ───────────────────────────────────────────────
    if (body.paymentAmount && body.paymentAmount > 0) {
      try {
        await pool.request()
          .input("booking_id", sql.Int,          bookingId)
          .input("amount",     sql.Decimal(10,2), body.paymentAmount)
          .input("method",     sql.NVarChar(50),  body.paymentMethod ?? "Cash")
          .input("notes",      sql.NVarChar(500), body.notes ?? "Final payment at checkout")
          .query(`
            INSERT INTO payments (booking_id, amount, payment_method, paid_at, notes)
            VALUES (@booking_id, @amount, @method, GETDATE(), @notes)
          `);
      } catch {
        await pool.request()
          .input("booking_id", sql.Int,          bookingId)
          .input("amount",     sql.Decimal(10,2), body.paymentAmount)
          .query("INSERT INTO payments (booking_id, amount) VALUES (@booking_id, @amount)");
      }

      try {
        await pool.request()
          .input("hotel_id",   sql.Int,           session.hotelId)
          .input("booking_id", sql.Int,           bookingId)
          .input("amount",     sql.Decimal(10,2),  body.paymentAmount)
          .input("method",     sql.NVarChar(50),   body.paymentMethod ?? "Cash")
          .input("by",         sql.Int,            session.userId)
          .query(`
            INSERT INTO folio_lines
              (hotel_id, booking_id, line_type, description, quantity, unit_price, total_amount, is_credit, created_by)
            VALUES
              (@hotel_id, @booking_id, N'Payment',
               CONCAT(N'Payment received – ', @method), 1, @amount, @amount, 1, @by)
          `);
      } catch { /* folio table may not exist yet */ }
    }

    // ── 3. Set status → Checked-Out ───────────────────────────────────────────
    const coStatus = await pool.request().query(`
      SELECT TOP 1 id FROM booking_status
      WHERE is_active = 1
        AND (LOWER(name_eng) LIKE '%checked%out%'
          OR LOWER(name_eng) LIKE '%check-out%'
          OR LOWER(name_eng) LIKE '%checkout%')
      ORDER BY sort_order ASC
    `);
    if (coStatus.recordset.length === 0)
      return NextResponse.json({ error: "Check-out status not configured." }, { status: 500 });

    await pool.request()
      .input("status_id", sql.Int, coStatus.recordset[0].id)
      .input("id",        sql.Int, bookingId)
      .query("UPDATE bookings SET status_id = @status_id WHERE id = @id");

    // ── 4. Save actual_check_out ──────────────────────────────────────────────
    try {
      await pool.request()
        .input("id", sql.Int, bookingId)
        .query("UPDATE bookings SET actual_check_out = GETDATE() WHERE id = @id");
    } catch { /* column added by migration */ }

    // ── 5. Mark rooms Vacant Dirty + create housekeeping tasks ───────────────
    // Try junction table first, fall back to bookings.room_id if table doesn't exist yet
    let roomRows: { recordset: { room_id: number }[] } = { recordset: [] };
    try {
      roomRows = await pool
        .request()
        .input("id", sql.Int, bookingId)
        .query(`
          SELECT room_id FROM booking_rooms WHERE booking_id = @id
          UNION
          SELECT room_id FROM bookings WHERE id = @id AND room_id IS NOT NULL
        `);
    } catch {
      // booking_rooms table not yet created — use bookings.room_id only
      const fallback = await pool
        .request()
        .input("id", sql.Int, bookingId)
        .query(`SELECT room_id FROM bookings WHERE id = @id AND room_id IS NOT NULL`);
      roomRows = fallback;
    }

    for (const row of roomRows.recordset) {
      await pool.request()
        .input("room_id", sql.Int, row.room_id)
        .query("UPDATE rooms SET is_available = 0 WHERE id = @room_id");

      try {
        await pool.request()
          .input("room_id", sql.Int, row.room_id)
          .query("UPDATE rooms SET room_status = N'Vacant Dirty' WHERE id = @room_id");
      } catch { /* column added by migration */ }

      await pool.request()
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

    // ── 6. Audit log ──────────────────────────────────────────────────────────
    try {
      await pool.request()
        .input("hotel_id",     sql.Int,          session.hotelId)
        .input("booking_id",   sql.Int,          bookingId)
        .input("room_id",      sql.Int,          booking.room_id ?? null)
        .input("action",       sql.NVarChar(100), "CHECK_OUT")
        .input("performed_by", sql.Int,          session.userId)
        .input("details",      sql.NVarChar(sql.MAX), JSON.stringify({
          paymentAmount: body.paymentAmount ?? 0,
          paymentMethod: body.paymentMethod ?? null,
        }))
        .query(`
          INSERT INTO audit_logs (hotel_id, booking_id, room_id, action, performed_by, details)
          VALUES (@hotel_id, @booking_id, @room_id, @action, @performed_by, @details)
        `);
    } catch (ae) { console.warn("Audit log skipped:", ae); }

    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Check-out error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
