"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, Calendar, Users, UserPlus, Trash2, BedDouble } from "lucide-react";

interface AvailableRoom { id: number; room_number: string; floor: number | null; room_type_name: string; price_per_night: number; }

function iso(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function todayISO() { const d = new Date(); return iso(d.getFullYear(), d.getMonth(), d.getDate()); }
function addDaysISO(s: string, n: number) { const d = new Date(s + "T00:00:00"); d.setDate(d.getDate() + n); return iso(d.getFullYear(), d.getMonth(), d.getDate()); }
function nightsBetween(from: string, to: string) {
  if (!from || !to) return 0;
  return Math.max(0, Math.round((new Date(to + "T00:00:00").getTime() - new Date(from + "T00:00:00").getTime()) / 86400000));
}
function fmtLong(s: string) {
  if (!s) return "—";
  return new Date(s + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

interface GuestName { firstName: string; lastName: string; }
const blankGuest = (): GuestName => ({ firstName: "", lastName: "" });
const MAX_GUESTS = 20;
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const F = "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#0f1f38]/15 focus:border-[#0f1f38] transition";
const FE = "w-full bg-white border border-rose-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-rose-400/30 transition";
const S = "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-[#0f1f38]/15 focus:border-[#0f1f38] transition appearance-none";
const L = "block text-sm font-semibold text-slate-600 mb-1.5";

function Sel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

function SectionHeader({ icon: Icon, title, right }: { icon: React.ElementType; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-1 h-5 bg-[#c9a84c] rounded-full" />
      <Icon size={16} className="text-[#0f1f38]" />
      <h3 className="text-sm font-bold text-[#0f1f38] uppercase tracking-wider">{title}</h3>
      {right && <div className="ml-auto">{right}</div>}
    </div>
  );
}

/** Inline date-range calendar: click once for check-in, again for check-out. */
function RangeCalendar({ checkIn, checkOut, onSelect }: { checkIn: string; checkOut: string; onSelect: (ci: string, co: string) => void }) {
  const base = checkIn ? new Date(checkIn + "T00:00:00") : new Date();
  const [view, setView] = useState({ y: base.getFullYear(), m: base.getMonth() });
  const today = todayISO();

  const firstWeekday = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function clickDay(day: number) {
    const s = iso(view.y, view.m, day);
    if (s < today) return;
    if (!checkIn || (checkIn && checkOut)) {
      onSelect(s, "");
    } else if (s > checkIn) {
      onSelect(checkIn, s);
    } else {
      onSelect(s, "");
    }
  }
  function shift(delta: number) {
    const nm = view.m + delta;
    setView({ y: view.y + Math.floor(nm / 12), m: ((nm % 12) + 12) % 12 });
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/40 select-none">
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={() => shift(-1)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition"><ChevronLeft size={16} /></button>
        <span className="text-sm font-bold text-[#0f1f38]">{MONTHS[view.m]} {view.y}</span>
        <button type="button" onClick={() => shift(1)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition"><ChevronRight size={16} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => <div key={w} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">{w}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const s = iso(view.y, view.m, day);
          const isStart = s === checkIn;
          const isEnd = s === checkOut;
          const inRange = checkIn && checkOut && s > checkIn && s < checkOut;
          const isPast = s < today;
          const isToday = s === today;
          let cls = "h-9 rounded-lg text-sm flex items-center justify-center transition ";
          if (isStart || isEnd) cls += "bg-[#0f1f38] text-white font-bold ";
          else if (inRange) cls += "bg-[#c9a84c]/25 text-[#0f1f38] ";
          else if (isPast) cls += "text-slate-300 cursor-not-allowed ";
          else cls += "text-slate-600 hover:bg-slate-200 cursor-pointer ";
          return (
            <button type="button" key={i} disabled={isPast} onClick={() => clickDay(day)} className={cls}>
              <span className={isToday && !isStart && !isEnd ? "underline decoration-[#c9a84c] decoration-2 underline-offset-2" : ""}>{day}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function NewBookingPage() {
  const router = useRouter();
  const [guests, setGuests] = useState<GuestName[]>([blankGuest()]);
  const [checkIn, setCheckIn] = useState(todayISO);
  const [checkOut, setCheckOut] = useState(() => addDaysISO(todayISO(), 1));
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [roomType, setRoomType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Room-assignment modal state
  const [savedBookingId, setSavedBookingId] = useState<number | null>(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [assigningRoomId, setAssigningRoomId] = useState<number | null>(null);
  // Guards against React-strict-mode double invocation in dev.
  const submittedRef = useRef(false);

  useEffect(() => {
    fetch("/api/rooms").then((r) => r.json()).then((data: { room_type_name: string }[]) => {
      const unique = [...new Set(data.map((r) => r.room_type_name).filter(Boolean))];
      setRoomTypes(unique);
      if (unique.length > 0) setRoomType(unique[0]);
    }).catch(() => {});
  }, []);

  function updateGuest(i: number, key: keyof GuestName, value: string) {
    setGuests((prev) => prev.map((g, idx) => (idx === i ? { ...g, [key]: value } : g)));
    setFieldErrors((p) => ({ ...p, [`g${i}_${key}`]: "" }));
  }
  function setGuestCount(n: number) {
    const count = Math.max(1, Math.min(MAX_GUESTS, n || 1));
    setGuests((prev) => {
      const next = [...prev];
      while (next.length < count) next.push(blankGuest());
      while (next.length > count) next.pop();
      return next;
    });
  }
  function addGuest() { setGuests((p) => (p.length < MAX_GUESTS ? [...p, blankGuest()] : p)); }
  function removeGuest(i: number) { setGuests((p) => (p.length > 1 ? p.filter((_, idx) => idx !== i) : p)); }

  const nights = nightsBetween(checkIn, checkOut);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittedRef.current) return;
    const errs: Record<string, string> = {};
    guests.forEach((g, i) => {
      if (!g.firstName.trim()) errs[`g${i}_firstName`] = "Required";
      if (!g.lastName.trim()) errs[`g${i}_lastName`] = "Required";
    });
    if (!checkIn) errs.checkIn = "Select a check-in date";
    if (!checkOut) errs.checkOut = "Select a check-out date";
    if (!roomType) errs.roomType = "Room type is required";
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError("Please enter each guest's name and select the stay dates.");
      return;
    }
    setFieldErrors({});
    submittedRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const [primary, ...extra] = guests;
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: primary.firstName, lastName: primary.lastName,
          checkIn, checkOut, roomType,
          adults: String(guests.length), kids: "0", rooms: "1",
          guests: extra.map((g) => ({ firstName: g.firstName, lastName: g.lastName })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unknown error");
        submittedRef.current = false;
        return;
      }
      setSavedBookingId(data.bookingId);
      // Open the room-assignment popup and load available rooms once.
      setShowRoomModal(true);
      setLoadingRooms(true);
      try {
        // No roomType filter so the modal shows every available category;
        // the preferred type (the one selected on the form) is shown first.
        const roomsRes = await fetch(
          `/api/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}`
        );
        const roomsData = await roomsRes.json();
        setAvailableRooms(Array.isArray(roomsData) ? roomsData : []);
      } catch {
        setAvailableRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    } catch {
      setError("Network error");
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAssignRoom(roomId: number) {
    if (!savedBookingId) return;
    setAssigningRoomId(roomId);
    try {
      await fetch(`/api/bookings/${savedBookingId}/assign-room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });
    } catch {
      /* fall through — still navigate back to the reservations list */
    } finally {
      setAssigningRoomId(null);
      setShowRoomModal(false);
      router.push("/reservations");
    }
  }

  function skipRoomAssignment() {
    setShowRoomModal(false);
    router.push("/reservations");
  }

  // Group available rooms by category (room type) for the assignment modal.
  const groupedRooms = availableRooms.reduce<Record<string, AvailableRoom[]>>((acc, r) => {
    const key = r.room_type_name || "Other";
    (acc[key] = acc[key] || []).push(r);
    return acc;
  }, {});
  const categoryOrder = Object.keys(groupedRooms).sort((a, b) => (a === roomType ? -1 : b === roomType ? 1 : a.localeCompare(b)));
  const bookingNo = savedBookingId ? `AL${String(savedBookingId).padStart(4, "0")}` : null;

  return (
    <>
    <div className="max-w-3xl mx-auto pb-10">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <button type="button" onClick={() => router.push("/reservations")} className="hover:text-[#0f1f38] transition-colors font-medium">Reservations</button>
        <span>/</span>
        <span className="text-slate-600 font-semibold">New Booking</span>
      </div>

      <p className="text-sm text-slate-500 mb-5">
        Save the reservation with each guest&apos;s name and the stay dates. Full personal details for every guest can be added later from the reservation&apos;s edit page.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Guests (names only) ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <SectionHeader
            icon={Users}
            title="Guests"
            right={
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-500">Number of guests</label>
                <input
                  type="number" min={1} max={MAX_GUESTS} value={guests.length}
                  onChange={(e) => setGuestCount(parseInt(e.target.value))}
                  className="w-20 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#0f1f38]/15 focus:border-[#0f1f38] transition"
                />
              </div>
            }
          />
          <div className="space-y-3">
            {guests.map((g, i) => (
              <div key={i} className="flex items-end gap-3">
                <span className="inline-flex items-center justify-center w-7 h-7 mb-1 rounded-full bg-[#0f1f38] text-white text-xs font-bold shrink-0">{i + 1}</span>
                <div className="flex-1">
                  <label className={L}>{i === 0 ? "Primary Guest — First Name" : "First Name"} <span className="text-rose-500">*</span></label>
                  <input className={fieldErrors[`g${i}_firstName`] ? FE : F} placeholder="First Name" value={g.firstName} onChange={(e) => updateGuest(i, "firstName", e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className={L}>Last Name <span className="text-rose-500">*</span></label>
                  <input className={fieldErrors[`g${i}_lastName`] ? FE : F} placeholder="Last Name" value={g.lastName} onChange={(e) => updateGuest(i, "lastName", e.target.value)} />
                </div>
                <button type="button" onClick={() => removeGuest(i)} disabled={guests.length === 1}
                  className="mb-1.5 p-2 rounded-lg text-slate-400 hover:text-rose-500 disabled:opacity-30 disabled:hover:text-slate-400 transition" title="Remove guest">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          {guests.length < MAX_GUESTS && (
            <button type="button" onClick={addGuest} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-slate-300 text-sm font-semibold text-slate-500 hover:border-[#c9a84c] hover:text-[#0f1f38] transition-colors">
              <UserPlus size={15} /> Add Guest
            </button>
          )}
        </div>

        {/* ── Stay dates (calendar) ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <SectionHeader icon={Calendar} title="Stay Dates" />
          <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-6">
            <RangeCalendar checkIn={checkIn} checkOut={checkOut} onSelect={(ci, co) => { setCheckIn(ci); setCheckOut(co); setFieldErrors((p) => ({ ...p, checkIn: "", checkOut: "" })); }} />
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-In</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{fmtLong(checkIn)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-Out</p>
                <p className={`text-sm font-semibold mt-0.5 ${checkOut ? "text-slate-700" : "text-slate-400"}`}>{checkOut ? fmtLong(checkOut) : "Select on calendar"}</p>
              </div>
              <div className="flex flex-col items-center justify-center bg-[#0f1f38] rounded-xl py-4">
                <span className="text-3xl font-bold text-white leading-none">{nights || 0}</span>
                <span className="text-[10px] text-white/60 font-semibold uppercase tracking-wider mt-1">{nights === 1 ? "Night" : "Nights"}</span>
              </div>
              {(fieldErrors.checkIn || fieldErrors.checkOut) && <p className="text-xs text-rose-500 text-center">{fieldErrors.checkIn || fieldErrors.checkOut}</p>}
            </div>
          </div>
          <div className="mt-5 max-w-xs">
            <label className={L}>Room Type <span className="text-rose-500">*</span></label>
            <Sel>
              <select className={S + (fieldErrors.roomType ? " border-rose-400" : "")} value={roomType} onChange={(e) => { setRoomType(e.target.value); setFieldErrors((p) => ({ ...p, roomType: "" })); }}>
                <option value="">-- Select --</option>
                {roomTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Sel>
            {fieldErrors.roomType && <p className="text-xs text-rose-500 mt-1">{fieldErrors.roomType}</p>}
          </div>
        </div>

        {/* Actions */}
        {error && <p className="text-sm text-rose-500 text-center bg-rose-50 rounded-xl py-3 border border-rose-200 px-4">{error}</p>}
        <div className="flex items-center justify-between pt-1">
          <button type="button" onClick={() => router.push("/reservations")} className="px-6 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="px-8 py-2.5 rounded-xl bg-[#0f1f38] text-white text-sm font-semibold hover:bg-[#1a3152] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm">
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>

    {/* Room-assignment popup — opens after a successful Create */}
    {showRoomModal && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[85vh] border border-slate-200">
          <div className="px-6 py-5 border-b border-slate-100 bg-linear-to-r from-[#0f1f38] to-[#1e3a5f] rounded-t-2xl">
            <div className="flex items-center gap-3 mb-1">
              <BedDouble size={18} className="text-[#c9a84c]" />
              <h2 className="text-base font-bold text-white">Assign a Room</h2>
            </div>
            {bookingNo && <p className="text-xs text-white/60 font-mono">Confirmation #{bookingNo}</p>}
            <p className="text-xs text-white/70 mt-1">{fmtLong(checkIn)} → {fmtLong(checkOut)} &middot; {nights} {nights === 1 ? "night" : "nights"}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {loadingRooms ? (
              <div className="text-center py-10">
                <div className="w-6 h-6 border-2 border-[#0f1f38] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-slate-400">Loading available rooms…</p>
              </div>
            ) : availableRooms.length === 0 ? (
              <div className="text-center py-10">
                <BedDouble size={28} className="text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-medium">No available rooms for these dates</p>
                <p className="text-xs text-slate-400 mt-1">You can assign a room later from the reservation page.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {categoryOrder.map((cat) => (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold text-[#0f1f38] uppercase tracking-wider">{cat}</h3>
                      <span className="text-[10px] text-slate-400 font-semibold">{groupedRooms[cat].length} available</span>
                    </div>
                    <div className="space-y-2">
                      {groupedRooms[cat].map((room) => (
                        <div key={room.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-[#c9a84c] hover:bg-amber-50/30 transition-colors">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">Room {room.room_number}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Floor {room.floor ?? "—"} &middot; &#8382;{Number(room.price_per_night).toFixed(2)}/night
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAssignRoom(room.id)}
                            disabled={assigningRoomId !== null}
                            className="px-4 py-1.5 rounded-lg bg-[#0f1f38] text-white text-xs font-semibold hover:bg-[#c9a84c] hover:text-[#0f1f38] transition-colors disabled:opacity-50"
                          >
                            {assigningRoomId === room.id ? "…" : "Assign"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 border-t border-slate-100">
            <button
              type="button"
              onClick={skipRoomAssignment}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Skip — assign room later
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
