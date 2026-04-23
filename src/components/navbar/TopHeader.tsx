"use client";

import { usePathname } from "next/navigation";
import { Calendar, ChevronDown, UserCircle } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "DASHBOARD",
  "/frontdesk": "FRONTDESK",
  "/reservations": "RESERVATION",
  "/rooms": "ROOMS",
  "/housekeeping": "HOUSEKEEPING",
  "/invoice": "INVOICE",
  "/reports": "REPORTS",
};

interface TopHeaderProps {
  userFullName?: string;
  role?: string;
}

export default function TopHeader({ userFullName = "Admin User", role = "Admin" }: TopHeaderProps) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "HMS";

  const today = new Date();
  const formatted = today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    weekday: "long",
  });
  // "Wednesday, 23 Apr 2026" → reformat to "23 Apr 2026, Wednesday"
  const parts = formatted.split(", ");
  const displayDate = parts.length === 2 ? `${parts[1]}, ${parts[0]}` : formatted;

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
      {/* Date */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Calendar size={15} className="text-slate-400" />
        <span>{displayDate}</span>
      </div>

      {/* Page title */}
      <h1 className="text-base font-bold text-slate-800 tracking-widest">{title}</h1>

      {/* User */}
      <div className="flex items-center gap-2 cursor-pointer select-none">
        <UserCircle size={32} className="text-slate-400" />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-slate-800">{userFullName}</span>
          <span className="text-xs text-slate-400">{role}</span>
        </div>
        <ChevronDown size={14} className="text-slate-400" />
      </div>
    </header>
  );
}
