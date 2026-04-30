import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("hms-session")?.value;
    const session = token ? await verifySession(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tab = searchParams.get("tab"); // "checkin" | "checkout" | null

    const pool = await getDB();

    let whereClause = "b.hotel_id = @hotel_id";
    if (tab === "checkin") {
      whereClause += " AND b.check_in >= CAST(GETDATE() AS DATE)";
    } else if (tab === "checkout") {
      whereClause += " AND b.check_out >= CAST(GETDATE() AS DATE)";
    }

    const result = await pool
      .request()
      .input("hotel_id", sql.Int, session.hotelId)
      .query(`
        SELECT
          b.id,
          g.full_name                                                     AS guestName,
          'AL' + RIGHT('0000' + CAST(b.id AS VARCHAR(10)), 4)             AS bookingNo,
          ISNULL(b.requested_payment_method, '-')                         AS bookingSource,
          ISNULL(r.room_number, '-')                                      AS roomNo,
          ISNULL(rt.name_eng, '-')                                        AS roomType,
          bs.name_eng                                                     AS bookingStatus,
          bs.color_hex                                                    AS statusColor,
          b.total_price                                                   AS totalPrice,
          ISNULL((SELECT SUM(p.amount) FROM payments p WHERE p.booking_id = b.id), 0) AS paidAmount,
          FORMAT(b.check_in,  'dd-MM-yyyy')                               AS checkIn,
          FORMAT(b.check_out, 'dd-MM-yyyy')                               AS checkOut,
          CONVERT(varchar(10), b.check_in,  120)                          AS checkInISO,
          CONVERT(varchar(10), b.check_out, 120)                          AS checkOutISO,
          DATEDIFF(day, b.check_in, b.check_out)                          AS nights
        FROM bookings b
        JOIN guests g         ON g.id  = b.guest_id
        JOIN booking_status bs ON bs.id = b.status_id
        LEFT JOIN rooms r     ON r.id  = b.room_id
        LEFT JOIN room_type rt ON rt.id = b.requested_room_type_id
        WHERE ${whereClause}
        ORDER BY b.created_at DESC
      `);

    return NextResponse.json(result.recordset);
  } catch (err) {
    console.error("Reservations fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
