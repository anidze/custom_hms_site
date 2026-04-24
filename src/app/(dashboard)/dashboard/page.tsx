"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie,
} from "recharts";

const statCards = [
  { label: "Check-In",  sub: "Today", value: "201", total: "650", color: "text-amber-500" },
  { label: "Check-Out", sub: "Today", value: "432", total: "650", color: "text-sky-500" },
  { label: "Bookings",  sub: "Today", value: "179", total: "650", color: "text-emerald-500" },
  { label: "In-House",  sub: "Today", value: "78",  total: "650", color: "text-rose-500" },
];

const roomStatusData = [
  { name: "Occupied",  value: 114, color: "#60a5fa" },
  { name: "Inspected", value: 75,  color: "#fb923c" },
  { name: "Clean",     value: 30,  color: "#4ade80" },
  { name: "Dirty",     value: 9,   color: "#f87171" },
];

const occupancyData = [
  { month: "Mar", excellent: 72, average: 72, low: 0 },
  { month: "Apr", excellent: 0,  average: 60, low: 0 },
  { month: "May", excellent: 0,  average: 45, low: 28 },
  { month: "Jun", excellent: 99, average: 0,  low: 0 },
  { month: "Jul", excellent: 75, average: 72, low: 0 },
  { month: "Aug", excellent: 0,  average: 48, low: 26 },
  { month: "Sep", excellent: 0,  average: 72, low: 0 },
  { month: "Oct", excellent: 0,  average: 65, low: 0 },
  { month: "Nov", excellent: 0,  average: 78, low: 0 },
  { month: "Dec", excellent: 95, average: 0,  low: 0 },
  { month: "Jan", excellent: 0,  average: 62, low: 0 },
  { month: "Feb", excellent: 0,  average: 75, low: 0 },
];

const referralsData = [
  { name: "Friends",      value: 40, color: "#facc15" },
  { name: "Social Media", value: 30, color: "#a78bfa" },
  { name: "Websites",     value: 20, color: "#4ade80" },
  { name: "Digital Ads",  value: 10, color: "#f87171" },
];

export default function DashboardPage() {
  const roomTotal = roomStatusData.reduce((s, d) => s + d.value, 0);

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
            <span className="text-[11px] text-zinc-400 border border-zinc-100 rounded-md px-2 py-0.5">Monthly</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={occupancyData} barCategoryGap="25%">
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }} />
              <Bar dataKey="excellent" name="Excellent" fill="#4ade80" radius={[3, 3, 0, 0]} />
              <Bar dataKey="average"   name="Average"   fill="#60a5fa" radius={[3, 3, 0, 0]} />
              <Bar dataKey="low"       name="Low"       fill="#f87171" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            {[["#4ade80", "Excellent"], ["#60a5fa", "Average"], ["#f87171", "Low"]].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Referrals */}
        <div className="bg-white rounded-xl border border-zinc-100 p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Hotel Referrals</p>
          <div className="flex items-center gap-5">
            <div className="flex-1 space-y-3">
              {referralsData.map((d) => (
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
                <Pie data={referralsData} cx={55} cy={55} innerRadius={32} outerRadius={55}
                  paddingAngle={2} dataKey="value" stroke="none">
                  {referralsData.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
              </PieChart>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-zinc-700">
                100%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- stat cards data ----
const statCards = [
  { label: "Check-In", sub: "Today", value: "201/650", border: "border-yellow-400", icon: "➡️" },
  { label: "Check-out", sub: "Today", value: "432/650", border: "border-cyan-400", icon: "⬅️" },
  { label: "Bookings", sub: "Today", value: "179/650", border: "border-green-400", icon: "📅" },
  { label: "Inhouse", sub: "Today", value: "78/650", border: "border-red-400", icon: "👥" },
];

// ---- room status rings ----
const occupiedData = [
  { name: "Occupied Rooms", value: 114, color: "#60a5fa" },
  { name: "Inspected", value: 75, color: "#f97316" },
  { name: "Clean", value: 30, color: "#4ade80" },
  { name: "Dirty", value: 9, color: "#f87171" },
];

// ---- occupancy bar chart ----
const occupancyData = [
  { month: "Mar", excellent: 72, average: 72, low: 0 },
  { month: "Apr", excellent: 0, average: 60, low: 0 },
  { month: "May", excellent: 0, average: 45, low: 28 },
  { month: "Jun", excellent: 99, average: 0, low: 0 },
  { month: "Jul", excellent: 75, average: 72, low: 0 },
  { month: "Aug", excellent: 0, average: 48, low: 26 },
  { month: "Sep", excellent: 0, average: 72, low: 0 },
  { month: "Oct", excellent: 0, average: 65, low: 0 },
  { month: "Nov", excellent: 0, average: 78, low: 0 },
  { month: "Dec", excellent: 95, average: 0, low: 0 },
  { month: "Jan", excellent: 0, average: 62, low: 0 },
  { month: "Feb", excellent: 0, average: 75, low: 0 },
];

// ---- referrals ----
const referralsData = [
  { name: "Social Media", value: 30, color: "#a78bfa" },
  { name: "Friends", value: 40, color: "#facc15" },
  { name: "Websites", value: 20, color: "#4ade80" },
  { name: "Digital Ads", value: 10, color: "#f87171" },
];

// ---- ring legend ----
function RingLegend({ data }: { data: typeof occupiedData }) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      {data.map((d) => (
        <div key={d.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-slate-600">{d.name}</span>
          </div>
          <span className="font-semibold text-slate-800">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const total = occupiedData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-white rounded-xl border-2 ${card.border} p-5 shadow-sm`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <span>{card.icon}</span>
                <span>{card.label}</span>
              </div>
              <span className="text-slate-400 text-lg cursor-pointer">⋮</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">{card.sub}</p>
            <p className="text-3xl font-bold text-slate-800">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Room Status */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="font-semibold text-slate-800 mb-4 text-base">Room Status</h2>
        <div className="grid grid-cols-2 gap-6">
          {[
            { title: "Occupied Rooms", color: "#60a5fa" },
            { title: "Available Rooms", color: "#60a5fa" },
          ].map(({ title }) => (
            <div key={title} className="flex items-center gap-4">
              <div className="relative">
                <PieChart width={120} height={120}>
                  <Pie
                    data={occupiedData}
                    cx={55}
                    cy={55}
                    innerRadius={28}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {occupiedData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                  {total}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-700 mb-2 text-sm">{title}</p>
                <RingLegend data={occupiedData} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Occupancy Statistic */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 text-base">Occupancy Statistic</h2>
            <button className="text-sm border border-slate-200 rounded-lg px-3 py-1 flex items-center gap-1 text-slate-600">
              📅 Monthly
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={occupancyData} barCategoryGap="20%">
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="excellent" name="Excellent" fill="#4ade80" radius={[3, 3, 0, 0]} />
              <Bar dataKey="average" name="Average" fill="#22d3ee" radius={[3, 3, 0, 0]} />
              <Bar dataKey="low" name="Low" fill="#f87171" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-slate-600">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-400 inline-block" /> Excellent</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-cyan-400 inline-block" /> Average</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Low</span>
          </div>
        </div>

        {/* Hotel Referrals */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-4 text-base">Hotel Referral&apos;s</h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-2 flex-1 text-sm">
              {referralsData.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                    <span className="text-slate-600">{d.name}</span>
                  </div>
                  <span className="font-semibold text-slate-700">{d.value}%</span>
                </div>
              ))}
            </div>
            <div className="relative">
              <PieChart width={130} height={130}>
                <Pie
                  data={referralsData}
                  cx={60}
                  cy={60}
                  innerRadius={35}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {referralsData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700">
                100%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
