"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings, Star, QrCode, Users, LogOut,
  ChevronRight, Check, X, Lock, Trophy,
  ShoppingCart, BarChart2, Megaphone, AlertCircle,
  MessageCircle, Package, Building2, BookOpen,
  TrendingUp, Send, ClipboardList, Shield,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  points: number;
  createdAt: Date;
  _count: { scans: number; communityPosts: number; badges: number };
};

type EarnedBadge = {
  id: string;
  earnedAt: string;
  badge: { id: string; type: string; name: string; description: string };
};

type Props = { user: User };

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  B2C_CLIENT:       "Klant",
  B2B_CLIENT:       "Zakelijke klant",
  CUSTOMER_SERVICE: "Klantenservice",
  MARKETING:        "Marketing",
  ADMIN:            "Beheerder",
};

const ALL_BADGES: Array<{
  type: string; name: string; description: string;
  emoji: string; howTo: string;
}> = [
  {
    type: "FIRST_SCAN",
    name: "Eerste scan",
    description: "Je hebt je eerste product gescand.",
    howTo: "Scan een QR-code op een Avéline product.",
    emoji: "🔍",
  },
  {
    type: "FIRST_COMPLAINT",
    name: "Eerste klacht",
    description: "Je hebt je eerste klacht ingediend.",
    howTo: "Dien een klacht in via de klantenservice.",
    emoji: "📋",
  },
  {
    type: "FIRST_POST",
    name: "Community starter",
    description: "Je eerste bericht in de community geplaatst.",
    howTo: "Deel een bericht in de community.",
    emoji: "💬",
  },
  {
    type: "PRODUCT_EXPLORER",
    name: "Product explorer",
    description: "Je hebt 10 verschillende producten gescand.",
    howTo: "Scan 10 Avéline producten met de QR-scanner.",
    emoji: "🏆",
  },
  {
    type: "COMMUNITY_STAR",
    name: "Community ster",
    description: "Je hebt 5 berichten in de community geplaatst.",
    howTo: "Blijf actief in de community en deel 5 berichten.",
    emoji: "⭐",
  },
  {
    type: "LOYAL_CUSTOMER",
    name: "Trouwe klant",
    description: "Je account is al meer dan 30 dagen actief.",
    howTo: "Gebruik de app regelmatig gedurende 30 dagen.",
    emoji: "🤝",
  },
];

// ─── Shared subcomponents ─────────────────────────────────────────────────────

function Avatar({ name, size = 60 }: { name: string; size?: number }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join("");
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-semibold"
      style={{
        width: size, height: size,
        background: "#BDD2B7", color: "#304C3A",
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
}

function StatCard({
  label, value, icon: Icon, accent = false,
}: {
  label: string; value: string | number; icon: React.ElementType; accent?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3"
      style={{ background: accent ? "#EFF5EE" : "#f5f8f5" }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: accent ? "#304C3A" : "#e8ede9" }}
      >
        <Icon size={18} color={accent ? "#BDD2B7" : "#304C3A"} strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-xs" style={{ color: "#9aada2" }}>{label}</p>
        <p className="text-xl font-semibold font-display" style={{ color: "#122A1A" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function QuickLink({
  label, href, icon: Icon,
}: {
  label: string; href: string; icon: React.ElementType;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border w-full text-left"
      style={{ borderColor: "#e8ede9" }}
    >
      <Icon size={16} color="#304C3A" strokeWidth={1.75} />
      <span className="text-sm font-medium flex-1" style={{ color: "#304C3A" }}>{label}</span>
      <ChevronRight size={16} color="#BDD2B7" />
    </button>
  );
}

function IdentityCard({
  user, fullName, editing, firstName, lastName,
  setFirstName, setLastName, saving, error,
  onEdit, onSave, onCancel,
}: {
  user: User; fullName: string; editing: boolean;
  firstName: string; lastName: string;
  setFirstName: (v: string) => void; setLastName: (v: string) => void;
  saving: boolean; error: string | null;
  onEdit: () => void; onSave: () => void; onCancel: () => void;
}) {
  return (
    <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "#f5f8f5" }}>
      <Avatar name={fullName} size={60} />
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex flex-col gap-2">
            <input
              value={firstName} onChange={(e) => setFirstName(e.target.value)}
              placeholder="Voornaam" className="input-field py-2 text-sm"
            />
            <input
              value={lastName} onChange={(e) => setLastName(e.target.value)}
              placeholder="Achternaam" className="input-field py-2 text-sm"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2 mt-1">
              <button
                onClick={onSave} disabled={saving}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                style={{ background: "#304C3A", opacity: saving ? 0.7 : 1 }}
              >
                <Check size={12} /> {saving ? "Opslaan…" : "Opslaan"}
              </button>
              <button
                onClick={onCancel}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border"
                style={{ color: "#304C3A", borderColor: "#c8d9c2" }}
              >
                <X size={12} /> Annuleren
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="font-semibold text-base truncate" style={{ color: "#122A1A" }}>
              {fullName}
            </p>
            <p className="text-sm truncate mt-0.5" style={{ color: "#7a8f82" }}>
              {user.email}
            </p>
            <span
              className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1.5"
              style={{ background: "#e8f0e5", color: "#304C3A" }}
            >
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
          </>
        )}
      </div>
      {!editing && (
        <button
          onClick={onEdit}
          className="flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: "#e8f0e5", color: "#304C3A" }}
        >
          Bewerken
        </button>
      )}
    </div>
  );
}

function AccountInfo({ user }: { user: User }) {
  return (
    <div>
      <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Account</h2>
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "#e8ede9" }}>
        <div
          className="flex items-center justify-between px-4 py-3.5 border-b"
          style={{ borderColor: "#e8ede9" }}
        >
          <span className="text-sm" style={{ color: "#304C3A" }}>E-mailadres</span>
          <span className="text-sm truncate max-w-[55%] text-right" style={{ color: "#7a8f82" }}>
            {user.email}
          </span>
        </div>
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm" style={{ color: "#304C3A" }}>Lid sinds</span>
          <span className="text-sm" style={{ color: "#7a8f82" }}>
            {new Date(user.createdAt).toLocaleDateString("nl-NL", {
              month: "long", year: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

function LogoutButton({ onLogout }: { onLogout: () => void }) {
  return (
    <button
      onClick={onLogout}
      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border font-medium text-sm"
      style={{ color: "#dc2626", borderColor: "#fecaca", background: "#fff5f5" }}
    >
      <LogOut size={16} />
      Uitloggen
    </button>
  );
}

// ─── B2C Badge components ─────────────────────────────────────────────────────

type SheetBadge = (typeof ALL_BADGES)[number];

function BadgeSheet({
  badge, earned, earnedAt, totalEarned, onClose,
}: {
  badge: SheetBadge; earned: boolean; earnedAt?: string;
  totalEarned: number; onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(18,42,26,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl overflow-hidden"
        style={{ background: "#ffffff" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative flex flex-col items-center pt-8 pb-6 px-6"
          style={{ background: earned ? "#304C3A" : "#f0f0f0" }}
        >
          <div
            className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full"
            style={{ background: earned ? "rgba(255,255,255,0.25)" : "#d0d0d0" }}
          />
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center mb-4"
            style={{
              background: earned ? "rgba(255,255,255,0.12)" : "#e0e0e0",
              fontSize: 44,
            }}
          >
            {earned ? <span>{badge.emoji}</span> : <Lock size={36} color="#b0b0b0" strokeWidth={1.5} />}
          </div>
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full mb-3"
            style={earned
              ? { background: "#51C675", color: "#ffffff" }
              : { background: "#d8d8d8", color: "#888888" }}
          >
            {earned ? "✓ Verdiend" : "Nog niet verdiend"}
          </span>
          <h2
            className="font-display text-2xl font-semibold text-center"
            style={{ color: earned ? "#ffffff" : "#aaaaaa" }}
          >
            {badge.name}
          </h2>
        </div>
        <div className="px-6 pt-5 pb-8">
          <p className="text-sm text-center leading-relaxed mb-5" style={{ color: "#5a6e62" }}>
            {badge.description}
          </p>
          {earned && earnedAt ? (
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-5" style={{ background: "#EFF5EE" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#304C3A" }}>
                <Star size={16} color="#51C675" fill="#51C675" />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "#304C3A" }}>Verdiend op</p>
                <p className="text-sm" style={{ color: "#5a6e62" }}>
                  {new Date(earnedAt).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl mb-5" style={{ background: "#f5f8f5" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#e0e0e0" }}>
                <Trophy size={16} color="#9aada2" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: "#304C3A" }}>Hoe te verdienen</p>
                <p className="text-sm leading-snug" style={{ color: "#7a8f82" }}>{badge.howTo}</p>
              </div>
            </div>
          )}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: "#9aada2" }}>Voortgang badges</span>
              <span className="text-xs font-semibold" style={{ color: "#304C3A" }}>{totalEarned}/{ALL_BADGES.length}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#e8ede9" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(totalEarned / ALL_BADGES.length) * 100}%`, background: "linear-gradient(90deg, #BDD2B7, #304C3A)" }}
              />
            </div>
          </div>
          <button onClick={onClose} className="btn-primary">Sluiten</button>
        </div>
      </div>
    </div>
  );
}

function BadgeTile({ name, emoji, earned, onClick }: { name: string; emoji: string; earned: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2.5 p-4 rounded-2xl transition-all active:scale-95"
      style={{ background: earned ? "#EFF5EE" : "#f5f5f5" }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl relative"
        style={{ background: earned ? "#304C3A" : "#e0e0e0", opacity: earned ? 1 : 0.7 }}
      >
        {earned ? <span>{emoji}</span> : <Lock size={20} color="#aaaaaa" strokeWidth={1.75} />}
        {earned && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white" style={{ background: "#51C675" }} />
        )}
      </div>
      <span className="text-xs font-medium text-center leading-snug w-full" style={{ color: earned ? "#304C3A" : "#aaaaaa" }}>
        {name}
      </span>
    </button>
  );
}

// ─── Role-specific profile sections ──────────────────────────────────────────

function B2CProfile({ user, earnedBadges, badgesLoading }: {
  user: User; earnedBadges: EarnedBadge[]; badgesLoading: boolean;
}) {
  const [selectedBadge, setSelectedBadge] = useState<SheetBadge | null>(null);
  const earnedTypes = new Set(earnedBadges.map((ub) => ub.badge.type));
  const earnedCount = earnedBadges.length;

  return (
    <>
      {/* Points + badge banner */}
      <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: "#304C3A" }}>
        <div className="flex items-center gap-3">
          <Star size={18} color="#51C675" fill="#51C675" />
          <div>
            <p className="text-xs" style={{ color: "rgba(189,210,183,0.8)" }}>Totaal punten</p>
            <p className="text-2xl font-semibold font-display" style={{ color: "#ffffff" }}>{user.points}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: "rgba(189,210,183,0.8)" }}>Badges</p>
          <p className="text-2xl font-semibold font-display" style={{ color: "#BDD2B7" }}>
            {earnedCount}<span className="text-sm">/{ALL_BADGES.length}</span>
          </p>
        </div>
      </div>

      {/* Badges */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-base" style={{ color: "#122A1A" }}>Mijn Badges</h2>
          {earnedCount > 0 && (
            <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: "#EFF5EE", color: "#304C3A" }}>
              {earnedCount} verdiend
            </span>
          )}
        </div>
        {badgesLoading ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: "#f5f8f5" }}>
            <p className="text-sm" style={{ color: "#9aada2" }}>Badges laden…</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              {ALL_BADGES.map((b) => (
                <BadgeTile
                  key={b.type} name={b.name} emoji={b.emoji}
                  earned={earnedTypes.has(b.type)} onClick={() => setSelectedBadge(b)}
                />
              ))}
            </div>
            {earnedCount === 0 && (
              <p className="text-xs text-center mt-3" style={{ color: "#9aada2" }}>
                Tik op een badge om te zien hoe je hem verdient.
              </p>
            )}
          </>
        )}
      </div>

      {/* Stats */}
      <div>
        <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Statistieken</h2>
        <div className="flex flex-col gap-2">
          {[
            { label: "Producten gescand", value: user._count.scans, icon: QrCode },
            { label: "Community posts",   value: user._count.communityPosts, icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: "#f5f8f5" }}>
              <Icon size={16} color="#304C3A" strokeWidth={1.75} />
              <span className="text-sm flex-1" style={{ color: "#304C3A" }}>{label}</span>
              <span className="text-sm font-semibold" style={{ color: "#122A1A" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedBadge && (
        <BadgeSheet
          badge={selectedBadge}
          earned={earnedTypes.has(selectedBadge.type)}
          earnedAt={earnedBadges.find((ub) => ub.badge.type === selectedBadge.type)?.earnedAt}
          totalEarned={earnedCount}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </>
  );
}

function B2BProfile({ user }: { user: User }) {
  return (
    <>
      {/* Role banner */}
      <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: "#304C3A" }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(189,210,183,0.15)" }}>
          <Building2 size={22} color="#BDD2B7" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-xs" style={{ color: "rgba(189,210,183,0.8)" }}>Accounttype</p>
          <p className="text-lg font-semibold" style={{ color: "#ffffff" }}>Zakelijke klant</p>
        </div>
      </div>

      {/* Stats grid */}
      <div>
        <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Overzicht</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Bestellingen" value={user._count.scans} icon={ShoppingCart} />
          <StatCard label="Producten" value="—" icon={Package} />
          <StatCard label="Actieve orders" value="—" icon={TrendingUp} accent />
          <StatCard label="Catalogus items" value="—" icon={BookOpen} />
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Snelle toegang</h2>
        <div className="flex flex-col gap-2">
          <QuickLink label="Bestellingen beheren" href="/dashboard/orders" icon={ShoppingCart} />
          <QuickLink label="Productcatalogus" href="/dashboard/catalogus" icon={BookOpen} />
          <QuickLink label="Analytics" href="/dashboard/analytics" icon={BarChart2} />
          <QuickLink label="Notificaties" href="/dashboard/notificaties" icon={Send} />
        </div>
      </div>
    </>
  );
}

function MarketingProfile({ user }: { user: User }) {
  return (
    <>
      {/* Role banner */}
      <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: "#304C3A" }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(189,210,183,0.15)" }}>
          <Megaphone size={22} color="#BDD2B7" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-xs" style={{ color: "rgba(189,210,183,0.8)" }}>Accounttype</p>
          <p className="text-lg font-semibold" style={{ color: "#ffffff" }}>Marketing</p>
        </div>
      </div>

      {/* Stats grid */}
      <div>
        <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Campagne overzicht</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Actieve promoties" value="—" icon={Megaphone} accent />
          <StatCard label="Geplande notificaties" value="—" icon={Send} />
          <StatCard label="Community posts" value={user._count.communityPosts} icon={Users} />
          <StatCard label="Bereik" value="—" icon={TrendingUp} />
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Snelle toegang</h2>
        <div className="flex flex-col gap-2">
          <QuickLink label="Promoties beheren" href="/dashboard/promoties" icon={Megaphone} />
          <QuickLink label="Community modereren" href="/dashboard/community" icon={Users} />
          <QuickLink label="Notificaties inplannen" href="/dashboard/notificaties" icon={Send} />
          <QuickLink label="Statistieken" href="/dashboard/analytics" icon={BarChart2} />
        </div>
      </div>
    </>
  );
}

function CustomerServiceProfile({ user }: { user: User }) {
  return (
    <>
      {/* Role banner */}
      <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: "#304C3A" }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(189,210,183,0.15)" }}>
          <MessageCircle size={22} color="#BDD2B7" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-xs" style={{ color: "rgba(189,210,183,0.8)" }}>Accounttype</p>
          <p className="text-lg font-semibold" style={{ color: "#ffffff" }}>Klantenservice</p>
        </div>
      </div>

      {/* Stats grid */}
      <div>
        <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Werkoverzicht</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Open klachten" value="—" icon={AlertCircle} accent />
          <StatCard label="Actieve chats" value="—" icon={MessageCircle} />
          <StatCard label="Opgelost vandaag" value="—" icon={Check} />
          <StatCard label="Community reacties" value={user._count.communityPosts} icon={Users} />
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Snelle toegang</h2>
        <div className="flex flex-col gap-2">
          <QuickLink label="Klachten beheren" href="/dashboard/klachten" icon={ClipboardList} />
          <QuickLink label="Chat met klanten" href="/dashboard/chat" icon={MessageCircle} />
          <QuickLink label="Community" href="/dashboard/community" icon={Users} />
          <QuickLink label="Notificaties" href="/dashboard/notificaties" icon={Send} />
        </div>
      </div>
    </>
  );
}

function AdminProfile({ user }: { user: User }) {
  return (
    <>
      {/* Role banner */}
      <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: "#304C3A" }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(189,210,183,0.15)" }}>
          <Shield size={22} color="#BDD2B7" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-xs" style={{ color: "rgba(189,210,183,0.8)" }}>Accounttype</p>
          <p className="text-lg font-semibold" style={{ color: "#ffffff" }}>Beheerder</p>
        </div>
      </div>

      {/* Stats */}
      <div>
        <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Systeemoverzicht</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Community posts" value="—" icon={Users} accent />
          <StatCard label="Gebruikers" value="—" icon={Shield} />
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Beheer</h2>
        <div className="flex flex-col gap-2">
          <QuickLink label="Community modereren" href="/dashboard/community" icon={Users} />
          <QuickLink label="Notificaties" href="/dashboard/notificaties" icon={Send} />
          <QuickLink label="Instellingen" href="/dashboard/instellingen" icon={Settings} />
        </div>
      </div>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProfielClient({ user }: Props) {
  const router = useRouter();

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ")
    || user.email.split("@")[0];

  const [editing,   setEditing]   = useState(false);
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName,  setLastName]  = useState(user.lastName  ?? "");
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  // Only load badges for B2C
  const [earnedBadges,  setEarnedBadges]  = useState<EarnedBadge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(user.role === "B2C_CLIENT");

  useEffect(() => {
    if (user.role !== "B2C_CLIENT") return;
    fetch("/api/user/badges")
      .then((r) => r.ok ? r.json() : [])
      .then(setEarnedBadges)
      .catch(() => {})
      .finally(() => setBadgesLoading(false));
  }, [user.role]);

  async function handleSave() {
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Opslaan mislukt.");
      } else {
        setEditing(false);
        router.refresh();
      }
    } catch {
      setError("Er ging iets mis. Controleer je verbinding.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  function renderRoleSection() {
    switch (user.role) {
      case "B2C_CLIENT":
        return <B2CProfile user={user} earnedBadges={earnedBadges} badgesLoading={badgesLoading} />;
      case "B2B_CLIENT":
        return <B2BProfile user={user} />;
      case "MARKETING":
        return <MarketingProfile user={user} />;
      case "CUSTOMER_SERVICE":
        return <CustomerServiceProfile user={user} />;
      case "ADMIN":
        return <AdminProfile user={user} />;
      default:
        return null;
    }
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 pt-14 pb-4">
        <h1 className="font-display text-2xl font-semibold" style={{ color: "#122A1A" }}>
          Profiel
        </h1>
        <button
          onClick={() => router.push("/dashboard/instellingen")}
          className="p-2 rounded-full"
          style={{ background: "#f5f8f5" }}
          aria-label="Instellingen"
        >
          <Settings size={20} color="#304C3A" />
        </button>
      </div>

      <div className="px-5 pb-8 flex flex-col gap-6">

        {/* Identity card — shared across all roles */}
        <IdentityCard
          user={user} fullName={fullName} editing={editing}
          firstName={firstName} lastName={lastName}
          setFirstName={setFirstName} setLastName={setLastName}
          saving={saving} error={error}
          onEdit={() => setEditing(true)}
          onSave={handleSave}
          onCancel={() => { setEditing(false); setError(null); }}
        />

        {/* Role-specific sections */}
        {renderRoleSection()}

        {/* Account info — shared */}
        <AccountInfo user={user} />

        {/* Settings shortcuts — shared */}
        <div className="flex flex-col gap-2">
          {[
            { label: "Instellingen", href: "/dashboard/instellingen" },
            { label: "Notificaties", href: "/dashboard/notificaties" },
          ].map(({ label, href }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="flex items-center justify-between px-4 py-3.5 rounded-2xl border"
              style={{ borderColor: "#e8ede9" }}
            >
              <span className="text-sm font-medium" style={{ color: "#304C3A" }}>{label}</span>
              <ChevronRight size={16} color="#BDD2B7" />
            </button>
          ))}
        </div>

        {/* Logout — shared */}
        <LogoutButton onLogout={handleLogout} />
      </div>
    </div>
  );
}