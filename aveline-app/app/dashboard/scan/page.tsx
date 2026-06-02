import ScanPage from "@/components/scan/ScanPage";

export const dynamic = "force-dynamic";

/**
 * /dashboard/scan
 *
 * Direct mode: opens the camera immediately, no welcome screen.
 * Authenticated users only (enforced by dashboard layout/middleware).
 */
export default function ScanRoute() {
  return <ScanPage mode="direct" />;
}