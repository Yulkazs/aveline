"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, CheckCircle2, RefreshCw, AlertCircle,
  User, Package, Clock, MessageSquare, StickyNote,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type ComplaintStatus   = "NEW" | "IN_PROGRESS" | "RESOLVED" | "REFUNDED";
type ComplaintPriority = "LOW" | "MEDIUM" | "HIGH";
type ComplaintType     = "MELT_DAMAGE" | "BREAK_DAMAGE" | "TEXTURE_DEVIATION" | "OTHER";

type StatusHistory = {
  id: string;
  status: ComplaintStatus;
  changedBy: string | null;
  note: string | null;
  changedAt: Date;
};

type CRMNote = {
  id: string;
  content: string;
  createdBy: string;
  createdAt: Date;
};

export type ComplaintDetail = {
  id: string;
  referenceNumber: string;
  type: ComplaintType;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  resolution: string | null;
  assignedTo: string | null;
  mediaUrls: string[];
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    points: number;
  };
  product: {
    name: string;
    batchNumber: string | null;
    origin: string | null;
    cacaoPercentage: number | null;
  };
  statusHistory: StatusHistory[];
  crmNotes?: CRMNote[];
};

type Props = { complaint: ComplaintDetail };

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_META: Record<ComplaintStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  NEW:         { label: "Nieuw",          color: "#D97706", bg: "#FEF3C7", icon: AlertCircle  },
  IN_PROGRESS: { label: "In behandeling", color: "#2563EB", bg: "#EFF6FF", icon: RefreshCw    },
  RESOLVED:    { label: "Opgelost",       color: "#16A34A", bg: "#F0FDF4", icon: CheckCircle2 },
  REFUNDED:    { label: "Teruggestort",   color: "#7C3AED", bg: "#F5F3FF", icon: CheckCircle2 },
};

const PRIORITY_META: Record<ComplaintPriority, { label: string; color: string; bg: string }> = {
  HIGH:   { label: "Hoog",   color: "#DC2626", bg: "#FEF2F2" },
  MEDIUM: { label: "Midden", color: "#D97706", bg: "#FEF3C7" },
  LOW:    { label: "Laag",   color: "#16A34A", bg: "#F0FDF4" },
};

const TYPE_LABELS: Record<ComplaintType, string> = {
  MELT_DAMAGE:        "Smeltschade",
  BREAK_DAMAGE:       "Breukschade",
  TEXTURE_DEVIATION:  "Afwijkende structuur",
  OTHER:              "Overig",
};

const VALID_STATUSES: ComplaintStatus[] = ["NEW", "IN_PROGRESS", "RESOLVED", "REFUNDED"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("nl-NL", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function customerName(user: ComplaintDetail["user"]) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email.split("@")[0];
}

// ── Main component ────────────────────────────────────────────────────────────
export default function KlachtDetail({ complaint: initial }: Props) {
  const router = useRouter();
  const [complaint, setComplaint] = useState(initial);
  const [tab, setTab] = useState<"details" | "history" | "notes">("details");

  // Status update
  const [newStatus, setNewStatus]     = useState<ComplaintStatus>(initial.status);
  const [note, setNote]               = useState("");
  const [resolution, setResolution]   = useState(initial.resolution ?? "");
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState<string | null>(null);

  const status   = STATUS_META[complaint.status];
  const priority = PRIORITY_META[complaint.priority];
  const StatusIcon = status.icon;

  async function handleSave() {
    if (newStatus === complaint.status && !resolution && !note) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/complaints/${complaint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status:     newStatus !== complaint.status ? newStatus : undefined,
          resolution: resolution.trim() || undefined,
          note:       note.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.message ?? "Opslaan mislukt.");
        return;
      }
      const data = await res.json();
      setComplaint(data.complaint);
      setNote("");
    } catch {
      setSaveError("Er ging iets mis. Controleer je verbinding.");
    } finally {
      setSaving(false);
    }
  }

  const TABS = [
    { key: "details" as const, label: "Details",   icon: Package        },
    { key: "history" as const, label: "Geschiedenis", icon: Clock       },
    { key: "notes"   as const, label: "Notities",   icon: StickyNote    },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-14 pb-4 border-b" style={{ borderColor: "#f0f0f0" }}>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full -ml-1"
            style={{ background: "#f5f8f5" }}
            aria-label="Terug"
          >
            <ChevronLeft size={20} color="#304C3A" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-semibold truncate" style={{ color: "#122A1A" }}>
              {complaint.referenceNumber}
            </h1>
            <p className="text-xs" style={{ color: "#9aada2" }}>
              {TYPE_LABELS[complaint.type]} · {formatDate(complaint.createdAt)}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <span
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: status.bg, color: status.color }}
            >
              <StatusIcon size={11} strokeWidth={2.5} />
              {status.label}
            </span>
            <span
              className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: priority.bg, color: priority.color }}
            >
              {priority.label}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-5">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="pb-2 text-xs font-medium flex items-center gap-1.5 relative transition-colors"
              style={{ color: tab === key ? "#304C3A" : "#9aada2" }}
            >
              <Icon size={13} strokeWidth={1.75} />
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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5">

        {/* ── Tab: Details ──────────────────────────────────────────── */}
        {tab === "details" && (
          <div className="flex flex-col gap-5">

            {/* Customer */}
            <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "#EFF5EE" }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold"
                style={{ background: "#BDD2B7", color: "#304C3A" }}
              >
                {customerName(complaint.user).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>
                  {customerName(complaint.user)}
                </p>
                <p className="text-xs truncate" style={{ color: "#7a8f82" }}>{complaint.user.email}</p>
                <p className="text-[10px] mt-0.5 font-medium" style={{ color: "#51C675" }}>
                  {complaint.user.points} punten
                </p>
              </div>
              <User size={16} color="#BDD2B7" />
            </div>

            {/* Product */}
            <div className="rounded-2xl p-4" style={{ background: "#f5f8f5" }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#9aada2" }}>Product</p>
              <p className="text-sm font-semibold" style={{ color: "#122A1A" }}>{complaint.product.name}</p>
              <div className="flex flex-wrap gap-3 mt-1.5 text-xs" style={{ color: "#7a8f82" }}>
                {complaint.product.batchNumber && <span>Batch #{complaint.product.batchNumber}</span>}
                {complaint.product.origin     && <span>🌍 {complaint.product.origin}</span>}
                {complaint.product.cacaoPercentage != null && <span>🍫 {complaint.product.cacaoPercentage}% cacao</span>}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl p-4" style={{ background: "#f5f8f5" }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#9aada2" }}>Omschrijving</p>
              <p className="text-sm leading-relaxed" style={{ color: "#304C3A" }}>{complaint.description}</p>
            </div>

            {/* Media */}
            {complaint.mediaUrls.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#9aada2" }}>Bijlagen</p>
                <div className="flex gap-2 flex-wrap">
                  {complaint.mediaUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="w-20 h-20 rounded-2xl object-cover"
                      style={{ border: "1.5px solid #f0f0f0" }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Status update */}
            <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ border: "1.5px solid #e8ede9" }}>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#9aada2" }}>Status bijwerken</p>

              <div className="flex flex-wrap gap-2">
                {VALID_STATUSES.map((s) => {
                  const meta = STATUS_META[s];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={s}
                      onClick={() => setNewStatus(s)}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all"
                      style={
                        newStatus === s
                          ? { background: meta.bg, color: meta.color, outline: `1.5px solid ${meta.color}` }
                          : { background: "#f5f8f5", color: "#9aada2" }
                      }
                    >
                      <Icon size={11} strokeWidth={2.5} />
                      {meta.label}
                    </button>
                  );
                })}
              </div>

              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Oplossing / toelichting (optioneel)…"
                rows={2}
                className="input-field resize-none text-sm"
              />

              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Interne notitie bij statuswijziging (optioneel)…"
                className="input-field text-sm"
              />

              {saveError && <p className="text-xs text-red-600">{saveError}</p>}

              <button
                onClick={handleSave}
                disabled={saving || (newStatus === complaint.status && !resolution.trim() && !note.trim())}
                className="btn-primary"
                style={{
                  opacity: saving || (newStatus === complaint.status && !resolution.trim() && !note.trim()) ? 0.5 : 1,
                }}
              >
                {saving ? "Opslaan…" : "Wijzigingen opslaan"}
              </button>
            </div>
          </div>
        )}

        {/* ── Tab: History ──────────────────────────────────────────── */}
        {tab === "history" && (
          <div className="flex flex-col gap-3">
            {complaint.statusHistory.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#9aada2" }}>Geen geschiedenis beschikbaar.</p>
            ) : (
              complaint.statusHistory.map((h, i) => {
                const meta = STATUS_META[h.status];
                const Icon = meta.icon;
                return (
                  <div
                    key={h.id}
                    className="flex items-start gap-3 p-4 rounded-2xl"
                    style={{ background: i === 0 ? meta.bg : "#f5f8f5" }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: i === 0 ? meta.color : "#e0e0e0" }}
                    >
                      <Icon size={14} color={i === 0 ? "#fff" : "#9aada2"} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold" style={{ color: meta.color }}>{meta.label}</span>
                        <span className="text-[10px]" style={{ color: "#9aada2" }}>{formatDate(h.changedAt)}</span>
                      </div>
                      {h.note && (
                        <p className="text-xs mt-1 leading-relaxed" style={{ color: "#7a8f82" }}>{h.note}</p>
                      )}
                      {h.changedBy && (
                        <p className="text-[10px] mt-1" style={{ color: "#BDD2B7" }}>door {h.changedBy}</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Tab: Notes ────────────────────────────────────────────── */}
        {tab === "notes" && (
          <div className="flex flex-col gap-3">
            {!complaint.crmNotes || complaint.crmNotes.length === 0 ? (
              <div className="rounded-2xl p-8 flex flex-col items-center text-center" style={{ background: "#f5f8f5" }}>
                <StickyNote size={24} color="#BDD2B7" strokeWidth={1.5} className="mb-2" />
                <p className="text-sm" style={{ color: "#9aada2" }}>Geen CRM-notities voor deze klacht.</p>
              </div>
            ) : (
              complaint.crmNotes.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: "#FEF9C3" }}
                >
                  <StickyNote size={14} color="#CA8A04" strokeWidth={1.75} className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed" style={{ color: "#92400E" }}>{n.content}</p>
                    <p className="text-[10px] mt-1" style={{ color: "#CA8A04" }}>
                      {formatDate(n.createdAt)} · door {n.createdBy}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}