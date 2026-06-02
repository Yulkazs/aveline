import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { awardPoints } from "@/lib/gamification";

type Params = { params: Promise<{ id: string }> };

// ── GET /api/community/posts/[id]/comments ────────────────────────────────────
// Returns all comments for a post, oldest first.
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const post = await prisma.communityPost.findUnique({
    where: { id, isHidden: false },
    select: { id: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Bericht niet gevonden" }, { status: 404 });
  }

  const comments = await prisma.communityComment.findMany({
    where: { postId: id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  return NextResponse.json(comments);
}

// ── POST /api/community/posts/[id]/comments ───────────────────────────────────
// Adds a comment to a post. Requires an authenticated session.
// Body: { content: string }
// Side-effect: sends a COMMUNITY_REPLY notification to the post author
//              (unless the commenter is the author themselves).
export async function POST(req: NextRequest, { params }: Params) {
  const auth = await getAuth();
  if (!auth) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { id: postId } = await params;
  const body = await req.json();
  const { content } = body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json(
      { error: "Reactie mag niet leeg zijn" },
      { status: 400 }
    );
  }

  const post = await prisma.communityPost.findUnique({
    where: { id: postId, isHidden: false },
    select: { id: true, userId: true, title: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Bericht niet gevonden" }, { status: 404 });
  }

  // Fetch commenter's name for the notification message
  const commenter = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: { firstName: true },
  });

  const comment = await prisma.communityComment.create({
    data: {
      postId,
      userId: auth.sub,
      content: content.trim(),
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  // Notify the post author — but not if they're replying to their own post
  if (post.userId !== auth.sub) {
    const commenterName = commenter?.firstName ?? "Iemand";
    await prisma.notification.create({
      data: {
        userId: post.userId,
        type: "COMMUNITY_REPLY",
        title: "Nieuwe reactie op jouw bericht",
        body: `${commenterName} heeft gereageerd op "${post.title ?? "jouw bericht"}"`,
        deepLink: `/dashboard/community/${postId}`,
      },
    });
  }

  // Award points to the commenter
  await awardPoints(auth.sub, "COMMUNITY_REPLY");

  return NextResponse.json(comment, { status: 201 });
}