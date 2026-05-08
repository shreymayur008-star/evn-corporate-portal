export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;
  const alerts = await prisma.networkAlert.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(alerts);
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
