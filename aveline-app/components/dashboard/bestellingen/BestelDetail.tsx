"use client";

import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  MapPin,
  Calendar,
  Hash,
  Package,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: string;
  product: {
    id: string;
    name: string;
    batchNumber: string | null;
    imageUrl: string | null;
    cacaoPercentage: number | null;
    origin: string | null;
  };
};

type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  deliveryAddress: string | null;
  expectedDelivery: Date | string | null;
  totalAmount: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  items: OrderItem[];
};

type Props = {
  order: Order;
};


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

// Volgorde van statussen voor de timeline
const STEP_ORDER: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

const STEP_LABELS: Record<string, string> = {
  PENDING:   "Bestelling geplaatst",
  CONFIRMED: "Bevestigd door Avéline",
  SHIPPED:   "Onderweg naar jou",
  DELIVERED: "Bezorgd",
  CANCELLED: "Geannuleerd",
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

function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function orderTotal(order: Order): string {
  if (order.totalAmount) return parseFloat(order.totalAmount).toFixed(2);
  return order.items
    .reduce((sum, item) => sum + item.quantity * parseFloat(item.unitPrice), 0)
    .toFixed(2);
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: OrderStatus }) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
      style={{ background: m.bg, color: m.color }}
    >
      <Icon size={12} strokeWidth={2.5} />
      {m.label}
    </span>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────────
function OrderTimeline({ status }: { status: OrderStatus }) {
  const isCancelled  = status === "CANCELLED";
  const currentIdx   = STEP_ORDER.indexOf(status);

  // Bij annulering: toon alleen PENDING + CANCELLED
  const steps = isCancelled
    ? [
        { key: "PENDING",   done: true  },
        { key: "CANCELLED", done: true  },
      ]
    : STEP_ORDER.map((key, i) => ({
        key,
        done: i <= currentIdx,
      }));

  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, i) => {
        const isLast      = i === steps.length - 1;
        const isCancelStep = step.key === "CANCELLED";

        return (
          <div key={step.key} className="flex gap-3">
            {/* Dot + connecting line */}
            <div className="flex flex-col items-center">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                style={{
                  background: isCancelStep
                    ? "#FEF2F2"
                    : step.done
                    ? "#304C3A"
                    : "#f0f0f0",
                  border: `2px solid ${
                    isCancelStep ? "#DC2626" : step.done ? "#304C3A" : "#e0e0e0"
                  }`,
                }}
              >
                {isCancelStep ? (
                  <XCircle size={13} color="#DC2626" />
                ) : step.done ? (
                  <CheckCircle2 size={13} color="#51C675" />
                ) : (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: "#BDD2B7" }}
                  />
                )}
              </div>
              {!isLast && (
                <div
                  className="w-0.5 flex-1 min-h-[28px]"
                  style={{
                    background: step.done ? "#304C3A" : "#e0e0e0",
                    opacity: 0.35,
                  }}
                />
              )}
            </div>

            {/* Label */}
            <div className="pb-5 flex-1 min-w-0">
              <p
                className="text-sm font-medium"
                style={{
                  color: isCancelStep
                    ? "#DC2626"
                    : step.done
                    ? "#122A1A"
                    : "#BDD2B7",
                }}
              >
                {STEP_LABELS[step.key]}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BestelDetail({ order }: Props) {
  const router = useRouter();
  const total  = orderTotal(order);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
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
        <div className="flex-1 min-w-0">
          <h1
            className="font-display text-xl font-semibold truncate"
            style={{ color: "#122A1A" }}
          >
            {order.orderNumber}
          </h1>
          <p className="text-xs" style={{ color: "#9aada2" }}>
            Geplaatst op {formatDate(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

        {/* Producten */}
        <div className="flex flex-col gap-2">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#9aada2" }}
          >
            Producten
          </p>
          {order.items.map((item: OrderItem) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: "#EFF5EE" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                style={{ background: "rgba(48,76,58,0.12)" }}
              >
                🍫
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: "#122A1A" }}
                >
                  {item.product.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#7a8f82" }}>
                  {item.quantity} dozen · €
                  {parseFloat(item.unitPrice).toFixed(2)} / stuk
                </p>
                {item.product.batchNumber && (
                  <p className="text-[10px] mt-0.5" style={{ color: "#9aada2" }}>
                    Batch #{item.product.batchNumber}
                  </p>
                )}
              </div>
              <span
                className="text-sm font-semibold flex-shrink-0"
                style={{ color: "#304C3A" }}
              >
                €{(item.quantity * parseFloat(item.unitPrice)).toFixed(2)}
              </span>
            </div>
          ))}

          {/* Totaal */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-2xl"
            style={{ background: "#304C3A" }}
          >
            <span className="text-sm font-medium" style={{ color: "#BDD2B7" }}>
              Totaalbedrag
            </span>
            <span
              className="text-lg font-semibold font-display"
              style={{ color: "#ffffff" }}
            >
              €{total}
            </span>
          </div>
        </div>

        {/* Leverinformatie */}
        <div className="flex flex-col gap-2">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#9aada2" }}
          >
            Leverinformatie
          </p>
          {[
            {
              icon: Calendar,
              label: "Verwachte leverdatum",
              value: formatDate(order.expectedDelivery),
            },
            {
              icon: MapPin,
              label: "Afleveradres",
              value: order.deliveryAddress ?? "—",
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: "#f5f8f5" }}
            >
              <Icon
                size={15}
                color="#304C3A"
                strokeWidth={1.75}
                className="flex-shrink-0"
              />
              <span className="text-sm flex-1" style={{ color: "#7a8f82" }}>
                {label}
              </span>
              <span
                className="text-sm font-medium text-right max-w-[55%]"
                style={{ color: "#122A1A" }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Bezorgstatus timeline */}
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "#9aada2" }}
          >
            Bezorgstatus
          </p>
          <OrderTimeline status={order.status} />
        </div>

        {/* Bijgewerkt */}
        <p className="text-xs text-center pb-2" style={{ color: "#BDD2B7" }}>
          Bijgewerkt op {formatDateTime(order.updatedAt)}
        </p>
      </div>
    </div>
  );
}