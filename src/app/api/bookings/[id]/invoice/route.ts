import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

// GET /api/bookings/[id]/invoice — full booking + hotel info for invoice
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
          b.id                                                              AS bookingId,
          'AL' + RIGHT('0000' + CAST(b.id AS VARCHAR(10)), 4)              AS bookingNo,
          FORMAT(b.created_at, 'dd-MM-yyyy')                               AS createdAt,
          CONVERT(varchar(10), b.check_in,  120)                           AS checkInISO,
          CONVERT(varchar(10), b.check_out, 120)                           AS checkOutISO,
          FORMAT(b.check_in,  'dd MMM yyyy')                               AS checkIn,
          FORMAT(b.check_out, 'dd MMM yyyy')                               AS checkOut,
          DATEDIFF(day, b.check_in, b.check_out)                           AS nights,
          b.guests_count                                                    AS adults,
          b.kids_count                                                      AS kids,
          b.rooms_count                                                     AS rooms,
          b.total_price                                                     AS totalPrice,
          ISNULL((SELECT SUM(p.amount) FROM payments p WHERE p.booking_id = b.id), 0) AS paidAmount,
          b.requested_payment_method                                        AS paymentMethod,
          bs.name_eng                                                       AS bookingStatus,
          -- Room
          ISNULL(r.room_number, '-')                                        AS roomNo,
          ISNULL(rt.name_eng, '-')                                          AS roomType,
          ISNULL(r.price_per_night, b.total_price / NULLIF(DATEDIFF(day, b.check_in, b.check_out), 0)) AS pricePerNight,
          -- Guest
          g.full_name                                                       AS guestName,
          g.first_name                                                      AS firstName,
          g.last_name                                                       AS lastName,
          g.email                                                           AS guestEmail,
          g.phone                                                           AS guestPhone,
          g.country                                                         AS guestCountry,
          g.city                                                            AS guestCity,
          -- Hotel
          h.name                                                            AS hotelName,
          h.address                                                         AS hotelAddress,
          h.phone                                                           AS hotelPhone,
          h.email                                                           AS hotelEmail,
          h.logoUrl                                                         AS hotelLogo
        FROM bookings b
        JOIN guests g           ON g.id   = b.guest_id
        JOIN booking_status bs  ON bs.id  = b.status_id
        LEFT JOIN rooms r       ON r.id   = b.room_id
        LEFT JOIN room_type rt  ON rt.id  = b.requested_room_type_id
        JOIN hotels h           ON h.id   = b.hotel_id
        WHERE b.id = @id AND b.hotel_id = @hotel_id
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result.recordset[0]);
  } catch (err) {
    console.error("Invoice GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
