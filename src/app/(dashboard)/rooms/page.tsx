import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/db";
import RoomsClient, { type RoomRow } from "@/components/rooms/RoomsClient";

export default async function RoomsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("hms-session")?.value;
  const session = token ? await verifySession(token) : null;

  let rooms: RoomRow[] = [];

  if (session?.hotelId) {
    const dbRooms = await prisma.rooms.findMany({
      where: { hotel_id: session.hotelId },
      include: { room_type: true },
      orderBy: { room_number: "asc" },
    });

    rooms = dbRooms.map((r) => ({
      id: r.id,
      roomNo: r.room_number,
      type: r.room_type.name_eng,
      floorNo: r.floor != null ? String(r.floor).padStart(2, "0") : "—",
      facilities: r.description ?? "AC, TV, Wifi, Double Bed",
      pricePerNight: Number(r.price_per_night).toFixed(2),
      isAvailable: r.is_available,
      bookingStatus: r.is_available ? "Available" : "Booked",
    }));
  }

  return (
    <RoomsClient
      rooms={rooms}
      hotelName={session?.hotelName ?? "HMS"}
    />
  );
}


// ─── Mock Data ────────────────────────────────────────────────────────────────
