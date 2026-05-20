export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, setCookieHeader } from "@/lib/publicAuth";

const Schema = z.object({
  nome:     z.string().min(3, "Nome demasiado curto.").max(120),
  email:    z.string().email("Email inválido."),
  password: z.string().min(8, "Palavra-passe deve ter pelo menos 8 caracteres."),
  telefone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] ?? "Dados inválidos.";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { nome, email, password, telefone } = parsed.data;

  try {
    const existing = await prisma.publicUser.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "Este email já está registado. Por favor inicie sessão." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.publicUser.create({
      data: { nome, email: email.toLowerCase(), hashedPassword, telefone },
    });

    const token = await createSession(user.id);

    return NextResponse.json(
      { user: { id: user.id, nome: user.nome, email: user.email } },
      { status: 201, headers: { "Set-Cookie": setCookieHeader(token) } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[register] error:", msg);
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
