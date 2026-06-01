// DIT IS VOOR KLANTEN DIE CONTACT WILLEN OPNEMEN MET DE KLANTENSERVICE. B2B KLANTEN HEBBEN GEEN TOEGANG TOT DEZE PAGINA, ZIJN CHAT SESSIES WORDEN BEHEERD DOOR HUN ACCOUNT MANAGER, DIE TOEGANG HEEFT TOT HET CHATAGENT DASHBOARD.
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Paperclip, X, Bot, Star } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type SenderType = "user" | "agent" | "bot";

type Message = {
  id: string;
  senderType: SenderType;
  content: string;
  createdAt: Date;
};

type ChatSession = {
  id: string;
  isActive: boolean;
  assignedAgent: string | null;
};

// ── Time formatter ────────────────────────────────────────────────────────────
function formatTime(date: Date) {
  return date.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.senderType === "user";
  const isBot  = msg.senderType === "bot";

  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {/* Avatar for bot/agent */}
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
        {/* Sender label */}
        {!isUser && (
          <span className="text-[10px] mb-1 px-1" style={{ color: "#9aada2" }}>
            {isBot ? "Avéline Bot" : "Medewerker"}
          </span>
        )}

        {/* Bubble */}
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

        {/* Timestamp */}
        <span className="text-[10px] mt-1 px-1" style={{ color: "#BDD2B7" }}>
          {formatTime(msg.createdAt)}
        </span>
      </div>
    </div>
  );
}

// ── Rating modal ──────────────────────────────────────────────────────────────
function RatingModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (rating: number) => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover]   = useState(0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(18,42,26,0.4)" }}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl p-6 pb-10"
        style={{ background: "#ffffff" }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: "#e4e4e4" }} />
        <h2 className="font-display text-xl font-semibold text-center mb-1" style={{ color: "#122A1A" }}>
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
                className="transition-all duration-150"
              />
            </button>
          ))}
        </div>
        <button
          onClick={() => rating > 0 && onSubmit(rating)}
          disabled={rating === 0}
          className="btn-primary mb-3"
          style={{ opacity: rating === 0 ? 0.5 : 1 }}
        >
          Beoordeling versturen
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
  "Product informatie opvragen",
  "Retourneren",
];

// ── Main component ────────────────────────────────────────────────────────────
export default function ChatClient({ session: initialSession }: { session: ChatSession }) {
  const router  = useRouter();
  const [session]          = useState(initialSession);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      senderType: "bot",
      content: "Hallo! Ik ben de Avéline assistent. Waarmee kan ik je helpen vandaag?",
      createdAt: new Date(),
    },
  ]);
  const [input, setInput]         = useState("");
  const [sending, setSending]     = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [ended, setEnded]         = useState(!session.isActive);
  const [showQuick, setShowQuick] = useState(true);

  const listRef    = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function addMessage(msg: Omit<Message, "id" | "createdAt">) {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: crypto.randomUUID(), createdAt: new Date() },
    ]);
  }

  async function handleSend(text?: string) {
    const content = (text ?? input).trim();
    if (!content || sending || ended) return;

    setInput("");
    setShowQuick(false);
    setSending(true);
    addMessage({ senderType: "user", content });

    try {
      // In production: POST /api/chat/sessions/${session.id}/messages
      // Here we simulate a bot echo response
      await new Promise((r) => setTimeout(r, 900));
      addMessage({
        senderType: "bot",
        content: "Bedankt voor je bericht. Een van onze medewerkers neemt zo snel mogelijk contact met je op.",
      });
    } finally {
      setSending(false);
    }
  }

  function handleEnd() {
    setEnded(true);
    setShowRating(true);
    // In production: POST /api/chat/sessions/${session.id}/close
  }

  function handleRating(rating: number) {
    setShowRating(false);
    // In production: PATCH /api/chat/sessions/${session.id} { rating }
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Header ─────────────────────────────────────────────────── */}
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
              : session.assignedAgent
              ? "Verbonden met medewerker"
              : "Automatisch antwoord"}
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

      {/* ── Messages ───────────────────────────────────────────────── */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {sending && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#EFF5EE" }}>
              <Bot size={14} color="#304C3A" />
            </div>
            <div className="flex gap-1 px-4 py-3 rounded-2xl" style={{ background: "#f5f8f5" }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "#BDD2B7",
                    animation: `bounce 1.2s infinite`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Quick replies ───────────────────────────────────────────── */}
      {showQuick && !ended && (
        <div className="flex-shrink-0 px-4 pb-2 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="flex-shrink-0 text-xs font-medium px-3 py-2 rounded-full border transition-colors"
              style={{ borderColor: "#c8d9c2", color: "#304C3A", background: "#ffffff" }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* ── Input bar ──────────────────────────────────────────────── */}
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
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={ended ? "Gesprek beëindigd" : "Typ een bericht…"}
            disabled={ended}
            className="input-field py-2.5 pr-10 text-sm"
            style={{ background: ended ? "#f5f5f5" : undefined }}
          />
          {input && (
            <button
              onClick={() => setInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              aria-label="Wissen"
            >
              <X size={14} color="#BDD2B7" />
            </button>
          )}
        </div>

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || sending || ended}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: input.trim() && !ended ? "#304C3A" : "#E8EDE9",
          }}
          aria-label="Verzenden"
        >
          <Send
            size={16}
            color={input.trim() && !ended ? "#ffffff" : "#BDD2B7"}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Bounce animation */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>

      {/* Rating modal */}
      {showRating && (
        <RatingModal
          onClose={() => setShowRating(false)}
          onSubmit={handleRating}
        />
      )}
    </div>
  );
}