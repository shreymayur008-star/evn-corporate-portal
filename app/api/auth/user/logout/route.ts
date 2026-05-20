export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { clearCookieHeader } from "@/lib/publicAuth";

export async function POST() {
  return NextResponse.json(
    { ok: true },
    { headers: { "Set-Cookie": clearCookieHeader() } }
  );
}
