export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getPublicUser } from "@/lib/publicAuth";

export async function GET() {
  const user = await getPublicUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { id: user.id, nome: user.nome, email: user.email } });
}
