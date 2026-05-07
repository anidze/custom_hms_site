import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';
import { getDB } from '@/lib/db';
import sql from 'mssql';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('hms-session')?.value;
    const session = token ? await verifySession(token) : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const bookingId = parseInt(id);
    if (isNaN(bookingId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    let body: {
      guestId?: number; firstName?: string; lastName?: string; phone?: string;
      email?: string; idType?: string; idNumber?: string; rooms?: number[];
      depositAmount?: number; depositMethod?: string; includeBreakfast?: boolean;
      extraBed?: boolean; isVip?: boolean; lateCheckout?: boolean; notes?: string;
    } = {};
    try { body = await req.json(); } catch { /* no body */ }

    const pool = await getDB();

    const bookingResult = await pool.request()
      .input('id', sql.Int, bookingId)
      .input('hotel_id', sql.Int, session.hotelId)
      .query(`
        SELECT b.id, b.guest_id, b.room_id, b.check_in, b.check_out, b.total_price,
               DATEDIFF(day, b.check_in, b.check_out) AS nights,
               bs.name_eng AS status_name, rt.name_eng AS room_type
        FROM bookings b
        JOIN  booking_status bs ON bs.id = b.status_id
        LEFT JOIN room_type  rt ON rt.id = b.requested_room_type_id
        WHERE b.id = @id AND b.hotel_id = @hotel_id
      `);

    if (bookingResult.recordset.length === 0)
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const booking   = bookingResult.recordset[0];
    const statusLow = (booking.status_name ?? '').toLowerCase();

    if (statusLow.includes('cancel'))
      return NextResponse.json({ error: 'Cannot check-in: reservation is Cancelled.' }, { status: 400 });
    if (statusLow.includes('no') && statusLow.includes('show'))
      return NextResponse.json({ error: 'Cannot check-in: reservation is marked No Show.' }, { status: 400 });
    if (statusLow.includes('check') && statusLow.includes('out'))
      return NextResponse.json({ error: 'This reservation has already been checked out.' }, { status: 400 });
    if ((statusLow.includes('check') && statusLow.includes('in')) || statusLow === 'in-house' || statusLow === 'in house')
      return NextResponse.json({ error: 'Guest is already checked in.' }, { status: 400 });

    let roomIds: number[] =
      Array.isArray(body.rooms) && body.rooms.length > 0
        ? body.rooms.filter(Boolean)
        : booking.room_id ? [booking.room_id] : [];

    if (roomIds.length === 0) {
      const autoResult = await pool.request()
        .input('hotel_id',   sql.Int, session.hotelId)
        .input('room_type',  sql.NVarChar(100), booking.room_type ?? '')
        .input('check_in',   sql.Date, booking.check_in)
        .input('check_out',  sql.Date, booking.check_out)
        .input('booking_id', sql.Int, bookingId)
        .query(`
          SELECT TOP 1 r.id FROM rooms r
          LEFT JOIN room_type rt ON rt.id = r.room_type_id
          LEFT JOIN housekeeping hk ON hk.room_id = r.id AND hk.hotel_id = r.hotel_id
          WHERE r.hotel_id = @hotel_id AND r.is_available = 1
            AND ISNULL(hk.status, N'CLEAN') NOT IN (N'DIRTY', N'OUT OF SERVICE')
            AND (rt.name_eng = @room_type OR @room_type = N'')
            AND r.id NOT IN (
              SELECT DISTINCT br.room_id FROM booking_rooms br
              JOIN bookings b ON b.id = br.booking_id
              WHERE b.hotel_id = @hotel_id AND b.id != @booking_id
                AND b.check_in < @check_out AND b.check_out > @check_in
            )
          ORDER BY r.room_number ASC
        `);
      if (autoResult.recordset.length > 0) {
        roomIds = [autoResult.recordset[0].id];
      } else {
        return NextResponse.json({ error: 'No available clean room found. Please assign manually.' }, { status: 400 });
      }
    }

    for (const roomId of roomIds) {
      const rmResult = await pool.request()
        .input('room_id', sql.Int, roomId)
        .input('hotel_id', sql.Int, session.hotelId)
        .query(`
          SELECT r.id, r.room_number,
                 ISNULL(r.room_status, N'Vacant Clean') AS room_status,
                 ISNULL(hk.status, N'CLEAN') AS hk_status
          FROM rooms r
          LEFT JOIN housekeeping hk ON hk.room_id = r.id AND hk.hotel_id = r.hotel_id
          WHERE r.id = @room_id AND r.hotel_id = @hotel_id
        `);
      if (rmResult.recordset.length === 0)
        return NextResponse.json({ error: `Room ${roomId} not found.` }, { status: 404 });

      const rm = rmResult.recordset[0];
      if (rm.hk_status === 'DIRTY')
        return NextResponse.json({ error: `Room ${rm.room_number} is Dirty — clean it before check-in.` }, { status: 400 });
      if (rm.room_status === 'Out Of Order')
        return NextResponse.json({ error: `Room ${rm.room_number} is Out Of Order.` }, { status: 400 });
      if (rm.room_status === 'Occupied' && roomId !== booking.room_id)
        return NextResponse.json({ error: `Room ${rm.room_number} is already Occupied.` }, { status: 400 });
    }

    if (body.guestId) {
      await pool.request()
        .input('id',         sql.Int,          body.guestId)
        .input('first_name', sql.NVarChar(100), body.firstName ?? null)
        .input('last_name',  sql.NVarChar(100), body.lastName  ?? null)
        .input('full_name',  sql.NVarChar(200),
          (body.firstName || body.lastName)
            ? [body.firstName, body.lastName].filter(Boolean).join(' ') : null)
        .input('phone',      sql.NVarChar(50),  body.phone    ?? null)
        .input('email',      sql.NVarChar(200), body.email    ?? null)
        .input('id_type',    sql.NVarChar(50),  body.idType   ?? null)
        .input('id_number',  sql.NVarChar(50),  body.idNumber ?? null)
        .query(`
          UPDATE guests SET
            first_name = COALESCE(@first_name, first_name),
            last_name  = COALESCE(@last_name,  last_name),
            full_name  = COALESCE(@full_name,  full_name),
            phone      = COALESCE(@phone,      phone),
            email      = COALESCE(@email,      email),
            id_type    = COALESCE(@id_type,    id_type),
            id_number  = COALESCE(@id_number,  id_number)
          WHERE id = @id
        `);
    }

    const firstRoomId = roomIds[0];
    await pool.request()
      .input('room_id', sql.Int, firstRoomId).input('id', sql.Int, bookingId)
      .query('UPDATE bookings SET room_id = @room_id WHERE id = @id');
    try {
      await pool.request()
        .input('booking_id', sql.Int, bookingId)
        .query('DELETE FROM booking_rooms WHERE booking_id = @booking_id');
      for (const roomId of roomIds) {
        await pool.request()
          .input('booking_id', sql.Int, bookingId).input('room_id', sql.Int, roomId)
          .query('INSERT INTO booking_rooms (booking_id, room_id) VALUES (@booking_id, @room_id)');
      }
    } catch { /* booking_rooms table not yet created — room assigned via bookings.room_id */ }
    for (const roomId of roomIds) {
      await pool.request().input('room_id', sql.Int, roomId)
        .query('UPDATE rooms SET is_available = 0 WHERE id = @room_id');
      try { await pool.request().input('room_id', sql.Int, roomId)
        .query("UPDATE rooms SET room_status = N'Occupied' WHERE id = @room_id"); } catch { /**/ }
    }

    try {
      await pool.request()
        .input('id',                sql.Int,          bookingId)
        .input('deposit_amount',    sql.Decimal(10,2), body.depositAmount ?? null)
        .input('deposit_method',    sql.NVarChar(50),  body.depositMethod ?? null)
        .input('include_breakfast', sql.Bit,           body.includeBreakfast ? 1 : 0)
        .input('extra_bed',         sql.Bit,           body.extraBed         ? 1 : 0)
        .input('is_vip',            sql.Bit,           body.isVip            ? 1 : 0)
        .input('late_checkout',     sql.Bit,           body.lateCheckout     ? 1 : 0)
        .input('special_request',   sql.NVarChar(sql.MAX), body.notes ?? null)
        .query(`UPDATE bookings SET actual_check_in=GETDATE(),
          deposit_amount=COALESCE(@deposit_amount,deposit_amount),
          deposit_method=COALESCE(@deposit_method,deposit_method),
          include_breakfast=@include_breakfast, extra_bed=@extra_bed,
          is_vip=@is_vip, late_checkout=@late_checkout,
          special_request=COALESCE(@special_request,special_request) WHERE id=@id`);
    } catch { /* migration not yet run */ }

    const ciStatus = await pool.request().query(`
      SELECT TOP 1 id FROM booking_status WHERE is_active=1
        AND (LOWER(name_eng) LIKE '%checked%in%' OR LOWER(name_eng) LIKE '%check-in%'
          OR LOWER(name_eng) LIKE '%checkin%')
      ORDER BY sort_order ASC`);
    if (ciStatus.recordset.length === 0)
      return NextResponse.json({ error: 'Check-in status not configured.' }, { status: 500 });
    await pool.request()
      .input('status_id', sql.Int, ciStatus.recordset[0].id).input('id', sql.Int, bookingId)
      .query('UPDATE bookings SET status_id = @status_id WHERE id = @id');

    // Generate folio lines
    try {
      const fd = await pool.request().input('id', sql.Int, bookingId).query(`
        SELECT DATEDIFF(day,b.check_in,b.check_out) AS nights,
               ISNULL(r.price_per_night,b.total_price) AS price_per_night,
               ISNULL(rt.name_eng,N'Room') AS room_type
        FROM bookings b
        LEFT JOIN rooms r ON r.id=b.room_id
        LEFT JOIN room_type rt ON rt.id=b.requested_room_type_id
        WHERE b.id=@id`);
      if (fd.recordset.length > 0) {
        const { nights, price_per_night, room_type } = fd.recordset[0];
        const n = Math.max(1, nights || 1);
        const unit = parseFloat(price_per_night) || 0;
        if (unit > 0) {
          await pool.request()
            .input('hotel_id', sql.Int, session.hotelId).input('booking_id', sql.Int, bookingId)
            .input('desc', sql.NVarChar(200), `Room Charge – ${room_type} × ${n} night${n!==1?'s':''}`)
            .input('qty', sql.Decimal(10,2), n).input('unit', sql.Decimal(10,2), unit)
            .input('total', sql.Decimal(10,2), unit*n).input('by', sql.Int, session.userId)
            .query(`INSERT INTO folio_lines(hotel_id,booking_id,line_type,description,quantity,unit_price,total_amount,is_credit,created_by)
              VALUES(@hotel_id,@booking_id,N'Room Charge',@desc,@qty,@unit,@total,0,@by)`);
        }
        if (body.includeBreakfast) {
          await pool.request()
            .input('hotel_id', sql.Int, session.hotelId).input('booking_id', sql.Int, bookingId)
            .input('qty', sql.Decimal(10,2), n).input('by', sql.Int, session.userId)
            .query(`INSERT INTO folio_lines(hotel_id,booking_id,line_type,description,quantity,unit_price,total_amount,is_credit,created_by)
              VALUES(@hotel_id,@booking_id,N'Breakfast',N'Breakfast Package',@qty,0,0,0,@by)`);
        }
        if (body.extraBed) {
          await pool.request()
            .input('hotel_id', sql.Int, session.hotelId).input('booking_id', sql.Int, bookingId)
            .input('by', sql.Int, session.userId)
            .query(`INSERT INTO folio_lines(hotel_id,booking_id,line_type,description,quantity,unit_price,total_amount,is_credit,created_by)
              VALUES(@hotel_id,@booking_id,N'Extra Bed',N'Extra Bed Service',1,0,0,0,@by)`);
        }
        if (body.depositAmount && body.depositAmount > 0) {
          await pool.request()
            .input('hotel_id', sql.Int, session.hotelId).input('booking_id', sql.Int, bookingId)
            .input('deposit', sql.Decimal(10,2), body.depositAmount)
            .input('method', sql.NVarChar(50), body.depositMethod ?? 'Cash')
            .input('by', sql.Int, session.userId)
            .query(`INSERT INTO folio_lines(hotel_id,booking_id,line_type,description,quantity,unit_price,total_amount,is_credit,created_by)
              VALUES(@hotel_id,@booking_id,N'Deposit',CONCAT(N'Deposit – ',@method),1,@deposit,@deposit,1,@by)`);
          try {
            await pool.request()
              .input('booking_id', sql.Int, bookingId).input('amount', sql.Decimal(10,2), body.depositAmount)
              .input('method', sql.NVarChar(50), body.depositMethod ?? 'Cash')
              .query(`INSERT INTO payments(booking_id,amount,payment_method,paid_at,notes)
                VALUES(@booking_id,@amount,@method,GETDATE(),N'Deposit at Check-In')`);
          } catch {
            await pool.request().input('booking_id', sql.Int, bookingId).input('amount', sql.Decimal(10,2), body.depositAmount)
              .query('INSERT INTO payments(booking_id,amount) VALUES(@booking_id,@amount)');
          }
        }
      }
    } catch (fe) { console.warn('Folio skipped (run enterprise_v3_migration.sql):', fe); }

    // Audit log
    try {
      await pool.request()
        .input('hotel_id', sql.Int, session.hotelId).input('booking_id', sql.Int, bookingId)
        .input('room_id', sql.Int, firstRoomId).input('action', sql.NVarChar(100), 'CHECK_IN')
        .input('performed_by', sql.Int, session.userId)
        .input('details', sql.NVarChar(sql.MAX), JSON.stringify({ roomIds, deposit: body.depositAmount??0,
          services:{ breakfast:body.includeBreakfast??false, extraBed:body.extraBed??false,
                     vip:body.isVip??false, lateCheckout:body.lateCheckout??false } }))
        .query(`INSERT INTO audit_logs(hotel_id,booking_id,room_id,action,performed_by,details)
          VALUES(@hotel_id,@booking_id,@room_id,@action,@performed_by,@details)`);
    } catch (ae) { console.warn('Audit log skipped:', ae); }

    return NextResponse.json({ success: true, roomIds });
  } catch (err) {
    console.error('Check-in error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
