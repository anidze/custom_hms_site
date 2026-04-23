import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const hotels = await prisma.hotels.findMany({
      where: { is_active: true },
      select: { id: true, name: true, city: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(hotels);
  } catch (err) {
    console.error("Hotels fetch error:", err);
    return NextResponse.json({ error: "სერვერის შეცდომა" }, { status: 500 });
  }
}
