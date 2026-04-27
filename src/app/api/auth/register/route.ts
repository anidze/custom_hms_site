import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, password, hotel_id } = await req.json();

    if (!full_name || !email || !password || !hotel_id) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const pool = await getDB();

    // Check if email already taken
    const existingResult = await pool
      .request()
      .input("email", email.toLowerCase().trim())
      .query("SELECT id FROM users WHERE email = @email");

    if (existingResult.recordset.length > 0) {
      return NextResponse.json(
        { error: "This email is already registered" },
        { status: 409 }
      );
    }

    // Verify hotel exists
    const hotelResult = await pool
      .request()
      .input("hotel_id", Number(hotel_id))
      .query("SELECT id FROM hotels WHERE id = @hotel_id");

    if (hotelResult.recordset.length === 0) {
      return NextResponse.json(
        { error: "Hotel not found" },
        { status: 400 }
      );
    }

    // Get RECEPTIONIST role (default for new registrations)
    const roleResult = await pool
      .request()
      .query("SELECT id FROM user_role WHERE code = 'RECEPTIONIST' AND is_active = 1");

    if (roleResult.recordset.length === 0) {
      return NextResponse.json(
        { error: "System error: role not found" },
        { status: 500 }
      );
    }

    const roleId = roleResult.recordset[0].id;
    const password_hash = await bcrypt.hash(password, 12);

    const insertResult = await pool
      .request()
      .input("full_name", full_name.trim())
      .input("email", email.toLowerCase().trim())
      .input("password_hash", password_hash)
      .input("hotel_id", Number(hotel_id))
      .input("role_id", roleId)
      .query(`
        INSERT INTO users (full_name, email, password_hash, hotel_id, role_id, is_active)
        OUTPUT INSERTED.id
        VALUES (@full_name, @email, @password_hash, @hotel_id, @role_id, 1)
      `);

    const newUserId = insertResult.recordset[0].id;

    return NextResponse.json({ success: true, userId: newUserId }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
