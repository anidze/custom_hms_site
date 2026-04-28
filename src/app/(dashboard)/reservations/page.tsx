"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, Pencil } from "lucide-react";

interface BookingRow {
  id: number;
  guestName: string;
  bookingNo: string;
  bookingSource: string;
  roomNo: string;
  roomType: string;
  bookingStatus: string;
  statusColor: string | null;
  totalPrice: number;
  paidAmount: number;
  checkIn: string;
  checkOut: string;
}

export default function ReservationsPage() {
  const [tab, setTab] = useState<"checkin" | "checkout">("checkin");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const router = useRouter();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reservations?tab=${tab}`);
      if (!res.ok) throw new Error("Server error");
      const data: BookingRow[] = await res.json();
      setRows(data);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const filtered = rows.filter(
    (r) =>
      search === "" ||
      r.guestName.toLowerCase().includes(search.toLowerCase()) ||
      r.bookingNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("checkin")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "checkin"
              ? "bg-[#0f1f38] text-white"
              : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
          }`}
        >
          Check-In
        </button>
        <button
          onClick={() => setTab("checkout")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "checkout"
              ? "bg-[#0f1f38] text-white"
              : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
          }`}
        >
          Check-Out
        </button>
      </div>

      {/* Filters row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors">
            All guest
            <ChevronDown size={13} />
          </button>
          <button className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors">
            Today
            <ChevronDown size={13} />
          </button>
        </div>

        <div className="flex items-center gap-2 border border-zinc-200 rounded-lg px-3 py-2 bg-white w-72">
          <input
            type="text"
            placeholder="Search by using booking name or no"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none text-xs text-zinc-600 bg-transparent placeholder-zinc-400"
          />
          <Search size={13} className="text-[#0f1f38]" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[40px_1fr_1fr_1fr_80px_1fr_1fr_1fr_1fr_80px] text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 px-4 py-3">
          <div />
          <div>Guest Name</div>
          <div>Booking No</div>
          <div>Booking Source</div>
          <div>Room No</div>
          <div>Room Type</div>
          <div>Status</div>
          <div>Total Amount</div>
          <div>Amount Status</div>
          <div />
        </div>

        {loading && (
          <div className="px-4 py-8 text-center text-sm text-zinc-400">
            Loading...
          </div>
        )}

        {error && (
          <div className="px-4 py-8 text-center text-sm text-rose-500">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-zinc-400">
            No records found
          </div>
        )}

        {!loading &&
          !error &&
          filtered.map((r, idx) => {
            const isSelected = selected.has(r.id);
            const due = r.totalPrice - r.paidAmount;
            const isPaid = due <= 0;

            return (
              <div
                key={r.id}
                className={`grid grid-cols-[40px_1fr_1fr_1fr_80px_1fr_1fr_1fr_1fr_80px] items-center px-4 py-3 border-b border-zinc-50 text-sm transition-colors ${
                  isSelected
                    ? "bg-orange-50"
                    : idx % 2 === 0
                    ? "bg-white"
                    : "bg-zinc-50/50"
                } hover:bg-orange-50/50`}
              >
                {/* Checkbox */}
                <div className="flex items-center">
                  {isSelected ? (
                    <span
                      className="w-3.5 h-3.5 rounded-full bg-[#0f1f38] block cursor-pointer"
                      onClick={() => toggleSelect(r.id)}
                    />
                  ) : (
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#0f1f38] cursor-pointer"
                      onChange={() => toggleSelect(r.id)}
                    />
                  )}
                </div>

                <div className="font-medium text-zinc-800">{r.guestName}</div>
                <div className="text-zinc-400 text-xs">{r.bookingNo}</div>
                <div className="text-zinc-400 text-xs">{r.bookingSource}</div>
                <div className="text-zinc-700 font-semibold text-xs">{r.roomNo}</div>
                <div className="text-zinc-400 text-xs">{r.roomType}</div>

                {/* Booking Status */}
                <div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: r.statusColor ?? undefined }}
                  >
                    {r.bookingStatus}
                  </span>
                </div>

                <div className="text-slate-700 font-semibold">
                  {r.totalPrice.toFixed(2)}$
                </div>

                {/* Amount Status */}
                <div className="text-sm">
                  {isPaid ? (
                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Paid
                    </span>
                  ) : (
                    <div className="flex flex-col leading-tight">
                      <span className="text-[11px] text-zinc-400">Due</span>
                      <span className="text-xs text-rose-500 font-semibold">
                        {due.toFixed(2)}$
                      </span>
                    </div>
                  )}
                </div>

                {/* Edit */}
                <div>
                  <button
                    onClick={() => router.push(`/reservations/${r.id}/edit`)}
                    className="flex items-center gap-1 border border-zinc-200 rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 transition-colors"
                  >
                    <Pencil size={11} />
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Add Booking */}
      <div className="flex justify-end">
        <button
          onClick={() => router.push("/reservations/new")}
          className="bg-[#0f1f38] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#0d1a33] transition-colors"
        >
          Add Booking
        </button>
      </div>
    </div>
  );
}

