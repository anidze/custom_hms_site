import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";
import { cookies } from "next/headers";
import { getDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const pool = await getDB();
    const result = await pool
      .request()
      .input("email", email.toLowerCase().trim())
      .query(`
        SELECT u.id, u.email, u.password_hash, u.is_active,
               u.full_name, u.hotel_id, u.role_id,
               h.name AS hotel_name
        FROM users u
        LEFT JOIN hotels h ON h.id = u.hotel_id
        WHERE u.email = @email
      `);

    const user = result.recordset[0];

    if (!user || !user.is_active) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await pool
      .request()
      .input("id", user.id)
      .query("UPDATE users SET last_login_at = GETDATE() WHERE id = @id");

    const token = await createSession({
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
      hotelId: user.hotel_id ?? 0,
      roleId: user.role_id,
      hotelName: user.hotel_name ?? "HMS",
    });

    const cookieStore = await cookies();
    cookieStore.set("hms-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
