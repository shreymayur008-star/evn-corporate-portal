import { prisma } from "../lib/db";

async function main() {
  await prisma.networkAlert.deleteMany();
  console.log("Cleared existing alerts.");

  await prisma.networkAlert.createMany({
    data: [
      {
        type: "URGENT",
        zone: "Maputo — Sommerschield / Polana",
        title: "Interrupção Não Programada — Alimentador AP-07",
        date: "14 Mai 2026 · 03:42",
        duration: "Indeterminado",
        description: "Falha detectada no Alimentador AP-07 devido a avaria em transformador de distribuição na Av. Julius Nyerere. Equipas de intervenção no local. Afecta: Sommerschield, Polana Cimento A e B, parte da Av. 24 de Julho.",
        active: true,
      },
      {
        type: "SCHEDULED",
        zone: "Beira — Munhava / Manga",
        title: "Manutenção Preventiva à Subestação de Munhava",
        date: "16 Mai 2026 · 08:00",
        duration: "6 horas",
        description: "Interrupção programada para substituição de disjuntores de 33 kV e calibração de relés de protecção na Subestação de Munhava. Afecta: Munhava, Manga Mascarenhas, Chota. Retoma prevista às 14:00.",
        active: true,
      },
      {
        type: "SCHEDULED",
        zone: "Nampula — Napipine / Muhala",
        title: "Substituição de Transformador Principal — Subestação Napipine",
        date: "18 Mai 2026 · 07:00",
        duration: "8 horas",
        description: "Substituição do transformador T2 de 40 MVA na Subestação de Napipine por unidade de maior capacidade (63 MVA). Serviço interrompido das 07:00 às 15:00. Afecta: Napipine, Muhala Expansão, parte de Natikiri. Gerador móvel disponível no Centro de Saúde de Napipine.",
        active: true,
      },
      {
        type: "URGENT",
        zone: "Gaza — Xai-Xai / Bairro Gare",
        title: "Avaria no Alimentador XAI-03 — Poste Caído",
        date: "13 Mai 2026 · 21:15",
        duration: "Indeterminado",
        description: "Poste de alta tensão caído na EN1 próximo ao cruzamento com Bairro Gare após colisão de veículo pesado. Zona isolada por forças de segurança. Afecta: Bairro Gare, 1º de Maio Norte, parte do Centro. Equipas em trânsito.",
        active: true,
      },
      {
        type: "RESOLVED",
        zone: "Matola — KaTembe / Infulene",
        title: "Reposição Concluída — Alimentador MT-12",
        date: "12 Mai 2026 · 18:40",
        duration: "Resolvido",
        description: "Alimentador MT-12 totalmente reposto após substituição de secção de cabo subterrâneo danificada por obras de saneamento na Av. de Moçambique. Fornecimento normalizado em toda a área afectada às 18:40. Agradecemos a compreensão dos clientes.",
        active: true,
      },
      {
        type: "SCHEDULED",
        zone: "Tete — Cidade Alta / Matundo",
        title: "Extensão de Rede — Novos Ramais em Cidade Alta",
        date: "20 Mai 2026 · 06:00",
        duration: "4 horas",
        description: "Ligação de novos ramais de distribuição em Cidade Alta para servir 340 novos fogos habitacionais. Corte breve das 06:00 às 10:00 para manobras de ligação. Afecta temporariamente: Cidade Alta Sul, parte do Matundo. Interrupção mínima prevista.",
        active: true,
      },
    ],
  });

  console.log("Seeded 6 professional network alerts.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
