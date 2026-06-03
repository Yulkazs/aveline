import AanbevelingenOverzicht from "@/components/aanbevelingen/AanbevelingenOverzicht";

export const dynamic = "force-dynamic";

/**
 * /dashboard/aanbevelingen
 * Full recommendations page for authenticated B2C users.
 */
export default function AanbevelingenRoute() {
  return <AanbevelingenOverzicht />;
}