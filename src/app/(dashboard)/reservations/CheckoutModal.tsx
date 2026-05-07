"use client";

import { useState, useEffect } from "react";
import {
  X, LogOut, CreditCard, AlertTriangle, Loader2, ChevronDown,
  BedDouble, Calendar, Moon, CheckCircle, FileText,
} from "lucide-react";

interface FolioLine {
  id: number;
  line_type: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  is_credit: boolean;
  created_at: string;
}

interface BookingSummary {
  bookingNo: string;
  guestName: string;
  roomNo: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  paidAmount: number;
}

interface CheckoutModalProps {
  bookingId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const LINE_TYPE_COLORS: Record<string, string> = {
  "Room Charge": "text-slate-700",
  "Breakfast":   "text-amber-700",
  "Extra Bed":   "text-violet-700",
  "Tax":         "text-slate-600",
  "Discount":    "text-emerald-700",
  "Deposit":     "text-emerald-700",
  "Payment":     "text-emerald-700",
  "Other":       "text-slate-600",
};

export default function CheckoutModal({ bookingId, onClose, onSuccess }: CheckoutModalProps) {
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const [summary, setSummary] = useState<BookingSummary | null>(null);
  const [lines,   setLines]   = useState<FolioLine[]>([]);
  const [folio, setFolio] = useState<{
    totalCharges: number; totalCredits: number; totalPaid: number; balance: number;
  }>({ totalCharges: 0, totalCredits: 0, totalPaid: 0, balance: 0 });

  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("Cash");
  const [payNotes,  setPayNotes]  = useState("");

  const bookingNo = `AL${String(bookingId).padStart(4, "0")}`;

  useEffect(() => {
    async function load() {
      try {
        const [invoiceRes, folioRes] = await Promise.all([
          fetch(`/api/bookings/${bookingId}/invoice`),
          fetch(`/api/bookings/${bookingId}/folio`),
        ]);
        const inv  = await invoiceRes.json();
        const fol  = await folioRes.json();

        if (inv.error) { setError(inv.error); setLoading(false); return; }

        setSummary({
          bookingNo:  inv.bookingNo,
          guestName:  inv.guestName,
          roomNo:     inv.roomNo,
          roomType:   inv.roomType,
          checkIn:    inv.checkIn,
          checkOut:   inv.checkOut,
          nights:     inv.nights,
          totalPrice: parseFloat(inv.totalPrice) || 0,
          paidAmount: parseFloat(inv.paidAmount) || 0,
        });

        if (!fol.error) {
          setLines(fol.lines ?? []);
          const balance = fol.balance ?? Math.max(0, (parseFloat(inv.totalPrice) || 0) - (parseFloat(inv.paidAmount) || 0));
          setFolio({
            totalCharges: fol.totalCharges ?? (parseFloat(inv.totalPrice) || 0),
            totalCredits: fol.totalCredits ?? 0,
            totalPaid:    fol.totalPaid    ?? (parseFloat(inv.paidAmount) || 0),
            balance:      Math.max(0, balance),
          });
          // Pre-fill the balance as the payment amount
          const bal = Math.max(0, balance);
          if (bal > 0) setPayAmount(bal.toFixed(2));
        } else {
          // Folio table not yet created — fall back to invoice totals
          const balance = Math.max(0, (parseFloat(inv.totalPrice) || 0) - (parseFloat(inv.paidAmount) || 0));
          setFolio({ totalCharges: parseFloat(inv.totalPrice)||0, totalCredits:0, totalPaid: parseFloat(inv.paidAmount)||0, balance });
          if (balance > 0) setPayAmount(balance.toFixed(2));
        }
      } catch {
        setError("Failed to load checkout details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bookingId]);

  async function handleCheckout() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentAmount: payAmount ? parseFloat(payAmount) : undefined,
          paymentMethod: payAmount ? payMethod : undefined,
          notes:         payNotes  || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Checkout failed"); return; }
      onSuccess();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] border border-slate-200 overflow-hidden">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="px-6 py-4 bg-linear-to-r from-[#7c3a00] to-[#b85500] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <LogOut size={18} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Guest Checkout</h2>
                <span className="text-xs font-mono text-white/50 bg-white/10 px-2 py-0.5 rounded-md">{bookingNo}</span>
              </div>
              {summary && (
                <p className="text-xs text-white/60 mt-0.5">
                  {summary.guestName} · Room {summary.roomNo} · {summary.nights} night{summary.nights !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition">
            <X size={16} />
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 size={28} className="animate-spin text-amber-700 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Loading checkout details…</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                <AlertTriangle size={13} />{error}
              </div>
            )}

            {/* ── Booking Summary ─────────────────────────────────────── */}
            {summary && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-amber-500 rounded-full" />
                  <BedDouble size={13} className="text-slate-700" />
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Booking Summary</span>
                </div>
                <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 text-xs">
                  <div className="flex justify-between col-span-1">
                    <span className="text-slate-500">Guest</span>
                    <span className="font-semibold text-slate-700">{summary.guestName}</span>
                  </div>
                  <div className="flex justify-between col-span-1">
                    <span className="text-slate-500">Room</span>
                    <span className="font-semibold text-slate-700">{summary.roomNo} ({summary.roomType})</span>
                  </div>
                  <div className="flex justify-between col-span-1">
                    <span className="text-slate-500 flex items-center gap-1"><Moon size={10} />Nights</span>
                    <span className="font-semibold text-slate-700">{summary.nights}</span>
                  </div>
                  <div className="flex justify-between col-span-1">
                    <span className="text-slate-500 flex items-center gap-1"><Calendar size={10} />Check-In</span>
                    <span className="font-semibold text-slate-700">{summary.checkIn}</span>
                  </div>
                  <div className="flex justify-between col-span-1">
                    <span className="text-slate-500 flex items-center gap-1"><Calendar size={10} />Check-Out</span>
                    <span className="font-semibold text-slate-700">{summary.checkOut}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Folio Lines ─────────────────────────────────────────── */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                <FileText size={13} className="text-slate-600" />
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Folio / Charges</span>
              </div>

              {lines.length === 0 ? (
                <div className="px-4 py-4 text-xs text-slate-400 text-center">
                  No folio lines recorded — total based on booking price
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {lines.map((line) => (
                    <div key={line.id} className="flex items-center justify-between px-4 py-2.5 text-xs">
                      <div className="min-w-0">
                        <span className={`font-semibold ${LINE_TYPE_COLORS[line.line_type] ?? "text-slate-700"}`}>
                          {line.line_type}
                        </span>
                        {line.description && (
                          <span className="text-slate-400 ml-1.5">— {line.description}</span>
                        )}
                      </div>
                      <span className={`font-bold shrink-0 ml-4 ${line.is_credit ? "text-emerald-600" : "text-slate-800"}`}>
                        {line.is_credit ? "–" : ""} ${parseFloat(String(line.total_amount)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Total Charges</span>
                  <span className="font-semibold text-slate-700">${folio.totalCharges.toFixed(2)}</span>
                </div>
                {folio.totalCredits > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Credits / Deposits</span>
                    <span className="font-semibold">– ${folio.totalCredits.toFixed(2)}</span>
                  </div>
                )}
                <div className="h-px bg-slate-200" />
                <div className="flex justify-between text-sm font-bold">
                  <span className={folio.balance > 0 ? "text-amber-700" : "text-emerald-600"}>
                    {folio.balance > 0 ? "Outstanding Balance" : "Balance Settled"}
                  </span>
                  <span className={folio.balance > 0 ? "text-amber-700" : "text-emerald-600"}>
                    ${folio.balance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Payment Collection ──────────────────────────────────── */}
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-violet-400 rounded-full" />
                <CreditCard size={13} className="text-slate-700" />
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Final Payment</span>
                {folio.balance <= 0 && (
                  <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle size={11} /> Fully Paid
                  </span>
                )}
              </div>

              {folio.balance > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Amount Due
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                        <input
                          type="number" min="0" step="0.01" value={payAmount}
                          onChange={e => setPayAmount(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Payment Method
                      </label>
                      <div className="relative">
                        <select
                          value={payMethod} onChange={e => setPayMethod(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition appearance-none"
                        >
                          <option>Cash</option>
                          <option>Credit Card</option>
                          <option>Debit Card</option>
                          <option>Bank Transfer</option>
                          <option>Cheque</option>
                          <option>City Ledger</option>
                          <option>OTA (Booking.com)</option>
                          <option>OTA (Expedia)</option>
                        </select>
                        <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Notes (optional)</label>
                    <input
                      value={payNotes} onChange={e => setPayNotes(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                      placeholder="Optional payment note…"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  No outstanding balance. Click <strong>Complete Checkout</strong> to proceed.
                </p>
              )}
            </div>

          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50/80 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCheckout}
            disabled={submitting || loading}
            className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition shadow-sm"
          >
            {submitting
              ? <><Loader2 size={15} className="animate-spin" /> Processing…</>
              : <><LogOut size={15} /> Complete Checkout</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
