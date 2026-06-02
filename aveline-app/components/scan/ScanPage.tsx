"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Zap, ZapOff, ArrowRight } from "lucide-react";
import ScannerView from "./ScannerView";
import ProductQuickview from "./ProductQuickview";

type ScannedProduct = {
  id: string;
  name: string;
  origin: string | null;
  cacaoPercentage: number | null;
  batchNumber: string | null;
  isPremium: boolean;
  isLimitedEdition: boolean;
  certifications: string[];
};

type GamificationResult = {
  pointsAdded: number;
  newTotal: number;
  badgesEarned: Array<{ name: string }>;
};

type View = "welcome" | "scanning" | "result";

export default function ScanPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("welcome");
  const [torch, setTorch] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [gamification, setGamification] = useState<GamificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);

  const handleScan = useCallback(async (barcode: string) => {
    setError(null);
    setLastBarcode(barcode);

    try {
      const res = await fetch("/api/products/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: barcode }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message ?? "Product niet gevonden. Probeer opnieuw.");
        // Stay in scanning view, let user retry
        return;
      }

      setScannedProduct(data.product);
      setGamification(data.gamification ?? null);
      setView("result");
    } catch {
      setError("Er ging iets mis. Controleer je verbinding.");
    }
  }, []);

  function handleCloseQuickview() {
    setScannedProduct(null);
    setGamification(null);
    setError(null);
    setLastBarcode(null);
    setView("scanning");
  }

  function handleBackToWelcome() {
    setView("welcome");
    setError(null);
    setLastBarcode(null);
  }

  // ─── Welcome screen ──────────────────────────────────────────────────────

  if (view === "welcome") {
    return (
      <div
        className="flex flex-col h-full"
        style={{ background: "#F5F8F5" }}
      >
        {/* Header */}
        <div className="flex items-center px-5 pt-14 pb-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center mr-3"
            style={{ background: "#EFF5EE" }}
            aria-label="Terug"
          >
            <ChevronLeft size={20} color="#304C3A" />
          </button>
          <h1 className="font-display text-lg font-semibold" style={{ color: "#122A1A" }}>
            Product registreren
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 pb-10">
          {/* Icon */}
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl"
            style={{ background: "#EFF5EE" }}
          >
            🍫
          </div>

          {/* Title + explanation */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-3" style={{ color: "#122A1A" }}>
              Welkom bij Aveline
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "#6B7F73" }}>
              Scan de barcode of QR-code op de verpakking om herkomst,
              ingrediënten en certificeringen van jouw chocolade te bekijken.
            </p>
          </div>

          {/* Benefits */}
          <div
            className="w-full rounded-2xl p-4 flex flex-col gap-3"
            style={{ background: "#EFF5EE" }}
          >
            {[
              { icon: "🌍", text: "Bekijk herkomst en cacaopercentage" },
              { icon: "✅", text: "Controleer allergenen en ingrediënten" },
              { icon: "🏅", text: "Verdien punten bij elk gescand product" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <span className="text-sm font-medium" style={{ color: "#304C3A" }}>
                  {text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => setView("scanning")}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-base font-semibold transition-opacity active:opacity-80"
              style={{ background: "#304C3A", color: "#ffffff" }}
            >
              <span className="text-xl">📷</span>
              Barcode scannen
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-base font-medium transition-opacity active:opacity-80"
              style={{ background: "#EFF5EE", color: "#304C3A" }}
            >
              Doorgaan zonder scan
            </button>
          </div>

          <p className="text-xs text-center" style={{ color: "#9aada2" }}>
            Scannen als gast — geen account nodig
          </p>
        </div>
      </div>
    );
  }

  // ─── Scanning screen ─────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header overlay */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 pt-14 pb-4 absolute top-0 left-0 right-0 z-10"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)" }}
      >
        <button
          onClick={handleBackToWelcome}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.15)" }}
          aria-label="Terug"
        >
          <ChevronLeft size={20} color="#ffffff" />
        </button>

        <h1 className="font-display text-lg font-semibold text-white">
          Product scannen
        </h1>

        <button
          onClick={() => setTorch((t) => !t)}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.15)" }}
          aria-label="Zaklamp aan/uit"
        >
          {torch ? (
            <Zap size={18} color="#F59E0B" />
          ) : (
            <ZapOff size={18} color="#ffffff" />
          )}
        </button>
      </div>

      {/* Camera / scanner — only active when in scanning view */}
      <div className="flex-1 relative">
        <ScannerView
          active={view === "scanning"}
          torch={torch}
          onScan={handleScan}
        />
      </div>

      {/* Bottom bar */}
      <div
        className="flex-shrink-0 flex flex-col items-center gap-3 px-6 pb-10 pt-6 absolute bottom-0 left-0 right-0 z-10"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}
      >
        {error && (
          <div className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl"
            style={{ background: "rgba(220,38,38,0.85)" }}>
            <span className="text-lg">⚠️</span>
            <p className="text-sm text-white flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-white opacity-70 text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}

        {lastBarcode && !error && (
          <div className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl"
            style={{ background: "rgba(81,198,117,0.15)" }}>
            <span className="text-lg">✅</span>
            <p className="text-xs text-white font-mono truncate flex-1">
              {lastBarcode}
            </p>
          </div>
        )}

        <p className="text-sm text-white text-center" style={{ opacity: 0.7 }}>
          Richt de camera op de QR-code of barcode van het product
        </p>

        <button
          onClick={handleBackToWelcome}
          className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-full"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          Doorgaan zonder scan
        </button>
      </div>

      {/* Quickview sheet — shown when result is ready */}
      {view === "result" && scannedProduct && (
        <ProductQuickview
          product={scannedProduct}
          gamification={gamification}
          onClose={handleCloseQuickview}
        />
      )}
    </div>
  );
}