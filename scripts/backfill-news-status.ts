// Run with: npx tsx scripts/backfill-news-status.ts
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { prisma } from "../lib/db";

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const all: any[] = await (prisma.newsArticle as any).findMany();
  let updated = 0;
  for (const article of all) {
    // active=true  → PUBLISHED
    // active=false → DRAFT
    const newStatus = article.active ? "PUBLISHED" : "DRAFT";
    await prisma.newsArticle.update({
      where: { id: article.id },
      data: { status: newStatus as "PUBLISHED" | "DRAFT" },
    });
    updated++;
  }
  console.log(`Backfilled status for ${updated} articles.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
