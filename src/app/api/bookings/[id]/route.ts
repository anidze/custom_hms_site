import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

// ── GET /api/bookings/[id] ─────────────────────────────────────────────────
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

    const result = await pool
      .request()
      .input("id", sql.Int, bookingId)
      .input("hotel_id", sql.Int, session.hotelId)
      .query(`
        SELECT
          b.id,
          CONVERT(varchar(10), b.check_in,  120) AS checkIn,
          CONVERT(varchar(10), b.check_out, 120) AS checkOut,
          b.arrival_time     AS arrivalTime,
          b.guests_count     AS adults,
          b.kids_count       AS kids,
          b.rooms_count      AS rooms,
          b.requested_payment_method AS payment,
          b.special_request  AS specialRequest,
          rt.name_eng        AS roomType,
          g.id               AS guestId,
          g.first_name       AS firstName,
          g.last_name        AS lastName,
          g.gender,
          g.age,
          g.id_type          AS idType,
          g.id_number        AS idNumber,
          g.phone,
          g.email,
          g.city,
          g.state,
          g.country,
          g.zip_code         AS postal,
          g.notes
        FROM bookings b
        JOIN  guests    g  ON g.id  = b.guest_id
        LEFT JOIN room_type rt ON rt.id = b.requested_room_type_id
        WHERE b.id = @id AND b.hotel_id = @hotel_id
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const booking = result.recordset[0];

    // Additional guests
    const addlResult = await pool
      .request()
      .input("booking_id", sql.Int, bookingId)
      .query(`
        SELECT first_name AS firstName, last_name AS lastName, gender, CAST(age AS varchar) AS age
        FROM AdditionalGuests
        WHERE booking_id = @booking_id
      `);

    booking.additionalGuests = addlResult.recordset;

    return NextResponse.json(booking);
  } catch (err) {
    console.error("Booking GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── PUT /api/bookings/[id] ─────────────────────────────────────────────────
export async function PUT(
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
      firstName, lastName, gender, idType, idNumber, age,
      street1, street2, city, state, postal, country,
      countryCode, phone, email,
      checkIn, checkOut, timeH, timeM, ampm,
      roomType, adults, kids, rooms,
      guests, payment, specialRequest,
      guestId,
    } = body;

    const pool = await getDB();

    // Verify ownership
    const owns = await pool
      .request()
      .input("id", sql.Int, bookingId)
      .input("hotel_id", sql.Int, session.hotelId)
      .query("SELECT id FROM bookings WHERE id = @id AND hotel_id = @hotel_id");
    if (owns.recordset.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const arrivalTime = timeH && timeM ? `${timeH}:${timeM} ${ampm}` : null;
    const addressNotes = [street1, street2].filter(Boolean).join(", ") || null;

    // Resolve room_type id
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

    // Update guest
    if (guestId) {
      await pool
        .request()
        .input("id", sql.Int, guestId)
        .input("full_name", sql.NVarChar(200), `${firstName} ${lastName}`.trim())
        .input("first_name", sql.NVarChar(100), firstName || null)
        .input("last_name", sql.NVarChar(100), lastName || null)
        .input("gender", sql.NVarChar(20), gender || null)
        .input("age", sql.Int, age ? parseInt(age) : null)
        .input("id_type", sql.NVarChar(50), idType || null)
        .input("id_number", sql.NVarChar(50), idNumber || null)
        .input("phone", sql.NVarChar(50), phone ? `${countryCode ?? ""}${phone}` : null)
        .input("email", sql.NVarChar(200), email || null)
        .input("city", sql.NVarChar(100), city || null)
        .input("state", sql.NVarChar(100), state || null)
        .input("country", sql.NVarChar(100), country || null)
        .input("zip_code", sql.NVarChar(20), postal || null)
        .input("notes", sql.NVarChar(2000), addressNotes)
        .query(`
          UPDATE guests SET
            full_name = @full_name, first_name = @first_name, last_name = @last_name,
            gender = @gender, age = @age, id_type = @id_type, id_number = @id_number,
            phone = @phone, email = @email, city = @city, state = @state,
            country = @country, zip_code = @zip_code, notes = @notes
          WHERE id = @id
        `);
    }

    // Update booking
    await pool
      .request()
      .input("id", sql.Int, bookingId)
      .input("check_in", sql.Date, checkIn)
      .input("check_out", sql.Date, checkOut)
      .input("guests_count", sql.TinyInt, parseInt(adults) || 1)
      .input("kids_count", sql.TinyInt, parseInt(kids) || 0)
      .input("rooms_count", sql.TinyInt, parseInt(rooms) || 1)
      .input("arrival_time", sql.NVarChar(20), arrivalTime)
      .input("requested_room_type_id", sql.Int, requestedRoomTypeId)
      .input("requested_payment_method", sql.NVarChar(50), payment || null)
      .input("special_request", sql.NVarChar(sql.MAX), specialRequest || null)
      .query(`
        UPDATE bookings SET
          check_in = @check_in, check_out = @check_out,
          guests_count = @guests_count, kids_count = @kids_count, rooms_count = @rooms_count,
          arrival_time = @arrival_time, requested_room_type_id = @requested_room_type_id,
          requested_payment_method = @requested_payment_method, special_request = @special_request
        WHERE id = @id
      `);

    // Replace additional guests
    await pool
      .request()
      .input("booking_id", sql.Int, bookingId)
      .query("DELETE FROM AdditionalGuests WHERE booking_id = @booking_id");

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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Booking PUT error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
