"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, StickyNote, AlertCircle } from "lucide-react";
import PaymentPanel, { type PaymentData } from "@/components/payments/PaymentPanel";
import NotesPanel,   { type Note        } from "@/components/payments/NotesPanel";

type Tab = "payments" | "notes";

export default function FolioPage() {
  const params    = useParams();
  const router    = useRouter();
  const bookingId = params.id as string;

  const [tab,             setTab]             = useState<Tab>("payments");
  const [paymentData,     setPaymentData]     = useState<PaymentData | null>(null);
  const [notes,           setNotes]           = useState<Note[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingNotes,    setLoadingNotes]    = useState(true);
  const [error,           setError]           = useState<string | null>(null);

  // Fetch payment data
  const fetchPayments = useCallback(async () => {
    setLoadingPayments(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/payments`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to load payments"); return; }
      setPaymentData(data);
    } catch { setError("Network error"); }
    finally   { setLoadingPayments(false); }
  }, [bookingId]);

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    setLoadingNotes(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/notes`);
      const data = await res.json();
      if (res.ok) setNotes(data.notes ?? []);
    } catch { /* non-critical */ }
    finally   { setLoadingNotes(false); }
  }, [bookingId]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);
  useEffect(() => { fetchNotes(); },    [fetchNotes]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <AlertCircle size={32} className="text-rose-400" />
        <p className="text-sm text-zinc-500">{error}</p>
        <button onClick={() => router.back()} className="text-xs text-[#0f1f38] hover:underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 transition"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-[15px] font-semibold text-zinc-900">Folio & Notes</h1>
          <p className="text-[11px] text-zinc-400">Booking #{bookingId}</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-zinc-100 p-1 rounded-2xl w-fit">
        {([
          { key: "payments", label: "Payments", icon: <CreditCard size={13} /> },
          { key: "notes",    label: "Notes",    icon: <StickyNote size={13} /> },
        ] as { key: Tab; label: string; icon: React.ReactNode }[]).map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold transition ${
              tab === key
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {icon} {label}
            {key === "notes" && notes.length > 0 && (
              <span className="ml-0.5 bg-zinc-200 text-zinc-600 text-[10px] rounded-full px-1.5 py-0.5 font-medium">
                {notes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {tab === "payments" && (
        loadingPayments ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#0f1f38] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : paymentData ? (
          <PaymentPanel
            bookingId={bookingId}
            data={paymentData}
            canDelete={true}
            onRefresh={fetchPayments}
          />
        ) : null
      )}

      {tab === "notes" && (
        loadingNotes ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#0f1f38] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <NotesPanel
            bookingId={bookingId}
            notes={notes}
            canDelete={true}
            onRefresh={fetchNotes}
          />
        )
      )}
    </div>
  );
}
