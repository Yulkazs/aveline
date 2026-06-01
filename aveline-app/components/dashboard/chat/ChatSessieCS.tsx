"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Send, X, User, Clock,
  CheckCircle2, AlertCircle, Star, StickyNote,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Message = {
  id: string;
  senderType: "user" | "agent" | "bot";
  senderId: string | null;
  content: string;
  createdAt: string;
};

type CustomerInfo = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  points: number;
  _count: { scans: number; communityPosts: number; complaints: number };
};

type Session = {
  id: string;
  isActive: boolean;
  assignedAgent: string | null;
  rating: number | null;
  createdAt: string;
  user: CustomerInfo;
};

type Props = {
  sessionId: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function customerName(user: CustomerInfo) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email.split("@")[0];
}

// ── Message bubble ────────────────────────────────────────────────────────────
function AgentBubble({ msg }: { msg: Message }) {
  const isAgent = msg.senderType === "agent";
  const isBot = msg.senderType === "bot";

  return (
    <div className={`flex items-end gap-2 ${isAgent ? "justify-end" : "justify-start"}`}>
      {!isAgent && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-1 text-[10px] font-bold"
          style={{ background: isBot ? "#EFF5EE" : "#BDD2B7", color: "#304C3A" }}
        >
          {isBot ? "B" : "K"}
        </div>
      )}
      <div className={`max-w-[72%] flex flex-col ${isAgent ? "items-end" : "items-start"}`}>
        {!isAgent && (
          <span className="text-[10px] mb-1 px-1" style={{ color: "#9aada2" }}>
            {isBot ? "Bot" : "Klant"}
          </span>
        )}
        <div
          className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
          style={
            isAgent
              ? { background: "#304C3A", color: "#ffffff", borderBottomRightRadius: 6 }
              : isBot
              ? { background: "#EFF5EE", color: "#304C3A", borderBottomLeftRadius: 6 }
              : { background: "#f5f8f5", color: "#122A1A", borderBottomLeftRadius: 6 }
          }
        >
          {msg.content}
        </div>
        <span className="text-[10px] mt-1 px-1" style={{ color: "#BDD2B7" }}>
          {formatTime(msg.createdAt)}
        </span>
      </div>
    </div>
  );
}

// ── Customer sidebar card ─────────────────────────────────────────────────────
function CustomerCard({ user, session }: { user: CustomerInfo; session: Session }) {
  const name = customerName(user);
  return (
    <div className="flex flex-col gap-3 px-4 py-5">
      {/* Identity */}
      <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: "#EFF5EE" }}>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold"
          style={{ background: "#BDD2B7", color: "#304C3A" }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>
            {name}
          </p>
          <p className="text-xs truncate" style={{ color: "#7a8f82" }}>
            {user.email}
          </p>
          <p className="text-[10px] mt-0.5 font-medium" style={{ color: "#51C675" }}>
            {user.points} punten
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Scans",    value: user._count.scans           },
          { label: "Posts",    value: user._count.communityPosts  },
          { label: "Klachten", value: user._count.complaints      },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center py-2.5 rounded-xl"
            style={{ background: "#f5f8f5" }}
          >
            <span className="text-base font-semibold font-display" style={{ color: "#304C3A" }}>
              {value}
            </span>
            <span className="text-[10px]" style={{ color: "#9aada2" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Session info */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: "#f5f8f5" }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: "#7a8f82" }}>
          <Clock size={12} strokeWidth={1.75} />
          Gestart
        </div>
        <span className="text-xs font-medium" style={{ color: "#122A1A" }}>
          {formatTime(session.createdAt)}
        </span>
      </div>

      {session.rating && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: "#f5f8f5" }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: "#7a8f82" }}>
            <Star size={12} strokeWidth={1.75} />
            Beoordeling
          </div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={10}
                color="#CA8A04"
                fill={s <= session.rating! ? "#CA8A04" : "none"}
                strokeWidth={1.5}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Canned replies ────────────────────────────────────────────────────────────
const CANNED = [
  "Goedendag! Ik ga dit voor je uitzoeken.",
  "Bedankt voor uw geduld.",
  "Ik heb uw klacht geregistreerd.",
  "Is er nog iets anders waarmee ik u kan helpen?",
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ChatSessieCS({ sessionId }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"chat" | "klant" | "notities">("chat");
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const [showCanned, setShowCanned] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const lastTimestampRef = useRef<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, tab]);

  const fetchMessages = useCallback(
    async (initial = false) => {
      const url = `/api/chat/sessions/${sessionId}/messages${
        !initial && lastTimestampRef.current
          ? `?after=${encodeURIComponent(lastTimestampRef.current)}`
          : ""
      }`;

      const res = await fetch(url).catch(() => null);
      if (!res?.ok) return;
      const data = await res.json();

      if (initial) {
        setSession(data.session);
        setMessages(data.messages);
        if (data.messages.length > 0) {
          lastTimestampRef.current = data.messages[data.messages.length - 1].createdAt;
        }
        setLoading(false);
      } else {
        if (data.messages.length > 0) {
          setMessages((prev) => [...prev, ...data.messages]);
          lastTimestampRef.current = data.messages[data.messages.length - 1].createdAt;
        }
        setSession(data.session);
      }
    },
    [sessionId]
  );

  useEffect(() => {
    fetchMessages(true);
    pollingRef.current = setInterval(() => fetchMessages(false), 3000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchMessages]);

  async function handleSend(text?: string) {
    const content = (text ?? input).trim();
    if (!content || sending || !session?.isActive) return;

    setInput("");
    setShowCanned(false);
    setSending(true);

    // Optimistic update
    setMessages((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        senderType: "agent",
        senderId: null,
        content,
        createdAt: new Date().toISOString(),
      },
    ]);

    try {
      await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
    } finally {
      setSending(false);
    }
  }

  async function handleClose() {
    await fetch(`/api/chat/sessions/${sessionId}/messages`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setSession((s) => (s ? { ...s, isActive: false } : s));
  }

  function addNote() {
    if (!note.trim()) return;
    setNotes((n) => [...n, note.trim()]);
    setNote("");
  }

  const ended = session ? !session.isActive : false;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-4 pt-14 pb-3 border-b"
        style={{ borderColor: "#f0f0f0" }}
      >
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full -ml-1"
          style={{ background: "#f5f8f5" }}
          aria-label="Terug"
        >
          <ChevronLeft size={20} color="#304C3A" />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>
            {session ? customerName(session.user) : "Laden…"}
          </h1>
          <div className="flex items-center gap-1.5">
            {ended ? (
              <CheckCircle2 size={11} color="#16A34A" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#51C675" }} />
            )}
            <span
              className="text-[10px]"
              style={{ color: ended ? "#16A34A" : "#51C675" }}
            >
              {ended ? "Gesprek gesloten" : "Actief gesprek"}
            </span>
          </div>
        </div>

        {!ended && (
          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
            style={{ background: "#EFF5EE", color: "#304C3A" }}
          >
            <CheckCircle2 size={13} />
            Sluiten
          </button>
        )}
      </div>

      {/* Tabs */}
      <div
        className="flex-shrink-0 flex border-b gap-4 mt-6 px-4"
        style={{ borderColor: "#f0f0f0" }}
      >
        {(
          [
            { key: "chat",     label: "Chat"     },
            { key: "klant",    label: "Klant",   icon: User       },
            { key: "notities", label: "Notities", icon: StickyNote },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="pb-3 text-xs font-medium relative transition-colors"
            style={{ color: tab === key ? "#304C3A" : "#9aada2" }}
          >
            {label}
            {tab === key && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: "#51C675" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Chat ── */}
      {tab === "chat" && (
        <>
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4"
          >
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm" style={{ color: "#9aada2" }}>Laden…</p>
              </div>
            ) : messages.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: "#BDD2B7" }}>
                Begin van het gesprek
              </p>
            ) : (
              messages.map((msg) => <AgentBubble key={msg.id} msg={msg} />)
            )}
          </div>

          {/* Canned replies */}
          {showCanned && (
            <div
              className="flex-shrink-0 border-t px-4 py-3 flex flex-col gap-1.5"
              style={{ borderColor: "#f0f0f0", background: "#fafafa" }}
            >
              <p
                className="text-[10px] font-semibold uppercase tracking-wide mb-1"
                style={{ color: "#9aada2" }}
              >
                Snelle antwoorden
              </p>
              {CANNED.map((c) => (
                <button
                  key={c}
                  onClick={() => { setInput(c); setShowCanned(false); }}
                  className="text-left text-xs px-3 py-2 rounded-xl"
                  style={{ background: "#EFF5EE", color: "#304C3A" }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div
            className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-t"
            style={{
              borderColor: "#f0f0f0",
              paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
              background: ended ? "#f9f9f9" : "#ffffff",
            }}
          >
            <button
              onClick={() => setShowCanned((s) => !s)}
              className="p-2 rounded-full flex-shrink-0"
              style={{ background: showCanned ? "#EFF5EE" : "transparent", color: "#304C3A" }}
              aria-label="Snelle antwoorden"
            >
              <StickyNote size={17} strokeWidth={1.75} />
            </button>

            <div className="flex-1 relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={ended ? "Gesprek gesloten" : "Antwoord als medewerker…"}
                disabled={ended}
                className="input-field py-2.5 pr-8 text-sm"
                style={{ background: ended ? "#f5f5f5" : undefined }}
              />
              {input && (
                <button
                  onClick={() => setInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X size={13} color="#BDD2B7" />
                </button>
              )}
            </div>

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || sending || ended}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: input.trim() && !ended ? "#304C3A" : "#E8EDE9" }}
              aria-label="Verzenden"
            >
              <Send
                size={15}
                color={input.trim() && !ended ? "#ffffff" : "#BDD2B7"}
                strokeWidth={2}
              />
            </button>
          </div>
        </>
      )}

      {/* ── Tab: Klant ── */}
      {tab === "klant" && session && (
        <div className="flex-1 overflow-y-auto">
          <CustomerCard user={session.user} session={session} />
        </div>
      )}

      {/* ── Tab: Notities ── */}
      {tab === "notities" && (
        <div className="flex-1 overflow-y-auto flex flex-col px-4 py-5 gap-4">
          <div className="flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addNote(); }}
              placeholder="Interne notitie toevoegen…"
              className="input-field py-2.5 text-sm flex-1"
            />
            <button
              onClick={addNote}
              disabled={!note.trim()}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: note.trim() ? "#304C3A" : "#E8EDE9" }}
            >
              <Send size={15} color={note.trim() ? "#ffffff" : "#BDD2B7"} strokeWidth={2} />
            </button>
          </div>

          {notes.length === 0 ? (
            <div
              className="rounded-2xl p-6 flex flex-col items-center text-center"
              style={{ background: "#f5f8f5" }}
            >
              <StickyNote size={24} color="#BDD2B7" strokeWidth={1.5} className="mb-2" />
              <p className="text-sm" style={{ color: "#9aada2" }}>
                Nog geen interne notities.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {notes.map((n, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: "#FEF9C3" }}
                >
                  <StickyNote size={14} color="#CA8A04" strokeWidth={1.75} className="flex-shrink-0 mt-0.5" />
                  <p className="text-sm flex-1" style={{ color: "#92400E" }}>{n}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}