export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const news = await prisma.newsArticle.findMany({
      where: { active: true },
      orderBy: { publishedAt: "desc" },
    });
    return NextResponse.json(news);
  } catch {
    return NextResponse.json({ error: "Erro ao carregar notícias." }, { status: 500 });
  }
}
