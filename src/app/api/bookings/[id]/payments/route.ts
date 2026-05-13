import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

// GET /api/bookings/[id]/payments  — list payments + summary
export async function GET(
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

    // Verify hotel ownership
    const owns = await pool.request()
      .input("id",       sql.Int, bookingId)
      .input("hotel_id", sql.Int, session.hotelId)
      .query("SELECT id, total_price FROM bookings WHERE id = @id AND hotel_id = @hotel_id");
    if (owns.recordset.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const totalPrice: number = owns.recordset[0].total_price ?? 0;

    // Payments
    let payments: unknown[] = [];
    let refunds: unknown[] = [];
    try {
      const pResult = await pool.request()
        .input("booking_id", sql.Int, bookingId)
        .input("hotel_id",   sql.Int, session.hotelId)
        .query(`
          SELECT
            rp.id, rp.amount, rp.currency, rp.payment_method,
            rp.status, rp.transaction_ref, rp.approval_code,
            rp.notes, rp.created_by,
            FORMAT(rp.created_at, 'dd-MM-yyyy HH:mm') AS created_at,
            u.full_name AS staff_name
          FROM reservation_payments rp
          LEFT JOIN users u ON u.id = rp.created_by
          WHERE rp.booking_id = @booking_id
            AND rp.hotel_id   = @hotel_id
            AND rp.is_deleted = 0
          ORDER BY rp.created_at DESC
        `);
      payments = pResult.recordset;

      const rResult = await pool.request()
        .input("booking_id", sql.Int, bookingId)
        .query(`
          SELECT
            rr.id, rr.payment_id, rr.amount, rr.reason, rr.status,
            FORMAT(rr.refunded_at, 'dd-MM-yyyy HH:mm') AS refunded_at,
            u.full_name AS staff_name
          FROM reservation_refunds rr
          LEFT JOIN users u ON u.id = rr.refunded_by
          WHERE rr.booking_id = @booking_id
          ORDER BY rr.refunded_at DESC
        `);
      refunds = rResult.recordset;
    } catch { /* tables not yet created */ }

    const paidAmount = (payments as { status: string; amount: number }[])
      .filter((p) => p.status === "COMPLETED" || p.status === "PARTIAL_REFUND")
      .reduce((s, p) => s + Number(p.amount), 0);

    const refundedAmount = (refunds as { status: string; amount: number }[])
      .filter((r) => r.status === "COMPLETED")
      .reduce((s, r) => s + Number(r.amount), 0);

    const balance = totalPrice - paidAmount + refundedAmount;

    let paymentStatus = "PENDING";
    if (paidAmount <= 0)             paymentStatus = "PENDING";
    else if (balance <= 0)           paymentStatus = "PAID";
    else                             paymentStatus = "PARTIAL";

    return NextResponse.json({
      totalPrice,
      paidAmount,
      refundedAmount,
      balance,
      paymentStatus,
      payments,
      refunds,
    });
  } catch (err) {
    console.error("GET /payments error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/bookings/[id]/payments  — add a payment
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

    const body = await req.json();
    const { amount, payment_method, transaction_ref, approval_code, notes, currency = "GEL" } = body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    const ALLOWED_METHODS = ["CASH", "CARD", "BANK", "ONLINE", "OTHER"];
    if (!ALLOWED_METHODS.includes(payment_method))
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });

    const ALLOWED_CURRENCIES = ["GEL", "USD", "EUR"];
    if (!ALLOWED_CURRENCIES.includes(currency))
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });

    const pool = await getDB();

    const owns = await pool.request()
      .input("id",       sql.Int, bookingId)
      .input("hotel_id", sql.Int, session.hotelId)
      .query("SELECT id FROM bookings WHERE id = @id AND hotel_id = @hotel_id");
    if (owns.recordset.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Ensure table exists (auto-provision on first use)
    await pool.request().query(`
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'reservation_payments')
      CREATE TABLE reservation_payments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        hotel_id INT NOT NULL, booking_id INT NOT NULL,
        amount DECIMAL(12,2) NOT NULL, currency NVARCHAR(3) NOT NULL DEFAULT 'GEL',
        payment_method NVARCHAR(30) NOT NULL, status NVARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
        transaction_ref NVARCHAR(100) NULL, approval_code NVARCHAR(50) NULL,
        gateway_response NVARCHAR(MAX) NULL, notes NVARCHAR(500) NULL,
        created_by INT NULL, created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(), is_deleted BIT NOT NULL DEFAULT 0
      )
    `);

    const result = await pool.request()
      .input("hotel_id",        sql.Int,          session.hotelId)
      .input("booking_id",      sql.Int,          bookingId)
      .input("amount",          sql.Decimal(12,2), Number(amount))
      .input("currency",        sql.NVarChar(3),  currency)
      .input("payment_method",  sql.NVarChar(30), payment_method)
      .input("transaction_ref", sql.NVarChar(100), transaction_ref || null)
      .input("approval_code",   sql.NVarChar(50),  approval_code  || null)
      .input("notes",           sql.NVarChar(500), notes          || null)
      .input("created_by",      sql.Int,           session.userId)
      .query(`
        INSERT INTO reservation_payments
          (hotel_id, booking_id, amount, currency, payment_method, status,
           transaction_ref, approval_code, notes, created_by)
        OUTPUT INSERTED.id, INSERTED.amount, INSERTED.status,
               FORMAT(INSERTED.created_at,'dd-MM-yyyy HH:mm') AS created_at
        VALUES
          (@hotel_id, @booking_id, @amount, @currency, @payment_method, 'COMPLETED',
           @transaction_ref, @approval_code, @notes, @created_by)
      `);

    // Audit
    try {
      await pool.request()
        .input("hotel_id",    sql.Int,          session.hotelId)
        .input("booking_id",  sql.Int,          bookingId)
        .input("entity_id",   sql.Int,          result.recordset[0].id)
        .input("new_value",   sql.NVarChar(sql.MAX), JSON.stringify({ amount, payment_method, currency }))
        .input("performed_by",sql.Int,          session.userId)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='payment_audit_log')
          CREATE TABLE payment_audit_log (
            id INT IDENTITY(1,1) PRIMARY KEY, hotel_id INT, booking_id INT,
            entity_type NVARCHAR(30), entity_id INT, action NVARCHAR(20),
            old_value NVARCHAR(MAX), new_value NVARCHAR(MAX),
            performed_by INT, performed_at DATETIME2 DEFAULT GETDATE()
          );
          INSERT INTO payment_audit_log (hotel_id,booking_id,entity_type,entity_id,action,new_value,performed_by)
          VALUES (@hotel_id,@booking_id,'PAYMENT',@entity_id,'CREATE',@new_value,@performed_by)
        `);
    } catch { /* audit non-critical */ }

    return NextResponse.json({ success: true, payment: result.recordset[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /payments error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
