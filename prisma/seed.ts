import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });
config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── News Articles (exact content from page.tsx mock data) ─────────────────
  await prisma.newsArticle.createMany({
    skipDuplicates: true,
    data: [
      {
        tag: "Destaque",
        title: "Administração da EVN visita províncias para monitorar reposição do sistema eléctrico.",
        shortDesc: "A EVN está no terreno para garantir a estabilidade da rede após os recentes eventos climáticos.",
        fullText:
          "Maputo — Em resposta aos recentes eventos climáticos severos, o Conselho de Administração da Eletricidade Vantara Nacional (EVN) iniciou uma visita de campo intensiva. A prioridade máxima da EVN é restabelecer o fornecimento seguro de energia às comunidades afetadas e avaliar os danos nas infraestruturas críticas de transmissão.",
        imgUrl:
          "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80",
      },
      {
        tag: "Infraestrutura",
        title: "EVN necessita de 604 milhões de meticais para compensar danos das cheias.",
        shortDesc:
          "Os fundos serão destinados à reconstrução urgente de subestações e linhas de média tensão.",
        fullText:
          "A Eletricidade Vantara Nacional (EVN) anunciou hoje que será necessário um fundo de contingência de 604 milhões de meticais para reparar os danos causados pelas recentes inundações. Os fundos serão alocados imediatamente para a substituição de postes caídos e modernização das subestações.",
        imgUrl:
          "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
      },
      {
        tag: "Cooperação",
        title: "EVN estreita laços com parceiros internacionais para o desenvolvimento Nacional.",
        shortDesc:
          "Novos acordos visam a expansão acelerada da rede elétrica para zonas rurais e industriais.",
        fullText:
          "Num esforço contínuo para alcançar a eletrificação universal, a Eletricidade Vantara Nacional (EVN) assinou três novos memorandos de entendimento com parceiros globais focando em energias renováveis e modernização da rede.",
        imgUrl:
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400&q=80",
      },
    ],
  });

  // ── Service Documents ─────────────────────────────────────────────────────
  await prisma.serviceDocument.createMany({
    skipDuplicates: true,
    data: [
      {
        docId: "mod-01",
        title: "Formulário de Mudança de Titularidade",
        fileSize: "1.2 MB",
        description: "Acompanhar com cópia de BI e título de propriedade.",
      },
      {
        docId: "req-vis",
        title: "Requerimento para Pedido de Vistoria",
        fileSize: "850 KB",
        description: "Obrigatório para aumento de potência elétrica.",
      },
      {
        docId: "term-resp",
        title: "Termo de Responsabilidade Técnica",
        fileSize: "2.1 MB",
        description: "Exclusivo para eletricistas credenciados.",
      },
    ],
  });

  // ── Network Alerts ────────────────────────────────────────────────────────
  await prisma.networkAlert.createMany({
    skipDuplicates: true,
    data: [
      {
        type: "URGENT",
        zone: "Sul — Rede Principal",
        title: "Interrupção Não Programada — Zona Sul",
        date: "07 Mai 2026 · 02:15",
        duration: "Indeterminado",
        description:
          "Falha na subestação principal de Maputo Sul. Equipas técnicas no local. Previsão de reposição: 4–6 horas.",
      },
      {
        type: "SCHEDULED",
        zone: "Matola — KaTembe",
        title: "Manutenção Preventiva Programada",
        date: "09 Mai 2026 · 08:00",
        duration: "6 horas",
        description:
          "Substituição de transformadores de 33kV. Afeta os bairros Infulene A e B. Energia reposiciona às 14:00.",
      },
      {
        type: "RESOLVED",
        zone: "Gaza — Xai-Xai",
        title: "Reposição Concluída — Gaza Norte",
        date: "05 Mai 2026 · 18:40",
        duration: "Resolvido",
        description: "Fornecimento totalmente restabelecido. Causa: queda de poste por ventos fortes.",
      },
    ],
  });

  // ── Admin User (default) ──────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("evnadmin2026!", 12);
  await prisma.adminUser.upsert({
    where: { email: "admin@evn.co.mz" },
    update: {},
    create: { email: "admin@evn.co.mz", hashedPassword, role: "admin" },
  });

  // ── Demo avaria reports ───────────────────────────────────────────────────
  await prisma.avariaReport.createMany({
    data: [
      { type: "Poste Caído", lat: -25.9692, lng: 32.5732, description: "Poste de média tensão caído após tempestade. Cabos no chão, zona isolada com fita.", reporterIp: "192.0.2.1", status: "PENDING" },
      { type: "Cabo Partido", lat: -25.9255, lng: 32.5816, description: "Cabo aéreo partido entre dois postes na rua principal. Corrente interrompida em três quarteirões.", reporterIp: "192.0.2.2", status: "IN_PROGRESS" },
      { type: "Falha de Fornecimento", lat: -25.8950, lng: 32.6100, description: "Bairro inteiro sem energia há mais de 4 horas. Sem aviso prévio.", reporterIp: "192.0.2.3", status: "RESOLVED" },
    ],
    skipDuplicates: true,
  });

  // ── Demo contact messages ─────────────────────────────────────────────────
  await prisma.contactMessage.createMany({
    data: [
      { nome: "Maria Macamo", email: "maria.macamo@example.mz", mensagem: "Boa tarde, gostaria de saber como solicitar a mudança de titularidade do contador. Obrigada.", read: false },
      { nome: "João Sitoe", email: "joao.sitoe@example.mz", mensagem: "A minha factura deste mês parece estar errada — o consumo está três vezes acima do habitual. Podem verificar?", read: false },
      { nome: "Ana Mahumane", email: "ana.m@example.mz", mensagem: "Excelente serviço da equipa de manutenção que veio reparar o transformador no nosso bairro. Muito obrigada!", read: true },
    ],
    skipDuplicates: true,
  });

  console.log("✅ EVN database seeded successfully.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
