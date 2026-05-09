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

  const where: Prisma.NetworkAlertWhereInput = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { zone: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status === "active") where.active = true;
  else if (status === "inactive") where.active = false;
  else if (status === "URGENT") where.type = "URGENT";
  else if (status === "SCHEDULED") where.type = "SCHEDULED";
  else if (status === "RESOLVED") where.type = "RESOLVED";

  const orderBy: Prisma.NetworkAlertOrderByWithRelationInput =
    sort === "oldest" ? { createdAt: "asc" } :
    /* newest */        { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.networkAlert.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.networkAlert.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const body = await req.json();
  const alert = await prisma.networkAlert.create({
    data: {
      type: body.type,
      zone: body.zone,
      title: body.title,
      date: body.date,
      duration: body.duration,
      description: body.description,
      active: body.active ?? true,
    },
  });
  return NextResponse.json(alert, { status: 201 });
}
