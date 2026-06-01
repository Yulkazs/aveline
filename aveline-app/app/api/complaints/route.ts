import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardPoints } from "@/lib/gamification";

/* ── GET /api/complaints ─────────────────────────────────────────────────────
   B2C:              returns own complaints
   CUSTOMER_SERVICE / ADMIN: returns all complaints, sortable            */
export async function GET(req: NextRequest) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const status   = searchParams.get("status")   ?? undefined;
  const priority = searchParams.get("priority") ?? undefined;
  const search   = searchParams.get("q")        ?? undefined;

  const isStaff = ["CUSTOMER_SERVICE", "ADMIN", "MARKETING"].includes(auth.role);

  // Staff sees all; B2C clients see only their own
  const where: Record<string, unknown> = isStaff
    ? {}
    : { userId: auth.sub };

  if (status)   where.status   = status;
  if (priority) where.priority = priority;
  if (search) {
    where.OR = [
      { referenceNumber: { contains: search, mode: "insensitive" } },
      { description:     { contains: search, mode: "insensitive" } },
      { user: { email:      { contains: search, mode: "insensitive" } } },
      { user: { firstName:  { contains: search, mode: "insensitive" } } },
      { user: { lastName:   { contains: search, mode: "insensitive" } } },
    ];
  }

  const complaints = await prisma.complaint.findMany({
    where,
    include: {
      user:    { select: { id: true, firstName: true, lastName: true, email: true, points: true } },
      product: { select: { name: true, batchNumber: true, origin: true, cacaoPercentage: true } },
      statusHistory: { orderBy: { changedAt: "desc" } },
    },
    orderBy: [
      // HIGH first, then MEDIUM, then LOW
      { priority: "asc" },
      { createdAt: "desc" },
    ],
  });

  return NextResponse.json(complaints);
}

/* ── POST /api/complaints ────────────────────────────────────────────────────
   B2C client submits a new complaint.
   Body: { productId, type, description, mediaUrls? }                   */
export async function POST(req: NextRequest) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  // Only B2C clients (and admins for testing) can file complaints
  if (!["B2C_CLIENT", "ADMIN"].includes(auth.role)) {
    return NextResponse.json({ message: "Geen toegang." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { productId, type, description, mediaUrls = [] } = body as {
    productId?: string;
    type?: string;
    description?: string;
    mediaUrls?: string[];
  };

  if (!productId || !type || !description?.trim()) {
    return NextResponse.json({ message: "Verplichte velden ontbreken." }, { status: 400 });
  }

  const validTypes = ["MELT_DAMAGE", "BREAK_DAMAGE", "TEXTURE_DEVIATION", "OTHER"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ message: "Ongeldig klachttype." }, { status: 400 });
  }

  if (description.trim().length < 20) {
    return NextResponse.json({ message: "Omschrijving is te kort (minimaal 20 tekens)." }, { status: 400 });
  }

  // Verify product exists
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) {
    return NextResponse.json({ message: "Product niet gevonden." }, { status: 404 });
  }

  // Determine priority based on type (business logic)
  const priorityMap: Record<string, "LOW" | "MEDIUM" | "HIGH"> = {
    MELT_DAMAGE:        "HIGH",
    BREAK_DAMAGE:       "MEDIUM",
    TEXTURE_DEVIATION:  "MEDIUM",
    OTHER:              "LOW",
  };

  const complaint = await prisma.complaint.create({
    data: {
      userId:      auth.sub,
      productId,
      type:        type as "MELT_DAMAGE" | "BREAK_DAMAGE" | "TEXTURE_DEVIATION" | "OTHER",
      description: description.trim(),
      mediaUrls,
      priority:    priorityMap[type],
      status:      "NEW",
    },
    select: { id: true, referenceNumber: true, priority: true, status: true },
  });

  // Log initial status
  await prisma.complaintStatusHistory.create({
    data: {
      complaintId: complaint.id,
      status:      "NEW",
      note:        "Klacht ingediend door klant.",
    },
  });

  // Award points + check badges
  const gamification = await awardPoints(auth.sub, "COMPLAINT").catch(() => null);

  // Notify customer service staff
  const csStaff = await prisma.user.findMany({
    where: { role: "CUSTOMER_SERVICE" },
    select: { id: true },
  });
  if (csStaff.length > 0) {
    await prisma.notification.createMany({
      data: csStaff.map((u) => ({
        userId:  u.id,
        type:    "COMPLAINT_UPDATE" as const,
        title:   `Nieuwe klacht: ${complaint.referenceNumber}`,
        body:    `Prioriteit: ${complaint.priority}. ${description.trim().slice(0, 80)}…`,
        deepLink: `/dashboard/klachten/${complaint.id}`,
      })),
    });
  }

  return NextResponse.json(
    { ok: true, complaint, gamification },
    { status: 201 }
  );
}