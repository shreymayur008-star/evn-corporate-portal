export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";

export async function POST() {
  const guard = await requireAdmin();
  if (guard) return guard;

  const all = await prisma.mediaAsset.findMany();
  const newsUrls    = new Set((await prisma.newsArticle.findMany({ select: { imgUrl: true } })).map(n => n.imgUrl).filter(Boolean));
  const serviceUrls = new Set((await prisma.serviceDocument.findMany({ select: { filePath: true } })).map(s => s.filePath).filter(Boolean));
  const orphans = all.filter(a => !newsUrls.has(a.url) && !serviceUrls.has(a.url));

  let removed = 0;
  for (const o of orphans) {
    const fp = path.join(process.cwd(), "public", "uploads", o.filename);
    try { await fs.unlink(fp); } catch { /* file may already be gone */ }
    await prisma.mediaAsset.delete({ where: { id: o.id } });
    removed++;
  }

  return NextResponse.json({ removed });
}
