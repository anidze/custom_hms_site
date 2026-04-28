"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, MessageSquare, X } from "lucide-react";

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
  room_type_name: string;
}

const STATUS_OPTIONS: HKStatus[] = ["DIRTY", "CLEAN", "CLEANING", "OUT OF SERVICE", "INSPECTED"];
const PRIORITY_OPTIONS: Priority[] = ["HIGH", "LOW", "MEDIUM"];

const STATUS_STYLES: Record<HKStatus, string> = {
  DIRTY:          "bg-rose-100 text-rose-700",
  CLEAN:          "bg-emerald-100 text-emerald-700",
  CLEANING:       "bg-sky-100 text-sky-700",
  "OUT OF SERVICE":"bg-zinc-100 text-zinc-500",
  INSPECTED:      "bg-blue-100 text-blue-700",
};

const PRIORITY_STYLES: Record<Priority, string> = {
  HIGH:   "bg-rose-500 text-white",
  LOW:    "bg-amber-100 text-amber-700",
  MEDIUM: "bg-orange-400 text-white",
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
        className="appearance-none bg-white border border-zinc-200 rounded-lg pl-3 pr-8 py-2 text-sm text-zinc-600 cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-400"
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
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
        className={`appearance-none rounded-lg pl-3 pr-8 py-2 text-sm font-semibold cursor-pointer focus:outline-none ${STATUS_STYLES[value]}`}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
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
        className={`appearance-none rounded-lg pl-3 pr-8 py-2 text-sm font-semibold cursor-pointer focus:outline-none ${PRIORITY_STYLES[value]}`}
      >
        {PRIORITY_OPTIONS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
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
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [commentModal, setCommentModal] = useState<{ roomId: number; comment: string } | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  function toggleCategory(cat: string) {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  useEffect(() => {
    fetch("/api/rooms")
      .then((r) => r.json())
      .then((data: ApiRoom[]) => {
        setRooms(
          data.map((r) => ({
            id: r.id,
            room: `#${r.room_number}`,
            roomType: r.room_type_name,
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
  function updateComment(id: number, comment: string) {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, comments: comment } : r)));
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

  // Group filtered rooms by category, sort within each by floor
  const categories = [...new Set(filtered.map((r) => r.roomType))].sort();
  const grouped = categories.map((cat) => ({
    category: cat,
    rooms: filtered
      .filter((r) => r.roomType === cat)
      .sort((a, b) => a.floor.localeCompare(b.floor)),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400 text-sm">
        Loading rooms...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
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
            className="text-xs text-orange-500 underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Grouped by category */}
      {grouped.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-100 text-center text-zinc-400 text-sm py-10">
          No rooms found
        </div>
      ) : (
        grouped.map(({ category, rooms: catRooms }) => {
          const isCollapsed = collapsedCategories.has(category);
          return (
            <div key={category} className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center gap-3 px-6 py-3 bg-zinc-50 border-b border-zinc-100 hover:bg-orange-50/60 transition-colors"
              >
                <ChevronDown
                  size={16}
                  className={`text-zinc-400 transition-transform duration-200 ${
                    isCollapsed ? "-rotate-90" : ""
                  }`}
                />
                <span className="font-semibold text-zinc-700 text-sm">{category}</span>
                <span className="text-xs text-zinc-400 ml-1">({catRooms.length} ოთახი)</span>
              </button>

              {!isCollapsed && (
                <>
                  {/* Column header */}
                  <div className="grid grid-cols-[140px_1fr_200px_100px_60px] text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 px-6 py-3">
                    <div className="text-center">Room</div>
                    <div className="text-center">Housekeeping Status</div>
                    <div className="text-center">Priority</div>
                    <div className="text-center">Floor</div>
                    <div className="text-center">Notes</div>
                  </div>

                  {/* Rows sorted by floor */}
                  {catRooms.map((r, idx) => (
                    <div
                      key={r.id}
                      className={`grid grid-cols-[140px_1fr_200px_100px_60px] items-center px-6 py-4 border-b border-zinc-50 ${
                        idx % 2 === 0 ? "bg-white" : "bg-zinc-50/40"
                      } hover:bg-orange-50/50 transition-colors`}
                    >
                      <div className="font-bold text-zinc-800 text-base text-center">{r.room}</div>
                      <div className="flex justify-center">
                        <StatusBadge value={r.status} onChange={(v) => updateStatus(r.id, v)} />
                      </div>
                      <div className="flex justify-center">
                        <PriorityBadge value={r.priority} onChange={(v) => updatePriority(r.id, v)} />
                      </div>
                      <div className="text-zinc-700 font-medium text-sm text-center">Floor {r.floor}</div>
                      <div className="flex justify-center">
                        <button
                          onClick={() => setCommentModal({ roomId: r.id, comment: r.comments })}
                          className={`p-1.5 rounded-md transition-colors ${
                            r.comments
                              ? "text-orange-500 bg-orange-50 hover:bg-orange-100"
                              : "text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100"
                          }`}
                          title={r.comments || "Add note"}
                        >
                          <MessageSquare size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          );
        })
      )}

      {/* Add Task button */}
      <div className="flex justify-end">
        <button className="bg-[#0f1f38] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#162d4e] transition-colors">
          + Add Task
        </button>
      </div>

      {/* Comment Modal */}
      {commentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setCommentModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-800 text-base flex items-center gap-2">
                <MessageSquare size={18} className="text-orange-500" />
                Comments &amp; Notes
              </h3>
              <button
                onClick={() => setCommentModal(null)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <textarea
              ref={commentInputRef}
              rows={5}
              value={commentModal.comment}
              onChange={(e) => setCommentModal({ ...commentModal, comment: e.target.value })}
              placeholder="კომენტარი ან შენიშვნა..."
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCommentModal(null)}
                className="px-4 py-2 text-sm rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors"
              >
                გაუქმება
              </button>
              <button
                onClick={() => {
                  updateComment(commentModal.roomId, commentModal.comment);
                  setCommentModal(null);
                }}
                className="px-4 py-2 text-sm rounded-lg bg-[#0f1f38] text-white font-semibold hover:bg-[#162d4e] transition-colors"
              >
                შენახვა
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
