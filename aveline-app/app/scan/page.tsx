import ScanPage from "@/components/scan/ScanPage";

export const dynamic = "force-dynamic";

/**
 * /scan
 *
 * Landing mode: shows scan info + CTA buttons before opening the camera.
 * Accessible by both guests and authenticated users.
 */
export default function ScanRoute() {
  return <ScanPage mode="landing" />;
}