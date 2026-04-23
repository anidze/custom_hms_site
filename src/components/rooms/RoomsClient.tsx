"use client";

import { useState } from "react";
import { Search, ChevronDown, MoreVertical } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Badge helpers ────────────────────────────────────────────────────────────
const bookingStatusStyle = {
  Available: "bg-green-100 text-green-700",
  Booked: "bg-orange-100 text-orange-600",
};

interface RoomsClientProps {
  rooms: RoomRow[];
  hotelName: string;
}

export default function RoomsClient({ rooms, hotelName }: RoomsClientProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "available" | "booked">("all");
  const [selectedFloor, setSelectedFloor] = useState<string>("all");
  const [search, setSearch] = useState("");

  const floors = ["all", ...Array.from(new Set(rooms.map((r) => r.floorNo))).sort()];

  const filtered = rooms.filter((room) => {
    if (activeFilter === "available" && room.bookingStatus !== "Available") return false;
    if (activeFilter === "booked" && room.bookingStatus !== "Booked") return false;
    if (selectedFloor !== "all" && room.floorNo !== selectedFloor) return false;
    if (search && !room.roomNo.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    weekday: "long",
  });

  return (
    <div className="-m-8 flex flex-col min-h-screen">
      {/* ── Top bar ─────────────────────────────────────────── */}
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
          ROOMS — {hotelName}
        </h1>
        <button className="bg-[#d56f4d] hover:bg-[#c4623f] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
          Add Booking
        </button>
      </div>

      <div className="flex-1 p-8 bg-slate-50">
        {/* ── Filter bar ──────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {(["all", "available", "booked"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                activeFilter === f
                  ? "bg-[#d56f4d] text-white border-[#d56f4d]"
                  : "bg-white text-slate-700 border-slate-300 hover:border-[#d56f4d]"
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
              className="appearance-none bg-white border border-slate-300 text-sm text-slate-700 font-semibold px-4 py-2 pr-8 rounded-lg cursor-pointer focus:outline-none focus:border-[#d56f4d]"
            >
              <option value="all">Select Floor</option>
              {floors
                .filter((f) => f !== "all")
                .map((f) => (
                  <option key={f} value={f}>
                    Floor {f}
                  </option>
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
              className="w-full border border-slate-300 rounded-lg text-sm px-4 py-2 pr-10 focus:outline-none focus:border-[#d56f4d]"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>

          <button className="bg-[#d56f4d] hover:bg-[#c4623f] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors whitespace-nowrap">
            Add room
          </button>
        </div>

        {/* ── Summary badges ──────────────────────────────────── */}
        <div className="flex gap-4 mb-4">
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-slate-100 text-sm">
            <span className="text-slate-500">სულ ოთახი: </span>
            <span className="font-bold text-slate-800">{rooms.length}</span>
          </div>
          <div className="bg-green-50 rounded-lg px-4 py-2 shadow-sm border border-green-100 text-sm">
            <span className="text-slate-500">თავისუფალი: </span>
            <span className="font-bold text-green-700">
              {rooms.filter((r) => r.isAvailable).length}
            </span>
          </div>
          <div className="bg-orange-50 rounded-lg px-4 py-2 shadow-sm border border-orange-100 text-sm">
            <span className="text-slate-500">დაკავებული: </span>
            <span className="font-bold text-orange-600">
              {rooms.filter((r) => !r.isAvailable).length}
            </span>
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#fdf0ec] text-slate-600 font-semibold">
                <th className="text-left px-6 py-3">Room No</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Floor</th>
                <th className="text-left px-4 py-3">Facilities / Notes</th>
                <th className="text-left px-4 py-3">Price / Night</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    ოთახები ვერ მოიძებნა.
                  </td>
                </tr>
              ) : (
                filtered.map((room) => (
                  <tr
                    key={room.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-800">{room.roomNo}</td>
                    <td className="px-4 py-4 text-slate-600">{room.type}</td>
                    <td className="px-4 py-4 text-slate-600">{room.floorNo}</td>
                    <td className="px-4 py-4 text-slate-500 max-w-xs truncate">{room.facilities}</td>
                    <td className="px-4 py-4 text-slate-700 font-medium">₾{room.pricePerNight}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          bookingStatusStyle[room.bookingStatus]
                        }`}
                      >
                        {room.bookingStatus === "Available" ? "თავისუფალი" : "დაკავებული"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
