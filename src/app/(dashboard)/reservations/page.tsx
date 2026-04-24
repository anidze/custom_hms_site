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
  Clean: "text-emerald-600",
  Dirty: "text-rose-500",
  Inspected: "text-sky-500",
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
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "checkin"
              ? "bg-orange-500 text-white"
              : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
          }`}
        >
          Check-In
        </button>
        <button
          onClick={() => setTab("checkout")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "checkout"
              ? "bg-orange-500 text-white"
              : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
          }`}
        >
          Check-Out
        </button>
      </div>

      {/* Filters row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {/* Guest filter */}
          <button className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors">
            {guestFilter}
            <ChevronDown size={13} />
          </button>
          {/* Date filter */}
          <button className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors">
            {dateFilter}
            <ChevronDown size={13} />
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 border border-zinc-200 rounded-lg px-3 py-2 bg-white w-72">
          <input
            type="text"
            placeholder="Search by using booking name or no"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none text-xs text-zinc-600 bg-transparent placeholder-zinc-400"
          />
          <Search size={13} className="text-orange-400" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[40px_1fr_1fr_1fr_80px_1fr_1fr_1fr_1fr_80px] text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 px-4 py-3">
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
            className={`grid grid-cols-[40px_1fr_1fr_1fr_80px_1fr_1fr_1fr_1fr_80px] items-center px-4 py-3 border-b border-zinc-50 text-sm transition-colors ${
              r.selected ? "bg-orange-50" : idx % 2 === 0 ? "bg-white" : "bg-zinc-50/50"
            } hover:bg-orange-50/50`}
          >
            {/* Checkbox */}
            <div className="flex items-center">
              {r.selected ? (
                <span className="w-3.5 h-3.5 rounded-full bg-orange-500 block" />
              ) : (
                <input type="checkbox" className="w-4 h-4 accent-orange-500 cursor-pointer"
                  onChange={() => toggleSelect(r.id)} />
              )}
            </div>

            <div className="font-medium text-zinc-800">{r.guestName}</div>
            <div className="text-zinc-400 text-xs">{r.bookingNo}</div>
            <div className="text-zinc-400 text-xs">{r.bookingSource}</div>
            <div className="text-zinc-700 font-semibold text-xs">{r.roomNo}</div>
            <div className="text-zinc-400 text-xs">{r.roomType}</div>
            <div className={`font-medium ${ROOM_STATUS_COLORS[r.roomStatus]}`}>{r.roomStatus}</div>
            <div className="text-slate-700 font-semibold">{r.totalAmount}</div>

            {/* Amount Status */}
            <div className="text-sm">
              {r.amountStatus === "Paid" ? (
                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Paid</span>
              ) : (
                <div className="flex flex-col leading-tight">
                  <span className="text-[11px] text-zinc-400">Due</span>
                  <span className="text-xs text-rose-500 font-semibold">{r.dueAmount}</span>
                </div>
              )}
            </div>

            {/* Edit */}
            <div>
              <button className="flex items-center gap-1 border border-zinc-200 rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 transition-colors">
                <Pencil size={11} />
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Booking */}
      <div className="flex justify-end">
        <button className="bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">
          + Add Booking
        </button>
      </div>
    </div>
  );
}

