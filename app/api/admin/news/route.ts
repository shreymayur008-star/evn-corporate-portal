export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;
  const news = await prisma.newsArticle.findMany({ orderBy: { publishedAt: "desc" } });
  return NextResponse.json(news);
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const body = await req.json();
  const article = await prisma.newsArticle.create({
    data: {
      tag: body.tag,
      title: body.title,
      shortDesc: body.shortDesc,
      fullText: body.fullText,
      imgUrl: body.imgUrl ?? "",
      active: body.active ?? true,
    },
  });
  return NextResponse.json(article, { status: 201 });
}
