"use client";

import { useEffect, useState } from "react";
import { Moon, Play, AlertCircle } from "lucide-react";

interface AuditSummary {
  date: string;
  processed: number;
  skippedLegacy: number;
  nightsCharged: number;
  totalAmount: number;
}

interface LastRun {
  run_at: string;
  details: string;
}

export default function NightAuditWidget() {
  const [lastRun, setLastRun] = useState<LastRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<AuditSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  async function refresh() {
    try {
      const r = await fetch("/api/night-audit");
      const data = await r.json();
      if (r.ok) setLastRun(data.lastRun);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  useEffect(() => { refresh(); }, []);

  async function run() {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch("/api/night-audit", { method: "POST" });
      const data = await r.json();
      if (r.status === 403) {
        setForbidden(true);
        setError("You don't have permission to run the night audit.");
        return;
      }
      if (!r.ok) { setError(data.error ?? "Audit failed"); return; }
      setResult(data);
      refresh();
    } catch {
      setError("Network error");
    } finally {
      setRunning(false);
    }
  }

  let lastSummary: AuditSummary | null = null;
  if (lastRun?.details) {
    try { lastSummary = JSON.parse(lastRun.details); } catch { /* ignore */ }
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Moon size={14} className="text-[#0f1f38]" />
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Night Audit</p>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={running || forbidden}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f1f38] text-white text-xs font-semibold hover:bg-[#1a3152] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play size={11} /> {running ? "Running…" : "Run audit"}
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-zinc-400">Loading…</p>
      ) : lastRun ? (
        <div className="text-xs text-zinc-500">
          <p>
            <span className="text-zinc-400">Last run:</span>{" "}
            <span className="font-medium text-zinc-700">{lastRun.run_at}</span>
          </p>
          {lastSummary && (
            <p className="mt-1">
              <span className="text-zinc-400">Processed:</span>{" "}
              <span className="font-medium text-zinc-700">{lastSummary.processed}</span>
              <span className="mx-2 text-zinc-300">·</span>
              <span className="text-zinc-400">Charged:</span>{" "}
              <span className="font-medium text-zinc-700">{lastSummary.nightsCharged} nights</span>
              <span className="mx-2 text-zinc-300">·</span>
              <span className="text-zinc-400">Total:</span>{" "}
              <span className="font-medium text-zinc-700">₾{lastSummary.totalAmount.toFixed(2)}</span>
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-zinc-400">No audit has been run yet for this property.</p>
      )}

      {result && (
        <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">
          <p className="font-semibold">Audit complete for {result.date}</p>
          <p className="mt-0.5">
            {result.processed} booking{result.processed === 1 ? "" : "s"} processed
            {result.skippedLegacy > 0 && ` (${result.skippedLegacy} legacy skipped)`}
            {result.nightsCharged > 0 && `, ${result.nightsCharged} night${result.nightsCharged === 1 ? "" : "s"} charged`}
            {result.totalAmount > 0 && ` — ₾${result.totalAmount.toFixed(2)}`}.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
