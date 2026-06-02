"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ImagePlus, X, Loader2, AlertCircle } from "lucide-react";

const MAX_IMAGES = 4;
const MAX_CONTENT = 1000;

export default function NewPostForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [previews, setPreviews] = useState<string[]>([]); // base64 previews
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Image handling ────────────────────────────────────────────────────────
  function handleFiles(selected: FileList | null) {
    if (!selected) return;
    const remaining = MAX_IMAGES - files.length;
    const toAdd = Array.from(selected).slice(0, remaining);

    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setFiles((prev) => [...prev, ...toAdd]);
  }

  function removeImage(index: number) {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (content.trim().length === 0) {
      setError("Vul een bericht in voordat je verstuurt.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      // Upload images first (if any), then post.
      // For now we send base64 previews as imageUrls — swap for a real
      // storage upload (e.g. S3 presigned URL) when storage is configured.
      const imageUrls = previews;

      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || undefined,
          content: content.trim(),
          imageUrls,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Er ging iets mis. Probeer het opnieuw.");
      }

      const post = await res.json();
      // Navigate to the new post's detail page
      router.replace(`/dashboard/community/${post.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
      setSubmitting(false);
    }
  }

  const canSubmit = content.trim().length > 0 && !submitting;

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Header ── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 pt-14 pb-4 border-b"
        style={{ borderColor: "#f0f0f0" }}
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "#f5f8f5" }}
          aria-label="Annuleren"
          disabled={submitting}
        >
          <ChevronLeft size={20} color="#304C3A" />
        </button>

        <h1 className="text-base font-semibold" style={{ color: "#122A1A" }}>
          Nieuw bericht
        </h1>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="px-4 py-2 rounded-full text-sm font-medium text-white transition-opacity"
          style={{
            background: "#304C3A",
            opacity: canSubmit ? 1 : 0.4,
          }}
        >
          {submitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            "Plaatsen"
          )}
        </button>
      </div>

      {/* ── Form body ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

        {/* Error banner */}
        {error && (
          <div
            className="flex items-start gap-3 p-3.5 rounded-2xl text-sm"
            style={{ background: "#FEF2F2", color: "#DC2626" }}
          >
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" strokeWidth={1.75} />
            {error}
          </div>
        )}

        {/* Title input */}
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "#9aada2" }}
          >
            Titel <span style={{ color: "#c8d9c2" }}>(optioneel)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Geef je bericht een titel…"
            maxLength={120}
            className="w-full text-sm px-4 py-3 rounded-2xl border outline-none transition-colors"
            style={{
              borderColor: "#e8ede9",
              background: "#f5f8f5",
              color: "#122A1A",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#304C3A")}
            onBlur={(e) => (e.target.style.borderColor = "#e8ede9")}
          />
        </div>

        {/* Content textarea */}
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "#9aada2" }}
          >
            Bericht
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Deel een recept, tip of ervaring met andere chocoladeliefhebbers…"
            maxLength={MAX_CONTENT}
            rows={6}
            className="w-full text-sm px-4 py-3 rounded-2xl border outline-none transition-colors resize-none"
            style={{
              borderColor: content.length > 0 ? "#304C3A" : "#e8ede9",
              background: "#f5f8f5",
              color: "#122A1A",
              lineHeight: "1.6",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#304C3A")}
            onBlur={(e) =>
              (e.target.style.borderColor =
                content.length > 0 ? "#304C3A" : "#e8ede9")
            }
          />
          <p
            className="text-right text-xs mt-1.5"
            style={{
              color: content.length > MAX_CONTENT * 0.9 ? "#DC2626" : "#9aada2",
            }}
          >
            {content.length}/{MAX_CONTENT}
          </p>
        </div>

        {/* Image upload */}
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "#9aada2" }}
          >
            Afbeeldingen <span style={{ color: "#c8d9c2" }}>(max. {MAX_IMAGES})</span>
          </label>

          <div className="flex flex-wrap gap-3">
            {/* Existing previews */}
            {previews.map((src, i) => (
              <div
                key={i}
                className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0"
                style={{ border: "1px solid #e8ede9" }}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(18,42,26,0.7)" }}
                  aria-label="Verwijder afbeelding"
                >
                  <X size={11} color="white" strokeWidth={2.5} />
                </button>
              </div>
            ))}

            {/* Add button — hidden when max reached */}
            {files.length < MAX_IMAGES && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 border-2 border-dashed transition-colors"
                style={{ borderColor: "#c8d9c2", color: "#9aada2" }}
              >
                <ImagePlus size={20} strokeWidth={1.5} />
                <span className="text-[10px]">Toevoegen</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* Tips */}
        <div
          className="rounded-2xl p-4 text-xs leading-relaxed"
          style={{ background: "#f5f8f5", color: "#7a8f82" }}
        >
          <p className="font-medium mb-1" style={{ color: "#304C3A" }}>Tips voor een goed bericht</p>
          <ul className="flex flex-col gap-1">
            <li>• Deel een recept inclusief ingrediënten en stappen</li>
            <li>• Voeg een foto toe voor meer reacties</li>
            <li>• Vermeld welk Aveline-product je gebruikte</li>
          </ul>
        </div>
      </div>
    </div>
  );
}