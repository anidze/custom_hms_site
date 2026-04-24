// Sidebar — dark minimalist navigation
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ConciergeBell,
  BookMarked,
  BedDouble,
  Sparkles,
  FileText,
  TrendingUp,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",    href: "/dashboard",    icon: LayoutDashboard },
  { label: "Frontdesk",    href: "/frontdesk",    icon: ConciergeBell },
  { label: "Reservations", href: "/reservations", icon: BookMarked },
  { label: "Rooms",        href: "/rooms",        icon: BedDouble },
  { label: "Housekeeping", href: "/housekeeping", icon: Sparkles },
  { label: "Invoice",      href: "/invoice",      icon: FileText },
  { label: "Reports",      href: "/reports",      icon: TrendingUp },
];

interface SidebarProps {
  hotelName?: string;
  userFullName?: string;
}

export default function Sidebar({ hotelName = "HMS", userFullName }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={`${
        collapsed ? "w-[68px]" : "w-60"
      } bg-zinc-950 flex flex-col fixed h-full transition-[width] duration-200 ease-in-out z-20 border-r border-zinc-900`}
    >
      {/* Brand */}
      <div
        className={`h-14 flex items-center shrink-0 border-b border-zinc-900 px-4 gap-3 ${
          collapsed ? "justify-center px-0" : ""
        }`}
      >
        <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0">
          <Image
            src="/images/Eldream tower at sunset1.png"
            alt={hotelName}
            fill
            sizes="28px"
            className="object-cover"
            priority
          />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-semibold text-white truncate leading-tight">
              {hotelName}
            </span>
            {userFullName && (
              <span className="text-[11px] text-zinc-500 truncate leading-tight">
                {userFullName}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {/* Notifications */}
        <Link
          href="#"
          title={collapsed ? "Notification" : undefined}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors text-sm"
        >
          <Bell size={15} className="shrink-0" />
          {!collapsed && <span>Notification</span>}
        </Link>

        <div className="my-2 border-t border-zinc-900" />

        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                active
                  ? "bg-white/[0.07] text-white"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-orange-500 rounded-r-full" />
              )}
              <Icon size={15} className="shrink-0" />
              {!collapsed && <span className="font-medium">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-900 p-2 space-y-0.5">
        <Link
          href="#"
          title={collapsed ? "Settings" : undefined}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors text-sm"
        >
          <Settings size={15} className="shrink-0" />
          {!collapsed && <span className="font-medium">Settings</span>}
        </Link>

        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm"
        >
          <LogOut size={15} className="shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center justify-center py-1.5 rounded-lg text-zinc-700 hover:text-zinc-400 hover:bg-white/5 transition-colors"
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>
    </aside>
  );
}


import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  hotelName?: string;
  userFullName?: string;
}

export default function Sidebar({
  hotelName = "HMS",
  userFullName,
}: SidebarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const iconColorClass = "text-[#d56f4d]";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`${
          isOpen ? "w-64" : "w-20"
        } bg-[#ffe5de] text-black font-bold transition-all duration-300 fixed h-full flex flex-col border-r border-slate-200 z-10`}
      >
        {/* Header */}
        <div className="h-16 px-4 border-b border-[#d56f4d]/20 flex items-center justify-between gap-2">
          {isOpen ? (
            /* Sidebar ღია: ლოგო + toggle */
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* მრგვალი ლოგო avatar */}
              <div className="relative w-9 h-9 shrink-0 rounded-xl overflow-hidden ring-2 ring-[#d56f4d]/30">
                <Image
                  src="/images/Eldream tower at sunset1.png"
                  alt={hotelName}
                  fill
                  sizes="36px"
                  className="object-cover"
                  priority
                />
              </div>
              {/* სასტუმროს სახელი + user */}
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-slate-800 leading-tight truncate tracking-tight">
                  {hotelName}
                </span>
                {userFullName && (
                  <span className="text-[11px] font-normal text-slate-400 truncate leading-tight">
                    {userFullName}
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Sidebar დახურული: მხოლოდ პატარა ლოგო */
            <div className="relative w-9 h-9 mx-auto rounded-xl overflow-hidden ring-2 ring-[#d56f4d]/30">
              <Image
                src="/images/Eldream tower at sunset1.png"
                alt={hotelName}
                fill
                sizes="36px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Toggle ღილაკი — მხოლოდ sidebar ღია-ზე */}
          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-[#d56f4d]/10 transition-colors shrink-0"
              title="Collapse"
            >
              <X className="w-4 h-4 text-[#d56f4d]" />
            </button>
          )}
        </div>

        {/* Collapse გახსნის ღილაკი — sidebar დახურული */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="mx-auto mt-3 p-1.5 rounded-lg hover:bg-[#d56f4d]/10 transition-colors flex items-center justify-center"
            title="Expand"
          >
            <Menu className="w-4 h-4 text-[#d56f4d]" />
          </button>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-4 px-4 py-3 rounded-lg border-2 border-transparent hover:border-[#d56f4d] transition-colors duration-200"
                title={!isOpen ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 ${iconColorClass}`} />
                {isOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer — Logout */}
        <div className="p-4 border-t border-[#d56f4d]/30">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-sm font-medium text-white flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            {isOpen && <span>გამოსვლა</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
