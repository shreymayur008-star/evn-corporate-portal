import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/db";

const SECRET = new TextEncoder().encode(
  process.env.PUBLIC_AUTH_SECRET ?? process.env.AUTH_SECRET ?? "evn-public-fallback-secret"
);

const COOKIE_NAME = "evn-user-session";
const EXPIRY_DAYS = 30;

export async function createSession(userId: number): Promise<string> {
  const expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const session = await prisma.publicSession.create({
    data: { userId, expiresAt },
  });

  const token = await new SignJWT({ sessionId: session.id, userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${EXPIRY_DAYS}d`)
    .sign(SECRET);

  return token;
}

export async function getPublicUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET);
    const { sessionId } = payload as { sessionId: string };

    const session = await prisma.publicSession.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) return null;
    return session.user;
  } catch {
    return null;
  }
}

export function setCookieHeader(token: string): string {
  const maxAge = EXPIRY_DAYS * 24 * 60 * 60;
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

export function clearCookieHeader(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0`;
}
