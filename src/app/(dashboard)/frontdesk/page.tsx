"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_IN_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31];
const DAY_NAMES = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// Mock bookings: { guest, color, monthIndex (0-based), startDay, endDay, row }
const bookings = [
  { guest: "Andrew",     color: "bg-emerald-100", month: 11, startDay: 1,  endDay: 5,  row: 0 },
  { guest: "John",       color: "bg-amber-100",   month: 11, startDay: 12, endDay: 17, row: 0 },
  { guest: "Smith",      color: "bg-rose-100",    month: 11, startDay: 5,  endDay: 10, row: 1 },
  { guest: "Kabir Khan", color: "bg-amber-50",    month: 11, startDay: 1,  endDay: 5,  row: 2 },
  { guest: "Atharva",    color: "bg-emerald-100", month: 11, startDay: 8,  endDay: 12, row: 2 },
  { guest: "Erikal",     color: "bg-sky-100",     month: 11, startDay: 5,  endDay: 8,  row: 3 },
  { guest: "Maddy",      color: "bg-emerald-50",  month: 11, startDay: 16, endDay: 19, row: 1 },
  { guest: "Cinderella", color: "bg-sky-100",     month: 11, startDay: 14, endDay: 18, row: 3 },
  { guest: "Maria",      color: "bg-rose-100",    month: 11, startDay: 17, endDay: 19, row: 4 },
];

const STATUS_FILTERS = [
  { label: "Due In",      color: "bg-amber-50 text-amber-700 border border-amber-200" },
  { label: "Checked-out", color: "bg-sky-50 text-sky-700 border border-sky-200" },
  { label: "Due Out",     color: "bg-rose-50 text-rose-700 border border-rose-200" },
  { label: "Checked-In",  color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
];

export default function FrontdeskPage() {
  const [year, setYear] = useState(2023);
  const [activeMonth, setActiveMonth] = useState(11); // December (0-based)
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const daysInMonth = DAYS_IN_MONTH[activeMonth];
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Get day-of-week name for a given day (simplified: assume Dec 2023 starts on Friday)
  // Dec 1 2023 = Friday = index 4 in Mon..Sun
  function getDayName(day: number): string {
    const startOffset = 4; // Dec 1, 2023 = Friday
    return DAY_NAMES[(startOffset + day - 1) % 7];
  }

  const CELL_W = 44; // px per day cell
  const ROW_H = 48;  // px per booking row
  const NUM_ROWS = 5;

  const filteredBookings = bookings.filter((b) => {
    const matchSearch = search === "" || b.guest.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        {/* Year nav */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setYear((y) => y - 1)}
            className="p-1 rounded border border-slate-200 hover:bg-slate-100"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="font-semibold text-zinc-800 w-12 text-center text-sm">{year}</span>
          <button
            onClick={() => setYear((y) => y + 1)}
            className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-500 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Status filters */}
        <div className="flex gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setActiveFilter(activeFilter === f.label ? null : f.label)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${f.color} ${
                activeFilter === f.label ? "ring-2 ring-offset-1 ring-zinc-300" : ""
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 border border-zinc-200 rounded-lg px-3 py-1.5 bg-white w-64">
          <Search size={13} className="text-zinc-400" />
          <input
            type="text"
            placeholder="Search by booking no or room no"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none text-xs text-zinc-600 bg-transparent placeholder-zinc-400"
          />
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-zinc-100 overflow-x-auto">
        {/* Month tabs */}
        <div className="flex border-b border-zinc-100">
          {MONTHS.map((m, i) => (
            <button
              key={m}
              onClick={() => setActiveMonth(i)}
              className={`flex-1 py-2 text-[11px] font-medium text-center transition-colors border-b-2 ${
                activeMonth === i
                  ? "border-orange-500 text-orange-600 bg-orange-50/50"
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Day header */}
        <div className="flex border-b border-zinc-100">
          {/* row label spacer */}
          <div className="w-0" />
          {days.map((d) => (
            <div key={d} className="text-center shrink-0 py-1" style={{ width: CELL_W }}>
              <div className="text-[9px] text-zinc-300">{getDayName(d)}</div>
              <div className="text-[11px] font-medium text-zinc-500">{String(d).padStart(2, "0")}</div>
            </div>
          ))}
        </div>

        {/* Booking rows */}
        <div
          className="relative"
          style={{ height: NUM_ROWS * ROW_H, minWidth: daysInMonth * CELL_W }}
        >
          {/* Grid lines */}
          {days.map((d) => (
            <div
              key={d}
              className="absolute top-0 bottom-0 border-r border-zinc-50"
              style={{ left: (d - 1) * CELL_W, width: CELL_W }}
            />
          ))}
          {/* Row dividers */}
          {Array.from({ length: NUM_ROWS }).map((_, r) => (
            <div
              key={r}
              className="absolute left-0 right-0 border-b border-zinc-50"
              style={{ top: r * ROW_H, height: ROW_H }}
            />
          ))}

          {/* Booking bars */}
          {filteredBookings
            .filter((b) => b.month === activeMonth)
            .map((b, idx) => {
              const left = (b.startDay - 1) * CELL_W + 2;
              const width = (b.endDay - b.startDay + 1) * CELL_W - 4;
              const top = b.row * ROW_H + 10;
              return (
                <div
                  key={idx}
                  className={`absolute rounded-lg ${b.color} flex items-center px-2.5 text-xs font-medium text-zinc-700 cursor-pointer hover:brightness-95 transition-all shadow-sm`}
                  style={{ left, width, top, height: ROW_H - 20 }}
                  title={b.guest}
                >
                  {b.guest}
                </div>
              );
            })}
        </div>
      </div>

      {/* Add Booking button */}
      <div className="flex justify-end">
        <button className="bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">
          + Add Booking
        </button>
      </div>
    </div>
  );
}

