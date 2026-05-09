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

  const where: Prisma.MediaAssetWhereInput = {};
  if (q) where.OR = [
    { originalName: { contains: q, mode: "insensitive" } },
    { filename: { contains: q, mode: "insensitive" } },
  ];
  if (status === "image") where.mimeType = { startsWith: "image/" };
  if (status === "pdf")   where.mimeType = "application/pdf";

  const orderBy: Prisma.MediaAssetOrderByWithRelationInput =
    sort === "oldest"   ? { createdAt: "asc" } :
    sort === "largest"  ? { sizeBytes: "desc" } :
    sort === "smallest" ? { sizeBytes: "asc" } :
                          { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.mediaAsset.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.mediaAsset.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit });
}
