import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, password, hotel_id } = await req.json();

    if (!full_name || !email || !password || !hotel_id) {
      return NextResponse.json(
        { error: "ყველა ველი სავალდებულოა" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "პაროლი მინიმუმ 8 სიმბოლო უნდა იყოს" },
        { status: 400 }
      );
    }

    // Check if email already taken
    const existing = await prisma.users.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "ეს ელ-ფოსტა უკვე რეგისტრირებულია" },
        { status: 409 }
      );
    }

    // Verify hotel exists
    const hotel = await prisma.hotels.findUnique({
      where: { id: Number(hotel_id) },
    });
    if (!hotel) {
      return NextResponse.json(
        { error: "სასტუმრო ვერ მოიძებნა" },
        { status: 400 }
      );
    }

    // Get RECEPTIONIST role (default for new registrations)
    const receptionistRole = await prisma.user_role.findFirst({
      where: { code: "RECEPTIONIST", is_active: true },
    });
    if (!receptionistRole) {
      return NextResponse.json(
        { error: "სისტემური შეცდომა: როლი ვერ მოიძებნა" },
        { status: 500 }
      );
    }

    const password_hash = await bcrypt.hash(password, 12);

    const user = await prisma.users.create({
      data: {
        full_name: full_name.trim(),
        email: email.toLowerCase().trim(),
        password_hash,
        hotel_id: Number(hotel_id),
        role_id: receptionistRole.id,
        is_active: true,
      },
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "სერვერის შეცდომა" }, { status: 500 });
  }
}
