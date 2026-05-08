/**
 * Edge-safe proxy — ZERO next-auth / Prisma imports.
 *
 * Auth.js v5 sessions are JWE tokens (A256CBC-HS512) whose encryption key is
 * derived from AUTH_SECRET via HKDF-SHA256.  We replicate that derivation with
 * @panva/hkdf + jose — both pure-JS packages safe for the Edge runtime.
 *
 * Import chain:
 *   proxy.ts
 *     ├── jose          (pure-JS, Edge-safe)
 *     ├── @panva/hkdf   (pure-JS, Edge-safe)
 *     └── next/server   (always Edge-safe)
 *
 * NO next-auth, NO lib/auth.ts, NO lib/db.ts, NO @prisma/client.
 */

import { jwtDecrypt } from "jose";
import { hkdf } from "@panva/hkdf";
import { NextRequest, NextResponse } from "next/server";

// Auth.js v5 names the cookie differently by environment.
const COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

async function deriveKey(secret: string, salt: string): Promise<Uint8Array> {
  return hkdf(
    "sha256",
    secret,
    salt,
    `Auth.js Generated Encryption Key (${salt})`,
    64,
  );
}

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return false;

  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;

  try {
    const key = await deriveKey(secret, COOKIE);
    await jwtDecrypt(token, key, {
      clockTolerance: 15,
      keyManagementAlgorithms: ["dir"],
      contentEncryptionAlgorithms: ["A256CBC-HS512", "A256GCM"],
    });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  if (!(await hasValidSession(req))) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/admin/cms/:path*"],
};
