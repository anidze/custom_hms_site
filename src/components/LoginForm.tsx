// ლოგინ ფორმა — ცალკე კომპონენტი
"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  hotelName?: string;
  logoSrc?: string;
}

export default function LoginForm({
  hotelName = "Eldream",
  logoSrc = "/Eldream tower at sunset1.png",
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "შესვლა ვერ მოხერხდა");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("სერვერთან კავშირი ვერ მოხერხდა");
      setIsLoading(false);
    }
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
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-[#d56f4d] focus:outline-none focus:ring-2 focus:ring-[#d56f4d]/20"
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
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-[#d56f4d] focus:outline-none focus:ring-2 focus:ring-[#d56f4d]/20"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-[#d56f4d] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c4623f] focus:outline-none focus:ring-2 focus:ring-[#d56f4d]/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "შემოწმება..." : "შესვლა"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        არ გაქვს ანგარიში?{" "}
        <Link href="/register" className="font-semibold text-[#d56f4d] hover:underline">
          რეგისტრაცია
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-slate-400">
        © 2026 — Hotel Management System
      </p>
    </div>
  );
}

