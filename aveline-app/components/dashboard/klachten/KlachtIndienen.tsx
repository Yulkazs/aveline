"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Camera, X, CheckCircle2, AlertTriangle,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type ComplaintType = "MELT_DAMAGE" | "BREAK_DAMAGE" | "TEXTURE_DEVIATION" | "OTHER";

type Product = {
  id: string;
  name: string;
  batchNumber: string | null;
};

type Props = { product: Product };

// ── Constants ─────────────────────────────────────────────────────────────────
const COMPLAINT_TYPES: Array<{ value: ComplaintType; label: string; description: string; emoji: string }> = [
  { value: "MELT_DAMAGE",       label: "Smeltschade",          description: "Chocolade is gesmolten of vervormd",         emoji: "🌡️" },
  { value: "BREAK_DAMAGE",      label: "Breukschade",          description: "Reep is gebroken of verpakking beschadigd",  emoji: "💔" },
  { value: "TEXTURE_DEVIATION", label: "Afwijkende structuur", description: "Kleur, geur of smaak wijkt af",              emoji: "🔬" },
  { value: "OTHER",             label: "Overig",               description: "Iets anders",                                emoji: "💬" },
];

// ── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen({ referenceNumber, onBack }: { referenceNumber: string; onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{ background: "#EFF5EE" }}
        >
          <CheckCircle2 size={36} color="#304C3A" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold mb-2" style={{ color: "#122A1A" }}>
            Klacht ingediend
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "#7a8f82" }}>
            Je klacht is ontvangen. Een medewerker neemt zo snel mogelijk contact met je op.
          </p>
        </div>
        <div
          className="w-full rounded-2xl p-4 flex flex-col gap-1"
          style={{ background: "#f5f8f5" }}
        >
          <p className="text-xs" style={{ color: "#9aada2" }}>Referentienummer</p>
          <p className="font-mono text-base font-semibold" style={{ color: "#304C3A" }}>
            {referenceNumber}
          </p>
          <p className="text-xs" style={{ color: "#9aada2" }}>Sla dit op voor je eigen administratie</p>
        </div>
      </div>
      <div className="flex-shrink-0 px-6 pb-10 flex flex-col gap-3">
        <button onClick={onBack} className="btn-primary">
          Terug naar dashboard
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function KlachtIndienen({ product }: Props) {
  const router = useRouter();
  const [type, setType]               = useState<ComplaintType | null>(null);
  const [description, setDescription] = useState("");
  const [photos, setPhotos]           = useState<string[]>([]);
  const [submitting, setSubmitting]   = useState(false);
  const [errors, setErrors]           = useState<{ type?: string; description?: string; api?: string }>({});
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!type) errs.type = "Selecteer het type probleem";
    if (!description.trim()) errs.description = "Omschrijf het probleem";
    else if (description.trim().length < 20) errs.description = "Geef meer detail (minimaal 20 tekens)";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId:   product.id,
          type,
          description: description.trim(),
          mediaUrls:   photos,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrors({ api: data.message ?? "Indienen mislukt. Probeer het opnieuw." });
        return;
      }

      setReferenceNumber(data.complaint.referenceNumber);
    } catch {
      setErrors({ api: "Er ging iets mis. Controleer je verbinding." });
    } finally {
      setSubmitting(false);
    }
  }

  // Simulate photo pick (no file upload infra yet)
  function handleAddPhoto() {
    const mockUrls = [
      "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=200",
      "https://images.unsplash.com/photo-1606312619070-d48b6b4ea11e?w=200",
    ];
    if (photos.length < 4) {
      setPhotos((prev) => [...prev, mockUrls[prev.length % mockUrls.length]]);
    }
  }

  if (referenceNumber) {
    return (
      <SuccessScreen
        referenceNumber={referenceNumber}
        onBack={() => router.push("/dashboard")}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
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
        <div>
          <h1 className="font-display text-2xl font-semibold" style={{ color: "#122A1A" }}>
            Klacht indienen
          </h1>
          <p className="text-xs" style={{ color: "#7a8f82" }}>{product.name}</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-5">

        {/* Product summary */}
        <div
          className="flex items-center gap-3 p-3.5 rounded-2xl mb-6"
          style={{ background: "#EFF5EE" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(48,76,58,0.12)" }}
          >
            <span className="text-lg">🍫</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>
              {product.name}
            </p>
            {product.batchNumber && (
              <p className="text-xs" style={{ color: "#7a8f82" }}>Batch #{product.batchNumber}</p>
            )}
          </div>
        </div>

        {/* Type selection */}
        <div className="mb-6">
          <p className="text-sm font-semibold mb-3" style={{ color: "#122A1A" }}>
            Wat is het probleem?
          </p>
          <div className="flex flex-col gap-2">
            {COMPLAINT_TYPES.map(({ value, label, description: desc, emoji }) => {
              const active = type === value;
              return (
                <button
                  key={value}
                  onClick={() => { setType(value); setErrors((e) => ({ ...e, type: undefined })); }}
                  className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all active:scale-[0.99]"
                  style={{
                    background: active ? "#EFF5EE" : "#f5f8f5",
                    border: `1.5px solid ${active ? "#304C3A40" : "transparent"}`,
                  }}
                >
                  <span className="text-xl flex-shrink-0">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: active ? "#122A1A" : "#304C3A" }}>
                      {label}
                    </p>
                    <p className="text-xs" style={{ color: "#9aada2" }}>{desc}</p>
                  </div>
                  {active && (
                    <CheckCircle2 size={16} color="#304C3A" className="flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
          {errors.type && (
            <p className="text-xs text-red-600 mt-2">{errors.type}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="text-sm font-semibold mb-2 block" style={{ color: "#122A1A" }}>
            Omschrijving
          </label>
          <textarea
            value={description}
            onChange={(e) => { setDescription(e.target.value); setErrors((err) => ({ ...err, description: undefined })); }}
            placeholder="Beschrijf het probleem zo uitgebreid mogelijk — wanneer ontdekt, hoe het eruit ziet, wat er mis is…"
            rows={4}
            className={`input-field resize-none text-sm ${errors.description ? "error" : ""}`}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.description
              ? <span className="text-xs text-red-600">{errors.description}</span>
              : <span />
            }
            <span className="text-xs" style={{ color: description.length >= 20 ? "#51C675" : "#9aada2" }}>
              {description.length} tekens
            </span>
          </div>
        </div>

        {/* Photos */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold" style={{ color: "#122A1A" }}>
              Foto&apos;s of video&apos;s
            </p>
            <span className="text-xs" style={{ color: "#9aada2" }}>Optioneel · max. 4</span>
          </div>

          <div className="flex gap-2.5 flex-wrap">
            {photos.map((url, i) => (
              <div
                key={i}
                className="relative w-20 h-20 rounded-2xl overflow-hidden"
                style={{ border: "1.5px solid #f0f0f0" }}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(18,42,26,0.7)" }}
                >
                  <X size={10} color="#ffffff" />
                </button>
              </div>
            ))}

            {photos.length < 4 && (
              <button
                onClick={handleAddPhoto}
                className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-colors"
                style={{ border: "1.5px dashed #c8d9c2", background: "#f9fbf9" }}
              >
                <Camera size={18} color="#9aada2" strokeWidth={1.5} />
                <span className="text-[10px]" style={{ color: "#9aada2" }}>Toevoegen</span>
              </button>
            )}
          </div>

          <div
            className="flex items-center gap-2 mt-3 p-3 rounded-xl"
            style={{ background: "#FEF9C3" }}
          >
            <AlertTriangle size={13} color="#CA8A04" strokeWidth={2} className="flex-shrink-0" />
            <p className="text-xs leading-snug" style={{ color: "#92400E" }}>
              Foto&apos;s helpen ons de klacht sneller te beoordelen en te verwerken.
            </p>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div
        className="flex-shrink-0 px-5 py-4 border-t"
        style={{ borderColor: "#f0f0f0" }}
      >
        {errors.api && (
          <p className="text-xs text-red-600 mb-3 text-center">{errors.api}</p>
        )}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary"
          style={{ opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? "Indienen…" : "Klacht indienen"}
        </button>
        <p className="text-xs text-center mt-3" style={{ color: "#9aada2" }}>
          Je ontvangt een bevestiging met een referentienummer.
        </p>
      </div>
    </div>
  );
}