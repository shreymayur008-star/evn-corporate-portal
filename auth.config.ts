import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth config — zero Node.js-only dependencies.
 * No Prisma, no bcrypt, no adapters. This file runs in the Edge Runtime.
 * The Credentials provider (which needs Prisma) is added in lib/auth.ts.
 */
export const authConfig: NextAuthConfig = {
  providers: [],
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminCms = nextUrl.pathname.startsWith("/admin/cms");
      if (isAdminCms && !isLoggedIn) return false;
      return true;
    },
    jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role;
      return token;
    },
    session({ session, token }) {
      if (session.user) (session.user as { role?: string }).role = token.role as string;
      return session;
    },
  },
};
