"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Plus, Megaphone, Send, Calendar,
  FileText, Tag, Users, Eye, X, Trash2,
  CheckCircle2, Clock, AlertCircle, ChevronRight,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type PromotionStatus = "DRAFT" | "SCHEDULED" | "SENT";

type Promotion = {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  discountCode: string | null;
  targetSegment: string | null;
  status: PromotionStatus;
  scheduledAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
};

type Props = { promotions: Promotion[] };

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_META: Record<PromotionStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  DRAFT:     { label: "Concept",  color: "#7a8f82", bg: "#f5f8f5", icon: FileText     },
  SCHEDULED: { label: "Gepland",  color: "#2563EB", bg: "#EFF6FF", icon: Clock        },
  SENT:      { label: "Verstuurd", color: "#16A34A", bg: "#F0FDF4", icon: CheckCircle2 },
};

const SEGMENTS = [
  { value: "all", label: "Alle klanten",      description: "B2C en B2B" },
  { value: "b2c", label: "B2C klanten",       description: "Eindconsumenten" },
  { value: "b2b", label: "Zakelijke klanten", description: "B2B partners" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("nl-NL", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function timeAgo(date: Date | string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 3600)  return `${Math.floor(s / 60)} min geleden`;
  if (s < 86400) return `${Math.floor(s / 3600)} uur geleden`;
  return `${Math.floor(s / 86400)} dagen geleden`;
}

// ── Phone Preview ─────────────────────────────────────────────────────────────
function PhonePreview({ title, body, discountCode, imageUrl }: {
  title: string; body: string; discountCode: string; imageUrl: string;
}) {
  const hasContent = title || body;

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#9aada2" }}>
        Voorbeeldweergave
      </p>

      {/* Push notification preview */}
      <div
        className="w-full rounded-2xl p-4 mb-3"
        style={{ background: "#1a1a1a" }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#304C3A" }}
          >
            <Megaphone size={14} color="#51C675" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                Avéline · Nu
              </span>
            </div>
            <p className="text-xs font-semibold leading-snug mb-0.5" style={{ color: "#ffffff" }}>
              {title || "Titel van je promotie"}
            </p>
            <p className="text-[10px] leading-relaxed line-clamp-2" style={{ color: "rgba(255,255,255,0.6)" }}>
              {body || "Hier verschijnt je promotietekst…"}
            </p>
          </div>
        </div>
      </div>

      {/* In-app promo card */}
      <div
        className="w-full rounded-2xl overflow-hidden"
        style={{ border: "1.5px solid #e8ede9" }}
      >
        {imageUrl ? (
          <div
            className="h-32 w-full"
            style={{ background: `url(${imageUrl}) center/cover`, position: "relative" }}
          >
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(18,42,26,0.7))" }}
            />
            {discountCode && (
              <div className="absolute bottom-3 left-3">
                <span
                  className="text-xs font-mono font-bold px-2 py-1 rounded-lg"
                  style={{ background: "#51C675", color: "#122A1A" }}
                >
                  {discountCode}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div
            className="h-24 w-full flex flex-col items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #EFF5EE 0%, #BDD2B7 100%)" }}
          >
            <Megaphone size={22} color="#304C3A" strokeWidth={1.5} />
            {discountCode && (
              <span
                className="text-xs font-mono font-bold px-2 py-1 rounded-lg"
                style={{ background: "#304C3A", color: "#ffffff" }}
              >
                {discountCode}
              </span>
            )}
          </div>
        )}

        <div className="p-4">
          {hasContent ? (
            <>
              <p className="text-sm font-semibold mb-1" style={{ color: "#122A1A" }}>
                {title || "Promotietitel"}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "#7a8f82" }}>
                {body || "Promotietekst…"}
              </p>
            </>
          ) : (
            <p className="text-xs text-center py-2" style={{ color: "#BDD2B7" }}>
              Vul het formulier in om een preview te zien
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Promotion Card ────────────────────────────────────────────────────────────
function PromotionCard({
  promotion,
  onDelete,
  onSend,
}: {
  promotion: Promotion;
  onDelete: (id: string) => void;
  onSend: (id: string) => void;
}) {
  const meta = STATUS_META[promotion.status];
  const StatusIcon = meta.icon;

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ border: "1.5px solid #f0f0f0", background: "#ffffff" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>
            {promotion.title}
          </p>
          <p className="text-xs mt-0.5 leading-snug line-clamp-2" style={{ color: "#7a8f82" }}>
            {promotion.body}
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full flex-shrink-0"
          style={{ background: meta.bg, color: meta.color }}
        >
          <StatusIcon size={10} strokeWidth={2} />
          {meta.label}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {promotion.discountCode && (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-1 rounded-lg"
            style={{ background: "#EFF5EE", color: "#304C3A" }}
          >
            <Tag size={9} />
            {promotion.discountCode}
          </span>
        )}
        {promotion.targetSegment && (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg"
            style={{ background: "#f5f8f5", color: "#7a8f82" }}
          >
            <Users size={9} />
            {SEGMENTS.find((s) => s.value === promotion.targetSegment)?.label ?? promotion.targetSegment}
          </span>
        )}
        {promotion.scheduledAt && promotion.status === "SCHEDULED" && (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg"
            style={{ background: "#EFF6FF", color: "#2563EB" }}
          >
            <Calendar size={9} />
            {formatDate(promotion.scheduledAt)}
          </span>
        )}
        {promotion.sentAt && (
          <span className="text-[10px]" style={{ color: "#BDD2B7" }}>
            Verstuurd {timeAgo(promotion.sentAt)}
          </span>
        )}
      </div>

      {/* Actions for drafts */}
      {promotion.status === "DRAFT" && (
        <div className="flex gap-2 pt-1 border-t" style={{ borderColor: "#f0f0f0" }}>
          <button
            onClick={() => onSend(promotion.id)}
            className="flex items-center gap-1.5 flex-1 justify-center text-xs font-medium py-2 rounded-xl transition-colors"
            style={{ background: "#EFF5EE", color: "#304C3A" }}
          >
            <Send size={12} />
            Nu versturen
          </button>
          <button
            onClick={() => onDelete(promotion.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
            style={{ background: "#FEF2F2", color: "#DC2626" }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── New Promotion Form ────────────────────────────────────────────────────────
function NieuwePromotieForm({ onSuccess, onClose }: {
  onSuccess: (p: Promotion) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    body: "",
    imageUrl: "",
    discountCode: "",
    targetSegment: "all",
    scheduledAt: "",
    sendMode: "draft" as "draft" | "now" | "scheduled",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<"form" | "preview">("form");

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Titel is verplicht";
    if (!form.body.trim())  errs.body  = "Promotietekst is verplicht";
    if (form.sendMode === "scheduled" && !form.scheduledAt)
      errs.scheduledAt = "Kies een datum en tijd";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/marketing/promoties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          body: form.body,
          imageUrl: form.imageUrl || undefined,
          discountCode: form.discountCode || undefined,
          targetSegment: form.targetSegment,
          scheduledAt: form.sendMode === "scheduled" ? form.scheduledAt : undefined,
          sendNow: form.sendMode === "now",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors({ api: data.message ?? "Opslaan mislukt." });
        return;
      }
      onSuccess(data.promotion);
    } catch {
      setErrors({ api: "Er ging iets mis. Probeer opnieuw." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(18,42,26,0.4)" }}>
      <div
        className="w-full max-w-[430px] rounded-t-3xl animate-fade-slide-up flex flex-col"
        style={{ background: "#ffffff", maxHeight: "90dvh" }}
      >
        {/* Handle + header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "#e4e4e4" }} />
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold" style={{ color: "#122A1A" }}>
              Nieuwe promotie
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full"
              style={{ background: "#f5f8f5" }}
            >
              <X size={18} color="#304C3A" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#f5f8f5" }}>
            {(["form", "preview"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
                style={
                  tab === t
                    ? { background: "#ffffff", color: "#304C3A", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                    : { color: "#9aada2" }
                }
              >
                {t === "form" ? <><FileText size={12} /> Formulier</> : <><Eye size={12} /> Preview</>}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-2">
          {tab === "form" ? (
            <div className="flex flex-col gap-4 pb-4">
              {/* Title */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: "#9aada2" }}>
                  Titel *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="bijv. Zomerse kortingsactie"
                  className={`input-field text-sm ${errors.title ? "error" : ""}`}
                  maxLength={80}
                />
                {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
              </div>

              {/* Body */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: "#9aada2" }}>
                  Promotietekst *
                </label>
                <textarea
                  value={form.body}
                  onChange={(e) => set("body", e.target.value)}
                  placeholder="Omschrijf de promotie. Klanten zien dit als pushmelding en in de app."
                  rows={3}
                  className={`input-field text-sm resize-none ${errors.body ? "error" : ""}`}
                  maxLength={300}
                />
                <div className="flex justify-between mt-1">
                  {errors.body
                    ? <p className="text-xs text-red-600">{errors.body}</p>
                    : <span />
                  }
                  <span className="text-xs" style={{ color: "#BDD2B7" }}>{form.body.length}/300</span>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: "#9aada2" }}>
                  Afbeelding URL <span style={{ color: "#BDD2B7", fontWeight: 400 }}>optioneel</span>
                </label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => set("imageUrl", e.target.value)}
                  placeholder="https://…"
                  className="input-field text-sm"
                  type="url"
                />
              </div>

              {/* Discount code */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: "#9aada2" }}>
                  Kortingscode <span style={{ color: "#BDD2B7", fontWeight: 400 }}>optioneel</span>
                </label>
                <input
                  value={form.discountCode}
                  onChange={(e) => set("discountCode", e.target.value.toUpperCase())}
                  placeholder="bijv. ZOMER20"
                  className="input-field text-sm font-mono"
                  maxLength={20}
                />
              </div>

              {/* Target segment */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: "#9aada2" }}>
                  Doelgroep
                </label>
                <div className="flex flex-col gap-2">
                  {SEGMENTS.map(({ value, label, description }) => (
                    <button
                      key={value}
                      onClick={() => set("targetSegment", value)}
                      className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                      style={{
                        background: form.targetSegment === value ? "#EFF5EE" : "#f5f8f5",
                        border: `1.5px solid ${form.targetSegment === value ? "#304C3A40" : "transparent"}`,
                      }}
                    >
                      <Users size={14} color={form.targetSegment === value ? "#304C3A" : "#9aada2"} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#122A1A" }}>{label}</p>
                        <p className="text-xs" style={{ color: "#9aada2" }}>{description}</p>
                      </div>
                      {form.targetSegment === value && (
                        <CheckCircle2 size={14} color="#304C3A" className="ml-auto flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Send mode */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: "#9aada2" }}>
                  Verzenden
                </label>
                <div className="flex flex-col gap-2">
                  {([
                    { value: "draft",     label: "Opslaan als concept", icon: FileText,  description: "Verstuur later" },
                    { value: "now",       label: "Direct versturen",    icon: Send,       description: "Stuurt meteen naar doelgroep" },
                    { value: "scheduled", label: "Inplannen",           icon: Calendar,   description: "Kies datum en tijd" },
                  ] as const).map(({ value, label, icon: Icon, description }) => (
                    <button
                      key={value}
                      onClick={() => set("sendMode", value)}
                      className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                      style={{
                        background: form.sendMode === value ? "#EFF5EE" : "#f5f8f5",
                        border: `1.5px solid ${form.sendMode === value ? "#304C3A40" : "transparent"}`,
                      }}
                    >
                      <Icon size={14} color={form.sendMode === value ? "#304C3A" : "#9aada2"} />
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: "#122A1A" }}>{label}</p>
                        <p className="text-xs" style={{ color: "#9aada2" }}>{description}</p>
                      </div>
                      {form.sendMode === value && (
                        <CheckCircle2 size={14} color="#304C3A" className="flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {form.sendMode === "scheduled" && (
                  <div className="mt-3">
                    <input
                      type="datetime-local"
                      value={form.scheduledAt}
                      onChange={(e) => set("scheduledAt", e.target.value)}
                      className={`input-field text-sm ${errors.scheduledAt ? "error" : ""}`}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    {errors.scheduledAt && <p className="text-xs text-red-600 mt-1">{errors.scheduledAt}</p>}
                  </div>
                )}
              </div>

              {errors.api && (
                <div
                  className="flex items-center gap-2 p-3 rounded-xl"
                  style={{ background: "#FEF2F2" }}
                >
                  <AlertCircle size={14} color="#DC2626" />
                  <p className="text-xs" style={{ color: "#DC2626" }}>{errors.api}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4">
              <PhonePreview
                title={form.title}
                body={form.body}
                discountCode={form.discountCode}
                imageUrl={form.imageUrl}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 pt-3 pb-8 border-t" style={{ borderColor: "#f0f0f0" }}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary"
            style={{ opacity: submitting ? 0.7 : 1 }}
          >
            {submitting
              ? "Bezig…"
              : form.sendMode === "now"
              ? "Versturen naar doelgroep"
              : form.sendMode === "scheduled"
              ? "Inplannen"
              : "Opslaan als concept"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Filters ───────────────────────────────────────────────────────────────────
const FILTERS = [
  { key: "all",       label: "Alles"    },
  { key: "DRAFT",     label: "Concept"  },
  { key: "SCHEDULED", label: "Gepland"  },
  { key: "SENT",      label: "Verstuurd"},
] as const;

type Filter = typeof FILTERS[number]["key"];

// ── Main component ────────────────────────────────────────────────────────────
export default function PromotiesClient({ promotions: initial }: Props) {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [showForm, setShowForm] = useState(false);

  const draftCount     = promotions.filter((p) => p.status === "DRAFT").length;
  const scheduledCount = promotions.filter((p) => p.status === "SCHEDULED").length;

  const filtered = promotions.filter((p) =>
    filter === "all" ? true : p.status === filter
  );

  function handleSuccess(promotion: Promotion) {
    setPromotions((prev) => [promotion, ...prev]);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/marketing/promoties/${id}`, { method: "DELETE" });
  }

  async function handleSend(id: string) {
    const res = await fetch(`/api/marketing/promoties/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SENT", sentAt: new Date().toISOString() }),
    });
    if (res.ok) {
      const data = await res.json();
      setPromotions((prev) => prev.map((p) => (p.id === id ? data.promotion : p)));
    }
  }

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
            Promoties
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "#304C3A" }}
            aria-label="Nieuwe promotie"
          >
            <Plus size={20} color="#ffffff" strokeWidth={2.5} />
          </button>
        </div>

        {/* Stats */}
        {(draftCount > 0 || scheduledCount > 0) && (
          <div className="flex gap-2 mb-4">
            {draftCount > 0 && (
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: "#f5f8f5", color: "#7a8f82" }}
              >
                {draftCount} concept{draftCount > 1 ? "en" : ""}
              </span>
            )}
            {scheduledCount > 0 && (
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: "#EFF6FF", color: "#2563EB" }}
              >
                {scheduledCount} ingepland
              </span>
            )}
          </div>
        )}

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
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-5">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background: "#EFF5EE" }}
            >
              <Megaphone size={32} color="#BDD2B7" strokeWidth={1.25} />
            </div>
            <div>
              <p className="text-base font-semibold mb-1" style={{ color: "#304C3A" }}>
                Geen promoties
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "#9aada2" }}>
                Maak je eerste promotie aan met de{" "}
                <strong style={{ color: "#304C3A" }}>+</strong> knop.
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
              style={{ maxWidth: 220 }}
            >
              Promotie aanmaken
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-3">
            {filtered.map((p) => (
              <PromotionCard
                key={p.id}
                promotion={p}
                onDelete={handleDelete}
                onSend={handleSend}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <NieuwePromotieForm
          onSuccess={handleSuccess}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}