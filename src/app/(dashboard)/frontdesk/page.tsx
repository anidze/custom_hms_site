"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Search, User, BedDouble, LogIn, LogOut, Moon } from "lucide-react";
import { useRouter } from "next/navigation";

const MONTHS   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const BAR_COLORS = [
  "bg-emerald-100 text-emerald-800",
  "bg-amber-100 text-amber-800",
  "bg-sky-100 text-sky-800",
  "bg-rose-100 text-rose-800",
  "bg-violet-100 text-violet-800",
  "bg-orange-100 text-orange-800",
];

interface ApiRoom {
  id: number;
  room_number: string;
  room_type_name: string;
}

interface ApiBooking {
  id: number;
  room_id: number;
  guest_name: string;
  check_in: string;   // "YYYY-MM-DD"
  check_out: string;  // "YYYY-MM-DD"
  booking_status: string;
  status_color: string;
}

const CELL_W = 44; // px per day
const ROW_H  = 48; // px per room row
const LEFT_W = 80; // px for room label column

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getDayName(year: number, month: number, day: number): string {
  const monBased = (new Date(year, month, day).getDay() + 6) % 7;
  return DAY_NAMES[monBased];
}

export default function FrontdeskPage() {
  const router = useRouter();
  const now = new Date();
  const [year, setYear]               = useState(now.getFullYear());
  const [activeMonth, setActiveMonth] = useState(now.getMonth()); // 0-based
  const [search, setSearch]           = useState("");
  const [rooms, setRooms]             = useState<ApiRoom[]>([]);
  const [bookings, setBookings]       = useState<ApiBooking[]>([]);
  const [loading, setLoading]         = useState(true);
  const [tooltip, setTooltip] = useState<{ booking: ApiBooking; x: number; y: number } | null>(null);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      try {
        const r    = await fetch(`/api/frontdesk/bookings?year=${year}&month=${activeMonth + 1}`, { signal: controller.signal });
        const data = await r.json();
        setRooms(data.rooms    ?? []);
        setBookings(data.bookings ?? []);
      } catch (err) {
        if (!controller.signal.aborted) console.error(err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [year, activeMonth]);

  const daysCount = useMemo(() => daysInMonth(year, activeMonth), [year, activeMonth]);
  const days      = useMemo(() => Array.from({ length: daysCount }, (_, i) => i + 1), [daysCount]);
  const roomIndex = useMemo(() => new Map<number, number>(rooms.map((r, i) => [r.id, i])), [rooms]);
  const roomMap   = useMemo(() => new Map<number, ApiRoom>(rooms.map((r) => [r.id, r])), [rooms]);
  const filtered  = useMemo(
    () => search === "" ? bookings : bookings.filter((b) => b.guest_name.toLowerCase().includes(search.toLowerCase())),
    [bookings, search]
  );

  function barProps(b: ApiBooking) {
    const monthStart = new Date(year, activeMonth, 1);
    const monthEnd   = new Date(year, activeMonth, daysCount);
    const cin  = new Date(b.check_in);
    const cout = new Date(b.check_out);

    const startDay = cin  < monthStart ? 1            : cin.getDate();
    const endDay   = cout > monthEnd   ? daysCount    : cout.getDate();

    return {
      left:  (startDay - 1) * CELL_W + 2,
      width: Math.max((endDay - startDay + 1) * CELL_W - 4, CELL_W / 2),
      top:   (roomIndex.get(b.room_id) ?? 0) * ROW_H + 10,
    };
  }

  const numRows = Math.max(rooms.length, 1);

  return (
    <div className="space-y-4">
      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setYear((y) => y - 1)}
            className="p-1 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-500 transition-colors"
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

        <div className="flex items-center gap-2 border border-zinc-200 rounded-lg px-3 py-1.5 bg-white w-64">
          <Search size={13} className="text-zinc-400" />
          <input
            type="text"
            placeholder="Search by guest name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none text-xs text-zinc-600 bg-transparent placeholder-zinc-400"
          />
        </div>
      </div>

      {/* ── Gantt calendar ───────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
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

        {loading ? (
          <div className="flex items-center justify-center h-40 text-zinc-400 text-sm">
            Loading...
          </div>
        ) : (
          <div className="flex overflow-x-auto">
            {/* ── Room labels column ───────────────────────── */}
            <div className="shrink-0 border-r border-zinc-100" style={{ width: LEFT_W }}>
              {/* header spacer aligned with day-name header */}
              <div className="h-10 border-b border-zinc-100 flex items-center px-3">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase">Room</span>
              </div>
              {rooms.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center px-3 border-b border-zinc-50"
                  style={{ height: ROW_H }}
                >
                  <span className="text-xs font-medium text-zinc-700 truncate">{r.room_number}</span>
                </div>
              ))}
              {rooms.length === 0 && (
                <div className="flex items-center justify-center text-zinc-400 text-xs px-2 h-20">
                  No rooms
                </div>
              )}
            </div>

            {/* ── Gantt area ───────────────────────────────── */}
            <div className="overflow-x-auto flex-1 min-w-0">
              {/* Day header */}
              <div className="flex border-b border-zinc-100 h-10">
                {days.map((d) => (
                  <div key={d} className="text-center shrink-0 py-1" style={{ width: CELL_W }}>
                    <div className="text-[9px] text-zinc-300">{getDayName(year, activeMonth, d)}</div>
                    <div className="text-[11px] font-medium text-zinc-500">{String(d).padStart(2, "0")}</div>
                  </div>
                ))}
              </div>

              {/* Bars */}
              <div
                className="relative"
                style={{ height: numRows * ROW_H, minWidth: daysCount * CELL_W }}
              >
                {/* Vertical grid */}
                {days.map((d) => (
                  <div
                    key={d}
                    className="absolute top-0 bottom-0 border-r border-zinc-50"
                    style={{ left: (d - 1) * CELL_W, width: CELL_W }}
                  />
                ))}
                {/* Horizontal row dividers */}
                {Array.from({ length: numRows }).map((_, r) => (
                  <div
                    key={r}
                    className="absolute left-0 right-0 border-b border-zinc-50"
                    style={{ top: r * ROW_H, height: ROW_H }}
                  />
                ))}

                {/* Booking bars */}
                {filtered.map((b) => {
                  const { left, width, top } = barProps(b);
                  const sl = b.booking_status.toLowerCase();
                  const isOut  = sl.includes("check") && sl.includes("out");
                  const isIn   = (sl.includes("check") && sl.includes("in") && !sl.includes("out")) || sl === "in-house";
                  const isNo   = sl.includes("no") && sl.includes("show");
                  const isCan  = sl.includes("cancel");
                  const barBg  = isCan || isNo
                    ? "bg-slate-100 text-slate-400 line-through opacity-60"
                    : isOut
                    ? "bg-slate-200 text-slate-500 opacity-80"
                    : isIn
                    ? "bg-blue-100 text-blue-800"
                    : BAR_COLORS[b.id % BAR_COLORS.length];
                  return (
                    <div
                      key={b.id}
                      className={`absolute rounded-lg flex items-center px-2.5 text-xs font-medium cursor-pointer hover:brightness-95 transition-all shadow-sm overflow-hidden ${barBg}`}
                      style={{ left, width, top, height: ROW_H - 20 }}
                      onMouseEnter={(e) => {
                        if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
                        setTooltip({ booking: b, x: e.clientX, y: e.clientY });
                      }}
                      onMouseMove={(e) => {
                        setTooltip((t) => t ? { ...t, x: e.clientX, y: e.clientY } : null);
                      }}
                      onMouseLeave={() => {
                        tooltipTimeout.current = setTimeout(() => setTooltip(null), 120);
                      }}
                    >
                      <span className="truncate">{b.guest_name}</span>
                    </div>
                  );
                })}

                {rooms.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm">
                    No bookings with assigned rooms this month
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => router.push("/reservations/new")}
          className="bg-[#0f1f38] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#0d1a33] transition-colors"
        >
          Add Booking
        </button>
      </div>

      {/* ── Hover tooltip ─────────────────────────────────── */}
      {tooltip && (() => {
        const b = tooltip.booking;
        const room = roomMap.get(b.room_id);
        const cin  = new Date(b.check_in);
        const cout = new Date(b.check_out);
        const nights = Math.round((cout.getTime() - cin.getTime()) / 86400000);
        const fmt = (d: Date) =>
          d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        // keep card on screen
        const x = tooltip.x + 14;
        const y = tooltip.y - 10;
        return (
          <div
            className="fixed z-50 pointer-events-none"
            style={{ left: x, top: y }}
          >
            <div className="bg-[#0f1f38] text-white rounded-xl shadow-2xl border border-white/10 w-64 overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                    <User size={13} className="text-white" />
                  </div>
                  <span className="text-sm font-bold leading-tight truncate">{b.guest_name}</span>
                </div>
              </div>
              {/* Details */}
              <div className="px-4 py-3 space-y-2">
                <div className="flex items-center gap-2 text-zinc-300">
                  <BedDouble size={13} className="text-zinc-400 shrink-0" />
                  <span className="text-xs">
                    Room <span className="font-semibold text-white">{room?.room_number ?? "—"}</span>
                    {room?.room_type_name && (
                      <span className="text-zinc-400"> · {room.room_type_name}</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <LogIn size={13} className="text-emerald-400 shrink-0" />
                  <span className="text-xs">Check-in <span className="font-semibold text-white">{fmt(cin)}</span></span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <LogOut size={13} className="text-orange-400 shrink-0" />
                  <span className="text-xs">Check-out <span className="font-semibold text-white">{fmt(cout)}</span></span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Moon size={13} className="text-indigo-400 shrink-0" />
                  <span className="text-xs"><span className="font-semibold text-white">{nights}</span> night{nights !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ color: b.status_color, backgroundColor: b.status_color + "33" }}
                  >
                    {b.booking_status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}


