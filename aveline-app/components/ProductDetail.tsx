"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Leaf,
  Award,
  AlertTriangle,
  MapPin,
  Hash,
  Star,
  Share2,
  Heart,
  MessageCircle,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
export type Product = {
  id: string;
  name: string;
  description: string | null;
  cacaoPercentage: number | null;
  origin: string | null;
  ingredients: string[];
  allergens: string[];
  certifications: string[];
  batchNumber: string | null;
  isLimitedEdition: boolean;
  isPremium: boolean;
  imageUrl: string | null;
  category: string | null;
};

type Props = { product: Product };

// ── Pill ──────────────────────────────────────────────────────────────────────
function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}

// ── Section block ─────────────────────────────────────────────────────────────
function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#9aada2" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ── Cacao meter ───────────────────────────────────────────────────────────────
function CacaoMeter({ percentage }: { percentage: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs" style={{ color: "#7a8f82" }}>Cacaopercentage</span>
        <span className="text-sm font-semibold" style={{ color: "#304C3A" }}>
          {percentage}%
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "#E8EDE9" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, #BDD2B7 0%, #304C3A ${percentage > 50 ? "100%" : "150%"})`,
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px]" style={{ color: "#BDD2B7" }}>Melk</span>
        <span className="text-[10px]" style={{ color: "#BDD2B7" }}>Puur</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProductDetail({ product }: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [tab, setTab] = useState<"info" | "ingredienten" | "certificaten">("info");

  const TABS = [
    { key: "info"         as const, label: "Info"          },
    { key: "ingredienten" as const, label: "Ingrediënten"  },
    { key: "certificaten" as const, label: "Certificaten"  },
  ];

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 relative"
        style={{
          height: 260,
          background: product.imageUrl
            ? `url(${product.imageUrl}) center/cover`
            : "linear-gradient(135deg, #EFF5EE 0%, #BDD2B7 100%)",
        }}
      >
        {/* Emoji placeholder when no image */}
        {!product.imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-7xl">
            🍫
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(18,42,26,0.3) 0%, transparent 50%, rgba(18,42,26,0.15) 100%)",
          }}
        />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-14">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm"
            style={{ background: "rgba(255,255,255,0.85)" }}
            aria-label="Terug"
          >
            <ChevronLeft size={20} color="#304C3A" />
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setLiked((l) => !l)}
              className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.85)" }}
              aria-label="Bewaar"
            >
              <Heart
                size={18}
                color={liked ? "#DC2626" : "#304C3A"}
                fill={liked ? "#DC2626" : "none"}
                strokeWidth={1.75}
              />
            </button>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.85)" }}
              aria-label="Deel"
            >
              <Share2 size={17} color="#304C3A" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute bottom-4 left-5 flex gap-2">
          {product.isLimitedEdition && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm"
              style={{ background: "rgba(147,51,234,0.85)", color: "#ffffff" }}
            >
              Limited Edition
            </span>
          )}
          {product.isPremium && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm flex items-center gap-1"
              style={{ background: "rgba(202,138,4,0.9)", color: "#ffffff" }}
            >
              <Star size={10} fill="white" strokeWidth={0} /> Premium
            </span>
          )}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Title */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4">
          <h1
            className="font-display text-[1.6rem] font-semibold leading-tight"
            style={{ color: "#122A1A" }}
          >
            {product.name}
          </h1>
          {product.category && (
            <p className="text-xs mt-0.5 font-medium uppercase tracking-wider" style={{ color: "#9aada2" }}>
              {product.category}
            </p>
          )}

          {/* Meta pills */}
          <div className="flex flex-wrap gap-3 mt-3">
            {product.origin && (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: "#7a8f82" }}>
                <MapPin size={13} strokeWidth={1.75} />
                {product.origin}
              </div>
            )}
            {product.batchNumber && (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: "#7a8f82" }}>
                <Hash size={13} strokeWidth={1.75} />
                Batch {product.batchNumber}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex-shrink-0 flex px-5 border-b gap-5"
          style={{ borderColor: "#f0f0f0" }}
        >
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="pb-3 text-sm font-medium transition-colors relative"
              style={{ color: tab === key ? "#304C3A" : "#9aada2" }}
            >
              {label}
              {tab === key && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: "#51C675" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">

          {/* ── Info ── */}
          {tab === "info" && (
            <div className="flex flex-col gap-6">
              {product.description && (
                <InfoSection title="Over dit product">
                  <p className="text-sm leading-relaxed" style={{ color: "#5a6e62" }}>
                    {product.description}
                  </p>
                </InfoSection>
              )}

              {product.cacaoPercentage != null && (
                <InfoSection title="Samenstelling">
                  <CacaoMeter percentage={product.cacaoPercentage} />
                </InfoSection>
              )}

              {product.allergens.length > 0 && (
                <InfoSection title="Allergenen">
                  <div
                    className="flex items-start gap-3 p-3.5 rounded-2xl"
                    style={{ background: "#FEF9C3" }}
                  >
                    <AlertTriangle
                      size={16}
                      color="#CA8A04"
                      className="flex-shrink-0 mt-0.5"
                      strokeWidth={1.75}
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {product.allergens.map((a) => (
                        <Pill key={a} label={a} color="#92400E" bg="#FEF3C7" />
                      ))}
                    </div>
                  </div>
                </InfoSection>
              )}

              {/* Klacht indienen shortcut */}
              <button
                onClick={() =>
                  router.push(`/dashboard/klachten/indienen?productId=${product.id}`)
                }
                className="flex items-center gap-3 p-4 rounded-2xl w-full text-left"
                style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
              >
                <MessageCircle size={18} color="#DC2626" strokeWidth={1.75} className="flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium" style={{ color: "#DC2626" }}>
                    Probleem met dit product?
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#9aada2" }}>
                    Dien een klacht in via de app
                  </p>
                </div>
                <ChevronLeft
                  size={16}
                  color="#DC2626"
                  className="ml-auto flex-shrink-0 rotate-180"
                />
              </button>
            </div>
          )}

          {/* ── Ingrediënten ── */}
          {tab === "ingredienten" && (
            <div className="flex flex-col gap-4">
              {product.ingredients.length === 0 ? (
                <p className="text-sm" style={{ color: "#9aada2" }}>
                  Geen ingrediënten beschikbaar.
                </p>
              ) : (
                <div
                  className="rounded-2xl overflow-hidden border"
                  style={{ borderColor: "#e8ede9" }}
                >
                  {product.ingredients.map((ing, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
                      style={{ borderColor: "#f0f0f0" }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: "#51C675" }}
                      />
                      <span className="text-sm" style={{ color: "#304C3A" }}>
                        {ing}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {product.allergens.length > 0 && (
                <div
                  className="flex items-center gap-2 p-3 rounded-xl text-xs"
                  style={{ background: "#FEF9C3", color: "#92400E" }}
                >
                  <AlertTriangle size={13} strokeWidth={2} />
                  Bevat: {product.allergens.join(", ")}
                </div>
              )}
            </div>
          )}

          {/* ── Certificaten ── */}
          {tab === "certificaten" && (
            <div className="flex flex-col gap-3">
              {product.certifications.length === 0 ? (
                <div
                  className="rounded-2xl p-6 text-center"
                  style={{ background: "#f5f8f5" }}
                >
                  <p className="text-sm" style={{ color: "#9aada2" }}>
                    Geen certificeringen beschikbaar.
                  </p>
                </div>
              ) : (
                product.certifications.map((cert) => (
                  <div
                    key={cert}
                    className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{ background: "#EFF5EE" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(48,76,58,0.12)" }}
                    >
                      <Award size={20} color="#304C3A" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "#122A1A" }}>
                        {cert}
                      </p>
                    </div>
                    <Leaf size={14} color="#51C675" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
