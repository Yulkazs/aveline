"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Play, Square, Plus, Copy, Check, Users,
  Wifi, Trash2, ChevronDown, ChevronUp, QrCode, X, LogOut,
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

function getJoinUrl(code: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/presentatie/${code}`;
  }
  return `/presentatie/${code}`;
}

// ── QR Code Modal ─────────────────────────────────────────────────────────────
function QRModal({ code, onClose }: { code: string; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const joinUrl = getJoinUrl(code);

  // Draw QR code using a simple canvas-based QR generator (pure JS, no library)
  // We use the qrcode.js approach via a script injection
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Draw a styled placeholder with the URL encoded visually
    // Since we can't import qrcode library in this env, we'll use a QR API
    const img = new Image();
    img.crossOrigin = "anonymous";
    // Use a public QR code API
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(joinUrl)}&bgcolor=EFF5EE&color=122A1A&margin=10&format=png`;
    img.onload = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.onerror = () => {
      // Fallback: draw a styled placeholder
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#EFF5EE";
      ctx.fillRect(0, 0, 240, 240);
      ctx.fillStyle = "#304C3A";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "center";
      ctx.fillText("QR niet beschikbaar", 120, 120);
      ctx.font = "11px monospace";
      ctx.fillText("Gebruik de link hieronder", 120, 140);
    };
  }, [joinUrl]);

  const [copied, setCopied] = useState(false);

  async function handleCopyUrl() {
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `aveline-sessie-${code}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(18,42,26,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl overflow-hidden animate-fade-slide-up"
        style={{ background: "#ffffff" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pt-5 pb-4 border-b"
          style={{ borderColor: "#f0f0f0" }}
        >
          <div>
            <h2 className="font-display text-xl font-semibold" style={{ color: "#122A1A" }}>
              QR Code
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#9aada2" }}>
              Sessie <span className="font-mono font-bold">{code}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full"
            style={{ background: "#f5f8f5" }}
          >
            <X size={18} color="#304C3A" />
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center px-5 py-6">
          {/* Canvas with Avéline branding frame */}
          <div
            className="relative rounded-3xl p-4 mb-5"
            style={{
              background: "#EFF5EE",
              border: "2px solid #BDD2B7",
              boxShadow: "0 8px 32px rgba(48,76,58,0.12)",
            }}
          >
            {/* Logo top */}
            <div className="flex justify-center mb-3">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: "#304C3A" }}
              >
                <span className="text-base">🍫</span>
                <span
                  className="text-xs font-semibold tracking-wide"
                  style={{ color: "#ffffff" }}
                >
                  Avéline Demo
                </span>
              </div>
            </div>

            {/* QR Canvas */}
            <canvas
              ref={canvasRef}
              width={240}
              height={240}
              className="rounded-2xl"
              style={{ display: "block" }}
            />

            {/* Session code bottom */}
            <div className="flex justify-center mt-3">
              <span
                className="font-mono text-lg font-bold tracking-widest px-4 py-1.5 rounded-xl"
                style={{ background: "#304C3A", color: "#51C675" }}
              >
                {code}
              </span>
            </div>
          </div>

          {/* Instructions */}
          <p className="text-sm text-center mb-5" style={{ color: "#7a8f82" }}>
            Scan met je telefoon om deel te nemen aan de demo-presentatie.
          </p>

          {/* URL row */}
          <div
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4"
            style={{ background: "#f5f8f5", border: "1px dashed #BDD2B7" }}
          >
            <span className="text-xs flex-1 truncate font-mono" style={{ color: "#304C3A" }}>
              {joinUrl}
            </span>
            <button
              onClick={handleCopyUrl}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full flex-shrink-0 transition-all"
              style={{
                background: copied ? "#EFF5EE" : "#e8ede9",
                color: copied ? "#304C3A" : "#7a8f82",
              }}
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {copied ? "Gekopieerd!" : "Kopieer"}
            </button>
          </div>

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold mb-8"
            style={{ background: "#304C3A", color: "#ffffff", border: "none" }}
          >
            QR Code downloaden
          </button>
        </div>
      </div>
    </div>
  );
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
  const [showQR, setShowQR] = useState(false);
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
  const joinUrl = getJoinUrl(session.code);

  return (
    <>
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
              <span className="text-xs flex-1 truncate font-mono" style={{ color: "#304C3A" }}>
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

            {/* QR Code button */}
            {session.status !== "ENDED" && (
              <button
                onClick={() => setShowQR(true)}
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
                style={{ background: "#EFF5EE" }}
                aria-label="QR code tonen"
              >
                <QrCode size={16} color="#304C3A" />
              </button>
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

      {/* QR Modal */}
      {showQR && (
        <QRModal
          code={session.code}
          onClose={() => setShowQR(false)}
        />
      )}
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PresentatieBeheer({ initialSessions }: Props) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [creating, setCreating] = useState(false);
  const [newSessionCode, setNewSessionCode] = useState<string | null>(null);

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
      // Automatically show QR code for the new session
      setNewSessionCode(data.session.code);
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
    <>
      <div className="flex flex-col h-full bg-white overflow-y-auto">
        {/* Header */}
        <div
          className="flex-shrink-0 px-5 pt-14 pb-6 border-b"
          style={{ borderColor: "#f0f0f0" }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-semibold" style={{ color: "#122A1A" }}>
                Presentatie
              </h1>
              <p className="text-sm mt-1" style={{ color: "#7a8f82" }}>
                Beheer live demo-sessies
              </p>
            </div>

            <div className="flex items-center gap-2">
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
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95"
                style={{ background: "#FEF2F2", color: "#DC2626" }}
                aria-label="Uitloggen"
              >
                <LogOut size={14} strokeWidth={2} />
                {loggingOut ? "…" : "Uitloggen"}
              </button>
            </div>
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

      {/* Auto-show QR for newly created session */}
      {newSessionCode && (
        <QRModal
          code={newSessionCode}
          onClose={() => setNewSessionCode(null)}
        />
      )}

      <style>{`
        @keyframes dot-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </>
  );
}