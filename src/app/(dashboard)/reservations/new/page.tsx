"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, BedDouble, CreditCard, MessageSquare, Calendar, Users, UserPlus, Trash2 } from "lucide-react";

function todayISO() { return new Date().toISOString().split("T")[0]; }
function tomorrowISO() { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; }
function calcNights(from: string, to: string) {
  if (!from || !to) return 0;
  return Math.max(0, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000));
}

interface AvailableRoom { id: number; room_number: string; floor: number | null; room_type_name: string; price_per_night: number; }

interface GuestInfo {
  firstName: string; lastName: string; gender: string; age: string;
  idType: string; idNumber: string; phone: string; email: string; nationality: string;
}
const blankGuest = (): GuestInfo => ({
  firstName: "", lastName: "", gender: "", age: "",
  idType: "", idNumber: "", phone: "", email: "", nationality: "",
});

const MAX_GUESTS = 20;
const GENDERS = ["Male", "Female", "Other"];
const ID_TYPES = ["Passport", "National ID", "Driving License", "Birth Certificate"];

const F = "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#0f1f38]/15 focus:border-[#0f1f38] transition";
const FE = "w-full bg-white border border-rose-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-rose-400/30 transition";
const S = "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-[#0f1f38]/15 focus:border-[#0f1f38] transition appearance-none";
const L = "block text-sm font-semibold text-slate-600 mb-1.5";

const PAYMENT_METHODS = ["Cash", "Credit Card"];

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

export default function NewBookingPage() {
  const router = useRouter();
  const [guests, setGuests] = useState<GuestInfo[]>([blankGuest()]);
  const [checkIn, setCheckIn] = useState(todayISO);
  const [checkOut, setCheckOut] = useState(tomorrowISO);
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [roomType, setRoomType] = useState("");
  const [kids, setKids] = useState("0");
  const [rooms, setRooms] = useState("1");
  const [payment, setPayment] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savedBookingId, setSavedBookingId] = useState<number | null>(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [assigningRoomId, setAssigningRoomId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/rooms").then((r) => r.json()).then((data: { room_type_name: string }[]) => {
      const unique = [...new Set(data.map((r) => r.room_type_name).filter(Boolean))];
      setRoomTypes(unique);
      if (unique.length > 0) setRoomType(unique[0]);
    }).catch(() => {});
  }, []);

  function updateGuest(i: number, key: keyof GuestInfo, value: string) {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    guests.forEach((g, i) => {
      if (!g.firstName.trim()) errs[`g${i}_firstName`] = "First name is required";
      if (!g.lastName.trim()) errs[`g${i}_lastName`] = "Last name is required";
    });
    if (!checkIn) errs.checkIn = "Check-in date is required";
    if (!checkOut) errs.checkOut = "Check-out date is required";
    if (!roomType) errs.roomType = "Room type is required";
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError("Please complete the required guest and booking details.");
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    setError(null);
    try {
      const [primary, ...extra] = guests;
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: primary.firstName, lastName: primary.lastName,
          gender: primary.gender, age: primary.age,
          idType: primary.idType, idNumber: primary.idNumber,
          phone: primary.phone, email: primary.email, country: primary.nationality,
          checkIn, checkOut,
          roomType, adults: String(guests.length), kids, rooms,
          payment, specialRequest,
          guests: extra.map((g) => ({
            firstName: g.firstName, lastName: g.lastName, gender: g.gender, age: g.age,
            idType: g.idType, idNumber: g.idNumber, phone: g.phone, email: g.email, nationality: g.nationality,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Unknown error"); return; }
      setSavedBookingId(data.bookingId);
      setShowRoomModal(true);
      setLoadingRooms(true);
      try {
        const roomsRes = await fetch(
          `/api/rooms/available?roomType=${encodeURIComponent(roomType)}&checkIn=${checkIn}&checkOut=${checkOut}`
        );
        const roomsData = await roomsRes.json();
        setAvailableRooms(Array.isArray(roomsData) ? roomsData : []);
      } catch { setAvailableRooms([]); } finally { setLoadingRooms(false); }
    } catch { setError("Network error"); } finally { setSubmitting(false); }
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
      // ignore — still redirect
    } finally {
      setAssigningRoomId(null);
      setShowRoomModal(false);
      router.push("/reservations");
    }
  }

  const nights = calcNights(checkIn, checkOut);
  const bookingNo = savedBookingId ? `AL${String(savedBookingId).padStart(4, "0")}` : null;

  return (
    <>
      <div className="max-w-4xl mx-auto pb-10">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
          <button type="button" onClick={() => router.push("/reservations")} className="hover:text-[#0f1f38] transition-colors font-medium">
            Reservations
          </button>
          <span>/</span>
          <span className="text-slate-600 font-semibold">New Booking</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Guests ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <SectionHeader
              icon={Users}
              title="Guests"
              right={
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-500">Number of guests</label>
                  <input
                    type="number"
                    min={1}
                    max={MAX_GUESTS}
                    value={guests.length}
                    onChange={(e) => setGuestCount(parseInt(e.target.value))}
                    className="w-20 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#0f1f38]/15 focus:border-[#0f1f38] transition"
                  />
                </div>
              }
            />

            <div className="space-y-5">
              {guests.map((g, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-5 bg-slate-50/40">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#0f1f38] text-white text-xs font-bold">{i + 1}</span>
                      <span className="text-sm font-bold text-[#0f1f38]">
                        {i === 0 ? "Primary Guest" : `Guest ${i + 1}`}
                      </span>
                    </div>
                    {guests.length > 1 && (
                      <button type="button" onClick={() => removeGuest(i)} className="text-slate-400 hover:text-rose-500 transition-colors" title="Remove guest">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={L}>First Name <span className="text-rose-500">*</span></label>
                      <input className={fieldErrors[`g${i}_firstName`] ? FE : F} placeholder="First Name" value={g.firstName} onChange={(e) => updateGuest(i, "firstName", e.target.value)} />
                      {fieldErrors[`g${i}_firstName`] && <p className="text-xs text-rose-500 mt-1">{fieldErrors[`g${i}_firstName`]}</p>}
                    </div>
                    <div>
                      <label className={L}>Last Name <span className="text-rose-500">*</span></label>
                      <input className={fieldErrors[`g${i}_lastName`] ? FE : F} placeholder="Last Name" value={g.lastName} onChange={(e) => updateGuest(i, "lastName", e.target.value)} />
                      {fieldErrors[`g${i}_lastName`] && <p className="text-xs text-rose-500 mt-1">{fieldErrors[`g${i}_lastName`]}</p>}
                    </div>
                    <div>
                      <label className={L}>Gender</label>
                      <Sel>
                        <select className={S} value={g.gender} onChange={(e) => updateGuest(i, "gender", e.target.value)}>
                          <option value="">-- Select --</option>
                          {GENDERS.map((x) => <option key={x}>{x}</option>)}
                        </select>
                      </Sel>
                    </div>
                    <div>
                      <label className={L}>Age</label>
                      <input className={F} type="number" min={0} placeholder="Age" value={g.age} onChange={(e) => updateGuest(i, "age", e.target.value)} />
                    </div>
                    <div>
                      <label className={L}>ID Type</label>
                      <Sel>
                        <select className={S} value={g.idType} onChange={(e) => updateGuest(i, "idType", e.target.value)}>
                          <option value="">-- Select --</option>
                          {ID_TYPES.map((x) => <option key={x}>{x}</option>)}
                        </select>
                      </Sel>
                    </div>
                    <div>
                      <label className={L}>ID Number</label>
                      <input className={F} placeholder="ID / Passport No." value={g.idNumber} onChange={(e) => updateGuest(i, "idNumber", e.target.value)} />
                    </div>
                    <div>
                      <label className={L}>Phone</label>
                      <input className={F} placeholder="Phone" value={g.phone} onChange={(e) => updateGuest(i, "phone", e.target.value)} />
                    </div>
                    <div>
                      <label className={L}>Email</label>
                      <input className={F} type="email" placeholder="Email" value={g.email} onChange={(e) => updateGuest(i, "email", e.target.value)} />
                    </div>
                    <div>
                      <label className={L}>Nationality</label>
                      <input className={F} placeholder="Nationality" value={g.nationality} onChange={(e) => updateGuest(i, "nationality", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {guests.length < MAX_GUESTS && (
              <button type="button" onClick={addGuest} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-slate-300 text-sm font-semibold text-slate-500 hover:border-[#c9a84c] hover:text-[#0f1f38] transition-colors">
                <UserPlus size={15} /> Add Guest
              </button>
            )}
          </div>

          {/* ── Booking Details ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <SectionHeader icon={Calendar} title="Booking Details" />
            <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-end mb-4">
              <div>
                <label className={L}>Check-In Date <span className="text-rose-500">*</span></label>
                <input type="date" className={fieldErrors.checkIn ? FE : F} value={checkIn} onChange={(e) => { setCheckIn(e.target.value); setFieldErrors((p) => ({ ...p, checkIn: "" })); }} />
                {fieldErrors.checkIn && <p className="text-xs text-rose-500 mt-1">{fieldErrors.checkIn}</p>}
              </div>
              <div>
                <label className={L}>Check-Out Date <span className="text-rose-500">*</span></label>
                <input type="date" className={fieldErrors.checkOut ? FE : F} value={checkOut} min={checkIn} onChange={(e) => { setCheckOut(e.target.value); setFieldErrors((p) => ({ ...p, checkOut: "" })); }} />
                {fieldErrors.checkOut && <p className="text-xs text-rose-500 mt-1">{fieldErrors.checkOut}</p>}
              </div>
              <div className="flex flex-col items-center justify-center bg-[#0f1f38] rounded-xl px-5 py-2.5 min-w-22">
                <span className="text-2xl font-bold text-white leading-none">{nights || 0}</span>
                <span className="text-[10px] text-white/60 font-semibold uppercase tracking-wider mt-0.5">{nights === 1 ? "Night" : "Nights"}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className={L}>Room Type <span className="text-rose-500">*</span></label>
                <Sel>
                  <select className={S + (fieldErrors.roomType ? " border-rose-400" : "")} value={roomType} onChange={(e) => { setRoomType(e.target.value); setFieldErrors((p) => ({ ...p, roomType: "" })); }}>
                    <option value="">-- Select --</option>
                    {roomTypes.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Sel>
                {fieldErrors.roomType && <p className="text-xs text-rose-500 mt-1">{fieldErrors.roomType}</p>}
              </div>
              <div>
                <label className={L}>Kids</label>
                <input className={F} value={kids} onChange={(e) => setKids(e.target.value)} type="number" min={0} placeholder="0" />
              </div>
              <div>
                <label className={L}>Rooms</label>
                <input className={F} value={rooms} onChange={(e) => setRooms(e.target.value)} type="number" min={1} placeholder="1" />
              </div>
            </div>
          </div>

          {/* ── Payment & Notes ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <SectionHeader icon={CreditCard} title="Payment & Notes" />
            <div className="mb-5">
              <label className={L}>Payment Method</label>
              <div className="flex items-center gap-6">
                {PAYMENT_METHODS.map((m) => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                    <span onClick={() => setPayment(m)} className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition ${payment === m ? "border-[#0f1f38]" : "border-slate-300"}`}>
                      {payment === m && <span className="w-2 h-2 rounded-full bg-[#0f1f38] block" />}
                    </span>
                    {m}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className={L}><MessageSquare size={13} className="inline mr-1 -mt-0.5" />Special Request</label>
              <textarea className={`${F} resize-none h-28`} placeholder="Any special requests or notes..." value={specialRequest} onChange={(e) => setSpecialRequest(e.target.value)} />
            </div>
          </div>

          {/* Actions */}
          {error && <p className="text-sm text-rose-500 text-center bg-rose-50 rounded-xl py-3 border border-rose-200 px-4">{error}</p>}
          <div className="flex items-center justify-between pt-1">
            <button type="button" onClick={() => router.push("/reservations")} className="px-6 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-8 py-2.5 rounded-xl bg-[#0f1f38] text-white text-sm font-semibold hover:bg-[#1a3152] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm">
              {submitting ? "Saving…" : "Create Reservation"}
            </button>
          </div>
        </form>
      </div>

      {/* Room Assignment Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh] border border-slate-200">
            <div className="px-6 py-5 border-b border-slate-100 bg-linear-to-r from-[#0f1f38] to-[#1e3a5f] rounded-t-2xl">
              <div className="flex items-center gap-3 mb-1">
                <BedDouble size={18} className="text-[#c9a84c]" />
                <h2 className="text-base font-bold text-white">Assign a Room</h2>
              </div>
              {bookingNo && <p className="text-xs text-white/60 font-mono">Confirmation #{bookingNo}</p>}
              <p className="text-xs text-white/70 mt-1">{roomType} &middot; {checkIn} &rarr; {checkOut} &middot; {nights} {nights === 1 ? "night" : "nights"}</p>
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
                  <p className="text-sm text-slate-500 font-medium">No available rooms for {roomType}</p>
                  <p className="text-xs text-slate-400 mt-1">Try different dates or assign manually later</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableRooms.map((room) => (
                    <div key={room.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-[#c9a84c] hover:bg-amber-50/30 transition-colors">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Room {room.room_number}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Floor {room.floor ?? "—"} &middot; {room.room_type_name} &middot; &#8382;{Number(room.price_per_night).toFixed(2)}/night
                        </p>
                      </div>
                      <button
                        onClick={() => handleAssignRoom(room.id)}
                        disabled={assigningRoomId === room.id}
                        className="px-4 py-1.5 rounded-lg bg-[#0f1f38] text-white text-xs font-semibold hover:bg-[#c9a84c] transition-colors disabled:opacity-50"
                      >
                        {assigningRoomId === room.id ? "…" : "Select"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-100">
              <button
                onClick={() => { setShowRoomModal(false); router.push("/reservations"); }}
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
