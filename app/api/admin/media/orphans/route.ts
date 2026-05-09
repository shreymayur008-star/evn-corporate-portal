export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  const all = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });

  const newsUrls    = new Set((await prisma.newsArticle.findMany({ select: { imgUrl: true } })).map(n => n.imgUrl).filter(Boolean));
  const serviceUrls = new Set((await prisma.serviceDocument.findMany({ select: { filePath: true } })).map(s => s.filePath).filter(Boolean));

  const orphans = all.filter(a => !newsUrls.has(a.url) && !serviceUrls.has(a.url));
  return NextResponse.json({ orphans, totalChecked: all.length });
}
