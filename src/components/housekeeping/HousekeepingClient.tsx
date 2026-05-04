"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, MessageSquare, X, BedDouble, Search } from "lucide-react";

type HKStatus = "DIRTY" | "CLEAN" | "OUT OF SERVICE";

interface HKRoom {
  id: number;
  room: string;
  roomType: string;
  status: HKStatus;
  floor: string;
  comments: string;
}

interface ApiHKRoom {
  id: number;
  room_number: string;
  floor: number | null;
  room_type_name: string;
  status: string;
  comments: string;
}

interface HousekeepingClientProps {
  hotelName: string;
}

const STATUS_OPTIONS: HKStatus[] = ["DIRTY", "CLEAN", "OUT OF SERVICE"];

const STATUS_STYLES: Record<HKStatus, string> = {
  DIRTY:            "bg-rose-100 text-rose-700",
  CLEAN:            "bg-emerald-100 text-emerald-700",
  "OUT OF SERVICE": "bg-slate-100 text-slate-500",
};

const CARD_BORDER: Record<HKStatus, string> = {
  DIRTY:            "border-rose-400",
  CLEAN:            "border-emerald-400",
  "OUT OF SERVICE": "border-slate-300",
};

async function persistHK(room_id: number, status: HKStatus, comments: string) {
  await fetch("/api/housekeeping", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room_id, status, comments }),
  }).catch(console.error);
}

export default function HousekeepingClient({ hotelName }: HousekeepingClientProps) {
  const [rooms, setRooms] = useState<HKRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | HKStatus>("");
  const [filterFloor, setFilterFloor] = useState("all");
  const [search, setSearch] = useState("");
  const [collapsedFloors, setCollapsedFloors] = useState<Set<string>>(new Set());
  const [commentModal, setCommentModal] = useState<{ roomId: number; comment: string } | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  function toggleFloor(floor: string) {
    setCollapsedFloors((prev) => {
      const next = new Set(prev);
      if (next.has(floor)) next.delete(floor);
      else next.add(floor);
      return next;
    });
  }

  useEffect(() => {
    fetch("/api/housekeeping")
      .then((r) => r.json())
      .then((data: ApiHKRoom[]) => {
        setRooms(
          data.map((r) => ({
            id: r.id,
            room: r.room_number,
            roomType: r.room_type_name,
            floor: r.floor != null ? String(r.floor).padStart(2, "0") : "01",
            status: (r.status as HKStatus) ?? "CLEAN",
            comments: r.comments ?? "",
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function updateStatus(id: number, status: HKStatus) {
    const room = rooms.find((r) => r.id === id);
    if (!room) return;
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    persistHK(id, status, room.comments);
  }

  function updateComment(id: number, comment: string) {
    const room = rooms.find((r) => r.id === id);
    if (!room) return;
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, comments: comment } : r)));
    persistHK(id, room.status, comment);
  }

  const typeOptions = [...new Set(rooms.map((r) => r.roomType))].sort();
  const floorOptions = [...new Set(rooms.map((r) => r.floor))].sort();

  const filtered = rooms.filter((r) => {
    if (filterType && r.roomType !== filterType) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterFloor !== "all" && r.floor !== filterFloor) return false;
    if (search && !r.room.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const groupedFloors = [...new Set(filtered.map((r) => r.floor))].sort();
  const grouped = groupedFloors.map((floor) => ({
    floor,
    rooms: filtered.filter((r) => r.floor === floor),
  }));

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    weekday: "long",
  });

  return (
    <div className="-m-8 flex flex-col min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
            <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
            <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
            <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
          </svg>
          <span>{today}</span>
        </div>
        <h1 className="text-lg font-bold text-slate-800 tracking-wide">
          HOUSEKEEPING &mdash; {hotelName}
        </h1>
        <div className="w-32" />
      </div>

      <div className="flex-1 p-8 bg-slate-50">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {(["all", "DIRTY", "CLEAN", "OUT OF SERVICE"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s === "all" ? "" : s)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                (s === "all" ? filterStatus === "" : filterStatus === s)
                  ? "bg-[#0f1f38] text-white border-[#0f1f38]"
                  : "bg-white text-slate-700 border-slate-300 hover:border-[#0f1f38]"
              }`}
            >
              {s === "all"
                ? "All rooms"
                : s === "OUT OF SERVICE"
                ? "Out of Service"
                : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}

          {/* Floor dropdown */}
          <div className="relative">
            <select
              value={filterFloor}
              onChange={(e) => setFilterFloor(e.target.value)}
              className="appearance-none bg-white border border-slate-300 text-sm text-slate-700 font-semibold px-4 py-2 pr-8 rounded-lg cursor-pointer focus:outline-none focus:border-[#0f1f38]"
            >
              <option value="all">Select Floor</option>
              {floorOptions.map((f) => (
                <option key={f} value={f}>Floor {parseInt(f, 10)}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          </div>

          {/* Room type dropdown */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none bg-white border border-slate-300 text-sm text-slate-700 font-semibold px-4 py-2 pr-8 rounded-lg cursor-pointer focus:outline-none focus:border-[#0f1f38]"
            >
              <option value="">Room Type</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs ml-auto">
            <input
              type="text"
              placeholder="Search by room number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-300 rounded-lg text-sm px-4 py-2 pr-10 focus:outline-none focus:border-[#0f1f38]"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Summary badges */}
        <div className="flex gap-4 mb-6">
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-slate-100 text-sm">
            <span className="text-slate-500">Total Rooms: </span>
            <span className="font-bold text-slate-800">{rooms.length}</span>
          </div>
          <div className="bg-emerald-50 rounded-lg px-4 py-2 shadow-sm border border-emerald-100 text-sm">
            <span className="text-slate-500">Clean: </span>
            <span className="font-bold text-emerald-700">{rooms.filter((r) => r.status === "CLEAN").length}</span>
          </div>
          <div className="bg-rose-50 rounded-lg px-4 py-2 shadow-sm border border-rose-100 text-sm">
            <span className="text-slate-500">Dirty: </span>
            <span className="font-bold text-rose-600">{rooms.filter((r) => r.status === "DIRTY").length}</span>
          </div>
          <div className="bg-slate-100 rounded-lg px-4 py-2 shadow-sm border border-slate-200 text-sm">
            <span className="text-slate-500">Out of Service: </span>
            <span className="font-bold text-slate-600">{rooms.filter((r) => r.status === "OUT OF SERVICE").length}</span>
          </div>
        </div>

        {/* Floor groups */}
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-slate-100">
            <div className="flex flex-col items-center gap-3 text-slate-400 text-sm">
              <div className="w-6 h-6 border-2 border-[#0f1f38] border-t-transparent rounded-full animate-spin" />
              Loading rooms&hellip;
            </div>
          </div>
        ) : grouped.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 text-center text-slate-400 text-sm py-12">
            No rooms found
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ floor, rooms: floorRooms }) => {
              const isCollapsed = collapsedFloors.has(floor);
              return (
                <div key={floor}>
                  <button
                    onClick={() => toggleFloor(floor)}
                    className="flex items-center gap-2 mb-4 px-1"
                  >
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
                    />
                    <span className="font-bold text-slate-700 text-sm uppercase tracking-wide">
                      Floor {parseInt(floor, 10)}
                    </span>
                    <span className="text-xs text-slate-400">({floorRooms.length} rooms)</span>
                  </button>

                  {!isCollapsed && (
                    <div className="flex flex-wrap justify-center gap-5">
                      {floorRooms.map((r) => (
                        <div
                          key={r.id}
                          className={`border-2 ${CARD_BORDER[r.status]} shadow-md rounded-2xl bg-white flex flex-col items-center justify-between w-48 h-56 p-4 gap-2`}
                        >
                          {/* Status selector */}
                          <div className="w-full flex justify-center">
                            <div className="relative inline-flex w-full">
                              <select
                                value={r.status}
                                onChange={(e) => updateStatus(r.id, e.target.value as HKStatus)}
                                className={`w-full appearance-none rounded-xl px-2 pr-6 py-1.5 text-xs font-bold tracking-wide cursor-pointer focus:outline-none text-center ${STATUS_STYLES[r.status]}`}
                              >
                                {STATUS_OPTIONS.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                            </div>
                          </div>

                          {/* Room number */}
                          <div className="flex flex-col items-center justify-center flex-1">
                            <BedDouble size={28} className="text-slate-200 mb-2" />
                            <span className="text-4xl font-extrabold text-slate-800 leading-none">
                              {r.room}
                            </span>
                          </div>

                          {/* Type + notes */}
                          <div className="w-full flex items-center justify-between gap-1">
                            <span className="text-xs text-slate-400 truncate font-medium">{r.roomType}</span>
                            <button
                              onClick={() => setCommentModal({ roomId: r.id, comment: r.comments })}
                              className={`shrink-0 p-1.5 rounded-lg transition-colors ${
                                r.comments
                                  ? "text-[#c9a84c] bg-amber-50 hover:bg-amber-100"
                                  : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"
                              }`}
                              title={r.comments || "Add note"}
                            >
                              <MessageSquare size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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
              <h3 className="font-semibold text-slate-800 text-base flex items-center gap-2">
                <MessageSquare size={18} className="text-[#c9a84c]" />
                Comments &amp; Notes
              </h3>
              <button
                onClick={() => setCommentModal(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <textarea
              ref={commentInputRef}
              rows={5}
              value={commentModal.comment}
              onChange={(e) => setCommentModal({ ...commentModal, comment: e.target.value })}
              placeholder="Comment or note..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f1f38]/20 resize-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCommentModal(null)}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateComment(commentModal.roomId, commentModal.comment);
                  setCommentModal(null);
                }}
                className="px-4 py-2 text-sm rounded-lg bg-[#0f1f38] text-white font-semibold hover:bg-[#162d4e] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
