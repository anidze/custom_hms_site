"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  LogIn,
  LogOut,
  Pencil,
  BedDouble,
  Users,
  CalendarCheck,
  TrendingDown,
  AlertCircle,
  Calendar,
} from "lucide-react";

interface BookingRow {
  id: number;
  guestName: string;
  bookingNo: string;
  bookingSource: string;
  roomNo: string;
  roomType: string;
  bookingStatus: string;
  statusColor: string | null;
  totalPrice: number;
  paidAmount: number;
  checkIn: string;
  checkOut: string;
  checkInISO: string;
  checkOutISO: string;
  nights: number;
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}
function yesterdayISO() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}


const FIELD =
  "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#0f1f38]/15 focus:border-[#0f1f38] transition bg-white";

export default function ReservationsPage() {
  const router = useRouter();

  // ── List ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"reservations" | "checkin" | "checkout">("reservations");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<number, "checkin" | "checkout" | undefined>>({});
  const [dateMode, setDateMode] = useState< "today" | "yesterday" | "custom">("today");
  const [customDate, setCustomDate] = useState(() => todayISO());
  const [userRole, setUserRole] = useState("");

  const today = todayISO();

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const res = await fetch("/api/reservations");
      if (!res.ok) throw new Error("Server error");
      setRows(await res.json());
    } catch {
      setListError("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.roleName) setUserRole(d.roleName); })
      .catch(() => {});
  }, []);

  // ── Check-In / Check-Out ──────────────────────────────────────────────────
  async function handleCheckIn(id: number) {
    setActionLoading((p) => ({ ...p, [id]: "checkin" }));
    try {
      if ((await fetch(`/api/bookings/${id}/checkin`, { method: "POST" })).ok) await fetchData();
    } finally {
      setActionLoading((p) => ({ ...p, [id]: undefined }));
    }
  }
  async function handleCheckOut(id: number) {
    setActionLoading((p) => ({ ...p, [id]: "checkout" }));
    try {
      if ((await fetch(`/api/bookings/${id}/checkout`, { method: "POST" })).ok) await fetchData();
    } finally {
      setActionLoading((p) => ({ ...p, [id]: undefined }));
    }
  }

  // ── Status helpers ────────────────────────────────────────────────────────
  function isIn(s: string) {
    const l = s.toLowerCase();
    return (l.includes("check") && l.includes("in") && !l.includes("out")) || l === "in-house";
  }
  function isOut(s: string) {
    const l = s.toLowerCase();
    return l.includes("check") && l.includes("out");
  }
  function isPending(s: string) { return !isIn(s) && !isOut(s); }

  // ── Filtered rows ─────────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    let data = rows;
    // Date filter
    if (dateMode !== "all") {
      const sel = dateMode === "today" ? today : dateMode === "yesterday" ? yesterdayISO() : customDate;
      if (sel) data = data.filter((r) => r.checkInISO <= sel && r.checkOutISO >= sel);
    }
    // Tab filter
    if (activeTab === "reservations") data = data.filter((r) => isPending(r.bookingStatus));
    else if (activeTab === "checkin") data = data.filter((r) => r.checkInISO === today && isPending(r.bookingStatus));
    else if (activeTab === "checkout") data = data.filter((r) => isIn(r.bookingStatus));
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((r) =>
        r.guestName.toLowerCase().includes(q) ||
        r.bookingNo.toLowerCase().includes(q) ||
        r.roomNo.toLowerCase().includes(q)
      );
    }
    return data;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, activeTab, search, today, dateMode, customDate]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     rows.length,
    arriving:  rows.filter((r) => r.checkInISO === today && isPending(r.bookingStatus)).length,
    inHouse:   rows.filter((r) => isIn(r.bookingStatus)).length,
    departing: rows.filter((r) => r.checkOutISO === today && isIn(r.bookingStatus)).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [rows, today]);

  const qNights = 0; // kept for commented-out quick form
  void qNights;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Reservations</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage all hotel reservations and guest workflow</p>
        </div>
        <button
          onClick={() => router.push("/reservations/new")}
          className="flex items-center gap-2 bg-[#0f1f38] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a3152] transition-colors shadow-sm"
        >
          <Plus size={15} />
          New Reservation
        </button>
      </div>

      {/* ── Quick Reservation ─────────────────────────────────────────────── */}
      {/* <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-linear-to-r from-[#0f1f38] to-[#1e3a5f]">
          <BedDouble size={17} className="text-[#c9a84c] shrink-0" />
          <h2 className="text-sm font-bold text-white tracking-wide">Quick Reservation</h2>
          {qNights > 0 && (
            <span className="ml-auto text-xs text-white/60 font-medium">
              {qNights} {qNights === 1 ? "night" : "nights"}
            </span>
          )}
        </div>
        <form onSubmit={handleQuickCreate} className="p-5">
          <div className="grid grid-cols-[1.8fr_1fr_1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Guest full name"
                value={qFullName}
                onChange={(e) => { setQFullName(e.target.value); setQError(null); }}
                className={FIELD}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Check-In <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={qCheckIn}
                min={todayISO()}
                onChange={(e) => { setQCheckIn(e.target.value); setQError(null); }}
                className={FIELD}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Check-Out <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={qCheckOut}
                min={qCheckIn || todayISO()}
                onChange={(e) => { setQCheckOut(e.target.value); setQError(null); }}
                className={FIELD}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Room Type
              </label>
              <div className="relative">
                <select
                  value={qRoomType}
                  onChange={(e) => setQRoomType(e.target.value)}
                  className={`${FIELD} appearance-none pr-9`}
                >
                  <option value="">Any Type</option>
                  {roomTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <button
              type="submit"
              disabled={qSubmitting}
              className="bg-[#c9a84c] hover:bg-[#b8972a] disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap shadow-sm"
            >
              {qSubmitting ? "Creating…" : "Create Reservation"}
            </button>
          </div>
          {qError && (
            <p className="mt-2.5 text-xs text-rose-500 flex items-center gap-1.5">
              <AlertCircle size={13} /> {qError}
            </p>
          )}
        </form>
      </div> */}

      {/* ── Date Filter ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-3.5 flex-wrap">
        <Calendar size={15} className="text-[#c9a84c] shrink-0" />
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Show for:</span>
        {([ "today", "yesterday", "custom"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setDateMode(m)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              dateMode === m
                ? "bg-[#0f1f38] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            { m === "today" ? "Today" : m === "yesterday" ? "Yesterday" : "Specific Date"}
          </button>
        ))}
        {dateMode === "custom" && (
          <input
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className={`${FIELD} w-40 ml-1`}
          />
        )}
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Reservations", value: stats.total,     Icon: BedDouble,     color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-100"    },
          { label: "Arriving Today",      value: stats.arriving,  Icon: CalendarCheck, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: "In-House",            value: stats.inHouse,   Icon: Users,         color: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-100"  },
          { label: "Departing Today",     value: stats.departing, Icon: TrendingDown,  color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-100"   },
        ].map(({ label, value, Icon, color, bg, border }) => (
          <div key={label} className={`bg-white rounded-xl border ${border} shadow-sm p-4 flex items-center justify-between gap-3`}>
            <div>
              <p className="text-xs text-slate-400 font-medium leading-tight">{label}</p>
              <p className="text-3xl font-bold text-slate-800 mt-1 leading-none">{value}</p>
            </div>
            <div className={`${bg} ${color} p-3 rounded-xl shrink-0`}>
              <Icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs + Search ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          {([ "reservations", "checkin", "checkout"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeTab === key
                  ? "bg-[#0f1f38] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {key === "reservations" ? "Reservations" : key === "checkin" ? "Check-In" : "Check-Out"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm flex-1 max-w-80">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search guest, booking no, room…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm text-slate-600 bg-transparent placeholder-slate-400"
          />
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-7 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 px-5 py-3">
          <div>Guest</div>
          <div>Room</div>
          <div>Type</div>
          <div>Check-In</div>
          <div>Check-Out</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        {loading && (
          <div className="py-16 text-center">
            <div className="w-7 h-7 border-2 border-[#0f1f38] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400">Loading reservations…</p>
          </div>
        )}

        {listError && (
          <div className="py-16 text-center text-rose-500">
            <AlertCircle size={24} className="mx-auto mb-2" />
            <p className="text-sm">{listError}</p>
          </div>
        )}

        {!loading && !listError && filteredRows.length === 0 && (
          <div className="py-16 text-center">
            <BedDouble size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-medium">No reservations found</p>
            <p className="text-xs text-slate-300 mt-1">Try a different tab or search term</p>
          </div>
        )}

        {!loading &&
          !listError &&
          filteredRows.map((r, idx) => {
            const due = r.totalPrice - r.paidAmount;
            const isPaid = due <= 0;
            const checkedIn  = isIn(r.bookingStatus);
            const checkedOut = isOut(r.bookingStatus);
            const pending    = isPending(r.bookingStatus);
            const act        = actionLoading[r.id];

            return (
              <div
                key={r.id}
                className={`grid grid-cols-7 items-center px-5 py-3.5 border-b border-slate-50 text-sm hover:bg-slate-50/60 transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/20"
                }`}
              >
                {/* Guest */}
                <div className="min-w-0 pr-2">
                  <p className="font-semibold text-slate-800 truncate">{r.guestName}</p>
                  <p className="text-xs mt-0.5">
                    {isPaid
                      ? <span className="text-emerald-600 font-medium">Paid</span>
                      : <span className="text-amber-600 font-medium">Due {due.toFixed(2)}$</span>}
                  </p>
                </div>

                {/* Room */}
                <div>
                  {r.roomNo !== "-"
                    ? <span className="bg-[#0f1f38] text-white text-[11px] font-bold px-2 py-1 rounded-lg">{r.roomNo}</span>
                    : <span className="text-slate-300 text-xs">—</span>}
                </div>

                {/* Type */}
                <div className="text-slate-500 text-xs truncate pr-1">{r.roomType !== "-" ? r.roomType : "—"}</div>

                {/* Check-In date */}
                <div className="text-slate-600 text-xs font-medium">{r.checkIn}</div>

                {/* Check-Out date */}
                <div className="text-slate-600 text-xs font-medium">{r.checkOut}</div>

                {/* Status badge */}
                <div>
                  {checkedOut ? (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full inline-block text-rose-600 bg-rose-50">
                      Checked Out
                    </span>
                  ) : (
                    <span
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full inline-block"
                      style={{
                        color: r.statusColor ?? "#64748b",
                        backgroundColor: r.statusColor ? `${r.statusColor}1a` : "#f1f5f9",
                      }}
                    >
                      {r.bookingStatus}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 justify-end">
                  {(!checkedOut || userRole === "SUPER_ADMIN" || userRole === "HOTEL_ADMIN") && (
                    <button
                      onClick={() => router.push(`/reservations/${r.id}/edit`)}
                      title="Edit"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-[#0f1f38] hover:border-[#0f1f38] transition-colors"
                    >
                      <Pencil size={12} />
                    </button>
                  )}

                  {pending && (
                    <button
                      onClick={() => handleCheckIn(r.id)}
                      disabled={!!act}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-semibold hover:bg-emerald-100 disabled:opacity-50 transition-colors border border-emerald-200"
                    >
                      <LogIn size={11} />
                      {act === "checkin" ? "…" : "Check-In"}
                    </button>
                  )}

                  {checkedIn && (
                    <button
                      onClick={() => handleCheckOut(r.id)}
                      disabled={!!act}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-semibold hover:bg-amber-100 disabled:opacity-50 transition-colors border border-amber-200"
                    >
                      <LogOut size={11} />
                      {act === "checkout" ? "…" : "Check-Out"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
