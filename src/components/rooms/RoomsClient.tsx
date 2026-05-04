"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, BedDouble } from "lucide-react";

export interface RoomRow {
  id: number;
  roomNo: string;
  type: string;
  floorNo: string;
  facilities: string;
  pricePerNight: string;
  isAvailable: boolean;
  bookingStatus: "Available" | "Booked";
}

const CARD_BORDER = {
  Available: "border-emerald-400",
  Booked:    "border-rose-400",
};

const STATUS_BADGE = {
  Available: "bg-emerald-100 text-emerald-700",
  Booked:    "bg-rose-100 text-rose-700",
};

interface RoomsClientProps {
  rooms: RoomRow[];
  hotelName: string;
}

export default function RoomsClient({ rooms, hotelName }: RoomsClientProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<"all" | "available" | "booked">("all");
  const [selectedFloor, setSelectedFloor] = useState("all");
  const [search, setSearch] = useState("");
  const [collapsedFloors, setCollapsedFloors] = useState<Set<string>>(new Set());

  const floorOptions = [...new Set(rooms.map((r) => r.floorNo))].sort();

  function toggleFloor(floor: string) {
    setCollapsedFloors((prev) => {
      const next = new Set(prev);
      if (next.has(floor)) next.delete(floor);
      else next.add(floor);
      return next;
    });
  }

  const filtered = rooms.filter((room) => {
    if (activeFilter === "available" && room.bookingStatus !== "Available") return false;
    if (activeFilter === "booked" && room.bookingStatus !== "Booked") return false;
    if (selectedFloor !== "all" && room.floorNo !== selectedFloor) return false;
    if (search && !room.roomNo.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const groupedFloors = [...new Set(filtered.map((r) => r.floorNo))].sort();
  const grouped = groupedFloors.map((floor) => ({
    floor,
    rooms: filtered.filter((r) => r.floorNo === floor),
  }));

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    weekday: "long",
  });

  return (
    <div className="-m-8 flex flex-col min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
            <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
            <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
            <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
          </svg>
          <span>{today}</span>
        </div>
        <h1 className="text-lg font-bold text-slate-800 tracking-wide">
          ROOMS &mdash; {hotelName}
        </h1>
        <button
          onClick={() => router.push("/reservations/new")}
          className="bg-[#0f1f38] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#0d1a33] transition-colors"
        >
          Add Booking
        </button>
      </div>

      <div className="flex-1 p-8 bg-slate-50">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {(["all", "available", "booked"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                activeFilter === f
                  ? "bg-[#0f1f38] text-white border-[#0f1f38]"
                  : "bg-white text-slate-700 border-slate-300 hover:border-[#0f1f38]"
              }`}
            >
              {f === "all" ? "All rooms" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}

          {/* Floor dropdown */}
          <div className="relative">
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="appearance-none bg-white border border-slate-300 text-sm text-slate-700 font-semibold px-4 py-2 pr-8 rounded-lg cursor-pointer focus:outline-none focus:border-[#0f1f38]"
            >
              <option value="all">Select Floor</option>
              {floorOptions.map((f) => (
                <option key={f} value={f}>Floor {parseInt(f, 10)}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs ml-auto">
            <input
              type="text"
              placeholder="Search by room number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-300 rounded-lg text-sm px-4 py-2 pr-10 focus:outline-none focus:border-[#0f1f38]"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Summary badges */}
        <div className="flex gap-4 mb-6">
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-slate-100 text-sm">
            <span className="text-slate-500">Total Rooms: </span>
            <span className="font-bold text-slate-800">{rooms.length}</span>
          </div>
          <div className="bg-emerald-50 rounded-lg px-4 py-2 shadow-sm border border-emerald-100 text-sm">
            <span className="text-slate-500">Available: </span>
            <span className="font-bold text-emerald-700">{rooms.filter((r) => r.isAvailable).length}</span>
          </div>
          <div className="bg-rose-50 rounded-lg px-4 py-2 shadow-sm border border-rose-100 text-sm">
            <span className="text-slate-500">Occupied: </span>
            <span className="font-bold text-rose-600">{rooms.filter((r) => !r.isAvailable).length}</span>
          </div>
        </div>

        {/* Floor groups */}
        {grouped.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 text-center text-slate-400 text-sm py-12">
            No rooms found
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ floor, rooms: floorRooms }) => {
              const isCollapsed = collapsedFloors.has(floor);
              return (
                <div key={floor}>
                  <button
                    onClick={() => toggleFloor(floor)}
                    className="flex items-center gap-2 mb-4 px-1"
                  >
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
                    />
                    <span className="font-bold text-slate-700 text-sm uppercase tracking-wide">
                      Floor {parseInt(floor, 10)}
                    </span>
                    <span className="text-xs text-slate-400">({floorRooms.length} rooms)</span>
                  </button>

                  {!isCollapsed && (
                    <div className="flex flex-wrap justify-center gap-5">
                      {floorRooms.map((room) => (
                        <div
                          key={room.id}
                          className={`border-2 ${CARD_BORDER[room.bookingStatus]} shadow-md rounded-2xl bg-white flex flex-col items-center justify-between w-48 h-56 p-4 gap-2`}
                        >
                          {/* Status badge */}
                          <div className={`w-full text-center rounded-xl px-2 py-1.5 text-xs font-bold tracking-wide ${STATUS_BADGE[room.bookingStatus]}`}>
                            {room.bookingStatus === "Available" ? "AVAILABLE" : "OCCUPIED"}
                          </div>

                          {/* Room number */}
                          <div className="flex flex-col items-center justify-center flex-1">
                            <BedDouble size={28} className="text-slate-200 mb-2" />
                            <span className="text-4xl font-extrabold text-slate-800 leading-none">
                              {room.roomNo}
                            </span>
                          </div>

                          {/* Type + price */}
                          <div className="w-full text-center space-y-1">
                            <p className="text-xs text-slate-400 truncate font-medium">{room.type}</p>
                            <p className="text-sm font-bold text-[#0f1f38]">&#8382;{room.pricePerNight}<span className="text-[10px] text-slate-400 font-normal">/night</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
