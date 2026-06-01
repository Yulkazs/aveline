"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle, ChevronRight, User,
  CheckCircle2, RefreshCw,
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
  assignedAgent: string | null;
  rating: number | null;
  createdAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    points: number;
    _count: { scans: number; communityPosts: number; complaints: number };
  };
  messages: ChatMessage[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function customerName(user: ChatSession["user"]): string {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email.split("@")[0];
}

function timeAgo(dateStr: string): string {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return "Zojuist";
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} uur`;
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
  const lastMsg = session.messages[0];
  const name = customerName(session.user);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-5 py-4 active:scale-[0.99] transition-transform"
      style={{ borderBottom: "1px solid #f0f0f0" }}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold relative"
        style={{ background: "#BDD2B7", color: "#304C3A" }}
      >
        {name.charAt(0).toUpperCase()}
        {session.isActive && (
          <span
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
            style={{ background: "#51C675" }}
          />
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>
            {name}
          </span>
          <span className="text-[10px] flex-shrink-0" style={{ color: "#9aada2" }}>
            {timeAgo(session.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-1">
          {session.isActive ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#51C675" }} />
              <span className="text-[10px] font-medium" style={{ color: "#51C675" }}>
                {session.assignedAgent ? "Jouw gesprek" : "Wacht op medewerker"}
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 size={11} color="#9aada2" />
              <span className="text-[10px]" style={{ color: "#9aada2" }}>Afgesloten</span>
            </>
          )}
        </div>

        {lastMsg && (
          <p className="text-xs truncate" style={{ color: "#7a8f82" }}>
            {lastMsg.senderType === "agent" ? "Jij: " : "Klant: "}
            {lastMsg.content}
          </p>
        )}
      </div>

      <ChevronRight size={14} color="#BDD2B7" className="flex-shrink-0 mt-1" />
    </button>
  );
}

// ── Filter tabs ───────────────────────────────────────────────────────────────
const FILTERS = [
  { key: "waiting", label: "Wachtend" },
  { key: "active",  label: "Actief"   },
  { key: "closed",  label: "Gesloten" },
  { key: "all",     label: "Alles"    },
] as const;

type Filter = (typeof FILTERS)[number]["key"];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ChatOverzichtCS() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [filter, setFilter] = useState<Filter>("waiting");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function load() {
      fetch("/api/chat/sessions")
        .then((r) => (r.ok ? r.json() : []))
        .then(setSessions)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
    load();

    // Poll every 5 seconds to catch new incoming chats
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const waitingCount = sessions.filter(
    (s) => s.isActive && !s.assignedAgent
  ).length;

  const filtered = sessions.filter((s) => {
    if (filter === "waiting") return s.isActive && !s.assignedAgent;
    if (filter === "active")  return s.isActive && !!s.assignedAgent;
    if (filter === "closed")  return !s.isActive;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div
        className="flex-shrink-0 px-5 pt-14 pb-4"
        style={{ borderBottom: "1px solid #f0f0f0" }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="font-display text-2xl font-semibold" style={{ color: "#122A1A" }}>
              Live Chat
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "#9aada2" }}>
              Klantenservice gesprekken
            </p>
          </div>

          {/* Waiting badge */}
          {waitingCount > 0 && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: "#FEF3C7" }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#D97706" }} />
              <span className="text-xs font-semibold" style={{ color: "#D97706" }}>
                {waitingCount} wachtend
              </span>
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="flex-shrink-0 text-xs font-medium px-3.5 py-2 rounded-full transition-all"
              style={
                filter === key
                  ? { background: "#304C3A", color: "#ffffff" }
                  : { background: "#f5f8f5", color: "#7a8f82" }
              }
            >
              {label}
              {key === "waiting" && waitingCount > 0 && (
                <span
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px]"
                  style={{ background: "#D97706", color: "#ffffff" }}
                >
                  {waitingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm" style={{ color: "#9aada2" }}>Laden…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "#EFF5EE" }}
            >
              <MessageCircle size={24} color="#BDD2B7" strokeWidth={1.25} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "#304C3A" }}>
                {filter === "waiting"
                  ? "Geen wachtende klanten"
                  : filter === "active"
                  ? "Geen actieve gesprekken"
                  : "Geen gesprekken"}
              </p>
              <p className="text-xs mt-1" style={{ color: "#9aada2" }}>
                {filter === "waiting"
                  ? "Zodra een klant een chat start, verschijnt die hier."
                  : "Gesprekken verschijnen hier als ze beginnen."}
              </p>
            </div>
          </div>
        ) : (
          filtered.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              onClick={() => router.push(`/dashboard/chat/${s.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}