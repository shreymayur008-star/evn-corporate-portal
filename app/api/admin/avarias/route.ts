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

  const where: Prisma.AvariaReportWhereInput = {};
  if (q) {
    where.OR = [
      { description: { contains: q, mode: "insensitive" } },
      { type: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status === "PENDING" || status === "IN_PROGRESS" || status === "RESOLVED") {
    where.status = status;
  }

  const orderBy: Prisma.AvariaReportOrderByWithRelationInput =
    sort === "oldest" ? { createdAt: "asc" } :
    /* newest */        { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.avariaReport.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.avariaReport.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit });
}
