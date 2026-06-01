"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, AlertCircle,
  CheckCircle2, RefreshCw, Search,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type ComplaintStatus   = "NEW" | "IN_PROGRESS" | "RESOLVED" | "REFUNDED";
type ComplaintPriority = "LOW" | "MEDIUM" | "HIGH";
type ComplaintType     = "MELT_DAMAGE" | "BREAK_DAMAGE" | "TEXTURE_DEVIATION" | "OTHER";

export type Complaint = {
  id: string;
  referenceNumber: string;
  type: ComplaintType;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  createdAt: Date;
  updatedAt: Date;
  user: { firstName: string | null; lastName: string | null; email: string };
  product: { name: string; batchNumber: string | null };
};

type Props = { complaints: Complaint[] };

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_META: Record<ComplaintStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  NEW:         { label: "Nieuw",          color: "#D97706", bg: "#FEF3C7", icon: AlertCircle  },
  IN_PROGRESS: { label: "In behandeling", color: "#2563EB", bg: "#EFF6FF", icon: RefreshCw    },
  RESOLVED:    { label: "Opgelost",       color: "#16A34A", bg: "#F0FDF4", icon: CheckCircle2 },
  REFUNDED:    { label: "Teruggestort",   color: "#7C3AED", bg: "#F5F3FF", icon: CheckCircle2 },
};

const PRIORITY_META: Record<ComplaintPriority, { label: string; color: string; dot: string }> = {
  HIGH:   { label: "Hoog",   color: "#DC2626", dot: "#EF4444" },
  MEDIUM: { label: "Midden", color: "#D97706", dot: "#F59E0B" },
  LOW:    { label: "Laag",   color: "#16A34A", dot: "#22C55E" },
};

const TYPE_LABELS: Record<ComplaintType, string> = {
  MELT_DAMAGE:        "Smeltschade",
  BREAK_DAMAGE:       "Breukschade",
  TEXTURE_DEVIATION:  "Afwijkende structuur",
  OTHER:              "Overig",
};

const FILTERS = [
  { key: "open",     label: "Open"     },
  { key: "progress", label: "Actief"   },
  { key: "closed",   label: "Gesloten" },
  { key: "all",      label: "Alles"    },
] as const;

type Filter = typeof FILTERS[number]["key"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 3600)  return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} uur`;
  return `${Math.floor(s / 86400)}d`;
}

function customerName(user: Complaint["user"]): string {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email.split("@")[0];
}

// ── Complaint card ────────────────────────────────────────────────────────────
function ComplaintCard({ complaint, onClick }: { complaint: Complaint; onClick: () => void }) {
  const status     = STATUS_META[complaint.status];
  const priority   = PRIORITY_META[complaint.priority];
  const StatusIcon = status.icon;

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex flex-col gap-3 p-4 rounded-2xl active:scale-[0.99] transition-transform"
      style={{ background: "#ffffff", border: "1.5px solid #f0f0f0" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5"
            style={{ background: priority.dot }}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>
              {customerName(complaint.user)}
            </p>
            <p className="text-xs" style={{ color: "#9aada2" }}>{complaint.referenceNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full"
            style={{ background: status.bg, color: status.color }}
          >
            <StatusIcon size={10} strokeWidth={2.5} />
            {status.label}
          </span>
          <span className="text-[10px]" style={{ color: "#9aada2" }}>
            {timeAgo(complaint.createdAt)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: "#EFF5EE", color: "#304C3A" }}
        >
          {complaint.product.name}
        </span>
        <span className="text-xs" style={{ color: "#9aada2" }}>
          {TYPE_LABELS[complaint.type]}
        </span>
      </div>

      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#7a8f82" }}>
        {complaint.description}
      </p>

      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: priority.color + "15", color: priority.color }}
        >
          {priority.label} prioriteit
        </span>
        <ChevronRight size={14} color="#BDD2B7" />
      </div>
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function KlachtenClient({ complaints }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("open");
  const [search, setSearch] = useState("");

  const openCount     = complaints.filter((c) => c.status === "NEW").length;
  const progressCount = complaints.filter((c) => c.status === "IN_PROGRESS").length;

  const filtered = complaints.filter((c) => {
    const matchFilter =
      filter === "open"     ? c.status === "NEW" :
      filter === "progress" ? c.status === "IN_PROGRESS" :
      filter === "closed"   ? ["RESOLVED", "REFUNDED"].includes(c.status) :
      true;

    const q = search.toLowerCase();
    const matchSearch = q === "" ||
      customerName(c.user).toLowerCase().includes(q) ||
      c.referenceNumber.toLowerCase().includes(q) ||
      c.product.name.toLowerCase().includes(q);

    return matchFilter && matchSearch;
  });

  const priorityOrder: Record<ComplaintPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const sorted = [...filtered].sort((a, b) => {
    const pd = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pd !== 0) return pd;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-14 pb-4 bg-white">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-full -ml-1"
            style={{ background: "#f5f8f5" }}
            aria-label="Terug"
          >
            <ChevronLeft size={20} color="#304C3A" />
          </button>
          <h1 className="font-display text-2xl font-semibold flex-1" style={{ color: "#122A1A" }}>
            Klachten
          </h1>
          {(openCount > 0 || progressCount > 0) && (
            <div className="flex gap-1.5">
              {openCount > 0 && (
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "#FEF3C7", color: "#D97706" }}
                >
                  {openCount} nieuw
                </span>
              )}
              {progressCount > 0 && (
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "#EFF6FF", color: "#2563EB" }}
                >
                  {progressCount} actief
                </span>
              )}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={15} color="#9aada2" className="absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek op naam, referentie of product…"
            className="input-field pl-10 py-2.5 text-sm"
          />
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
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "#EFF5EE" }}
            >
              <CheckCircle2 size={24} color="#BDD2B7" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "#304C3A" }}>Geen klachten</p>
              <p className="text-xs mt-1" style={{ color: "#9aada2" }}>
                {search ? "Geen resultaten voor deze zoekopdracht." : "Geen klachten in deze categorie."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-3">
            {sorted.map((c) => (
              <ComplaintCard
                key={c.id}
                complaint={c}
                onClick={() => router.push(`/dashboard/klachten/${c.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}