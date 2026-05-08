export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const Schema = z.object({
  type: z.string().min(1).max(64),
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),
  description: z.string().min(10).max(2000),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos.", details: parsed.error.flatten() }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const created = await prisma.avariaReport.create({
    data: { ...parsed.data, reporterIp: ip },
  });
  return NextResponse.json({ id: created.id }, { status: 201 });
}
