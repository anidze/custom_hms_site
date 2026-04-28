import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

// Convert DD-MM-YYYY → YYYY-MM-DD
function parseDate(d: string): string {
  const parts = d.split("-");
  if (parts.length === 3 && parts[0].length === 2) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return d;
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("hms-session")?.value;
    const session = token ? await verifySession(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      firstName, lastName, gender, idType, idNumber, age,
      street1, street2, city, state, postal, country,
      countryCode, phone, email,
      checkIn, checkOut, timeH, timeM, ampm,
      roomType, adults, kids, rooms,
      guests, payment, specialRequest,
    } = body;

    if (!firstName || !checkIn || !checkOut) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const checkInDate = parseDate(checkIn);
    const checkOutDate = parseDate(checkOut);
    const arrivalTime = timeH && timeM ? `${timeH}:${timeM} ${ampm}` : null;
    const addressNotes = [street1, street2].filter(Boolean).join(", ") || null;

    const pool = await getDB();

    // 1. Insert guest
    const guestResult = await pool
      .request()
      .input("hotel_id", sql.Int, session.hotelId)
      .input("full_name", sql.NVarChar(200), `${firstName} ${lastName}`.trim())
      .input("first_name", sql.NVarChar(100), firstName || null)
      .input("last_name", sql.NVarChar(100), lastName || null)
      .input("gender", sql.NVarChar(20), gender || null)
      .input("age", sql.Int, age ? parseInt(age) : null)
      .input("id_type", sql.NVarChar(50), idType || null)
      .input("id_number", sql.NVarChar(50), idNumber || null)
      .input("phone", sql.NVarChar(50), phone ? `${countryCode}${phone}` : null)
      .input("email", sql.NVarChar(200), email || null)
      .input("city", sql.NVarChar(100), city || null)
      .input("state", sql.NVarChar(100), state || null)
      .input("country", sql.NVarChar(100), country || null)
      .input("zip_code", sql.NVarChar(20), postal || null)
      .input("notes", sql.NVarChar(2000), addressNotes)
      .query(`
        INSERT INTO guests
          (hotel_id, full_name, first_name, last_name, gender, age, id_type, id_number, phone, email, city, state, country, zip_code, notes)
        OUTPUT INSERTED.id
        VALUES
          (@hotel_id, @full_name, @first_name, @last_name, @gender, @age, @id_type, @id_number, @phone, @email, @city, @state, @country, @zip_code, @notes)
      `);

    const guestId: number = guestResult.recordset[0].id;

    // 2. Resolve room_type id
    let requestedRoomTypeId: number | null = null;
    if (roomType) {
      const rtResult = await pool
        .request()
        .input("name_eng", sql.NVarChar(100), roomType)
        .query("SELECT id FROM room_type WHERE name_eng = @name_eng AND is_active = 1");
      if (rtResult.recordset.length > 0) {
        requestedRoomTypeId = rtResult.recordset[0].id;
      }
    }

    // 3. Resolve default booking status
    const statusResult = await pool
      .request()
      .query("SELECT TOP 1 id FROM booking_status WHERE is_active = 1 ORDER BY sort_order ASC");
    if (statusResult.recordset.length === 0) {
      return NextResponse.json({ error: "No booking status configured" }, { status: 500 });
    }
    const statusId: number = statusResult.recordset[0].id;

    // 4. Insert booking
    const bookingResult = await pool
      .request()
      .input("hotel_id", sql.Int, session.hotelId)
      .input("guest_id", sql.Int, guestId)
      .input("status_id", sql.Int, statusId)
      .input("created_by", sql.Int, session.userId)
      .input("check_in", sql.Date, checkInDate)
      .input("check_out", sql.Date, checkOutDate)
      .input("guests_count", sql.TinyInt, parseInt(adults) || 1)
      .input("kids_count", sql.TinyInt, parseInt(kids) || 0)
      .input("rooms_count", sql.TinyInt, parseInt(rooms) || 1)
      .input("total_price", sql.Decimal(10, 2), 0)
      .input("arrival_time", sql.NVarChar(20), arrivalTime)
      .input("requested_room_type_id", sql.Int, requestedRoomTypeId)
      .input("requested_payment_method", sql.NVarChar(50), payment || null)
      .input("special_request", sql.NVarChar(sql.MAX), specialRequest || null)
      .query(`
        INSERT INTO bookings
          (hotel_id, guest_id, status_id, created_by, check_in, check_out,
           guests_count, kids_count, rooms_count, total_price, arrival_time,
           requested_room_type_id, requested_payment_method, special_request)
        OUTPUT INSERTED.id
        VALUES
          (@hotel_id, @guest_id, @status_id, @created_by, @check_in, @check_out,
           @guests_count, @kids_count, @rooms_count, @total_price, @arrival_time,
           @requested_room_type_id, @requested_payment_method, @special_request)
      `);

    const bookingId: number = bookingResult.recordset[0].id;

    // 5. Insert additional guests
    if (Array.isArray(guests)) {
      for (const g of guests) {
        if (!g.firstName && !g.lastName) continue;
        await pool
          .request()
          .input("booking_id", sql.Int, bookingId)
          .input("first_name", sql.NVarChar(100), g.firstName || "")
          .input("last_name", sql.NVarChar(100), g.lastName || "")
          .input("gender", sql.NVarChar(20), g.gender || null)
          .input("age", sql.Int, g.age ? parseInt(g.age) : null)
          .query(`
            INSERT INTO AdditionalGuests (booking_id, first_name, last_name, gender, age)
            VALUES (@booking_id, @first_name, @last_name, @gender, @age)
          `);
      }
    }

    return NextResponse.json({ success: true, bookingId }, { status: 201 });
  } catch (err) {
    console.error("Booking POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
