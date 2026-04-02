// Sidebar navigation — ბმები dashboard, frontdesk, reservation, rooms, housekeeping, invoice, reports
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard,
  ConciergeBell,
  BookMarked,
  BedDouble,
  Sparkles,
  FileText,
  TrendingUp,
  Menu,
  X,
  LogOut,
} from "lucide-react";
const navigationItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Frontdesk", href: "/frontdesk", icon: ConciergeBell },
  { label: "Reservations", href: "/reservations", icon: BookMarked },
  { label: "Rooms", href: "/rooms", icon: BedDouble },
  { label: "Housekeeping", href: "/housekeeping", icon: Sparkles },
  { label: "Invoice", href: "/invoice", icon: FileText },
  { label: "Reports", href: "/reports", icon: TrendingUp },
];

interface SidebarProps {
  // hotelName — მოდის ბაზიდან (Hotel.name), default fallback
  hotelName?: string;
}

export default function Sidebar({ hotelName = "HMS" }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true); // Desktop: always open; mobile: toggle
  const iconColorClass = "text-[#d56f4d]";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`${
          isOpen ? "w-64" : "w-20"
        } bg-[#ffe5de] text-black font-bold transition-all duration-300 fixed h-full flex flex-col border-r border-slate-700`}
      >
        {/* Header — open: logo, closed: burger icon */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          {isOpen ? (
            // Sidebar ღია: logo ჩანს
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm font-bold text-slate-800">
                {hotelName}
              </span>
            </div>
          ) : null}

          {/* Burger / Close button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:border rounded transition-colors flex items-center justify-center"
            title={isOpen ? "Collapse" : "Expand"}
          >
            {isOpen ? (
              <X className={`w-5 h-5 ${iconColorClass}`} />
            ) : (
              <Menu className={`w-5 h-5 ${iconColorClass}`} />
            )}
          </button>
        </div>

        {/* Navigation Links */}

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                // className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors duration-200"
                className="flex items-center gap-4 px-4 py-3 rounded-lg border-2 border-transparent hover:border-[#d56f4d] transition-colors duration-200"
                title={!isOpen ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 ${iconColorClass}`} />
                {isOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#d56f4d]">
          <button className="w-full px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-sm font-medium flex items-center justify-center gap-2">
            <LogOut className={`w-4 h-4 ${iconColorClass}`} />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Spacer to prevent content overlap */}
      <div className={isOpen ? "w-64" : "w-20"} />
    </>
  );
}
