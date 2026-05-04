"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Printer, ArrowLeft, Download, BedDouble, User, Calendar, CreditCard, Building2, AlertCircle } from "lucide-react";

interface InvoiceData {
  bookingId: number;
  bookingNo: string;
  createdAt: string;
  checkInISO: string;
  checkOutISO: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  kids: number;
  rooms: number;
  totalPrice: number;
  paidAmount: number;
  paymentMethod: string;
  bookingStatus: string;
  roomNo: string;
  roomType: string;
  pricePerNight: number;
  guestName: string;
  firstName: string;
  lastName: string;
  guestEmail: string;
  guestPhone: string;
  guestCountry: string;
  guestCity: string;
  hotelName: string;
  hotelAddress: string;
  hotelPhone: string;
  hotelEmail: string;
  hotelLogo: string | null;
}

function fmt(n: number) {
  return n.toFixed(2);
}

export default function InvoicePage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  const printRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/bookings/${bookingId}/invoice`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); return; }
        setData(d);
      })
      .catch(() => setError("Failed to load invoice"))
      .finally(() => setLoading(false));
  }, [bookingId]);

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-7 h-7 border-2 border-[#0f1f38] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <AlertCircle size={32} className="text-rose-400" />
        <p className="text-slate-500 text-sm">{error ?? "Invoice not found"}</p>
        <button onClick={() => router.back()} className="text-sm text-[#0f1f38] underline">Go back</button>
      </div>
    );
  }

  const due = data.totalPrice - data.paidAmount;
  const isPaid = due <= 0;

  return (
    <>
      {/* ── Action bar (hidden on print) ── */}
      <div className="print:hidden mb-6 flex items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#0f1f38] transition-colors font-medium"
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f1f38] text-white text-sm font-semibold hover:bg-[#1a3152] transition-colors shadow-sm"
          >
            <Printer size={14} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* ── Invoice document ── */}
      <div
        ref={printRef}
        className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:shadow-none print:border-none print:rounded-none print:max-w-full"
      >
        {/* Header */}
        <div className="bg-[#0f1f38] px-8 py-6 flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            {data.hotelLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.hotelLogo} alt="logo" className="h-12 w-12 rounded-xl object-cover bg-white p-1" />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
                <Building2 size={24} className="text-[#c9a84c]" />
              </div>
            )}
            <div>
              <p className="text-white font-bold text-lg leading-tight">{data.hotelName}</p>
              {data.hotelAddress && <p className="text-white/60 text-xs mt-0.5">{data.hotelAddress}</p>}
              <div className="flex items-center gap-3 mt-1">
                {data.hotelPhone && <p className="text-white/50 text-xs">{data.hotelPhone}</p>}
                {data.hotelEmail && <p className="text-white/50 text-xs">{data.hotelEmail}</p>}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest">Invoice</p>
            <p className="text-white font-mono text-xl font-bold mt-1">#{data.bookingNo}</p>
            <p className="text-white/50 text-xs mt-1">Issued: {data.createdAt}</p>
            <div className="mt-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isPaid ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                {isPaid ? "PAID" : "OUTSTANDING"}
              </span>
            </div>
          </div>
        </div>

        {/* Bill To + Stay Details */}
        <div className="grid grid-cols-2 gap-0 border-b border-slate-100">
          <div className="px-8 py-6 border-r border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <User size={13} className="text-[#c9a84c]" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bill To</p>
            </div>
            <p className="font-bold text-slate-800 text-base">{data.guestName}</p>
            {data.guestEmail && <p className="text-slate-500 text-sm mt-0.5">{data.guestEmail}</p>}
            {data.guestPhone && <p className="text-slate-500 text-sm">{data.guestPhone}</p>}
            {(data.guestCity || data.guestCountry) && (
              <p className="text-slate-400 text-xs mt-1">{[data.guestCity, data.guestCountry].filter(Boolean).join(", ")}</p>
            )}
          </div>
          <div className="px-8 py-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={13} className="text-[#c9a84c]" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Stay Details</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Check-In</span>
                <span className="font-semibold text-slate-700">{data.checkIn}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Check-Out</span>
                <span className="font-semibold text-slate-700">{data.checkOut}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Nights</span>
                <span className="font-semibold text-slate-700">{data.nights}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Room</span>
                <span className="font-semibold text-slate-700">
                  {data.roomNo !== "-" ? `#${data.roomNo}` : "—"} {data.roomType !== "-" ? `· ${data.roomType}` : ""}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Guests</span>
                <span className="font-semibold text-slate-700">{data.adults} adult{data.adults !== 1 ? "s" : ""}{data.kids > 0 ? `, ${data.kids} kid${data.kids !== 1 ? "s" : ""}` : ""}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="px-8 py-6">
          <div className="flex items-center gap-2 mb-4">
            <BedDouble size={13} className="text-[#c9a84c]" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Charges</p>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[3fr_1fr_1fr_1fr] text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
            <div>Description</div>
            <div className="text-center">Qty</div>
            <div className="text-right">Unit Price</div>
            <div className="text-right">Amount</div>
          </div>

          {/* Room accommodation line */}
          <div className="grid grid-cols-[3fr_1fr_1fr_1fr] py-3.5 border-b border-slate-50 items-center">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {data.roomType !== "-" ? data.roomType : "Room"} Accommodation
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {data.checkIn} → {data.checkOut} · {data.nights} {data.nights === 1 ? "night" : "nights"}
                {data.roomNo !== "-" ? ` · Room ${data.roomNo}` : ""}
              </p>
            </div>
            <div className="text-center text-sm text-slate-600">{data.nights}</div>
            <div className="text-right text-sm text-slate-600">
              ₾{fmt(Number(data.pricePerNight) || 0)}
            </div>
            <div className="text-right text-sm font-semibold text-slate-700">
              ₾{fmt(data.totalPrice)}
            </div>
          </div>

          {/* Totals */}
          <div className="mt-5 ml-auto w-64 space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Subtotal</span>
              <span className="font-medium text-slate-700">₾{fmt(data.totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Paid</span>
              <span className="font-medium text-emerald-600">— ₾{fmt(data.paidAmount)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2.5 flex justify-between">
              <span className="font-bold text-slate-800">Balance Due</span>
              <span className={`font-bold text-base ${due > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                ₾{fmt(Math.max(0, due))}
              </span>
            </div>
          </div>
        </div>

        {/* Payment & Status footer */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <CreditCard size={13} className="text-slate-400" />
            <span className="text-xs text-slate-400">Payment method:</span>
            <span className="text-xs font-semibold text-slate-600">{data.paymentMethod ?? "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Status:</span>
            <span className="text-xs font-semibold text-slate-600">{data.bookingStatus}</span>
          </div>
          <p className="text-xs text-slate-300 font-mono">#{data.bookingNo}</p>
        </div>

        {/* Thank you note */}
        <div className="px-8 py-5 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-400">Thank you for staying with <span className="font-semibold text-slate-600">{data.hotelName}</span>.</p>
          <p className="text-xs text-slate-300 mt-1">This invoice was generated automatically by the Hotel Management System.</p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          #__next, #__next * { visibility: visible; }
          div[class*="max-w-3xl"],
          div[class*="max-w-3xl"] * { visibility: visible; }
          div[class*="max-w-3xl"] { position: fixed; inset: 0; }
        }
      `}</style>
    </>
  );
}
