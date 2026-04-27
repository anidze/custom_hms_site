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
  logoSrc?: string;
}

export default function Sidebar({ hotelName = "HMS", userFullName, logoSrc }: SidebarProps) {
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
        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
          <Image
            src={logoSrc ?? "/images/CHMS.png"}
            alt={hotelName}
            fill
            sizes="40px"
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
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {/* Notifications */}
        <Link
          href="#"
          title={collapsed ? "Notification" : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors text-[13px]"
        >
          <Bell size={18} className="shrink-0" />
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
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[13px] ${
                active
                  ? "bg-white/[0.07] text-white"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-orange-500 rounded-r-full" />
              )}
              <Icon size={18} className="shrink-0" />
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
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors text-[13px]"
        >
          <Settings size={18} className="shrink-0" />
          {!collapsed && <span className="font-medium">Settings</span>}
        </Link>

        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors text-[13px]"
        >
          <LogOut size={18} className="shrink-0" />
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

