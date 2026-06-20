"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Calendar, LogOut } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":    "Dashboard",
  "/frontdesk":    "Frontdesk",
  "/reservations": "Reservations",
  "/rooms":        "Rooms",
  "/housekeeping": "Housekeeping",
  "/invoice":      "Invoice",
  "/reports":      "Reports",
};

const ROLE_LABELS: Record<number, string> = {
  1: "Super Admin",
  2: "Admin",
  3: "Front Desk",
  4: "Housekeeping",
};

interface TopHeaderProps {
  // userFullName?: string;
  email?: string;
  roleId?: number;
}

export default function TopHeader({ email, roleId }: TopHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const title = PAGE_TITLES[pathname] ?? "HMS";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const displayDate = today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    weekday: "short",
  });

  const roleLabel = roleId ? (ROLE_LABELS[roleId] ?? "") : "";

  const initials = "AD"; // Placeholder initials since userFullName is no longer used

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [dropdownOpen]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-14 bg-white border-b border-zinc-100 flex items-center justify-between px-6 shrink-0">
      {/* Left: title */}
      <h1 className="text-sm font-semibold text-zinc-900 tracking-tight">{title}</h1>

      {/* Center: date */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
        <Calendar size={13} />
        <span>{displayDate}</span>
      </div>

      {/* Right: avatar with dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((v) => !v)}
          className="w-8 h-8 rounded-full bg-[#0f1f38] flex items-center justify-center text-white text-xs font-semibold shrink-0 hover:opacity-80 transition-opacity"
        >
          {initials}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-zinc-100 overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-zinc-100">
              {/* <p className="text-[13px] font-semibold text-zinc-800 truncate">{userFullName}</p> */}
              {email && <p className="text-[11px] text-zinc-400 truncate mt-0.5">{email}</p>}
              {roleLabel && <p className="text-[11px] text-[#c9a84c] font-medium mt-0.5">{roleLabel}</p>}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-zinc-500 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}


