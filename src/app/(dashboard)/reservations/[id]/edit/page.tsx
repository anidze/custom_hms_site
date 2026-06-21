"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Country, City } from "country-state-city";
import { useRouter, useParams } from "next/navigation";
import { ChevronDown, ChevronUp, BedDouble, CreditCard, MessageSquare, Calendar, Users, Plus, Trash2, Wallet, StickyNote, ShieldCheck } from "lucide-react";
import PaymentPanel, { type PaymentData } from "@/components/payments/PaymentPanel";
import NotesPanel,   { type Note        } from "@/components/payments/NotesPanel";
import CardHoldsPanel from "@/components/payments/CardHoldsPanel";

function todayISO() { return new Date().toISOString().split("T")[0]; }
function calcNights(from: string, to: string) {
  if (!from || !to) return 0;
  return Math.max(0, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000));
}

interface AvailableRoom { id: number; room_number: string; floor: number | null; room_type_name: string; price_per_night: number; }
interface RoomHistoryItem { id: number; previousRoomNumber: string | null; newRoomNumber: string; changedAt: string; notes: string | null; }

type DocType   = "" | "Passport" | "ID" | "Driver Licence";
type FolioTab  = "booking" | "payments" | "holds" | "notes";

interface GuestRow {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  zip: string;
  address: string;
  docType: DocType;
  docNumber: string;
  birthDate: string;
  birthPlace: string;
  nationality: string;
  docIssueDate: string;
}

const F = "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#0f1f38]/15 focus:border-[#0f1f38] transition";
const FE = "w-full bg-white border border-rose-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-rose-400/30 transition";
const S = "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-[#0f1f38]/15 focus:border-[#0f1f38] transition appearance-none";
const SE = "w-full bg-white border border-rose-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-rose-400/30 transition appearance-none";
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

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-1 h-5 bg-[#c9a84c] rounded-full" />
      <Icon size={16} className="text-[#0f1f38]" />
      <h3 className="text-sm font-bold text-[#0f1f38] uppercase tracking-wider">{title}</h3>
    </div>
  );
}

export default function EditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const allCountries = useMemo(() => Country.getAllCountries(), []);

  const [loadingData, setLoadingData] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [expandedGuests, setExpandedGuests] = useState<Set<number>>(new Set());
  const [checkIn, setCheckIn] = useState(todayISO);
  const [checkOut, setCheckOut] = useState(todayISO);
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [roomType, setRoomType] = useState("");
  const [adults, setAdults] = useState("1");
  const [kids, setKids] = useState("0");
  const [rooms, setRooms] = useState("1");
  const [payment, setPayment] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [roomNumber, setRoomNumber] = useState<string | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<number | null>(null);
  const [showChangeRoomModal, setShowChangeRoomModal] = useState(false);
  const [changeRoomRooms, setChangeRoomRooms] = useState<AvailableRoom[]>([]);
  const [changeRoomLoading, setChangeRoomLoading] = useState(false);
  const [changingRoomId, setChangingRoomId] = useState<number | null>(null);
  const [roomHistory, setRoomHistory] = useState<RoomHistoryItem[]>([]);

  // Folio
  const [folioTab,       setFolioTab]       = useState<FolioTab>("booking");
  const [paymentData,    setPaymentData]    = useState<PaymentData | null>(null);
  const [notes,          setNotes]          = useState<Note[]>([]);
  const [loadingPayments,setLoadingPayments] = useState(false);
  const [loadingNotes,   setLoadingNotes]   = useState(false);

  // Load room types
  useEffect(() => {
    fetch("/api/rooms").then((r) => r.json()).then((data: { room_type_name: string }[]) => {
      const unique = [...new Set(data.map((r) => r.room_type_name).filter(Boolean))];
      setRoomTypes(unique);
    }).catch(() => {});
  }, []);

  const fetchPayments = useCallback(async () => {
    setLoadingPayments(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/payments`);
      const data = await res.json();
      if (res.ok) setPaymentData(data);
    } catch { /* ignore */ } finally { setLoadingPayments(false); }
  }, [bookingId]);

  const fetchNotes = useCallback(async () => {
    setLoadingNotes(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/notes`);
      const data = await res.json();
      if (res.ok) setNotes(data.notes ?? []);
    } catch { /* ignore */ } finally { setLoadingNotes(false); }
  }, [bookingId]);

  useEffect(() => { fetchPayments(); fetchNotes(); }, [fetchPayments, fetchNotes]);

  // Load booking data
  useEffect(() => {
    fetch(`/api/bookings/${bookingId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); return; }
        setFirstName(d.firstName ?? "");
        setLastName(d.lastName ?? "");
        setCheckIn(d.checkIn ?? todayISO());
        setCheckOut(d.checkOut ?? todayISO());
        setRoomType(d.roomType ?? "");
        setAdults(d.adults != null ? String(d.adults) : "1");
        setKids(d.kids != null ? String(d.kids) : "0");
        setRooms(d.rooms != null ? String(d.rooms) : "1");
        setPayment(d.payment ?? "");
        setSpecialRequest(d.specialRequest ?? "");
        setRoomNumber(d.roomNumber ?? null);
        setCurrentRoomId(d.roomId ?? null);
        if (Array.isArray(d.additionalGuests) && d.additionalGuests.length > 0) {
          setGuests(d.additionalGuests);
        }
      })
      .catch(() => setError("Failed to load booking"))
      .finally(() => setLoadingData(false));
  }, [bookingId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "First name is required";
    if (!lastName.trim()) errs.lastName = "Last name is required";
    if (!checkIn) errs.checkIn = "Check-in date is required";
    if (!checkOut) errs.checkOut = "Check-out date is required";
    if (!roomType) errs.roomType = "Room type is required";
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, checkIn, checkOut, roomType, adults, kids, rooms, payment, specialRequest, additionalGuests: guests }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Unknown error"); return; }
      router.push("/reservations");
    } catch { setError("Network error"); } finally { setSubmitting(false); }
  }

  async function openChangeRoomModal() {
    setShowChangeRoomModal(true);
    setChangeRoomLoading(true);
    try {
      const [roomsRes, histRes] = await Promise.all([
        fetch(`/api/rooms/available?roomType=${encodeURIComponent(roomType)}&checkIn=${checkIn}&checkOut=${checkOut}`),
        fetch(`/api/bookings/${bookingId}/change-room`),
      ]);
      const roomsData = await roomsRes.json();
      const histData = await histRes.json();
      setChangeRoomRooms(Array.isArray(roomsData) ? roomsData : []);
      setRoomHistory(Array.isArray(histData) ? histData : []);
    } catch {
      setChangeRoomRooms([]);
      setRoomHistory([]);
    } finally {
      setChangeRoomLoading(false);
    }
  }

  async function handleChangeRoom(roomId: number) {
    setChangingRoomId(roomId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/change-room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });
      const data = await res.json();
      if (res.ok) {
        setRoomNumber(data.roomNumber);
        setCurrentRoomId(roomId);
        setShowChangeRoomModal(false);
        // refresh history next open
        setRoomHistory([]);
      }
    } catch {
      // ignore
    } finally {
      setChangingRoomId(null);
    }
  }

  function addGuest() {
    const idx = guests.length;
    setGuests((g) => [...g, { firstName: "", lastName: "", phone: "", email: "", country: "", city: "", zip: "", address: "", docType: "", docNumber: "", birthDate: "", birthPlace: "", nationality: "", docIssueDate: "" }]);
    setExpandedGuests((s) => new Set([...s, idx]));
  }

  function removeGuest(idx: number) {
    setGuests((g) => g.filter((_, i) => i !== idx));
    setExpandedGuests((s) => { const n = new Set(s); n.delete(idx); return n; });
  }

  function updateGuest(idx: number, field: keyof GuestRow, value: string) {
    setGuests((g) => g.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  }

  function toggleGuest(idx: number) {
    setExpandedGuests((s) => { const n = new Set(s); n.has(idx) ? n.delete(idx) : n.add(idx); return n; });
  }

  const nights = calcNights(checkIn, checkOut);
  const bookingNo = `AL${String(bookingId).padStart(4, "0")}`;

  if (loadingData) {
    return (
      <div className="max-w-4xl mx-auto pb-10 flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#0f1f38] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading booking…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto pb-10">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
          <button type="button" onClick={() => router.push("/reservations")} className="hover:text-[#0f1f38] transition-colors font-medium">
            Reservations
          </button>
          <span>/</span>
          <span className="text-slate-600 font-semibold">Edit Booking</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Name ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={L}>First Name <span className="text-rose-500">*</span></label>
                <input className={fieldErrors.firstName ? FE : F} placeholder="First Name" value={firstName} onChange={(e) => { setFirstName(e.target.value); setFieldErrors((p) => ({ ...p, firstName: "" })); }} />
                {fieldErrors.firstName && <p className="text-xs text-rose-500 mt-1">{fieldErrors.firstName}</p>}
              </div>
              <div>
                <label className={L}>Last Name <span className="text-rose-500">*</span></label>
                <input className={fieldErrors.lastName ? FE : F} placeholder="Last Name" value={lastName} onChange={(e) => { setLastName(e.target.value); setFieldErrors((p) => ({ ...p, lastName: "" })); }} />
                {fieldErrors.lastName && <p className="text-xs text-rose-500 mt-1">{fieldErrors.lastName}</p>}
              </div>
            </div>
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
              <div>
                <label className={L}>Room Type <span className="text-rose-500">*</span></label>
                <Sel>
                  <select className={fieldErrors.roomType ? SE : S} value={roomType} onChange={(e) => { setRoomType(e.target.value); setFieldErrors((p) => ({ ...p, roomType: "" })); }}>
                    <option value="">-- Select --</option>
                    {roomTypes.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Sel>
                {fieldErrors.roomType && <p className="text-xs text-rose-500 mt-1">{fieldErrors.roomType}</p>}
              </div>
              <div>
                <label className={L}>Adults</label>
                <input className={F} value={adults} onChange={(e) => setAdults(e.target.value)} type="number" min={1} placeholder="1" />
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

          {/* ── Room Assignment ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <SectionHeader icon={BedDouble} title="Room Assignment" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {roomNumber ? (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-[#0f1f38] flex items-center justify-center shrink-0">
                      <BedDouble size={16} className="text-[#c9a84c]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Room {roomNumber}</p>
                      <p className="text-xs text-slate-400">Currently assigned</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <BedDouble size={16} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500">No room assigned</p>
                      <p className="text-xs text-slate-400">Assign a room to this booking</p>
                    </div>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={openChangeRoomModal}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#0f1f38] text-[#0f1f38] text-xs font-semibold hover:bg-[#0f1f38] hover:text-white transition-colors"
              >
                <BedDouble size={13} />
                {roomNumber ? "Change Room" : "Assign Room"}
              </button>
            </div>
          </div>

          {/* ── Guests ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-[#c9a84c] rounded-full" />
                <Users size={16} className="text-[#0f1f38]" />
                <h3 className="text-sm font-bold text-[#0f1f38] uppercase tracking-wider">Guests</h3>
                {guests.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-[#0f1f38]/10 text-[#0f1f38] text-[10px] font-bold">{guests.length}</span>
                )}
              </div>
              <button type="button" onClick={addGuest} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f1f38] text-white text-xs font-semibold hover:bg-[#1a3152] transition-colors">
                <Plus size={13} /> Add Guest
              </button>
            </div>

            {guests.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No guests added yet. Click &ldquo;Add Guest&rdquo; to add.</p>
            ) : (
              <div className="space-y-3">
                {guests.map((g, idx) => {
                  const isOpen = expandedGuests.has(idx);
                  const label = [g.firstName, g.lastName].filter(Boolean).join(" ") || `Guest ${idx + 1}`;
                  const citiesOfCountry = g.country
                    ? (() => { const found = allCountries.find((c) => c.name === g.country); return found ? [...new Set((City.getCitiesOfCountry(found.isoCode) ?? []).map((c) => c.name))].sort() : []; })()
                    : [];
                  return (
                    <div key={idx} className="rounded-xl border border-slate-200 overflow-hidden">
                      {/* Accordion header */}
                      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => toggleGuest(idx)}>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-[#0f1f38] text-white flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</div>
                          <span className="text-sm font-semibold text-slate-700">{label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={(e) => { e.stopPropagation(); removeGuest(idx); }} className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition">
                            <Trash2 size={13} />
                          </button>
                          {isOpen ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
                        </div>
                      </div>

                      {/* Accordion body */}
                      {isOpen && (
                        <div className="p-4 space-y-4">
                          {/* Name row */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className={L}>First Name</label>
                              <input className={F} placeholder="First Name" value={g.firstName} onChange={(e) => updateGuest(idx, "firstName", e.target.value)} />
                            </div>
                            <div>
                              <label className={L}>Last Name</label>
                              <input className={F} placeholder="Last Name" value={g.lastName} onChange={(e) => updateGuest(idx, "lastName", e.target.value)} />
                            </div>
                          </div>

                          {/* Contact row */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className={L}>Phone</label>
                              <input className={F} placeholder="+995 xxx xxx xxx" value={g.phone} onChange={(e) => updateGuest(idx, "phone", e.target.value)} type="tel" />
                            </div>
                            <div>
                              <label className={L}>Email</label>
                              <input className={F} placeholder="guest@email.com" value={g.email} onChange={(e) => updateGuest(idx, "email", e.target.value)} type="email" />
                            </div>
                          </div>

                          {/* Country / City / Zip */}
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className={L}>Country</label>
                              <Sel>
                                <select className={S} value={allCountries.find((c) => c.name === g.country)?.isoCode ?? ""} onChange={(e) => { const found = allCountries.find((c) => c.isoCode === e.target.value); updateGuest(idx, "country", found?.name ?? ""); updateGuest(idx, "city", ""); }}>
                                  <option value="">-- Select --</option>
                                  {allCountries.map((c) => <option key={c.isoCode} value={c.isoCode}>{c.flag} {c.name}</option>)}
                                </select>
                              </Sel>
                            </div>
                            <div>
                              <label className={L}>City</label>
                              {citiesOfCountry.length > 0 ? (
                                <Sel>
                                  <select className={S} value={g.city} onChange={(e) => updateGuest(idx, "city", e.target.value)}>
                                    <option value="">-- Select --</option>
                                    {citiesOfCountry.map((c) => <option key={c}>{c}</option>)}
                                  </select>
                                </Sel>
                              ) : (
                                <input className={F} placeholder="City" value={g.city} onChange={(e) => updateGuest(idx, "city", e.target.value)} />
                              )}
                            </div>
                            <div>
                              <label className={L}>ZIP / Postal</label>
                              <input className={F} placeholder="12345" value={g.zip} onChange={(e) => updateGuest(idx, "zip", e.target.value)} />
                            </div>
                          </div>

                          {/* Address */}
                          <div>
                            <label className={L}>Address</label>
                            <input className={F} placeholder="Street address" value={g.address} onChange={(e) => updateGuest(idx, "address", e.target.value)} />
                          </div>

                          {/* Document section */}
                          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
                            <div>
                              <label className={L}>Document Type</label>
                              <Sel>
                                <select
                                  className={S}
                                  value={g.docType}
                                  onChange={(e) => {
                                    updateGuest(idx, "docType", e.target.value as DocType);
                                    updateGuest(idx, "docNumber", "");
                                    updateGuest(idx, "birthDate", "");
                                    updateGuest(idx, "birthPlace", "");
                                    updateGuest(idx, "nationality", "");
                                    updateGuest(idx, "docIssueDate", "");
                                  }}
                                >
                                  <option value="">-- Select document type --</option>
                                  <option value="Passport">Passport</option>
                                  <option value="ID">ID Card</option>
                                  <option value="Driver Licence">Driver&apos;s Licence</option>
                                </select>
                              </Sel>
                            </div>

                            {g.docType && (
                              <>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className={L}>
                                      {g.docType === "Passport" ? "Passport Number" : g.docType === "ID" ? "ID Number" : "Licence Number"}
                                    </label>
                                    <input className={F} placeholder="Document number" value={g.docNumber} onChange={(e) => updateGuest(idx, "docNumber", e.target.value)} />
                                  </div>
                                  <div>
                                    <label className={L}>Date of Issue</label>
                                    <input type="date" className={F} value={g.docIssueDate} onChange={(e) => updateGuest(idx, "docIssueDate", e.target.value)} />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className={L}>Date of Birth</label>
                                    <input type="date" className={F} value={g.birthDate} onChange={(e) => updateGuest(idx, "birthDate", e.target.value)} />
                                  </div>
                                  <div>
                                    <label className={L}>Place of Birth</label>
                                    <input className={F} placeholder="City / Country" value={g.birthPlace} onChange={(e) => updateGuest(idx, "birthPlace", e.target.value)} />
                                  </div>
                                </div>
                                <div>
                                  <label className={L}>Citizenship / Nationality</label>
                                  <input className={F} placeholder="e.g. Georgian" value={g.nationality} onChange={(e) => updateGuest(idx, "nationality", e.target.value)} />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Payment & Notes ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            {/* Tab strip */}
            <div className="flex items-center gap-0 px-6 pt-5 border-b border-slate-100">
              {([
                { key: "booking",  label: "Booking",  icon: <CreditCard size={13} /> },
                { key: "payments", label: "Payments", icon: <Wallet size={13} /> },
                { key: "holds",    label: "Holds",    icon: <ShieldCheck size={13} /> },
                { key: "notes",    label: "Notes",    icon: <StickyNote size={13} /> },
              ] as { key: FolioTab; label: string; icon: React.ReactNode }[]).map(({ key, label, icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFolioTab(key)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold border-b-2 -mb-px transition ${
                    folioTab === key
                      ? "border-[#0f1f38] text-[#0f1f38]"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {icon} {label}
                  {key === "notes" && notes.length > 0 && (
                    <span className="ml-0.5 bg-zinc-100 text-zinc-500 text-[10px] rounded-full px-1.5 font-medium">{notes.length}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* ── Booking tab ── */}
              {folioTab === "booking" && (
                <div className="space-y-5">
                  <div>
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
              )}

              {/* ── Payments tab ── */}
              {folioTab === "payments" && (
                loadingPayments ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-5 h-5 border-2 border-[#0f1f38] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : paymentData ? (
                  <PaymentPanel bookingId={bookingId} data={paymentData} canDelete onRefresh={fetchPayments} />
                ) : (
                  <p className="text-sm text-slate-400 text-center py-10">Could not load payment data.</p>
                )
              )}

              {/* ── Holds tab ── */}
              {folioTab === "holds" && (
                <CardHoldsPanel bookingId={bookingId} onPaymentsChanged={fetchPayments} />
              )}

              {/* ── Notes tab ── */}
              {folioTab === "notes" && (
                loadingNotes ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-5 h-5 border-2 border-[#0f1f38] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <NotesPanel bookingId={bookingId} notes={notes} canDelete onRefresh={fetchNotes} />
                )
              )}
            </div>
          </div>

          {/* Actions */}
          {error && <p className="text-sm text-rose-500 text-center bg-rose-50 rounded-xl py-3 border border-rose-200 px-4">{error}</p>}
          <div className="flex items-center justify-between pt-1">
            <button type="button" onClick={() => router.push("/reservations")} className="px-6 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-8 py-2.5 rounded-xl bg-[#0f1f38] text-white text-sm font-semibold hover:bg-[#1a3152] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm">
              {submitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Change Room Modal */}
      {showChangeRoomModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh] border border-slate-200">
            <div className="px-6 py-5 border-b border-slate-100 bg-linear-to-r from-[#0f1f38] to-[#1e3a5f] rounded-t-2xl">
              <div className="flex items-center gap-3 mb-1">
                <BedDouble size={18} className="text-[#c9a84c]" />
                <h2 className="text-base font-bold text-white">{roomNumber ? "Change Room" : "Assign Room"}</h2>
              </div>
              <p className="text-xs text-white/60 font-mono">Booking #{bookingNo}</p>
              {roomNumber && <p className="text-xs text-white/70 mt-0.5">Current: Room {roomNumber}</p>}
              <p className="text-xs text-white/70 mt-0.5">{roomType} &middot; {checkIn} &rarr; {checkOut} &middot; {nights} {nights === 1 ? "night" : "nights"}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Available Rooms</p>
              {changeRoomLoading ? (
                <div className="text-center py-10">
                  <div className="w-6 h-6 border-2 border-[#0f1f38] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Loading available rooms…</p>
                </div>
              ) : changeRoomRooms.length === 0 ? (
                <div className="text-center py-10">
                  <BedDouble size={28} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 font-medium">No available rooms for {roomType}</p>
                  <p className="text-xs text-slate-400 mt-1">Try different dates or room type</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {changeRoomRooms.map((room) => (
                    <div key={room.id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${room.id === currentRoomId ? "border-[#c9a84c] bg-amber-50/40" : "border-slate-200 hover:border-[#c9a84c] hover:bg-amber-50/20"}`}>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Room {room.room_number}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Floor {room.floor ?? "—"} &middot; {room.room_type_name} &middot; &#8382;{Number(room.price_per_night).toFixed(2)}/night</p>
                      </div>
                      {room.id === currentRoomId ? (
                        <span className="px-3 py-1.5 rounded-lg bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-semibold">Current</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleChangeRoom(room.id)}
                          disabled={changingRoomId === room.id}
                          className="px-3 py-1.5 rounded-lg bg-[#0f1f38] text-white text-xs font-semibold hover:bg-[#c9a84c] hover:text-[#0f1f38] transition-colors disabled:opacity-50"
                        >
                          {changingRoomId === room.id ? "…" : "Select"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              </div>

              {roomHistory.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Change History</p>
                  <div className="space-y-2">
                    {roomHistory.map((h) => (
                      <div key={h.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-slate-700 font-medium">
                            {h.previousRoomNumber ? `Room ${h.previousRoomNumber}` : "No room"} → Room {h.newRoomNumber}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{h.changedAt}</p>
                          {h.notes && <p className="text-xs text-slate-500 mt-0.5 italic">{h.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowChangeRoomModal(false)}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
