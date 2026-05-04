"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Search, BedDouble, AlertCircle } from "lucide-react";

interface BookingRow {
  id: number;
  bookingNo: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  roomNo: string;
  roomType: string;
  totalPrice: number;
  paidAmount: number;
  bookingStatus: string;
  statusColor: string | null;
}

export default function InvoicePage() {
  const router = useRouter();
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/reservations")
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setError("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.guestName.toLowerCase().includes(q) ||
      r.bookingNo.toLowerCase().includes(q) ||
      r.roomNo.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Invoices</h1>
          <p className="text-sm text-slate-400 mt-0.5">Generate and print guest invoices</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm max-w-80">
        <Search size={14} className="text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search guest, booking no, room…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 outline-none text-sm text-slate-600 bg-transparent placeholder-slate-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 px-5 py-3">
          <div>Guest</div>
          <div>Booking #</div>
          <div>Stay</div>
          <div>Room</div>
          <div>Amount</div>
          <div className="text-right">Invoice</div>
        </div>

        {loading && (
          <div className="py-16 text-center">
            <div className="w-6 h-6 border-2 border-[#0f1f38] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400">Loading…</p>
          </div>
        )}

        {error && (
          <div className="py-16 text-center text-rose-500">
            <AlertCircle size={24} className="mx-auto mb-2" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="py-16 text-center">
            <BedDouble size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-medium">No bookings found</p>
          </div>
        )}

        {!loading && !error && filtered.map((r, idx) => {
          const due = r.totalPrice - r.paidAmount;
          const isPaid = due <= 0;
          return (
            <div
              key={r.id}
              className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center px-5 py-3.5 border-b border-slate-50 text-sm hover:bg-slate-50/60 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/20"}`}
            >
              <div className="font-semibold text-slate-800 truncate pr-2">{r.guestName}</div>
              <div className="font-mono text-xs text-slate-500">{r.bookingNo}</div>
              <div className="text-xs text-slate-500">{r.checkIn} → {r.checkOut}</div>
              <div>
                {r.roomNo !== "-"
                  ? <span className="bg-[#0f1f38] text-white text-[11px] font-bold px-2 py-0.5 rounded-lg">{r.roomNo}</span>
                  : <span className="text-slate-300 text-xs">—</span>}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">₾{r.totalPrice.toFixed(2)}</p>
                <p className={`text-xs font-medium ${isPaid ? "text-emerald-600" : "text-amber-600"}`}>
                  {isPaid ? "Paid" : `Due ₾${due.toFixed(2)}`}
                </p>
              </div>
              <div>
                <button
                  onClick={() => router.push(`/reservations/${r.id}/invoice`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1f38] text-white text-[11px] font-semibold hover:bg-[#c9a84c] transition-colors"
                >
                  <FileText size={11} />
                  View
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

