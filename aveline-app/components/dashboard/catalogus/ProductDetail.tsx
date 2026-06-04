// components/dashboard/catalogus/ProductDetail.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  MapPin,
  Percent,
  Tag,
  Hash,
  ShoppingCart,
} from "lucide-react";

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

type Props = { product: Product };

const CATEGORY_TO_POSTER: Record<string, string> = {
  melk:  "Milk",
  fruit: "Strawberry",
  noot:  "Pistachio",
  zomer: "Summer",
  puur:  "Summer",
};

function getPosterImage(category: string | null): string {
  if (!category) return "";
  const name = CATEGORY_TO_POSTER[category.toLowerCase().trim()];
  return name ? `/marketing/${name}ChocolatePoster1.png` : "";
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#9aada2" }}>
      {children}
    </p>
  );
}

function SpecRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-2xl" style={{ background: "#f5f8f5" }}>
      <span className="text-sm flex items-center gap-2" style={{ color: "#7a8f82" }}>
        <Icon size={15} strokeWidth={1.75} />
        {label}
      </span>
      <span className="text-sm font-medium text-right max-w-[55%]" style={{ color: "#122A1A" }}>
        {value}
      </span>
    </div>
  );
}

export default function ProductDetail({ product }: Props) {
  const router = useRouter();
  const posterSrc = getPosterImage(product.category);

  const specs = [
    product.origin          && { icon: MapPin,  label: "Herkomst",    value: product.origin },
    product.cacaoPercentage && { icon: Percent, label: "Cacao",       value: `${product.cacaoPercentage}%` },
    product.category        && { icon: Tag,     label: "Categorie",   value: product.category },
    product.batchNumber     && { icon: Hash,    label: "Batchnummer", value: `#${product.batchNumber}` },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string }[];

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Header */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-5 pt-14 pb-4 border-b"
        style={{ borderColor: "#f0f0f0" }}
      >
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full -ml-1"
          style={{ background: "#f5f8f5" }}
          aria-label="Terug"
        >
          <ChevronLeft size={20} color="#304C3A" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl font-semibold truncate" style={{ color: "#122A1A" }}>
            {product.name}
          </h1>
          <p className="text-xs" style={{ color: "#9aada2" }}>
            {[product.category, product.batchNumber ? `Batch #${product.batchNumber}` : null]
              .filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-32">

        {/* Hero */}
        <div
          className="mx-5 mt-5 mb-5 rounded-2xl overflow-hidden flex items-center justify-center"
          style={{ height: 220, background: "#EFF5EE" }}
        >
          {posterSrc ? (
            <img
              src={posterSrc}
              alt={product.name}
              className="w-full h-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <span className="text-6xl">🍫</span>
          )}
        </div>

        <div className="px-5 flex flex-col gap-6">

          {/* Kenmerken */}
          {(product.certifications.length > 0 || product.isLimitedEdition || product.isPremium || product.cacaoPercentage) && (
            <div>
              <SectionLabel>Kenmerken</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {product.cacaoPercentage && (
                  <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "#FEF3C7", color: "#92400E" }}>
                    {product.cacaoPercentage}% cacao
                  </span>
                )}
                {product.certifications.map((cert) => (
                  <span key={cert} className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "#EFF5EE", color: "#166534" }}>
                    {cert}
                  </span>
                ))}
                {product.isLimitedEdition && (
                  <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "#F5F3FF", color: "#5B21B6" }}>
                    Limited edition
                  </span>
                )}
                {product.isPremium && (
                  <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "#FFF7ED", color: "#9A3412" }}>
                    Premium
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Specificaties */}
          {specs.length > 0 && (
            <div>
              <SectionLabel>Specificaties</SectionLabel>
              <div className="flex flex-col gap-1.5">
                {specs.map(({ icon, label, value }) => (
                  <SpecRow key={label} icon={icon} label={label} value={value} />
                ))}
              </div>
            </div>
          )}

          {/* Allergenen */}
          {product.allergens.length > 0 && (
            <div>
              <SectionLabel>Allergenen</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {product.allergens.map((a) => (
                  <span key={a} className="text-xs font-medium px-3 py-1.5 rounded-full"
                    style={{ background: "#FEF2F2", color: "#DC2626", border: "1.5px solid #FECACA" }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ingrediënten */}
          {product.ingredients.length > 0 && (
            <div>
              <SectionLabel>Ingrediënten</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ing) => (
                  <span key={ing} className="text-xs px-3 py-1.5 rounded-full"
                    style={{ background: "#ffffff", color: "#304C3A", border: "1.5px solid #f0f0f0" }}>
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Omschrijving */}
          {product.description && (
            <div>
              <SectionLabel>Omschrijving</SectionLabel>
              <p className="text-sm leading-relaxed" style={{ color: "#7a8f82" }}>
                {product.description}
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Footer CTA */}
      <div
        className="flex-shrink-0 px-5 pt-4 pb-8 border-t flex gap-3"
        style={{ borderColor: "#f0f0f0", background: "#ffffff" }}
      >
        <button
          onClick={() => router.back()}
          className="flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-colors"
          style={{ border: "1.5px solid #304C3A", color: "#304C3A", background: "#fff" }}
        >
          Terug
        </button>
        <button
          onClick={() => router.push(`/dashboard/orders/nieuw?productId=${product.id}&productNaam=${encodeURIComponent(product.name)}`)}
          className="flex-[2] py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          style={{ background: "#304C3A", color: "#ffffff", border: "none" }}
        >
          <ShoppingCart size={16} strokeWidth={2} />
          Bestellen
        </button>
      </div>

    </div>
  );
}