import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

// GET /api/bookings/[id]/folio
// Returns all folio lines + totals for a booking.
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

    // Verify ownership
    const owns = await pool
      .request()
      .input("id",       sql.Int, bookingId)
      .input("hotel_id", sql.Int, session.hotelId)
      .query("SELECT id FROM bookings WHERE id = @id AND hotel_id = @hotel_id");
    if (owns.recordset.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Load folio lines (graceful if table doesn't exist yet)
    let lines: {
      id: number;
      line_type: string;
      description: string;
      quantity: number;
      unit_price: number;
      total_amount: number;
      is_credit: boolean;
      created_at: string;
    }[] = [];

    try {
      const result = await pool
        .request()
        .input("booking_id", sql.Int, bookingId)
        .input("hotel_id",   sql.Int, session.hotelId)
        .query(`
          SELECT id, line_type, description, quantity, unit_price, total_amount,
                 is_credit, FORMAT(created_at, 'dd-MM-yyyy HH:mm') AS created_at
          FROM folio_lines
          WHERE booking_id = @booking_id AND hotel_id = @hotel_id
          ORDER BY created_at ASC
        `);
      lines = result.recordset;
    } catch { /* folio_lines table not yet created */ }

    const totalCharges = lines
      .filter((l) => !l.is_credit)
      .reduce((s, l) => s + parseFloat(String(l.total_amount)), 0);

    const totalCredits = lines
      .filter((l) => l.is_credit)
      .reduce((s, l) => s + parseFloat(String(l.total_amount)), 0);

    // Also pull total paid from payments table as backup
    const paidResult = await pool
      .request()
      .input("booking_id", sql.Int, bookingId)
      .query("SELECT ISNULL(SUM(amount),0) AS paid FROM payments WHERE booking_id = @booking_id");
    const totalPaid = parseFloat(paidResult.recordset[0]?.paid ?? 0);

    return NextResponse.json({
      lines,
      totalCharges:  parseFloat(totalCharges.toFixed(2)),
      totalCredits:  parseFloat(totalCredits.toFixed(2)),
      totalPaid:     parseFloat(totalPaid.toFixed(2)),
      balance:       parseFloat((totalCharges - totalCredits).toFixed(2)),
    });
  } catch (err) {
    console.error("Folio GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/bookings/[id]/folio
// Add a manual folio charge or credit.
// Body: { line_type, description, quantity, unit_price, total_amount, is_credit }
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
    const {
      line_type = "Other",
      description = "",
      quantity  = 1,
      unit_price  = 0,
      total_amount,
      is_credit = false,
    } = body;

    const total = total_amount ?? parseFloat(String(quantity)) * parseFloat(String(unit_price));

    const pool = await getDB();

    const owns = await pool
      .request()
      .input("id",       sql.Int, bookingId)
      .input("hotel_id", sql.Int, session.hotelId)
      .query("SELECT id FROM bookings WHERE id = @id AND hotel_id = @hotel_id");
    if (owns.recordset.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const result = await pool
      .request()
      .input("hotel_id",    sql.Int,          session.hotelId)
      .input("booking_id",  sql.Int,          bookingId)
      .input("line_type",   sql.NVarChar(50),  line_type)
      .input("description", sql.NVarChar(200), description)
      .input("quantity",    sql.Decimal(10,2), quantity)
      .input("unit_price",  sql.Decimal(10,2), unit_price)
      .input("total",       sql.Decimal(10,2), total)
      .input("is_credit",   sql.Bit,           is_credit ? 1 : 0)
      .input("by",          sql.Int,           session.userId)
      .query(`
        INSERT INTO folio_lines
          (hotel_id, booking_id, line_type, description, quantity, unit_price, total_amount, is_credit, created_by)
        OUTPUT INSERTED.id
        VALUES
          (@hotel_id, @booking_id, @line_type, @description, @quantity, @unit_price, @total, @is_credit, @by)
      `);

    return NextResponse.json({ success: true, id: result.recordset[0].id }, { status: 201 });
  } catch (err) {
    console.error("Folio POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
