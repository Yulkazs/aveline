"use client";

/**
 * PresentatieScanScreen
 *
 * Drop-in vervanging voor de statische ScanScreen in PresentatieDashboard.
 * Gebruikt de bestaande ScannerView voor echte barcode/QR-scan en toont
 * een product-modal met herkomst, cacao, certificeringen etc.
 *
 * Gebruik in PresentatieDashboard.tsx:
 *   import PresentatieScanScreen from "@/components/presentatie/PresentatieScanScreen";
 *   // vervang <ScanScreen /> door <PresentatieScanScreen />
 */

import { useState, useCallback } from "react";
import { Award, X, MapPin, Percent, Hash, ShieldCheck, ChevronDown } from "lucide-react";
import ScannerView from "@/components/scan/ScannerView";

// ── Types ─────────────────────────────────────────────────────────────────────

type ScannedProduct = {
  id: string;
  name: string;
  description: string | null;
  origin: string | null;
  cacaoPercentage: number | null;
  batchNumber: string | null;
  isPremium: boolean;
  isLimitedEdition: boolean;
  certifications: string[];
  allergens: string[];
  ingredients: string[];
  category: string | null;
};

type GamificationResult = {
  pointsAdded: number;
  newTotal: number;
  badgesEarned: Array<{ name: string }>;
};

type ScanState = "scanning" | "loading" | "result" | "error";

// ── Helpers ───────────────────────────────────────────────────────────────────

const CERT_COLORS: Record<string, { bg: string; color: string }> = {
  "Fairtrade":          { bg: "#F0FDF4", color: "#15803D" },
  "Rainforest Alliance":{ bg: "#ECFDF5", color: "#047857" },
  "Bio":                { bg: "#FFF7ED", color: "#9A3412" },
  "UTZ":                { bg: "#EFF6FF", color: "#1D4ED8" },
};

function certStyle(cert: string) {
  return CERT_COLORS[cert] ?? { bg: "#EFF5EE", color: "#304C3A" };
}

// ── Product Modal ─────────────────────────────────────────────────────────────

function ProductModal({
  product,
  gamification,
  onClose,
  onScanAgain,
}: {
  product: ScannedProduct;
  gamification: GamificationResult | null;
  onClose: () => void;
  onScanAgain: () => void;
}) {
  const [showIngredients, setShowIngredients] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(18,42,26,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl overflow-hidden"
        style={{
          background: "#ffffff",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 300ms cubic-bezier(0.34,1.56,0.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex-shrink-0 pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full" style={{ background: "#e0e0e0" }} />
        </div>

        {/* Header */}
        <div
          className="flex-shrink-0 flex items-start justify-between px-5 pt-2 pb-4"
          style={{ borderBottom: "1px solid #f0f0f0" }}
        >
          <div className="flex-1 min-w-0 pr-3">
            {/* Badges */}
            <div className="flex gap-1.5 mb-2 flex-wrap">
              {product.isPremium && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "#FEF3C7", color: "#92400E" }}
                >
                  ✦ Premium
                </span>
              )}
              {product.isLimitedEdition && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "#F5F3FF", color: "#5B21B6" }}
                >
                  Limited Edition
                </span>
              )}
              {product.category && (
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: "#f5f8f5", color: "#7a8f82" }}
                >
                  {product.category}
                </span>
              )}
            </div>
            <h2
              className="font-display text-xl font-semibold leading-snug"
              style={{ color: "#122A1A" }}
            >
              {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "#f5f8f5" }}
          >
            <X size={16} color="#304C3A" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* Gamification banner */}
          {gamification && gamification.pointsAdded > 0 && (
            <div
              className="flex items-center gap-3 p-3.5 rounded-2xl mb-4"
              style={{ background: "#304C3A" }}
            >
              <span className="text-2xl flex-shrink-0">⭐</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">
                  +{gamification.pointsAdded} punten verdiend!
                </p>
                {gamification.badgesEarned.length > 0 && (
                  <p className="text-xs mt-0.5" style={{ color: "#BDD2B7" }}>
                    Nieuwe badge: {gamification.badgesEarned[0].name} 🏅
                  </p>
                )}
                <p className="text-xs mt-0.5" style={{ color: "#BDD2B7" }}>
                  Totaal: {gamification.newTotal} punten
                </p>
              </div>
            </div>
          )}

          {/* Emoji + key stats */}
          <div
            className="flex items-center gap-4 p-4 rounded-2xl mb-4"
            style={{ background: "#EFF5EE" }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
              style={{ background: "rgba(48,76,58,0.12)" }}
            >
              🍫
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              {product.origin && (
                <div className="flex items-center gap-2">
                  <MapPin size={13} color="#7a8f82" strokeWidth={1.75} className="flex-shrink-0" />
                  <span className="text-sm" style={{ color: "#304C3A" }}>
                    <span className="font-medium">Herkomst:</span> {product.origin}
                  </span>
                </div>
              )}
              {product.cacaoPercentage != null && (
                <div className="flex items-center gap-2">
                  <Percent size={13} color="#7a8f82" strokeWidth={1.75} className="flex-shrink-0" />
                  <span className="text-sm" style={{ color: "#304C3A" }}>
                    <span className="font-medium">Cacao:</span> {product.cacaoPercentage}%
                  </span>
                </div>
              )}
              {product.batchNumber && (
                <div className="flex items-center gap-2">
                  <Hash size={13} color="#7a8f82" strokeWidth={1.75} className="flex-shrink-0" />
                  <span className="text-sm" style={{ color: "#9aada2" }}>
                    Batch #{product.batchNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Cacao visual bar */}
          {product.cacaoPercentage != null && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold" style={{ color: "#9aada2" }}>
                  CACAO GEHALTE
                </span>
                <span className="text-sm font-bold" style={{ color: "#304C3A" }}>
                  {product.cacaoPercentage}%
                </span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#e8ede9" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${product.cacaoPercentage}%`,
                    background: `linear-gradient(90deg, #BDD2B7 0%, #304C3A ${Math.min(product.cacaoPercentage, 100)}%)`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px]" style={{ color: "#BDD2B7" }}>Mild (0%)</span>
                <span className="text-[9px]" style={{ color: "#BDD2B7" }}>Puur (100%)</span>
              </div>
            </div>
          )}

          {/* Beschrijving */}
          {product.description && (
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#9aada2" }}>
                OMSCHRIJVING
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "#7a8f82" }}>
                {product.description}
              </p>
            </div>
          )}

          {/* Certificeringen */}
          {product.certifications.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#9aada2" }}>
                CERTIFICERINGEN
              </p>
              <div className="flex flex-wrap gap-2">
                {product.certifications.map((cert) => {
                  const style = certStyle(cert);
                  return (
                    <div
                      key={cert}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                      style={{ background: style.bg, border: `1px solid ${style.color}30` }}
                    >
                      <Award size={11} color={style.color} />
                      <span className="text-xs font-semibold" style={{ color: style.color }}>
                        {cert}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Allergenen */}
          {product.allergens.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#9aada2" }}>
                ALLERGENEN
              </p>
              <div className="flex flex-wrap gap-2">
                {product.allergens.map((a) => (
                  <span
                    key={a}
                    className="text-xs font-medium px-3 py-1.5 rounded-full"
                    style={{
                      background: "#FEF2F2",
                      color: "#DC2626",
                      border: "1.5px solid #FECACA",
                    }}
                  >
                    ⚠ {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ingrediënten (inklapbaar) */}
          {product.ingredients.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setShowIngredients((v) => !v)}
                className="flex items-center justify-between w-full"
              >
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#9aada2" }}>
                  INGREDIËNTEN
                </p>
                <ChevronDown
                  size={14}
                  color="#9aada2"
                  style={{
                    transform: showIngredients ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 200ms",
                  }}
                />
              </button>
              {showIngredients && (
                <p className="text-xs leading-relaxed mt-2" style={{ color: "#7a8f82" }}>
                  {product.ingredients.join(", ")}
                </p>
              )}
            </div>
          )}

          {/* Duurzaamheids-icoon */}
          {product.certifications.some((c) =>
            ["Fairtrade", "Rainforest Alliance", "Bio"].includes(c)
          ) && (
            <div
              className="flex items-center gap-3 p-3.5 rounded-2xl mb-2"
              style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}
            >
              <ShieldCheck size={20} color="#15803D" className="flex-shrink-0" />
              <p className="text-xs leading-relaxed" style={{ color: "#15803D" }}>
                Dit product is gecertificeerd voor duurzame teelt en eerlijke handel.
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex-shrink-0 px-5 pt-3 pb-8 flex gap-3">
          <button
            onClick={onScanAgain}
            className="flex-1 py-3.5 rounded-2xl text-sm font-semibold"
            style={{ background: "#304C3A", color: "#ffffff" }}
          >
            Nog een product scannen
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3.5 rounded-2xl text-sm font-medium"
            style={{ background: "#f5f8f5", color: "#7a8f82" }}
          >
            Sluiten
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Error toast ───────────────────────────────────────────────────────────────

function ErrorToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div
      className="absolute bottom-32 left-4 right-4 z-20 flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{ background: "rgba(220,38,38,0.9)", backdropFilter: "blur(4px)" }}
    >
      <span className="text-lg flex-shrink-0">⚠️</span>
      <p className="text-sm text-white flex-1 leading-snug">{message}</p>
      <button
        onClick={onDismiss}
        className="text-white opacity-70 text-xl leading-none flex-shrink-0"
      >
        ×
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PresentatieScanScreen() {
  const [scanState, setScanState]       = useState<ScanState>("scanning");
  const [torch, setTorch]               = useState(false);
  const [product, setProduct]           = useState<ScannedProduct | null>(null);
  const [gamification, setGamification] = useState<GamificationResult | null>(null);
  const [errorMsg, setErrorMsg]         = useState<string | null>(null);

  const handleScan = useCallback(async (barcode: string) => {
    setScanState("loading");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/products/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: barcode }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(data.message ?? "Product niet gevonden. Probeer opnieuw.");
        setScanState("error");
        // Na 3 seconden automatisch terugkeren naar scannen
        setTimeout(() => {
          setErrorMsg(null);
          setScanState("scanning");
        }, 3000);
        return;
      }

      setProduct(data.product);
      setGamification(data.gamification ?? null);
      setScanState("result");
    } catch {
      setErrorMsg("Er ging iets mis. Controleer je verbinding.");
      setScanState("error");
      setTimeout(() => {
        setErrorMsg(null);
        setScanState("scanning");
      }, 3000);
    }
  }, []);

  function handleCloseModal() {
    setProduct(null);
    setGamification(null);
    setScanState("scanning");
  }

  function handleScanAgain() {
    setProduct(null);
    setGamification(null);
    setScanState("scanning");
  }

  const isActive = scanState === "scanning" || scanState === "error";

  return (
    <div className="flex flex-col h-full bg-black relative">

      {/* Camera */}
      <div className="flex-1 relative overflow-hidden">
        <ScannerView
          active={isActive}
          torch={torch}
          onScan={handleScan}
        />

        {/* Loading overlay */}
        {scanState === "loading" && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10"
            style={{ background: "rgba(0,0,0,0.7)" }}
          >
            <div
              className="w-10 h-10 rounded-full border-2 border-t-transparent"
              style={{
                borderColor: "#51C675",
                borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p className="text-sm font-medium text-white">Product opzoeken…</p>
          </div>
        )}

        {/* Error toast */}
        {scanState === "error" && errorMsg && (
          <ErrorToast message={errorMsg} onDismiss={() => {
            setErrorMsg(null);
            setScanState("scanning");
          }} />
        )}
      </div>

      {/* Bottom bar */}
      <div
        className="flex-shrink-0 flex flex-col items-center gap-3 px-6 pb-10 pt-5"
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      >
        <p className="text-xs text-white text-center" style={{ opacity: 0.6 }}>
          Richt de camera op de QR-code of barcode van het product
        </p>
        <button
          onClick={() => setTorch((t) => !t)}
          className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full transition-all"
          style={{
            background: torch ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.12)",
            color: torch ? "#F59E0B" : "rgba(255,255,255,0.7)",
            border: torch ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {torch ? "⚡ Zaklamp aan" : "🔦 Zaklamp"}
        </button>
      </div>

      {/* Product modal */}
      {scanState === "result" && product && (
        <ProductModal
          product={product}
          gamification={gamification}
          onClose={handleCloseModal}
          onScanAgain={handleScanAgain}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}