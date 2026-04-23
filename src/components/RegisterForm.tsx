"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Hotel {
  id: number;
  name: string;
  city: string;
}

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
      .then((data) => {
        setHotels(Array.isArray(data) ? data : []);
        setLoadingHotels(false);
      })
      .catch(() => setLoadingHotels(false));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          hotel_id: Number(hotelId),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "რეგისტრაცია ვერ მოხერხდა");
        setIsLoading(false);
        return;
      }

      setSuccess("რეგისტრაცია წარმატებული! გადამისამართება...");
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("სერვერთან კავშირი ვერ მოხერხდა");
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#d56f4d]/10">
          <svg className="h-8 w-8 text-[#d56f4d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">რეგისტრაცია</h1>
        <p className="mt-1 text-sm text-slate-500">შექმენი ახალი ანგარიში HMS-ში</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-slate-700">
            სრული სახელი
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="გიორგი გიორგაძე"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-[#d56f4d] focus:outline-none focus:ring-2 focus:ring-[#d56f4d]/20"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            ელ-ფოსტა
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@hotel.com"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-[#d56f4d] focus:outline-none focus:ring-2 focus:ring-[#d56f4d]/20"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
            პაროლი
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="მინ. 8 სიმბოლო"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-[#d56f4d] focus:outline-none focus:ring-2 focus:ring-[#d56f4d]/20"
          />
        </div>

        {/* Hotel */}
        <div>
          <label htmlFor="hotel" className="mb-1 block text-sm font-medium text-slate-700">
            სასტუმრო
          </label>
          <select
            id="hotel"
            required
            value={hotelId}
            onChange={(e) => setHotelId(e.target.value)}
            disabled={loadingHotels}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 transition-colors focus:border-[#d56f4d] focus:outline-none focus:ring-2 focus:ring-[#d56f4d]/20 disabled:opacity-50"
          >
            <option value="">
              {loadingHotels ? "იტვირთება..." : "აირჩიე სასტუმრო"}
            </option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} — {h.city}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || loadingHotels}
          className="w-full rounded-lg bg-[#d56f4d] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c4623f] focus:outline-none focus:ring-2 focus:ring-[#d56f4d]/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "მიმდინარეობს..." : "რეგისტრაცია"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        უკვე გაქვს ანგარიში?{" "}
        <Link href="/login" className="font-semibold text-[#d56f4d] hover:underline">
          შესვლა
        </Link>
      </p>
    </div>
  );
}
