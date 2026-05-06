"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronDown, BedDouble, X, LogIn } from "lucide-react";

const S = "w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-[#0f1f38]/15 focus:border-[#0f1f38] transition appearance-none";

function Sel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

interface RoomOption {
  id: number;
  room_number: string;
  floor: number | null;
  room_type_name: string;
  price_per_night: number;
}

interface CheckInModalProps {
  bookingId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckInModal({ bookingId, onClose, onSuccess }: CheckInModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [bookingInfo, setBookingInfo] = useState<{
    firstName: string; lastName: string; roomType: string;
    checkIn: string; checkOut: string; guestId: number;
    adults: number; roomsCount: number; nights: number;
  } | null>(null);
  const [roomIds, setRoomIds] = useState<(number | "")[]>([]);
  const [availableRooms, setAvailableRooms] = useState<RoomOption[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // useMemo kept to avoid lint warning on unused import — remove if tree-shaking is preferred
  const bookingNo = useMemo(() => `AL${String(bookingId).padStart(4, "0")}`, [bookingId]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        const d = await res.json();
        if (d.error) { setError(d.error); return; }

        const adultsCount = Math.max(1, parseInt(d.adults) || 1);
        const roomsCount = Math.max(1, parseInt(d.rooms) || 1);

        setRoomIds(new Array(roomsCount).fill(""));
        setBookingInfo({
          firstName: d.firstName ?? "",
          lastName: d.lastName ?? "",
          roomType: d.roomType ?? "",
          checkIn: d.checkIn ?? "",
          checkOut: d.checkOut ?? "",
          guestId: d.guestId,
          adults: adultsCount,
          roomsCount,
          nights: d.nights ?? 0,
        });

        setLoadingRooms(true);
        try {
          const roomsRes = await fetch(
            `/api/rooms/available?roomType=${encodeURIComponent(d.roomType ?? "")}&checkIn=${d.checkIn}&checkOut=${d.checkOut}`
          );
          const roomsData = await roomsRes.json();
          setAvailableRooms(Array.isArray(roomsData) ? roomsData : []);
        } catch {
          setAvailableRooms([]);
        } finally {
          setLoadingRooms(false);
        }
      } catch {
        setError("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bookingId]);

  function setRoomId(idx: number, val: number | "") {
    setRoomIds((r) => r.map((v, i) => (i === idx ? val : v)));
  }

  async function handleSubmit() {
    if (!bookingInfo) return;
    setSubmitting(true);
    setError(null);
    try {
      const roomsPayload = roomIds.filter((r): r is number => r !== "");
      const res = await fetch(`/api/bookings/${bookingId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: bookingInfo.guestId, rooms: roomsPayload }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Check-in failed"); return; }
      onSuccess();
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] border border-slate-200">

        {/* Header */}
        <div className="px-6 py-5 bg-linear-to-r from-[#0f1f38] to-[#1e3a5f] rounded-t-2xl flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <LogIn size={18} className="text-[#c9a84c]" />
              <h2 className="text-base font-bold text-white">Check-In</h2>
              <span className="text-xs text-white/60 font-mono">{bookingNo}</span>
            </div>
            {bookingInfo && (
              <p className="text-xs text-white/70">
                {bookingInfo.firstName} {bookingInfo.lastName} &middot; {bookingInfo.roomType} &middot; {bookingInfo.checkIn} &rarr; {bookingInfo.checkOut}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition mt-0.5">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-6 h-6 border-2 border-[#0f1f38] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-slate-400">Loading booking details…</p>
            </div>
          ) : (
            <>
              {/* Booking Summary */}
              {bookingInfo && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-[#c9a84c] rounded-full" />
                    <span className="text-xs font-bold text-[#0f1f38] uppercase tracking-wider">Booking Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Guest</span>
                      <span className="font-semibold text-slate-700">{bookingInfo.firstName} {bookingInfo.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Room Type</span>
                      <span className="font-semibold text-slate-700">{bookingInfo.roomType || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Check-In</span>
                      <span className="font-semibold text-slate-700">{bookingInfo.checkIn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Check-Out</span>
                      <span className="font-semibold text-slate-700">{bookingInfo.checkOut}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nights</span>
                      <span className="font-semibold text-slate-700">{bookingInfo.nights}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Guests / Rooms</span>
                      <span className="font-semibold text-slate-700">
                        {bookingInfo.adults} guest{bookingInfo.adults !== 1 ? "s" : ""} &middot; {bookingInfo.roomsCount} room{bookingInfo.roomsCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Room Assignment */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-[#c9a84c] rounded-full" />
                  <BedDouble size={14} className="text-[#0f1f38]" />
                  <h3 className="text-sm font-bold text-[#0f1f38] uppercase tracking-wider">Room Assignment</h3>
                </div>
                {loadingRooms ? (
                  <div className="text-center py-6">
                    <div className="w-5 h-5 border-2 border-[#0f1f38] border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {roomIds.map((selectedId, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</div>
                        <div className="flex-1">
                          <Sel>
                            <select
                              className={S}
                              value={selectedId === "" ? "" : selectedId}
                              onChange={(e) => setRoomId(idx, e.target.value === "" ? "" : parseInt(e.target.value))}
                            >
                              <option value="">-- Select a room --</option>
                              {availableRooms
                                .filter((r) => !roomIds.some((rid, i) => i !== idx && rid === r.id))
                                .map((r) => (
                                  <option key={r.id} value={r.id}>
                                    Room {r.room_number} &middot; {r.room_type_name} &middot; &#8382;{Number(r.price_per_night).toFixed(2)}/night{r.floor != null ? ` · Floor ${r.floor}` : ""}
                                  </option>
                                ))}
                            </select>
                          </Sel>
                        </div>
                      </div>
                    ))}
                    {availableRooms.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-4">No available rooms — will check in without room assignment</p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="p-5 border-t border-slate-100 flex items-center gap-3">
            {error && <p className="flex-1 text-xs text-rose-500">{error}</p>}
            {!error && <span className="flex-1" />}
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              <LogIn size={14} />
              {submitting ? "Processing…" : "Confirm Check-In"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
