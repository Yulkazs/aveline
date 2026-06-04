"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown, Check, ShoppingBag, Building2, Headphones, Megaphone,
  Home, QrCode, Package, MessageCircle, Users, User,
  BookOpen, ShoppingCart, BarChart2, AlertCircle, ChevronLeft,
  ChevronRight, Clock, CheckCircle2, Truck, XCircle, RefreshCw,
  Calendar, MapPin, Hash, Percent, Tag, Search, Send, Bot,
  Star, Wifi, FileText, LogOut, X, Lock, Settings, TrendingUp, Trophy, Bell
} from "lucide-react";

import DashboardB2C from "@/components/dashboard/DashboardB2C";
import DashboardB2B from "@/components/dashboard/DashboardB2B";
import DashboardCustomerService from "@/components/dashboard/DashboardCustomerService";
import DashboardMarketing from "@/components/dashboard/DashboardMarketing";

import {
  DEMO_PRODUCTS,
  DEMO_ORDERS,
  DEMO_ANALYTICS_ORDERS,
  DEMO_COMPLAINTS,
  DEMO_CHAT_SESSIONS_B2C,
  DEMO_CHAT_SESSIONS_CS,
  DEMO_COMMUNITY_POSTS,
  DEMO_PROMOTIONS,
} from "@/lib/demoData";

// ── Types ─────────────────────────────────────────────────────────────────────
type DemoRole = "B2C_CLIENT" | "B2B_CLIENT" | "CUSTOMER_SERVICE" | "MARKETING";
type DemoScreen =
  | "home" | "scan" | "producten" | "chat" | "community" | "profiel"
  | "catalogus" | "orders" | "analytics" | "klachten" | "promoties" | "notificaties"
  | "chat_detail" | "klacht_detail" | "order_detail" | "product_detail" | "post_detail" | "catalogus_detail";

type Props = {
  username: string;
  sessionCode: string;
  openComplaints: number;
  activeChats: number;
};

// ── Role config ───────────────────────────────────────────────────────────────
const ROLES: Array<{ key: DemoRole; label: string; icon: React.ElementType; description: string }> = [
  { key: "B2C_CLIENT",       label: "B2C Klant",      icon: ShoppingBag, description: "Soulaimane & Hamza" },
  { key: "B2B_CLIENT",       label: "B2B Klant",      icon: Building2,   description: "Omar"               },
  { key: "CUSTOMER_SERVICE", label: "Klantenservice", icon: Headphones,  description: "Esad"               },
  { key: "MARKETING",        label: "Marketing",      icon: Megaphone,   description: "Jessica"            },
];

type NavItem = { label: string; screen: DemoScreen; icon: React.ElementType };

const NAV_CONFIG: Record<DemoRole, NavItem[]> = {
  B2C_CLIENT: [
    { label: "Home",      screen: "home",      icon: Home          },
    { label: "Scan",      screen: "scan",      icon: QrCode        },
    { label: "Producten", screen: "producten", icon: Package       },
    { label: "Chat",      screen: "chat",      icon: MessageCircle },
    { label: "Community", screen: "community", icon: Users         },
    { label: "Profiel",   screen: "profiel",   icon: User          },
  ],
  B2B_CLIENT: [
    { label: "Home",      screen: "home",      icon: Home          },
    { label: "Catalogus", screen: "catalogus", icon: BookOpen      },
    { label: "Orders",    screen: "orders",    icon: ShoppingCart  },
    { label: "Analytics", screen: "analytics", icon: BarChart2     },
    { label: "Profiel",   screen: "profiel",   icon: User          },
  ],
  CUSTOMER_SERVICE: [
    { label: "Klachten",  screen: "klachten",  icon: AlertCircle   },
    { label: "Chat",      screen: "chat",      icon: MessageCircle },
    { label: "Community", screen: "community", icon: Users         },
    { label: "Profiel",   screen: "profiel",   icon: User          },
  ],
  MARKETING: [
    { label: "Home",      screen: "home",      icon: Home          },
    { label: "Promoties", screen: "promoties", icon: Megaphone     },
    { label: "Community", screen: "community", icon: Users         },
    { label: "Profiel",   screen: "profiel",   icon: User          },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60)    return "Zojuist";
  if (s < 3600)  return `${Math.floor(s / 60)} min geleden`;
  if (s < 86400) return `${Math.floor(s / 3600)} uur geleden`;
  return `${Math.floor(s / 86400)} dagen geleden`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}

// ── Bottom Nav ────────────────────────────────────────────────────────────────
function DemoBottomNav({ role, current, onChange }: {
  role: DemoRole; current: DemoScreen; onChange: (screen: DemoScreen) => void;
}) {
  const items = NAV_CONFIG[role];
  const rootScreens = items.map((i) => i.screen);

  return (
    <nav
      className="flex-shrink-0 border-t"
      style={{ background: "#ffffff", borderColor: "#e8ede9", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="flex items-stretch" role="list">
        {items.map(({ label, screen, icon: Icon }) => {
          const active = current === screen || (
            current === "chat_detail" && screen === "chat" ||
            current === "klacht_detail" && screen === "klachten" ||
            current === "order_detail" && screen === "orders" ||
            current === "product_detail" && screen === "producten" ||
            current === "catalogus_detail" && screen === "catalogus" ||
            current === "post_detail" && screen === "community"
          );
          return (
            <li key={screen} className="flex-1">
              <button
                onClick={() => onChange(screen)}
                className="flex flex-col items-center justify-center gap-1 py-3 w-full transition-opacity active:opacity-60"
                aria-current={active ? "page" : undefined}
              >
                <Icon size={22} strokeWidth={active ? 2 : 1.5} color={active ? "#304C3A" : "#9aada2"} />
                <span className="text-[10px] font-medium leading-none" style={{ color: active ? "#304C3A" : "#9aada2" }}>
                  {label}
                </span>
                {active && <span className="w-1 h-1 rounded-full" style={{ background: "#51C675" }} />}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ── Session ended overlay ─────────────────────────────────────────────────────
function SessionEndedOverlay({ sessionCode }: { sessionCode: string }) {
  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center px-8 text-center"
      style={{ background: "rgba(18,42,26,0.92)", backdropFilter: "blur(8px)" }}
    >
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6" style={{ background: "rgba(255,255,255,0.1)" }}>
        <span className="text-4xl">🍫</span>
      </div>
      <h1 className="font-display text-2xl font-semibold mb-3" style={{ color: "#ffffff" }}>
        Presentatie afgelopen
      </h1>
      <p className="text-sm leading-relaxed mb-2" style={{ color: "rgba(189,210,183,0.8)" }}>
        De presentator heeft sessie{" "}
        <span className="font-mono font-bold" style={{ color: "#51C675" }}>{sessionCode}</span>{" "}
        beëindigd.
      </p>
      <p className="text-xs" style={{ color: "rgba(189,210,183,0.5)" }}>Bedankt voor je deelname!</p>
    </div>
  );
}

// ── Role switcher ─────────────────────────────────────────────────────────────
function RoleSwitcher({ current, onChange }: { current: DemoRole; onChange: (role: DemoRole) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentRole = ROLES.find((r) => r.key === current)!;
  const CurrentIcon = currentRole.icon;

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
        style={{ background: open ? "#EFF5EE" : "#f5f8f5" }}
      >
        <CurrentIcon size={15} color="#304C3A" strokeWidth={1.75} />
        <span className="text-xs font-semibold" style={{ color: "#122A1A" }}>{currentRole.label}</span>
        <ChevronDown size={13} color="#9aada2" style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 200ms" }} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-60 rounded-2xl overflow-hidden border z-50"
          style={{ background: "#ffffff", borderColor: "#e8ede9", boxShadow: "0 8px 32px rgba(18,42,26,0.12)" }}
        >
          <div className="px-4 py-2.5 border-b" style={{ borderColor: "#f0f0f0" }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#9aada2" }}>Rol wisselen</p>
          </div>
          {ROLES.map((role) => {
            const active = role.key === current;
            const Icon = role.icon;
            return (
              <button
                key={role.key}
                onClick={() => { onChange(role.key); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{ background: active ? "#f5f8f5" : "#ffffff", borderBottom: "1px solid #f8f8f8" }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: active ? "#EFF5EE" : "#f5f8f5" }}>
                  <Icon size={15} color="#304C3A" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: active ? "#304C3A" : "#122A1A" }}>{role.label}</p>
                  <p className="text-[10px]" style={{ color: "#9aada2" }}>{role.description}</p>
                </div>
                {active && <Check size={14} color="#304C3A" className="flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DEMO SCHERMEN
// ══════════════════════════════════════════════════════════════════════════════

// ── Scan scherm ───────────────────────────────────────────────────────────────
function ScanScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-5 pb-20">
      <div className="w-24 h-24 rounded-3xl flex items-center justify-center" style={{ background: "#EFF5EE" }}>
        <QrCode size={40} color="#304C3A" strokeWidth={1.25} />
      </div>
      <div>
        <p className="text-base font-semibold mb-1" style={{ color: "#304C3A" }}>QR Scanner</p>
        <p className="text-sm leading-relaxed" style={{ color: "#9aada2" }}>
          Scan een QR-code op een Avéline product om informatie, recepten en gamification-punten te ontvangen.
        </p>
      </div>
      <div className="w-full rounded-2xl p-4 text-left" style={{ background: "#f5f8f5", border: "1.5px solid #e8ede9" }}>
        <p className="text-xs font-semibold mb-2" style={{ color: "#304C3A" }}>Wat gebeurt er na scannen?</p>
        {["Product details & certificeringen", "+10 gamification punten", "Persoonlijke aanbevelingen", "Klacht indienen optie"].map((item) => (
          <div key={item} className="flex items-center gap-2 py-1">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#51C675" }} />
            <span className="text-xs" style={{ color: "#7a8f82" }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Analytics scherm ─────────────────────────────────────────────────────────
function AnalyticsScreen() {
  const [period, setPeriod] = useState<"30d" | "3m" | "1j">("3m");

  const PERIODS = [
    { key: "30d" as const, label: "30 dagen" },
    { key: "3m"  as const, label: "3 maanden" },
    { key: "1j"  as const, label: "1 jaar" },
  ];

  // Filter orders op periode
  const cutoff = period === "30d"
    ? new Date(Date.now() - 30 * 86400000)
    : period === "3m"
    ? new Date(Date.now() - 90 * 86400000)
    : new Date(Date.now() - 365 * 86400000);

  const filtered = DEMO_ANALYTICS_ORDERS.filter(o => new Date(o.createdAt) >= cutoff);

  const totalSpend = filtered.reduce((s, o) => s + parseFloat(o.totalAmount), 0);
  const totalOrders = filtered.length;

  // Producttotalen
  const productMap = new Map<string, { name: string; qty: number }>();
  filtered.forEach(order => {
    order.items.forEach(item => {
      const ex = productMap.get(item.product.id);
      if (ex) ex.qty += item.quantity;
      else productMap.set(item.product.id, { name: item.product.name, qty: item.quantity });
    });
  });
  const topProducts = [...productMap.values()].sort((a, b) => b.qty - a.qty).slice(0, 4);
  const maxQty = Math.max(...topProducts.map(p => p.qty), 1);

  // Chart data (maanden)
  const monthCount = period === "30d" ? 1 : period === "3m" ? 3 : 12;
  const chartData: { label: string; value: number }[] = [];
  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleDateString("nl-NL", { month: "short", year: "2-digit" });
    const count = filtered.filter(o => {
      const od = new Date(o.createdAt);
      return od.toLocaleDateString("nl-NL", { month: "short", year: "2-digit" }) === label;
    }).length;
    chartData.push({ label, value: count });
  }
  const maxBar = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-shrink-0 flex items-center gap-3 px-5 pt-14 pb-4 border-b" style={{ borderColor: "#f0f0f0" }}>
        <h1 className="font-display text-xl font-semibold" style={{ color: "#122A1A" }}>Analytics</h1>
        <p className="text-xs ml-1" style={{ color: "#9aada2" }}>Inkoopoverzicht</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {/* Periode filter */}
        <div className="flex gap-2 mt-4 mb-5">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className="flex-1 text-xs font-medium py-2 rounded-full"
              style={period === key
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
          <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: "#EFF5EE" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(48,76,58,0.1)" }}>
              <TrendingUp size={18} color="#304C3A" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-2xl font-semibold font-display" style={{ color: "#304C3A" }}>€{totalSpend.toFixed(2)}</p>
              <p className="text-xs mt-0.5" style={{ color: "#7a8f82" }}>Totaal besteed</p>
            </div>
          </div>
          <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: "#F5F3FF" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(91,33,182,0.1)" }}>
              <ShoppingCart size={18} color="#5B21B6" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-2xl font-semibold font-display" style={{ color: "#5B21B6" }}>{totalOrders}</p>
              <p className="text-xs mt-0.5" style={{ color: "#7a8f82" }}>Bestellingen</p>
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="rounded-2xl p-4 mb-6" style={{ background: "#f5f8f5" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#9aada2" }}>
            Bestellingen per maand
          </p>
          <div className="flex items-end gap-1.5 h-32 w-full">
            {chartData.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <div className="w-full flex items-end justify-center" style={{ height: 96 }}>
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      height: `${Math.max((d.value / maxBar) * 96, d.value > 0 ? 6 : 0)}px`,
                      background: d.value > 0 ? "#304C3A" : "#f0f0f0",
                    }}
                  />
                </div>
                <span className="text-[9px] truncate w-full text-center" style={{ color: "#9aada2" }}>
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top producten */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#9aada2" }}>
            Meest besteld
          </p>
          <div className="flex flex-col gap-2">
            {topProducts.map((product, i) => (
              <div
                key={product.name}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: "#f5f8f5" }}
              >
                <span className="text-xs font-semibold w-5 text-center flex-shrink-0" style={{ color: i === 0 ? "#304C3A" : "#BDD2B7" }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#122A1A" }}>{product.name}</p>
                  <div className="mt-1.5 h-1 rounded-full" style={{ background: "#e0e8e0" }}>
                    <div
                      className="h-1 rounded-full"
                      style={{
                        width: `${(product.qty / maxQty) * 100}%`,
                        background: i === 0 ? "#304C3A" : "#BDD2B7",
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold flex-shrink-0" style={{ color: "#304C3A" }}>
                  {product.qty}×
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Profiel scherm ────────────────────────────────────────────────────────────
const DEMO_BADGES = [
  { type: "FIRST_SCAN",      name: "Eerste scan",        emoji: "🔍", earned: true,  earnedDaysAgo: 14 },
  { type: "FIRST_POST",      name: "Community starter",  emoji: "💬", earned: true,  earnedDaysAgo: 9  },
  { type: "LOYAL_CUSTOMER",  name: "Trouwe klant",       emoji: "🤝", earned: true,  earnedDaysAgo: 5  },
  { type: "PRODUCT_EXPLORER",name: "Product explorer",   emoji: "🏆", earned: false, earnedDaysAgo: 0  },
  { type: "COMMUNITY_STAR",  name: "Community ster",     emoji: "⭐", earned: false, earnedDaysAgo: 0  },
  { type: "FIRST_COMPLAINT", name: "Eerste klacht",      emoji: "📋", earned: false, earnedDaysAgo: 0  },
];

function ProfielScreen({ username }: { username: string }) {
  const [selectedBadge, setSelectedBadge] = useState<typeof DEMO_BADGES[0] | null>(null);
  const earnedCount = DEMO_BADGES.filter(b => b.earned).length;

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-14 pb-5 border-b" style={{ borderColor: "#f0f0f0" }}>
        <h1 className="font-display text-2xl font-semibold" style={{ color: "#122A1A" }}>Profiel</h1>
      </div>

      {/* Identiteitskaart */}
      <div className="mx-5 mt-5 mb-5 rounded-3xl overflow-hidden" style={{ background: "#304C3A" }}>
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-4 mb-5">
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.12)", color: "#BDD2B7" }}
            >
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold font-display" style={{ color: "#ffffff" }}>{username}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(189,210,183,0.7)" }}>B2C Klant · Lid sinds 2024</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#51C675", color: "#122A1A" }}>
                  ✓ Geverifieerd
                </span>
              </div>
            </div>
          </div>

          {/* Punten & badges samenvatting */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Punten",  value: "120" },
              { label: "Scans",   value: "12"  },
              { label: "Badges",  value: `${earnedCount}/${DEMO_BADGES.length}` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl py-2.5 flex flex-col items-center" style={{ background: "rgba(255,255,255,0.08)" }}>
                <span className="text-base font-semibold font-display" style={{ color: "#ffffff" }}>{value}</span>
                <span className="text-[10px] mt-0.5" style={{ color: "rgba(189,210,183,0.6)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instellingen */}
      <div className="px-5 mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#9aada2" }}>Account</p>
        <div className="flex flex-col gap-2">
          {[
            { icon: User,         label: "Persoonlijke gegevens", sub: "Naam, e-mail, adres"      },
            { icon: Bell,         label: "Notificaties",          sub: "Pushberichten & e-mail"   },
            { icon: Lock,         label: "Beveiliging",           sub: "Wachtwoord & privacy"     },
            { icon: Settings,     label: "Voorkeuren",            sub: "Taal, thema, eenheden"    },
          ].map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
              style={{ background: "#f5f8f5", border: "1.5px solid #e8ede9" }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EFF5EE" }}>
                <Icon size={16} color="#304C3A" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: "#122A1A" }}>{label}</p>
                <p className="text-[10px]" style={{ color: "#9aada2" }}>{sub}</p>
              </div>
              <ChevronRight size={14} color="#BDD2B7" />
            </div>
          ))}
        </div>
      </div>

      {/* Badge sectie */}
      <div className="px-5 mb-6">
        <div className="rounded-2xl p-4 flex items-center justify-between mb-4" style={{ background: "#304C3A" }}>
          <div className="flex items-center gap-3">
            <Star size={18} color="#51C675" fill="#51C675" />
            <div>
              <p className="text-xs" style={{ color: "rgba(189,210,183,0.8)" }}>Totaal punten</p>
              <p className="text-2xl font-semibold font-display" style={{ color: "#ffffff" }}>120</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: "rgba(189,210,183,0.8)" }}>Badges</p>
            <p className="text-2xl font-semibold font-display" style={{ color: "#BDD2B7" }}>
              {earnedCount}<span className="text-sm">/{DEMO_BADGES.length}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-base" style={{ color: "#122A1A" }}>Mijn Badges</h2>
          <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: "#EFF5EE", color: "#304C3A" }}>
            {earnedCount} verdiend
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {DEMO_BADGES.map((badge) => (
            <button
              key={badge.type}
              onClick={() => setSelectedBadge(badge)}
              className="flex flex-col items-center gap-2.5 p-4 rounded-2xl transition-all active:scale-95"
              style={{ background: badge.earned ? "#EFF5EE" : "#f5f5f5" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl relative"
                style={{ background: badge.earned ? "#304C3A" : "#e0e0e0", opacity: badge.earned ? 1 : 0.7 }}
              >
                {badge.earned
                  ? <span>{badge.emoji}</span>
                  : <Lock size={20} color="#aaaaaa" strokeWidth={1.75} />
                }
                {badge.earned && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white" style={{ background: "#51C675" }} />
                )}
              </div>
              <span className="text-xs font-medium text-center leading-snug w-full" style={{ color: badge.earned ? "#304C3A" : "#aaaaaa" }}>
                {badge.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Uitloggen */}
      <div className="px-5 mb-6">
        <button
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold"
          style={{ background: "#FEF2F2", color: "#DC2626", border: "1.5px solid #FECACA" }}
        >
          <LogOut size={15} strokeWidth={2} />
          Uitloggen
        </button>
      </div>

      {/* Badge detail sheet */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(18,42,26,0.5)" }}
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="w-full max-w-[430px] rounded-t-3xl overflow-hidden"
            style={{ background: "#ffffff" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative flex flex-col items-center pt-8 pb-6 px-6"
              style={{ background: selectedBadge.earned ? "#304C3A" : "#f0f0f0" }}
            >
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full" style={{ background: selectedBadge.earned ? "rgba(255,255,255,0.25)" : "#d0d0d0" }} />
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center mb-4"
                style={{ background: selectedBadge.earned ? "rgba(255,255,255,0.12)" : "#e0e0e0", fontSize: 44 }}
              >
                {selectedBadge.earned
                  ? <span>{selectedBadge.emoji}</span>
                  : <Lock size={36} color="#b0b0b0" strokeWidth={1.5} />
                }
              </div>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full mb-3"
                style={selectedBadge.earned ? { background: "#51C675", color: "#ffffff" } : { background: "#d8d8d8", color: "#888888" }}
              >
                {selectedBadge.earned ? "✓ Verdiend" : "Nog niet verdiend"}
              </span>
              <h2 className="font-display text-2xl font-semibold text-center" style={{ color: selectedBadge.earned ? "#ffffff" : "#aaaaaa" }}>
                {selectedBadge.name}
              </h2>
            </div>
            <div className="px-6 pt-5 pb-8">
              {selectedBadge.earned ? (
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-5" style={{ background: "#EFF5EE" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#304C3A" }}>
                    <Star size={16} color="#51C675" fill="#51C675" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "#304C3A" }}>Verdiend</p>
                    <p className="text-sm" style={{ color: "#5a6e62" }}>{selectedBadge.earnedDaysAgo} dagen geleden</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl mb-5" style={{ background: "#f5f8f5" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#e0e0e0" }}>
                    <Star size={16} color="#9aada2" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: "#304C3A" }}>Nog {earnedCount}/{DEMO_BADGES.length} badges verdiend</p>
                    <p className="text-sm leading-snug" style={{ color: "#7a8f82" }}>Blijf de app gebruiken om deze badge te verdienen.</p>
                  </div>
                </div>
              )}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: "#9aada2" }}>Voortgang badges</span>
                  <span className="text-xs font-semibold" style={{ color: "#304C3A" }}>{earnedCount}/{DEMO_BADGES.length}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#e8ede9" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(earnedCount / DEMO_BADGES.length) * 100}%`, background: "linear-gradient(90deg, #BDD2B7, #304C3A)" }}
                  />
                </div>
              </div>
              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white"
                style={{ background: "#304C3A" }}
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── B2C Chat schermen ─────────────────────────────────────────────────────────
function ChatB2CList({ onSelect }: { onSelect: (id: string) => void }) {
  const sessions = DEMO_CHAT_SESSIONS_B2C;
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-shrink-0 flex items-center justify-between px-5 pt-14 pb-5 border-b" style={{ borderColor: "#f0f0f0" }}>
        <div>
          <h1 className="font-display text-2xl font-semibold" style={{ color: "#122A1A" }}>Chats</h1>
          <p className="text-xs mt-0.5" style={{ color: "#9aada2" }}>Neem contact op met onze klantenservice</p>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#304C3A" }}>
          <span className="text-white text-xl font-light">+</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest px-5 pt-5 pb-2" style={{ color: "#9aada2" }}>Actief</p>
        {sessions.filter((s) => s.isActive).map((session) => {
          const lastMsg = session.messages[session.messages.length - 1];
          return (
            <button
              key={session.id}
              onClick={() => onSelect(session.id)}
              className="w-full flex items-start gap-3 px-5 py-4 active:scale-[0.99] transition-transform"
              style={{ borderBottom: "1px solid #f0f0f0", background: "#ffffff" }}
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#EFF5EE" }}>
                <MessageCircle size={20} color="#304C3A" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-sm font-semibold" style={{ color: "#122A1A" }}>Actief gesprek</span>
                  <span className="text-[10px] flex-shrink-0" style={{ color: "#9aada2" }}>{timeAgo(session.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#51C675" }} />
                  <span className="text-[10px] font-medium" style={{ color: "#51C675" }}>
                    {session.assignedAgent ? "Verbonden met medewerker" : "Wacht op medewerker"}
                  </span>
                </div>
                {lastMsg && (
                  <p className="text-xs truncate" style={{ color: "#7a8f82" }}>
                    {lastMsg.senderType === "bot" ? "Bot: " : lastMsg.senderType === "agent" ? "Medewerker: " : "Jij: "}
                    {lastMsg.content}
                  </p>
                )}
              </div>
              <ChevronRight size={14} color="#BDD2B7" className="flex-shrink-0 mt-1" />
            </button>
          );
        })}

        <p className="text-[10px] font-semibold uppercase tracking-widest px-5 pt-5 pb-2" style={{ color: "#9aada2" }}>Afgesloten</p>
        {sessions.filter((s) => !s.isActive).map((session) => {
          const lastMsg = session.messages[session.messages.length - 1];
          return (
            <button
              key={session.id}
              onClick={() => onSelect(session.id)}
              className="w-full flex items-start gap-3 px-5 py-4 active:scale-[0.99]"
              style={{ borderBottom: "1px solid #f0f0f0" }}
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#f5f5f5" }}>
                <MessageCircle size={20} color="#BDD2B7" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-sm font-semibold" style={{ color: "#122A1A" }}>Afgesloten gesprek</span>
                  <span className="text-[10px]" style={{ color: "#9aada2" }}>{timeAgo(session.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 size={11} color="#9aada2" />
                  <span className="text-[10px]" style={{ color: "#9aada2" }}>
                    Afgesloten · Beoordeling: {"⭐".repeat(session.rating ?? 0)}
                  </span>
                </div>
                {lastMsg && (
                  <p className="text-xs truncate" style={{ color: "#7a8f82" }}>
                    {lastMsg.senderType === "agent" ? "Medewerker: " : "Jij: "}{lastMsg.content}
                  </p>
                )}
              </div>
              <ChevronRight size={14} color="#BDD2B7" className="flex-shrink-0 mt-1" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChatB2CDetail({ sessionId, onBack }: { sessionId: string; onBack: () => void }) {
  const session = DEMO_CHAT_SESSIONS_B2C.find((s) => s.id === sessionId)!;
  const ended = !session.isActive;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-shrink-0 flex items-center gap-3 px-5 pt-14 pb-4 border-b" style={{ borderColor: "#f0f0f0" }}>
        <button onClick={onBack} className="p-2 rounded-full -ml-1" style={{ background: "#f5f8f5" }}>
          <ChevronLeft size={20} color="#304C3A" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-semibold" style={{ color: "#122A1A" }}>Klantenservice</h1>
          <p className="text-xs" style={{ color: ended ? "#DC2626" : "#51C675" }}>
            {ended ? "Gesprek beëindigd" : session.assignedAgent ? "Verbonden met medewerker" : "Wacht op medewerker…"}
          </p>
        </div>
        {!ended && (
          <div className="text-xs font-medium px-3 py-1.5 rounded-full border" style={{ color: "#9aada2", borderColor: "#e8ede9" }}>
            Demo modus
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4">
        {session.messages.map((msg) => {
          const isUser = msg.senderType === "user";
          const isBot = msg.senderType === "bot";
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
              {!isUser && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-1" style={{ background: isBot ? "#EFF5EE" : "#BDD2B7" }}>
                  {isBot ? <Bot size={14} color="#304C3A" /> : <span className="text-[10px] font-bold" style={{ color: "#304C3A" }}>CS</span>}
                </div>
              )}
              <div className={`max-w-[75%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                {!isUser && (
                  <span className="text-[10px] mb-1 px-1" style={{ color: "#9aada2" }}>
                    {isBot ? "Avéline Bot" : "Medewerker"}
                  </span>
                )}
                <div
                  className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                  style={
                    isUser
                      ? { background: "#304C3A", color: "#ffffff", borderBottomRightRadius: 6 }
                      : { background: "#f5f8f5", color: "#122A1A", borderBottomLeftRadius: 6 }
                  }
                >
                  {msg.content}
                </div>
                <span className="text-[10px] mt-1 px-1" style={{ color: "#BDD2B7" }}>{formatTime(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-t" style={{ borderColor: "#f0f0f0", background: "#f9f9f9" }}>
        <div className="flex-1 relative">
          <input
            placeholder="Demo modus — lezen alleen"
            disabled
            className="input-field py-2.5 text-sm"
            style={{ background: "#f5f5f5", color: "#BDD2B7" }}
          />
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#E8EDE9" }}>
          <Send size={16} color="#BDD2B7" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

// ── CS Chat schermen ──────────────────────────────────────────────────────────
function ChatCSList({ onSelect }: { onSelect: (id: string) => void }) {
  const sessions = DEMO_CHAT_SESSIONS_CS;
  const [filter, setFilter] = useState<"waiting" | "active" | "closed" | "all">("waiting");
  const waitingCount = sessions.filter((s) => s.isActive && !s.assignedAgent).length;

  const filtered = sessions.filter((s) => {
    if (filter === "waiting") return s.isActive && !s.assignedAgent;
    if (filter === "active")  return s.isActive && !!s.assignedAgent;
    if (filter === "closed")  return !s.isActive;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-shrink-0 px-5 pt-14 pb-4 border-b" style={{ borderColor: "#f0f0f0" }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="font-display text-2xl font-semibold" style={{ color: "#122A1A" }}>Live Chat</h1>
            <p className="text-xs mt-0.5" style={{ color: "#9aada2" }}>Klantenservice gesprekken</p>
          </div>
          {waitingCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "#FEF3C7" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#D97706" }} />
              <span className="text-xs font-semibold" style={{ color: "#D97706" }}>{waitingCount} wachtend</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {(["waiting", "active", "closed", "all"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="flex-shrink-0 text-xs font-medium px-3.5 py-2 rounded-full transition-all"
              style={filter === key ? { background: "#304C3A", color: "#ffffff" } : { background: "#f5f8f5", color: "#7a8f82" }}
            >
              {key === "waiting" ? "Wachtend" : key === "active" ? "Actief" : key === "closed" ? "Gesloten" : "Alles"}
              {key === "waiting" && waitingCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px]" style={{ background: "#D97706", color: "#ffffff" }}>
                  {waitingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((session) => {
          const lastMsg = session.messages[session.messages.length - 1];
          const name = [session.user.firstName, session.user.lastName].filter(Boolean).join(" ");
          return (
            <button
              key={session.id}
              onClick={() => onSelect(session.id)}
              className="w-full flex items-start gap-3 px-5 py-4 active:scale-[0.99]"
              style={{ borderBottom: "1px solid #f0f0f0" }}
            >
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold"
                  style={{ background: "#BDD2B7", color: "#304C3A" }}
                >
                  {name.charAt(0).toUpperCase()}
                </div>
                {session.isActive && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white" style={{ background: "#51C675" }} />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>{name}</span>
                  <span className="text-[10px] flex-shrink-0" style={{ color: "#9aada2" }}>{timeAgo(session.createdAt)}</span>
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
                    {lastMsg.senderType === "agent" ? "Jij: " : "Klant: "}{lastMsg.content}
                  </p>
                )}
              </div>
              <ChevronRight size={14} color="#BDD2B7" className="flex-shrink-0 mt-1" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChatCSDetail({ sessionId, onBack }: { sessionId: string; onBack: () => void }) {
  const session = DEMO_CHAT_SESSIONS_CS.find((s) => s.id === sessionId)!;
  const [tab, setTab] = useState<"chat" | "klant">("chat");
  const name = [session.user.firstName, session.user.lastName].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-shrink-0 flex items-center gap-3 px-4 pt-14 pb-3 border-b" style={{ borderColor: "#f0f0f0" }}>
        <button onClick={onBack} className="p-2 rounded-full -ml-1" style={{ background: "#f5f8f5" }}>
          <ChevronLeft size={20} color="#304C3A" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>{name}</h1>
          <div className="flex items-center gap-1.5">
            {session.isActive
              ? <><span className="w-1.5 h-1.5 rounded-full" style={{ background: "#51C675" }} /><span className="text-[10px]" style={{ color: "#51C675" }}>Actief gesprek</span></>
              : <><CheckCircle2 size={11} color="#16A34A" /><span className="text-[10px]" style={{ color: "#16A34A" }}>Gesprek gesloten</span></>
            }
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 flex border-b gap-4 px-4 mt-6" style={{ borderColor: "#f0f0f0" }}>
        {(["chat", "klant"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="pb-3 text-xs font-medium relative"
            style={{ color: tab === t ? "#304C3A" : "#9aada2" }}
          >
            {t === "chat" ? "Chat" : "Klantinfo"}
            {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: "#51C675" }} />}
          </button>
        ))}
      </div>

      {tab === "chat" && (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4">
            {session.messages.map((msg) => {
              const isAgent = msg.senderType === "agent";
              const isBot = msg.senderType === "bot";
              return (
                <div key={msg.id} className={`flex items-end gap-2 ${isAgent ? "justify-end" : "justify-start"}`}>
                  {!isAgent && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-1 text-[10px] font-bold"
                      style={{ background: isBot ? "#EFF5EE" : "#BDD2B7", color: "#304C3A" }}
                    >
                      {isBot ? "B" : "K"}
                    </div>
                  )}
                  <div className={`max-w-[72%] flex flex-col ${isAgent ? "items-end" : "items-start"}`}>
                    {!isAgent && (
                      <span className="text-[10px] mb-1 px-1" style={{ color: "#9aada2" }}>{isBot ? "Bot" : "Klant"}</span>
                    )}
                    <div
                      className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                      style={
                        isAgent
                          ? { background: "#304C3A", color: "#ffffff", borderBottomRightRadius: 6 }
                          : isBot
                          ? { background: "#EFF5EE", color: "#304C3A", borderBottomLeftRadius: 6 }
                          : { background: "#f5f8f5", color: "#122A1A", borderBottomLeftRadius: 6 }
                      }
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] mt-1 px-1" style={{ color: "#BDD2B7" }}>{formatTime(msg.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div
            className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-t"
            style={{ borderColor: "#f0f0f0", background: "#f9f9f9" }}
          >
            <div className="flex-1">
              <input placeholder="Demo modus — lezen alleen" disabled className="input-field py-2.5 text-sm" style={{ background: "#f5f5f5", color: "#BDD2B7" }} />
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#E8EDE9" }}>
              <Send size={15} color="#BDD2B7" strokeWidth={2} />
            </div>
          </div>
        </>
      )}

      {tab === "klant" && (
        <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3">
          <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: "#EFF5EE" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold" style={{ background: "#BDD2B7", color: "#304C3A" }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: "#122A1A" }}>{name}</p>
              <p className="text-xs truncate" style={{ color: "#7a8f82" }}>{session.user.email}</p>
              <p className="text-[10px] mt-0.5 font-medium" style={{ color: "#51C675" }}>{session.user.points} punten</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Scans",    value: session.user._count.scans },
              { label: "Posts",    value: session.user._count.communityPosts },
              { label: "Klachten", value: session.user._count.complaints },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center py-2.5 rounded-xl" style={{ background: "#f5f8f5" }}>
                <span className="text-base font-semibold font-display" style={{ color: "#304C3A" }}>{value}</span>
                <span className="text-[10px]" style={{ color: "#9aada2" }}>{label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: "#f5f8f5" }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: "#7a8f82" }}>
              <Clock size={12} strokeWidth={1.75} /> Gestart
            </div>
            <span className="text-xs font-medium" style={{ color: "#122A1A" }}>{formatTime(session.createdAt)}</span>
          </div>
          {session.rating && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: "#f5f8f5" }}>
              <div className="flex items-center gap-2 text-xs" style={{ color: "#7a8f82" }}>
                <Star size={12} /> Beoordeling
              </div>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={10} color="#CA8A04" fill={s <= session.rating! ? "#CA8A04" : "none"} strokeWidth={1.5} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Klachten schermen ─────────────────────────────────────────────────────────
const STATUS_KLACHT: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  NEW:         { label: "Nieuw",          color: "#D97706", bg: "#FEF3C7", icon: AlertCircle  },
  IN_PROGRESS: { label: "In behandeling", color: "#2563EB", bg: "#EFF6FF", icon: RefreshCw    },
  RESOLVED:    { label: "Opgelost",       color: "#16A34A", bg: "#F0FDF4", icon: CheckCircle2 },
  REFUNDED:    { label: "Teruggestort",   color: "#7C3AED", bg: "#F5F3FF", icon: CheckCircle2 },
};

const PRIORITY_KLACHT: Record<string, { label: string; color: string; dot: string }> = {
  HIGH:   { label: "Hoog",   color: "#DC2626", dot: "#EF4444" },
  MEDIUM: { label: "Midden", color: "#D97706", dot: "#F59E0B" },
  LOW:    { label: "Laag",   color: "#16A34A", dot: "#22C55E" },
};

const TYPE_LABELS: Record<string, string> = {
  MELT_DAMAGE:       "Smeltschade",
  BREAK_DAMAGE:      "Breukschade",
  TEXTURE_DEVIATION: "Afwijkende structuur",
  OTHER:             "Overig",
};

function KlachtenList({ onSelect }: { onSelect: (id: string) => void }) {
  const [filter, setFilter] = useState<"open" | "progress" | "closed" | "all">("open");
  const complaints = DEMO_COMPLAINTS;
  const openCount = complaints.filter((c) => c.status === "NEW").length;

  const filtered = complaints.filter((c) =>
    filter === "open"     ? c.status === "NEW" :
    filter === "progress" ? c.status === "IN_PROGRESS" :
    filter === "closed"   ? ["RESOLVED", "REFUNDED"].includes(c.status) : true
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-shrink-0 px-5 pt-14 pb-4 bg-white">
        <div className="flex items-center gap-3 mb-5">
          <h1 className="font-display text-2xl font-semibold flex-1" style={{ color: "#122A1A" }}>Klachten</h1>
          {openCount > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "#FEF3C7", color: "#D97706" }}>
              {openCount} nieuw
            </span>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto mb-4" style={{ scrollbarWidth: "none" }}>
          {(["open", "progress", "closed", "all"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="flex-shrink-0 text-xs font-medium px-3.5 py-2 rounded-full"
              style={filter === key ? { background: "#304C3A", color: "#ffffff" } : { background: "#f5f8f5", color: "#7a8f82" }}
            >
              {key === "open" ? "Open" : key === "progress" ? "Actief" : key === "closed" ? "Gesloten" : "Alles"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="flex flex-col gap-3 pt-1">
          {filtered.map((c) => {
            const status = STATUS_KLACHT[c.status];
            const priority = PRIORITY_KLACHT[c.priority];
            const StatusIcon = status.icon;
            const name = [c.user.firstName, c.user.lastName].filter(Boolean).join(" ");
            return (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className="w-full text-left flex flex-col gap-3 p-4 rounded-2xl active:scale-[0.99] transition-transform"
                style={{ background: "#ffffff", border: "1.5px solid #f0f0f0" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5" style={{ background: priority.dot }} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>{name}</p>
                      <p className="text-xs" style={{ color: "#9aada2" }}>{c.referenceNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full" style={{ background: status.bg, color: status.color }}>
                      <StatusIcon size={10} strokeWidth={2.5} />{status.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "#EFF5EE", color: "#304C3A" }}>
                    {c.product.name}
                  </span>
                  <span className="text-xs" style={{ color: "#9aada2" }}>{TYPE_LABELS[c.type]}</span>
                </div>
                <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#7a8f82" }}>{c.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KlachtDetailScreen({ klachtId, onBack }: { klachtId: string; onBack: () => void }) {
  const c = DEMO_COMPLAINTS.find((k) => k.id === klachtId)!;
  const status = STATUS_KLACHT[c.status];
  const priority = PRIORITY_KLACHT[c.priority];
  const StatusIcon = status.icon;
  const name = [c.user.firstName, c.user.lastName].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-shrink-0 px-5 pt-14 pb-4 border-b" style={{ borderColor: "#f0f0f0" }}>
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="p-2 rounded-full -ml-1" style={{ background: "#f5f8f5" }}>
            <ChevronLeft size={20} color="#304C3A" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-semibold truncate" style={{ color: "#122A1A" }}>{c.referenceNumber}</h1>
            <p className="text-xs" style={{ color: "#9aada2" }}>{TYPE_LABELS[c.type]}</p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: status.bg, color: status.color }}>
              <StatusIcon size={11} strokeWidth={2.5} />{status.label}
            </span>
            <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: priority.color + "15", color: priority.color }}>
              {priority.label}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
        {/* Klant */}
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "#EFF5EE" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold" style={{ background: "#BDD2B7", color: "#304C3A" }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: "#122A1A" }}>{name}</p>
            <p className="text-xs" style={{ color: "#7a8f82" }}>{c.user.email}</p>
            <p className="text-[10px] font-medium mt-0.5" style={{ color: "#51C675" }}>{c.user.points} punten</p>
          </div>
        </div>

        {/* Product */}
        <div className="rounded-2xl p-4" style={{ background: "#f5f8f5" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#9aada2" }}>Product</p>
          <p className="text-sm font-semibold" style={{ color: "#122A1A" }}>{c.product.name}</p>
          <div className="flex flex-wrap gap-3 mt-1.5 text-xs" style={{ color: "#7a8f82" }}>
            {c.product.batchNumber && <span>Batch #{c.product.batchNumber}</span>}
            {c.product.origin && <span>🌍 {c.product.origin}</span>}
            {c.product.cacaoPercentage != null && <span>🍫 {c.product.cacaoPercentage}% cacao</span>}
          </div>
        </div>

        {/* Omschrijving */}
        <div className="rounded-2xl p-4" style={{ background: "#f5f8f5" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#9aada2" }}>Omschrijving</p>
          <p className="text-sm leading-relaxed" style={{ color: "#304C3A" }}>{c.description}</p>
        </div>

        {/* Geschiedenis */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#9aada2" }}>Geschiedenis</p>
          <div className="flex flex-col gap-2">
            {c.statusHistory.map((h, i) => {
              const hMeta = STATUS_KLACHT[h.status];
              const HIcon = hMeta.icon;
              return (
                <div key={h.id} className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: i === 0 ? hMeta.bg : "#f5f8f5" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: i === 0 ? hMeta.color : "#e0e0e0" }}>
                    <HIcon size={14} color={i === 0 ? "#fff" : "#9aada2"} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold" style={{ color: hMeta.color }}>{hMeta.label}</span>
                      <span className="text-[10px]" style={{ color: "#9aada2" }}>{formatDate(h.changedAt.toString())}</span>
                    </div>
                    {h.note && <p className="text-xs mt-1 leading-relaxed" style={{ color: "#7a8f82" }}>{h.note}</p>}
                    {h.changedBy && <p className="text-[10px] mt-1" style={{ color: "#BDD2B7" }}>door {h.changedBy}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Read-only notice */}
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "#FEF3C7" }}>
          <span className="text-lg">🔒</span>
          <p className="text-xs" style={{ color: "#92400E" }}>
            Demo modus — statuswijzigingen zijn niet beschikbaar. In de echte app kan Esad de status bijwerken en notities toevoegen.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Community schermen ────────────────────────────────────────────────────────
function CommunityList({ onSelect }: { onSelect: (id: string) => void }) {
  const posts = DEMO_COMMUNITY_POSTS;
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-shrink-0 flex items-center justify-between px-5 pt-14 pb-4 border-b" style={{ borderColor: "#f0f0f0" }}>
        <div>
          <h1 className="font-display text-2xl font-semibold" style={{ color: "#122A1A" }}>Community</h1>
          <p className="text-xs mt-0.5" style={{ color: "#9aada2" }}>{posts.length} berichten</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "#EFF5EE" }}>
          <Users size={14} color="#304C3A" />
          <span className="text-xs font-medium" style={{ color: "#304C3A" }}>3 leden actief</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {posts.map((post) => {
          const authorName = [post.user.firstName, post.user.lastName].filter(Boolean).join(" ");
          return (
            <button
              key={post.id}
              onClick={() => onSelect(post.id)}
              className="w-full text-left p-4 rounded-2xl active:scale-[0.99] transition-transform"
              style={{ background: "#ffffff", border: `1.5px solid ${post.isPinned ? "#BDD2B7" : "#f0f0f0"}` }}
            >
              {post.isPinned && (
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#EFF5EE", color: "#304C3A" }}>📌 Vastgepind</span>
                </div>
              )}
              {post.title && (
                <p className="text-sm font-semibold mb-1" style={{ color: "#122A1A" }}>{post.title}</p>
              )}
              <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "#7a8f82" }}>{post.content}</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: "#BDD2B7", color: "#304C3A" }}>
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[11px]" style={{ color: "#9aada2" }}>{authorName}</span>
                </div>
                <span className="text-[10px]" style={{ color: "#BDD2B7" }}>·</span>
                <span className="text-[10px]" style={{ color: "#9aada2" }}>{timeAgo(post.createdAt)}</span>
                <span className="ml-auto flex items-center gap-1 text-[11px]" style={{ color: "#9aada2" }}>
                  <MessageCircle size={11} strokeWidth={1.75} />
                  {post._count.comments}
                </span>
                <ChevronRight size={14} color="#BDD2B7" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PostDetailScreen({ postId, onBack }: { postId: string; onBack: () => void }) {
  const post = DEMO_COMMUNITY_POSTS.find((p) => p.id === postId)!;
  const authorName = [post.user.firstName, post.user.lastName].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-shrink-0 flex items-center gap-3 px-5 pt-14 pb-4 border-b" style={{ borderColor: "#f0f0f0" }}>
        <button onClick={onBack} className="p-2 rounded-full -ml-1" style={{ background: "#f5f8f5" }}>
          <ChevronLeft size={20} color="#304C3A" />
        </button>
        <h1 className="font-display text-xl font-semibold flex-1 truncate" style={{ color: "#122A1A" }}>
          {post.title ?? "Bericht"}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
        {/* Post */}
        <div className="rounded-2xl p-4" style={{ background: "#f5f8f5" }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#BDD2B7", color: "#304C3A" }}>
              {authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#122A1A" }}>{authorName}</p>
              <p className="text-[10px]" style={{ color: "#9aada2" }}>{timeAgo(post.createdAt)}</p>
            </div>
          </div>
          {post.title && <p className="text-base font-semibold mb-2" style={{ color: "#122A1A" }}>{post.title}</p>}
          <p className="text-sm leading-relaxed" style={{ color: "#304C3A" }}>{post.content}</p>
        </div>

        {/* Comments */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#9aada2" }}>
            {post.comments.length} reactie{post.comments.length !== 1 ? "s" : ""}
          </p>
          <div className="flex flex-col gap-3">
            {post.comments.map((comment) => {
              const cName = [comment.user.firstName, comment.user.lastName].filter(Boolean).join(" ");
              return (
                <div key={comment.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5" style={{ background: "#EFF5EE", color: "#304C3A" }}>
                    {cName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 bg-white rounded-2xl px-4 py-3" style={{ border: "1.5px solid #f0f0f0" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold" style={{ color: "#122A1A" }}>{cName}</span>
                      <span className="text-[10px]" style={{ color: "#BDD2B7" }}>{timeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "#304C3A" }}>{comment.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Read-only */}
        <div className="rounded-2xl p-3 flex items-center gap-2" style={{ background: "#f5f8f5" }}>
          <span className="text-sm">💬</span>
          <p className="text-xs" style={{ color: "#9aada2" }}>Demo modus — reageren is niet beschikbaar.</p>
        </div>
      </div>
    </div>
  );
}

// ── Promoties scherm ──────────────────────────────────────────────────────────
const PROMO_STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  DRAFT:     { label: "Concept",   color: "#7a8f82", bg: "#f5f8f5",  icon: FileText     },
  SCHEDULED: { label: "Gepland",   color: "#2563EB", bg: "#EFF6FF",  icon: Clock        },
  SENT:      { label: "Verstuurd", color: "#16A34A", bg: "#F0FDF4",  icon: CheckCircle2 },
};

function PromotiesScreen() {
  const [filter, setFilter] = useState<"all" | "DRAFT" | "SCHEDULED" | "SENT">("all");
  const promoties = DEMO_PROMOTIONS;
  const filtered = promoties.filter((p) => filter === "all" || p.status === filter);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-shrink-0 px-5 pt-14 pb-4">
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-display text-2xl font-semibold" style={{ color: "#122A1A" }}>Promoties</h1>
          <div className="flex gap-2">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "#EFF6FF", color: "#2563EB" }}>
              {promoties.filter((p) => p.status === "SCHEDULED").length} gepland
            </span>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {(["all", "DRAFT", "SCHEDULED", "SENT"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="flex-shrink-0 text-xs font-medium px-3.5 py-2 rounded-full"
              style={filter === key ? { background: "#304C3A", color: "#ffffff" } : { background: "#f5f8f5", color: "#7a8f82" }}
            >
              {key === "all" ? "Alles" : key === "DRAFT" ? "Concept" : key === "SCHEDULED" ? "Gepland" : "Verstuurd"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col gap-3">
        {filtered.map((p) => {
          const meta = PROMO_STATUS_META[p.status];
          const StatusIcon = meta.icon;
          return (
            <div key={p.id} className="rounded-2xl p-4 flex flex-col gap-3" style={{ border: "1.5px solid #f0f0f0" }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>{p.title}</p>
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "#7a8f82" }}>{p.body}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full flex-shrink-0" style={{ background: meta.bg, color: meta.color }}>
                  <StatusIcon size={10} strokeWidth={2} />{meta.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.discountCode && (
                  <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg" style={{ background: "#EFF5EE", color: "#304C3A" }}>
                    {p.discountCode}
                  </span>
                )}
                {p.targetSegment && (
                  <span className="text-[10px] font-medium px-2 py-1 rounded-lg" style={{ background: "#f5f8f5", color: "#7a8f82" }}>
                    {p.targetSegment === "all" ? "Alle klanten" : p.targetSegment === "b2c" ? "B2C klanten" : "Zakelijke klanten"}
                  </span>
                )}
                {p.scheduledAt && p.status === "SCHEDULED" && (
                  <span className="text-[10px] font-medium px-2 py-1 rounded-lg" style={{ background: "#EFF6FF", color: "#2563EB" }}>
                    📅 {formatDate(p.scheduledAt.toString())}
                  </span>
                )}
                {p.sentAt && (
                  <span className="text-[10px]" style={{ color: "#BDD2B7" }}>Verstuurd {timeAgo(p.sentAt.toString())}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── B2B Orders schermen ───────────────────────────────────────────────────────
const ORDER_STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PENDING:   { label: "In behandeling", color: "#D97706", bg: "#FEF3C7", icon: Clock        },
  CONFIRMED: { label: "Bevestigd",      color: "#2563EB", bg: "#EFF6FF", icon: CheckCircle2 },
  SHIPPED:   { label: "Onderweg",       color: "#7C3AED", bg: "#F5F3FF", icon: Truck        },
  DELIVERED: { label: "Bezorgd",        color: "#16A34A", bg: "#F0FDF4", icon: CheckCircle2 },
  CANCELLED: { label: "Geannuleerd",    color: "#DC2626", bg: "#FEF2F2", icon: XCircle      },
};

function OrdersList({ onSelect }: { onSelect: (id: string) => void }) {
  const orders = DEMO_ORDERS;
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-shrink-0 px-5 pt-14 pb-4 border-b" style={{ borderColor: "#f0f0f0" }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="font-display text-2xl font-semibold" style={{ color: "#122A1A" }}>Bestellingen</h1>
            <p className="text-xs mt-0.5" style={{ color: "#9aada2" }}>Voorraad & leverstatus</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1.5 rounded-full mt-1" style={{ background: "#EFF5EE", color: "#304C3A" }}>
            {orders.filter((o) => ["PENDING","CONFIRMED","SHIPPED"].includes(o.status)).length} lopend
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Onderweg",  value: orders.filter((o) => o.status === "SHIPPED").length,   color: "#7C3AED", bg: "#F5F3FF" },
            { label: "Bezorgd",   value: orders.filter((o) => o.status === "DELIVERED").length, color: "#16A34A", bg: "#F0FDF4" },
            { label: "In verw.",  value: orders.filter((o) => ["PENDING","CONFIRMED"].includes(o.status)).length, color: "#2563EB", bg: "#EFF6FF" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="rounded-2xl p-3 flex flex-col" style={{ background: bg }}>
              <span className="text-xl font-semibold font-display" style={{ color }}>{value}</span>
              <span className="text-[10px] mt-0.5" style={{ color: "#7a8f82" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {orders.map((order) => {
          const meta = ORDER_STATUS_META[order.status];
          const Icon = meta.icon;
          const firstItem = order.items[0];
          const productLabel = order.items.length > 1
            ? `${firstItem.product.name} +${order.items.length - 1}`
            : firstItem.product.name;
          return (
            <button
              key={order.id}
              onClick={() => onSelect(order.id)}
              className="w-full text-left flex items-center gap-3 p-3.5 rounded-2xl active:scale-[0.99] transition-transform"
              style={{ background: "#ffffff", border: "1.5px solid #f0f0f0" }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.bg }}>
                <Icon size={16} color={meta.color} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>{productLabel}</p>
                <p className="text-xs mt-0.5" style={{ color: "#9aada2" }}>{order.orderNumber}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-sm font-semibold" style={{ color: "#304C3A" }}>€{parseFloat(order.totalAmount).toFixed(2)}</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OrderDetailScreen({ orderId, onBack }: { orderId: string; onBack: () => void }) {
  const order = DEMO_ORDERS.find((o) => o.id === orderId)!;
  const meta = ORDER_STATUS_META[order.status];
  const StatusIcon = meta.icon;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-shrink-0 flex items-center gap-3 px-5 pt-14 pb-4 border-b" style={{ borderColor: "#f0f0f0" }}>
        <button onClick={onBack} className="p-2 rounded-full -ml-1" style={{ background: "#f5f8f5" }}>
          <ChevronLeft size={20} color="#304C3A" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl font-semibold truncate" style={{ color: "#122A1A" }}>{order.orderNumber}</h1>
          <p className="text-xs" style={{ color: "#9aada2" }}>Geplaatst op {formatDate(order.createdAt)}</p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: meta.bg, color: meta.color }}>
          <StatusIcon size={12} strokeWidth={2.5} />{meta.label}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
        {/* Producten */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#9aada2" }}>Producten</p>
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: "#EFF5EE" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl" style={{ background: "rgba(48,76,58,0.12)" }}>
                🍫
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>{item.product.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "#7a8f82" }}>
                  {item.quantity} dozen · €{parseFloat(item.unitPrice).toFixed(2)} / stuk
                </p>
              </div>
              <span className="text-sm font-semibold" style={{ color: "#304C3A" }}>
                €{(item.quantity * parseFloat(item.unitPrice)).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl" style={{ background: "#304C3A" }}>
            <span className="text-sm font-medium" style={{ color: "#BDD2B7" }}>Totaalbedrag</span>
            <span className="text-lg font-semibold font-display" style={{ color: "#ffffff" }}>
              €{parseFloat(order.totalAmount).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Leverinfo */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#9aada2" }}>Leverinformatie</p>
          {[
            { icon: Calendar, label: "Verwachte leverdatum", value: formatDate(order.expectedDelivery) },
            { icon: MapPin,   label: "Afleveradres",         value: order.deliveryAddress ?? "—" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: "#f5f8f5" }}>
              <Icon size={15} color="#304C3A" strokeWidth={1.75} className="flex-shrink-0" />
              <span className="text-sm flex-1" style={{ color: "#7a8f82" }}>{label}</span>
              <span className="text-sm font-medium text-right max-w-[55%]" style={{ color: "#122A1A" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── B2B Catalogus schermen ────────────────────────────────────────────────────
function CatalogusScreen({ onSelect }: { onSelect: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const products = DEMO_PRODUCTS.filter((p) =>
    search === "" || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-shrink-0 px-5 pt-14 pb-4 border-b" style={{ borderColor: "#f0f0f0" }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="font-display text-2xl font-semibold" style={{ color: "#122A1A" }}>Catalogus</h1>
            <p className="text-xs mt-0.5" style={{ color: "#9aada2" }}>Productaanbod Avéline</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1.5 rounded-full mt-1" style={{ background: "#EFF5EE", color: "#304C3A" }}>
            {products.length} producten
          </span>
        </div>
        <div className="relative">
          <Search size={15} color="#9aada2" className="absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek op product of herkomst…"
            className="input-field pl-10 py-2.5 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => onSelect(product.id)}
            className="w-full text-left flex items-center gap-3 p-4 rounded-2xl active:scale-[0.99] transition-transform"
            style={{ background: "#ffffff", border: "1.5px solid #f0f0f0" }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl" style={{ background: "#EFF5EE" }}>
              🍫
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>{product.name}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "#7a8f82" }}>
                {[product.origin, product.batchNumber ? `Batch #${product.batchNumber}` : null].filter(Boolean).join(" · ")}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {product.cacaoPercentage && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#FEF3C7", color: "#92400E" }}>
                    {product.cacaoPercentage}% cacao
                  </span>
                )}
                {product.isLimitedEdition && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#F5F3FF", color: "#5B21B6" }}>Limited</span>
                )}
                {product.isPremium && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#FFF7ED", color: "#9A3412" }}>Premium</span>
                )}
              </div>
            </div>
            <ChevronRight size={14} color="#BDD2B7" />
          </button>
        ))}
      </div>
    </div>
  );
}

function CatalogusDetailScreen({ productId, onBack }: { productId: string; onBack: () => void }) {
  const product = DEMO_PRODUCTS.find((p) => p.id === productId)!;
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-shrink-0 flex items-center gap-3 px-5 pt-14 pb-4 border-b" style={{ borderColor: "#f0f0f0" }}>
        <button onClick={onBack} className="p-2 rounded-full -ml-1" style={{ background: "#f5f8f5" }}>
          <ChevronLeft size={20} color="#304C3A" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl font-semibold truncate" style={{ color: "#122A1A" }}>{product.name}</h1>
          <p className="text-xs" style={{ color: "#9aada2" }}>{product.category ?? "—"}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="mx-5 mt-5 mb-5 rounded-2xl flex items-center justify-center text-6xl" style={{ height: 180, background: "#EFF5EE" }}>
          🍫
        </div>
        <div className="px-5 flex flex-col gap-5">
          <div className="flex flex-wrap gap-1.5">
            {product.cacaoPercentage && (
              <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "#FEF3C7", color: "#92400E" }}>
                {product.cacaoPercentage}% cacao
              </span>
            )}
            {product.certifications.map((c) => (
              <span key={c} className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "#EFF5EE", color: "#166534" }}>{c}</span>
            ))}
            {product.isLimitedEdition && (
              <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "#F5F3FF", color: "#5B21B6" }}>Limited edition</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            {[
              product.origin && { icon: MapPin, label: "Herkomst", value: product.origin },
              product.cacaoPercentage && { icon: Percent, label: "Cacao", value: `${product.cacaoPercentage}%` },
              product.batchNumber && { icon: Hash, label: "Batchnummer", value: `#${product.batchNumber}` },
            ].filter(Boolean).map(({ icon: Icon, label, value }: any) => (
              <div key={label} className="flex items-center justify-between px-4 py-3 rounded-2xl" style={{ background: "#f5f8f5" }}>
                <span className="text-sm flex items-center gap-2" style={{ color: "#7a8f82" }}>
                  <Icon size={15} strokeWidth={1.75} />{label}
                </span>
                <span className="text-sm font-medium" style={{ color: "#122A1A" }}>{value}</span>
              </div>
            ))}
          </div>

          {product.allergens.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#9aada2" }}>Allergenen</p>
              <div className="flex flex-wrap gap-2">
                {product.allergens.map((a) => (
                  <span key={a} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: "#FEF2F2", color: "#DC2626", border: "1.5px solid #FECACA" }}>{a}</span>
                ))}
              </div>
            </div>
          )}

          {product.description && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#9aada2" }}>Omschrijving</p>
              <p className="text-sm leading-relaxed" style={{ color: "#7a8f82" }}>{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── B2C Producten scherm ──────────────────────────────────────────────────────
function ProductenScreen({ onSelect }: { onSelect: (id: string) => void }) {
  const products = DEMO_PRODUCTS.slice(0, 3);
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-shrink-0 px-5 pt-14 pb-4 border-b" style={{ borderColor: "#f0f0f0" }}>
        <h1 className="font-display text-2xl font-semibold" style={{ color: "#122A1A" }}>Mijn Producten</h1>
        <p className="text-xs mt-0.5" style={{ color: "#9aada2" }}>Gescande producten</p>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => onSelect(product.id)}
            className="w-full text-left flex items-center gap-3 p-4 rounded-2xl active:scale-[0.99]"
            style={{ background: "#ffffff", border: "1.5px solid #f0f0f0" }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: "#EFF5EE" }}>🍫</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>{product.name}</p>
              <p className="text-xs mt-0.5" style={{ color: "#7a8f82" }}>Gescand {["3 dagen", "1 week", "2 weken"][DEMO_PRODUCTS.indexOf(product)]} geleden</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#EFF5EE", color: "#304C3A" }}>
                  +10 punten
                </span>
              </div>
            </div>
            <ChevronRight size={14} color="#BDD2B7" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function PresentatieDashboard({ username, sessionCode, openComplaints, activeChats }: Props) {
  const [role, setRole] = useState<DemoRole>("B2C_CLIENT");
  const [screen, setScreen] = useState<DemoScreen>("home");
  const [sessionEnded, setSessionEnded] = useState(false);

  // Detail item ids
  const [selectedChatId,     setSelectedChatId]     = useState<string | null>(null);
  const [selectedKlachtId,   setSelectedKlachtId]   = useState<string | null>(null);
  const [selectedOrderId,    setSelectedOrderId]     = useState<string | null>(null);
  const [selectedProductId,  setSelectedProductId]  = useState<string | null>(null);
  const [selectedPostId,     setSelectedPostId]      = useState<string | null>(null);

  useEffect(() => {
    async function checkStatus() {
      const res = await fetch(`/api/presentation/sessions/${sessionCode}`).catch(() => null);
      if (!res?.ok) return;
      const data = await res.json();
      if (data.status === "ENDED") setSessionEnded(true);
    }
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [sessionCode]);

  function handleRoleChange(newRole: DemoRole) {
    setRole(newRole);
    setScreen("home");
    setSelectedChatId(null);
    setSelectedKlachtId(null);
    setSelectedOrderId(null);
    setSelectedProductId(null);
    setSelectedPostId(null);
  }

  function handleNavChange(newScreen: DemoScreen) {
    setScreen(newScreen);
    setSelectedChatId(null);
    setSelectedKlachtId(null);
    setSelectedOrderId(null);
    setSelectedProductId(null);
    setSelectedPostId(null);
  }

  function DemoHomeBRC({ username, onNavigate }: { username: string; onNavigate: (s: DemoScreen) => void }) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0 px-5 pt-14 pb-5 bg-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-[1.75rem] font-semibold leading-tight" style={{ color: "#122A1A" }}>
                Hallo, {username}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: "#7a8f82" }}>Welkom terug!</p>
            </div>
            <div className="p-2 rounded-full" style={{ background: "#f5f8f5" }}>
              <Settings size={20} color="#304C3A" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {/* Scan CTA */}
          <div className="mb-7 mt-1">
            <button
              onClick={() => onNavigate("scan")}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-medium text-sm text-white"
              style={{ background: "#304C3A" }}
            >
              <QrCode size={18} strokeWidth={1.75} />
              Scan product
            </button>
          </div>

          {/* Aanbevelingen */}
          <div className="mb-7">
            <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Aanbevolen voor jou</h2>
            <div className="flex flex-col gap-2.5">
              {DEMO_PRODUCTS.slice(0, 2).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3.5 rounded-2xl"
                  style={{ background: "#EFF5EE", border: "1.5px solid #c8d9c2" }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "rgba(48,76,58,0.12)" }}>
                    🍫
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>{p.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#7a8f82" }}>{p.origin} · {p.cacaoPercentage}% cacao</p>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-1 rounded-full" style={{ background: "#304C3A", color: "#BDD2B7" }}>
                    Nieuw
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mijn Producten */}
          <div className="mb-7">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-base" style={{ color: "#122A1A" }}>Mijn Producten</h2>
              <button onClick={() => onNavigate("producten")} className="text-sm font-medium" style={{ color: "#304C3A" }}>
                Alles bekijken
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {DEMO_PRODUCTS.slice(0, 2).map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: "#f5f8f5" }}>
                  <span className="text-lg">🍫</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#122A1A" }}>{p.name}</p>
                    <p className="text-xs" style={{ color: "#9aada2" }}>Gescand {["3 dagen", "1 week"][i]} geleden</p>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#EFF5EE", color: "#304C3A" }}>+10 pt</span>
                </div>
              ))}
            </div>
          </div>

          {/* Voortgang */}
          <div>
            <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Jouw Voortgang</h2>
            <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: "#f5f8f5" }}>
              <div>
                <p className="text-xs mb-1" style={{ color: "#7a8f82" }}>Totaal punten</p>
                <p className="text-2xl font-semibold font-display" style={{ color: "#304C3A" }}>120</p>
              </div>
              <button onClick={() => onNavigate("profiel")} className="flex items-center gap-1 text-sm font-medium" style={{ color: "#304C3A" }}>
                Bekijk badges <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  function DemoHomeB2B({ username, onNavigate }: { username: string; onNavigate: (s: DemoScreen) => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-5 pt-14 pb-5 bg-white border-b" style={{ borderColor: "#f0f0f0" }}>
        <h1 className="font-display text-[1.75rem] font-semibold leading-tight" style={{ color: "#122A1A" }}>
          Hallo, {username}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "#7a8f82" }}>Zakelijk dashboard</p>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-5 flex flex-col gap-4">
        {/* Snelle stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Lopende orders", value: DEMO_ORDERS.filter(o => ["PENDING","CONFIRMED","SHIPPED"].includes(o.status)).length, color: "#2563EB", bg: "#EFF6FF" },
            { label: "Producten",      value: DEMO_PRODUCTS.length, color: "#304C3A", bg: "#EFF5EE" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="rounded-2xl p-4 flex flex-col gap-1" style={{ background: bg }}>
              <span className="text-2xl font-semibold font-display" style={{ color }}>{value}</span>
              <span className="text-xs" style={{ color: "#7a8f82" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Snelkoppelingen */}
        <div>
          <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Snelle toegang</h2>
          <div className="flex flex-col gap-2">
            {[
              { label: "Catalogus bekijken", screen: "catalogus" as DemoScreen, icon: BookOpen },
              { label: "Bestellingen",       screen: "orders"    as DemoScreen, icon: ShoppingCart },
              { label: "Analytics",          screen: "analytics" as DemoScreen, icon: BarChart2 },
            ].map(({ label, screen, icon: Icon }) => (
              <button
                key={screen}
                onClick={() => onNavigate(screen)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left active:scale-[0.99] transition-transform"
                style={{ background: "#f5f8f5", border: "1.5px solid #e8ede9" }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EFF5EE" }}>
                  <Icon size={17} color="#304C3A" strokeWidth={1.75} />
                </div>
                <span className="text-sm font-medium flex-1" style={{ color: "#122A1A" }}>{label}</span>
                <ChevronRight size={14} color="#BDD2B7" />
              </button>
            ))}
          </div>
        </div>

        {/* Laatste bestelling */}
        <div>
          <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Laatste bestelling</h2>
          {(() => {
            const latest = DEMO_ORDERS[0];
            const meta = ORDER_STATUS_META[latest.status];
            const Icon = meta.icon;
            return (
              <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "#ffffff", border: "1.5px solid #f0f0f0" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.bg }}>
                  <Icon size={18} color={meta.color} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>{latest.orderNumber}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#9aada2" }}>€{parseFloat(latest.totalAmount).toFixed(2)}</p>
                </div>
                <span className="text-[10px] font-medium px-2 py-1 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

function DemoHomeCS({ username, openComplaints, activeChats, onNavigate }: {
  username: string;
  openComplaints: number;
  activeChats: number;
  onNavigate: (s: DemoScreen) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-5 pt-14 pb-5 bg-white border-b" style={{ borderColor: "#f0f0f0" }}>
        <h1 className="font-display text-[1.75rem] font-semibold leading-tight" style={{ color: "#122A1A" }}>
          Hallo, {username}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "#7a8f82" }}>Klantenservice dashboard</p>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-5 flex flex-col gap-4">
        {/* Live stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 flex flex-col gap-1" style={{ background: "#FEF3C7" }}>
            <span className="text-2xl font-semibold font-display" style={{ color: "#D97706" }}>{openComplaints || DEMO_COMPLAINTS.filter(c => c.status === "NEW").length}</span>
            <span className="text-xs" style={{ color: "#7a8f82" }}>Open klachten</span>
          </div>
          <div className="rounded-2xl p-4 flex flex-col gap-1" style={{ background: "#F0FDF4" }}>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-semibold font-display" style={{ color: "#16A34A" }}>{activeChats || DEMO_CHAT_SESSIONS_CS.filter(s => s.isActive).length}</span>
              <span className="w-2 h-2 rounded-full" style={{ background: "#22C55E", animation: "dot-pulse 1.5s infinite" }} />
            </div>
            <span className="text-xs" style={{ color: "#7a8f82" }}>Actieve chats</span>
          </div>
        </div>

        {/* Snelkoppelingen */}
        <div>
          <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Snelle toegang</h2>
          <div className="flex flex-col gap-2">
            {[
              { label: "Klachten beheren", screen: "klachten" as DemoScreen, icon: AlertCircle, badge: DEMO_COMPLAINTS.filter(c => c.status === "NEW").length },
              { label: "Live chat",        screen: "chat"     as DemoScreen, icon: MessageCircle, badge: DEMO_CHAT_SESSIONS_CS.filter(s => s.isActive && !s.assignedAgent).length },
              { label: "Community",        screen: "community"as DemoScreen, icon: Users, badge: 0 },
            ].map(({ label, screen, icon: Icon, badge }) => (
              <button
                key={screen}
                onClick={() => onNavigate(screen)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left active:scale-[0.99] transition-transform"
                style={{ background: "#f5f8f5", border: "1.5px solid #e8ede9" }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EFF5EE" }}>
                  <Icon size={17} color="#304C3A" strokeWidth={1.75} />
                </div>
                <span className="text-sm font-medium flex-1" style={{ color: "#122A1A" }}>{label}</span>
                {badge > 0 && (
                  <span className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#D97706", color: "#fff" }}>{badge}</span>
                )}
                <ChevronRight size={14} color="#BDD2B7" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoHomeMarketing({ username, onNavigate }: { username: string; onNavigate: (s: DemoScreen) => void }) {
  const scheduled = DEMO_PROMOTIONS.filter(p => p.status === "SCHEDULED").length;
  const sent      = DEMO_PROMOTIONS.filter(p => p.status === "SENT").length;
  const draft     = DEMO_PROMOTIONS.filter(p => p.status === "DRAFT").length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-5 pt-14 pb-5 bg-white border-b" style={{ borderColor: "#f0f0f0" }}>
        <h1 className="font-display text-[1.75rem] font-semibold leading-tight" style={{ color: "#122A1A" }}>
          Hallo, {username}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "#7a8f82" }}>Marketing dashboard</p>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-5 flex flex-col gap-4">
        {/* Campagne stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Gepland",   value: scheduled, color: "#2563EB", bg: "#EFF6FF" },
            { label: "Verstuurd", value: sent,       color: "#16A34A", bg: "#F0FDF4" },
            { label: "Concept",   value: draft,      color: "#7a8f82", bg: "#f5f8f5" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="rounded-2xl p-3 flex flex-col gap-1" style={{ background: bg }}>
              <span className="text-xl font-semibold font-display" style={{ color }}>{value}</span>
              <span className="text-[10px]" style={{ color: "#7a8f82" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Snelkoppelingen */}
        <div>
          <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Snelle toegang</h2>
          <div className="flex flex-col gap-2">
            {[
              { label: "Promoties beheren", screen: "promoties"  as DemoScreen, icon: Megaphone },
              { label: "Community",         screen: "community"  as DemoScreen, icon: Users },
            ].map(({ label, screen, icon: Icon }) => (
              <button
                key={screen}
                onClick={() => onNavigate(screen)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left active:scale-[0.99] transition-transform"
                style={{ background: "#f5f8f5", border: "1.5px solid #e8ede9" }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EFF5EE" }}>
                  <Icon size={17} color="#304C3A" strokeWidth={1.75} />
                </div>
                <span className="text-sm font-medium flex-1" style={{ color: "#122A1A" }}>{label}</span>
                <ChevronRight size={14} color="#BDD2B7" />
              </button>
            ))}
          </div>
        </div>

        {/* Laatste promotie */}
        <div>
          <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Laatste promotie</h2>
          {(() => {
            const latest = DEMO_PROMOTIONS[0];
            const meta = { SENT: { color: "#16A34A", bg: "#F0FDF4" }, SCHEDULED: { color: "#2563EB", bg: "#EFF6FF" }, DRAFT: { color: "#7a8f82", bg: "#f5f8f5" } }[latest.status];
            return (
              <div className="rounded-2xl p-4" style={{ background: "#ffffff", border: "1.5px solid #f0f0f0" }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold" style={{ color: "#122A1A" }}>{latest.title}</p>
                  <span className="text-[10px] font-medium px-2 py-1 rounded-full flex-shrink-0" style={{ background: meta?.bg, color: meta?.color }}>
                    {latest.status === "SENT" ? "Verstuurd" : latest.status === "SCHEDULED" ? "Gepland" : "Concept"}
                  </span>
                </div>
                <p className="text-xs line-clamp-2" style={{ color: "#7a8f82" }}>{latest.body}</p>
                {latest.discountCode && (
                  <span className="inline-block mt-2 text-[10px] font-mono font-bold px-2 py-1 rounded-lg" style={{ background: "#EFF5EE", color: "#304C3A" }}>
                    {latest.discountCode}
                  </span>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
  

  function renderScreen() {
    // ── Home ──────────────────────────────────────────────────────────────────
    // In renderScreen(), vervang het home-blok:
    if (screen === "home") {
      switch (role) {
        case "B2C_CLIENT":
          return <DemoHomeBRC username={username} onNavigate={handleNavChange} />;
        case "B2B_CLIENT":
          return <DemoHomeB2B username={username} onNavigate={handleNavChange} />;
        case "CUSTOMER_SERVICE":
          return <DemoHomeCS username={username} openComplaints={openComplaints} activeChats={activeChats} onNavigate={handleNavChange} />;
        case "MARKETING":
          return <DemoHomeMarketing username={username} onNavigate={handleNavChange} />;
      }
    }

    // ── B2C Chat ──────────────────────────────────────────────────────────────
    if (screen === "chat" && role === "B2C_CLIENT") {
      return <ChatB2CList onSelect={(id) => { setSelectedChatId(id); setScreen("chat_detail"); }} />;
    }
    if (screen === "chat_detail" && role === "B2C_CLIENT" && selectedChatId) {
      return <ChatB2CDetail sessionId={selectedChatId} onBack={() => setScreen("chat")} />;
    }

    // ── CS Chat ───────────────────────────────────────────────────────────────
    if (screen === "chat" && role === "CUSTOMER_SERVICE") {
      return <ChatCSList onSelect={(id) => { setSelectedChatId(id); setScreen("chat_detail"); }} />;
    }
    if (screen === "chat_detail" && role === "CUSTOMER_SERVICE" && selectedChatId) {
      return <ChatCSDetail sessionId={selectedChatId} onBack={() => setScreen("chat")} />;
    }

    // ── Klachten ──────────────────────────────────────────────────────────────
    if (screen === "klachten") {
      return <KlachtenList onSelect={(id) => { setSelectedKlachtId(id); setScreen("klacht_detail"); }} />;
    }
    if (screen === "klacht_detail" && selectedKlachtId) {
      return <KlachtDetailScreen klachtId={selectedKlachtId} onBack={() => setScreen("klachten")} />;
    }

    // ── Community ─────────────────────────────────────────────────────────────
    if (screen === "community") {
      return <CommunityList onSelect={(id) => { setSelectedPostId(id); setScreen("post_detail"); }} />;
    }
    if (screen === "post_detail" && selectedPostId) {
      return <PostDetailScreen postId={selectedPostId} onBack={() => setScreen("community")} />;
    }

    // ── Promoties ─────────────────────────────────────────────────────────────
    if (screen === "promoties") return <PromotiesScreen />;

    // ── B2B Orders ────────────────────────────────────────────────────────────
    if (screen === "orders") {
      return <OrdersList onSelect={(id) => { setSelectedOrderId(id); setScreen("order_detail"); }} />;
    }
    if (screen === "order_detail" && selectedOrderId) {
      return <OrderDetailScreen orderId={selectedOrderId} onBack={() => setScreen("orders")} />;
    }
    if (screen === "analytics") return <AnalyticsScreen />;

    // ── B2B Catalogus ─────────────────────────────────────────────────────────
    if (screen === "catalogus") {
      return <CatalogusScreen onSelect={(id) => { setSelectedProductId(id); setScreen("catalogus_detail"); }} />;
    }
    if (screen === "catalogus_detail" && selectedProductId) {
      return <CatalogusDetailScreen productId={selectedProductId} onBack={() => setScreen("catalogus")} />;
    }

    // ── B2C Producten ─────────────────────────────────────────────────────────
    if (screen === "producten") {
      return <ProductenScreen onSelect={(id) => { setSelectedProductId(id); setScreen("product_detail"); }} />;
    }
    if (screen === "product_detail" && selectedProductId) {
      return <CatalogusDetailScreen productId={selectedProductId} onBack={() => setScreen("producten")} />;
    }

    // ── Overige ───────────────────────────────────────────────────────────────
    if (screen === "scan")          return <ScanScreen />;
    if (screen === "profiel")       return <ProfielScreen username={username} />;
    if (screen === "notificaties")  return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-5 pb-20">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "#EFF5EE" }}>
          <AlertCircle size={28} color="#BDD2B7" strokeWidth={1.25} />
        </div>
        <p className="text-base font-semibold" style={{ color: "#304C3A" }}>Notificaties</p>
        <p className="text-sm" style={{ color: "#9aada2" }}>Demo modus — geen echte meldingen beschikbaar.</p>
      </div>
    );

    return null;
  }

  return (
    <div className="mobile-shell" style={{ position: "relative" }}>
      {sessionEnded && <SessionEndedOverlay sessionCode={sessionCode} />}

      {/* Top bar */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b"
        style={{ background: "#ffffff", borderColor: "#e8ede9", zIndex: 40 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: "#BDD2B7", color: "#304C3A" }}>
            {username.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-medium" style={{ color: "#7a8f82" }}>{username}</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#EFF5EE", color: "#304C3A" }}>DEMO</span>
        </div>
        <RoleSwitcher current={role} onChange={handleRoleChange} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {renderScreen()}
      </div>

      {/* Bottom nav */}
      <DemoBottomNav role={role} current={screen} onChange={handleNavChange} />
    </div>
  );
}