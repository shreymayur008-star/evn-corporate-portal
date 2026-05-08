export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const alerts = await prisma.networkAlert.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(alerts);
  } catch {
    return NextResponse.json({ error: "Erro ao carregar alertas." }, { status: 500 });
  }
}
