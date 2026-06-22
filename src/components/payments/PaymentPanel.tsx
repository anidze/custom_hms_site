"use client";

import { useState, useCallback } from "react";
import {
  CreditCard, Banknote, Building2, Wifi, MoreHorizontal,
  Plus, Trash2, CheckCircle2, Clock, AlertCircle, XCircle,
  TrendingUp, Wallet, RotateCcw, ShieldAlert,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface Payment {
  id: number;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  transaction_ref: string | null;
  approval_code: string | null;
  notes: string | null;
  created_at: string;
  staff_name: string | null;
}

export interface Refund {
  id: number;
  payment_id: number;
  amount: number;
  reason: string | null;
  status: string;
  refunded_at: string;
  staff_name: string | null;
}

export interface PaymentData {
  totalPrice: number;
  paidAmount: number;
  refundedAmount: number;
  balance: number;
  paymentStatus: string;
  payments: Payment[];
  refunds: Refund[];
}

interface Props {
  bookingId: string | number;
  data: PaymentData;
  canDelete?: boolean;
  canRefund?: boolean;
  onRefresh: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const METHOD_ICON: Record<string, React.ReactNode> = {
  CASH:   <Banknote  size={14} />,
  CARD:   <CreditCard size={14} />,
  BANK:   <Building2 size={14} />,
  ONLINE: <Wifi       size={14} />,
  OTHER:  <MoreHorizontal size={14} />,
};

const METHOD_LABELS: Record<string, string> = {
  CASH: "Cash", CARD: "Card", BANK: "Bank Transfer", ONLINE: "Online", OTHER: "Other",
};

const STATUS_BADGE: Record<string, string> = {
  COMPLETED:      "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING:        "bg-amber-50   text-amber-700   border-amber-200",
  FAILED:         "bg-rose-50    text-rose-700    border-rose-200",
  REFUNDED:       "bg-sky-50     text-sky-700     border-sky-200",
  PARTIAL_REFUND: "bg-purple-50  text-purple-700  border-purple-200",
  CHARGEBACK:     "bg-orange-50  text-orange-700  border-orange-200",
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PAID:    { label: "Paid",         color: "text-emerald-600", icon: <CheckCircle2 size={15} /> },
  PARTIAL: { label: "Partial",      color: "text-amber-600",   icon: <Clock        size={15} /> },
  PENDING: { label: "Pending",      color: "text-zinc-400",    icon: <AlertCircle  size={15} /> },
  FAILED:  { label: "Failed",       color: "text-rose-600",    icon: <XCircle      size={15} /> },
};

function fmt(n: number) { return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

// ─── Add Payment Modal ────────────────────────────────────────────────────────
function AddPaymentModal({
  bookingId, onClose, onSaved,
}: { bookingId: string | number; onClose: () => void; onSaved: () => void }) {
  const [amount,         setAmount]         = useState("");
  const [method,         setMethod]         = useState("CASH");
  const [currency,       setCurrency]       = useState("GEL");
  const [transactionRef, setTransactionRef] = useState("");
  const [approvalCode,   setApprovalCode]   = useState("");
  const [notes,          setNotes]          = useState("");
  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState<string | null>(null);

  async function handleSave() {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Enter a valid amount"); return;
    }
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount), payment_method: method, currency,
          transaction_ref: transactionRef || null,
          approval_code:   approvalCode   || null,
          notes:           notes          || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }
      onSaved();
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#0f1f38] flex items-center justify-center">
            <Wallet size={15} className="text-white" />
          </div>
          <h2 className="text-[15px] font-semibold text-zinc-900">Add Payment</h2>
        </div>

        <div className="px-6 py-4 space-y-3">
          {error && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-lg">
              <AlertCircle size={13} /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-zinc-500 block mb-1">Amount *</label>
              <input
                type="number" min="0.01" step="0.01"
                value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0f1f38] focus:ring-2 focus:ring-[#0f1f38]/10 transition"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-zinc-500 block mb-1">Currency</label>
              <select
                value={currency} onChange={(e) => setCurrency(e.target.value)}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0f1f38] transition bg-white"
              >
                <option value="GEL">GEL ₾</option>
                <option value="USD">USD $</option>
                <option value="EUR">EUR €</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-500 block mb-1">Payment Method *</label>
            <div className="grid grid-cols-5 gap-1.5">
              {(["CASH","CARD","BANK","ONLINE","OTHER"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`flex flex-col items-center gap-1 py-2 rounded-xl border text-[10px] font-medium transition ${
                    method === m
                      ? "bg-[#0f1f38] border-[#0f1f38] text-white"
                      : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                  }`}
                >
                  {METHOD_ICON[m]}
                  {METHOD_LABELS[m].split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-zinc-500 block mb-1">Transaction Ref</label>
              <input
                value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0f1f38] focus:ring-2 focus:ring-[#0f1f38]/10 transition"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-zinc-500 block mb-1">Approval Code</label>
              <input
                value={approvalCode} onChange={(e) => setApprovalCode(e.target.value)}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0f1f38] focus:ring-2 focus:ring-[#0f1f38]/10 transition"
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-500 block mb-1">Notes</label>
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0f1f38] focus:ring-2 focus:ring-[#0f1f38]/10 transition resize-none"
              placeholder="Optional internal note"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-zinc-500 hover:bg-zinc-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave} disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-[#0f1f38] text-white hover:bg-[#1a3050] transition disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Refund confirmation modal ────────────────────────────────────────────────
function RefundModal({
  bookingId, payment, maxRefund, onClose, onSaved,
}: {
  bookingId: string | number;
  payment: Payment;
  maxRefund: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState(maxRefund.toFixed(2));
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  async function handleSave() {
    const amt = Number(amount);
    if (!amt || amt <= 0) { setError("Enter a valid amount"); return; }
    if (amt > maxRefund + 0.001) { setError(`Maximum refundable is ${maxRefund.toFixed(2)}`); return; }
    if (!reason.trim()) { setError("Please give a reason for the refund"); return; }
    if (!confirm) { setError("Please confirm this is an authorized refund"); return; }
    setSaving(true); setError(null);
    try {
      const r = await fetch(`/api/bookings/${bookingId}/payments/${payment.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, reason: reason.trim() }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error ?? "Failed to issue refund"); return; }
      onSaved();
    } catch { setError("Network error"); } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-3 bg-rose-50/50">
          <div className="w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center">
            <ShieldAlert size={15} className="text-white" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-zinc-900">Issue Refund</h2>
            <p className="text-[11px] text-zinc-500">Manager-only action. This will reduce the booking&apos;s paid total.</p>
          </div>
        </div>

        <div className="px-6 py-4 space-y-3">
          {error && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-lg">
              <AlertCircle size={13} /> {error}
            </div>
          )}

          <div className="rounded-xl bg-zinc-50 border border-zinc-100 px-3 py-2 text-xs text-zinc-500">
            Payment <span className="font-mono">#{payment.id}</span>
            <span className="mx-1.5 text-zinc-300">·</span>
            {payment.currency} {fmt(Number(payment.amount))}
            <span className="mx-1.5 text-zinc-300">·</span>
            {payment.payment_method}
            <span className="mx-1.5 text-zinc-300">·</span>
            Max refundable: <span className="font-semibold text-zinc-700">{fmt(maxRefund)}</span>
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-500 block mb-1">Refund amount *</label>
            <input
              type="number" min="0.01" step="0.01" max={maxRefund}
              value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-500 block mb-1">Reason *</label>
            <textarea
              value={reason} onChange={(e) => setReason(e.target.value)} rows={2}
              className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition resize-none"
              placeholder="e.g. Cancelled stay, billing error, goodwill gesture…"
            />
          </div>

          <label className="flex items-start gap-2 text-xs text-zinc-600 cursor-pointer select-none">
            <input
              type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)}
              className="mt-0.5 accent-rose-500"
            />
            I confirm this refund is authorized and the guest has been informed.
          </label>
        </div>

        <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-zinc-500 hover:bg-zinc-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave} disabled={saving || !confirm}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-rose-500 text-white hover:bg-rose-600 transition disabled:opacity-50"
          >
            {saving ? "Issuing…" : "Issue Refund"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirmation modal ─────────────────────────────────────────────────
function DeleteConfirmModal({
  payment, onClose, onConfirm, deleting,
}: {
  payment: Payment;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="px-6 pt-5 pb-3 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
            <Trash2 size={15} className="text-rose-500" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-zinc-900">Delete payment?</h3>
            <p className="text-[12px] text-zinc-500 mt-1">
              Soft-deletes payment <span className="font-mono">#{payment.id}</span> ({payment.currency} {fmt(Number(payment.amount))}).
              The audit trail is preserved but the amount stops counting toward paid total.
            </p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-zinc-500 hover:bg-zinc-50 transition">
            Cancel
          </button>
          <button
            onClick={onConfirm} disabled={deleting}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-rose-500 text-white hover:bg-rose-600 transition disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PaymentPanel({ bookingId, data, canDelete = false, canRefund = false, onRefresh }: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId,   setDeletingId]   = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null);
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);

  const statusCfg = PAYMENT_STATUS_CONFIG[data.paymentStatus] ?? PAYMENT_STATUS_CONFIG["PENDING"];
  const pct       = data.totalPrice > 0
    ? Math.min(100, Math.round((data.paidAmount / data.totalPrice) * 100))
    : 0;

  // Lookup of already-refunded total per payment, so the Refund modal can cap correctly.
  const refundedByPayment = data.refunds.reduce<Record<number, number>>((acc, r) => {
    acc[r.payment_id] = (acc[r.payment_id] ?? 0) + Number(r.amount);
    return acc;
  }, {});

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await fetch(`/api/bookings/${bookingId}/payments/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      onRefresh();
    } finally { setDeletingId(null); }
  }, [bookingId, deleteTarget, onRefresh]);

  return (
    <>
      {showAddModal && (
        <AddPaymentModal
          bookingId={bookingId}
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); onRefresh(); }}
        />
      )}

      {refundTarget && (
        <RefundModal
          bookingId={bookingId}
          payment={refundTarget}
          maxRefund={Math.max(0, Number(refundTarget.amount) - (refundedByPayment[refundTarget.id] ?? 0))}
          onClose={() => setRefundTarget(null)}
          onSaved={() => { setRefundTarget(null); onRefresh(); }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          payment={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          deleting={deletingId === deleteTarget.id}
        />
      )}

      <div className="space-y-4">
        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",     value: fmt(data.totalPrice),    icon: <TrendingUp size={15} />, color: "bg-[#0f1f38]",   text: "text-white" },
            { label: "Paid",      value: fmt(data.paidAmount),    icon: <CheckCircle2 size={15} />, color: "bg-emerald-500", text: "text-white" },
            { label: "Balance",   value: fmt(data.balance),       icon: <AlertCircle size={15} />,  color: "bg-amber-400",  text: "text-white" },
            { label: "Refunded",  value: fmt(data.refundedAmount),icon: <Wallet size={15} />,       color: "bg-sky-500",    text: "text-white" },
          ].map(({ label, value, icon, color, text }) => (
            <div key={label} className="bg-white rounded-2xl border border-zinc-100 p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center ${text} shrink-0`}>
                {icon}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
                <p className="text-[15px] font-bold text-zinc-900 truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Progress Bar ── */}
        <div className="bg-white rounded-2xl border border-zinc-100 px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className={`flex items-center gap-1 text-[12px] font-semibold ${statusCfg.color}`}>
                {statusCfg.icon} {statusCfg.label}
              </span>
            </div>
            <span className="text-[12px] font-semibold text-zinc-700">{pct}% paid</span>
          </div>
          <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: pct >= 100 ? "#10b981" : pct > 0 ? "#f59e0b" : "#e4e4e7",
              }}
            />
          </div>
        </div>

        {/* ── Payments Table ── */}
        <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard size={14} className="text-zinc-400" />
              <span className="text-[13px] font-semibold text-zinc-800">Payment Transactions</span>
              <span className="text-[11px] bg-zinc-100 text-zinc-500 rounded-full px-2 py-0.5 font-medium">
                {data.payments.length}
              </span>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium bg-[#0f1f38] text-white hover:bg-[#1a3050] transition"
            >
              <Plus size={12} /> Add
            </button>
          </div>

          {data.payments.length === 0 ? (
            <div className="py-10 text-center text-zinc-400 text-sm">No payments recorded yet</div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {data.payments.map((p) => (
                <div key={p.id} className="px-5 py-3 flex items-center gap-3 hover:bg-zinc-50/50 transition group">
                  <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500 shrink-0">
                    {METHOD_ICON[p.payment_method] ?? <MoreHorizontal size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-zinc-800">
                        {p.currency} {fmt(Number(p.amount))}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_BADGE[p.status] ?? "bg-zinc-50 text-zinc-500 border-zinc-200"}`}>
                        {p.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {METHOD_LABELS[p.payment_method] ?? p.payment_method}
                      {p.transaction_ref && <> · {p.transaction_ref}</>}
                      {p.staff_name && <> · {p.staff_name}</>}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-zinc-400">{p.created_at}</p>
                    {p.approval_code && (
                      <p className="text-[10px] text-zinc-300 font-mono">{p.approval_code}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    {canRefund && p.status === "COMPLETED" && (
                      <button
                        type="button"
                        onClick={() => setRefundTarget(p)}
                        className="p-1.5 rounded-lg text-zinc-300 hover:text-rose-500 hover:bg-rose-50 transition"
                        title="Issue refund"
                      >
                        <RotateCcw size={13} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(p)}
                        disabled={deletingId === p.id}
                        className="p-1.5 rounded-lg text-zinc-300 hover:text-rose-500 hover:bg-rose-50 transition"
                        title="Delete payment"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Refunds ── */}
        {data.refunds.length > 0 && (
          <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-100 flex items-center gap-2">
              <Wallet size={14} className="text-sky-500" />
              <span className="text-[13px] font-semibold text-zinc-800">Refunds</span>
              <span className="text-[11px] bg-sky-50 text-sky-600 rounded-full px-2 py-0.5 font-medium">
                {data.refunds.length}
              </span>
            </div>
            <div className="divide-y divide-zinc-50">
              {data.refunds.map((r) => (
                <div key={r.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500 shrink-0">
                    <Wallet size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-zinc-800">— {fmt(Number(r.amount))}</p>
                    {r.reason && <p className="text-[11px] text-zinc-400 truncate">{r.reason}</p>}
                    {r.staff_name && <p className="text-[11px] text-zinc-300">{r.staff_name}</p>}
                  </div>
                  <p className="text-[11px] text-zinc-400 shrink-0">{r.refunded_at}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
