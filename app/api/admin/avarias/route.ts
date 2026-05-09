export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  const reports = await prisma.avariaReport.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reports);
}
