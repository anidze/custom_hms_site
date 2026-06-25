"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { LOCALES, LOCALE_META, type Locale } from "@/lib/i18n/locales";

export default function LanguageSwitcher() {
  const { locale } = useTranslation();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function pick(next: Locale) {
    if (next === locale || busy) return;
    setBusy(true);
    try {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      // Reload so server-rendered translations refresh.
      window.location.reload();
    } catch {
      setBusy(false);
    }
  }

  const current = LOCALE_META[locale];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors text-[12px] font-medium"
        title="Language"
      >
        <Globe size={14} />
        <span className="hidden sm:inline">{current.flag} {locale.toUpperCase()}</span>
        <span className="sm:hidden">{current.flag}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-zinc-100 overflow-hidden z-50">
          {LOCALES.map((code) => {
            const m = LOCALE_META[code];
            const active = code === locale;
            return (
              <button
                key={code}
                type="button"
                onClick={() => pick(code)}
                disabled={busy}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-[13px] transition-colors ${
                  active ? "bg-zinc-50 text-zinc-900 font-semibold" : "text-zinc-600 hover:bg-zinc-50"
                } disabled:opacity-50`}
              >
                <span className="flex items-center gap-2">
                  <span>{m.flag}</span>
                  <span>{m.label}</span>
                </span>
                {active && <Check size={13} className="text-emerald-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
