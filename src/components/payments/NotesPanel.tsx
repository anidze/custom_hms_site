"use client";

import { useState, useCallback } from "react";
import {
  StickyNote, Pin, PinOff, Trash2, Pencil,
  AlertTriangle, Lock, Plus, Check, X,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Note {
  id: number;
  note_type: string;
  body: string;
  is_pinned: boolean;
  is_private: boolean;
  priority: string;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  staff_name: string | null;
}

interface Props {
  bookingId: string | number;
  notes: Note[];
  canDelete?: boolean;
  onRefresh: () => void;
}

// ─── Config ──────────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  GENERAL:     "bg-zinc-100     text-zinc-600",
  PAYMENT:     "bg-emerald-50   text-emerald-700",
  HOUSEKEEPING:"bg-sky-50       text-sky-700",
  RECEPTION:   "bg-violet-50    text-violet-700",
  MANAGEMENT:  "bg-[#0f1f38]/10 text-[#0f1f38]",
  SECURITY:    "bg-rose-50      text-rose-700",
};

const TYPE_LABELS: Record<string, string> = {
  GENERAL: "General", PAYMENT: "Payment", HOUSEKEEPING: "Housekeeping",
  RECEPTION: "Reception", MANAGEMENT: "Management", SECURITY: "Security",
};

const PRIORITY_CONFIG: Record<string, { label: string; dot: string }> = {
  LOW:    { label: "Low",    dot: "bg-zinc-300" },
  NORMAL: { label: "Normal", dot: "bg-sky-400" },
  HIGH:   { label: "High",   dot: "bg-amber-400" },
  URGENT: { label: "Urgent", dot: "bg-rose-500" },
};

// ─── Note Card ───────────────────────────────────────────────────────────────
function NoteCard({
  note, bookingId, canDelete, onRefresh,
}: { note: Note; bookingId: string | number; canDelete: boolean; onRefresh: () => void }) {
  const [editing,  setEditing]  = useState(false);
  const [editBody, setEditBody] = useState(note.body);
  const [saving,   setSaving]   = useState(false);

  const pCfg = PRIORITY_CONFIG[note.priority] ?? PRIORITY_CONFIG["NORMAL"];

  async function handlePin() {
    await fetch(`/api/bookings/${bookingId}/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_pinned: !note.is_pinned }),
    });
    onRefresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this note?")) return;
    await fetch(`/api/bookings/${bookingId}/notes/${note.id}`, { method: "DELETE" });
    onRefresh();
  }

  async function handleSaveEdit() {
    if (!editBody.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/bookings/${bookingId}/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteBody: editBody }),
      });
      setEditing(false);
      onRefresh();
    } finally { setSaving(false); }
  }

  return (
    <div className={`bg-white rounded-2xl border px-4 py-3.5 space-y-2 transition ${
      note.is_pinned ? "border-[#c9a84c]/40 shadow-sm" : "border-zinc-100"
    }`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        {note.is_pinned && <Pin size={12} className="text-[#c9a84c] shrink-0" />}
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[note.note_type] ?? TYPE_COLORS["GENERAL"]}`}>
          {TYPE_LABELS[note.note_type] ?? note.note_type}
        </span>
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${pCfg.dot}`} title={pCfg.label} />
        {note.is_private && <Lock size={11} className="text-zinc-300 shrink-0" title="Private" />}
        <div className="flex-1" />
        {/* Actions */}
        <button onClick={handlePin} className="p-1 rounded-lg text-zinc-300 hover:text-[#c9a84c] hover:bg-amber-50 transition">
          {note.is_pinned ? <PinOff size={12} /> : <Pin size={12} />}
        </button>
        <button onClick={() => { setEditing(!editing); setEditBody(note.body); }} className="p-1 rounded-lg text-zinc-300 hover:text-zinc-600 hover:bg-zinc-50 transition">
          <Pencil size={12} />
        </button>
        {canDelete && (
          <button onClick={handleDelete} className="p-1 rounded-lg text-zinc-300 hover:text-rose-500 hover:bg-rose-50 transition">
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Body */}
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={3}
            className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0f1f38] focus:ring-2 focus:ring-[#0f1f38]/10 resize-none transition"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit} disabled={saving}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] font-medium bg-[#0f1f38] text-white hover:bg-[#1a3050] transition disabled:opacity-50"
            >
              <Check size={11} /> {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] text-zinc-500 hover:bg-zinc-100 transition"
            >
              <X size={11} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{note.body}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-zinc-50">
        <span className="text-[10px] text-zinc-400">
          {note.staff_name ?? "Staff"}
        </span>
        <span className="text-[10px] text-zinc-300">{note.created_at}</span>
      </div>
    </div>
  );
}

// ─── Add Note Form ────────────────────────────────────────────────────────────
function AddNoteForm({
  bookingId, onClose, onSaved,
}: { bookingId: string | number; onClose: () => void; onSaved: () => void }) {
  const [body,       setBody]       = useState("");
  const [noteType,   setNoteType]   = useState("GENERAL");
  const [priority,   setPriority]   = useState("NORMAL");
  const [isPinned,   setIsPinned]   = useState(false);
  const [isPrivate,  setIsPrivate]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  async function handleSave() {
    if (!body.trim()) { setError("Note body is required"); return; }
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, note_type: noteType, priority, is_pinned: isPinned, is_private: isPrivate }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }
      onSaved();
    } finally { setSaving(false); }
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-4 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {(Object.keys(TYPE_LABELS) as string[]).map((t) => (
          <button
            key={t} onClick={() => setNoteType(t)}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition ${
              noteType === t ? TYPE_COLORS[t] + " ring-1 ring-inset ring-current" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            }`}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-lg">
          <AlertTriangle size={13} /> {error}
        </div>
      )}

      <textarea
        value={body} onChange={(e) => setBody(e.target.value)} rows={3}
        placeholder="Write your note here…"
        className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0f1f38] focus:ring-2 focus:ring-[#0f1f38]/10 resize-none transition"
      />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1">
          {(["LOW","NORMAL","HIGH","URGENT"] as const).map((p) => {
            const cfg = PRIORITY_CONFIG[p];
            return (
              <button
                key={p} onClick={() => setPriority(p)}
                className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition border ${
                  priority === p ? "border-zinc-300 bg-zinc-100 text-zinc-700" : "border-transparent text-zinc-400 hover:bg-zinc-50"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-1.5 text-[11px] text-zinc-500 cursor-pointer">
          <input type="checkbox" checked={isPinned}   onChange={(e) => setIsPinned(e.target.checked)}  className="accent-[#c9a84c]" />
          Pin
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-zinc-500 cursor-pointer">
          <input type="checkbox" checked={isPrivate}  onChange={(e) => setIsPrivate(e.target.checked)} className="accent-[#0f1f38]" />
          Private
        </label>

        <div className="ml-auto flex gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded-xl text-[12px] text-zinc-500 hover:bg-zinc-50 transition">
            Cancel
          </button>
          <button
            onClick={handleSave} disabled={saving}
            className="px-4 py-1.5 rounded-xl text-[12px] font-medium bg-[#0f1f38] text-white hover:bg-[#1a3050] transition disabled:opacity-50"
          >
            {saving ? "Saving…" : "Add Note"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NotesPanel({ bookingId, notes, canDelete = false, onRefresh }: Props) {
  const [showForm,    setShowForm]    = useState(false);
  const [filterType,  setFilterType]  = useState("ALL");

  const filtered = filterType === "ALL"
    ? notes
    : notes.filter((n) => n.note_type === filterType);

  const pinned   = filtered.filter((n) =>  n.is_pinned);
  const unpinned = filtered.filter((n) => !n.is_pinned);

  const handleRefresh = useCallback(() => { onRefresh(); }, [onRefresh]);

  return (
    <div className="space-y-4">
      {/* Header / Filters */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterType("ALL")}
            className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl transition ${
              filterType === "ALL" ? "bg-[#0f1f38] text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            }`}
          >
            All <span className="ml-1 opacity-70">{notes.length}</span>
          </button>
          {(Object.keys(TYPE_LABELS) as string[]).map((t) => {
            const count = notes.filter((n) => n.note_type === t).length;
            if (count === 0) return null;
            return (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl transition ${
                  filterType === t
                    ? TYPE_COLORS[t] + " ring-1 ring-inset ring-current"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                }`}
              >
                {TYPE_LABELS[t]} {count}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium bg-[#0f1f38] text-white hover:bg-[#1a3050] transition"
        >
          <Plus size={12} /> Add Note
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <AddNoteForm
          bookingId={bookingId}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); handleRefresh(); }}
        />
      )}

      {/* Pinned */}
      {pinned.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Pin size={10} /> Pinned
          </p>
          {pinned.map((n) => (
            <NoteCard key={n.id} note={n} bookingId={bookingId} canDelete={canDelete} onRefresh={handleRefresh} />
          ))}
        </div>
      )}

      {/* Rest */}
      {unpinned.length > 0 && (
        <div className="space-y-2">
          {pinned.length > 0 && (
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <StickyNote size={10} /> Notes
            </p>
          )}
          {unpinned.map((n) => (
            <NoteCard key={n.id} note={n} bookingId={bookingId} canDelete={canDelete} onRefresh={handleRefresh} />
          ))}
        </div>
      )}

      {/* Empty */}
      {filtered.length === 0 && !showForm && (
        <div className="py-12 text-center text-zinc-300">
          <StickyNote size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No notes yet</p>
        </div>
      )}
    </div>
  );
}
