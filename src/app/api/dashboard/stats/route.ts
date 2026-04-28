import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const PAYMENT_COLORS: Record<string, string> = {
  Cash:          "#facc15",
  "Credit Card": "#a78bfa",
  Cheque:        "#4ade80",
  Paypal:        "#60a5fa",
  Other:         "#f87171",
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("hms-session")?.value;
    const session = token ? await verifySession(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pool = await getDB();

    // ── Today's booking stats ──────────────────────────────────────────────
    const todayResult = await pool
      .request()
      .input("hotel_id", sql.Int, session.hotelId)
      .query(`
        SELECT
          SUM(CASE WHEN check_in  = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) AS checkInToday,
          SUM(CASE WHEN check_out = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) AS checkOutToday,
          SUM(CASE WHEN CAST(created_at AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) AS bookingsToday,
          SUM(CASE WHEN check_in <= CAST(GETDATE() AS DATE)
                    AND check_out > CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) AS inHouse
        FROM bookings
        WHERE hotel_id = @hotel_id
      `);

    // ── Room status counts ─────────────────────────────────────────────────
    const roomResult = await pool
      .request()
      .input("hotel_id", sql.Int, session.hotelId)
      .query(`
        SELECT
          COUNT(*) AS totalRooms,
          SUM(CASE WHEN is_available = 1 THEN 1 ELSE 0 END) AS availableRooms,
          SUM(CASE WHEN is_available = 0 THEN 1 ELSE 0 END) AS occupiedRooms
        FROM rooms
        WHERE hotel_id = @hotel_id
      `);

    // ── Monthly booking counts (current year) ─────────────────────────────
    const year = new Date().getFullYear();
    const monthlyResult = await pool
      .request()
      .input("hotel_id", sql.Int, session.hotelId)
      .input("year", sql.Int, year)
      .query(`
        SELECT MONTH(check_in) AS month, COUNT(*) AS cnt
        FROM bookings
        WHERE hotel_id = @hotel_id AND YEAR(check_in) = @year
        GROUP BY MONTH(check_in)
        ORDER BY MONTH(check_in)
      `);

    // ── Payment method breakdown ───────────────────────────────────────────
    const paymentResult = await pool
      .request()
      .input("hotel_id", sql.Int, session.hotelId)
      .query(`
        SELECT ISNULL(requested_payment_method, 'Other') AS method, COUNT(*) AS cnt
        FROM bookings
        WHERE hotel_id = @hotel_id
        GROUP BY requested_payment_method
      `);

    // ── Build response ─────────────────────────────────────────────────────
    const today = todayResult.recordset[0] ?? {};
    const rooms = roomResult.recordset[0] ?? {};
    const totalRooms = rooms.totalRooms || 1;

    const monthMap: Record<number, number> = {};
    for (const row of monthlyResult.recordset) {
      monthMap[row.month] = row.cnt;
    }

    const monthlyOccupancy = MONTHS_SHORT.map((m, i) => ({
      month: m,
      count: monthMap[i + 1] ?? 0,
      occupancy: Math.min(100, Math.round(((monthMap[i + 1] ?? 0) / totalRooms) * 100)),
    }));

    const totalBookings = paymentResult.recordset.reduce(
      (s: number, r: { cnt: number }) => s + r.cnt,
      0
    ) || 1;

    const paymentMethods = paymentResult.recordset.map(
      (r: { method: string; cnt: number }) => ({
        name: r.method,
        value: Math.round((r.cnt / totalBookings) * 100),
        color: PAYMENT_COLORS[r.method] ?? "#94a3b8",
      })
    );

    return NextResponse.json({
      checkInToday:  today.checkInToday  ?? 0,
      checkOutToday: today.checkOutToday ?? 0,
      bookingsToday: today.bookingsToday ?? 0,
      inHouse:       today.inHouse       ?? 0,
      totalRooms:    rooms.totalRooms    ?? 0,
      availableRooms: rooms.availableRooms ?? 0,
      occupiedRooms:  rooms.occupiedRooms  ?? 0,
      monthlyOccupancy,
      paymentMethods,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
