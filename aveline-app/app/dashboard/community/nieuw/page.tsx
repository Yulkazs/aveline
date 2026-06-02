import NewPostForm from "@/components/community/NewPostForm";

export const dynamic = "force-dynamic";

/**
 * /dashboard/community/nieuw
 *
 * Thin server wrapper — the form handles everything client-side.
 */
export default function NieuwBerichtPage() {
  return <NewPostForm />;
}