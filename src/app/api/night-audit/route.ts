import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("hms-session")?.value;
  return token ? await verifySession(token) : null;
}

// Roles allowed to run night audit: super-admin (1), hotel-admin (2), receptionist (3)
const AUDIT_ROLES = new Set([1, 2, 3]);

// GET /api/night-audit — last run info for the current hotel
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const pool = await getDB();

    let lastRun: { run_at: string; details: string } | null = null;
    try {
      const r = await pool.request()
        .input("hotel_id", sql.Int, session.hotelId)
        .query(`
          SELECT TOP 1 FORMAT(created_at, 'dd-MM-yyyy HH:mm') AS run_at, details
          FROM audit_logs
          WHERE hotel_id = @hotel_id AND action = 'NIGHT_AUDIT'
          ORDER BY created_at DESC
        `);
      lastRun = r.recordset[0] ?? null;
    } catch { /* audit_logs may not exist on older schema */ }

    return NextResponse.json({ lastRun });
  } catch (err) {
    console.error("Night audit GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/night-audit — post per-night room charges for in-house bookings
export async function POST() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!AUDIT_ROLES.has(session.roleId))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const pool = await getDB();

    // Self-healing: track per-booking "audited up to" date so a re-run is idempotent.
    await pool.request().query(
      "IF COL_LENGTH('bookings', 'audited_through') IS NULL ALTER TABLE bookings ADD audited_through DATE NULL"
    );

    const today = new Date().toISOString().split("T")[0];

    // In-house bookings whose audit cursor is behind today.
    const candidates = await pool.request()
      .input("hotel_id", sql.Int, session.hotelId)
      .input("today",    sql.Date, today)
      .query(`
        SELECT
          b.id,
          CONVERT(varchar(10), b.check_in,  120) AS check_in,
          CONVERT(varchar(10), b.check_out, 120) AS check_out,
          CONVERT(varchar(10), b.audited_through, 120) AS audited_through,
          ISNULL(r.price_per_night, 0) AS rate,
          ISNULL(rt.name_eng, N'Room') AS room_type
        FROM bookings b
        JOIN booking_status bs ON bs.id = b.status_id
        LEFT JOIN rooms r      ON r.id  = b.room_id
        LEFT JOIN room_type rt ON rt.id = b.requested_room_type_id
        WHERE b.hotel_id = @hotel_id
          AND LOWER(bs.name_eng) LIKE '%checked%in%'
          AND b.check_in <= @today
          AND (b.audited_through IS NULL OR b.audited_through < @today)
      `);

    let processed = 0;
    let skippedLegacy = 0;
    let nightsCharged = 0;
    let totalAmount = 0;

    for (const b of candidates.recordset) {
      // Heuristic: if this booking already has a Room Charge with quantity > 1
      // (the legacy "all nights upfront" line from check-in) AND we've never
      // audited it before, treat the existing line as covering everything up to
      // today and just start tracking from here. This prevents double charging.
      if (b.audited_through === null) {
        const legacy = await pool.request()
          .input("booking_id", sql.Int, b.id)
          .query(
            "SELECT COUNT(*) AS cnt FROM folio_lines WHERE booking_id = @booking_id AND line_type LIKE N'Room%' AND quantity > 1"
          );
        if (legacy.recordset[0].cnt > 0) {
          await pool.request()
            .input("id", sql.Int, b.id)
            .input("today", sql.Date, today)
            .query("UPDATE bookings SET audited_through = @today WHERE id = @id");
          skippedLegacy++;
          continue;
        }
      }

      // Charge each night from (last-audit + 1) up to today, but never past check_out.
      const start = b.audited_through
        ? new Date(b.audited_through + "T00:00:00")
        : new Date(new Date(b.check_in + "T00:00:00").getTime() - 86400000); // day before check-in
      const checkOut = new Date(b.check_out + "T00:00:00");
      const todayD = new Date(today + "T00:00:00");
      const rate = parseFloat(b.rate) || 0;

      const cursor = new Date(start);
      cursor.setDate(cursor.getDate() + 1);

      while (cursor <= todayD && cursor < checkOut) {
        const nightISO = cursor.toISOString().split("T")[0];
        await pool.request()
          .input("hotel_id",   sql.Int,          session.hotelId)
          .input("booking_id", sql.Int,          b.id)
          .input("desc",       sql.NVarChar(200), `Room Charge — Night of ${nightISO} (${b.room_type})`)
          .input("rate",       sql.Decimal(10, 2), rate)
          .input("by",         sql.Int,           session.userId)
          .query(`
            INSERT INTO folio_lines (hotel_id, booking_id, line_type, description, quantity, unit_price, total_amount, is_credit, created_by)
            VALUES (@hotel_id, @booking_id, N'Room Charge', @desc, 1, @rate, @rate, 0, @by)
          `);
        nightsCharged++;
        totalAmount += rate;
        cursor.setDate(cursor.getDate() + 1);
      }

      await pool.request()
        .input("id", sql.Int, b.id)
        .input("today", sql.Date, today)
        .query("UPDATE bookings SET audited_through = @today WHERE id = @id");

      processed++;
    }

    const summary = {
      date: today,
      processed,
      skippedLegacy,
      nightsCharged,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    };

    // Audit trail
    try {
      await pool.request()
        .input("hotel_id",     sql.Int,           session.hotelId)
        .input("action",       sql.NVarChar(100), "NIGHT_AUDIT")
        .input("performed_by", sql.Int,           session.userId)
        .input("details",      sql.NVarChar(sql.MAX), JSON.stringify(summary))
        .query(`
          INSERT INTO audit_logs (hotel_id, action, performed_by, details)
          VALUES (@hotel_id, @action, @performed_by, @details)
        `);
    } catch { /* audit non-critical */ }

    return NextResponse.json({ success: true, ...summary });
  } catch (err) {
    console.error("Night audit POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
