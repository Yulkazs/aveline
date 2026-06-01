import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * TIJDELIJKE TESTPAGINA — verwijder dit na het testen.
 *
 * Bezoek: /dashboard/test-klacht
 *
 * Wat het doet:
 *  1. Zoekt een bestaand testproduct op, of maakt er een aan.
 *  2. Stuurt je direct door naar /dashboard/klachten/indienen?productId=…
 */
export default async function TestKlachtPage() {
  const auth = await getAuth();
  if (!auth) redirect("/login");

  // Alleen B2C klanten en admins mogen klachten indienen
  if (!["B2C_CLIENT", "ADMIN"].includes(auth.role)) {
    redirect("/dashboard");
  }

  // Zoek of maak een testproduct aan
  let product = await prisma.product.findFirst({
    where: { batchNumber: "TEST-001" },
    select: { id: true },
  });

  if (!product) {
    product = await prisma.product.create({
      data: {
        name:             "Avéline Noir 85% (testproduct)",
        description:      "Dit is een tijdelijk testproduct voor het testen van het klachtenformulier.",
        cacaoPercentage:  85,
        origin:           "Ghana",
        batchNumber:      "TEST-001",
        ingredients:      ["Cacaomassa", "Suiker", "Cacaoboter", "Vanille"],
        allergens:        ["Melk", "Gluten"],
        certifications:   ["Fairtrade", "Rainforest Alliance"],
        isLimitedEdition: false,
        isPremium:        true,
      },
      select: { id: true },
    });
  }

  redirect(`/dashboard/klachten/indienen?productId=${product.id}`);
}