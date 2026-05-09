export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

  const asset = await prisma.mediaAsset.findUnique({ where: { id: numId } });
  if (!asset) return NextResponse.json({ error: "Ficheiro não encontrado." }, { status: 404 });

  const filePath = path.join(process.cwd(), "public", "uploads", asset.filename);
  try { await fs.unlink(filePath); } catch (err) {
    console.warn(`[media DELETE] file not found on disk: ${filePath}`, err);
  }

  await prisma.mediaAsset.delete({ where: { id: numId } });
  return NextResponse.json({ ok: true });
}
