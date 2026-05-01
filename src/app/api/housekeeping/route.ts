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
          ISNULL(hk.status,   N'CLEAN') AS status,
          ISNULL(hk.priority, N'LOW')   AS priority,
          ISNULL(hk.comments, N'')      AS comments,
          hk.id AS hk_id
        FROM rooms r
        LEFT JOIN room_type rt    ON rt.id = r.room_type_id
        LEFT JOIN housekeeping hk ON hk.room_id = r.id AND hk.hotel_id = r.hotel_id
        WHERE r.hotel_id = @hotel_id
        ORDER BY r.room_number ASC
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

    const body = await req.json();
    const { room_id, status, comments } = body as {
      room_id: number;
      status: string;
      comments: string;
    };

    if (!room_id) {
      return NextResponse.json({ error: "room_id is required" }, { status: 400 });
    }

    const pool = await getDB();

    // Verify the room belongs to this hotel (prevents cross-hotel writes)
    const roomCheck = await pool
      .request()
      .input("room_id", sql.Int, room_id)
      .input("hotel_id", sql.Int, session.hotelId)
      .query("SELECT id FROM rooms WHERE id = @room_id AND hotel_id = @hotel_id");

    if (roomCheck.recordset.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    await pool
      .request()
      .input("hotel_id",   sql.Int,          session.hotelId)
      .input("room_id",    sql.Int,          room_id)
      .input("status",     sql.NVarChar(50),   status   ?? "CLEAN")
      .input("comments",   sql.NVarChar(2000), comments ?? null)
      .input("updated_by", sql.Int,            session.userId)
      .query(`
        MERGE housekeeping AS target
        USING (SELECT @hotel_id AS hotel_id, @room_id AS room_id) AS source
        ON target.hotel_id = source.hotel_id AND target.room_id = source.room_id
        WHEN MATCHED THEN
          UPDATE SET
            status     = @status,
            comments   = @comments,
            updated_by = @updated_by,
            updated_at = GETDATE()
        WHEN NOT MATCHED THEN
          INSERT (hotel_id, room_id, status, comments, updated_by)
          VALUES (@hotel_id, @room_id, @status, @comments, @updated_by);
      `);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Housekeeping PATCH error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
