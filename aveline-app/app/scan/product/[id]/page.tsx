import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetail from "@/components/ProductDetail";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * /scan/product/[id]
 *
 * Full product detail page. Accessible by guests and authenticated users.
 * Shown after a successful QR/barcode scan.
 */
export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      cacaoPercentage: true,
      origin: true,
      ingredients: true,
      allergens: true,
      certifications: true,
      batchNumber: true,
      isLimitedEdition: true,
      isPremium: true,
      imageUrl: true,
      category: true,
    },
  });

  if (!product) notFound();

  return <ProductDetail product={product} />;
}
