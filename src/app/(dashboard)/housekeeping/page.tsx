"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

type HKStatus = "DIRTY" | "CLEAN" | "CLEANING" | "OUT OF SERVICE" | "INSPECTED";
type Priority = "HIGH" | "LOW" | "MEDIUM";

interface HKRoom {
  id: number;
  room: string;
  roomType: string;
  status: HKStatus;
  priority: Priority;
  floor: string;
  comments: string;
}

interface ApiRoom {
  id: number;
  room_number: string;
  floor: number | null;
  room_type: { name_eng: string };
}

const STATUS_OPTIONS: HKStatus[] = ["DIRTY", "CLEAN", "CLEANING", "OUT OF SERVICE", "INSPECTED"];
const PRIORITY_OPTIONS: Priority[] = ["HIGH", "LOW", "MEDIUM"];

const STATUS_STYLES: Record<HKStatus, string> = {
  DIRTY:          "bg-red-200 text-red-700",
  CLEAN:          "bg-green-200 text-green-700",
  CLEANING:       "bg-cyan-200 text-cyan-700",
  "OUT OF SERVICE":"bg-yellow-200 text-yellow-700",
  INSPECTED:      "bg-blue-200 text-blue-700",
};

const PRIORITY_STYLES: Record<Priority, string> = {
  HIGH:   "bg-red-400 text-white",
  LOW:    "bg-yellow-200 text-yellow-700",
  MEDIUM: "bg-orange-300 text-white",
};

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-sm text-slate-600 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#d56f4d]"
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

function StatusBadge({
  value,
  onChange,
}: {
  value: HKStatus;
  onChange: (v: HKStatus) => void;
}) {
  return (
    <div className="relative inline-flex">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as HKStatus)}
        className={`appearance-none rounded-md pl-2 pr-7 py-1 text-xs font-semibold cursor-pointer focus:outline-none ${STATUS_STYLES[value]}`}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
    </div>
  );
}

function PriorityBadge({
  value,
  onChange,
}: {
  value: Priority;
  onChange: (v: Priority) => void;
}) {
  return (
    <div className="relative inline-flex">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Priority)}
        className={`appearance-none rounded-md pl-2 pr-7 py-1 text-xs font-semibold cursor-pointer focus:outline-none ${PRIORITY_STYLES[value]}`}
      >
        {PRIORITY_OPTIONS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
    </div>
  );
}

export default function HousekeepingPage() {
  const [rooms, setRooms] = useState<HKRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRoom, setFilterRoom] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterFloor, setFilterFloor] = useState("");

  useEffect(() => {
    fetch("/api/rooms")
      .then((r) => r.json())
      .then((data: ApiRoom[]) => {
        setRooms(
          data.map((r) => ({
            id: r.id,
            room: `#${r.room_number}`,
            roomType: r.room_type.name_eng,
            floor: r.floor != null ? String(r.floor).padStart(2, "0") : "01",
            status: "CLEAN" as HKStatus,
            priority: "LOW" as Priority,
            comments: "",
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function updateStatus(id: number, status: HKStatus) {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }
  function updatePriority(id: number, priority: Priority) {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, priority } : r)));
  }

  const roomOptions = [...new Set(rooms.map((r) => r.room))];
  const typeOptions = [...new Set(rooms.map((r) => r.roomType))];
  const floorOptions = [...new Set(rooms.map((r) => r.floor))].sort();

  const filtered = rooms.filter((r) => {
    if (filterRoom && !r.room.toLowerCase().includes(filterRoom.toLowerCase())) return false;
    if (filterType && r.roomType !== filterType) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterPriority && r.priority !== filterPriority) return false;
    if (filterFloor && r.floor !== filterFloor) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Loading rooms...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter row */}
      <div className="flex items-center gap-3 flex-wrap">
        <FilterDropdown label="Room" value={filterRoom} options={roomOptions} onChange={setFilterRoom} />
        <FilterDropdown label="Room Type" value={filterType} options={typeOptions} onChange={setFilterType} />
        <FilterDropdown label="Housekeeping Status" value={filterStatus} options={STATUS_OPTIONS} onChange={setFilterStatus} />
        <FilterDropdown label="Priority" value={filterPriority} options={PRIORITY_OPTIONS} onChange={setFilterPriority} />
        <FilterDropdown label="Floor" value={filterFloor} options={floorOptions} onChange={setFilterFloor} />
        {(filterRoom || filterType || filterStatus || filterPriority || filterFloor) && (
          <button
            onClick={() => { setFilterRoom(""); setFilterType(""); setFilterStatus(""); setFilterPriority(""); setFilterFloor(""); }}
            className="text-xs text-[#d56f4d] underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[100px_1fr_220px_160px_80px_1fr] text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100 px-6 py-3">
          <div>Room</div>
          <div>Room Type</div>
          <div>Housekeeping Status</div>
          <div>Priority</div>
          <div>Floor</div>
          <div>Comments &amp; Notes</div>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="text-center text-slate-400 text-sm py-10">No rooms found</div>
        ) : (
          filtered.map((r, idx) => (
            <div
              key={r.id}
              className={`grid grid-cols-[100px_1fr_220px_160px_80px_1fr] items-center px-6 py-3 border-b border-slate-50 text-sm ${
                idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
              } hover:bg-[#fff4f1] transition-colors`}
            >
              <div className="font-semibold text-slate-700">{r.room}</div>
              <div className="text-slate-600">{r.roomType}</div>
              <div>
                <StatusBadge value={r.status} onChange={(v) => updateStatus(r.id, v)} />
              </div>
              <div>
                <PriorityBadge value={r.priority} onChange={(v) => updatePriority(r.id, v)} />
              </div>
              <div className="text-slate-600">{r.floor}</div>
              <div className="text-slate-500 text-xs">{r.comments}</div>
            </div>
          ))
        )}
      </div>

      {/* Add Task button */}
      <div className="flex justify-end">
        <button className="bg-[#d56f4d] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#c05f3d] transition-colors">
          + Add Task
        </button>
      </div>
    </div>
  );
}
