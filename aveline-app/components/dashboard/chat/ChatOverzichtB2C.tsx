"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle, Plus, ChevronRight, Clock,
  CheckCircle2, Circle, Bot,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type ChatMessage = {
  id: string;
  senderType: string;
  content: string;
  createdAt: string;
};

type ChatSession = {
  id: string;
  isActive: boolean;
  rating: number | null;
  createdAt: string;
  closedAt: string | null;
  assignedAgent: string | null;
  messages: ChatMessage[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return "Zojuist";
  if (s < 3600) return `${Math.floor(s / 60)} min geleden`;
  if (s < 86400) return `${Math.floor(s / 3600)} uur geleden`;
  return new Date(dateStr).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

// ── Session card ──────────────────────────────────────────────────────────────
function SessionCard({
  session,
  onClick,
}: {
  session: ChatSession;
  onClick: () => void;
}) {
  const lastMessage = session.messages[0];
  const isActive = session.isActive;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-5 py-4 transition-colors active:scale-[0.99]"
      style={{ borderBottom: "1px solid #f0f0f0", background: "#ffffff" }}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: isActive ? "#EFF5EE" : "#f5f5f5" }}
      >
        <MessageCircle
          size={20}
          color={isActive ? "#304C3A" : "#BDD2B7"}
          strokeWidth={1.75}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-sm font-semibold" style={{ color: "#122A1A" }}>
            {isActive ? "Actief gesprek" : "Afgesloten gesprek"}
          </span>
          <span className="text-[10px] flex-shrink-0" style={{ color: "#9aada2" }}>
            {timeAgo(session.createdAt)}
          </span>
        </div>

        {/* Status pill */}
        <div className="flex items-center gap-1.5 mb-1">
          {isActive ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#51C675" }} />
              <span className="text-[10px] font-medium" style={{ color: "#51C675" }}>
                {session.assignedAgent ? "Verbonden met medewerker" : "Wacht op medewerker"}
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 size={11} color="#9aada2" />
              <span className="text-[10px]" style={{ color: "#9aada2" }}>Afgesloten</span>
            </>
          )}
        </div>

        {/* Preview */}
        {lastMessage && (
          <p className="text-xs truncate" style={{ color: "#7a8f82" }}>
            {lastMessage.senderType === "agent"
              ? "Medewerker: "
              : lastMessage.senderType === "bot"
              ? "Bot: "
              : "Jij: "}
            {lastMessage.content}
          </p>
        )}
      </div>

      <ChevronRight size={14} color="#BDD2B7" className="flex-shrink-0 mt-1" />
    </button>
  );
}

// ── Start chat modal ──────────────────────────────────────────────────────────
function StartChatModal({
  onClose,
  onStart,
  loading,
}: {
  onClose: () => void;
  onStart: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(18,42,26,0.4)" }}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl p-6 pb-10 animate-fade-slide-up"
        style={{ background: "#ffffff" }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: "#e4e4e4" }} />

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "#EFF5EE" }}
          >
            <MessageCircle size={28} color="#304C3A" strokeWidth={1.5} />
          </div>
        </div>

        <h2
          className="font-display text-xl font-semibold text-center mb-2"
          style={{ color: "#122A1A" }}
        >
          Chat starten
        </h2>
        <p className="text-sm text-center mb-6" style={{ color: "#7a8f82" }}>
          Je wordt verbonden met een klantenservicemedewerker. Gemiddelde wachttijd is minder dan 5 minuten.
        </p>

        {/* What to expect */}
        <div
          className="rounded-2xl p-4 mb-6 flex flex-col gap-3"
          style={{ background: "#f5f8f5" }}
        >
          {[
            { icon: Bot, text: "Een bot beantwoordt je bericht direct" },
            { icon: MessageCircle, text: "Een medewerker neemt het gesprek zo snel mogelijk over" },
            { icon: Clock, text: "Beschikbaar op werkdagen van 09:00–17:00" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#EFF5EE" }}
              >
                <Icon size={13} color="#304C3A" strokeWidth={1.75} />
              </div>
              <span className="text-xs" style={{ color: "#5a6e62" }}>{text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          disabled={loading}
          className="btn-primary mb-3"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Chat starten…" : "Chat starten"}
        </button>
        <button onClick={onClose} className="btn-secondary">
          Annuleren
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ChatOverzichtB2C() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetch("/api/chat/sessions")
      .then((r) => (r.ok ? r.json() : []))
      .then(setSessions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleStartChat() {
    setStarting(true);
    try {
      const res = await fetch("/api/chat/sessions", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        router.push(`/dashboard/chat/${data.sessionId}`);
      }
    } catch {
      // silent
    } finally {
      setStarting(false);
    }
  }

  const activeSessions = sessions.filter((s) => s.isActive);
  const closedSessions = sessions.filter((s) => !s.isActive);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 pt-14 pb-5"
        style={{ borderBottom: "1px solid #f0f0f0" }}
      >
        <div>
          <h1 className="font-display text-2xl font-semibold" style={{ color: "#122A1A" }}>
            Chats
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "#9aada2" }}>
            Neem contact op met onze klantenservice
          </p>
        </div>

        {/* + button */}
        <button
          onClick={() => setShowModal(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "#304C3A" }}
          aria-label="Nieuwe chat starten"
        >
          <Plus size={20} color="#ffffff" strokeWidth={2.5} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm" style={{ color: "#9aada2" }}>Laden…</p>
          </div>
        ) : sessions.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-5">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background: "#EFF5EE" }}
            >
              <MessageCircle size={32} color="#BDD2B7" strokeWidth={1.25} />
            </div>
            <div>
              <p className="text-base font-semibold mb-1" style={{ color: "#304C3A" }}>
                Nog geen chats
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "#9aada2" }}>
                Heb je een vraag of probleem? Tik op de{" "}
                <strong style={{ color: "#304C3A" }}>+</strong> knop om een gesprek te starten met
                onze klantenservice.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
              style={{ maxWidth: 220 }}
            >
              Chat starten
            </button>
          </div>
        ) : (
          <>
            {/* Active sessions */}
            {activeSessions.length > 0 && (
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest px-5 pt-5 pb-2"
                  style={{ color: "#9aada2" }}
                >
                  Actief
                </p>
                {activeSessions.map((s) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    onClick={() => router.push(`/dashboard/chat/${s.id}`)}
                  />
                ))}
              </div>
            )}

            {/* Closed sessions */}
            {closedSessions.length > 0 && (
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest px-5 pt-5 pb-2"
                  style={{ color: "#9aada2" }}
                >
                  Afgesloten
                </p>
                {closedSessions.map((s) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    onClick={() => router.push(`/dashboard/chat/${s.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <StartChatModal
          onClose={() => setShowModal(false)}
          onStart={handleStartChat}
          loading={starting}
        />
      )}
    </div>
  );
}