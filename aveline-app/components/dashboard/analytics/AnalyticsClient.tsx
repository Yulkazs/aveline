"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, TrendingUp, ShoppingCart, Package } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: string;
  product: { id: string; name: string };
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string | null;
  createdAt: string;
  items: OrderItem[];
};

type Period = "30d" | "3m" | "1j";

// ── Helpers ───────────────────────────────────────────────────────────────────
function orderTotal(order: Order): number {
  if (order.totalAmount) return parseFloat(order.totalAmount);
  return order.items.reduce(
    (sum, i) => sum + i.quantity * parseFloat(i.unitPrice),
    0
  );
}

function periodStart(period: Period): Date {
  const now = new Date();
  if (period === "30d") return new Date(now.setDate(now.getDate() - 30));
  if (period === "3m")  return new Date(now.setMonth(now.getMonth() - 3));
  return new Date(now.setFullYear(now.getFullYear() - 1));
}

function monthLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("nl-NL", {
    month: "short", year: "2-digit",
  });
}

// ── Bar chart ─────────────────────────────────────────────────────────────────
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-1.5 h-32 w-full">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <div className="w-full flex items-end justify-center" style={{ height: 96 }}>
            <div
              className="w-full rounded-t-lg transition-all"
              style={{
                height:     `${Math.max((d.value / max) * 96, d.value > 0 ? 6 : 0)}px`,
                background: d.value > 0 ? "#304C3A" : "#f0f0f0",
                opacity:    d.value > 0 ? 1 : 1,
              }}
            />
          </div>
          <span
            className="text-[9px] truncate w-full text-center"
            style={{ color: "#9aada2" }}
          >
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  bg,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  bg: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: bg }}>
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(48,76,58,0.1)" }}
      >
        <Icon size={18} color={color} strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-2xl font-semibold font-display" style={{ color }}>
          {value}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "#7a8f82" }}>
          {label}
        </p>
        {sub && (
          <p className="text-[10px] mt-0.5" style={{ color: "#9aada2" }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AnalyticsClient({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("3m");

  const PERIODS: { key: Period; label: string }[] = [
    { key: "30d", label: "30 dagen" },
    { key: "3m",  label: "3 maanden" },
    { key: "1j",  label: "1 jaar" },
  ];

  // Filter orders op periode
  const filtered = useMemo(() => {
    const start = periodStart(period);
    return orders.filter((o) => new Date(o.createdAt) >= start);
  }, [orders, period]);

  // Stats
  const totalSpend    = filtered.reduce((s, o) => s + orderTotal(o), 0);
  const totalOrders   = filtered.length;

  // Meest bestelde producten
  const productTotals = useMemo(() => {
    const map = new Map<string, { name: string; qty: number }>();
    filtered.forEach((order) => {
      order.items.forEach((item) => {
        const existing = map.get(item.product.id);
        if (existing) {
          existing.qty += item.quantity;
        } else {
          map.set(item.product.id, { name: item.product.name, qty: item.quantity });
        }
      });
    });
    return [...map.values()]
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filtered]);

  const maxQty = Math.max(...productTotals.map((p) => p.qty), 1);

  // Bestellingen per maand voor grafiek
  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((o) => {
      const label = monthLabel(o.createdAt);
      map.set(label, (map.get(label) ?? 0) + 1);
    });

    // Zorg voor een continue reeks maanden
    const months: { label: string; value: number }[] = [];
    const count = period === "30d" ? 1 : period === "3m" ? 3 : 12;
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString("nl-NL", { month: "short", year: "2-digit" });
      months.push({ label, value: map.get(label) ?? 0 });
    }
    return months;
  }, [filtered, period]);

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
        <div>
          <h1 className="font-display text-xl font-semibold" style={{ color: "#122A1A" }}>
            Analytics
          </h1>
          <p className="text-xs" style={{ color: "#9aada2" }}>
            Inkoopoverzicht
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {/* Periode filter */}
        <div className="flex gap-2 mt-4 mb-5">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className="flex-1 text-xs font-medium py-2 rounded-full transition-all"
              style={
                period === key
                  ? { background: "#304C3A", color: "#ffffff", border: "none" }
                  : { background: "#f5f8f5", color: "#7a8f82", border: "none" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard
            icon={TrendingUp}
            label="Totaal besteed"
            value={`€${totalSpend.toFixed(2)}`}
            bg="#EFF5EE"
            color="#304C3A"
          />
          <StatCard
            icon={ShoppingCart}
            label="Bestellingen"
            value={String(totalOrders)}
            sub={totalOrders === 1 ? "bestelling" : "bestellingen"}
            bg="#F5F3FF"
            color="#5B21B6"
          />
        </div>

        {/* Grafiek: bestellingen per maand */}
        <div
          className="rounded-2xl p-4 mb-6"
          style={{ background: "#f5f8f5" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "#9aada2" }}
          >
            Bestellingen per maand
          </p>
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-xs" style={{ color: "#BDD2B7" }}>
                Geen data in deze periode
              </p>
            </div>
          ) : (
            <BarChart data={chartData} />
          )}
        </div>

        {/* Meest bestelde producten */}
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#9aada2" }}
          >
            Meest besteld
          </p>
          {productTotals.length === 0 ? (
            <div
              className="rounded-2xl p-5 flex flex-col items-center text-center"
              style={{ background: "#f5f8f5" }}
            >
              <Package size={20} color="#BDD2B7" strokeWidth={1.5} />
              <p className="text-xs mt-2" style={{ color: "#9aada2" }}>
                Geen bestellingen in deze periode
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {productTotals.map((product, i) => (
                <div
                  key={product.name}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: "#f5f8f5" }}
                >
                  {/* Rank */}
                  <span
                    className="text-xs font-semibold w-5 text-center flex-shrink-0"
                    style={{ color: i === 0 ? "#304C3A" : "#BDD2B7" }}
                  >
                    {i + 1}
                  </span>

                  {/* Bar + naam */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#122A1A" }}>
                      {product.name}
                    </p>
                    <div className="mt-1.5 h-1 rounded-full" style={{ background: "#e0e8e0" }}>
                      <div
                        className="h-1 rounded-full"
                        style={{
                          width:      `${(product.qty / maxQty) * 100}%`,
                          background: i === 0 ? "#304C3A" : "#BDD2B7",
                        }}
                      />
                    </div>
                  </div>

                  {/* Aantal */}
                  <span
                    className="text-sm font-semibold flex-shrink-0"
                    style={{ color: "#304C3A" }}
                  >
                    {product.qty}×
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}