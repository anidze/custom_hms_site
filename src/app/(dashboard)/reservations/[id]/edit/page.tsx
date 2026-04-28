"use client";

import { useState, useEffect, useMemo } from "react";
import { Country, City } from "country-state-city";
import { useRouter, useParams } from "next/navigation";
import { ChevronDown, X } from "lucide-react";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

interface GuestRow {
  firstName: string;
  lastName: string;
  gender: string;
  age: string;
}

const INPUT =
  "w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-[#c1604a]/30 focus:border-[#c1604a] transition";

const INPUT_ERR =
  "w-full bg-white border border-rose-400 rounded-lg px-3.5 py-2.5 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-rose-400/30 transition";

const SELECT =
  "w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-zinc-600 outline-none focus:ring-2 focus:ring-[#c1604a]/30 focus:border-[#c1604a] transition appearance-none";

const SELECT_ERR =
  "w-full bg-white border border-rose-400 rounded-lg px-3.5 py-2.5 text-sm text-zinc-600 outline-none focus:ring-2 focus:ring-rose-400/30 transition appearance-none";

const LABEL = "block text-sm font-semibold text-zinc-700 mb-1.5";

function Req() {
  return <span className="text-rose-500 ml-0.5">*</span>;
}

const ID_TYPES = ["Passport", "Driving License", "National ID", "Other"];
const PAYMENT_METHODS = ["Cheque", "Paypal", "Cash", "Credit Card"];

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0f1f38] pointer-events-none" />
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
      <div className="min-h-screen bg-[#fdf0eb] flex items-center justify-center">
        <p className="text-zinc-400 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf0eb] flex justify-center py-10 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl bg-[#fdf0eb] rounded-2xl p-8 space-y-7"
      >
        <h1 className="text-center text-xl font-extrabold tracking-widest text-zinc-800 uppercase">
          Edit Booking
        </h1>

        {/* Full Name + Gender */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold text-zinc-700">Full Name<Req /></span>
            <span className="text-sm font-semibold text-zinc-700">Gender</span>
          </div>
          <div className="flex gap-4 items-start">
            <div className="grid grid-cols-2 gap-3 flex-1">
              <div>
                <input
                  className={fieldErrors.firstName ? INPUT_ERR : INPUT}
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); setFieldErrors((p) => ({ ...p, firstName: "" })); }}
                />
                {fieldErrors.firstName && <p className="text-xs text-rose-500 mt-1">{fieldErrors.firstName}</p>}
              </div>
              <div>
                <input
                  className={fieldErrors.lastName ? INPUT_ERR : INPUT}
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); setFieldErrors((p) => ({ ...p, lastName: "" })); }}
                />
                {fieldErrors.lastName && <p className="text-xs text-rose-500 mt-1">{fieldErrors.lastName}</p>}
              </div>
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-5 h-10">
                {(["male", "female"] as const).map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer text-sm text-zinc-700">
                    <span
                      onClick={() => setGender(g)}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition ${
                        gender === g ? "border-[#0f1f38]" : "border-zinc-300"
                      }`}
                    >
                      {gender === g && <span className="w-2 h-2 rounded-full bg-[#0f1f38] block" />}
                    </span>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ID Proof + ID Number + Age */}
        <div className="grid grid-cols-[200px_1fr_100px] gap-4">
          <div>
            <label className={LABEL}>ID Proof</label>
            <SelectWrapper>
              <select className={SELECT} value={idType} onChange={(e) => setIdType(e.target.value)}>
                <option value="">Select ID Type</option>
                {ID_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </SelectWrapper>
          </div>
          <div>
            <label className={LABEL}>ID Number</label>
            <input className={INPUT} placeholder="Enter ID no here" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Age</label>
            <input className={INPUT} value={age} onChange={(e) => setAge(e.target.value)} type="number" min={0} />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className={LABEL}>Address</label>
          <div className="space-y-3">
            <input className={INPUT} placeholder="Street Address line 1" value={street1} onChange={(e) => setStreet1(e.target.value)} />
            <input className={INPUT} placeholder="Street Address line 2" value={street2} onChange={(e) => setStreet2(e.target.value)} />
          </div>
        </div>

        {/* Country + City + State + Postal */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className={LABEL}>Country</label>
            <div className="relative">
              <SelectWrapper>
                <select className={SELECT} value={allCountries.find(c => c.name === countryName)?.isoCode ?? ""} onChange={(e) => handleCountryChange(e.target.value)}>
                  <option value="">-- Select --</option>
                  {allCountries.map((c) => (
                    <option key={c.isoCode} value={c.isoCode}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </SelectWrapper>
              {countryName && (
                <button type="button" onClick={() => handleCountryChange("")}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 z-10">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
          <div>
            <label className={LABEL}>City</label>
            <div className="relative">
              {availableCities.length > 0 ? (
                <SelectWrapper>
                  <select className={SELECT} value={city} onChange={(e) => setCity(e.target.value)}>
                    <option value="">-- Select --</option>
                    {availableCities.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </SelectWrapper>
              ) : (
                <input className={INPUT} placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
              )}
              {city && (
                <button type="button" onClick={() => setCity("")}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 z-10">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
          <div>
            <label className={LABEL}>State, Province</label>
            <input className={INPUT} placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Postal/Zipcode</label>
            <input className={INPUT} placeholder="123456" value={postal} onChange={(e) => setPostal(e.target.value)} />
          </div>
        </div>

        {/* Phone + Email */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Phone No</label>
            <div className="flex gap-2">
              <SelectWrapper>
                <select
                  className="w-24 bg-[#0f1f38] text-white border-none rounded-lg px-2 py-2.5 text-sm font-medium outline-none appearance-none pr-6 cursor-pointer"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  <option value="">+</option>
                  {allCountries.map((c) => {
                    const code = c.phonecode.split("-")[0].split(",")[0].trim();
                    return (
                      <option key={c.isoCode} value={`+${code}`}>
                        {c.flag} +{code}
                      </option>
                    );
                  })}
                </select>
              </SelectWrapper>
              <div className="relative flex-1">
                <input
                  className={INPUT}
                  placeholder="Contact number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                />
                {phone && (
                  <button type="button" onClick={() => setPhone("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className={LABEL}>Email</label>
            <input className={INPUT} placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>
        </div>

        {/* Check-In + Check-Out + Time */}
        <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-end">
          <div>
            <label className={LABEL}>Check-In Date<Req /></label>
            <input
              type="date"
              className={fieldErrors.checkIn ? INPUT_ERR : INPUT}
              value={checkIn}
              onChange={(e) => { setCheckIn(e.target.value); setFieldErrors((p) => ({ ...p, checkIn: "" })); }}
            />
            {fieldErrors.checkIn && <p className="text-xs text-rose-500 mt-1">{fieldErrors.checkIn}</p>}
          </div>
          <div>
            <label className={LABEL}>Check-Out Date<Req /></label>
            <input
              type="date"
              className={fieldErrors.checkOut ? INPUT_ERR : INPUT}
              value={checkOut}
              min={checkIn || todayISO()}
              onChange={(e) => { setCheckOut(e.target.value); setFieldErrors((p) => ({ ...p, checkOut: "" })); }}
            />
            {fieldErrors.checkOut && <p className="text-xs text-rose-500 mt-1">{fieldErrors.checkOut}</p>}
          </div>
          <div>
            <label className={LABEL}>Time</label>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white border border-zinc-200 rounded-lg overflow-hidden">
                <input
                  className="w-10 px-2 py-2.5 text-sm text-center outline-none text-zinc-600"
                  placeholder="HH" maxLength={2}
                  value={timeH} onChange={(e) => setTimeH(e.target.value)}
                />
                <span className="text-zinc-400 font-semibold">:</span>
                <input
                  className="w-10 px-2 py-2.5 text-sm text-center outline-none text-zinc-600"
                  placeholder="MM" maxLength={2}
                  value={timeM} onChange={(e) => setTimeM(e.target.value)}
                />
              </div>
              <SelectWrapper>
                <select className={SELECT} style={{ width: 80 }} value={ampm} onChange={(e) => setAmpm(e.target.value)}>
                  <option>AM</option>
                  <option>PM</option>
                </select>
              </SelectWrapper>
            </div>
          </div>
        </div>

        {/* Room Type + Adults + Kids + Rooms */}
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-4">
          <div>
            <label className={LABEL}>Room Type<Req /></label>
            <SelectWrapper>
              <select
                className={fieldErrors.roomType ? SELECT_ERR : SELECT}
                value={roomType}
                onChange={(e) => { setRoomType(e.target.value); setFieldErrors((p) => ({ ...p, roomType: "" })); }}
              >
                <option value="">-- Select --</option>
                {roomTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </SelectWrapper>
            {fieldErrors.roomType && <p className="text-xs text-rose-500 mt-1">{fieldErrors.roomType}</p>}
          </div>
          <div>
            <label className={LABEL}>No of Adults</label>
            <input className={INPUT} value={adults} onChange={(e) => setAdults(e.target.value)} type="number" min={0} />
          </div>
          <div>
            <label className={LABEL}>No of Kids</label>
            <input className={INPUT} value={kids} onChange={(e) => setKids(e.target.value)} type="number" min={0} />
          </div>
          <div>
            <label className={LABEL}>No of Rooms</label>
            <input className={INPUT} value={rooms} onChange={(e) => setRooms(e.target.value)} type="number" min={1} />
          </div>
        </div>

        {/* Guest Details */}
        <div>
          <label className={LABEL}>Enter Guest Details:</label>
          <div className="space-y-3">
            {guests.map((g, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_1fr_160px_100px_auto] gap-3 items-end">
                <div>
                  {idx === 0 && <label className="block text-xs text-zinc-500 mb-1.5">Full Name</label>}
                  <input className={INPUT} placeholder="First Name" value={g.firstName} onChange={(e) => updateGuest(idx, "firstName", e.target.value)} />
                </div>
                <div>
                  {idx === 0 && <label className="block text-xs text-zinc-500 mb-1.5">&nbsp;</label>}
                  <input className={INPUT} placeholder="Last Name" value={g.lastName} onChange={(e) => updateGuest(idx, "lastName", e.target.value)} />
                </div>
                <div>
                  {idx === 0 && <label className="block text-xs text-zinc-500 mb-1.5">Gender</label>}
                  <SelectWrapper>
                    <select className={SELECT} value={g.gender} onChange={(e) => updateGuest(idx, "gender", e.target.value)}>
                      <option value=""></option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </SelectWrapper>
                </div>
                <div>
                  {idx === 0 && <label className="block text-xs text-zinc-500 mb-1.5">Age</label>}
                  <input className={INPUT} type="number" min={0} value={g.age} onChange={(e) => updateGuest(idx, "age", e.target.value)} />
                </div>
                <div>
                  {idx === 0 && <div className="mb-1.5 h-4" />}
                  {idx > 0 ? (
                    <button
                      type="button"
                      onClick={() => removeGuest(idx)}
                      className="flex items-center justify-center w-8 h-10 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-1 7a1 1 0 012 0v4a1 1 0 01-2 0V9zm4 0a1 1 0 012 0v4a1 1 0 01-2 0V9z" clipRule="evenodd" />
                      </svg>
                    </button>
                  ) : <div className="w-8" />}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={addGuest}
              className="px-5 py-2 rounded-lg bg-[#0f1f38] text-white text-sm font-semibold hover:bg-[#0d1a33] transition-colors"
            >
              + Add More
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className={LABEL}>Payment Method</label>
          <div className="flex items-center gap-6">
            {PAYMENT_METHODS.map((m) => (
              <label key={m} className="flex items-center gap-2 cursor-pointer text-sm text-zinc-700">
                <span
                  onClick={() => setPayment(m)}
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition ${
                    payment === m ? "border-[#0f1f38]" : "border-zinc-300"
                  }`}
                >
                  {payment === m && <span className="w-2 h-2 rounded-full bg-[#0f1f38] block" />}
                </span>
                {m}
              </label>
            ))}
          </div>
        </div>

        {/* Special Request */}
        <div>
          <label className={LABEL}>Do you have any special request?</label>
          <textarea
            className={`${INPUT} resize-none h-32`}
            placeholder="Type here...."
            value={specialRequest}
            onChange={(e) => setSpecialRequest(e.target.value)}
          />
        </div>

        {/* Actions */}
        {error && <p className="text-sm text-rose-500 text-center -mb-3">{error}</p>}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => router.push("/reservations")}
            className="px-6 py-2.5 rounded-lg border border-zinc-300 text-sm font-semibold text-zinc-700 bg-white hover:bg-zinc-50 transition-colors"
          >
            Close
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-2.5 rounded-lg bg-[#0f1f38] text-white text-sm font-semibold hover:bg-[#0d1a33] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
