// Run with: npx tsx scripts/dedup-alerts.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: ".env.local" });
config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const all = await prisma.networkAlert.findMany({ orderBy: { id: "asc" } });
  const seen = new Map<string, number>();
  const toDelete: number[] = [];

  for (const alert of all) {
    const key = `${alert.title}|${alert.zone}|${alert.date}`;
    if (seen.has(key)) {
      toDelete.push(alert.id);
    } else {
      seen.set(key, alert.id);
    }
  }

  if (toDelete.length === 0) {
    console.log("No duplicates found.");
    return;
  }

  await prisma.networkAlert.deleteMany({ where: { id: { in: toDelete } } });
  console.log(`Deleted ${toDelete.length} duplicate alert(s). IDs: ${toDelete.join(", ")}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
