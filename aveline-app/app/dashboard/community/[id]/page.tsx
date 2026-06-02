import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import PostDetail from "@/components/community/PostDetail";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

/**
 * /dashboard/community/[id]
 *
 * Fetches the post + comments server-side. Passes currentUserId so the
 * client component can show edit/delete controls on the author's own post.
 */
export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;
  const auth = await getAuth();

  const raw = await prisma.communityPost.findUnique({
    where: { id, isHidden: false },
    select: {
      id: true,
      title: true,
      content: true,
      imageUrls: true,
      isPinned: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: { id: true, firstName: true, lastName: true },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
    },
  });

  if (!raw) notFound();

  // Serialize dates for the client boundary
  const post = {
    ...raw,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
    comments: raw.comments.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
  };

  return <PostDetail post={post} currentUserId={auth?.sub ?? null} />;
}