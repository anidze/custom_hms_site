"use client";

import { useEffect, useState } from "react";
import { Calendar, Wallet, RotateCcw, TrendingUp, Printer, User, Banknote, CreditCard, Building2, Wifi, MoreHorizontal } from "lucide-react";

interface MethodRow { method: string; count: number; total: number; }
interface CashierRow { user_id: number; full_name: string | null; count: number; total: number; }
interface ShiftCloseData {
  date: string;
  user_id: number | null;
  payments: MethodRow[];
  totalIn: number;
  refundCount: number;
  refundTotal: number;
  netCash: number;
  perCashier: CashierRow[];
}

function todayISO() { return new Date().toISOString().split("T")[0]; }

const METHOD_ICON: Record<string, React.ReactNode> = {
  CASH:   <Banknote   size={14} />,
  CARD:   <CreditCard size={14} />,
  BANK:   <Building2  size={14} />,
  ONLINE: <Wifi       size={14} />,
  OTHER:  <MoreHorizontal size={14} />,
};

export default function ReportsPage() {
  const [date, setDate] = useState(todayISO);
  const [data, setData] = useState<ShiftCloseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/reports/shift-close?date=${date}`);
      const d = await r.json();
      if (!r.ok) { setError(d.error ?? "Failed to load report"); return; }
      setData(d);
    } catch { setError("Network error"); } finally { setLoading(false); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-xl font-bold text-[#0f1f38] flex items-center gap-2">
          <TrendingUp size={20} className="text-[#c9a84c]" /> Daily Close
        </h1>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#0f1f38]/15 focus:border-[#0f1f38]"
          />
          <button
            onClick={load}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg bg-[#0f1f38] text-white text-xs font-semibold hover:bg-[#1a3152] transition disabled:opacity-50"
          >
            {loading ? "Loading…" : "Run"}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
          >
            <Printer size={12} /> Print
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">{error}</p>}

      {data && (
        <>
          {/* Totals */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={13} className="text-emerald-500" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Money In</p>
              </div>
              <p className="text-2xl font-bold text-slate-800">₾{data.totalIn.toFixed(2)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {data.payments.reduce((s, p) => s + p.count, 0)} payment{data.payments.reduce((s, p) => s + p.count, 0) === 1 ? "" : "s"}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <RotateCcw size={13} className="text-rose-500" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Refunds Out</p>
              </div>
              <p className="text-2xl font-bold text-slate-800">₾{data.refundTotal.toFixed(2)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{data.refundCount} refund{data.refundCount === 1 ? "" : "s"}</p>
            </div>
            <div className="bg-[#0f1f38] rounded-xl border border-[#0f1f38] p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={13} className="text-[#c9a84c]" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">Net</p>
              </div>
              <p className="text-2xl font-bold">₾{data.netCash.toFixed(2)}</p>
              <p className="text-[11px] text-white/50 mt-0.5">for {data.date}</p>
            </div>
          </div>

          {/* By method */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Payments by method</p>
            {data.payments.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No payments recorded on this date.</p>
            ) : (
              <div className="space-y-2">
                {data.payments.map((p) => (
                  <div key={p.method} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/40">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                        {METHOD_ICON[p.method] ?? METHOD_ICON.OTHER}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{p.method}</p>
                        <p className="text-[11px] text-slate-400">{p.count} transaction{p.count === 1 ? "" : "s"}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-800">₾{p.total.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Per cashier */}
          {data.perCashier.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">By cashier</p>
              <div className="space-y-2">
                {data.perCashier.map((c) => (
                  <div key={c.user_id ?? "unknown"} className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0f1f38] text-white text-xs font-bold flex items-center justify-center">
                        {(c.full_name ?? "?").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{c.full_name ?? "Unknown"}</p>
                        <p className="text-[11px] text-slate-400">{c.count} payment{c.count === 1 ? "" : "s"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <User size={12} />
                      <p className="text-sm font-bold text-slate-800">₾{c.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
