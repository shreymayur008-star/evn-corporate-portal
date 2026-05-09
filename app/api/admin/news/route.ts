export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";
import { parseListParams } from "@/lib/listParams";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { q, status, page, limit, sort } = parseListParams(req);

  const where: Prisma.NewsArticleWhereInput = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { shortDesc: { contains: q, mode: "insensitive" } },
      { tag: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status === "active") where.active = true;
  if (status === "inactive") where.active = false;

  const orderBy: Prisma.NewsArticleOrderByWithRelationInput =
    sort === "oldest" ? { publishedAt: "asc" } :
    sort === "az"     ? { title: "asc" } :
    sort === "za"     ? { title: "desc" } :
    /* newest */        { publishedAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.newsArticle.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.newsArticle.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit });
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
