"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
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

const COUNTRY_CODES = ["+91", "+1", "+44", "+49", "+33", "+7", "+86", "+81", "+995"];
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

export default function NewBookingPage() {
  const router = useRouter();

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
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [checkIn, setCheckIn] = useState(todayISO);
  const [checkOut, setCheckOut] = useState(tomorrowISO);
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

  useEffect(() => {
    fetch("/api/rooms")
      .then((r) => r.json())
      .then((data: { room_type_name: string }[]) => {
        const unique = [...new Set(data.map((r) => r.room_type_name).filter(Boolean))];
        setRoomTypes(unique);
        if (unique.length > 0) setRoomType(unique[0]);
      })
      .catch(() => {});
  }, []);

  function addGuest() {
    setGuests((g) => [...g, { firstName: "", lastName: "", gender: "", age: "" }]);
  }

  function updateGuest(idx: number, field: keyof GuestRow, value: string) {
    setGuests((g) => g.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate required fields
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
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName, lastName, gender, idType, idNumber, age,
          street1, street2, city, state, postal,
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

  return (
    <div className="min-h-screen bg-[#fdf0eb] flex justify-center py-10 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl bg-[#fdf0eb] rounded-2xl p-8 space-y-7"
      >
        <h1 className="text-center text-xl font-extrabold tracking-widest text-zinc-800 uppercase">
          Booking
        </h1>

        {/* Full Name + Gender */}
        <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-end">
          <div>
            <label className={LABEL}>Full Name<Req /></label>
            <div className="grid grid-cols-2 gap-3">
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
          </div>
          <div />
          <div>
            <label className={LABEL}>Gender</label>
            <div className="flex items-center gap-5 h-10.5">
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
            <input className={INPUT} placeholder="" value={age} onChange={(e) => setAge(e.target.value)} type="number" min={0} />
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

        {/* City + State + Postal */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={LABEL}>City</label>
            <input className={INPUT} placeholder="Eg..NewYork" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>State, Province</label>
            <input className={INPUT} placeholder="Enter your state" value={state} onChange={(e) => setState(e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Postal/Zipcode</label>
            <input className={INPUT} placeholder="Eg. 123456" value={postal} onChange={(e) => setPostal(e.target.value)} />
          </div>
        </div>

        {/* Phone + Email */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Phone No</label>
            <div className="flex gap-2">
              <SelectWrapper>
                <select
                  className="bg-[#0f1f38] text-white border-none rounded-lg px-3 py-2.5 text-sm font-medium outline-none appearance-none pr-7 cursor-pointer"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  {COUNTRY_CODES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </SelectWrapper>
              <input className={`${INPUT} flex-1`} placeholder="enter your contact no here" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
            </div>
          </div>
          <div>
            <label className={LABEL}>Email</label>
            <input className={INPUT} placeholder="enter your email id here" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
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
              min={todayISO()}
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
                  placeholder="HH"
                  maxLength={2}
                  value={timeH}
                  onChange={(e) => setTimeH(e.target.value)}
                />
                <span className="text-zinc-400 font-semibold">:</span>
                <input
                  className="w-10 px-2 py-2.5 text-sm text-center outline-none text-zinc-600"
                  placeholder="MM"
                  maxLength={2}
                  value={timeM}
                  onChange={(e) => setTimeM(e.target.value)}
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
              <div key={idx} className="grid grid-cols-[1fr_1fr_160px_100px] gap-3 items-end">
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
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-2">
            <button type="button" onClick={addGuest} className="text-sm text-[#0f1f38] font-semibold hover:underline">
              +Add More
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
          <label className={LABEL}>Do you have any special request ?</label>
          <textarea
            className={`${INPUT} resize-none h-32`}
            placeholder="Type here...."
            value={specialRequest}
            onChange={(e) => setSpecialRequest(e.target.value)}
          />
        </div>

        {/* Actions */}
        {error && (
          <p className="text-sm text-rose-500 text-center -mb-3">{error}</p>
        )}
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
            {submitting ? "Saving..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
