"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────
interface DashboardStats {
  checkInToday:  number;
  checkOutToday: number;
  bookingsToday: number;
  inHouse:       number;
  totalRooms:    number;
  availableRooms: number;
  occupiedRooms:  number;
  monthlyOccupancy: { month: string; count: number; occupancy: number }[];
  paymentMethods:   { name: string; value: number; color: string }[];
}

// ─── placeholder kept so file compiles before data loads ──────────────────────
const _statCards_placeholder = [
  { label: "Check-In",  sub: "Today", value: "201", total: "650", color: "text-amber-500" },
  { label: "Check-Out", sub: "Today", value: "432", total: "650", color: "text-sky-500" },
  { label: "Bookings",  sub: "Today", value: "179", total: "650", color: "text-emerald-500" },
  { label: "In-House",  sub: "Today", value: "78",  total: "650", color: "text-rose-500" },
];

void _statCards_placeholder;

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400 text-sm">
        Loading dashboard...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64 text-rose-400 text-sm">
        Failed to load dashboard data.
      </div>
    );
  }

  const statCards = [
    { label: "Check-In",  sub: "Today", value: stats.checkInToday,  total: stats.totalRooms, color: "text-amber-500" },
    { label: "Check-Out", sub: "Today", value: stats.checkOutToday, total: stats.totalRooms, color: "text-sky-500" },
    { label: "Bookings",  sub: "Today", value: stats.bookingsToday, total: stats.totalRooms, color: "text-emerald-500" },
    { label: "In-House",  sub: "Today", value: stats.inHouse,       total: stats.totalRooms, color: "text-rose-500" },
  ];

  const roomStatusData = [
    { name: "Occupied",  value: stats.occupiedRooms,  color: "#60a5fa" },
    { name: "Available", value: stats.availableRooms, color: "#4ade80" },
  ];
  const roomTotal = stats.totalRooms || 1;

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-zinc-100 p-5">
            <p className="text-xs text-zinc-400 uppercase tracking-wider mb-3">{c.label}</p>
            <div className="flex items-end gap-1">
              <span className={`text-3xl font-semibold ${c.color}`}>{c.value}</span>
              <span className="text-sm text-zinc-300 mb-0.5">/{c.total}</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Room Status */}
      <div className="bg-white rounded-xl border border-zinc-100 p-5">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Room Status</p>
        <div className="grid grid-cols-2 gap-6">
          {["Occupied Rooms", "Available Rooms"].map((title) => (
            <div key={title} className="flex items-center gap-5">
              <div className="relative shrink-0">
                <PieChart width={110} height={110}>
                  <Pie data={roomStatusData} cx={50} cy={50} innerRadius={26} outerRadius={50}
                    paddingAngle={2} dataKey="value" stroke="none">
                    {roomStatusData.map((e) => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                </PieChart>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-zinc-700">
                  {roomTotal}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-zinc-700 mb-2">{title}</p>
                <div className="space-y-1.5">
                  {roomStatusData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                        <span className="text-zinc-500">{d.name}</span>
                      </div>
                      <span className="font-medium text-zinc-700">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Occupancy */}
        <div className="bg-white rounded-xl border border-zinc-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Occupancy Statistic</p>
            <span className="text-[11px] text-zinc-400 border border-zinc-100 rounded-md px-2 py-0.5">
              {new Date().getFullYear()} Monthly
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.monthlyOccupancy} barCategoryGap="25%">
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [`${v} bookings`]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }}
              />
              <Bar dataKey="count" name="Bookings" fill="#60a5fa" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#60a5fa" }} />
              Bookings per month
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="bg-white rounded-xl border border-zinc-100 p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Payment Methods</p>
          {stats.paymentMethods.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-zinc-400 text-sm">
              No booking data yet
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <div className="flex-1 space-y-3">
                {stats.paymentMethods.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="text-zinc-500">{d.name}</span>
                    </div>
                    <span className="font-semibold text-zinc-700">{d.value}%</span>
                  </div>
                ))}
              </div>
              <div className="relative shrink-0">
                <PieChart width={120} height={120}>
                  <Pie data={stats.paymentMethods} cx={55} cy={55} innerRadius={32} outerRadius={55}
                    paddingAngle={2} dataKey="value" stroke="none">
                    {stats.paymentMethods.map((e) => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                </PieChart>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-zinc-700">
                  100%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
