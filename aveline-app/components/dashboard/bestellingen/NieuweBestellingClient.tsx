// components/dashboard/bestellingen/NieuweBestellingClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Search,
  Plus,
  Minus,
  ArrowRight,
  MapPin,
  Calendar,
  ShoppingCart,
  CheckCircle2,
  Package,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Product = {
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

type CartItem = {
  product: Product;
  quantity: number;
  unitPrice: number;
};

type Step = "producten" | "levering" | "bevestigen";

type Props = { products: Product[] };

// ── Constanten ────────────────────────────────────────────────────────────────
const UNIT_PRICE = 12.5; // tijdelijk vast — later via Product.price

const STEPS: { key: Step; label: string }[] = [
  { key: "producten",  label: "Producten"  },
  { key: "levering",   label: "Levering"   },
  { key: "bevestigen", label: "Bevestigen" },
];

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: Step }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done   = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                style={{
                  background: done ? "#304C3A" : active ? "#EFF5EE" : "#f5f8f5",
                  color:      done ? "#ffffff" : active ? "#304C3A" : "#BDD2B7",
                  border:     active ? "2px solid #304C3A" : "none",
                }}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: active || done ? "#304C3A" : "#BDD2B7" }}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 h-px mx-2"
                style={{ background: done ? "#304C3A" : "#f0f0f0", opacity: done ? 0.35 : 1 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Stap 1: Producten kiezen ──────────────────────────────────────────────────
function StapProducten({
  products,
  cart,
  onUpdate,
  onNext,
}: {
  products: Product[];
  cart: CartItem[];
  onUpdate: (productId: string, delta: number) => void;
  onNext: () => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      q === "" ||
      p.name.toLowerCase().includes(q) ||
      (p.origin ?? "").toLowerCase().includes(q)
    );
  });

  const totalItems  = cart.reduce((s, i) => s + i.quantity, 0);
  const totalLines  = cart.filter((i) => i.quantity > 0).length;

  const qtyOf = (productId: string) =>
    cart.find((i) => i.product.id === productId)?.quantity ?? 0;

  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 pb-36">
        {/* Search */}
        <div className="relative my-4">
          <Search size={15} color="#9aada2" className="absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek product…"
            className="input-field pl-10 py-2.5 text-sm"
          />
        </div>

        <div className="flex flex-col gap-2.5">
          {filtered.map((product) => {
            const qty      = qtyOf(product.id);
            const selected = qty > 0;
            return (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3.5 rounded-2xl transition-all"
                style={{
                  background:   selected ? "#f5f8f5" : "#ffffff",
                  border:       `1.5px solid ${selected ? "#304C3A" : "#f0f0f0"}`,
                }}
              >
                {/* Thumb */}
                <div
                  className="flex-shrink-0 rounded-xl flex items-center justify-center text-xl"
                  style={{ width: 44, height: 44, background: "#EFF5EE" }}
                >
                  🍫
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#122A1A" }}>
                    {product.name}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "#9aada2" }}>
                    {[
                      product.origin,
                      product.certifications[0],
                    ].filter(Boolean).join(" · ")}
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onUpdate(product.id, -1)}
                    disabled={qty === 0}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{
                      border:     `1.5px solid ${qty > 0 ? "#304C3A" : "#f0f0f0"}`,
                      background: "#fff",
                      color:      qty > 0 ? "#304C3A" : "#BDD2B7",
                    }}
                  >
                    <Minus size={13} strokeWidth={2.5} />
                  </button>
                  <span
                    className="text-sm font-semibold text-center"
                    style={{ minWidth: 20, color: qty > 0 ? "#122A1A" : "#BDD2B7" }}
                  >
                    {qty}
                  </span>
                  <button
                    onClick={() => onUpdate(product.id, 1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ border: "1.5px solid #304C3A", background: "#fff", color: "#304C3A" }}
                  >
                    <Plus size={13} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex-shrink-0 px-5 pt-4 pb-8 border-t"
        style={{ borderColor: "#f0f0f0", background: "#fff" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs" style={{ color: "#9aada2" }}>
            {totalItems} {totalItems === 1 ? "doos" : "dozen"} geselecteerd
          </span>
          <span className="text-xs font-medium" style={{ color: "#304C3A" }}>
            {totalLines} {totalLines === 1 ? "product" : "producten"}
          </span>
        </div>
        <button
          onClick={onNext}
          disabled={totalItems === 0}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity"
          style={{
            background: "#304C3A",
            color:      "#ffffff",
            border:     "none",
            opacity:    totalItems === 0 ? 0.4 : 1,
          }}
        >
          <ArrowRight size={16} strokeWidth={2} />
          Volgende: levering
        </button>
      </div>
    </>
  );
}

// ── Stap 2: Levergegevens ─────────────────────────────────────────────────────
function StapLevering({
  address,
  expectedDelivery,
  onAddress,
  onDelivery,
  onNext,
  onBack,
}: {
  address: string;
  expectedDelivery: string;
  onAddress: (v: string) => void;
  onDelivery: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const canProceed = address.trim().length > 5;

  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 pb-36">
        <div className="flex flex-col gap-4 mt-4">
          {/* Afleveradres */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "#9aada2" }}
            >
              Afleveradres
            </p>
            <div className="relative">
              <MapPin
                size={15}
                color="#9aada2"
                className="absolute left-3.5 top-3.5"
              />
              <textarea
                value={address}
                onChange={(e) => onAddress(e.target.value)}
                placeholder="Straat en huisnummer, postcode, plaats"
                rows={3}
                className="input-field pl-10 py-3 text-sm resize-none w-full"
                style={{ borderRadius: 14 }}
              />
            </div>
          </div>

          {/* Gewenste leverdatum */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "#9aada2" }}
            >
              Gewenste leverdatum
              <span className="ml-1 font-normal normal-case" style={{ color: "#BDD2B7" }}>
                (optioneel)
              </span>
            </p>
            <div className="relative">
              <Calendar
                size={15}
                color="#9aada2"
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
              />
              <input
                type="date"
                value={expectedDelivery}
                onChange={(e) => onDelivery(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="input-field pl-10 py-2.5 text-sm w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex-shrink-0 px-5 pt-4 pb-8 border-t flex gap-3"
        style={{ borderColor: "#f0f0f0", background: "#fff" }}
      >
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-2xl text-sm font-semibold"
          style={{ border: "1.5px solid #304C3A", color: "#304C3A", background: "#fff" }}
        >
          Terug
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-[2] py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{
            background: "#304C3A",
            color:      "#ffffff",
            border:     "none",
            opacity:    canProceed ? 1 : 0.4,
          }}
        >
          <ArrowRight size={16} strokeWidth={2} />
          Controleren
        </button>
      </div>
    </>
  );
}

// ── Stap 3: Bevestigen ────────────────────────────────────────────────────────
function StapBevestigen({
  cart,
  address,
  expectedDelivery,
  submitting,
  onSubmit,
  onBack,
}: {
  cart: CartItem[];
  address: string;
  expectedDelivery: string;
  submitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const total = cart.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 pb-36">
        <div className="flex flex-col gap-5 mt-4">
          {/* Producten samenvatting */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "#9aada2" }}
            >
              Producten
            </p>
            <div className="flex flex-col gap-2">
              {cart.filter((i) => i.quantity > 0).map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl"
                  style={{ background: "#f5f8f5" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#122A1A" }}>
                      {item.product.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#9aada2" }}>
                      {item.quantity} × €{item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold ml-4" style={{ color: "#304C3A" }}>
                    €{(item.quantity * item.unitPrice).toFixed(2)}
                  </span>
                </div>
              ))}

              {/* Totaal */}
              <div
                className="flex items-center justify-between px-4 py-3 rounded-2xl"
                style={{ background: "#304C3A" }}
              >
                <span className="text-sm font-medium" style={{ color: "#BDD2B7" }}>
                  Totaalbedrag
                </span>
                <span className="text-lg font-semibold font-display" style={{ color: "#fff" }}>
                  €{total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Levergegevens */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "#9aada2" }}
            >
              Levering
            </p>
            {[
              { icon: MapPin,   label: "Afleveradres",   value: address },
              {
                icon: Calendar,
                label: "Gewenste leverdatum",
                value: expectedDelivery
                  ? new Date(expectedDelivery).toLocaleDateString("nl-NL", {
                      day: "numeric", month: "long", year: "numeric",
                    })
                  : "Niet opgegeven",
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-start gap-3 px-4 py-3 rounded-2xl mb-2"
                style={{ background: "#f5f8f5" }}
              >
                <Icon size={15} color="#304C3A" strokeWidth={1.75} className="mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs" style={{ color: "#7a8f82" }}>{label}</p>
                  <p className="text-sm font-medium mt-0.5" style={{ color: "#122A1A" }}>
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex-shrink-0 px-5 pt-4 pb-8 border-t flex gap-3"
        style={{ borderColor: "#f0f0f0", background: "#fff" }}
      >
        <button
          onClick={onBack}
          disabled={submitting}
          className="flex-1 py-3.5 rounded-2xl text-sm font-semibold"
          style={{ border: "1.5px solid #304C3A", color: "#304C3A", background: "#fff" }}
        >
          Terug
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex-[2] py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{
            background: "#304C3A",
            color:      "#ffffff",
            border:     "none",
            opacity:    submitting ? 0.6 : 1,
          }}
        >
          <ShoppingCart size={16} strokeWidth={2} />
          {submitting ? "Bestelling plaatsen…" : "Bestelling plaatsen"}
        </button>
      </div>
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function NieuweBestellingClient({ products }: Props) {
  const router = useRouter();

  const [step, setStep]                     = useState<Step>("producten");
  const [cart, setCart]                     = useState<CartItem[]>([]);
  const [address, setAddress]               = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [submitting, setSubmitting]         = useState(false);
  const [error, setError]                   = useState<string | null>(null);

  const updateCart = (productId: string, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === productId);
      if (!existing) {
        if (delta <= 0) return prev;
        const product = products.find((p) => p.id === productId)!;
        return [...prev, { product, quantity: delta, unitPrice: UNIT_PRICE }];
      }
      const newQty = Math.max(0, existing.quantity + delta);
      return prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: newQty } : i
      );
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const items = cart
      .filter((i) => i.quantity > 0)
      .map((i) => ({
        productId: i.product.id,
        quantity:  i.quantity,
        unitPrice: i.unitPrice,
      }));

    try {
      const res = await fetch("/api/orders", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          deliveryAddress:  address,
          expectedDelivery: expectedDelivery || undefined,
          items,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? "Er ging iets mis.");
        setSubmitting(false);
        return;
      }

      const order = await res.json();
      router.push(`/dashboard/orders/${order.id}?nieuw=1`);
    } catch {
      setError("Geen verbinding. Probeer opnieuw.");
      setSubmitting(false);
    }
  };

  const stepTitles: Record<Step, string> = {
    producten:  "Nieuwe bestelling",
    levering:   "Levergegevens",
    bevestigen: "Controleren",
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div
        className="flex-shrink-0 px-5 pt-14 pb-4 border-b"
        style={{ borderColor: "#f0f0f0" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() =>
              step === "producten" ? router.back() : setStep(
                step === "levering" ? "producten" : "levering"
              )
            }
            className="p-2 rounded-full -ml-1"
            style={{ background: "#f5f8f5" }}
            aria-label="Terug"
          >
            <ChevronLeft size={20} color="#304C3A" />
          </button>
          <h1
            className="font-display text-xl font-semibold"
            style={{ color: "#122A1A" }}
          >
            {stepTitles[step]}
          </h1>
        </div>
        <StepIndicator current={step} />
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="mx-5 mt-4 px-4 py-3 rounded-2xl text-sm"
          style={{ background: "#FEF2F2", color: "#DC2626" }}
        >
          {error}
        </div>
      )}

      {/* Stap content */}
      {step === "producten" && (
        <StapProducten
          products={products}
          cart={cart}
          onUpdate={updateCart}
          onNext={() => setStep("levering")}
        />
      )}
      {step === "levering" && (
        <StapLevering
          address={address}
          expectedDelivery={expectedDelivery}
          onAddress={setAddress}
          onDelivery={setExpectedDelivery}
          onNext={() => setStep("bevestigen")}
          onBack={() => setStep("producten")}
        />
      )}
      {step === "bevestigen" && (
        <StapBevestigen
          cart={cart}
          address={address}
          expectedDelivery={expectedDelivery}
          submitting={submitting}
          onSubmit={handleSubmit}
          onBack={() => setStep("levering")}
        />
      )}
    </div>
  );
}