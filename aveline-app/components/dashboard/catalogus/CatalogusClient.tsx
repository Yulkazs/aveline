// components/dashboard/catalogus/CatalogusClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronRight,
  Plus,
  Package,
  ShoppingCart,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
export type Product = {
  id: string;
  name: string;
  description: string | null;
  cacaoPercentage: number | null;
  origin: string | null;
  certifications: string[];
  isLimitedEdition: boolean;
  isPremium: boolean;
  imageUrl: string | null;
  category: string | null;
  batchNumber: string | null;
};

type Props = {
  products: Product[];
  categories: string[];
  onAddToCart?: (product: Product) => void;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function primaryCert(certifications: string[]): string | null {
  if (certifications.length === 0) return null;
  return certifications[0];
}

// ── Product card ──────────────────────────────────────────────────────────────
function ProductCard({
  product,
  onClick,
  onAdd,
}: {
  product: Product;
  onClick: () => void;
  onAdd: (e: React.MouseEvent) => void;
}) {
  const cert = primaryCert(product.certifications);

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 p-4 rounded-2xl active:scale-[0.99] transition-transform"
      style={{ background: "#ffffff", border: "1.5px solid #f0f0f0" }}
    >
      {/* Thumb */}
      <div
        className="w-13 h-13 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
        style={{ background: "#EFF5EE", width: 52, height: 52 }}
      >
        🍫
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>
          {product.name}
        </p>
        <p className="text-xs mt-0.5 truncate" style={{ color: "#7a8f82" }}>
          {[product.origin, product.batchNumber ? `Batch #${product.batchNumber}` : null]
            .filter(Boolean)
            .join(" · ") || "—"}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {product.cacaoPercentage && (
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "#FEF3C7", color: "#92400E" }}
            >
              {product.cacaoPercentage}% cacao
            </span>
          )}
          {cert && (
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "#EFF5EE", color: "#166534" }}
            >
              {cert}
            </span>
          )}
          {product.isLimitedEdition && (
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "#F5F3FF", color: "#5B21B6" }}
            >
              Limited
            </span>
          )}
          {product.isPremium && (
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "#FFF7ED", color: "#9A3412" }}
            >
              Premium
            </span>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col items-center gap-2 flex-shrink-0">
        <button
          onClick={onAdd}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "#304C3A" }}
          aria-label={`${product.name} toevoegen`}
        >
          <Plus size={16} color="#ffffff" strokeWidth={2.5} />
        </button>
        <ChevronRight size={14} color="#BDD2B7" />
      </div>
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CatalogusClient({ products, categories, onAddToCart }: Props) {
  const router = useRouter();
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      q === "" ||
      p.name.toLowerCase().includes(q) ||
      (p.batchNumber ?? "").toLowerCase().includes(q) ||
      (p.origin ?? "").toLowerCase().includes(q);

    const matchCategory = !category || p.category === category;

    return matchSearch && matchCategory;
  });

  const limitedCount = products.filter((p) => p.isLimitedEdition).length;
  const premiumCount = products.filter((p) => p.isPremium).length;

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      router.push(`/dashboard/catalogus/${product.id}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-14 pb-4 bg-white border-b" style={{ borderColor: "#f0f0f0" }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="font-display text-2xl font-semibold" style={{ color: "#122A1A" }}>
              Catalogus
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "#9aada2" }}>
              Productaanbod Avéline
            </p>
          </div>
          {products.length > 0 && (
            <span
              className="text-xs font-semibold px-2.5 py-1.5 rounded-full mt-1"
              style={{ background: "#EFF5EE", color: "#304C3A" }}
            >
              {products.length} producten
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            size={15}
            color="#9aada2"
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek op product, herkomst of batch…"
            className="input-field pl-10 py-2.5 text-sm"
          />
        </div>

        {/* Category filters */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            <button
              onClick={() => setCategory(null)}
              className="flex-shrink-0 text-xs font-medium px-3.5 py-2 rounded-full transition-all"
              style={
                category === null
                  ? { background: "#304C3A", color: "#ffffff" }
                  : { background: "#f5f8f5", color: "#7a8f82" }
              }
            >
              Alles
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat === category ? null : cat)}
                className="flex-shrink-0 text-xs font-medium px-3.5 py-2 rounded-full transition-all"
                style={
                  category === cat
                    ? { background: "#304C3A", color: "#ffffff" }
                    : { background: "#f5f8f5", color: "#7a8f82" }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex-shrink-0 px-5 py-4 grid grid-cols-2 gap-2">
        {[
          { label: "Producten",      value: products.length, bg: "#EFF5EE", color: "#304C3A" },
          { label: "Limited edition", value: limitedCount,   bg: "#F5F3FF", color: "#5B21B6" },
        ].map(({ label, value, bg, color }) => (
          <div key={label} className="rounded-2xl p-3 flex flex-col" style={{ background: bg }}>
            <span className="text-xl font-semibold font-display" style={{ color }}>
              {value}
            </span>
            <span className="text-[10px] mt-0.5" style={{ color: "#7a8f82" }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "#EFF5EE" }}
            >
              <Package size={24} color="#BDD2B7" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "#304C3A" }}>
                Geen producten gevonden
              </p>
              <p className="text-xs mt-1" style={{ color: "#9aada2" }}>
                {search ? "Geen resultaten voor deze zoekopdracht." : "Er zijn nog geen producten beschikbaar."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => router.push(`/dashboard/catalogus/${product.id}`)}
                onAdd={(e) => handleAdd(e, product)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}