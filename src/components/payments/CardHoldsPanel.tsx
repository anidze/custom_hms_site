"use client";

import { useEffect, useState, useCallback } from "react";
import { ShieldCheck, Plus, CheckCircle2, XCircle, Clock, AlertCircle, CreditCard } from "lucide-react";

export interface Hold {
  id: number;
  amount: number;
  currency: string;
  status: "AUTHORIZED" | "CAPTURED" | "RELEASED" | "EXPIRED";
  card_last4: string | null;
  auth_code: string | null;
  notes: string | null;
  created_at: string;
  captured_at: string | null;
  released_at: string | null;
  expires_at: string | null;
  captured_payment_id: number | null;
  staff_name: string | null;
}

interface Props {
  bookingId: string | number;
  onPaymentsChanged?: () => void; // ping parent when a capture happens
}

const BADGE: Record<Hold["status"], string> = {
  AUTHORIZED: "bg-amber-100 text-amber-700 border-amber-200",
  CAPTURED:   "bg-emerald-100 text-emerald-700 border-emerald-200",
  RELEASED:   "bg-slate-100 text-slate-500 border-slate-200",
  EXPIRED:    "bg-rose-100 text-rose-700 border-rose-200",
};

const BADGE_ICON: Record<Hold["status"], React.ReactNode> = {
  AUTHORIZED: <Clock size={11} />,
  CAPTURED:   <CheckCircle2 size={11} />,
  RELEASED:   <XCircle size={11} />,
  EXPIRED:    <AlertCircle size={11} />,
};

export default function CardHoldsPanel({ bookingId, onPaymentsChanged }: Props) {
  const [holds, setHolds]               = useState<Hold[]>([]);
  const [activeAmount, setActiveAmount] = useState(0);
  const [loading, setLoading]           = useState(true);
  const [showAdd, setShowAdd]           = useState(false);
  const [amount, setAmount]             = useState("");
  const [cardLast4, setCardLast4]       = useState("");
  const [authCode, setAuthCode]         = useState("");
  const [notes, setNotes]               = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [busyId, setBusyId]             = useState<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`/api/bookings/${bookingId}/holds`);
      const data = await r.json();
      if (r.ok) {
        setHolds(data.holds ?? []);
        setActiveAmount(data.activeAmount ?? 0);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [bookingId]);

  useEffect(() => { refresh(); }, [refresh]);

  async function createHold(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError("Enter a hold amount"); return; }
    setSubmitting(true);
    try {
      const r = await fetch(`/api/bookings/${bookingId}/holds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          card_last4: cardLast4 || undefined,
          auth_code: authCode || undefined,
          notes: notes || undefined,
        }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error ?? "Failed"); return; }
      setShowAdd(false);
      setAmount(""); setCardLast4(""); setAuthCode(""); setNotes("");
      refresh();
    } catch { setError("Network error"); } finally { setSubmitting(false); }
  }

  async function action(holdId: number, kind: "capture" | "release") {
    setBusyId(holdId);
    try {
      await fetch(`/api/bookings/${bookingId}/holds/${holdId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: kind }),
      });
      refresh();
      if (kind === "capture") onPaymentsChanged?.();
    } catch { /* ignore */ } finally { setBusyId(null); }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#0f1f38]" />
          <h3 className="text-sm font-bold text-[#0f1f38]">Card Holds</h3>
          {activeAmount > 0 && (
            <span className="ml-2 text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
              ₾{activeAmount.toFixed(2)} held
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1f38] text-white text-xs font-semibold hover:bg-[#1a3152] transition"
        >
          <Plus size={11} /> {showAdd ? "Cancel" : "New hold"}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={createHold} className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Amount (GEL)</label>
              <input
                type="number" min="0" step="0.01" required
                value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0f1f38]/15 focus:border-[#0f1f38]"
                placeholder="100.00"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Card last 4</label>
              <input
                maxLength={4} pattern="[0-9]*"
                value={cardLast4} onChange={(e) => setCardLast4(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0f1f38]/15 focus:border-[#0f1f38]"
                placeholder="1234"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Auth code</label>
              <input
                value={authCode} onChange={(e) => setAuthCode(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0f1f38]/15 focus:border-[#0f1f38]"
                placeholder="from terminal"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Notes</label>
            <input
              value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0f1f38]/15 focus:border-[#0f1f38]"
              placeholder="e.g. incidentals deposit"
            />
          </div>
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-[#0f1f38] text-white text-xs font-semibold hover:bg-[#1a3152] transition disabled:opacity-50"
            >
              {submitting ? "Authorizing…" : "Place hold"}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="w-5 h-5 border-2 border-[#0f1f38] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : holds.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">No card holds on this booking.</p>
      ) : (
        <div className="space-y-2">
          {holds.map((h) => (
            <div key={h.id} className="rounded-xl border border-slate-200 p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <CreditCard size={15} className="text-slate-500" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-slate-800">₾{Number(h.amount).toFixed(2)}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase border rounded-full px-2 py-0.5 ${BADGE[h.status]}`}>
                      {BADGE_ICON[h.status]} {h.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {h.card_last4 ? `Card •••• ${h.card_last4}` : "No card on file"}
                    {h.auth_code ? ` · Auth ${h.auth_code}` : ""}
                    {" · "}{h.created_at}
                    {h.staff_name ? ` · ${h.staff_name}` : ""}
                  </p>
                  {h.notes && <p className="text-[11px] text-slate-500 mt-0.5 italic">{h.notes}</p>}
                </div>
              </div>
              {h.status === "AUTHORIZED" && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => action(h.id, "capture")}
                    disabled={busyId === h.id}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    Capture
                  </button>
                  <button
                    type="button"
                    onClick={() => action(h.id, "release")}
                    disabled={busyId === h.id}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition disabled:opacity-50"
                  >
                    Release
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
