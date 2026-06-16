import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

// DELETE /api/bookings/[id]/payments/[paymentId]  — soft delete (admin/manager only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("hms-session")?.value;
    const session = token ? await verifySession(token) : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only roleId 1 (Super Admin) or 2 (Admin) can delete payments
    if (session.roleId !== 1 && session.roleId !== 2)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id, paymentId } = await params;
    const bookingId  = parseInt(id);
    const pId        = parseInt(paymentId);
    if (isNaN(bookingId) || isNaN(pId))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const pool = await getDB();

    const result = await pool.request()
      .input("id",         sql.Int, pId)
      .input("booking_id", sql.Int, bookingId)
      .input("hotel_id",   sql.Int, session.hotelId)
      .query(`
        UPDATE reservation_payments
        SET is_deleted = 1, updated_at = GETDATE()
        WHERE id = @id AND booking_id = @booking_id AND hotel_id = @hotel_id AND is_deleted = 0
      `);

    if (result.rowsAffected[0] === 0)
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /payments/[paymentId] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
