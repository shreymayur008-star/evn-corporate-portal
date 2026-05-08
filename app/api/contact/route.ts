export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const Schema = z.object({
  nome: z.string().min(1).max(120),
  email: z.string().min(1).max(320).refine(v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^8[2-7]\d{7}$/.test(v), {
    message: "Introduza um email ou contacto válido.",
  }),
  mensagem: z.string().min(1).max(5000),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos.", details: parsed.error.flatten() }, { status: 400 });
  }

  const created = await prisma.contactMessage.create({ data: parsed.data });
  return NextResponse.json({ id: created.id }, { status: 201 });
}
