export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";

const ALLOWED_STATUSES = ["PENDING", "IN_PROGRESS", "RESOLVED"] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

  let body: { status?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }); }

  if (!body.status || !ALLOWED_STATUSES.includes(body.status as typeof ALLOWED_STATUSES[number])) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  const updated = await prisma.avariaReport.update({
    where: { id: numId },
    data: { status: body.status },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

  await prisma.avariaReport.delete({ where: { id: numId } });
  return NextResponse.json({ ok: true });
}
