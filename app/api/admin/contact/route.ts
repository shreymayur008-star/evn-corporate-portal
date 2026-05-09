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

  const where: Prisma.ContactMessageWhereInput = {};
  if (q) {
    where.OR = [
      { nome: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { mensagem: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status === "unread") where.read = false;
  if (status === "read") where.read = true;

  const orderBy: Prisma.ContactMessageOrderByWithRelationInput =
    sort === "oldest" ? { createdAt: "asc" } :
    /* newest */        { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.contactMessage.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.contactMessage.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit });
}
