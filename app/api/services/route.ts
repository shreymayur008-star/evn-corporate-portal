export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const services = await prisma.serviceDocument.findMany({
      where: { active: true },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(services);
  } catch {
    return NextResponse.json({ error: "Erro ao carregar serviços." }, { status: 500 });
  }
}
