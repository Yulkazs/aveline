import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { awardPoints } from "@/lib/gamification";

// ── GET /api/community/posts ──────────────────────────────────────────────────
// Returns all visible posts, newest first, with author info and comment count.
export async function GET() {
  const posts = await prisma.communityPost.findMany({
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
      _count: {
        select: { comments: true },
      },
    },
  });

  return NextResponse.json(posts);
}

// ── POST /api/community/posts ─────────────────────────────────────────────────
// Creates a new post. Requires an authenticated session.
// Body: { title?: string; content: string; imageUrls?: string[] }
export async function POST(req: NextRequest) {
  const auth = await getAuth();
  if (!auth) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const body = await req.json();
  const { title, content, imageUrls } = body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json(
      { error: "Inhoud mag niet leeg zijn" },
      { status: 400 }
    );
  }

  const post = await prisma.communityPost.create({
    data: {
      userId: auth.sub,
      title: title?.trim() || null,
      content: content.trim(),
      imageUrls: imageUrls ?? [],
    },
    select: {
      id: true,
      title: true,
      content: true,
      imageUrls: true,
      createdAt: true,
      user: {
        select: { id: true, firstName: true, lastName: true },
      },
      _count: { select: { comments: true } },
    },
  });

  // Award points + badge (FIRST_POST, COMMUNITY_STAR) via shared gamification lib
  await awardPoints(auth.sub, "COMMUNITY_POST");

  return NextResponse.json(post, { status: 201 });
}