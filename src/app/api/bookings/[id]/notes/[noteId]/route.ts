import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

// PATCH /api/bookings/[id]/notes/[noteId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("hms-session")?.value;
    const session = token ? await verifySession(token) : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, noteId } = await params;
    const bookingId = parseInt(id);
    const nId       = parseInt(noteId);
    if (isNaN(bookingId) || isNaN(nId))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = await req.json();
    const { noteBody, is_pinned, is_private, priority, note_type } = body;

    const pool = await getDB();

    // Only author or admin can edit
    const existing = await pool.request()
      .input("id",         sql.Int, nId)
      .input("booking_id", sql.Int, bookingId)
      .input("hotel_id",   sql.Int, session.hotelId)
      .query("SELECT created_by FROM reservation_notes WHERE id=@id AND booking_id=@booking_id AND hotel_id=@hotel_id AND is_deleted=0");

    if (existing.recordset.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isOwner = existing.recordset[0].created_by === session.userId;
    const isAdmin = session.roleId === 1 || session.roleId === 2;
    if (!isOwner && !isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const setClauses: string[] = ["updated_at = GETDATE()", "updated_by = @updated_by"];
    const req2 = pool.request()
      .input("id",          sql.Int, nId)
      .input("booking_id",  sql.Int, bookingId)
      .input("hotel_id",    sql.Int, session.hotelId)
      .input("updated_by",  sql.Int, session.userId);

    if (noteBody !== undefined) {
      setClauses.push("body = @body");
      req2.input("body", sql.NVarChar(sql.MAX), String(noteBody).trim());
    }
    if (is_pinned !== undefined) {
      setClauses.push("is_pinned = @is_pinned");
      req2.input("is_pinned", sql.Bit, is_pinned ? 1 : 0);
    }
    if (is_private !== undefined) {
      setClauses.push("is_private = @is_private");
      req2.input("is_private", sql.Bit, is_private ? 1 : 0);
    }
    if (priority !== undefined) {
      setClauses.push("priority = @priority");
      req2.input("priority", sql.NVarChar(10), priority);
    }
    if (note_type !== undefined) {
      setClauses.push("note_type = @note_type");
      req2.input("note_type", sql.NVarChar(30), note_type);
    }

    await req2.query(`
      UPDATE reservation_notes
      SET ${setClauses.join(", ")}
      WHERE id = @id AND booking_id = @booking_id AND hotel_id = @hotel_id
    `);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /notes/[noteId] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/bookings/[id]/notes/[noteId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("hms-session")?.value;
    const session = token ? await verifySession(token) : null;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, noteId } = await params;
    const bookingId = parseInt(id);
    const nId       = parseInt(noteId);
    if (isNaN(bookingId) || isNaN(nId))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const pool = await getDB();

    const existing = await pool.request()
      .input("id",         sql.Int, nId)
      .input("booking_id", sql.Int, bookingId)
      .input("hotel_id",   sql.Int, session.hotelId)
      .query("SELECT created_by FROM reservation_notes WHERE id=@id AND booking_id=@booking_id AND hotel_id=@hotel_id AND is_deleted=0");

    if (existing.recordset.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isOwner = existing.recordset[0].created_by === session.userId;
    const isAdmin = session.roleId === 1 || session.roleId === 2;
    if (!isOwner && !isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await pool.request()
      .input("id",         sql.Int, nId)
      .input("booking_id", sql.Int, bookingId)
      .input("hotel_id",   sql.Int, session.hotelId)
      .query("UPDATE reservation_notes SET is_deleted=1, updated_at=GETDATE() WHERE id=@id AND booking_id=@booking_id AND hotel_id=@hotel_id");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /notes/[noteId] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
