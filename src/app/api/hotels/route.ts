import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET() {
  try {
    const pool = await getDB();
    const result = await pool
      .request()
      .query(
        "SELECT id, name, city FROM hotels WHERE is_active = 1 ORDER BY name ASC"
      );
    return NextResponse.json(result.recordset);
  } catch (err) {
    console.error("Hotels fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
