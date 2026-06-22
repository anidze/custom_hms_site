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

// Only super-admin (1) and hotel-admin (2) can issue refunds.
const REFUND_ROLES = new Set([1, 2]);

// POST /api/bookings/[id]/payments/[paymentId]/refund
// Body: { amount, reason? }
// Inserts a row in reservation_refunds and updates the parent payment status
// to PARTIAL_REFUND or REFUNDED depending on how much is left.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!REFUND_ROLES.has(session.roleId))
      return NextResponse.json({ error: "Manager approval required" }, { status: 403 });

    const { id, paymentId } = await params;
    const bookingId = parseInt(id);
    const pId       = parseInt(paymentId);
    if (isNaN(bookingId) || isNaN(pId))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    let body: { amount?: number; reason?: string };
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

    const refundAmount = Number(body.amount);
    if (!refundAmount || refundAmount <= 0)
      return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 });

    const pool = await getDB();

    // Load payment + sum of any prior refunds.
    const payRes = await pool.request()
      .input("id",         sql.Int, pId)
      .input("booking_id", sql.Int, bookingId)
      .input("hotel_id",   sql.Int, session.hotelId)
      .query(`
        SELECT rp.amount, rp.status, rp.currency,
               ISNULL((SELECT SUM(amount) FROM reservation_refunds rr
                       WHERE rr.payment_id = rp.id AND rr.status = 'COMPLETED'), 0) AS already_refunded
        FROM reservation_payments rp
        WHERE rp.id = @id AND rp.booking_id = @booking_id AND rp.hotel_id = @hotel_id
          AND rp.is_deleted = 0
      `);
    if (payRes.recordset.length === 0)
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    const pay = payRes.recordset[0];
    if (pay.status === "REFUNDED")
      return NextResponse.json({ error: "Payment is already fully refunded" }, { status: 400 });

    const remaining = Number(pay.amount) - Number(pay.already_refunded);
    if (refundAmount > remaining + 0.001)
      return NextResponse.json(
        { error: `Refund amount (${refundAmount.toFixed(2)}) exceeds remaining (${remaining.toFixed(2)})` },
        { status: 400 }
      );

    const tx = new sql.Transaction(pool);
    await tx.begin();
    try {
      const r = await new sql.Request(tx)
        .input("hotel_id",    sql.Int,           session.hotelId)
        .input("booking_id",  sql.Int,           bookingId)
        .input("payment_id",  sql.Int,           pId)
        .input("amount",      sql.Decimal(12,2),  refundAmount)
        .input("reason",      sql.NVarChar(300),  body.reason ?? null)
        .input("refunded_by", sql.Int,            session.userId)
        .query(`
          INSERT INTO reservation_refunds
            (hotel_id, booking_id, payment_id, amount, reason, status, refunded_by, refunded_at)
          OUTPUT INSERTED.id
          VALUES
            (@hotel_id, @booking_id, @payment_id, @amount, @reason, N'COMPLETED', @refunded_by, GETDATE())
        `);

      const fullyRefunded = refundAmount >= remaining - 0.001;
      const newStatus = fullyRefunded ? "REFUNDED" : "PARTIAL_REFUND";

      await new sql.Request(tx)
        .input("id",     sql.Int, pId)
        .input("status", sql.NVarChar(20), newStatus)
        .query("UPDATE reservation_payments SET status = @status, updated_at = GETDATE() WHERE id = @id");

      await tx.commit();

      return NextResponse.json({
        success: true,
        refundId: r.recordset[0].id,
        paymentStatus: newStatus,
        refundedAmount: refundAmount,
      }, { status: 201 });
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  } catch (err) {
    console.error("Refund POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
