import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

// POST /api/bookings/[id]/assign-room  body: { roomId: number }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("hms-session")?.value;
    const session = token ? await verifySession(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const bookingId = parseInt(id);
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
    }

    const { roomId } = await req.json();
    if (!roomId) {
      return NextResponse.json({ error: "roomId is required" }, { status: 400 });
    }

    const pool = await getDB();

    // Verify booking belongs to this hotel
    const bookingCheck = await pool
      .request()
      .input("id", sql.Int, bookingId)
      .input("hotel_id", sql.Int, session.hotelId)
      .query("SELECT id FROM bookings WHERE id = @id AND hotel_id = @hotel_id");

    if (bookingCheck.recordset.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify room belongs to this hotel and is still available
    const roomCheck = await pool
      .request()
      .input("room_id", sql.Int, roomId)
      .input("hotel_id", sql.Int, session.hotelId)
      .query(
        "SELECT id FROM rooms WHERE id = @room_id AND hotel_id = @hotel_id AND is_available = 1"
      );

    if (roomCheck.recordset.length === 0) {
      return NextResponse.json({ error: "Room is not available" }, { status: 400 });
    }

    // Assign room to the booking
    await pool
      .request()
      .input("room_id", sql.Int, roomId)
      .input("id", sql.Int, bookingId)
      .query("UPDATE bookings SET room_id = @room_id WHERE id = @id");

    // Mark the room as occupied
    await pool
      .request()
      .input("id", sql.Int, roomId)
      .query("UPDATE rooms SET is_available = 0 WHERE id = @id");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Assign room error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
