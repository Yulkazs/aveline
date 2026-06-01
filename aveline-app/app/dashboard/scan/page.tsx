import ScanPage from "@/components/scan/ScanPage";

export const dynamic = "force-dynamic";

/**
 * /scan
 *
 * Accessible by both guests and authenticated users.
 * Guests can scan and view product info but don't earn points.
 */
export default function ScanRoute() {
  return <ScanPage />;
}
