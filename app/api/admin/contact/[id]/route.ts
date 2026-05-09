export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

  let body: { read?: boolean };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }); }

  if (typeof body.read !== "boolean") {
    return NextResponse.json({ error: "Campo 'read' inválido." }, { status: 400 });
  }

  const updated = await prisma.contactMessage.update({
    where: { id: numId },
    data: { read: body.read },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

  await prisma.contactMessage.delete({ where: { id: numId } });
  return NextResponse.json({ ok: true });
}
