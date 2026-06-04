"use client";

/**
 * MelkChocoladeBarcode
 *
 * Vaste sectie op de admin Presentatie-pagina.
 * Toont een QR-code + barcode voor prod-melk-001 (Melkchocolade).
 * De QR-code encodt het product-id zodat PresentatieScanScreen
 * het direct kan scannen via /api/products/scan.
 *
 * Gebruik in PresentatieBeheer.tsx — voeg toe onder de sessie-lijst:
 *   import MelkChocoladeBarcode from "@/components/presentatie/MelkChocoladeBarcode";
 *   <MelkChocoladeBarcode />
 */

import { useState, useEffect, useRef } from "react";
import { Copy, Check, Download, QrCode } from "lucide-react";

const PRODUCT_ID   = "prod-melk-001";
const PRODUCT_NAME = "Melkchocolade";
const PRODUCT_META = {
  origin:          "Ghana",
  cacao:           "38%",
  certifications:  ["Fairtrade", "Rainforest Alliance"],
};

// QR via goedgekeurde publieke API (al gebruikt in QRModal)
function qrUrl(data: string, size = 280) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=EFF5EE&color=122A1A&margin=12&format=png`;
}

// Minimalistische Code-128-achtige barcode via barcode-API
function barcodeUrl(code: string) {
  return `https://barcodeapi.org/api/128/${encodeURIComponent(code)}`;
}

export default function MelkChocoladeBarcode() {
  const [tab, setTab]         = useState<"qr" | "barcode">("qr");
  const [copied, setCopied]   = useState(false);
  const [qrLoaded, setQrLoaded]     = useState(false);
  const [bcLoaded, setBcLoaded]     = useState(false);
  const qrRef  = useRef<HTMLImageElement>(null);
  const bcRef  = useRef<HTMLImageElement>(null);

  // Pre-load beide afbeeldingen
  useEffect(() => {
    const qrImg = new Image();
    qrImg.src = qrUrl(PRODUCT_ID);
    qrImg.onload = () => setQrLoaded(true);

    const bcImg = new Image();
    bcImg.src = barcodeUrl(PRODUCT_ID);
    bcImg.onload = () => setBcLoaded(true);
  }, []);

  async function handleCopy() {
    await navigator.clipboard.writeText(PRODUCT_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownload() {
    const src = tab === "qr" ? qrUrl(PRODUCT_ID, 400) : barcodeUrl(PRODUCT_ID);
    const filename = tab === "qr"
      ? `aveline-qr-melkchocolade.png`
      : `aveline-barcode-melkchocolade.png`;

    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(src, "_blank");
    }
  }

  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: "#e8ede9", background: "#ffffff" }}
    >
      {/* Header */}
      <div
        className="px-5 pt-5 pb-4 border-b"
        style={{ borderColor: "#f0f0f0", background: "#304C3A" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              🍫
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#ffffff" }}>
                {PRODUCT_NAME}
              </p>
              <p className="text-[10px] font-mono mt-0.5" style={{ color: "#BDD2B7" }}>
                {PRODUCT_ID}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {PRODUCT_META.certifications.map((c) => (
              <span
                key={c}
                className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(81,198,117,0.2)", color: "#51C675" }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Meta pills */}
        <div className="flex gap-2 mt-3">
          <span className="text-[10px] font-medium px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.1)", color: "#BDD2B7" }}>
            🌍 {PRODUCT_META.origin}
          </span>
          <span className="text-[10px] font-medium px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.1)", color: "#BDD2B7" }}>
            🍫 {PRODUCT_META.cacao} cacao
          </span>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b" style={{ borderColor: "#f0f0f0" }}>
        {(["qr", "barcode"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-colors relative"
            style={{ color: tab === t ? "#304C3A" : "#9aada2" }}
          >
            {t === "qr" ? <QrCode size={14} /> : <span className="text-sm">▮▯▮▮▯▮</span>}
            {t === "qr" ? "QR-code" : "Barcode"}
            {tab === t && (
              <span
                className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                style={{ background: "#51C675" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Code display */}
      <div className="px-5 py-6 flex flex-col items-center gap-4">

        {/* QR code */}
        {tab === "qr" && (
          <div
            className="rounded-2xl p-4 flex flex-col items-center gap-3"
            style={{ background: "#EFF5EE", border: "2px solid #BDD2B7", width: "100%" }}
          >
            {!qrLoaded && (
              <div
                className="w-48 h-48 rounded-xl flex items-center justify-center"
                style={{ background: "#f0f5f0" }}
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-t-transparent"
                  style={{
                    borderColor: "#BDD2B7",
                    borderTopColor: "transparent",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
              </div>
            )}
            <img
              ref={qrRef}
              src={qrUrl(PRODUCT_ID)}
              alt={`QR code voor ${PRODUCT_NAME}`}
              width={192}
              height={192}
              className="rounded-xl"
              style={{ display: qrLoaded ? "block" : "none" }}
              onLoad={() => setQrLoaded(true)}
            />
            <p className="text-[10px] text-center" style={{ color: "#9aada2" }}>
              Deelnemers scannen dit met de app
            </p>
          </div>
        )}

        {/* Barcode */}
        {tab === "barcode" && (
          <div
            className="rounded-2xl p-4 flex flex-col items-center gap-3"
            style={{ background: "#ffffff", border: "2px solid #e8ede9", width: "100%" }}
          >
            {!bcLoaded && (
              <div
                className="h-20 w-full rounded-xl flex items-center justify-center"
                style={{ background: "#f5f8f5" }}
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-t-transparent"
                  style={{
                    borderColor: "#BDD2B7",
                    borderTopColor: "transparent",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
              </div>
            )}
            <img
              ref={bcRef}
              src={barcodeUrl(PRODUCT_ID)}
              alt={`Barcode voor ${PRODUCT_NAME}`}
              className="rounded-lg w-full"
              style={{
                display: bcLoaded ? "block" : "none",
                maxHeight: 100,
                objectFit: "contain",
              }}
              onLoad={() => setBcLoaded(true)}
              onError={() => setBcLoaded(true)} // toon fallback
            />
            <p
              className="font-mono text-sm font-bold tracking-widest"
              style={{ color: "#304C3A" }}
            >
              {PRODUCT_ID}
            </p>
            <p className="text-[10px] text-center" style={{ color: "#9aada2" }}>
              Code-128 formaat · scanbaar door de app
            </p>
          </div>
        )}

        {/* Product-id copy row */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl w-full"
          style={{ background: "#f5f8f5", border: "1px dashed #BDD2B7" }}
        >
          <span className="text-xs flex-1 font-mono truncate" style={{ color: "#304C3A" }}>
            {PRODUCT_ID}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full flex-shrink-0 transition-all"
            style={{
              background: copied ? "#EFF5EE" : "#e8ede9",
              color: copied ? "#304C3A" : "#7a8f82",
            }}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? "Gekopieerd!" : "Kopieer"}
          </button>
        </div>

        {/* Download */}
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all active:scale-95"
          style={{ background: "#EFF5EE", color: "#304C3A" }}
        >
          <Download size={15} strokeWidth={2} />
          {tab === "qr" ? "QR-code downloaden" : "Barcode downloaden"}
        </button>
      </div>

      {/* Instructie */}
      <div
        className="mx-5 mb-5 px-4 py-3 rounded-xl flex items-start gap-2"
        style={{ background: "#FEF3C7" }}
      >
        <span className="text-sm flex-shrink-0 mt-0.5">💡</span>
        <p className="text-xs leading-relaxed" style={{ color: "#92400E" }}>
          Toon de {tab === "qr" ? "QR-code" : "barcode"} op het scherm. Deelnemers scannen
          dit via <strong>Scan</strong> in de app en krijgen direct de productinfo te zien.
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}