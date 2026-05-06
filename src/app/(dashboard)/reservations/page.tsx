"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  LogIn,
  LogOut,
  Pencil,
  FileText,
  BedDouble,
  Users,
  CalendarCheck,
  TrendingDown,
  AlertCircle,
  Calendar,
} from "lucide-react";
import CheckInModal from "./CheckInModal";

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


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FIELD =
  " border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#0f1f38]/15 focus:border-[#0f1f38] transition bg-white";

export default function ReservationsPage() {
  const router = useRouter();

  // ── List ──────────────────────────────────────────────────────────────────
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<number, "checkin" | "checkout" | undefined>>({});
  const [dateMode, setDateMode] = useState<"today" | "yesterday" | "custom">("today");
  const [customDate, setCustomDate] = useState(() => todayISO());
  const [userRole, setUserRole] = useState("");
  const [search, setSearch] = useState("");
  const [checkInModalId, setCheckInModalId] = useState<number | null>(null);

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
  function handleCheckIn(id: number) {
    setCheckInModalId(id);
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

  // ── Selected date ────────────────────────────────────────────────────────
  const selectedDate = dateMode === "today" ? today : dateMode === "yesterday" ? yesterdayISO() : customDate;

  // ── Three separate filtered lists ────────────────────────────────────────
  const reservationRows = useMemo(() => {
    let data = rows.filter((r) => isPending(r.bookingStatus) && r.checkInISO <= selectedDate && r.checkOutISO > selectedDate);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((r) => r.guestName.toLowerCase().includes(q) || r.bookingNo.toLowerCase().includes(q) || r.roomNo.toLowerCase().includes(q));
    }
    return data;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, search, selectedDate]);

  const checkinRows = useMemo(() => {
    let data = rows.filter((r) => r.checkInISO === selectedDate && (isPending(r.bookingStatus) || isIn(r.bookingStatus)));
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((r) => r.guestName.toLowerCase().includes(q) || r.bookingNo.toLowerCase().includes(q) || r.roomNo.toLowerCase().includes(q));
    }
    return data;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, search, selectedDate]);

  const checkoutRows = useMemo(() => {
    let data = rows.filter((r) => r.checkOutISO === selectedDate && (isIn(r.bookingStatus) || isOut(r.bookingStatus)));
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((r) => r.guestName.toLowerCase().includes(q) || r.bookingNo.toLowerCase().includes(q) || r.roomNo.toLowerCase().includes(q));
    }
    return data;
  }, [rows, search, selectedDate]);

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
        </div>}
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

      {/* ── Toolbar: date filter + search ────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar size={14} className="text-[#c9a84c] shrink-0" />
          {(["today", "yesterday", "custom"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setDateMode(m)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                dateMode === m
                  ? "bg-[#0f1f38] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {m === "today" ? "Today" : m === "yesterday" ? "Yesterday" : "Specific Date"}
            </button>
          ))}
          {dateMode === "custom" && (
            <div className="relative">
              <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c9a84c] pointer-events-none z-10" />
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="pl-8 pr-3.5 py-1.5 text-sm font-medium text-slate-700 bg-white border border-[#0f1f38]/20 rounded-lg outline-none focus:ring-2 focus:ring-[#0f1f38]/15 focus:border-[#0f1f38] transition-all shadow-sm cursor-pointer hover:border-[#0f1f38]/40"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-64">
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

      {/* ── Loading / error ──────────────────────────────────────────────── */}
      {loading && (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-7 h-7 border-2 border-[#0f1f38] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading reservations…</p>
        </div>
      )}
      {listError && (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm text-rose-500">
          <AlertCircle size={24} className="mx-auto mb-2" />
          <p className="text-sm">{listError}</p>
        </div>
      )}

      {!loading && !listError && (
        <>
          {/* ── 1. Reservations ─────────────────────────────────────────── */}
          <SectionTable
            title="Reservations"
            accent="blue"
            Icon={BedDouble}
            rows={reservationRows}
            actionLoading={actionLoading}
            userRole={userRole}
            isIn={isIn}
            isOut={isOut}
            isPending={isPending}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onEdit={(id) => router.push(`/reservations/${id}/edit`)}
            onInvoice={(id) => router.push(`/reservations/${id}/invoice`)}
            emptyLabel="No pending reservations for this date"
          />

          {/* ── 2. Check-In ─────────────────────────────────────────────── */}
          <SectionTable
            title="Check-In"
            accent="emerald"
            Icon={LogIn}
            rows={checkinRows}
            actionLoading={actionLoading}
            userRole={userRole}
            isIn={isIn}
            isOut={isOut}
            isPending={isPending}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onEdit={(id) => router.push(`/reservations/${id}/edit`)}
            onInvoice={(id) => router.push(`/reservations/${id}/invoice`)}
            emptyLabel="No arrivals for this date"
          />

          {/* ── 3. Check-Out ────────────────────────────────────────────── */}
          <SectionTable
            title="Check-Out"
            accent="amber"
            Icon={LogOut}
            rows={checkoutRows}
            actionLoading={actionLoading}
            userRole={userRole}
            isIn={isIn}
            isOut={isOut}
            isPending={isPending}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onEdit={(id) => router.push(`/reservations/${id}/edit`)}
            onInvoice={(id) => router.push(`/reservations/${id}/invoice`)}
            emptyLabel="No departures for this date"
          />
        </>
      )}

      {/* ── Check-In Modal ─────────────────────────────────────────────── */}
      {checkInModalId !== null && (
        <CheckInModal
          bookingId={checkInModalId}
          onClose={() => setCheckInModalId(null)}
          onSuccess={() => { setCheckInModalId(null); fetchData(); }}
        />
      )}
    </div>
  );
}

// ── Reusable section table ────────────────────────────────────────────────────
const ACCENT_MAP = {
  blue:    { header: "bg-blue-50 border-blue-100",    icon: "bg-blue-500",    badge: "text-blue-700 bg-blue-50"    },
  emerald: { header: "bg-emerald-50 border-emerald-100", icon: "bg-emerald-500", badge: "text-emerald-700 bg-emerald-50" },
  amber:   { header: "bg-amber-50 border-amber-100",  icon: "bg-amber-500",   badge: "text-amber-700 bg-amber-50"  },
} as const;

type Accent = keyof typeof ACCENT_MAP;

interface SectionTableProps {
  title: string;
  accent: Accent;
  Icon: React.ElementType;
  rows: BookingRow[];
  actionLoading: Record<number, "checkin" | "checkout" | undefined>;
  userRole: string;
  isIn: (s: string) => boolean;
  isOut: (s: string) => boolean;
  isPending: (s: string) => boolean;
  onCheckIn: (id: number) => void;
  onCheckOut: (id: number) => void;
  onEdit: (id: number) => void;
  onInvoice: (id: number) => void;
  emptyLabel: string;
}

function SectionTable({
  title, accent, Icon, rows, actionLoading, userRole,
  isIn, isOut, isPending, onCheckIn, onCheckOut, onEdit, onInvoice, emptyLabel,
}: SectionTableProps) {
  const a = ACCENT_MAP[accent];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Section header */}
      <div className={`flex items-center justify-between px-5 py-3 border-b ${a.header}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg ${a.icon} flex items-center justify-center`}>
            <Icon size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-slate-700">{title}</span>
        </div>
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${a.badge}`}>
          {rows.length}
        </span>
      </div>

      {/* Column header */}
      <div className="grid grid-cols-7 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 px-5 py-2.5">
        <div>Guest</div>
        <div>Room</div>
        <div>Type</div>
        <div>Check-In</div>
        <div>Check-Out</div>
        <div>Status</div>
        <div className="text-right">Actions</div>
      </div>

      {rows.length === 0 ? (
        <div className="py-10 text-center">
          <BedDouble size={28} className="text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-400">{emptyLabel}</p>
        </div>
      ) : (
        rows.map((r, idx) => {
          const due        = r.totalPrice - r.paidAmount;
          const isPaid     = due <= 0;
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
              <div className="min-w-0 pr-2">
                <p className="font-semibold text-slate-800 truncate">{r.guestName}</p>
                <p className="text-xs mt-0.5">
                  {isPaid
                    ? <span className="text-emerald-600 font-medium">Paid</span>
                    : <span className="text-amber-600 font-medium">Due {due.toFixed(2)}$</span>}
                </p>
              </div>
              <div>
                {r.roomNo !== "-"
                  ? <span className="bg-[#0f1f38] text-white text-[11px] font-bold px-2 py-1 rounded-lg">{r.roomNo}</span>
                  : <span className="text-slate-300 text-xs">—</span>}
              </div>
              <div className="text-slate-500 text-xs truncate pr-1">{r.roomType !== "-" ? r.roomType : "—"}</div>
              <div className="text-slate-600 text-xs font-medium">{r.checkIn}</div>
              <div className="text-slate-600 text-xs font-medium">{r.checkOut}</div>
              <div>
                {checkedOut ? (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full inline-block text-rose-600 bg-rose-50">Checked Out</span>
                ) : (
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full inline-block"
                    style={{ color: r.statusColor ?? "#64748b", backgroundColor: r.statusColor ? `${r.statusColor}1a` : "#f1f5f9" }}
                  >
                    {r.bookingStatus}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                {(!checkedOut || userRole === "SUPER_ADMIN" || userRole === "HOTEL_ADMIN") && (
                  <button onClick={() => onEdit(r.id)} title="Edit" className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-[#0f1f38] hover:border-[#0f1f38] transition-colors">
                    <Pencil size={12} />
                  </button>
                )}
                <button onClick={() => onInvoice(r.id)} title="Invoice" className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-[#c9a84c] hover:border-[#c9a84c] transition-colors">
                  <FileText size={12} />
                </button>
                {pending && (
                  <button onClick={() => onCheckIn(r.id)} disabled={!!act} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-semibold hover:bg-emerald-100 disabled:opacity-50 transition-colors border border-emerald-200">
                    <LogIn size={11} />{act === "checkin" ? "…" : "Check-In"}
                  </button>
                )}
                {checkedIn && (
                  <button onClick={() => onCheckOut(r.id)} disabled={!!act} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-semibold hover:bg-amber-100 disabled:opacity-50 transition-colors border border-amber-200">
                    <LogOut size={11} />{act === "checkout" ? "…" : "Check-Out"}
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
