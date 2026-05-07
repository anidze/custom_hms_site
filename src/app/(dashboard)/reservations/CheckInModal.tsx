"use client";

import { useState, useEffect } from "react";
import {
  X, LogIn, User, BedDouble, CreditCard, Star, Coffee, ChevronDown,
  AlertTriangle, CheckCircle, Loader2, Zap, Phone, Mail, Shield,
  Calendar, Moon, Users, Baby,
} from "lucide-react";

interface RoomOption {
  id: number;
  room_number: string;
  floor: number | null;
  room_type_name: string;
  price_per_night: number;
  room_status?: string;
}

interface CheckInModalProps {
  bookingId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const FIELD = "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#0f1f38]/20 focus:border-[#0f1f38] transition";
const LBL   = "block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={LBL}>{label}</label>{children}</div>;
}

export default function CheckInModal({ bookingId, onClose, onSuccess }: CheckInModalProps) {
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [autoAssigning,setAutoAssigning]= useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [valErrors,    setValErrors]    = useState<string[]>([]);

  const [booking, setBooking] = useState<{
    guestId: number; firstName: string; lastName: string; phone: string;
    email: string; idType: string; idNumber: string; roomType: string;
    checkIn: string; checkOut: string; nights: number; adults: number;
    kids: number; roomId: number | null; totalPrice: number;
  } | null>(null);

  const [availableRooms, setAvailableRooms]     = useState<RoomOption[]>([]);
  const [selectedRoomId, setSelectedRoomId]     = useState<number | "">("");
  const [loadingRooms,   setLoadingRooms]       = useState(false);

  // Editable guest fields
  const [firstName,  setFirstName]  = useState("");
  const [lastName,   setLastName]   = useState("");
  const [phone,      setPhone]      = useState("");
  const [email,      setEmail]      = useState("");
  const [idType,     setIdType]     = useState("Passport");
  const [idNumber,   setIdNumber]   = useState("");

  // Payment
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState("Cash");

  // Services
  const [includeBreakfast, setIncludeBreakfast] = useState(false);
  const [extraBed,         setExtraBed]         = useState(false);
  const [isVip,            setIsVip]            = useState(false);
  const [lateCheckout,     setLateCheckout]     = useState(false);
  const [notes,            setNotes]            = useState("");

  const bookingNo = `AL${String(bookingId).padStart(4, "0")}`;

  // ── Load booking data ──────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        const d   = await res.json();
        if (d.error) { setError(d.error); setLoading(false); return; }

        const nights = d.checkIn && d.checkOut
          ? Math.max(1, Math.ceil((new Date(d.checkOut).getTime() - new Date(d.checkIn).getTime()) / 86400000))
          : (d.nights ?? 1);

        setBooking({
          guestId:    d.guestId,
          firstName:  d.firstName  ?? "",
          lastName:   d.lastName   ?? "",
          phone:      d.phone      ?? "",
          email:      d.email      ?? "",
          idType:     d.idType     ?? "Passport",
          idNumber:   d.idNumber   ?? "",
          roomType:   d.roomType   ?? "",
          checkIn:    d.checkIn    ?? "",
          checkOut:   d.checkOut   ?? "",
          nights,
          adults:     parseInt(d.adults) || 1,
          kids:       parseInt(d.kids)   || 0,
          roomId:     d.roomId     ?? null,
          totalPrice: parseFloat(d.totalPrice) || 0,
        });

        setFirstName(d.firstName ?? "");
        setLastName(d.lastName   ?? "");
        setPhone(d.phone         ?? "");
        setEmail(d.email         ?? "");
        setIdType(d.idType       ?? "Passport");
        setIdNumber(d.idNumber   ?? "");
        setNotes(d.specialRequest ?? "");

        // Load available rooms
        setLoadingRooms(true);
        try {
          const params = new URLSearchParams({
            roomType:         d.roomType   ?? "",
            checkIn:          d.checkIn    ?? "",
            checkOut:         d.checkOut   ?? "",
            excludeBookingId: String(bookingId),
            ...(d.roomId ? { includeRoomId: String(d.roomId) } : {}),
          });
          const rr = await fetch(`/api/rooms/available?${params}`);
          const roomData = await rr.json();
          const rooms: RoomOption[] = Array.isArray(roomData) ? roomData : [];
          setAvailableRooms(rooms);
          setSelectedRoomId(d.roomId && rooms.find((r: RoomOption) => r.id === d.roomId) ? d.roomId : (rooms[0]?.id ?? ""));
        } catch {
          setAvailableRooms([]);
        } finally {
          setLoadingRooms(false);
        }
      } catch {
        setError("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bookingId]);

  async function fetchRooms(bk: typeof booking) {
    if (!bk) return;
    setLoadingRooms(true);
    try {
      const params = new URLSearchParams({
        roomType: bk.roomType, checkIn: bk.checkIn, checkOut: bk.checkOut,
        excludeBookingId: String(bookingId),
        ...(bk.roomId ? { includeRoomId: String(bk.roomId) } : {}),
      });
      const res = await fetch(`/api/rooms/available?${params}`);
      const rooms: RoomOption[] = await res.json();
      setAvailableRooms(Array.isArray(rooms) ? rooms : []);
      if (Array.isArray(rooms) && rooms.length > 0) {
        setSelectedRoomId(bk.roomId && rooms.find(r => r.id === bk.roomId) ? bk.roomId : rooms[0].id);
      }
    } catch {
      setAvailableRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  }

  async function handleAutoAssign() {
    setAutoAssigning(true);
    setError(null);
    await fetchRooms(booking);
    setAutoAssigning(false);
  }

  function validate() {
    const errs: string[] = [];
    if (!firstName.trim()) errs.push("First name is required");
    if (!selectedRoomId)   errs.push("Please select a room before check-in");
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (errs.length) { setValErrors(errs); return; }
    setSubmitting(true);
    setError(null);
    setValErrors([]);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId:          booking?.guestId,
          firstName,        lastName,        phone,         email,
          idType,           idNumber,
          rooms:            selectedRoomId ? [selectedRoomId] : [],
          depositAmount:    depositAmount ? parseFloat(depositAmount) : undefined,
          depositMethod:    depositAmount ? depositMethod : undefined,
          includeBreakfast, extraBed,       isVip,         lateCheckout,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Check-in failed"); return; }
      onSuccess();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedRoom  = availableRooms.find((r) => r.id === selectedRoomId);
  const totalPrice    = booking?.totalPrice ?? 0;
  const deposit       = parseFloat(depositAmount) || 0;
  const remaining     = Math.max(0, totalPrice - deposit);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] border border-slate-200 overflow-hidden">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="px-6 py-4 bg-linear-to-r from-[#0f1f38] to-[#1e3a5f] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#c9a84c]/20 flex items-center justify-center">
              <LogIn size={18} className="text-[#c9a84c]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Check-In Guest</h2>
                <span className="text-xs font-mono text-white/50 bg-white/10 px-2 py-0.5 rounded-md">{bookingNo}</span>
                {isVip && <span className="text-[10px] font-bold text-[#c9a84c] bg-[#c9a84c]/20 px-2 py-0.5 rounded-full uppercase tracking-wide">VIP</span>}
              </div>
              {booking && (
                <p className="text-xs text-white/55 mt-0.5">
                  {booking.firstName} {booking.lastName} · {booking.roomType || "—"} · {booking.checkIn} → {booking.checkOut}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition">
            <X size={16} />
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 size={32} className="animate-spin text-[#0f1f38] mx-auto mb-3" />
              <p className="text-sm text-slate-400">Loading booking details…</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Validation / API errors */}
            {(valErrors.length > 0 || error) && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                {valErrors.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-rose-700">
                    <AlertTriangle size={12} />{e}
                  </div>
                ))}
                {error && (
                  <div className="flex items-center gap-2 text-xs text-rose-700">
                    <AlertTriangle size={12} />{error}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">

              {/* ═══ LEFT PANEL ═══════════════════════════════════════════ */}
              <div className="p-6 space-y-6">

                {/* Guest Information */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-[#c9a84c] rounded-full" />
                    <User size={13} className="text-[#0f1f38]" />
                    <h3 className="text-[11px] font-bold text-[#0f1f38] uppercase tracking-wider">Guest Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="First Name *">
                        <input value={firstName} onChange={e => setFirstName(e.target.value)} className={FIELD} placeholder="First name" />
                      </Field>
                      <Field label="Last Name">
                        <input value={lastName} onChange={e => setLastName(e.target.value)} className={FIELD} placeholder="Last name" />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Phone">
                        <div className="relative">
                          <Phone size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <input value={phone} onChange={e => setPhone(e.target.value)} className={`${FIELD} pl-8`} placeholder="+1 234 567 890" />
                        </div>
                      </Field>
                      <Field label="Email">
                        <div className="relative">
                          <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <input value={email} onChange={e => setEmail(e.target.value)} className={`${FIELD} pl-8`} placeholder="guest@email.com" type="email" />
                        </div>
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="ID Type">
                        <div className="relative">
                          <Shield size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <select value={idType} onChange={e => setIdType(e.target.value)} className={`${FIELD} pl-8 appearance-none`}>
                            <option value="">Select</option>
                            <option value="Passport">Passport</option>
                            <option value="National ID">National ID</option>
                            <option value="Driver License">Driver License</option>
                            <option value="Other">Other</option>
                          </select>
                          <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </Field>
                      <Field label="ID Number">
                        <input value={idNumber} onChange={e => setIdNumber(e.target.value)} className={FIELD} placeholder="Passport / ID No." />
                      </Field>
                    </div>
                  </div>
                </section>

                {/* Stay Details */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-blue-400 rounded-full" />
                    <Calendar size={13} className="text-[#0f1f38]" />
                    <h3 className="text-[11px] font-bold text-[#0f1f38] uppercase tracking-wider">Stay Details</h3>
                  </div>
                  {booking && (
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Check-In</span>
                          <span className="font-semibold text-slate-700">{booking.checkIn}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Check-Out</span>
                          <span className="font-semibold text-slate-700">{booking.checkOut}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Nights</span>
                          <span className="font-semibold text-slate-700 flex items-center gap-1"><Moon size={10} /> {booking.nights}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Room Type</span>
                          <span className="font-semibold text-slate-700">{booking.roomType || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Adults</span>
                          <span className="font-semibold text-slate-700 flex items-center gap-1"><Users size={10} /> {booking.adults}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Children</span>
                          <span className="font-semibold text-slate-700 flex items-center gap-1"><Baby size={10} /> {booking.kids}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              </div>

              {/* ═══ RIGHT PANEL ══════════════════════════════════════════ */}
              <div className="p-6 space-y-6">

                {/* Room Assignment */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-emerald-400 rounded-full" />
                    <BedDouble size={13} className="text-[#0f1f38]" />
                    <h3 className="text-[11px] font-bold text-[#0f1f38] uppercase tracking-wider">Room Assignment</h3>
                  </div>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleAutoAssign}
                      disabled={autoAssigning || loadingRooms}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-dashed border-[#0f1f38]/25 text-xs font-semibold text-[#0f1f38] hover:border-[#0f1f38]/60 hover:bg-[#0f1f38]/5 transition disabled:opacity-50"
                    >
                      {autoAssigning ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                      {autoAssigning ? "Finding best available room…" : "Auto-Assign Best Available Room"}
                    </button>

                    <Field label="Select Room *">
                      {loadingRooms ? (
                        <div className="flex items-center gap-2 text-xs text-slate-400 py-2.5">
                          <Loader2 size={13} className="animate-spin" /> Loading available rooms…
                        </div>
                      ) : availableRooms.length === 0 ? (
                        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                          <AlertTriangle size={13} /> No available rooms for this type and dates
                        </div>
                      ) : (
                        <div className="relative">
                          <select
                            value={selectedRoomId}
                            onChange={e => setSelectedRoomId(e.target.value ? parseInt(e.target.value) : "")}
                            className={`${FIELD} appearance-none pr-8`}
                          >
                            <option value="">— Select a Room —</option>
                            {availableRooms.map(r => (
                              <option key={r.id} value={r.id}>
                                Room {r.room_number}{r.floor ? ` · Floor ${r.floor}` : ""} · {r.room_type_name}{r.price_per_night ? ` · $${r.price_per_night}/night` : ""}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      )}
                    </Field>

                    {selectedRoom && (
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                        <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                        <span className="text-xs font-medium text-emerald-700">
                          Room {selectedRoom.room_number} · {selectedRoom.room_type_name}
                          {selectedRoom.price_per_night && booking
                            ? ` · $${(selectedRoom.price_per_night * booking.nights).toFixed(2)} total`
                            : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </section>

                {/* Payment & Deposit */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-violet-400 rounded-full" />
                    <CreditCard size={13} className="text-[#0f1f38]" />
                    <h3 className="text-[11px] font-bold text-[#0f1f38] uppercase tracking-wider">Payment & Deposit</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Deposit Amount">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                          <input
                            type="number" min="0" step="0.01" value={depositAmount}
                            onChange={e => setDepositAmount(e.target.value)}
                            className={`${FIELD} pl-6`} placeholder="0.00"
                          />
                        </div>
                      </Field>
                      <Field label="Method">
                        <div className="relative">
                          <select value={depositMethod} onChange={e => setDepositMethod(e.target.value)} className={`${FIELD} appearance-none`}>
                            <option>Cash</option>
                            <option>Credit Card</option>
                            <option>Debit Card</option>
                            <option>Bank Transfer</option>
                            <option>Cheque</option>
                            <option>OTA (Booking.com)</option>
                            <option>OTA (Expedia)</option>
                          </select>
                          <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </Field>
                    </div>

                    {/* Balance summary */}
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-500">
                        <span>Total Charges</span>
                        <span className="font-semibold text-slate-700">${totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600">
                        <span>Deposit</span>
                        <span className="font-semibold">– ${deposit.toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-slate-200" />
                      <div className="flex justify-between font-bold text-sm">
                        <span className="text-slate-700">Remaining Balance</span>
                        <span className={remaining > 0 ? "text-amber-600" : "text-emerald-600"}>
                          ${remaining.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Additional Services */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 bg-amber-400 rounded-full" />
                    <Coffee size={13} className="text-[#0f1f38]" />
                    <h3 className="text-[11px] font-bold text-[#0f1f38] uppercase tracking-wider">Additional Services</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {([
                      { id: "b", label: "Breakfast",     icon: Coffee,    val: includeBreakfast, set: setIncludeBreakfast },
                      { id: "e", label: "Extra Bed",     icon: BedDouble, val: extraBed,         set: setExtraBed },
                      { id: "v", label: "VIP Guest",     icon: Star,      val: isVip,            set: setIsVip },
                      { id: "l", label: "Late Checkout", icon: Moon,      val: lateCheckout,     set: setLateCheckout },
                    ] as const).map(({ id, label, icon: Icon, val, set }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => set(!val)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          val
                            ? "bg-[#0f1f38] text-white border-[#0f1f38] shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:border-[#0f1f38]/40 hover:bg-slate-50"
                        }`}
                      >
                        <Icon size={13} />
                        {label}
                      </button>
                    ))}
                  </div>

                  <label className={LBL}>Special Requests / Notes</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    className={`${FIELD} resize-none`}
                    placeholder="Any special requests or notes for this stay…"
                  />
                </section>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50/80 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || loading}
            className="flex items-center gap-2 bg-[#0f1f38] hover:bg-[#1a3152] disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition shadow-sm"
          >
            {submitting
              ? <><Loader2 size={15} className="animate-spin" /> Processing…</>
              : <><LogIn size={15} /> Check-In Guest</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}


