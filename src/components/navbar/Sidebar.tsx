// Sidebar — dark minimalist navigation
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ConciergeBell,
  BookMarked,
  BedDouble,
  Sparkles,
  FileText,
  TrendingUp,
  UserPlus,
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
  logoSrc?: string;
  roleName?: string;
  roleId?: number;
}

export default function Sidebar({ hotelName = "HMS", logoSrc, roleName, roleId }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-[#0f1f38] flex flex-col fixed h-full z-20 border-r border-zinc-900">
      {/* Brand */}
      <div className="shrink-0 border-b border-zinc-900 px-3 py-3 space-y-3">
        {/* Hotel row */}
        <div className="flex items-center gap-2.5">
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
          <span className="text-[13px] font-semibold text-white truncate">{hotelName}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
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
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[13px] ${
                active
                  ? "bg-white/[0.07] text-white font-semibold"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-orange-500 rounded-r-full" />
              )}
              <Icon size={18} className="shrink-0" />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {roleName === "SUPER_ADMIN" && (
        <div className="border-t border-zinc-900 p-2">
          <Link
            href="/register"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors text-[13px]"
          >
            <UserPlus size={18} className="shrink-0" />
            <span className="font-medium">Add User</span>
          </Link>
        </div>
      )}
    </aside>
  );
}

