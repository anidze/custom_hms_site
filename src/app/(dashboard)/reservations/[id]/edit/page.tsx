"use client";

import { useState, useEffect, useMemo } from "react";
import { Country, City } from "country-state-city";
import { useRouter, useParams } from "next/navigation";
import { ChevronDown, X, Plus, Trash2, User, Calendar, CreditCard, MessageSquare, MapPin, Users } from "lucide-react";

function todayISO() { return new Date().toISOString().split("T")[0]; }
function calcNights(from: string, to: string) {
  if (!from || !to) return 0;
  return Math.max(0, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000));
}

interface GuestRow { firstName: string; lastName: string; gender: string; age: string; }

const F = "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#0f1f38]/15 focus:border-[#0f1f38] transition";
const FE = "w-full bg-white border border-rose-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-rose-400/30 transition";
const S = "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-[#0f1f38]/15 focus:border-[#0f1f38] transition appearance-none";
const SE = "w-full bg-white border border-rose-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-rose-400/30 transition appearance-none";
const L = "block text-sm font-semibold text-slate-600 mb-1.5";
function Req() { return <span className="text-rose-500 ml-0.5">*</span>; }
const ID_TYPES = ["Passport", "Driving License", "National ID", "Other"];
const PAYMENT_METHODS = ["Cheque", "Paypal", "Cash", "Credit Card"];

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

  const [loadingData, setLoadingData] = useState(true);
  const [guestId, setGuestId] = useState<number | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [age, setAge] = useState("");
  const [street1, setStreet1] = useState("");
  const [street2, setStreet2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postal, setPostal] = useState("");
  const [countryName, setCountryName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [checkIn, setCheckIn] = useState(todayISO);
  const [checkOut, setCheckOut] = useState(todayISO);
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [timeH, setTimeH] = useState("");
  const [timeM, setTimeM] = useState("");
  const [ampm, setAmpm] = useState("PM");
  const [roomType, setRoomType] = useState("");
  const [adults, setAdults] = useState("");
  const [kids, setKids] = useState("");
  const [rooms, setRooms] = useState("");
  const [guests, setGuests] = useState<GuestRow[]>([{ firstName: "", lastName: "", gender: "", age: "" }]);
  const [payment, setPayment] = useState("Cheque");
  const [specialRequest, setSpecialRequest] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const nights = calcNights(checkIn, checkOut);

  const allCountries = useMemo(() => Country.getAllCountries(), []);

  const availableCities = useMemo(() => {
    if (!countryName) return [];
    const found = allCountries.find((c) => c.name === countryName);
    if (!found) return [];
    const raw = City.getCitiesOfCountry(found.isoCode) ?? [];
    return [...new Set(raw.map((c) => c.name))].sort();
  }, [countryName, allCountries]);

  function handleCountryChange(isoCode: string) {
    setCity("");
    if (isoCode) {
      const found = allCountries.find((c) => c.isoCode === isoCode);
      setCountryName(found?.name ?? isoCode);
      if (found?.phonecode) {
        const code = found.phonecode.split("-")[0].split(",")[0].trim();
        setCountryCode(`+${code}`);
      }
    } else {
      setCountryName("");
      setCountryCode("");
    }
  }

  // Load room types
  useEffect(() => {
    fetch("/api/rooms")
      .then((r) => r.json())
      .then((data: { room_type_name: string }[]) => {
        const unique = [...new Set(data.map((r) => r.room_type_name).filter(Boolean))];
        setRoomTypes(unique);
      })
      .catch(() => {});
  }, []);

  // Load booking data
  useEffect(() => {
    fetch(`/api/bookings/${bookingId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); return; }

        setGuestId(d.guestId ?? null);
        setFirstName(d.firstName ?? "");
        setLastName(d.lastName ?? "");
        setGender((d.gender?.toLowerCase() as "male" | "female") ?? "male");
        setIdType(d.idType ?? "");
        setIdNumber(d.idNumber ?? "");
        setAge(d.age != null ? String(d.age) : "");
        // notes was stored as "street1, street2"
        const noteParts = (d.notes ?? "").split(", ");
        setStreet1(noteParts[0] ?? "");
        setStreet2(noteParts[1] ?? "");
        setCity(d.city ?? "");
        setState(d.state ?? "");
        setPostal(d.postal ?? "");
        setCountryName(d.country ?? "");
        setPhone(d.phone ?? "");
        setEmail(d.email ?? "");
        setCheckIn(d.checkIn ?? todayISO());
        setCheckOut(d.checkOut ?? todayISO());
        setRoomType(d.roomType ?? "");
        setAdults(d.adults != null ? String(d.adults) : "");
        setKids(d.kids != null ? String(d.kids) : "");
        setRooms(d.rooms != null ? String(d.rooms) : "");
        setPayment(d.payment ?? "Cheque");
        setSpecialRequest(d.specialRequest ?? "");

        // Parse arrival_time e.g. "09:30 PM"
        if (d.arrivalTime) {
          const parts = d.arrivalTime.split(" ");
          const timeParts = (parts[0] ?? "").split(":");
          setTimeH(timeParts[0] ?? "");
          setTimeM(timeParts[1] ?? "");
          setAmpm(parts[1] ?? "PM");
        }

        if (Array.isArray(d.additionalGuests) && d.additionalGuests.length > 0) {
          setGuests(d.additionalGuests);
        }
      })
      .catch(() => setError("Failed to load booking"))
      .finally(() => setLoadingData(false));
  }, [bookingId]);

  function addGuest() {
    setGuests((g) => [...g, { firstName: "", lastName: "", gender: "", age: "" }]);
  }

  function updateGuest(idx: number, field: keyof GuestRow, value: string) {
    setGuests((g) => g.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  }

  function removeGuest(idx: number) {
    setGuests((g) => g.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "First name is required";
    if (!lastName.trim()) errs.lastName = "Last name is required";
    if (!checkIn) errs.checkIn = "Check-in date is required";
    if (!checkOut) errs.checkOut = "Check-out date is required";
    if (!roomType) errs.roomType = "Room type is required";

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId,
          firstName, lastName, gender, idType, idNumber, age,
          street1, street2, city, state, postal, country: countryName,
          countryCode, phone, email,
          checkIn, checkOut, timeH, timeM, ampm,
          roomType, adults, kids, rooms,
          guests, payment, specialRequest,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unknown error");
        return;
      }
      router.push("/reservations");
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

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

        {/* ── Booking Details ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <SectionHeader icon={Calendar} title="Booking Details" />
          <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-end">
            <div>
              <label className={L}>Check-In Date<Req /></label>
              <input type="date" className={fieldErrors.checkIn ? FE : F} value={checkIn} onChange={(e) => { setCheckIn(e.target.value); setFieldErrors((p) => ({ ...p, checkIn: "" })); }} />
              {fieldErrors.checkIn && <p className="text-xs text-rose-500 mt-1">{fieldErrors.checkIn}</p>}
            </div>
            <div>
              <label className={L}>Check-Out Date<Req /></label>
              <input type="date" className={fieldErrors.checkOut ? FE : F} value={checkOut} min={checkIn || todayISO()} onChange={(e) => { setCheckOut(e.target.value); setFieldErrors((p) => ({ ...p, checkOut: "" })); }} />
              {fieldErrors.checkOut && <p className="text-xs text-rose-500 mt-1">{fieldErrors.checkOut}</p>}
            </div>
            <div className="flex flex-col items-center justify-center bg-[#0f1f38] rounded-xl px-5 py-2.5 min-w-22">
              <span className="text-2xl font-bold text-white leading-none">{nights || 0}</span>
              <span className="text-[10px] text-white/60 font-semibold uppercase tracking-wider mt-0.5">{nights === 1 ? "Night" : "Nights"}</span>
            </div>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-4 items-end mt-4">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-4">
              <div>
                <label className={L}>Room Type<Req /></label>
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
                <input className={F} value={adults} onChange={(e) => setAdults(e.target.value)} type="number" min={0} placeholder="1" />
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
            <div>
              <label className={L}>Arrival Time</label>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <input className="w-10 px-2 py-2.5 text-sm text-center outline-none text-slate-600" placeholder="HH" maxLength={2} value={timeH} onChange={(e) => setTimeH(e.target.value)} />
                  <span className="text-slate-400 font-semibold">:</span>
                  <input className="w-10 px-2 py-2.5 text-sm text-center outline-none text-slate-600" placeholder="MM" maxLength={2} value={timeM} onChange={(e) => setTimeM(e.target.value)} />
                </div>
                <Sel><select className={S} style={{ width: 72 }} value={ampm} onChange={(e) => setAmpm(e.target.value)}><option>AM</option><option>PM</option></select></Sel>
              </div>
            </div>
          </div>
        </div>

        {/* ── Primary Guest ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <SectionHeader icon={User} title="Primary Guest Information" />
          <div className="flex gap-4 items-start mb-4">
            <div className="grid grid-cols-2 gap-3 flex-1">
              <div>
                <label className={L}>First Name<Req /></label>
                <input className={fieldErrors.firstName ? FE : F} placeholder="First Name" value={firstName} onChange={(e) => { setFirstName(e.target.value); setFieldErrors((p) => ({ ...p, firstName: "" })); }} />
                {fieldErrors.firstName && <p className="text-xs text-rose-500 mt-1">{fieldErrors.firstName}</p>}
              </div>
              <div>
                <label className={L}>Last Name<Req /></label>
                <input className={fieldErrors.lastName ? FE : F} placeholder="Last Name" value={lastName} onChange={(e) => { setLastName(e.target.value); setFieldErrors((p) => ({ ...p, lastName: "" })); }} />
                {fieldErrors.lastName && <p className="text-xs text-rose-500 mt-1">{fieldErrors.lastName}</p>}
              </div>
            </div>
            <div className="shrink-0 pt-7">
              <div className="flex items-center gap-5">
                {(["male", "female"] as const).map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                    <span onClick={() => setGender(g)} className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition ${gender === g ? "border-[#0f1f38]" : "border-slate-300"}`}>
                      {gender === g && <span className="w-2 h-2 rounded-full bg-[#0f1f38] block" />}
                    </span>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-[200px_1fr_100px] gap-4 mb-4">
            <div>
              <label className={L}>ID Proof</label>
              <Sel><select className={S} value={idType} onChange={(e) => setIdType(e.target.value)}>
                <option value="">Select ID Type</option>
                {ID_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select></Sel>
            </div>
            <div>
              <label className={L}>ID Number</label>
              <input className={F} placeholder="Enter ID number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
            </div>
            <div>
              <label className={L}>Age</label>
              <input className={F} value={age} onChange={(e) => setAge(e.target.value)} type="number" min={0} />
            </div>
          </div>
          <div className="mb-4">
            <label className={L}><MapPin size={13} className="inline mr-1 -mt-0.5" />Address</label>
            <div className="space-y-2.5">
              <input className={F} placeholder="Street Address line 1" value={street1} onChange={(e) => setStreet1(e.target.value)} />
              <input className={F} placeholder="Street Address line 2 (optional)" value={street2} onChange={(e) => setStreet2(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <label className={L}>Country</label>
              <div className="relative">
                <Sel>
                  <select className={S} value={allCountries.find((c) => c.name === countryName)?.isoCode ?? ""} onChange={(e) => handleCountryChange(e.target.value)}>
                    <option value="">-- Select --</option>
                    {allCountries.map((c) => (
                      <option key={c.isoCode} value={c.isoCode}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                </Sel>
                {countryName && (
                  <button type="button" onClick={() => handleCountryChange("")} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10">
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className={L}>City</label>
              <div className="relative">
                {availableCities.length > 0 ? (
                  <Sel>
                    <select className={S} value={city} onChange={(e) => setCity(e.target.value)}>
                      <option value="">-- Select --</option>
                      {availableCities.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </Sel>
                ) : (
                  <input className={F} placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                )}
                {city && (
                  <button type="button" onClick={() => setCity("")} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10">
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className={L}>State / Province</label>
              <input className={F} placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <div>
              <label className={L}>Postal / Zip</label>
              <input className={F} placeholder="123456" value={postal} onChange={(e) => setPostal(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={L}>Phone No</label>
              <div className="flex gap-2">
                <Sel>
                  <select className="w-24 bg-[#0f1f38] text-white border-none rounded-xl px-2 py-2.5 text-sm font-medium outline-none appearance-none pr-6 cursor-pointer" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                    <option value="">+</option>
                    {allCountries.map((c) => {
                      const code = c.phonecode.split("-")[0].split(",")[0].trim();
                      return <option key={c.isoCode} value={`+${code}`}>{c.flag} +{code}</option>;
                    })}
                  </select>
                </Sel>
                <div className="relative flex-1">
                  <input className={F} placeholder="Contact number" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
                  {phone && <button type="button" onClick={() => setPhone("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={13} /></button>}
                </div>
              </div>
            </div>
            <div>
              <label className={L}>Email</label>
              <input className={F} placeholder="guest@email.com" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </div>
          </div>
        </div>

        {/* ── Additional Guests ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-[#c9a84c] rounded-full" />
              <Users size={16} className="text-[#0f1f38]" />
              <h3 className="text-sm font-bold text-[#0f1f38] uppercase tracking-wider">Additional Guests</h3>
            </div>
            <button type="button" onClick={addGuest} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f1f38] text-white text-xs font-semibold hover:bg-[#1a3152] transition-colors">
              <Plus size={13} /> Add Guest
            </button>
          </div>
          {guests.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No additional guests. Click &ldquo;Add Guest&rdquo; to add more.</p>
          ) : (
            <div className="space-y-3">
              {guests.map((g, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-[#0f1f38]/10 text-[#0f1f38] flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</div>
                  <div className="grid grid-cols-[1fr_1fr_140px_80px] gap-3 flex-1">
                    <input className={F} placeholder="First Name" value={g.firstName} onChange={(e) => updateGuest(idx, "firstName", e.target.value)} />
                    <input className={F} placeholder="Last Name" value={g.lastName} onChange={(e) => updateGuest(idx, "lastName", e.target.value)} />
                    <Sel>
                      <select className={S} value={g.gender} onChange={(e) => updateGuest(idx, "gender", e.target.value)}>
                        <option value="">Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </Sel>
                    <input className={F} type="number" min={0} placeholder="Age" value={g.age} onChange={(e) => updateGuest(idx, "age", e.target.value)} />
                  </div>
                  <button type="button" onClick={() => removeGuest(idx)} className="p-2 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Payment & Notes ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <SectionHeader icon={CreditCard} title="Payment & Notes" />
          <div className="mb-5">
            <label className={L}>Payment Method</label>
            <div className="flex items-center gap-6 flex-wrap">
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
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
