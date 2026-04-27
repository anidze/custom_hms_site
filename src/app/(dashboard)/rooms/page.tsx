import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
import RoomsClient, { type RoomRow } from "@/components/rooms/RoomsClient";

export default async function RoomsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("hms-session")?.value;
  const session = token ? await verifySession(token) : null;

  let rooms: RoomRow[] = [];

  if (session?.hotelId) {
    const pool = await getDB();
    const result = await pool
      .request()
      .input("hotel_id", session.hotelId)
      .query(`
        SELECT r.id, r.room_number, r.floor, r.description,
               r.price_per_night, r.is_available,
               rt.name_eng AS room_type_name
        FROM rooms r
        LEFT JOIN room_type rt ON rt.id = r.room_type_id
        WHERE r.hotel_id = @hotel_id
        ORDER BY r.room_number ASC
      `);

    rooms = result.recordset.map((r) => ({
      id: r.id,
      roomNo: r.room_number,
      type: r.room_type_name ?? "—",
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
