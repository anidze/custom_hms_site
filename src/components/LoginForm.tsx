// ლოგინ ფორმა — ცალკე კომპონენტი
"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";

interface LoginFormProps {
  hotelName?: string;
  logoSrc?: string;
}

export default function LoginForm({
  hotelName = "Eldream",
  logoSrc = "/Eldream tower at sunset1.png",
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    console.log("შესვლის მცდელობა:", { email });

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setError("ავთენტიფიკაცია ჯერ არ არის დაყენებული");
    setIsLoading(false);
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
      {/* ლოგო და სათაური */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full drop-shadow-md">
          <Image
            src={logoSrc}
            alt="HMS Logo"
            width={96}
            height={96}
            priority
            className="h-full w-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">{hotelName}</h1>
      </div>

      {/* შეცდომის შეტყობინება */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Login ფორმა */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            ელ-ფოსტა
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@hotel.com"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            პაროლი
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-slate-800 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "შესვლა..." : "შესვლა"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-400">
        © 2026 {hotelName} — Hotel Management System
      </p>
    </div>
  );
}
