"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Bell, Package, Tag, MessageCircle, Star, Users, ShoppingCart, Sparkles, Check, Trash2 } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type NotificationType =
  | "COMPLAINT_UPDATE"
  | "NEW_PRODUCT"
  | "PROMOTION"
  | "BADGE_EARNED"
  | "COMMUNITY_REPLY"
  | "ORDER_UPDATE"
  | "STOCK_CHANGE"
  | "LIMITED_EDITION";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  deepLink?: string;
  createdAt: string;
};

// ── Icon + color map ──────────────────────────────────────────────────────────
const TYPE_META: Record<NotificationType, { icon: React.ElementType; bg: string; color: string }> = {
  COMPLAINT_UPDATE: { icon: MessageCircle, bg: "#FEF3C7", color: "#D97706" },
  NEW_PRODUCT:      { icon: Package,       bg: "#EFF5EE", color: "#304C3A" },
  PROMOTION:        { icon: Tag,           bg: "#F0FDF4", color: "#16A34A" },
  BADGE_EARNED:     { icon: Star,          bg: "#FEF9C3", color: "#CA8A04" },
  COMMUNITY_REPLY:  { icon: Users,         bg: "#EFF5EE", color: "#304C3A" },
  ORDER_UPDATE:     { icon: ShoppingCart,  bg: "#F0F9FF", color: "#0369A1" },
  STOCK_CHANGE:     { icon: Package,       bg: "#FFF7ED", color: "#EA580C" },
  LIMITED_EDITION:  { icon: Sparkles,      bg: "#FDF4FF", color: "#9333EA" },
};

// ── Time formatter ────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60)    return "Zojuist";
  if (seconds < 3600)  return `${Math.floor(seconds / 60)} min geleden`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} uur geleden`;
  return `${Math.floor(seconds / 86400)} dagen geleden`;
}

// ── Notification Item ─────────────────────────────────────────────────────────
function NotificationItem({
  notification,
  onRead,
  onDelete,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const meta = TYPE_META[notification.type];
  const Icon = meta.icon;

  return (
    <div
      className="relative flex items-start gap-3 px-5 py-4 transition-colors"
      style={{
        background: notification.isRead ? "#ffffff" : "#F7FAF7",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      {!notification.isRead && (
        <span
          className="absolute left-2 top-5 w-1.5 h-1.5 rounded-full"
          style={{ background: "#51C675" }}
        />
      )}

      <div
        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: meta.bg }}
      >
        <Icon size={18} color={meta.color} strokeWidth={1.75} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-sm leading-snug"
            style={{ color: "#122A1A", fontWeight: notification.isRead ? 400 : 600 }}
          >
            {notification.title}
          </p>
          <span className="text-[10px] flex-shrink-0 mt-0.5" style={{ color: "#9aada2" }}>
            {timeAgo(notification.createdAt)}
          </span>
        </div>
        <p className="text-xs mt-0.5 leading-relaxed line-clamp-2" style={{ color: "#7a8f82" }}>
          {notification.body}
        </p>
      </div>

      <div className="flex-shrink-0 flex flex-col gap-1">
        {!notification.isRead && (
          <button
            onClick={() => onRead(notification.id)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ background: "#EFF5EE" }}
            aria-label="Markeer als gelezen"
          >
            <Check size={12} color="#304C3A" />
          </button>
        )}
        <button
          onClick={() => onDelete(notification.id)}
          className="p-1.5 rounded-lg transition-colors"
          style={{ background: "#FEF2F2" }}
          aria-label="Verwijder"
        >
          <Trash2 size={12} color="#DC2626" />
        </button>
      </div>
    </div>
  );
}

// ── Filter tabs ───────────────────────────────────────────────────────────────
const FILTERS = [
  { key: "all",     label: "Alles"     },
  { key: "unread",  label: "Ongelezen" },
  { key: "updates", label: "Updates"   },
] as const;

type Filter = (typeof FILTERS)[number]["key"];

// ── Main component ────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setNotifications(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function handleRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async function handleDelete(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ readAll: true }),
    });
  }

  const filtered = notifications.filter((n) => {
    if (filter === "unread")  return !n.isRead;
    if (filter === "updates") return ["COMPLAINT_UPDATE", "ORDER_UPDATE", "BADGE_EARNED"].includes(n.type);
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-14 pb-5 border-b" style={{ borderColor: "#f0f0f0" }}>
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full -ml-1"
            style={{ background: "#f5f8f5" }}
            aria-label="Terug"
          >
            <ChevronLeft size={20} color="#304C3A" />
          </button>
          <h1 className="font-display text-2xl font-semibold flex-1" style={{ color: "#122A1A" }}>
            Notificaties
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-medium px-3 py-1.5 rounded-full"
              style={{ background: "#EFF5EE", color: "#304C3A" }}
            >
              Alles gelezen
            </button>
          )}
        </div>

        <div className="flex gap-2.5">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="px-4 py-2 rounded-full text-xs font-medium transition-all"
              style={
                filter === key
                  ? { background: "#304C3A", color: "#ffffff" }
                  : { background: "#f5f8f5", color: "#7a8f82" }
              }
            >
              {label}
              {key === "unread" && unreadCount > 0 && (
                <span
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px]"
                  style={{ background: "#51C675", color: "#ffffff" }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm" style={{ color: "#9aada2" }}>Laden…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "#EFF5EE" }}
            >
              <Bell size={28} color="#BDD2B7" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "#304C3A" }}>
                Geen notificaties
              </p>
              <p className="text-xs mt-1" style={{ color: "#9aada2" }}>
                {filter === "unread"
                  ? "Je hebt alles gelezen — goed bezig!"
                  : "Notificaties verschijnen hier zodra er iets te melden is."}
              </p>
            </div>
          </div>
        ) : (
          <div>
            {filtered.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={handleRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}