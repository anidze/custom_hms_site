import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

async function ensureHistoryTable(pool: sql.ConnectionPool) {
  await pool.request().query(`
    IF NOT EXISTS (
      SELECT 1 FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_NAME = 'booking_room_history'
    )
    CREATE TABLE booking_room_history (
      id                   INT IDENTITY(1,1) PRIMARY KEY,
      booking_id           INT           NOT NULL,
      previous_room_id     INT           NULL,
      new_room_id          INT           NOT NULL,
      previous_room_number NVARCHAR(50)  NULL,
      new_room_number      NVARCHAR(50)  NOT NULL,
      changed_at           DATETIME2     NOT NULL DEFAULT GETDATE(),
      notes                NVARCHAR(500) NULL
    )
  `);
}

// GET /api/bookings/[id]/change-room  →  room change history
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
    await ensureHistoryTable(pool);

    const owns = await pool
      .request()
      .input("id", sql.Int, bookingId)
      .input("hotel_id", sql.Int, session.hotelId)
      .query("SELECT id FROM bookings WHERE id = @id AND hotel_id = @hotel_id");
    if (owns.recordset.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const result = await pool
      .request()
      .input("booking_id", sql.Int, bookingId)
      .query(`
        SELECT
          id,
          previous_room_number  AS previousRoomNumber,
          new_room_number       AS newRoomNumber,
          FORMAT(changed_at, 'yyyy-MM-dd HH:mm') AS changedAt,
          notes
        FROM booking_room_history
        WHERE booking_id = @booking_id
        ORDER BY changed_at DESC
      `);

    return NextResponse.json(result.recordset);
  } catch (err) {
    console.error("Room history GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/bookings/[id]/change-room  body: { roomId: number, notes?: string }
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

    let body: { roomId?: number; notes?: string };
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }
    const { roomId, notes } = body;
    if (!roomId) return NextResponse.json({ error: "roomId is required" }, { status: 400 });

    const pool = await getDB();
    await ensureHistoryTable(pool);

    // Get current booking + verify ownership
    const bookingRes = await pool
      .request()
      .input("id", sql.Int, bookingId)
      .input("hotel_id", sql.Int, session.hotelId)
      .query(`
        SELECT b.id, b.room_id AS currentRoomId, r.room_number AS currentRoomNumber
        FROM bookings b
        LEFT JOIN rooms r ON r.id = b.room_id
        WHERE b.id = @id AND b.hotel_id = @hotel_id
      `);
    if (bookingRes.recordset.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { currentRoomId, currentRoomNumber } = bookingRes.recordset[0];

    // Verify new room belongs to this hotel
    const roomRes = await pool
      .request()
      .input("room_id", sql.Int, roomId)
      .input("hotel_id", sql.Int, session.hotelId)
      .query("SELECT id, room_number FROM rooms WHERE id = @room_id AND hotel_id = @hotel_id");
    if (roomRes.recordset.length === 0)
      return NextResponse.json({ error: "Room not found" }, { status: 400 });

    const newRoomNumber: string = roomRes.recordset[0].room_number;

    // Free the old room (if any, and if different)
    if (currentRoomId && currentRoomId !== roomId) {
      await pool
        .request()
        .input("id", sql.Int, currentRoomId)
        .query("UPDATE rooms SET is_available = 1 WHERE id = @id");
    }

    // Assign new room to booking
    await pool
      .request()
      .input("room_id", sql.Int, roomId)
      .input("id", sql.Int, bookingId)
      .query("UPDATE bookings SET room_id = @room_id WHERE id = @id");

    // Mark new room as occupied
    await pool
      .request()
      .input("id", sql.Int, roomId)
      .query("UPDATE rooms SET is_available = 0 WHERE id = @id");

    // Log history
    await pool
      .request()
      .input("booking_id", sql.Int, bookingId)
      .input("previous_room_id", sql.Int, currentRoomId ?? null)
      .input("new_room_id", sql.Int, roomId)
      .input("previous_room_number", sql.NVarChar(50), currentRoomNumber ?? null)
      .input("new_room_number", sql.NVarChar(50), newRoomNumber)
      .input("notes", sql.NVarChar(500), notes ?? null)
      .query(`
        INSERT INTO booking_room_history
          (booking_id, previous_room_id, new_room_id, previous_room_number, new_room_number, notes)
        VALUES
          (@booking_id, @previous_room_id, @new_room_id, @previous_room_number, @new_room_number, @notes)
      `);

    return NextResponse.json({ success: true, roomNumber: newRoomNumber, roomId });
  } catch (err) {
    console.error("Change room error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
