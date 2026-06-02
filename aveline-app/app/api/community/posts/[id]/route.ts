import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

// ── GET /api/community/posts/[id] ─────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const post = await prisma.communityPost.findUnique({
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
      _count: { select: { comments: true } },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Bericht niet gevonden" }, { status: 404 });
  }

  return NextResponse.json(post);
}

// ── PATCH /api/community/posts/[id] ───────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth();
  if (!auth) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { id } = await context.params;
  const post = await prisma.communityPost.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Bericht niet gevonden" }, { status: 404 });
  }
  if (post.userId !== auth.sub) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const body = await req.json();
  const { title, content } = body;

  if (content !== undefined && content.trim().length === 0) {
    return NextResponse.json(
      { error: "Inhoud mag niet leeg zijn" },
      { status: 400 }
    );
  }

  const updated = await prisma.communityPost.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title: title.trim() || null } : {}),
      ...(content !== undefined ? { content: content.trim() } : {}),
    },
    select: {
      id: true,
      title: true,
      content: true,
      imageUrls: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(updated);
}

// ── DELETE /api/community/posts/[id] ──────────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth();
  if (!auth) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { id } = await context.params;
  const post = await prisma.communityPost.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Bericht niet gevonden" }, { status: 404 });
  }
  if (post.userId !== auth.sub) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  await prisma.communityPost.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}