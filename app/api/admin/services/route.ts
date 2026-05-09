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

  const where: Prisma.ServiceDocumentWhereInput = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { docId: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status === "active") where.active = true;
  if (status === "inactive") where.active = false;

  const orderBy: Prisma.ServiceDocumentOrderByWithRelationInput =
    sort === "oldest" ? { id: "asc" } :
    sort === "az"     ? { title: "asc" } :
    sort === "za"     ? { title: "desc" } :
    /* newest */        { id: "desc" };

  const [items, total] = await Promise.all([
    prisma.serviceDocument.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.serviceDocument.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const body = await req.json();
  const doc = await prisma.serviceDocument.create({
    data: {
      docId: body.docId,
      title: body.title,
      fileSize: body.fileSize,
      description: body.description,
      filePath: body.filePath ?? "",
      active: body.active ?? true,
    },
  });
  return NextResponse.json(doc, { status: 201 });
}
