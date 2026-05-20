export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const ContactSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório.").max(120),
  email: z.string().email().optional().or(z.literal("")),
  mensagem: z.string().min(5, "Mensagem demasiado curta.").max(5000),
  assunto: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }); }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos.", details: parsed.error.flatten() }, { status: 400 });
  }

  const fullMensagem = parsed.data.assunto
    ? `[${parsed.data.assunto}]\n\n${parsed.data.mensagem}`
    : parsed.data.mensagem;

  const created = await prisma.contactMessage.create({
    data: {
      nome: parsed.data.nome,
      email: parsed.data.email || "nao-fornecido@evn.co.mz",
      mensagem: fullMensagem,
    },
  });
  return NextResponse.json({ id: created.id }, { status: 201 });
}
