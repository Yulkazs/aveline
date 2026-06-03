"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Megaphone, Users, ChevronRight, Settings,
  Send, BarChart2, Plus, MessageCircle,
  Clock, CheckCircle2, FileText, Bell,
  TrendingUp, RefreshCw,
} from "lucide-react";
import NotificationBell from "@/components/dashboard/NotificationBell";

// ─── Types ────────────────────────────────────────────────────────────────────

type PromotionStatus = "DRAFT" | "SCHEDULED" | "SENT";

type RecentPromotion = {
  id: string;
  title: string;
  status: PromotionStatus;
  targetSegment: string | null;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  discountCode: string | null;
};

type UpcomingNotification = {
  id: string;
  title: string;
  body: string;
  targetSegment: string | null;
  scheduledAt: string;
};

type RecentPost = {
  id: string;
  title: string | null;
  content: string;
  createdAt: string;
  user: { firstName: string | null; lastName: string | null };
  _count: { comments: number };
};

type MarketingStats = {
  promotions: {
    active: number;
    scheduled: number;
    sentThisMonth: number;
    recent: RecentPromotion[];
  };
  notifications: {
    upcoming: number;
    next: UpcomingNotification[];
  };
  community: {
    totalPosts: number;
    postsThisWeek: number;
    totalComments: number;
    recentPosts: RecentPost[];
  };
};

type Props = { firstName: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PROMOTION_STATUS: Record<PromotionStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  DRAFT:     { label: "Concept",    color: "#9aada2", bg: "#f5f8f5",  icon: FileText     },
  SCHEDULED: { label: "Ingepland",  color: "#2563EB", bg: "#EFF6FF",  icon: Clock        },
  SENT:      { label: "Verzonden",  color: "#16A34A", bg: "#F0FDF4",  icon: CheckCircle2 },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function timeUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `over ${days}d`;
  if (hours > 0) return `over ${hours}u`;
  return "binnenkort";
}

function authorName(user: RecentPost["user"]) {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Anoniem";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatTile({
  label, value, sub, icon: Icon, accent = false, onClick,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="rounded-2xl p-4 text-left w-full"
      style={{ background: accent ? "#304C3A" : "#f5f8f5" }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background: accent ? "rgba(189,210,183,0.2)" : "#e8ede9" }}
      >
        <Icon size={17} color={accent ? "#BDD2B7" : "#304C3A"} strokeWidth={1.75} />
      </div>
      <p
        className="text-2xl font-semibold font-display leading-none"
        style={{ color: accent ? "#ffffff" : "#122A1A" }}
      >
        {value}
      </p>
      <p className="text-xs mt-1" style={{ color: accent ? "rgba(189,210,183,0.8)" : "#7a8f82" }}>
        {label}
      </p>
      {sub && (
        <p className="text-[11px] mt-1 font-medium" style={{ color: accent ? "#BDD2B7" : "#9aada2" }}>
          {sub}
        </p>
      )}
    </button>
  );
}

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-semibold text-base" style={{ color: "#122A1A" }}>{title}</h2>
      {action && onAction && (
        <button onClick={onAction} className="text-xs font-medium" style={{ color: "#304C3A" }}>
          {action}
        </button>
      )}
    </div>
  );
}

function EmptyCard({ label }: { label: string }) {
  return (
    <div className="rounded-2xl p-5 text-center" style={{ background: "#f5f8f5" }}>
      <p className="text-sm" style={{ color: "#9aada2" }}>{label}</p>
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function Skeleton({ h = "h-10", rounded = "rounded-2xl" }: { h?: string; rounded?: string }) {
  return <div className={`${h} ${rounded} animate-pulse`} style={{ background: "#e8ede9" }} />;
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Skeleton h="h-28" /><Skeleton h="h-28" />
        <Skeleton h="h-28" /><Skeleton h="h-28" />
      </div>
      <Skeleton h="h-6" rounded="rounded-lg" />
      <Skeleton h="h-20" />
      <Skeleton h="h-20" />
      <Skeleton h="h-6" rounded="rounded-lg" />
      <Skeleton h="h-20" />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DashboardMarketing({ firstName }: Props) {
  const router = useRouter();

  const [stats, setStats]     = useState<MarketingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  async function loadStats() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/marketing/stats");
      if (!res.ok) throw new Error();
      setStats(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStats(); }, []);

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-5 pt-14 pb-5 bg-white">
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="font-display text-[1.75rem] font-semibold leading-tight"
              style={{ color: "#122A1A" }}
            >
              Hallo, {firstName}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#7a8f82" }}>
              Marketing dashboard
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => router.push("/dashboard/instellingen")}
              className="p-2 rounded-full"
              style={{ background: "#f5f8f5" }}
              aria-label="Instellingen"
            >
              <Settings size={20} color="#304C3A" />
            </button>
            <NotificationBell />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">

        {loading ? (
          <LoadingState />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-sm" style={{ color: "#9aada2" }}>Kon data niet laden.</p>
            <button
              onClick={loadStats}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white"
              style={{ background: "#304C3A" }}
            >
              <RefreshCw size={14} /> Opnieuw proberen
            </button>
          </div>
        ) : stats ? (
          <>
            {/* ── Stat grid ── */}
            <div className="grid grid-cols-2 gap-3 mt-1 mb-7">
              <StatTile
                label="Actieve promoties"
                value={stats.promotions.active}
                sub={`${stats.promotions.sentThisMonth} verzonden deze maand`}
                icon={Megaphone}
                accent
                onClick={() => router.push("/dashboard/promoties")}
              />
              <StatTile
                label="Ingepland"
                value={stats.promotions.scheduled}
                sub="promoties wachten"
                icon={Clock}
                onClick={() => router.push("/dashboard/promoties")}
              />
              <StatTile
                label="Notificaties"
                value={stats.notifications.upcoming}
                sub="komende meldingen"
                icon={Bell}
                onClick={() => router.push("/dashboard/notificaties")}
              />
              <StatTile
                label="Community"
                value={stats.community.totalPosts}
                sub={`+${stats.community.postsThisWeek} deze week`}
                icon={Users}
                onClick={() => router.push("/dashboard/community")}
              />
            </div>

            {/* ── Quick actions ── */}
            <div className="flex gap-2 mb-7">
              <button
                onClick={() => router.push("/dashboard/promoties/nieuw")}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium text-white"
                style={{ background: "#304C3A" }}
              >
                <Plus size={15} strokeWidth={2} />
                Nieuwe promotie
              </button>
              <button
                onClick={() => router.push("/dashboard/notificaties/nieuw")}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium border"
                style={{ borderColor: "#c8d9c2", color: "#304C3A" }}
              >
                <Send size={15} strokeWidth={2} />
                Notificatie sturen
              </button>
            </div>

            {/* ── Recent promotions ── */}
            <div className="mb-7">
              <SectionHeader
                title="Recente promoties"
                action="Alles zien"
                onAction={() => router.push("/dashboard/promoties")}
              />
              {stats.promotions.recent.length === 0 ? (
                <EmptyCard label="Nog geen promoties aangemaakt." />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {stats.promotions.recent.map((promo) => {
                    const meta = PROMOTION_STATUS[promo.status];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={promo.id}
                        onClick={() => router.push(`/dashboard/promoties/${promo.id}`)}
                        className="w-full text-left flex items-center gap-3 p-3.5 rounded-2xl active:scale-[0.99] transition-transform"
                        style={{ background: "#ffffff", border: "1.5px solid #f0f0f0" }}
                      >
                        {/* Status icon */}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: meta.bg }}
                        >
                          <Icon size={15} color={meta.color} strokeWidth={2} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>
                            {promo.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {promo.targetSegment && (
                              <span className="text-[11px]" style={{ color: "#9aada2" }}>
                                {promo.targetSegment}
                              </span>
                            )}
                            {promo.discountCode && (
                              <span
                                className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded"
                                style={{ background: "#EFF5EE", color: "#304C3A" }}
                              >
                                {promo.discountCode}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right */}
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                            style={{ background: meta.bg, color: meta.color }}
                          >
                            {meta.label}
                          </span>
                          <span className="text-[11px]" style={{ color: "#9aada2" }}>
                            {promo.sentAt
                              ? formatDate(promo.sentAt)
                              : promo.scheduledAt
                              ? formatDateTime(promo.scheduledAt)
                              : formatDate(promo.createdAt)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Upcoming notifications ── */}
            <div className="mb-7">
              <SectionHeader
                title="Komende meldingen"
                action="Alles beheren"
                onAction={() => router.push("/dashboard/notificaties")}
              />
              {stats.notifications.next.length === 0 ? (
                <EmptyCard label="Geen geplande meldingen." />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {stats.notifications.next.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 p-3.5 rounded-2xl"
                      style={{ background: "#EFF5EE", border: "1.5px solid #c8d9c2" }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: "#304C3A" }}
                      >
                        <Bell size={15} color="#BDD2B7" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: "#122A1A" }}>
                          {n.title}
                        </p>
                        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "#7a8f82" }}>
                          {n.body}
                        </p>
                        {n.targetSegment && (
                          <p className="text-[11px] mt-1" style={{ color: "#9aada2" }}>
                            → {n.targetSegment}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span
                          className="text-[11px] font-semibold px-2 py-1 rounded-full"
                          style={{ background: "#304C3A", color: "#BDD2B7" }}
                        >
                          {timeUntil(n.scheduledAt)}
                        </span>
                        <p className="text-[10px] mt-1" style={{ color: "#9aada2" }}>
                          {formatDateTime(n.scheduledAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Community pulse ── */}
            <div className="mb-7">
              <SectionHeader
                title="Community pulse"
                action="Naar community"
                onAction={() => router.push("/dashboard/community")}
              />

              {/* Mini stats row */}
              <div className="flex gap-2 mb-3">
                {[
                  { label: "Posts totaal", value: stats.community.totalPosts, icon: FileText },
                  { label: "Reacties", value: stats.community.totalComments, icon: MessageCircle },
                  { label: "Deze week", value: `+${stats.community.postsThisWeek}`, icon: TrendingUp },
                ].map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex-1 rounded-2xl p-3 flex flex-col items-center text-center gap-1"
                    style={{ background: "#f5f8f5" }}
                  >
                    <Icon size={14} color="#304C3A" strokeWidth={1.75} />
                    <p className="text-base font-semibold font-display leading-none" style={{ color: "#122A1A" }}>
                      {value}
                    </p>
                    <p className="text-[10px]" style={{ color: "#9aada2" }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Recent posts */}
              {stats.community.recentPosts.length === 0 ? (
                <EmptyCard label="Nog geen community posts." />
              ) : (
                <div className="flex flex-col gap-2">
                  {stats.community.recentPosts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => router.push(`/dashboard/community/${post.id}`)}
                      className="w-full text-left p-3.5 rounded-2xl"
                      style={{ background: "#ffffff", border: "1.5px solid #f0f0f0" }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {post.title && (
                            <p className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>
                              {post.title}
                            </p>
                          )}
                          <p className="text-xs line-clamp-2 mt-0.5" style={{ color: "#7a8f82" }}>
                            {post.content}
                          </p>
                        </div>
                        <ChevronRight size={14} color="#BDD2B7" className="flex-shrink-0 mt-0.5" />
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[11px]" style={{ color: "#9aada2" }}>
                          {authorName(post.user)}
                        </span>
                        <span className="text-[11px]" style={{ color: "#9aada2" }}>·</span>
                        <span className="text-[11px]" style={{ color: "#9aada2" }}>
                          {formatDate(post.createdAt)}
                        </span>
                        <div className="flex items-center gap-1 ml-auto" style={{ color: "#9aada2" }}>
                          <MessageCircle size={11} strokeWidth={1.75} />
                          <span className="text-[11px]">{post._count.comments}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Secondary nav tiles ── */}
            <div className="flex flex-col gap-3">
              {[
                { label: "Alle promoties beheren", href: "/dashboard/promoties",    icon: Megaphone, bg: "#EFF5EE" },
                { label: "Notificaties inplannen", href: "/dashboard/notificaties", icon: Bell,      bg: "#E8F2E8" },
                { label: "Analytics bekijken",     href: "/dashboard/analytics",    icon: BarChart2, bg: "#EFF5EE" },
              ].map(({ label, href, icon: Icon, bg }) => (
                <button
                  key={href}
                  onClick={() => router.push(href)}
                  className="flex items-center gap-4 p-4 rounded-2xl text-left active:scale-[0.99] transition-transform"
                  style={{ background: bg }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(48,76,58,0.12)" }}
                  >
                    <Icon size={22} color="#304C3A" strokeWidth={1.5} />
                  </div>
                  <span className="font-medium text-sm flex-1" style={{ color: "#122A1A" }}>{label}</span>
                  <ChevronRight size={16} color="#BDD2B7" />
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}