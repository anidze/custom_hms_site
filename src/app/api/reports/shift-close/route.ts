import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("hms-session")?.value;
  return token ? await verifySession(token) : null;
}

// GET /api/reports/shift-close?date=YYYY-MM-DD&user=N
// Daily totals of payments/refunds for the current hotel, optionally filtered
// by the cashier who recorded them. The date defaults to today.
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const date   = searchParams.get("date") ?? new Date().toISOString().split("T")[0];
    const userId = searchParams.get("user");
    const userFilter = userId ? parseInt(userId) : null;

    const pool = await getDB();

    // Payments grouped by method
    const payments = await pool.request()
      .input("hotel_id", sql.Int,     session.hotelId)
      .input("date",     sql.Date,    date)
      .input("user_id",  sql.Int,     userFilter)
      .query(`
        SELECT
          UPPER(ISNULL(payment_method, 'OTHER')) AS method,
          COUNT(*)                               AS count,
          ISNULL(SUM(amount), 0)                 AS total
        FROM reservation_payments
        WHERE hotel_id = @hotel_id
          AND is_deleted = 0
          AND status IN ('COMPLETED', 'PARTIAL_REFUND')
          AND CAST(created_at AS DATE) = @date
          AND (@user_id IS NULL OR created_by = @user_id)
        GROUP BY UPPER(ISNULL(payment_method, 'OTHER'))
        ORDER BY method
      `);

    // Refunds (always reduce the day's cash position)
    const refunds = await pool.request()
      .input("hotel_id", sql.Int,  session.hotelId)
      .input("date",     sql.Date, date)
      .input("user_id",  sql.Int,  userFilter)
      .query(`
        SELECT COUNT(*) AS count, ISNULL(SUM(amount), 0) AS total
        FROM reservation_refunds
        WHERE hotel_id = @hotel_id
          AND status = 'COMPLETED'
          AND CAST(refunded_at AS DATE) = @date
          AND (@user_id IS NULL OR refunded_by = @user_id)
      `);

    // Per-cashier breakdown (when not filtering by user — for the manager's view)
    let perCashier: { user_id: number; full_name: string | null; count: number; total: number }[] = [];
    if (!userFilter) {
      const r = await pool.request()
        .input("hotel_id", sql.Int,  session.hotelId)
        .input("date",     sql.Date, date)
        .query(`
          SELECT rp.created_by AS user_id, u.full_name,
                 COUNT(*) AS count, ISNULL(SUM(rp.amount), 0) AS total
          FROM reservation_payments rp
          LEFT JOIN users u ON u.id = rp.created_by
          WHERE rp.hotel_id = @hotel_id
            AND rp.is_deleted = 0
            AND rp.status IN ('COMPLETED', 'PARTIAL_REFUND')
            AND CAST(rp.created_at AS DATE) = @date
          GROUP BY rp.created_by, u.full_name
          ORDER BY total DESC
        `);
      perCashier = r.recordset.map((x) => ({
        user_id:  x.user_id,
        full_name: x.full_name,
        count:    x.count,
        total:    parseFloat(x.total),
      }));
    }

    const paymentRows = payments.recordset.map((p) => ({
      method: p.method,
      count:  p.count,
      total:  parseFloat(p.total),
    }));
    const totalIn  = paymentRows.reduce((s, p) => s + p.total, 0);
    const refundTotal = parseFloat(refunds.recordset[0].total);
    const refundCount = refunds.recordset[0].count;

    return NextResponse.json({
      date,
      user_id: userFilter,
      payments: paymentRows,
      totalIn,
      refundCount,
      refundTotal,
      netCash: parseFloat((totalIn - refundTotal).toFixed(2)),
      perCashier,
    });
  } catch (err) {
    console.error("Shift close error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
