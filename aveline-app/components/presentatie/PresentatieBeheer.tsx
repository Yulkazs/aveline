"use client";

import { useState, useEffect, useRef } from "react";
import {
  Play, Square, Plus, Copy, Check, Users,
  Wifi, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type SessionStatus = "WAITING" | "ACTIVE" | "ENDED";

type Participant = {
  id: string;
  username: string;
  createdAt: string;
};

type Session = {
  id: string;
  code: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
};

type Props = { initialSessions: Session[] };

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_META: Record<SessionStatus, { label: string; color: string; bg: string; dot: string }> = {
  WAITING: { label: "Wachtkamer open", color: "#D97706", bg: "#FEF3C7", dot: "#F59E0B" },
  ACTIVE:  { label: "Actief",          color: "#16A34A", bg: "#F0FDF4", dot: "#22C55E" },
  ENDED:   { label: "Afgelopen",       color: "#9aada2", bg: "#f5f8f5", dot: "#BDD2B7" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("nl-NL", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("nl-NL", {
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all flex-shrink-0"
      style={{
        background: copied ? "#EFF5EE" : "#e8ede9",
        color: copied ? "#304C3A" : "#7a8f82",
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Gekopieerd!" : "Kopieer"}
    </button>
  );
}

// ── Session card ──────────────────────────────────────────────────────────────
function SessionCard({
  session: initial,
  onUpdate,
  onDelete,
}: {
  session: Session;
  onUpdate: (updated: Session) => void;
  onDelete: (id: string) => void;
}) {
  const [session, setSession] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll while WAITING or ACTIVE
  useEffect(() => {
    if (session.status === "ENDED") return;

    async function poll() {
      const res = await fetch(`/api/presentation/sessions/${session.code}`).catch(() => null);
      if (!res?.ok) return;
      const data = await res.json();
      setSession(data);
      onUpdate(data);
    }

    poll();
    pollingRef.current = setInterval(poll, 3000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [session.code, session.status, onUpdate]);

  async function updateStatus(newStatus: SessionStatus) {
    setLoading(true);
    const res = await fetch(`/api/presentation/sessions/${session.code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    }).catch(() => null);

    if (res?.ok) {
      const data = await res.json();
      setSession(data.session);
      onUpdate(data.session);
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm(`Sessie ${session.code} verwijderen?`)) return;
    await fetch(`/api/presentation/sessions/${session.code}`, { method: "DELETE" });
    onDelete(session.id);
  }

  const meta = STATUS_META[session.status];
  const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL}/presentatie/${session.code}`;

  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: "#e8ede9", background: "#ffffff" }}
    >
      {/* Card header */}
      <div className="p-5">
        {/* Code + status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <span
              className="font-mono text-2xl font-bold tracking-widest"
              style={{ color: "#122A1A" }}
            >
              {session.code}
            </span>
            <p className="text-xs mt-0.5" style={{ color: "#9aada2" }}>
              {formatDate(session.createdAt)}
            </p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0"
            style={{ background: meta.bg, color: meta.color }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                background: meta.dot,
                animation: session.status === "ACTIVE" ? "dot-pulse 1.5s infinite" : "none",
              }}
            />
            {meta.label}
          </span>
        </div>

        {/* Participant count */}
        <div
          className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl"
          style={{ background: "#f5f8f5" }}
        >
          <Users size={14} color="#304C3A" />
          <span className="text-sm font-medium" style={{ color: "#304C3A" }}>
            {session.participants.length} deelnemer{session.participants.length !== 1 ? "s" : ""}
          </span>
          {session.status !== "ENDED" && (
            <span className="ml-auto text-[10px] font-medium" style={{ color: "#BDD2B7" }}>
              live ●
            </span>
          )}
        </div>

        {/* Join link */}
        {session.status !== "ENDED" && (
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4"
            style={{ background: "#EFF5EE", border: "1px dashed #BDD2B7" }}
          >
            <span
              className="text-xs flex-1 truncate font-mono"
              style={{ color: "#304C3A" }}
            >
              {joinUrl}
            </span>
            <CopyButton text={joinUrl} />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {session.status === "WAITING" && (
            <button
              onClick={() => updateStatus("ACTIVE")}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all active:scale-95"
              style={{ background: loading ? "#BDD2B7" : "#304C3A" }}
            >
              <Play size={15} fill="white" />
              Presentatie starten
            </button>
          )}

          {session.status === "ACTIVE" && (
            <button
              onClick={() => updateStatus("ENDED")}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
              style={{
                background: "#FEF2F2",
                color: "#DC2626",
                border: "1.5px solid #FECACA",
              }}
            >
              <Square size={15} />
              Presentatie stoppen
            </button>
          )}

          {session.status === "ENDED" && (
            <div
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm"
              style={{ background: "#f5f8f5", color: "#9aada2" }}
            >
              Sessie afgelopen
            </div>
          )}

          {/* Expand participants */}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
            style={{ background: "#f5f8f5" }}
            aria-label="Deelnemers tonen"
          >
            {expanded
              ? <ChevronUp size={16} color="#304C3A" />
              : <ChevronDown size={16} color="#304C3A" />
            }
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
            style={{ background: "#FEF2F2" }}
            aria-label="Verwijderen"
          >
            <Trash2 size={15} color="#DC2626" />
          </button>
        </div>
      </div>

      {/* Participants list */}
      {expanded && (
        <div
          className="border-t px-5 py-4"
          style={{ borderColor: "#f0f0f0", background: "#fafafa" }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#9aada2" }}
          >
            Deelnemers
          </p>
          {session.participants.length === 0 ? (
            <p className="text-xs" style={{ color: "#9aada2" }}>
              Nog niemand ingelogd.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {session.participants.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: "#BDD2B7", color: "#304C3A" }}
                  >
                    {p.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm flex-1" style={{ color: "#122A1A" }}>
                    {p.username}
                  </span>
                  <span className="text-[10px]" style={{ color: "#9aada2" }}>
                    {formatTime(p.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes dot-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PresentatieBeheer({ initialSessions }: Props) {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [creating, setCreating] = useState(false);

  const hasActiveOrWaiting = sessions.some(
    (s) => s.status === "WAITING" || s.status === "ACTIVE"
  );

  async function handleCreate() {
    setCreating(true);
    const res = await fetch("/api/presentation/sessions", {
      method: "POST",
    }).catch(() => null);

    if (res?.ok) {
      const data = await res.json();
      setSessions((prev) => [data.session, ...prev]);
    }
    setCreating(false);
  }

  function handleUpdate(updated: Session) {
    setSessions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  }

  function handleDelete(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Header */}
      <div
        className="flex-shrink-0 px-5 pt-14 pb-6 border-b"
        style={{ borderColor: "#f0f0f0" }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1
              className="font-display text-3xl font-semibold"
              style={{ color: "#122A1A" }}
            >
              Presentatie
            </h1>
            <p className="text-sm mt-1" style={{ color: "#7a8f82" }}>
              Beheer live demo-sessies
            </p>
          </div>

          {sessions.some((s) => s.status === "ACTIVE") && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: "#F0FDF4" }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "#22C55E", animation: "dot-pulse 1.5s infinite" }}
              />
              <span className="text-xs font-semibold" style={{ color: "#16A34A" }}>
                Live
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-6">
        {/* New session button */}
        <button
          onClick={handleCreate}
          disabled={creating || hasActiveOrWaiting}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm mb-2 transition-all active:scale-95"
          style={{
            background: creating || hasActiveOrWaiting ? "#f5f8f5" : "#304C3A",
            color:      creating || hasActiveOrWaiting ? "#9aada2" : "#ffffff",
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
          {creating ? "Aanmaken…" : "Nieuwe sessie aanmaken"}
        </button>

        {hasActiveOrWaiting && (
          <p className="text-xs text-center mb-6" style={{ color: "#BDD2B7" }}>
            Sluit de huidige sessie voordat je een nieuwe aanmaakt.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-4">
          {sessions.length === 0 ? (
            <div
              className="rounded-2xl p-10 flex flex-col items-center text-center"
              style={{ background: "#f5f8f5" }}
            >
              <Wifi size={28} color="#BDD2B7" strokeWidth={1.25} className="mb-3" />
              <p className="text-sm font-semibold mb-1" style={{ color: "#304C3A" }}>
                Geen sessies
              </p>
              <p className="text-xs" style={{ color: "#9aada2" }}>
                Maak een nieuwe sessie aan om te beginnen.
              </p>
            </div>
          ) : (
            sessions.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}