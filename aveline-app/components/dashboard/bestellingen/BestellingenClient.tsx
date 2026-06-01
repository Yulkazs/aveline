"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  ShoppingCart,
  Calendar,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: string; // Prisma Decimal wordt geserialiseerd als string
  product: {
    id: string;
    name: string;
    batchNumber: string | null;
    imageUrl: string | null;
  };
};

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  deliveryAddress: string | null;
  expectedDelivery: Date | string | null;
  totalAmount: string | null; // Prisma Decimal
  createdAt: Date | string;
  updatedAt: Date | string;
  items: OrderItem[];
};

type Props = { orders: Order[] };

// ── Status metadata ───────────────────────────────────────────────────────────
const STATUS_META: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  PENDING:   { label: "In behandeling", color: "#D97706", bg: "#FEF3C7", icon: Clock        },
  CONFIRMED: { label: "Bevestigd",      color: "#2563EB", bg: "#EFF6FF", icon: CheckCircle2 },
  SHIPPED:   { label: "Onderweg",       color: "#7C3AED", bg: "#F5F3FF", icon: Truck        },
  DELIVERED: { label: "Bezorgd",        color: "#16A34A", bg: "#F0FDF4", icon: CheckCircle2 },
  CANCELLED: { label: "Geannuleerd",    color: "#DC2626", bg: "#FEF2F2", icon: XCircle      },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function orderTotal(order: Order): string {
  if (order.totalAmount) return parseFloat(order.totalAmount).toFixed(2);
  const total = order.items.reduce(
    (sum, item) => sum + item.quantity * parseFloat(item.unitPrice),
    0
  );
  return total.toFixed(2);
}

function primaryProduct(order: Order): string {
  if (order.items.length === 0) return "—";
  const first = order.items[0].product.name;
  return order.items.length > 1
    ? `${first} + ${order.items.length - 1} ander(e)`
    : first;
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({
  status,
  small = false,
}: {
  status: OrderStatus;
  small?: boolean;
}) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${
        small ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"
      }`}
      style={{ background: m.bg, color: m.color }}
    >
      <Icon size={small ? 10 : 12} strokeWidth={2.5} />
      {m.label}
    </span>
  );
}

// ── Order card ────────────────────────────────────────────────────────────────
function OrderCard({
  order,
  onClick,
}: {
  order: Order;
  onClick: () => void;
}) {
  const total = orderTotal(order);
  const product = primaryProduct(order);
  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex flex-col gap-3 p-4 rounded-2xl active:scale-[0.99] transition-transform"
      style={{ background: "#ffffff", border: "1.5px solid #f0f0f0" }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>
            {product}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#9aada2" }}>
            {order.orderNumber}
          </p>
        </div>
        <StatusBadge status={order.status} small />
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 text-xs" style={{ color: "#7a8f82" }}>
        <span className="flex items-center gap-1">
          <Package size={12} strokeWidth={1.75} />
          {totalQty} {totalQty === 1 ? "doos" : "dozen"}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={12} strokeWidth={1.75} />
          {formatDate(order.expectedDelivery)}
        </span>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "#9aada2" }}>
          {formatDate(order.createdAt)}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: "#304C3A" }}>
            €{total}
          </span>
          <ChevronRight size={14} color="#BDD2B7" />
        </div>
      </div>
    </button>
  );
}

// ── Filter tabs ───────────────────────────────────────────────────────────────
const FILTERS = [
  { key: "all",       label: "Alles"       },
  { key: "active",    label: "Actief"      },
  { key: "delivered", label: "Bezorgd"     },
  { key: "cancelled", label: "Geannuleerd" },
] as const;

type Filter = (typeof FILTERS)[number]["key"];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BestellingenClient({ orders }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const filtered = orders.filter((o) => {
    const matchFilter =
      filter === "active"
        ? ["PENDING", "CONFIRMED", "SHIPPED"].includes(o.status)
        : filter === "delivered"
        ? o.status === "DELIVERED"
        : filter === "cancelled"
        ? o.status === "CANCELLED"
        : true;

    const q = search.toLowerCase();
    const matchSearch =
      q === "" ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.items.some((i) => i.product.name.toLowerCase().includes(q));

    return matchFilter && matchSearch;
  });

  const shippedCount   = orders.filter((o) => o.status === "SHIPPED").length;
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;
  const pendingCount   = orders.filter(
    (o) => o.status === "PENDING" || o.status === "CONFIRMED"
  ).length;
  const activeCount    = orders.filter((o) =>
    ["PENDING", "CONFIRMED", "SHIPPED"].includes(o.status)
  ).length;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-14 pb-4 bg-white">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1
              className="font-display text-2xl font-semibold"
              style={{ color: "#122A1A" }}
            >
              Bestellingen
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "#9aada2" }}>
              Voorraad & leverstatus
            </p>
          </div>
          {activeCount > 0 && (
            <span
              className="text-xs font-semibold px-2.5 py-1.5 rounded-full mt-1"
              style={{ background: "#EFF5EE", color: "#304C3A" }}
            >
              {activeCount} lopend
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            size={15}
            color="#9aada2"
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek op ordernummer of product…"
            className="input-field pl-10 py-2.5 text-sm"
          />
        </div>

        {/* Filter tabs */}
        <div
          className="flex gap-2 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
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

      {/* Summary stats */}
      <div className="flex-shrink-0 px-5 pb-4 grid grid-cols-3 gap-2">
        {[
          { label: "Onderweg",  value: shippedCount,   color: "#7C3AED", bg: "#F5F3FF" },
          { label: "Bezorgd",   value: deliveredCount, color: "#16A34A", bg: "#F0FDF4" },
          { label: "In verw.",  value: pendingCount,   color: "#2563EB", bg: "#EFF6FF" },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className="rounded-2xl p-3 flex flex-col"
            style={{ background: bg }}
          >
            <span
              className="text-xl font-semibold font-display"
              style={{ color }}
            >
              {value}
            </span>
            <span className="text-[10px] mt-0.5" style={{ color: "#7a8f82" }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "#EFF5EE" }}
            >
              <ShoppingCart size={24} color="#BDD2B7" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "#304C3A" }}>
                Geen bestellingen gevonden
              </p>
              <p className="text-xs mt-1" style={{ color: "#9aada2" }}>
                {search
                  ? "Geen resultaten voor deze zoekopdracht."
                  : "Bestellingen verschijnen hier zodra je bestelt."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => router.push(`/dashboard/orders/${order.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}