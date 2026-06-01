"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, Bell, Lock, Eye, Trash2,
  Moon, Globe, Shield, LogOut, HelpCircle
} from "lucide-react";

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative flex-shrink-0 transition-colors duration-200"
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        background: checked ? "#304C3A" : "#D1D5DB",
      }}
    >
      <span
        className="absolute top-1 transition-transform duration-200"
        style={{
          left: 2,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#ffffff",
          transform: checked ? "translateX(18px)" : "translateX(0)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

// ── Row types ─────────────────────────────────────────────────────────────────
type ToggleRow = {
  kind: "toggle";
  label: string;
  description?: string;
  icon: React.ElementType;
  key: string;
};
type LinkRow = {
  kind: "link";
  label: string;
  description?: string;
  icon: React.ElementType;
  href?: string;
  danger?: boolean;
  onClick?: () => void;
};
type SectionRow = ToggleRow | LinkRow;

// ── Section component ─────────────────────────────────────────────────────────
function Section({
  title,
  rows,
  toggles,
  onToggle,
  onAction,
  first = false,
}: {
  title: string;
  rows: SectionRow[];
  toggles: Record<string, boolean>;
  onToggle: (key: string, value: boolean) => void;
  onAction: (row: LinkRow) => void;
  first?: boolean;
}) {
  return (
    <div className="mb-2">
      <p
        className="text-xs font-semibold uppercase tracking-widest px-5 mb-3"
        style={{ color: "#9aada2", marginTop: first ? 0 : "2rem" }}
      >
        {title}
      </p>
      <div className="mx-5 rounded-2xl overflow-hidden border" style={{ borderColor: "#e8ede9" }}>
        {rows.map((row, i) => {
          const Icon = row.icon;
          const isLast = i === rows.length - 1;

          return (
            <div
              key={row.label}
              className={`flex items-center gap-3 px-4 py-3.5 ${!isLast ? "border-b" : ""}`}
              style={{ borderColor: "#f0f0f0", background: "#ffffff" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: row.kind === "link" && row.danger ? "#FEF2F2" : "#EFF5EE" }}
              >
                <Icon
                  size={16}
                  color={row.kind === "link" && row.danger ? "#DC2626" : "#304C3A"}
                  strokeWidth={1.75}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium"
                  style={{ color: row.kind === "link" && row.danger ? "#DC2626" : "#122A1A" }}
                >
                  {row.label}
                </p>
                {row.description && (
                  <p className="text-xs mt-0.5" style={{ color: "#9aada2" }}>
                    {row.description}
                  </p>
                )}
              </div>

              {row.kind === "toggle" ? (
                <Toggle
                  checked={toggles[row.key] ?? false}
                  onChange={(v) => onToggle(row.key, v)}
                />
              ) : (
                <button
                  onClick={() => onAction(row)}
                  className="flex items-center"
                  aria-label={row.label}
                >
                  <ChevronRight size={16} color="#BDD2B7" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Delete account modal ──────────────────────────────────────────────────────
function DeleteModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [input, setInput] = useState("");
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(18,42,26,0.4)" }}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl p-6 pb-10 animate-fade-slide-up"
        style={{ background: "#ffffff" }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: "#e4e4e4" }} />
        <h2 className="font-display text-xl font-semibold mb-2" style={{ color: "#122A1A" }}>
          Account verwijderen
        </h2>
        <p className="text-sm mb-5" style={{ color: "#7a8f82" }}>
          Dit verwijdert al je gegevens permanent. Typ <strong>verwijder</strong> om te bevestigen.
        </p>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="verwijder"
          className="input-field mb-4"
        />
        <button
          onClick={onConfirm}
          disabled={input !== "verwijder"}
          className="btn-primary mb-3"
          style={{
            background: "#DC2626",
            opacity: input !== "verwijder" ? 0.4 : 1,
          }}
        >
          Account permanent verwijderen
        </button>
        <button onClick={onClose} className="btn-secondary">
          Annuleren
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function InstellingenPage() {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    push_products:    true,
    push_promoties:   true,
    push_community:   false,
    push_orders:      true,
    dark_mode:        false,
    two_factor:       false,
    analytics:        true,
    marketing_emails: false,
  });

  function onToggle(key: string, value: boolean) {
    setToggles((prev) => ({ ...prev, [key]: value }));
    // In production: PATCH /api/user/settings
  }

  function onAction(row: LinkRow) {
    if (row.onClick) { row.onClick(); return; }
    if (row.href)    { router.push(row.href); }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const NOTIFICATION_ROWS: SectionRow[] = [
    { kind: "toggle", label: "Nieuwe producten",  icon: Bell,   key: "push_products",  description: "Ontvang een melding bij nieuwe releases" },
    { kind: "toggle", label: "Promoties",          icon: Bell,   key: "push_promoties" },
    { kind: "toggle", label: "Community reacties", icon: Bell,   key: "push_community" },
    { kind: "toggle", label: "Bestelupdates",      icon: Bell,   key: "push_orders" },
  ];

  const APPEARANCE_ROWS: SectionRow[] = [
    { kind: "toggle", label: "Donkere modus",     icon: Moon,   key: "dark_mode",   description: "Bèta — nog niet volledig ondersteund" },
    { kind: "link",   label: "Taal",               icon: Globe,  href: "#",          description: "Nederlands" },
  ];

  const PRIVACY_ROWS: SectionRow[] = [
    { kind: "toggle", label: "Twee-factor authenticatie", icon: Lock,    key: "two_factor",    description: "Extra beveiliging via sms of authenticator" },
    { kind: "toggle", label: "Gebruik­analytics",          icon: Eye,     key: "analytics",     description: "Anonieme data om de app te verbeteren" },
    { kind: "toggle", label: "Marketing e-mails",          icon: Shield,  key: "marketing_emails" },
  ];

  const ACCOUNT_ROWS: SectionRow[] = [
    { kind: "link", label: "Wachtwoord wijzigen",  icon: Lock,    href: "/dashboard/wachtwoord" },
    { kind: "link", label: "Privacybeleid",         icon: Shield,  href: "#" },
    { kind: "link", label: "Help & support",        icon: HelpCircle, href: "#" },
    { kind: "link", label: "Uitloggen",             icon: LogOut,  onClick: handleLogout },
    {
      kind: "link",
      label: "Account verwijderen",
      icon: Trash2,
      danger: true,
      onClick: () => setShowDeleteModal(true),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-5 pt-14 pb-5">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full -ml-1"
          style={{ background: "#f5f8f5" }}
          aria-label="Terug"
        >
          <ChevronLeft size={20} color="#304C3A" />
        </button>
        <h1 className="font-display text-2xl font-semibold" style={{ color: "#122A1A" }}>
          Instellingen
        </h1>
      </div>

      {/* Sections */}
      <div className="pb-10">
        <Section title="Notificaties"   rows={NOTIFICATION_ROWS} toggles={toggles} onToggle={onToggle} onAction={onAction} first />
        <Section title="Weergave"       rows={APPEARANCE_ROWS}   toggles={toggles} onToggle={onToggle} onAction={onAction} />
        <Section title="Privacy"        rows={PRIVACY_ROWS}      toggles={toggles} onToggle={onToggle} onAction={onAction} />
        <Section title="Account"        rows={ACCOUNT_ROWS}      toggles={toggles} onToggle={onToggle} onAction={onAction} />
      </div>

      {showDeleteModal && (
        <DeleteModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            setShowDeleteModal(false);
            // In production: DELETE /api/user
            router.push("/login");
          }}
        />
      )}
    </div>
  );
}