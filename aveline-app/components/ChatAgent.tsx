// DIT IS VOOR MARKETING, ADMIN MEDEWERKERS EN KLANTENSERVICE. B2C EN B2B KLANTEN HEBBEN GEEN TOEGANG TOT DEZE PAGINA, DUS HUN DASHBOARD VERSIES HEBBEN GEEN LINK NAAR DEZE COMPONENT.
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Send, X, User, Clock,
  CheckCircle2, AlertCircle, Star, StickyNote,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type SenderType = "user" | "agent" | "bot";

type Message = {
  id: string;
  senderType: SenderType;
  content: string;
  createdAt: Date;
};

type CustomerInfo = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
  points: number;
  _count: { scans: number; communityPosts: number; complaints: number };
};

type SessionInfo = {
  id: string;
  isActive: boolean;
  rating: number | null;
  createdAt: Date;
  customer: CustomerInfo;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(date: Date) {
  return date.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}

// ── Message bubble (agent view) ───────────────────────────────────────────────
function AgentMessageBubble({ msg }: { msg: Message }) {
  const isAgent = msg.senderType === "agent";
  const isBot   = msg.senderType === "bot";

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
function CustomerCard({ customer, session }: { customer: CustomerInfo; session: SessionInfo }) {
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email.split("@")[0];

  return (
    <div className="flex flex-col gap-3">
      {/* Identity */}
      <div
        className="flex items-center gap-3 p-4 rounded-2xl"
        style={{ background: "#EFF5EE" }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold"
          style={{ background: "#BDD2B7", color: "#304C3A" }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>{name}</p>
          <p className="text-xs truncate" style={{ color: "#7a8f82" }}>{customer.email}</p>
          <p className="text-[10px] mt-0.5 font-medium" style={{ color: "#51C675" }}>
            {customer.points} punten
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Scans",     value: customer._count.scans         },
          { label: "Posts",     value: customer._count.communityPosts },
          { label: "Klachten",  value: customer._count.complaints     },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center py-2.5 rounded-xl"
            style={{ background: "#f5f8f5" }}
          >
            <span className="text-base font-semibold font-display" style={{ color: "#304C3A" }}>{value}</span>
            <span className="text-[10px]" style={{ color: "#9aada2" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Session info */}
      <div className="flex flex-col gap-1.5">
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
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={10} color="#CA8A04" fill={s <= session.rating! ? "#CA8A04" : "none"} strokeWidth={1.5} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Canned replies ────────────────────────────────────────────────────────────
const CANNED = [
  "Goedendag! Ik ga dit voor je uitzoeken.",
  "Bedankt voor uw geduld.",
  "Ik heb uw klacht geregistreerd met referentienummer #—.",
  "Is er nog iets anders waarmee ik u kan helpen?",
];

// ── Main component ────────────────────────────────────────────────────────────
export default function ChatAgent({ session: initialSession }: { session: SessionInfo }) {
  const router = useRouter();
  const [session]      = useState(initialSession);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [sending, setSending]   = useState(false);
  const [ended, setEnded]       = useState(!session.isActive);
  const [tab, setTab]           = useState<"chat" | "klant" | "notities">("chat");
  const [note, setNote]         = useState("");
  const [notes, setNotes]       = useState<string[]>([]);
  const [showCanned, setShowCanned] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, tab]);

  function addMessage(msg: Omit<Message, "id" | "createdAt">) {
    setMessages((prev) => [...prev, { ...msg, id: crypto.randomUUID(), createdAt: new Date() }]);
  }

  async function handleSend(text?: string) {
    const content = (text ?? input).trim();
    if (!content || sending || ended) return;

    setInput("");
    setShowCanned(false);
    setSending(true);
    addMessage({ senderType: "agent", content });

    // In production: POST /api/chat/sessions/${session.id}/messages
    await new Promise((r) => setTimeout(r, 300));
    setSending(false);
  }

  function handleClose() {
    setEnded(true);
    // In production: POST /api/chat/sessions/${session.id}/close
  }

  function addNote() {
    if (!note.trim()) return;
    setNotes((n) => [...n, note.trim()]);
    setNote("");
    // In production: POST /api/crm/notes { userId: session.customer.id, content: note }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Header ─────────────────────────────────────────────────── */}
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
            {[session.customer.firstName, session.customer.lastName].filter(Boolean).join(" ") ||
              session.customer.email}
          </h1>
          <div className="flex items-center gap-1.5">
            {ended ? (
              <CheckCircle2 size={11} color="#16A34A" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#51C675" }} />
            )}
            <span className="text-[10px]" style={{ color: ended ? "#16A34A" : "#51C675" }}>
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
        {ended && (
          <AlertCircle size={18} color="#9aada2" />
        )}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex border-b gap-4 px-4"
        style={{ borderColor: "#f0f0f0" }}
      >
        {([
          { key: "chat",    label: "Chat",    icon: null          },
          { key: "klant",   label: "Klant",   icon: User          },
          { key: "notities",label: "Notities",icon: StickyNote    },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="pb-3 text-xs font-medium flex items-center gap-1.5 relative transition-colors"
            style={{ color: tab === key ? "#304C3A" : "#9aada2" }}
          >
            {Icon && <Icon size={13} strokeWidth={1.75} />}
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

      {/* ── Tab: Chat ──────────────────────────────────────────────── */}
      {tab === "chat" && (
        <>
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4"
          >
            {messages.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: "#BDD2B7" }}>
                Begin van het gesprek
              </p>
            )}
            {messages.map((msg) => (
              <AgentMessageBubble key={msg.id} msg={msg} />
            ))}
            {sending && (
              <div className="flex justify-end">
                <div className="px-4 py-2.5 rounded-2xl text-xs" style={{ background: "#EFF5EE", color: "#7a8f82" }}>
                  Verzenden…
                </div>
              </div>
            )}
          </div>

          {/* Canned replies */}
          {showCanned && (
            <div
              className="flex-shrink-0 border-t px-4 py-3 flex flex-col gap-1.5"
              style={{ borderColor: "#f0f0f0", background: "#fafafa" }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: "#9aada2" }}>
                Snelle antwoorden
              </p>
              {CANNED.map((c) => (
                <button
                  key={c}
                  onClick={() => { setInput(c); setShowCanned(false); }}
                  className="text-left text-xs px-3 py-2 rounded-xl transition-colors"
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
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
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
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
              style={{ background: input.trim() && !ended ? "#304C3A" : "#E8EDE9" }}
              aria-label="Verzenden"
            >
              <Send size={15} color={input.trim() && !ended ? "#ffffff" : "#BDD2B7"} strokeWidth={2} />
            </button>
          </div>
        </>
      )}

      {/* ── Tab: Klant ─────────────────────────────────────────────── */}
      {tab === "klant" && (
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <CustomerCard customer={session.customer} session={session} />
        </div>
      )}

      {/* ── Tab: Notities ──────────────────────────────────────────── */}
      {tab === "notities" && (
        <div className="flex-1 overflow-y-auto flex flex-col px-4 py-5 gap-4">
          {/* Add note */}
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
                Nog geen interne notities voor dit gesprek.
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