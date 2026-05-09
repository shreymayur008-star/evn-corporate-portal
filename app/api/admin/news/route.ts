export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";
import { parseListParams } from "@/lib/listParams";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const CreateNewsSchema = z.object({
  tag: z.string().min(1).max(64),
  title: z.string().min(3).max(300),
  shortDesc: z.string().min(10).max(500),
  fullText: z.string().min(20).max(50000),
  imgUrl: z.string().url().nullable().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).optional(),
  publishAt: z.string().datetime().nullable().optional(),
});

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
  if (status === "DRAFT" || status === "SCHEDULED" || status === "PUBLISHED" || status === "ARCHIVED") {
    where.status = status;
  }

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

  const parsed = CreateNewsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { publishAt, ...rest } = parsed.data;
  const article = await prisma.newsArticle.create({
    data: {
      ...rest,
      imgUrl: rest.imgUrl ?? null,
      status: rest.status ?? "DRAFT",
      publishAt: publishAt ? new Date(publishAt) : null,
    },
  });
  return NextResponse.json(article, { status: 201 });
}
