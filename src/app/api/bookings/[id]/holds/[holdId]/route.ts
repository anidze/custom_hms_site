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

// PATCH /api/bookings/[id]/holds/[holdId]
// Body: { action: 'capture' | 'release', amount?: number, notes?: string }
//   capture → mark hold CAPTURED, insert a matching reservation_payment
//   release → mark hold RELEASED (e.g. on cancel / no incidentals)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; holdId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, holdId } = await params;
    const bookingId = parseInt(id);
    const hId       = parseInt(holdId);
    if (isNaN(bookingId) || isNaN(hId))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    let body: { action?: string; amount?: number; notes?: string };
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

    const action = (body.action ?? "").toLowerCase();
    if (action !== "capture" && action !== "release")
      return NextResponse.json({ error: "action must be 'capture' or 'release'" }, { status: 400 });

    const pool = await getDB();

    // Load hold + verify ownership.
    const found = await pool.request()
      .input("id",         sql.Int, hId)
      .input("booking_id", sql.Int, bookingId)
      .input("hotel_id",   sql.Int, session.hotelId)
      .query(`
        SELECT id, amount, currency, status
        FROM card_holds
        WHERE id = @id AND booking_id = @booking_id AND hotel_id = @hotel_id
      `);
    if (found.recordset.length === 0)
      return NextResponse.json({ error: "Hold not found" }, { status: 404 });

    const hold = found.recordset[0];
    if (hold.status !== "AUTHORIZED")
      return NextResponse.json({ error: `Hold is ${hold.status}; only AUTHORIZED holds can be ${action}d` }, { status: 400 });

    if (action === "release") {
      await pool.request()
        .input("id",         sql.Int, hId)
        .input("actioned_by", sql.Int, session.userId)
        .input("notes",       sql.NVarChar(500), body.notes ?? null)
        .query(`
          UPDATE card_holds
          SET status = N'RELEASED', released_at = GETDATE(), actioned_by = @actioned_by,
              notes  = COALESCE(@notes, notes)
          WHERE id = @id
        `);
      return NextResponse.json({ success: true, status: "RELEASED" });
    }

    // capture: amount defaults to the full hold; capping at the held amount
    // (real gateways allow capturing less, never more).
    const captureAmount = body.amount != null ? Number(body.amount) : Number(hold.amount);
    if (!captureAmount || captureAmount <= 0)
      return NextResponse.json({ error: "Capture amount must be greater than zero" }, { status: 400 });
    if (captureAmount > Number(hold.amount))
      return NextResponse.json({ error: "Cannot capture more than the held amount" }, { status: 400 });

    // Insert a corresponding reservation_payment so the captured amount shows
    // up in folio/payment totals just like any other card payment.
    const pay = await pool.request()
      .input("hotel_id",   sql.Int,           session.hotelId)
      .input("booking_id", sql.Int,           bookingId)
      .input("amount",     sql.Decimal(12,2),  captureAmount)
      .input("currency",   sql.NVarChar(3),    hold.currency)
      .input("notes",      sql.NVarChar(500),  body.notes ?? `Captured from hold #${hId}`)
      .input("created_by", sql.Int,            session.userId)
      .query(`
        INSERT INTO reservation_payments
          (hotel_id, booking_id, amount, currency, payment_method, status, notes, created_by)
        OUTPUT INSERTED.id
        VALUES
          (@hotel_id, @booking_id, @amount, @currency, N'CARD', N'COMPLETED', @notes, @created_by)
      `);
    const paymentId: number = pay.recordset[0].id;

    await pool.request()
      .input("id",                  sql.Int, hId)
      .input("captured_payment_id", sql.Int, paymentId)
      .input("actioned_by",         sql.Int, session.userId)
      .query(`
        UPDATE card_holds
        SET status = N'CAPTURED', captured_at = GETDATE(),
            captured_payment_id = @captured_payment_id, actioned_by = @actioned_by
        WHERE id = @id
      `);

    return NextResponse.json({ success: true, status: "CAPTURED", paymentId, capturedAmount: captureAmount });
  } catch (err) {
    console.error("Hold PATCH error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
