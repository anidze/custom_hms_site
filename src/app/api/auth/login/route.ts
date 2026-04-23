import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "ელ-ფოსტა და პაროლი სავალდებულოა" },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { hotels: true, user_role: true },
    });

    if (!user || !user.is_active) {
      return NextResponse.json(
        { error: "ელ-ფოსტა ან პაროლი არასწორია" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "ელ-ფოსტა ან პაროლი არასწორია" },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    const token = await createSession({
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
      hotelId: user.hotel_id ?? 0,
      roleId: user.role_id,
      hotelName: user.hotels?.name ?? "HMS",
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
    return NextResponse.json({ error: "სერვერის შეცდომა" }, { status: 500 });
  }
}
