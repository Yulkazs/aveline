"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Award,
  MapPin,
  Layers,
  AlertTriangle,
  Info,
  Flag,
} from "lucide-react";
import KlachtForm from "@/components/producten/KlachtForm";

type Product = {
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

type Props = {
  product: Product;
  /** When true, shows a back button that goes to /dashboard/producten */
  fromDashboard?: boolean;
};

type Section = "info" | "ingredienten" | "certificeringen";

export default function ProductDetail({ product, fromDashboard = false }: Props) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>("info");
  const [klachtOpen, setKlachtOpen] = useState(false);

  const sections: { id: Section; label: string }[] = [
    { id: "info",           label: "Info"           },
    { id: "ingredienten",   label: "Ingrediënten"   },
    { id: "certificeringen", label: "Certificaten" },
  ];

  return (
    <>
      <div className="flex flex-col h-full" style={{ background: "#F5F8F5" }}>
        {/* ── Hero ───────────────────────────────────────────────── */}
        <div
          className="relative flex-shrink-0"
          style={{ background: "#EFF5EE", minHeight: 220 }}
        >
          {/* Back button */}
          <button
            onClick={() =>
              fromDashboard
                ? router.push("/dashboard/producten")
                : router.back()
            }
            className="absolute top-14 left-5 z-10 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.85)" }}
            aria-label="Terug"
          >
            <ChevronLeft size={20} color="#304C3A" />
          </button>

          {/* Image or placeholder */}
          <div className="flex items-center justify-center pt-20 pb-8 px-8">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-40 h-40 object-contain drop-shadow-md"
              />
            ) : (
              <div
                className="w-36 h-36 rounded-3xl flex items-center justify-center"
                style={{ background: "rgba(48,76,58,0.1)" }}
              >
                <span className="text-6xl select-none">🍫</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="absolute bottom-4 left-5 flex gap-2">
            {product.isPremium && (
              <span
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(202,138,4,0.15)", color: "#92400E" }}
              >
                Premium
              </span>
            )}
            {product.isLimitedEdition && (
              <span
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(147,51,234,0.12)", color: "#6B21A8" }}
              >
                Limited Edition
              </span>
            )}
            {product.category && (
              <span
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize"
                style={{ background: "rgba(48,76,58,0.12)", color: "#304C3A" }}
              >
                {product.category}
              </span>
            )}
          </div>
        </div>

        {/* ── Name + quick stats ─────────────────────────────────── */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4" style={{ background: "#ffffff" }}>
          <h1 className="font-display text-2xl font-bold leading-tight" style={{ color: "#122A1A" }}>
            {product.name}
          </h1>

          <div className="flex flex-wrap gap-4 mt-3">
            {product.origin && (
              <div className="flex items-center gap-1.5">
                <MapPin size={14} color="#7a8f82" />
                <span className="text-sm" style={{ color: "#7a8f82" }}>
                  {product.origin}
                </span>
              </div>
            )}
            {product.cacaoPercentage != null && (
              <div className="flex items-center gap-1.5">
                <Layers size={14} color="#7a8f82" />
                <span className="text-sm" style={{ color: "#7a8f82" }}>
                  {product.cacaoPercentage}% cacao
                </span>
              </div>
            )}
            {product.batchNumber && (
              <div className="flex items-center gap-1.5">
                <Info size={14} color="#7a8f82" />
                <span className="text-sm" style={{ color: "#7a8f82" }}>
                  Batch #{product.batchNumber}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Tab bar ────────────────────────────────────────────── */}
        <div
          className="flex-shrink-0 flex gap-0 border-b"
          style={{ background: "#ffffff", borderColor: "#e8ede9" }}
        >
          {sections.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className="flex-1 py-3 text-sm font-medium relative transition-colors"
              style={{ color: activeSection === id ? "#304C3A" : "#9aada2" }}
            >
              {label}
              {activeSection === id && (
                <span
                  className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                  style={{ background: "#304C3A" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ── Tab content ────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-5">

          {/* Info tab */}
          {activeSection === "info" && (
            <div className="flex flex-col gap-5">
              {product.description && (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#9aada2" }}>
                    Over dit product
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: "#304C3A" }}>
                    {product.description}
                  </p>
                </div>
              )}

              {/* Key stats grid */}
              <div className="grid grid-cols-2 gap-3">
                {product.cacaoPercentage != null && (
                  <div className="rounded-2xl p-4" style={{ background: "#ffffff" }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#9aada2" }}>
                      Cacao
                    </p>
                    <p className="text-2xl font-bold" style={{ color: "#122A1A" }}>
                      {product.cacaoPercentage}
                      <span className="text-base font-medium">%</span>
                    </p>
                  </div>
                )}
                {product.origin && (
                  <div className="rounded-2xl p-4" style={{ background: "#ffffff" }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#9aada2" }}>
                      Herkomst
                    </p>
                    <p className="text-sm font-semibold leading-snug" style={{ color: "#122A1A" }}>
                      {product.origin}
                    </p>
                  </div>
                )}
                {product.batchNumber && (
                  <div className="rounded-2xl p-4" style={{ background: "#ffffff" }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#9aada2" }}>
                      Batch
                    </p>
                    <p className="text-sm font-semibold font-mono" style={{ color: "#122A1A" }}>
                      #{product.batchNumber}
                    </p>
                  </div>
                )}
                {product.category && (
                  <div className="rounded-2xl p-4" style={{ background: "#ffffff" }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#9aada2" }}>
                      Categorie
                    </p>
                    <p className="text-sm font-semibold capitalize" style={{ color: "#122A1A" }}>
                      {product.category}
                    </p>
                  </div>
                )}
              </div>

              {/* Allergens */}
              {product.allergens.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={14} color="#D97706" />
                    <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#9aada2" }}>
                      Allergenen
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.allergens.map((a) => (
                      <span
                        key={a}
                        className="text-xs font-medium px-3 py-1.5 rounded-full"
                        style={{ background: "rgba(217,119,6,0.1)", color: "#92400E" }}
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ingrediënten tab */}
          {activeSection === "ingredienten" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#9aada2" }}>
                Ingrediëntenlijst
              </h2>
              {product.ingredients.length === 0 ? (
                <p className="text-sm" style={{ color: "#9aada2" }}>
                  Geen ingrediënteninformatie beschikbaar.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {product.ingredients.map((ing, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 py-3 border-b last:border-0"
                      style={{ borderColor: "#e8ede9" }}
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: "#304C3A" }}
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
                  className="mt-2 rounded-2xl p-4 flex items-start gap-3"
                  style={{ background: "rgba(217,119,6,0.08)" }}
                >
                  <AlertTriangle size={16} color="#D97706" className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: "#92400E" }}>
                      Bevat allergenen
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "#92400E" }}>
                      {product.allergens.join(", ")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Certificeringen tab */}
          {activeSection === "certificeringen" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#9aada2" }}>
                Certificaten & keurmerken
              </h2>
              {product.certifications.length === 0 ? (
                <p className="text-sm" style={{ color: "#9aada2" }}>
                  Geen certificeringen beschikbaar voor dit product.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {product.certifications.map((cert) => (
                    <div
                      key={cert}
                      className="flex items-center gap-4 rounded-2xl p-4"
                      style={{ background: "#ffffff" }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "#EFF5EE" }}
                      >
                        <Award size={18} color="#304C3A" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#122A1A" }}>
                          {cert}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "#7a8f82" }}>
                          Gecertificeerd keurmerk
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Klacht melden CTA ──────────────────────────────────── */}
        <div
          className="flex-shrink-0 px-5 pb-8 pt-4 border-t"
          style={{ borderColor: "#e8ede9", background: "#ffffff" }}
        >
          <button
            onClick={() => setKlachtOpen(true)}
            className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium border transition-opacity active:opacity-70"
            style={{ borderColor: "#e8ede9", color: "#7a8f82", background: "#ffffff" }}
          >
            <Flag size={15} />
            Probleem melden
          </button>
        </div>
      </div>

      {/* Klacht sheet */}
      {klachtOpen && (
        <KlachtForm
          productId={product.id}
          productName={product.name}
          onClose={() => setKlachtOpen(false)}
        />
      )}
    </>
  );
}