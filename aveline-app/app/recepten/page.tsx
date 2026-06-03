// app/recepten/page.tsx
import ReceptenOverzicht from "@/components/recepten/ReceptenOverzicht";

export const metadata = {
  title: "Recepten — Avéline",
  description:
    "Ontdek verfijnde recepten en video-tutorials gemaakt met Avéline chocolade.",
};

export default function ReceptenPage() {
  return <ReceptenOverzicht />;
}