export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const news = await prisma.newsArticle.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { publishAt: null },
          { publishAt: { lte: now } },
        ],
      },
      orderBy: { publishedAt: "desc" },
    });
    return NextResponse.json(news);
  } catch {
    return NextResponse.json({ error: "Erro ao carregar notícias." }, { status: 500 });
  }
}
