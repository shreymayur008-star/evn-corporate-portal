export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, setCookieHeader } from "@/lib/publicAuth";

const Schema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

const DUMMY_HASH = "$2a$12$placeholder.hash.to.prevent.timing.attacks.xxxxx";

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email ou palavra-passe inválidos." }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const user = await prisma.publicUser.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    return NextResponse.json({ error: "Email ou palavra-passe incorrectos." }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.hashedPassword);
  if (!valid) {
    return NextResponse.json({ error: "Email ou palavra-passe incorrectos." }, { status: 401 });
  }

  await prisma.publicUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const token = await createSession(user.id);

  return NextResponse.json(
    { user: { id: user.id, nome: user.nome, email: user.email } },
    { headers: { "Set-Cookie": setCookieHeader(token) } }
  );
}
