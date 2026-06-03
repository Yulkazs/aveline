"use client";

import { useState } from "react";
import { X, ChevronRight, CheckCircle } from "lucide-react";

type Props = {
  productId: string;
  productName: string;
  onClose: () => void;
};

type Step = "type" | "description" | "confirm" | "success";

const COMPLAINT_TYPES = [
  {
    value: "MELT_DAMAGE",
    label: "Smeltschade",
    description: "Product is gesmolten of heeft warmteschade",
    icon: "🌡️",
  },
  {
    value: "BREAK_DAMAGE",
    label: "Breukschade",
    description: "Product is gebroken of beschadigd",
    icon: "💔",
  },
  {
    value: "TEXTURE_DEVIATION",
    label: "Afwijkende structuur",
    description: "Textuur of uiterlijk klopt niet",
    icon: "🔍",
  },
  {
    value: "OTHER",
    label: "Anders",
    description: "Een ander type probleem",
    icon: "💬",
  },
] as const;

type ComplaintType = (typeof COMPLAINT_TYPES)[number]["value"];

export default function KlachtForm({ productId, productName, onClose }: Props) {
  const [step, setStep] = useState<Step>("type");
  const [selectedType, setSelectedType] = useState<ComplaintType | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);

  async function handleSubmit() {
    if (!selectedType || description.trim().length < 20) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          type: selectedType,
          description: description.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message ?? "Er ging iets mis. Probeer opnieuw.");
        setLoading(false);
        return;
      }

      setReferenceNumber(data.complaint?.referenceNumber ?? null);
      setStep("success");
    } catch {
      setError("Er ging iets mis. Controleer je verbinding.");
    } finally {
      setLoading(false);
    }
  }

  const selectedTypeMeta = COMPLAINT_TYPES.find((t) => t.value === selectedType);
  const descriptionValid = description.trim().length >= 20;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={step === "success" ? onClose : undefined}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl flex flex-col"
        style={{ background: "#ffffff", maxHeight: "92dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mt-4 mb-1 flex-shrink-0" style={{ background: "#e4e4e4" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#9aada2" }}>
              {step === "success" ? "Klacht ingediend" : "Klacht melden"}
            </p>
            {step !== "success" && (
              <p className="text-sm font-medium mt-0.5 truncate max-w-[240px]" style={{ color: "#304C3A" }}>
                {productName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#f5f8f5" }}
            aria-label="Sluiten"
          >
            <X size={14} color="#304C3A" />
          </button>
        </div>

        {/* Progress bar */}
        {step !== "success" && (
          <div className="px-5 mb-1 flex-shrink-0">
            <div className="h-1 rounded-full w-full" style={{ background: "#EFF5EE" }}>
              <div
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  background: "#51C675",
                  width:
                    step === "type"        ? "33%" :
                    step === "description" ? "66%" : "100%",
                }}
              />
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* ── Step 1: Type ─────────────────────────────────────── */}
          {step === "type" && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold mb-1" style={{ color: "#122A1A" }}>
                Wat is het probleem?
              </h2>
              {COMPLAINT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className="w-full text-left rounded-2xl p-4 flex items-center gap-4 border-2 transition-all"
                  style={{
                    borderColor: selectedType === type.value ? "#304C3A" : "#e8ede9",
                    background: selectedType === type.value ? "#EFF5EE" : "#ffffff",
                  }}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: "#122A1A" }}>
                      {type.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#7a8f82" }}>
                      {type.description}
                    </p>
                  </div>
                  {selectedType === type.value && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "#304C3A" }}
                    >
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ── Step 2: Description ──────────────────────────────── */}
          {step === "description" && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-bold" style={{ color: "#122A1A" }}>
                  Omschrijf het probleem
                </h2>
                <p className="text-sm mt-1" style={{ color: "#7a8f82" }}>
                  Type:{" "}
                  <span className="font-medium" style={{ color: "#304C3A" }}>
                    {selectedTypeMeta?.label}
                  </span>
                </p>
              </div>

              <div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Beschrijf zo duidelijk mogelijk wat er mis is met het product…"
                  rows={5}
                  className="w-full rounded-2xl p-4 text-sm resize-none outline-none border-2 transition-colors"
                  style={{
                    borderColor: description.length > 0 && !descriptionValid ? "#EF4444" : description.length > 0 ? "#51C675" : "#e8ede9",
                    background: "#F5F8F5",
                    color: "#122A1A",
                  }}
                />
                <div className="flex items-center justify-between mt-1.5 px-1">
                  <p
                    className="text-xs"
                    style={{
                      color:
                        description.length === 0 ? "#9aada2" :
                        !descriptionValid ? "#EF4444" : "#51C675",
                    }}
                  >
                    {description.length === 0
                      ? "Minimaal 20 tekens"
                      : !descriptionValid
                      ? `Nog ${20 - description.trim().length} tekens nodig`
                      : "Voldoende omschrijving"}
                  </p>
                  <p className="text-xs" style={{ color: "#9aada2" }}>
                    {description.length} tekens
                  </p>
                </div>
              </div>

              {error && (
                <div
                  className="rounded-2xl px-4 py-3 text-sm"
                  style={{ background: "#FEE2E2", color: "#991B1B" }}
                >
                  {error}
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Confirm ──────────────────────────────────── */}
          {step === "confirm" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold" style={{ color: "#122A1A" }}>
                Controleer je klacht
              </h2>

              <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "#e8ede9" }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: "#e8ede9", background: "#F5F8F5" }}>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#9aada2" }}>
                    Product
                  </p>
                  <p className="text-sm font-medium mt-0.5" style={{ color: "#122A1A" }}>
                    {productName}
                  </p>
                </div>
                <div className="px-4 py-3 border-b" style={{ borderColor: "#e8ede9" }}>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#9aada2" }}>
                    Type klacht
                  </p>
                  <p className="text-sm font-medium mt-0.5" style={{ color: "#122A1A" }}>
                    {selectedTypeMeta?.icon} {selectedTypeMeta?.label}
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#9aada2" }}>
                    Omschrijving
                  </p>
                  <p className="text-sm mt-0.5 leading-relaxed" style={{ color: "#304C3A" }}>
                    {description}
                  </p>
                </div>
              </div>

              {error && (
                <div
                  className="rounded-2xl px-4 py-3 text-sm"
                  style={{ background: "#FEE2E2", color: "#991B1B" }}
                >
                  {error}
                </div>
              )}
            </div>
          )}

          {/* ── Step 4: Success ──────────────────────────────────── */}
          {step === "success" && (
            <div className="flex flex-col items-center text-center gap-4 py-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "#EFF5EE" }}
              >
                <CheckCircle size={32} color="#304C3A" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2" style={{ color: "#122A1A" }}>
                  Klacht ingediend
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "#7a8f82" }}>
                  We hebben je klacht ontvangen en gaan er zo snel mogelijk mee aan de slag.
                </p>
              </div>
              {referenceNumber && (
                <div
                  className="w-full rounded-2xl px-4 py-3"
                  style={{ background: "#EFF5EE" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#9aada2" }}>
                    Referentienummer
                  </p>
                  <p className="text-sm font-mono font-semibold" style={{ color: "#304C3A" }}>
                    {referenceNumber}
                  </p>
                </div>
              )}
              <p className="text-xs" style={{ color: "#9aada2" }}>
                Je ontvangt een melding zodra de status wijzigt.
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex-shrink-0 px-5 pb-10 pt-4 flex flex-col gap-3">
          {step === "type" && (
            <button
              onClick={() => selectedType && setStep("description")}
              disabled={!selectedType}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-base font-semibold transition-opacity"
              style={{
                background: selectedType ? "#304C3A" : "#e8ede9",
                color: selectedType ? "#ffffff" : "#9aada2",
              }}
            >
              Volgende
              <ChevronRight size={18} />
            </button>
          )}

          {step === "description" && (
            <>
              <button
                onClick={() => descriptionValid && setStep("confirm")}
                disabled={!descriptionValid}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-base font-semibold transition-opacity"
                style={{
                  background: descriptionValid ? "#304C3A" : "#e8ede9",
                  color: descriptionValid ? "#ffffff" : "#9aada2",
                }}
              >
                Bekijk samenvatting
                <ChevronRight size={18} />
              </button>
              <button
                onClick={() => setStep("type")}
                className="w-full py-3 rounded-2xl text-sm font-medium"
                style={{ color: "#304C3A" }}
              >
                Terug
              </button>
            </>
          )}

          {step === "confirm" && (
            <>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-base font-semibold transition-opacity"
                style={{ background: "#304C3A", color: "#ffffff", opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Verzenden…" : "Klacht indienen"}
              </button>
              <button
                onClick={() => setStep("description")}
                disabled={loading}
                className="w-full py-3 rounded-2xl text-sm font-medium"
                style={{ color: "#304C3A" }}
              >
                Terug
              </button>
            </>
          )}

          {step === "success" && (
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl text-base font-semibold"
              style={{ background: "#EFF5EE", color: "#304C3A" }}
            >
              Sluiten
            </button>
          )}
        </div>
      </div>
    </div>
  );
}