import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

/* ── GET /api/complaints/[id] ────────────────────────────────────────────────
   Returns full complaint detail with statusHistory, user, product.     */
export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  const { id } = await params;

  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      user:    { select: { id: true, firstName: true, lastName: true, email: true, points: true } },
      product: { select: { name: true, batchNumber: true, origin: true, cacaoPercentage: true } },
      statusHistory: { orderBy: { changedAt: "desc" } },
      crmNotes: { orderBy: { createdAt: "desc" }, select: { id: true, content: true, createdBy: true, createdAt: true } },
    },
  });

  if (!complaint) {
    return NextResponse.json({ message: "Klacht niet gevonden." }, { status: 404 });
  }

  // B2C clients can only see their own complaints
  const isStaff = ["CUSTOMER_SERVICE", "ADMIN", "MARKETING"].includes(auth.role);
  if (!isStaff && complaint.userId !== auth.sub) {
    return NextResponse.json({ message: "Geen toegang." }, { status: 403 });
  }

  return NextResponse.json(complaint);
}

/* ── PATCH /api/complaints/[id] ──────────────────────────────────────────────
   Customer service: update status and/or resolution, or assign.
   Body: { status?, resolution?, assignedTo?, note? }                   */
export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  const isStaff = ["CUSTOMER_SERVICE", "ADMIN"].includes(auth.role);
  if (!isStaff) {
    return NextResponse.json({ message: "Geen toegang." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { status, resolution, assignedTo, note } = body as {
    status?:     string;
    resolution?: string;
    assignedTo?: string;
    note?:       string;
  };

  const complaint = await prisma.complaint.findUnique({ where: { id }, select: { id: true, status: true, userId: true } });
  if (!complaint) {
    return NextResponse.json({ message: "Klacht niet gevonden." }, { status: 404 });
  }

  const validStatuses = ["NEW", "IN_PROGRESS", "RESOLVED", "REFUNDED"];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ message: "Ongeldige status." }, { status: 400 });
  }

  // Build update
  const data: Record<string, unknown> = {};
  if (status)     data.status     = status;
  if (resolution) data.resolution = resolution.trim();
  if (assignedTo) data.assignedTo = assignedTo;

  const updated = await prisma.complaint.update({
    where: { id },
    data,
    include: {
      user:    { select: { id: true, firstName: true, lastName: true, email: true, points: true } },
      product: { select: { name: true, batchNumber: true, origin: true, cacaoPercentage: true } },
      statusHistory: { orderBy: { changedAt: "desc" } },
    },
  });

  // Record status history if status changed
  if (status && status !== complaint.status) {
    await prisma.complaintStatusHistory.create({
      data: {
        complaintId: id,
        status:      status as "NEW" | "IN_PROGRESS" | "RESOLVED" | "REFUNDED",
        changedBy:   auth.sub,
        note:        note ?? null,
      },
    });

    // Notify the customer of the status change
    const statusLabels: Record<string, string> = {
      IN_PROGRESS: "wordt nu behandeld",
      RESOLVED:    "is opgelost",
      REFUNDED:    "heeft geleid tot een terugbetaling",
    };
    if (statusLabels[status]) {
      await prisma.notification.create({
        data: {
          userId:   complaint.userId,
          type:     "COMPLAINT_UPDATE",
          title:    `Klachtupdate: je klacht ${statusLabels[status]}`,
          body:     note ?? `De status van je klacht is gewijzigd naar: ${status}.`,
          deepLink: `/dashboard/klachten/${id}`,
        },
      });
    }
  }

  return NextResponse.json({ ok: true, complaint: updated });
}

/* ── DELETE /api/complaints/[id] ─────────────────────────────────────────────
   Admin only: hard-delete a complaint (e.g. test data cleanup).        */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  if (auth.role !== "ADMIN") {
    return NextResponse.json({ message: "Alleen admins kunnen klachten verwijderen." }, { status: 403 });
  }

  const { id } = await params;

  const exists = await prisma.complaint.findUnique({ where: { id }, select: { id: true } });
  if (!exists) {
    return NextResponse.json({ message: "Klacht niet gevonden." }, { status: 404 });
  }

  // Cascade: delete status history and CRM notes first
  await prisma.complaintStatusHistory.deleteMany({ where: { complaintId: id } });
  await prisma.cRMNote.deleteMany({ where: { complaintId: id } });
  await prisma.complaint.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}