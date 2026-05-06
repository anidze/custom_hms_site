import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

// POST /api/bookings/[id]/checkin
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

    // Parse optional body (guests + rooms)
    let body: { guestId?: number; guests?: { firstName: string; lastName: string; gender: string; phone: string; email: string; idType: string; idNumber: string }[]; rooms?: number[] } = {};
    try { body = await req.json(); } catch { /* no body */ }

    const pool = await getDB();

    const owns = await pool
      .request()
      .input("id", sql.Int, bookingId)
      .input("hotel_id", sql.Int, session.hotelId)
      .query("SELECT id FROM bookings WHERE id = @id AND hotel_id = @hotel_id");
    if (owns.recordset.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 1. Update guest information
    if (body.guestId && Array.isArray(body.guests) && body.guests.length > 0) {
      const primary = body.guests[0];
      await pool
        .request()
        .input("id", sql.Int, body.guestId)
        .input("full_name", sql.NVarChar(200), `${primary.firstName} ${primary.lastName}`.trim())
        .input("first_name", sql.NVarChar(100), primary.firstName || null)
        .input("last_name", sql.NVarChar(100), primary.lastName || null)
        .input("gender", sql.NVarChar(20), primary.gender || null)
        .input("phone", sql.NVarChar(50), primary.phone || null)
        .input("email", sql.NVarChar(200), primary.email || null)
        .input("id_type", sql.NVarChar(50), primary.idType || null)
        .input("id_number", sql.NVarChar(50), primary.idNumber || null)
        .query(`
          UPDATE guests SET
            full_name = @full_name, first_name = @first_name, last_name = @last_name,
            gender = @gender, phone = @phone, email = @email,
            id_type = @id_type, id_number = @id_number
          WHERE id = @id
        `);

      // Replace additional guests
      await pool.request().input("booking_id", sql.Int, bookingId)
        .query("DELETE FROM AdditionalGuests WHERE booking_id = @booking_id");

      for (let i = 1; i < body.guests.length; i++) {
        const g = body.guests[i];
        if (!g.firstName && !g.lastName) continue;
        await pool
          .request()
          .input("booking_id", sql.Int, bookingId)
          .input("first_name", sql.NVarChar(100), g.firstName || "")
          .input("last_name", sql.NVarChar(100), g.lastName || "")
          .input("gender", sql.NVarChar(20), g.gender || null)
          .input("phone", sql.NVarChar(50), g.phone || null)
          .input("email", sql.NVarChar(200), g.email || null)
          .input("id_type", sql.NVarChar(50), g.idType || null)
          .input("id_number", sql.NVarChar(50), g.idNumber || null)
          .query(`
            INSERT INTO AdditionalGuests (booking_id, first_name, last_name, gender, phone, email, id_type, id_number)
            VALUES (@booking_id, @first_name, @last_name, @gender, @phone, @email, @id_type, @id_number)
          `);
      }
    }

    // 2. Assign rooms
    if (Array.isArray(body.rooms) && body.rooms.length > 0) {
      const firstRoomId = body.rooms[0];

      // Update primary room on booking
      await pool
        .request()
        .input("id", sql.Int, bookingId)
        .input("room_id", sql.Int, firstRoomId)
        .query("UPDATE bookings SET room_id = @room_id WHERE id = @id");

      // Replace booking_rooms entries
      await pool.request().input("booking_id", sql.Int, bookingId)
        .query("DELETE FROM booking_rooms WHERE booking_id = @booking_id");

      for (const roomId of body.rooms) {
        await pool
          .request()
          .input("booking_id", sql.Int, bookingId)
          .input("room_id", sql.Int, roomId)
          .query("INSERT INTO booking_rooms (booking_id, room_id) VALUES (@booking_id, @room_id)");

        // Mark room as occupied
        await pool.request().input("room_id", sql.Int, roomId)
          .query("UPDATE rooms SET is_available = 0 WHERE id = @room_id");
      }
    } else {
      // No rooms provided — still mark existing room_id as occupied if set
      await pool
        .request()
        .input("id", sql.Int, bookingId)
        .query(`
          UPDATE rooms SET is_available = 0
          WHERE id = (SELECT room_id FROM bookings WHERE id = @id AND room_id IS NOT NULL)
        `);
    }

    // 3. Change booking status to Checked-In
    const statusResult = await pool.request().query(`
      SELECT TOP 1 id FROM booking_status
      WHERE is_active = 1
        AND (LOWER(name_eng) LIKE '%checked%in%'
          OR LOWER(name_eng) LIKE '%check-in%'
          OR LOWER(name_eng) LIKE '%checkin%')
      ORDER BY sort_order ASC
    `);
    if (statusResult.recordset.length === 0) {
      return NextResponse.json({ error: "Check-in status not configured" }, { status: 500 });
    }

    await pool
      .request()
      .input("status_id", sql.Int, statusResult.recordset[0].id)
      .input("id", sql.Int, bookingId)
      .query("UPDATE bookings SET status_id = @status_id WHERE id = @id");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Check-in error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
