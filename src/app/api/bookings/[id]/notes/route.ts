import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

const NOTE_TYPES  = ["GENERAL", "PAYMENT", "HOUSEKEEPING", "RECEPTION", "MANAGEMENT", "SECURITY"];
const PRIORITIES  = ["LOW", "NORMAL", "HIGH", "URGENT"];

// GET /api/bookings/[id]/notes
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

    const owns = await pool.request()
      .input("id",       sql.Int, bookingId)
      .input("hotel_id", sql.Int, session.hotelId)
      .query("SELECT id FROM bookings WHERE id = @id AND hotel_id = @hotel_id");
    if (owns.recordset.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    let notes: unknown[] = [];
    try {
      const result = await pool.request()
        .input("booking_id", sql.Int, bookingId)
        .input("hotel_id",   sql.Int, session.hotelId)
        .query(`
          SELECT
            rn.id, rn.note_type, rn.body, rn.is_pinned, rn.is_private,
            rn.priority,
            FORMAT(rn.created_at, 'dd-MM-yyyy HH:mm') AS created_at,
            FORMAT(rn.updated_at, 'dd-MM-yyyy HH:mm') AS updated_at,
            rn.created_by,
            u.full_name AS staff_name
          FROM reservation_notes rn
          LEFT JOIN users u ON u.id = rn.created_by
          WHERE rn.booking_id = @booking_id
            AND rn.hotel_id   = @hotel_id
            AND rn.is_deleted = 0
          ORDER BY rn.is_pinned DESC, rn.created_at DESC
        `);
      notes = result.recordset;
    } catch { /* table not yet created */ }

    return NextResponse.json({ notes });
  } catch (err) {
    console.error("GET /notes error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/bookings/[id]/notes
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
      body: noteBody,
      note_type  = "GENERAL",
      priority   = "NORMAL",
      is_pinned  = false,
      is_private = false,
    } = body;

    if (!noteBody || typeof noteBody !== "string" || noteBody.trim().length === 0)
      return NextResponse.json({ error: "Note body required" }, { status: 400 });

    if (!NOTE_TYPES.includes(note_type))
      return NextResponse.json({ error: "Invalid note type" }, { status: 400 });

    if (!PRIORITIES.includes(priority))
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 });

    const pool = await getDB();

    const owns = await pool.request()
      .input("id",       sql.Int, bookingId)
      .input("hotel_id", sql.Int, session.hotelId)
      .query("SELECT id FROM bookings WHERE id = @id AND hotel_id = @hotel_id");
    if (owns.recordset.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Auto-provision table
    await pool.request().query(`
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'reservation_notes')
      CREATE TABLE reservation_notes (
        id INT IDENTITY(1,1) PRIMARY KEY,
        hotel_id INT NOT NULL, booking_id INT NOT NULL,
        note_type NVARCHAR(30) NOT NULL DEFAULT 'GENERAL',
        body NVARCHAR(MAX) NOT NULL,
        is_pinned BIT NOT NULL DEFAULT 0, is_private BIT NOT NULL DEFAULT 0,
        priority NVARCHAR(10) NOT NULL DEFAULT 'NORMAL',
        created_by INT NULL, updated_by INT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        is_deleted BIT NOT NULL DEFAULT 0
      )
    `);

    const result = await pool.request()
      .input("hotel_id",   sql.Int,             session.hotelId)
      .input("booking_id", sql.Int,             bookingId)
      .input("body",       sql.NVarChar(sql.MAX), noteBody.trim())
      .input("note_type",  sql.NVarChar(30),    note_type)
      .input("priority",   sql.NVarChar(10),    priority)
      .input("is_pinned",  sql.Bit,             is_pinned  ? 1 : 0)
      .input("is_private", sql.Bit,             is_private ? 1 : 0)
      .input("created_by", sql.Int,             session.userId)
      .query(`
        INSERT INTO reservation_notes
          (hotel_id, booking_id, body, note_type, priority, is_pinned, is_private, created_by)
        OUTPUT INSERTED.id,
               INSERTED.note_type, INSERTED.body, INSERTED.is_pinned,
               INSERTED.is_private, INSERTED.priority,
               FORMAT(INSERTED.created_at,'dd-MM-yyyy HH:mm') AS created_at
        VALUES
          (@hotel_id, @booking_id, @body, @note_type, @priority, @is_pinned, @is_private, @created_by)
      `);

    return NextResponse.json({ success: true, note: result.recordset[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /notes error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
