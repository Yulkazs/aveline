import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import CommunityFeed from "@/components/community/CommunityFeed";

export const dynamic = "force-dynamic";

/**
 * /dashboard/community
 *
 * Server component — fetches posts server-side and passes them to the
 * client feed. createdAt is serialized to ISO string so the client
 * component receives plain JSON (no Date objects across the boundary).
 */
export default async function CommunityPage() {
  const auth = await getAuth();

  const raw = await prisma.communityPost.findMany({
    where: { isHidden: false },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      content: true,
      imageUrls: true,
      isPinned: true,
      createdAt: true,
      user: {
        select: { id: true, firstName: true, lastName: true },
      },
      _count: { select: { comments: true } },
    },
  });

  const posts = raw.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  return <CommunityFeed posts={posts} currentUserId={auth?.sub ?? null} />;
}