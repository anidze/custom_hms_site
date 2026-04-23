"use client";

import { useState } from "react";
import { Search, ChevronDown, Pencil } from "lucide-react";

type AmountStatus = "Paid" | "Due";

interface Reservation {
  id: number;
  guestName: string;
  bookingNo: string;
  bookingSource: string;
  roomNo: string;
  roomType: string;
  roomStatus: "Clean" | "Dirty" | "Inspected";
  totalAmount: string;
  amountStatus: AmountStatus;
  dueAmount?: string;
  selected: boolean;
}

const mockReservations: Reservation[] = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  guestName: "Ritesh Kumar",
  bookingNo: "AL0007",
  bookingSource: "booking.com",
  roomNo: String(201 + i),
  roomType: "Angela Suite",
  roomStatus: i % 3 === 1 ? "Dirty" : i % 3 === 2 ? "Inspected" : "Clean",
  totalAmount: "1250$",
  amountStatus: i === 1 ? "Due" : "Paid",
  dueAmount: i === 1 ? "200$" : undefined,
  selected: i === 0,
}));

const ROOM_STATUS_COLORS: Record<string, string> = {
  Clean: "text-green-600",
  Dirty: "text-red-500",
  Inspected: "text-blue-500",
};

export default function ReservationsPage() {
  const [tab, setTab] = useState<"checkin" | "checkout">("checkin");
  const [guestFilter] = useState("All guest");
  const [dateFilter] = useState("Today");
  const [search, setSearch] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);

  function toggleSelect(id: number) {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  }

  const filtered = reservations.filter((r) =>
    search === "" ||
    r.guestName.toLowerCase().includes(search.toLowerCase()) ||
    r.bookingNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("checkin")}
          className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${
            tab === "checkin"
              ? "bg-[#d56f4d] text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Check-In
        </button>
        <button
          onClick={() => setTab("checkout")}
          className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${
            tab === "checkout"
              ? "bg-[#d56f4d] text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Check-Out
        </button>
      </div>

      {/* Filters row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {/* Guest filter */}
          <button className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
            {guestFilter}
            <ChevronDown size={14} />
          </button>
          {/* Date filter */}
          <button className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
            {dateFilter}
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white w-72">
          <input
            type="text"
            placeholder="Search by using booking name or no"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm text-slate-600 bg-transparent"
          />
          <Search size={14} className="text-[#d56f4d]" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[40px_1fr_1fr_1fr_80px_1fr_1fr_1fr_1fr_80px] text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100 px-4 py-3">
          <div />
          <div>Guest Name</div>
          <div>Booking No</div>
          <div>Booking Source</div>
          <div>Room No</div>
          <div>Room Type</div>
          <div>Room Status</div>
          <div>Total Amount</div>
          <div>Amount Status</div>
          <div />
        </div>

        {/* Rows */}
        {filtered.map((r, idx) => (
          <div
            key={r.id}
            className={`grid grid-cols-[40px_1fr_1fr_1fr_80px_1fr_1fr_1fr_1fr_80px] items-center px-4 py-3 border-b border-slate-50 text-sm transition-colors ${
              r.selected ? "bg-[#fff4f1]" : idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
            } hover:bg-[#fff4f1]`}
          >
            {/* Checkbox */}
            <div className="flex items-center">
              {r.selected ? (
                <span className="w-4 h-4 rounded-full bg-[#d56f4d] block" />
              ) : (
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#d56f4d] cursor-pointer"
                  onChange={() => toggleSelect(r.id)}
                />
              )}
            </div>

            <div className="font-medium text-slate-700">{r.guestName}</div>
            <div className="text-slate-500">{r.bookingNo}</div>
            <div className="text-slate-500">{r.bookingSource}</div>
            <div className="text-slate-700 font-semibold">{r.roomNo}</div>
            <div className="text-slate-500">{r.roomType}</div>
            <div className={`font-medium ${ROOM_STATUS_COLORS[r.roomStatus]}`}>{r.roomStatus}</div>
            <div className="text-slate-700 font-semibold">{r.totalAmount}</div>

            {/* Amount Status */}
            <div className="text-sm">
              {r.amountStatus === "Paid" ? (
                <span className="text-slate-700 font-medium">Paid</span>
              ) : (
                <div className="flex flex-col leading-tight">
                  <span className="text-slate-500">Due</span>
                  <span className="text-red-500 font-semibold">{r.dueAmount}</span>
                </div>
              )}
            </div>

            {/* Edit */}
            <div>
              <button className="flex items-center gap-1 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 transition-colors">
                <Pencil size={12} />
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Booking */}
      <div className="flex justify-end">
        <button className="bg-[#d56f4d] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#c05f3d] transition-colors">
          + Add Booking
        </button>
      </div>
    </div>
  );
}

