export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;
  const services = await prisma.serviceDocument.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(services);
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
