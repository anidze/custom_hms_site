"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Hotel { id: number; name: string; city: string; }

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/15";
const labelClass = "block text-xs font-medium text-zinc-600 uppercase tracking-wide";

export default function RegisterForm() {
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hotelId, setHotelId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/hotels")
      .then((r) => r.json())
      .then((data) => { setHotels(Array.isArray(data) ? data : []); setLoadingHotels(false); })
      .catch(() => setLoadingHotels(false));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setSuccess(""); setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, password, hotel_id: Number(hotelId) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registration failed"); setIsLoading(false); return; }
      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("Could not connect to server");
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold text-zinc-900">Create Account</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Register for HMS</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl p-7 shadow-sm">
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-100 px-3.5 py-2.5 text-sm text-red-600">{error}</div>
        )}
        {success && (
          <div className="mb-5 rounded-lg bg-green-50 border border-green-100 px-3.5 py-2.5 text-sm text-green-700">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="fullName" className={labelClass}>Full Name</label>
            <input id="fullName" type="text" required value={fullName}
              onChange={(e) => setFullName(e.target.value)} placeholder="John Smith" className={inputClass} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className={labelClass}>Email</label>
            <input id="email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="name@hotel.com" className={inputClass} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className={labelClass}>Password</label>
            <input id="password" type="password" required minLength={8} value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" className={inputClass} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="hotel" className={labelClass}>Hotel</label>
            <select id="hotel" required value={hotelId}
              onChange={(e) => setHotelId(e.target.value)} disabled={loadingHotels}
              className={`${inputClass} disabled:opacity-50`}
            >
              <option value="">{loadingHotels ? "Loading..." : "Select hotel"}</option>
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>{h.name} — {h.city}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={isLoading || loadingHotels}
            className="mt-2 w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Register"}
          </button>
        </form>
      </div>

      <p className="mt-5 text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-orange-500 hover:text-orange-600 transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
}


