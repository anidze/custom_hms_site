"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, MessageSquare, X, BedDouble } from "lucide-react";

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

const STATUS_OPTIONS: HKStatus[] = ["DIRTY", "CLEAN", "OUT OF SERVICE"];

const STATUS_STYLES: Record<HKStatus, string> = {
  DIRTY:            "bg-rose-100 text-rose-700",
  CLEAN:            "bg-emerald-100 text-emerald-700",
  "OUT OF SERVICE": "bg-zinc-100 text-zinc-500",
};

const CARD_BORDER: Record<HKStatus, string> = {
  DIRTY:            "border-rose-500",
  CLEAN:            "border-emerald-500",
  "OUT OF SERVICE": "border-zinc-300",
};

const CARD_SHADOW: Record<HKStatus, string> = {
  DIRTY:            "shadow-rose-100",
  CLEAN:            "shadow-emerald-100",
  "OUT OF SERVICE": "shadow-zinc-100",
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

async function persistHK(room_id: number, status: HKStatus, comments: string) {
  await fetch("/api/housekeeping", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room_id, status, comments }),
  }).catch(console.error);
}

export default function HousekeepingClient() {
  const [rooms, setRooms] = useState<HKRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRoom, setFilterRoom] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFloor, setFilterFloor] = useState("");
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
            room: `#${r.room_number}`,
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

  const roomOptions = [...new Set(rooms.map((r) => r.room))];
  const typeOptions = [...new Set(rooms.map((r) => r.roomType))];
  const floorOptions = [...new Set(rooms.map((r) => r.floor))].sort();

  const filtered = rooms.filter((r) => {
    if (filterRoom && !r.room.toLowerCase().includes(filterRoom.toLowerCase())) return false;
    if (filterType && r.roomType !== filterType) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterFloor && r.floor !== filterFloor) return false;
    return true;
  });

  // Group by floor, sort rooms within each floor by room number
  const floors = [...new Set(filtered.map((r) => r.floor))].sort();
  const grouped = floors.map((floor) => ({
    floor,
    rooms: filtered.filter((r) => r.floor === floor),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400 text-sm">
        Loading rooms...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Filter row */}
      <div className="flex items-center gap-3 flex-wrap">
        <FilterDropdown label="Room" value={filterRoom} options={roomOptions} onChange={setFilterRoom} />
        <FilterDropdown label="Room Type" value={filterType} options={typeOptions} onChange={setFilterType} />
        <FilterDropdown label="Housekeeping Status" value={filterStatus} options={STATUS_OPTIONS} onChange={setFilterStatus} />
        <FilterDropdown label="Floor" value={filterFloor} options={floorOptions} onChange={setFilterFloor} />
        {(filterRoom || filterType || filterStatus || filterFloor) && (
          <button
            onClick={() => { setFilterRoom(""); setFilterType(""); setFilterStatus(""); setFilterFloor(""); }}
            className="text-xs text-orange-500 underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Grouped by floor */}
      {grouped.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-100 text-center text-zinc-400 text-sm py-10">
          No rooms found
        </div>
      ) : (
        grouped.map(({ floor, rooms: floorRooms }) => {
          const isCollapsed = collapsedFloors.has(floor);
          const floorLabel = `სართული ${parseInt(floor, 10)}`;
          return (
            <div key={floor} className="space-y-3 ">
              {/* Floor header */}
              <button
                onClick={() => toggleFloor(floor)}
                className="flex items-center gap-2 px-1"
              >
                <ChevronDown
                  size={16}
                  className={`text-zinc-400 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
                />
                <span className="font-bold text-zinc-700 text-sm uppercase tracking-wide">{floorLabel}</span>
                <span className="text-xs text-zinc-400">({floorRooms.length} ოთახი)</span>
              </button>

              {!isCollapsed && (
                <div className="flex flex-wrap gap-4">
                  {floorRooms.map((r) => (
                    <div
                      key={r.id}
                      className={`border-2 ${CARD_BORDER[r.status]} ${CARD_SHADOW[r.status]} shadow-md rounded-2xl bg-white flex flex-col items-center justify-between w-36 h-40 p-3 gap-1`}
                    >
                      {/* Top: status selector */}
                      <div className="w-full flex justify-center">
                        <div className="relative inline-flex w-full">
                          <select
                            value={r.status}
                            onChange={(e) => updateStatus(r.id, e.target.value as HKStatus)}
                            className={`w-full appearance-none rounded-lg px-2 pr-6 py-1 text-[11px] font-semibold cursor-pointer focus:outline-none text-center ${STATUS_STYLES[r.status]}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                        </div>
                      </div>

                      {/* Middle: room number */}
                      <div className="flex flex-col items-center justify-center flex-1">
                        <BedDouble size={18} className="text-zinc-300 mb-1" />
                        <span className="text-2xl font-extrabold text-zinc-800 leading-none">
                          {r.room.replace("#", "")}
                        </span>
                      </div>

                      {/* Bottom: category + notes button */}
                      <div className="w-full flex items-center justify-between gap-1">
                        <span className="text-[11px] text-zinc-400 truncate leading-tight">{r.roomType}</span>
                        <button
                          onClick={() => setCommentModal({ roomId: r.id, comment: r.comments })}
                          className={`shrink-0 p-1 rounded-md transition-colors ${
                            r.comments
                              ? "text-orange-500 bg-orange-50 hover:bg-orange-100"
                              : "text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100"
                          }`}
                          title={r.comments || "Add note"}
                        >
                          <MessageSquare size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

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
