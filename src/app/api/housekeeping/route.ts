import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

const HOUSEKEEPING_ROLE_ID = 4;

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("hms-session")?.value;
  return token ? await verifySession(token) : null;
}

// GET /api/housekeeping
// Returns all rooms for the hotel with their current housekeeping record (or defaults).
// Accessible only to users with roleId === 4.
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.roleId !== HOUSEKEEPING_ROLE_ID) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pool = await getDB();
    const result = await pool
      .request()
      .input("hotel_id", sql.Int, session.hotelId)
      .query(`
        SELECT
          r.id,
          r.room_number,
          r.floor,
          rt.name_eng AS room_type_name,
          ISNULL(r.room_status, N'Vacant Clean') AS room_status,
          ISNULL(hk.status,    N'CLEAN')         AS hk_status,
          ISNULL(hk.comments,  N'')              AS comments
        FROM rooms r
        LEFT JOIN room_type rt    ON rt.id = r.room_type_id
        LEFT JOIN housekeeping hk ON hk.room_id = r.id AND hk.hotel_id = r.hotel_id
        WHERE r.hotel_id = @hotel_id
        ORDER BY r.floor ASC, r.room_number ASC
      `);

    return NextResponse.json(result.recordset);
  } catch (err) {
    console.error("Housekeeping GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/housekeeping
// Upserts the housekeeping record for a given room.
// Body: { room_id, status, priority, comments }
// Accessible only to users with roleId === 4.
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.roleId !== HOUSEKEEPING_ROLE_ID) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }
    const { room_id, room_status, comments } = body as {
      room_id: number;
      room_status: string;
      comments: string;
    };

    if (!room_id) {
      return NextResponse.json({ error: "room_id is required" }, { status: 400 });
    }

    // Map room_status → housekeeping status + is_available
    const ROOM_TO_HK: Record<string, string> = {
      "Vacant Clean": "CLEAN",
      "Vacant Dirty": "DIRTY",
      "Inspected":    "INSPECTED",
      "Out Of Order": "OUT OF SERVICE",
    };
    const hkStatus   = ROOM_TO_HK[room_status] ?? "CLEAN";
    const isAvailable = ["Vacant Clean", "Inspected"].includes(room_status) ? 1 : 0;

    const pool = await getDB();

    // Verify room belongs to this hotel
    const roomCheck = await pool
      .request()
      .input("room_id",  sql.Int, room_id)
      .input("hotel_id", sql.Int, session.hotelId)
      .query("SELECT id, room_status FROM rooms WHERE id = @room_id AND hotel_id = @hotel_id");

    if (roomCheck.recordset.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Block changes to Occupied / Reserved rooms
    const currentStatus: string = roomCheck.recordset[0].room_status ?? "";
    if (["Occupied", "Reserved"].includes(currentStatus) && room_status !== currentStatus) {
      return NextResponse.json({ error: `Cannot change status of ${currentStatus} room` }, { status: 400 });
    }

    await pool
      .request()
      .input("hotel_id",   sql.Int,          session.hotelId)
      .input("room_id",    sql.Int,          room_id)
      .input("hk_status",  sql.NVarChar(50),  hkStatus)
      .input("comments",   sql.NVarChar(2000), comments ?? null)
      .input("updated_by", sql.Int,            session.userId)
      .query(`
        MERGE housekeeping AS target
        USING (SELECT @hotel_id AS hotel_id, @room_id AS room_id) AS source
        ON target.hotel_id = source.hotel_id AND target.room_id = source.room_id
        WHEN MATCHED THEN
          UPDATE SET
            status     = @hk_status,
            comments   = @comments,
            updated_by = @updated_by,
            updated_at = GETDATE()
        WHEN NOT MATCHED THEN
          INSERT (hotel_id, room_id, status, comments, updated_by)
          VALUES (@hotel_id, @room_id, @hk_status, @comments, @updated_by);
      `);

    // Update rooms.room_status and is_available
    await pool
      .request()
      .input("room_id",      sql.Int,         room_id)
      .input("room_status",  sql.NVarChar(30), room_status)
      .input("is_available", sql.Bit,          isAvailable)
      .query(`
        UPDATE rooms
        SET room_status  = @room_status,
            is_available = @is_available
        WHERE id = @room_id
      `);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Housekeeping PATCH error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
