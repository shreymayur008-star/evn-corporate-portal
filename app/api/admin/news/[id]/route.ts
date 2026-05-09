export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";
import { z } from "zod";

const UpdateNewsSchema = z.object({
  tag: z.string().min(1).max(64).optional(),
  title: z.string().min(3).max(300).optional(),
  shortDesc: z.string().min(10).max(500).optional(),
  fullText: z.string().min(20).max(50000).optional(),
  imgUrl: z.string().url().nullable().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).optional(),
  publishAt: z.string().datetime().nullable().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const { id } = await params;
  const body = await req.json();

  const parsed = UpdateNewsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { publishAt, ...rest } = parsed.data;
  const data: Record<string, unknown> = { ...rest };
  if (publishAt !== undefined) {
    data.publishAt = publishAt ? new Date(publishAt) : null;
  }

  const updated = await prisma.newsArticle.update({
    where: { id: Number(id) },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const { id } = await params;
  await prisma.newsArticle.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
