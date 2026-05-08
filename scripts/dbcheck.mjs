import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const [news, services, alerts, admins, avarias, contacts] = await Promise.all([
    prisma.newsArticle.count(),
    prisma.serviceDocument.count(),
    prisma.networkAlert.count(),
    prisma.adminUser.count(),
    prisma.avariaReport.count(),
    prisma.contactMessage.count(),
  ]);
  console.log("Final counts:", { news, services, alerts, admins, avarias, contacts });
  const allAlerts = await prisma.networkAlert.findMany({ orderBy: { id: "asc" } });
  console.log("Alerts:", JSON.stringify(allAlerts, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
