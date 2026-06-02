"use client";

import { useRouter } from "next/navigation";
import {
  ShoppingCart, BookOpen, BarChart2,
  ChevronRight, Settings, Package,
  Truck, CheckCircle2, Clock, XCircle, Calendar,
} from "lucide-react";
import NotificationBell from "@/components/dashboard/NotificationBell";

// ── Types ─────────────────────────────────────────────────────────────────────
type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

type RecentOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  expectedDelivery: string | null;
  totalAmount: string | null;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    unitPrice: string;
    product: { id: string; name: string; batchNumber: string | null; imageUrl: string | null };
  }[];
};

type Props = {
  firstName: string;
  recentOrders: RecentOrder[];
};

// ── Status metadata ───────────────────────────────────────────────────────────
const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PENDING:   { label: "In behandeling", color: "#D97706", bg: "#FEF3C7", icon: Clock        },
  CONFIRMED: { label: "Bevestigd",      color: "#2563EB", bg: "#EFF6FF", icon: CheckCircle2 },
  SHIPPED:   { label: "Onderweg",       color: "#7C3AED", bg: "#F5F3FF", icon: Truck        },
  DELIVERED: { label: "Bezorgd",        color: "#16A34A", bg: "#F0FDF4", icon: CheckCircle2 },
  CANCELLED: { label: "Geannuleerd",    color: "#DC2626", bg: "#FEF2F2", icon: XCircle      },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("nl-NL", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function primaryProduct(order: RecentOrder): string {
  if (order.items.length === 0) return "—";
  const first = order.items[0].product.name;
  return order.items.length > 1
    ? `${first} +${order.items.length - 1}`
    : first;
}

function orderTotal(order: RecentOrder): string {
  if (order.totalAmount) return parseFloat(order.totalAmount).toFixed(2);
  return order.items
    .reduce((sum, i) => sum + i.quantity * parseFloat(i.unitPrice), 0)
    .toFixed(2);
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardB2B({ firstName, recentOrders }: Props) {
  const router = useRouter();

  const TILES = [
    { label: "Catalogus",    href: "/dashboard/catalogus", icon: BookOpen,     bg: "#EFF5EE" },
    { label: "Bestellingen", href: "/dashboard/orders",    icon: ShoppingCart, bg: "#E8F2E8" },
    { label: "Analytics",    href: "/dashboard/analytics", icon: BarChart2,    bg: "#EFF5EE" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
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
              Welkom terug!
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

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Snelle acties */}
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-4 mt-2"
          style={{ color: "#7a8f82" }}
        >
          Snelle acties
        </h2>
        <div className="flex flex-col gap-3">
          {TILES.map(({ label, href, icon: Icon, bg }) => (
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
              <span className="font-medium text-sm flex-1" style={{ color: "#122A1A" }}>
                {label}
              </span>
              <ChevronRight size={16} color="#BDD2B7" />
            </button>
          ))}
        </div>

        {/* Recente bestellingen */}
        <div className="mt-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-base" style={{ color: "#122A1A" }}>
              Recente bestellingen
            </h2>
            {recentOrders.length > 0 && (
              <button
                onClick={() => router.push("/dashboard/orders")}
                className="text-xs font-medium"
                style={{ color: "#304C3A" }}
              >
                Alles zien
              </button>
            )}
          </div>

          {recentOrders.length === 0 ? (
            <div
              className="rounded-2xl p-6 flex flex-col items-center text-center"
              style={{ background: "#f5f8f5" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "#EFF5EE" }}
              >
                <Package size={20} color="#BDD2B7" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: "#304C3A" }}>
                Geen bestellingen
              </p>
              <p className="text-xs" style={{ color: "#9aada2" }}>
                Bestellingen verschijnen hier zodra je bestelt
              </p>
              <button
                onClick={() => router.push("/dashboard/orders/nieuw")}
                className="mt-4 text-xs font-semibold px-4 py-2 rounded-full"
                style={{ background: "#304C3A", color: "#fff", border: "none" }}
              >
                Eerste bestelling plaatsen
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recentOrders.map((order) => {
                const meta    = STATUS_META[order.status];
                const Icon    = meta.icon;
                const product = primaryProduct(order);
                const total   = orderTotal(order);

                return (
                  <button
                    key={order.id}
                    onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                    className="w-full text-left flex items-center gap-3 p-3.5 rounded-2xl active:scale-[0.99] transition-transform"
                    style={{ background: "#ffffff", border: "1.5px solid #f0f0f0" }}
                  >
                    {/* Status icon */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: meta.bg }}
                    >
                      <Icon size={16} color={meta.color} strokeWidth={2} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>
                        {product}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Calendar size={10} color="#9aada2" strokeWidth={1.75} />
                        <p className="text-xs" style={{ color: "#9aada2" }}>
                          {formatDate(order.expectedDelivery ?? order.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-sm font-semibold" style={{ color: "#304C3A" }}>
                        €{total}
                      </span>
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}