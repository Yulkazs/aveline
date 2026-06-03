import ProductenOverzicht from "@/components/producten/ProductenOverzicht";

export const dynamic = "force-dynamic";

/**
 * /dashboard/producten
 * Shows the authenticated user's scanned products.
 */
export default function ProductenRoute() {
  return <ProductenOverzicht />;
}