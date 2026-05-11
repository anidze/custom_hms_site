// Sidebar — dark minimalist navigation
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  LayoutDashboard,
  ConciergeBell,
  BookMarked,
  BedDouble,
  Sparkles,
  FileText,
  TrendingUp,
  LogOut,
  UserPlus,
  X,
  Bell,
  LogIn,
  LogOut as LogOutIcon,
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
  roleName?: string;
  roleId?: number;
}

interface NotifData {
  date: string;
  checkIns: number;
  checkOuts: number;
}

function toLocalISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Sidebar({ hotelName = "HMS", userFullName, logoSrc, roleName, roleId }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // ── Notification state ────────────────────────────────────────────────
  const today = new Date();
  const [notifOpen, setNotifOpen]       = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(toLocalISODate(today));
  const [notifData, setNotifData]       = useState<NotifData | null>(null);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async (date: string) => {
    setNotifLoading(true);
    try {
      const res = await fetch(`/api/notifications?date=${date}`);
      if (res.ok) setNotifData(await res.json());
    } catch { /* ignore */ } finally {
      setNotifLoading(false);
    }
  }, []);

  // fetch today on mount for badge
  useEffect(() => { fetchNotifications(toLocalISODate(today)); }, []); // eslint-disable-line

  // re-fetch when date changes inside open panel
  useEffect(() => { if (notifOpen) fetchNotifications(selectedDate); }, [selectedDate, notifOpen, fetchNotifications]);

  // close on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    if (notifOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [notifOpen]);

  const totalBadge = notifData ? notifData.checkIns + notifData.checkOuts : 0;
  const isToday = selectedDate === toLocalISODate(today);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      onMouseEnter={() => setCollapsed(false)}
      className={`${
        collapsed ? "w-[68px]" : "w-60"
      } bg-[#0f1f38] flex flex-col fixed h-full transition-[width] duration-200 ease-in-out z-20 border-r border-zinc-900`}
    >
      {/* Brand */}
      <div className="h-14 flex items-center shrink-0 border-b border-zinc-900 px-3 gap-2.5">
        <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0">
          <Image
            src={logoSrc ?? "/images/CHMS.png"}
            alt={hotelName}
            fill
            sizes="36px"
            className="object-cover"
            priority
          />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[13px] font-semibold text-white truncate leading-tight">
              {hotelName}
            </span>
            {userFullName && (
              <span className="text-[11px] text-white truncate leading-tight">
                {userFullName}
              </span>
            )}
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            title="Close sidebar"
            className="ml-auto p-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            title={collapsed ? "Notification" : undefined}
            className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors text-[13px]"
          >
            <Bell size={18} className="shrink-0" />
            {!collapsed && <span>Notification</span>}
            {totalBadge > 0 && (
              <span className="ml-auto min-w-4 h-4 px-1 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                {totalBadge}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute left-full top-0 ml-2 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              {/* ── Header ── */}
              <div className="px-5 py-4 bg-[#0f1f38]">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-1 h-5 bg-[#c9a84c] rounded-full shrink-0" />
                  <Bell size={15} className="text-white/80" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Notifications</h3>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/50 outline-none focus:border-[#c9a84c] focus:bg-white/15 transition"
                />
                <p className="mt-1.5 text-[10px] text-white/50 font-medium">
                  {isToday ? "Showing today's activity" : new Date(selectedDate + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>

              {/* ── Body ── */}
              {notifLoading ? (
                <div className="flex items-center justify-center py-8 text-slate-400 text-xs">Loading...</div>
              ) : notifData ? (
                <div className="p-4 space-y-3">
                  {/* Check-ins */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        <LogIn size={16} className="text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#0f1f38]">Reservations</p>
                        <p className="text-[11px] text-slate-400 font-medium">Check-in{notifData.checkIns !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="flex flex-col items-center justify-center bg-[#0f1f38] rounded-xl px-3.5 py-1.5 min-w-[44px]">
                        <span className="text-xl font-bold text-white leading-none">{notifData.checkIns}</span>
                      </div>
                    </div>
                  </div>

                  {/* Check-outs */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                        <LogOutIcon size={16} className="text-rose-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#0f1f38]">Check-outs</p>
                        <p className="text-[11px] text-slate-400 font-medium">Departure{notifData.checkOuts !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="flex flex-col items-center justify-center bg-[#c9a84c] rounded-xl px-3.5 py-1.5 min-w-[44px]">
                        <span className="text-xl font-bold text-white leading-none">{notifData.checkOuts}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-slate-400 text-xs">No data</div>
              )}
            </div>
          )}
        </div>

        <div className="my-2 border-t border-zinc-900" />

        {navItems.filter(({ href }) => {
          if (href === "/housekeeping") return roleId === 4;
          if (href === "/reservations" || href === "/invoice") return roleId !== 4;
          return true;
        }).map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[13px] ${
                active
                  ? "bg-white/[0.07] text-white text-4xl font-semibold"
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
        {roleName === "SUPER_ADMIN" && (
          <Link
            href="/register"
            title={collapsed ? "Add User" : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors text-[13px]"
          >
            <UserPlus size={18} className="shrink-0" />
            {!collapsed && <span className="font-medium">Add User</span>}
          </Link>
        )}

        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors text-[13px]"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>


      </div>
    </aside>
  );
}

