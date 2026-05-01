"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  hotelName?: string;
  logoSrc?: string;
}

export default function LoginForm({
  hotelName = "CHMS",
  logoSrc = "/images/CHMS.png",
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
        setError(data.error ?? "Login failed");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Could not connect to server");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="relative w-40 h-40 rounded-xl overflow-hidden ring-1 ring-zinc-200">
          <Image src={logoSrc} alt={hotelName} fill sizes="160px" className="object-contain" priority />
        </div>
      </div>

      {/* Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-7 shadow-sm">
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-100 px-3.5 py-2.5 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-medium text-zinc-600 uppercase tracking-wide">
              Email
            </label>
            <input
              id="email" type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="name@hotel.com"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/15"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-medium text-zinc-600 uppercase tracking-wide">
              Password
            </label>
            <input
              id="password" type="password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/15"
            />
          </div>

          <button
            type="submit" disabled={isLoading}
            className="mt-2 w-full rounded-lg bg-[#0f1f38] py-2.5 text-sm font-semibold text-white  hover:bg-[#162d4e]  disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Checking..." : "Sign In"}
          </button>
        </form>
      </div>

    </div>
  );
}


