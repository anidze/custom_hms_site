import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import sql from "mssql";

// GET /api/notifications?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("hms-session")?.value;
    const session = token ? await verifySession(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const targetDate = dateParam ?? new Date().toISOString().slice(0, 10);

    const pool = await getDB();

    const result = await pool
      .request()
      .input("hotel_id", sql.Int, session.hotelId)
      .input("target_date", sql.Date, new Date(targetDate))
      .query(`
        SELECT
          SUM(CASE WHEN CAST(b.check_in  AS DATE) = @target_date THEN 1 ELSE 0 END) AS checkIns,
          SUM(CASE WHEN CAST(b.check_out AS DATE) = @target_date THEN 1 ELSE 0 END) AS checkOuts
        FROM bookings b
        WHERE b.hotel_id = @hotel_id
      `);

    const row = result.recordset[0] ?? { checkIns: 0, checkOuts: 0 };

    return NextResponse.json({
      date:      targetDate,
      checkIns:  row.checkIns  ?? 0,
      checkOuts: row.checkOuts ?? 0,
    });
  } catch (err) {
    console.error("Notifications error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
