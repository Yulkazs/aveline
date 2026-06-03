"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import BottomNav from "@/components/dashboard/BottomNav";

// Import the real dashboard components per role
import DashboardB2C from "@/components/dashboard/DashboardB2C";
import DashboardB2B from "@/components/dashboard/DashboardB2B";
import DashboardCustomerService from "@/components/dashboard/DashboardCustomerService";
import DashboardMarketing from "@/components/dashboard/DashboardMarketing";

// ── Types ─────────────────────────────────────────────────────────────────────
type DemoRole = "B2C_CLIENT" | "B2B_CLIENT" | "CUSTOMER_SERVICE" | "MARKETING";

type Complaint = {
  id: string;
  referenceNumber: string;
  status: string;
  priority: string;
  type: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  user: { firstName: string | null; lastName: string | null; email: string };
  product: { name: string; batchNumber: string | null };
};

type Product = {
  id: string;
  name: string;
  cacaoPercentage: number | null;
  origin: string | null;
  isPremium: boolean;
  isLimitedEdition: boolean;
  batchNumber: string | null;
  category: string | null;
};

type Props = {
  username: string;
  sessionCode: string;
  openComplaints: number;
  activeChats: number;
  complaints: Complaint[];
  products: Product[];
};

// ── Role config ───────────────────────────────────────────────────────────────
const ROLES: Array<{
  key: DemoRole;
  label: string;
  emoji: string;
  description: string;
}> = [
  { key: "B2C_CLIENT",       label: "B2C Klant",      emoji: "🛍️", description: "Particuliere consument" },
  { key: "B2B_CLIENT",       label: "B2B Klant",      emoji: "🏢", description: "Zakelijke afnemer"       },
  { key: "CUSTOMER_SERVICE", label: "Klantenservice", emoji: "🎧", description: "CS medewerker"           },
  { key: "MARKETING",        label: "Marketing",      emoji: "📣", description: "Marketing team"          },
];

// ── Role switcher dropdown ─────────────────────────────────────────────────────
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
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-95"
        style={{ background: open ? "#EFF5EE" : "#f5f8f5" }}
      >
        <span className="text-base leading-none">{currentRole.emoji}</span>
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

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden border z-50"
          style={{
            background: "#ffffff",
            borderColor: "#e8ede9",
            boxShadow: "0 8px 32px rgba(18,42,26,0.12)",
          }}
        >
          <div className="px-4 py-2.5 border-b" style={{ borderColor: "#f0f0f0" }}>
            <p
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "#9aada2" }}
            >
              Rol wisselen
            </p>
          </div>

          {ROLES.map((role) => {
            const active = role.key === current;
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
                <span className="text-lg leading-none flex-shrink-0">{role.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: active ? "#304C3A" : "#122A1A" }}
                  >
                    {role.label}
                  </p>
                  <p className="text-[10px]" style={{ color: "#9aada2" }}>
                    {role.description}
                  </p>
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
  openComplaints,
  activeChats,
  complaints,
  products,
}: Props) {
  const [role, setRole] = useState<DemoRole>("B2C_CLIENT");

  return (
    <div className="mobile-shell" style={{ position: "relative" }}>

      {/* ── Role switcher top bar ──────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b"
        style={{ background: "#ffffff", borderColor: "#e8ede9", zIndex: 40 }}
      >
        {/* Username + demo badge */}
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

        <RoleSwitcher current={role} onChange={setRole} />
      </div>

      {/* ── Dashboard content per role ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {role === "B2C_CLIENT" && (
          <DashboardB2C firstName={username} points={120} />
        )}
        {role === "B2B_CLIENT" && (
          <DashboardB2B firstName={username} />
        )}
        {role === "CUSTOMER_SERVICE" && (
          <DashboardCustomerService
            firstName={username}
            openComplaints={openComplaints}
            activeChats={activeChats}
            complaints={complaints}
          />
        )}
        {role === "MARKETING" && (
          <DashboardMarketing firstName={username} />
        )}
      </div>

      {/* ── Bottom nav ─────────────────────────────────────────────── */}
      <BottomNav role={role} />
    </div>
  );
}