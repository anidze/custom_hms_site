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

// Self-healing DDL: card_holds tracks the lifecycle of a pre-authorization
// (hold) on a guest's card. A real integration would call out to a payment
// gateway (TBC, BoG, Stripe) — for now we model the workflow only.
export async function ensureHoldsTable(pool: sql.ConnectionPool) {
  await pool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'card_holds')
    CREATE TABLE [dbo].[card_holds] (
      [id] INT IDENTITY(1,1) PRIMARY KEY,
      [hotel_id] INT NOT NULL,
      [booking_id] INT NOT NULL,
      [amount] DECIMAL(10,2) NOT NULL,
      [currency] NVARCHAR(3) NOT NULL DEFAULT 'GEL',
      [status] NVARCHAR(20) NOT NULL DEFAULT 'AUTHORIZED', -- AUTHORIZED | CAPTURED | RELEASED | EXPIRED
      [card_last4] NVARCHAR(4) NULL,
      [auth_code] NVARCHAR(50) NULL,
      [notes] NVARCHAR(500) NULL,
      [created_by] INT NULL,
      [created_at] DATETIME2 NOT NULL DEFAULT GETDATE(),
      [captured_at] DATETIME2 NULL,
      [released_at] DATETIME2 NULL,
      [expires_at] DATETIME2 NULL,
      [captured_payment_id] INT NULL,
      [actioned_by] INT NULL
    )
  `);
}

// GET /api/bookings/[id]/holds — list card holds for this booking
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const bookingId = parseInt(id);
    if (isNaN(bookingId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const pool = await getDB();
    await ensureHoldsTable(pool);

    const own = await pool.request()
      .input("id", sql.Int, bookingId)
      .input("hotel_id", sql.Int, session.hotelId)
      .query("SELECT id FROM bookings WHERE id = @id AND hotel_id = @hotel_id");
    if (own.recordset.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const r = await pool.request()
      .input("booking_id", sql.Int, bookingId)
      .input("hotel_id",   sql.Int, session.hotelId)
      .query(`
        SELECT h.id, h.amount, h.currency, h.status, h.card_last4, h.auth_code, h.notes,
               FORMAT(h.created_at,  'dd-MM-yyyy HH:mm') AS created_at,
               FORMAT(h.captured_at, 'dd-MM-yyyy HH:mm') AS captured_at,
               FORMAT(h.released_at, 'dd-MM-yyyy HH:mm') AS released_at,
               FORMAT(h.expires_at,  'dd-MM-yyyy HH:mm') AS expires_at,
               h.captured_payment_id,
               u.full_name AS staff_name
        FROM card_holds h
        LEFT JOIN users u ON u.id = h.created_by
        WHERE h.booking_id = @booking_id AND h.hotel_id = @hotel_id
        ORDER BY h.created_at DESC
      `);

    const holds = r.recordset;
    const activeAmount = holds
      .filter((h) => h.status === "AUTHORIZED")
      .reduce((s, h) => s + Number(h.amount), 0);

    return NextResponse.json({ holds, activeAmount });
  } catch (err) {
    console.error("Holds GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/bookings/[id]/holds — create a new card hold
// Body: { amount, currency?, card_last4?, auth_code?, notes?, expires_at? }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const bookingId = parseInt(id);
    if (isNaN(bookingId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    let body: {
      amount?: number; currency?: string; card_last4?: string;
      auth_code?: string; notes?: string; expires_at?: string;
    };
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

    const amount = Number(body.amount);
    if (!amount || amount <= 0)
      return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 });

    const pool = await getDB();
    await ensureHoldsTable(pool);

    const own = await pool.request()
      .input("id", sql.Int, bookingId)
      .input("hotel_id", sql.Int, session.hotelId)
      .query("SELECT id FROM bookings WHERE id = @id AND hotel_id = @hotel_id");
    if (own.recordset.length === 0)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const r = await pool.request()
      .input("hotel_id",   sql.Int,           session.hotelId)
      .input("booking_id", sql.Int,           bookingId)
      .input("amount",     sql.Decimal(10,2),  amount)
      .input("currency",   sql.NVarChar(3),    body.currency ?? "GEL")
      .input("card_last4", sql.NVarChar(4),    body.card_last4 ?? null)
      .input("auth_code",  sql.NVarChar(50),   body.auth_code  ?? null)
      .input("notes",      sql.NVarChar(500),  body.notes      ?? null)
      .input("expires_at", sql.DateTime2,      body.expires_at ? new Date(body.expires_at) : null)
      .input("created_by", sql.Int,            session.userId)
      .query(`
        INSERT INTO card_holds
          (hotel_id, booking_id, amount, currency, card_last4, auth_code, notes, expires_at, created_by, status)
        OUTPUT INSERTED.id
        VALUES
          (@hotel_id, @booking_id, @amount, @currency, @card_last4, @auth_code, @notes, @expires_at, @created_by, N'AUTHORIZED')
      `);

    return NextResponse.json({ success: true, id: r.recordset[0].id }, { status: 201 });
  } catch (err) {
    console.error("Holds POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
