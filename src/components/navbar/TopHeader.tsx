"use client";

import { usePathname } from "next/navigation";
import { Calendar } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":    "Dashboard",
  "/frontdesk":    "Frontdesk",
  "/reservations": "Reservations",
  "/rooms":        "Rooms",
  "/housekeeping": "Housekeeping",
  "/invoice":      "Invoice",
  "/reports":      "Reports",
};

interface TopHeaderProps {
  userFullName?: string;
  role?: string;
}

export default function TopHeader({ userFullName = "Admin", role = "Admin" }: TopHeaderProps) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "HMS";

  const today = new Date();
  const displayDate = today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    weekday: "short",
  });

  const initials = userFullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="h-14 bg-white border-b border-zinc-100 flex items-center justify-between px-6 shrink-0">
      {/* Left: title */}
      <h1 className="text-sm font-semibold text-zinc-900 tracking-tight">{title}</h1>

      {/* Center: date */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
        <Calendar size={13} />
        <span>{displayDate}</span>
      </div>

      {/* Right: user */}
      <div className="flex items-center gap-2.5">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-medium text-zinc-800 leading-tight">{userFullName}</p>
          <p className="text-[11px] text-zinc-400 leading-tight">{role}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
          {initials}
        </div>
      </div>
    </header>
  );
}


