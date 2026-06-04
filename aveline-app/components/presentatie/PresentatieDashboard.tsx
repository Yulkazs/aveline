"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check, ShoppingBag, Building2, Headphones, Megaphone, X } from "lucide-react";

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

// Import all dashboard screens
import DashboardB2C from "@/components/dashboard/DashboardB2C";
import DashboardB2B from "@/components/dashboard/DashboardB2B";
import DashboardCustomerService from "@/components/dashboard/DashboardCustomerService";
import DashboardMarketing from "@/components/dashboard/DashboardMarketing";

// Import sub-screens for in-app navigation
import ChatOverzichtB2C from "@/components/dashboard/chat/ChatOverzichtB2C";
import ChatOverzichtCS from "@/components/dashboard/chat/ChatOverzichtCS";
import KlachtenClient from "@/components/dashboard/klachten/KlachtenClient";
import PromotiesClient from "@/components/dashboard/marketing/PromotiesClient";
import CommunityFeed from "@/components/community/CommunityFeed";

// ── Types ─────────────────────────────────────────────────────────────────────
type DemoRole = "B2C_CLIENT" | "B2B_CLIENT" | "CUSTOMER_SERVICE" | "MARKETING";
type DemoScreen =
  | "home"
  | "scan"
  | "producten"
  | "chat"
  | "community"
  | "profiel"
  | "catalogus"
  | "orders"
  | "analytics"
  | "klachten"
  | "promoties"
  | "notificaties";

type Props = {
  username: string;
  sessionCode: string;
  openComplaints: number;
  activeChats: number;
};

// ── Role config ───────────────────────────────────────────────────────────────
const ROLES: Array<{
  key: DemoRole;
  label: string;
  icon: React.ElementType;
  description: string;
}> = [
  { key: "B2C_CLIENT",       label: "B2C Klant",      icon: ShoppingBag, description: "Soulaimane & Hamza" },
  { key: "B2B_CLIENT",       label: "B2B Klant",      icon: Building2,   description: "Omar"               },
  { key: "CUSTOMER_SERVICE", label: "Klantenservice", icon: Headphones,  description: "Esad"               },
  { key: "MARKETING",        label: "Marketing",      icon: Megaphone,   description: "Jessica"            },
];

// ── BottomNav per role ────────────────────────────────────────────────────────
import {
  Home, QrCode, Package, MessageCircle, Users, User,
  BookOpen, ShoppingCart, BarChart2, AlertCircle,
} from "lucide-react";

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

// ── Demo Bottom Nav ───────────────────────────────────────────────────────────
function DemoBottomNav({
  role,
  current,
  onChange,
}: {
  role: DemoRole;
  current: DemoScreen;
  onChange: (screen: DemoScreen) => void;
}) {
  const items = NAV_CONFIG[role];

  return (
    <nav
      aria-label="Navigatie"
      className="flex-shrink-0 border-t"
      style={{
        background: "#ffffff",
        borderColor: "#e8ede9",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <ul className="flex items-stretch" role="list">
        {items.map(({ label, screen, icon: Icon }) => {
          const active = current === screen;
          return (
            <li key={screen} className="flex-1">
              <button
                onClick={() => onChange(screen)}
                className="flex flex-col items-center justify-center gap-1 py-3 w-full transition-opacity active:opacity-60"
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2 : 1.5}
                  color={active ? "#304C3A" : "#9aada2"}
                />
                <span
                  className="text-[10px] font-medium leading-none"
                  style={{ color: active ? "#304C3A" : "#9aada2" }}
                >
                  {label}
                </span>
                {active && (
                  <span
                    className="w-1 h-1 rounded-full"
                    style={{ background: "#51C675" }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ── Session Ended Overlay ─────────────────────────────────────────────────────
function SessionEndedOverlay({ sessionCode }: { sessionCode: string }) {
  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center px-8 text-center"
      style={{ background: "rgba(18,42,26,0.92)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        <span className="text-4xl">🍫</span>
      </div>
      <h1
        className="font-display text-2xl font-semibold mb-3"
        style={{ color: "#ffffff" }}
      >
        Presentatie afgelopen
      </h1>
      <p className="text-sm leading-relaxed mb-2" style={{ color: "rgba(189,210,183,0.8)" }}>
        De presentator heeft sessie{" "}
        <span className="font-mono font-bold" style={{ color: "#51C675" }}>
          {sessionCode}
        </span>{" "}
        beëindigd.
      </p>
      <p className="text-xs" style={{ color: "rgba(189,210,183,0.5)" }}>
        Bedankt voor je deelname!
      </p>
    </div>
  );
}

// ── Demo Screen Placeholder ───────────────────────────────────────────────────
function DemoPlaceholder({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-5 pb-20">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "#EFF5EE" }}
      >
        <Icon size={28} color="#BDD2B7" strokeWidth={1.25} />
      </div>
      <div>
        <p className="text-base font-semibold mb-1" style={{ color: "#304C3A" }}>
          {title}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "#9aada2" }}>
          Demo modus — volledige functionaliteit beschikbaar in de echte app.
        </p>
      </div>
    </div>
  );
}

// ── Role switcher dropdown ────────────────────────────────────────────────────
function RoleSwitcher({
  current,
  onChange,
}: {
  current: DemoRole;
  onChange: (role: DemoRole) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentRole = ROLES.find((r) => r.key === current)!;
  const CurrentIcon = currentRole.icon;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-95"
        style={{ background: open ? "#EFF5EE" : "#f5f8f5" }}
      >
        <CurrentIcon size={15} color="#304C3A" strokeWidth={1.75} />
        <span className="text-xs font-semibold" style={{ color: "#122A1A" }}>
          {currentRole.label}
        </span>
        <ChevronDown
          size={13}
          color="#9aada2"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 200ms",
          }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-60 rounded-2xl overflow-hidden border z-50"
          style={{
            background: "#ffffff",
            borderColor: "#e8ede9",
            boxShadow: "0 8px 32px rgba(18,42,26,0.12)",
          }}
        >
          <div className="px-4 py-2.5 border-b" style={{ borderColor: "#f0f0f0" }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#9aada2" }}>
              Rol wisselen
            </p>
          </div>

          {ROLES.map((role) => {
            const active = role.key === current;
            const Icon = role.icon;
            return (
              <button
                key={role.key}
                onClick={() => { onChange(role.key); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{
                  background: active ? "#f5f8f5" : "#ffffff",
                  borderBottom: "1px solid #f8f8f8",
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: active ? "#EFF5EE" : "#f5f8f5" }}
                >
                  <Icon size={15} color="#304C3A" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: active ? "#304C3A" : "#122A1A" }}>
                    {role.label}
                  </p>
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

// ── Main component ────────────────────────────────────────────────────────────
export default function PresentatieDashboard({
  username,
  sessionCode,
  openComplaints,
  activeChats,
}: Props) {
  const [role, setRole] = useState<DemoRole>("B2C_CLIENT");
  const [screen, setScreen] = useState<DemoScreen>("home");
  const [sessionEnded, setSessionEnded] = useState(false);

  // Poll session status every 3 seconds to detect when admin ends the session
  useEffect(() => {
    async function checkStatus() {
      const res = await fetch(`/api/presentation/sessions/${sessionCode}`).catch(() => null);
      if (!res?.ok) return;
      const data = await res.json();
      if (data.status === "ENDED") {
        setSessionEnded(true);
      }
    }

    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [sessionCode]);

  // When role changes, go back to home screen
  function handleRoleChange(newRole: DemoRole) {
    setRole(newRole);
    setScreen("home");
  }

  // Render the correct screen for the current role & screen selection
  function renderScreen() {
    // HOME screen = the role-specific dashboard
    if (screen === "home") {
      switch (role) {
        case "B2C_CLIENT":
          return (
            <DashboardB2C
              firstName={username}
              points={120}
            />
          );
        case "B2B_CLIENT":
          return (
            <DashboardB2B
              firstName={username}
              recentOrders={[]}
            />
          );
        case "CUSTOMER_SERVICE":
          return (
            <DashboardCustomerService
              firstName={username}
              openComplaints={openComplaints}
              activeChats={activeChats}
            />
          );
        case "MARKETING":
          return <DashboardMarketing firstName={username} />;
      }
    }

    // Sub-screens
    if (screen === "chat") {
      if (role === "CUSTOMER_SERVICE") {
        return <DemoPlaceholder title="Live Chat" icon={MessageCircle} />;
      }
      return <DemoPlaceholder title="Chats" icon={MessageCircle} />;
    }

    if (screen === "klachten") {
      return <DemoPlaceholder title="Klachten" icon={AlertCircle} />;
    }

    if (screen === "promoties") {
      return <DemoPlaceholder title="Promoties" icon={Megaphone} />;
    }

    if (screen === "community") {
      return <DemoPlaceholder title="Community" icon={Users} />;
    }

    if (screen === "scan") {
      return (
        <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-5 pb-20">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center"
            style={{ background: "#EFF5EE" }}
          >
            <QrCode size={40} color="#304C3A" strokeWidth={1.25} />
          </div>
          <div>
            <p className="text-base font-semibold mb-1" style={{ color: "#304C3A" }}>
              QR Scanner
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#9aada2" }}>
              Scan een QR-code op een Avéline product om informatie, recepten en gamification-punten te ontvangen.
            </p>
          </div>
          <div
            className="w-full rounded-2xl p-4 text-left"
            style={{ background: "#f5f8f5", border: "1.5px solid #e8ede9" }}
          >
            <p className="text-xs font-semibold mb-2" style={{ color: "#304C3A" }}>
              Wat gebeurt er na scannen?
            </p>
            {[
              "Product details & certificeringen",
              "+10 gamification punten",
              "Persoonlijke aanbevelingen",
              "Klacht indienen optie",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 py-1">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#51C675" }} />
                <span className="text-xs" style={{ color: "#7a8f82" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (screen === "producten") {
      return <DemoPlaceholder title="Mijn Producten" icon={Package} />;
    }

    if (screen === "catalogus") {
      return <DemoPlaceholder title="Productcatalogus" icon={BookOpen} />;
    }

    if (screen === "orders") {
      return <DemoPlaceholder title="Bestellingen" icon={ShoppingCart} />;
    }

    if (screen === "analytics") {
      return <DemoPlaceholder title="Analytics" icon={BarChart2} />;
    }

    if (screen === "profiel") {
      return (
        <div className="flex flex-col h-full overflow-y-auto pb-20">
          <div className="flex-shrink-0 flex items-center justify-between px-5 pt-14 pb-4">
            <h1 className="font-display text-2xl font-semibold" style={{ color: "#122A1A" }}>Profiel</h1>
          </div>
          <div className="px-5 flex flex-col gap-4">
            <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "#f5f8f5" }}>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center font-semibold text-lg flex-shrink-0"
                style={{ background: "#BDD2B7", color: "#304C3A" }}
              >
                {username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-base" style={{ color: "#122A1A" }}>{username}</p>
                <p className="text-sm mt-0.5" style={{ color: "#7a8f82" }}>demo@aveline.nl</p>
                <span
                  className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1.5"
                  style={{ background: "#e8f0e5", color: "#304C3A" }}
                >
                  Demo gebruiker
                </span>
              </div>
            </div>
            <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: "#304C3A" }}>
              <div>
                <p className="text-xs" style={{ color: "rgba(189,210,183,0.8)" }}>Totaal punten</p>
                <p className="text-2xl font-semibold font-display" style={{ color: "#ffffff" }}>120</p>
              </div>
              <span className="text-3xl">⭐</span>
            </div>
          </div>
        </div>
      );
    }

    if (screen === "notificaties") {
      return <DemoPlaceholder title="Notificaties" icon={MessageCircle} />;
    }

    return null;
  }

  return (
    <div className="mobile-shell" style={{ position: "relative" }}>
      {/* Session ended full-screen overlay */}
      {sessionEnded && <SessionEndedOverlay sessionCode={sessionCode} />}

      {/* Role switcher top bar */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b"
        style={{ background: "#ffffff", borderColor: "#e8ede9", zIndex: 40 }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
            style={{ background: "#BDD2B7", color: "#304C3A" }}
          >
            {username.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-medium" style={{ color: "#7a8f82" }}>
            {username}
          </span>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: "#EFF5EE", color: "#304C3A" }}
          >
            DEMO
          </span>
        </div>

        <RoleSwitcher current={role} onChange={handleRoleChange} />
      </div>

      {/* Dashboard content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {renderScreen()}
      </div>

      {/* Demo Bottom Nav — intercepts all navigation, no page reloads */}
      <DemoBottomNav role={role} current={screen} onChange={setScreen} />
    </div>
  );
}