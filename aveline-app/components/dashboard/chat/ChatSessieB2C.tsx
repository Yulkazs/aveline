"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, X, Bot, Star, Paperclip } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Message = {
  id: string;
  senderType: "user" | "agent" | "bot";
  senderId: string | null;
  content: string;
  createdAt: string;
};

type Session = {
  id: string;
  isActive: boolean;
  assignedAgent: string | null;
};

export type Props = {
  sessionId: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.senderType === "user";
  const isBot = msg.senderType === "bot";

  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-1"
          style={{ background: isBot ? "#EFF5EE" : "#BDD2B7" }}
        >
          {isBot ? (
            <Bot size={14} color="#304C3A" />
          ) : (
            <span className="text-[10px] font-bold" style={{ color: "#304C3A" }}>
              CS
            </span>
          )}
        </div>
      )}

      <div className={`max-w-[75%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        {!isUser && (
          <span className="text-[10px] mb-1 px-1" style={{ color: "#9aada2" }}>
            {isBot ? "Avéline Bot" : "Medewerker"}
          </span>
        )}
        <div
          className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
          style={
            isUser
              ? { background: "#304C3A", color: "#ffffff", borderBottomRightRadius: 6 }
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

// ── Rating modal ──────────────────────────────────────────────────────────────
function RatingModal({
  sessionId,
  onClose,
}: {
  sessionId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    await fetch(`/api/chat/sessions/${sessionId}/messages`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    }).catch(() => {});
    router.push("/dashboard/chat");
  }

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
        <h2
          className="font-display text-xl font-semibold text-center mb-1"
          style={{ color: "#122A1A" }}
        >
          Hoe was je ervaring?
        </h2>
        <p className="text-sm text-center mb-6" style={{ color: "#7a8f82" }}>
          Help ons de klantenservice te verbeteren
        </p>
        <div className="flex justify-center gap-3 mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(s)}
            >
              <Star
                size={36}
                strokeWidth={1.5}
                color="#CA8A04"
                fill={(hover || rating) >= s ? "#CA8A04" : "none"}
              />
            </button>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className="btn-primary mb-3"
          style={{ opacity: rating === 0 ? 0.5 : 1 }}
        >
          {submitting ? "Versturen…" : "Beoordeling versturen"}
        </button>
        <button onClick={onClose} className="btn-secondary">
          Overslaan
        </button>
      </div>
    </div>
  );
}

// ── Quick replies ─────────────────────────────────────────────────────────────
const QUICK_REPLIES = [
  "Waar is mijn bestelling?",
  "Ik wil een klacht indienen",
  "Productinformatie opvragen",
  "Retourneren",
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ChatSessieB2C({ sessionId }: Props) {
  const router = useRouter();
  // Store confirmed messages from DB (no temp/optimistic)
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const [loading, setLoading] = useState(true);

  const listRef = useRef<HTMLDivElement>(null);
  const lastTimestampRef = useRef<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

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
          // Only add messages we haven't seen yet — filter by id to be safe
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = data.messages.filter((m: Message) => !existingIds.has(m.id));
            return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
          });
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
    setShowQuick(false);
    setSending(true);

    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const data = await res.json();
        // Add confirmed message directly — poll will skip it via id filter
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          if (existingIds.has(data.message.id)) return prev;
          return [...prev, data.message];
        });
        if (data.message.createdAt) {
          lastTimestampRef.current = data.message.createdAt;
        }
      }
    } finally {
      setSending(false);
    }
  }

  async function handleEnd() {
    await fetch(`/api/chat/sessions/${sessionId}/messages`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setSession((s) => (s ? { ...s, isActive: false } : s));
    setShowRating(true);
  }

  const ended = session ? !session.isActive : false;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-5 pt-14 pb-4 border-b"
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

        <div className="flex-1">
          <h1 className="font-display text-lg font-semibold" style={{ color: "#122A1A" }}>
            Klantenservice
          </h1>
          <p className="text-xs" style={{ color: ended ? "#DC2626" : "#51C675" }}>
            {ended
              ? "Gesprek beëindigd"
              : session?.assignedAgent
              ? "Verbonden met medewerker"
              : "Wacht op medewerker…"}
          </p>
        </div>

        {!ended && (
          <button
            onClick={handleEnd}
            className="text-xs font-medium px-3 py-1.5 rounded-full border"
            style={{ color: "#DC2626", borderColor: "#FECACA" }}
          >
            Beëindigen
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm" style={{ color: "#9aada2" }}>Laden…</p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
        )}
      </div>

      {/* Quick replies — only show before user sends first message */}
      {showQuick && !ended && !loading && messages.filter((m) => m.senderType === "user").length === 0 && (
        <div
          className="flex-shrink-0 px-4 pb-2 flex gap-2 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="flex-shrink-0 text-xs font-medium px-3 py-2 rounded-full border"
              style={{ borderColor: "#c8d9c2", color: "#304C3A", background: "#ffffff" }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-t"
        style={{
          borderColor: "#f0f0f0",
          paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
          background: ended ? "#f9f9f9" : "#ffffff",
        }}
      >
        {!ended && (
          <button
            className="p-2 rounded-full flex-shrink-0"
            style={{ color: "#BDD2B7" }}
            aria-label="Bijlage"
          >
            <Paperclip size={18} strokeWidth={1.75} />
          </button>
        )}

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
            placeholder={ended ? "Gesprek beëindigd" : "Typ een bericht…"}
            disabled={ended || sending}
            className="input-field py-2.5 pr-10 text-sm"
            style={{ background: ended ? "#f5f5f5" : undefined }}
          />
          {input && (
            <button
              onClick={() => setInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X size={14} color="#BDD2B7" />
            </button>
          )}
        </div>

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || sending || ended}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: input.trim() && !ended ? "#304C3A" : "#E8EDE9" }}
          aria-label="Verzenden"
        >
          <Send
            size={16}
            color={input.trim() && !ended ? "#ffffff" : "#BDD2B7"}
            strokeWidth={2}
          />
        </button>
      </div>

      {showRating && (
        <RatingModal
          sessionId={sessionId}
          onClose={() => {
            setShowRating(false);
            router.push("/dashboard/chat");
          }}
        />
      )}
    </div>
  );
}