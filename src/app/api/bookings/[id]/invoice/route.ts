import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

// Georgia: standard VAT rate for hotel accommodation is 18%. Store the rate
// with each issued invoice so historical invoices remain accurate even if the
// rate ever changes.
const DEFAULT_VAT_RATE = 18.0;

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("hms-session")?.value;
  return token ? await verifySession(token) : null;
}

async function ensureInvoiceTable(pool: sql.ConnectionPool) {
  await pool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'invoices')
    CREATE TABLE [dbo].[invoices] (
      [id] INT IDENTITY(1,1) PRIMARY KEY,
      [hotel_id] INT NOT NULL,
      [booking_id] INT NOT NULL,
      [invoice_no] NVARCHAR(50) NOT NULL,
      [sequence_year] INT NOT NULL,
      [sequence_num] INT NOT NULL,
      [vat_rate] DECIMAL(5,2) NOT NULL,
      [subtotal] DECIMAL(10,2) NOT NULL,
      [vat_amount] DECIMAL(10,2) NOT NULL,
      [total] DECIMAL(10,2) NOT NULL,
      [issued_by] INT NULL,
      [issued_at] DATETIME2 NOT NULL DEFAULT GETDATE(),
      CONSTRAINT UQ_invoices_seq UNIQUE (hotel_id, sequence_year, sequence_num),
      CONSTRAINT UQ_invoices_booking UNIQUE (booking_id)
    )
  `);
}

// VAT-inclusive breakdown — hotel prices in Georgia include VAT.
function vatBreakdown(total: number, rate: number) {
  const subtotal = +(total / (1 + rate / 100)).toFixed(2);
  const vat = +(total - subtotal).toFixed(2);
  return { subtotal, vat };
}

// GET /api/bookings/[id]/invoice — booking + hotel info + invoice info (if issued)
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
    await ensureInvoiceTable(pool);

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

    const booking = result.recordset[0];

    // Issued invoice (if any) takes precedence for VAT/total numbers.
    const inv = await pool
      .request()
      .input("booking_id", sql.Int, bookingId)
      .query(`
        SELECT invoice_no, FORMAT(issued_at, 'dd-MM-yyyy HH:mm') AS issued_at,
               vat_rate, subtotal, vat_amount, total
        FROM invoices WHERE booking_id = @booking_id
      `);

    const issued = inv.recordset[0];

    let breakdown;
    if (issued) {
      breakdown = {
        invoiceNo: issued.invoice_no as string,
        issuedAt:  issued.issued_at as string,
        vatRate:   parseFloat(issued.vat_rate),
        subtotal:  parseFloat(issued.subtotal),
        vatAmount: parseFloat(issued.vat_amount),
        total:     parseFloat(issued.total),
        isIssued:  true,
      };
    } else {
      const total = parseFloat(booking.totalPrice) || 0;
      const { subtotal, vat } = vatBreakdown(total, DEFAULT_VAT_RATE);
      breakdown = {
        invoiceNo: null,
        issuedAt:  null,
        vatRate:   DEFAULT_VAT_RATE,
        subtotal,
        vatAmount: vat,
        total,
        isIssued:  false,
      };
    }

    return NextResponse.json({ ...booking, ...breakdown });
  } catch (err) {
    console.error("Invoice GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/bookings/[id]/invoice — issue a fiscal invoice with sequential number
export async function POST(
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
    await ensureInvoiceTable(pool);

    // Verify the booking belongs to this hotel + fetch its total.
    const own = await pool.request()
      .input("id", sql.Int, bookingId)
      .input("hotel_id", sql.Int, session.hotelId)
      .query("SELECT id, total_price FROM bookings WHERE id = @id AND hotel_id = @hotel_id");
    if (own.recordset.length === 0)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    // Idempotent: if already issued, return it.
    const existing = await pool.request()
      .input("booking_id", sql.Int, bookingId)
      .query(`
        SELECT invoice_no, FORMAT(issued_at, 'dd-MM-yyyy HH:mm') AS issued_at,
               vat_rate, subtotal, vat_amount, total
        FROM invoices WHERE booking_id = @booking_id
      `);
    if (existing.recordset.length > 0) {
      const e = existing.recordset[0];
      return NextResponse.json({
        success: true,
        alreadyIssued: true,
        invoiceNo: e.invoice_no,
        issuedAt:  e.issued_at,
        vatRate:   parseFloat(e.vat_rate),
        subtotal:  parseFloat(e.subtotal),
        vatAmount: parseFloat(e.vat_amount),
        total:     parseFloat(e.total),
      });
    }

    const total = parseFloat(own.recordset[0].total_price) || 0;
    const { subtotal, vat } = vatBreakdown(total, DEFAULT_VAT_RATE);

    // Next sequence number for this hotel + year. Done in a single statement
    // inside a transaction so two concurrent issuers can't pick the same #.
    const year = new Date().getFullYear();
    const tx = new sql.Transaction(pool);
    await tx.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
    try {
      const next = await new sql.Request(tx)
        .input("hotel_id", sql.Int, session.hotelId)
        .input("year",     sql.Int, year)
        .query(`
          SELECT ISNULL(MAX(sequence_num), 0) + 1 AS next_num
          FROM invoices WITH (UPDLOCK, HOLDLOCK)
          WHERE hotel_id = @hotel_id AND sequence_year = @year
        `);
      const nextNum: number = next.recordset[0].next_num;
      const invoiceNo = `${year}/${String(nextNum).padStart(5, "0")}`;

      await new sql.Request(tx)
        .input("hotel_id",      sql.Int,          session.hotelId)
        .input("booking_id",    sql.Int,          bookingId)
        .input("invoice_no",    sql.NVarChar(50), invoiceNo)
        .input("sequence_year", sql.Int,          year)
        .input("sequence_num",  sql.Int,          nextNum)
        .input("vat_rate",      sql.Decimal(5,2),  DEFAULT_VAT_RATE)
        .input("subtotal",      sql.Decimal(10,2), subtotal)
        .input("vat_amount",    sql.Decimal(10,2), vat)
        .input("total",         sql.Decimal(10,2), total)
        .input("issued_by",     sql.Int,          session.userId)
        .query(`
          INSERT INTO invoices
            (hotel_id, booking_id, invoice_no, sequence_year, sequence_num,
             vat_rate, subtotal, vat_amount, total, issued_by)
          VALUES
            (@hotel_id, @booking_id, @invoice_no, @sequence_year, @sequence_num,
             @vat_rate, @subtotal, @vat_amount, @total, @issued_by)
        `);

      await tx.commit();

      return NextResponse.json({
        success: true,
        alreadyIssued: false,
        invoiceNo,
        vatRate:   DEFAULT_VAT_RATE,
        subtotal,
        vatAmount: vat,
        total,
      });
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  } catch (err) {
    console.error("Invoice POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
