import { prisma } from "../lib/db";

async function main() {
  await prisma.avariaReport.deleteMany();
  console.log("Cleared existing avaria reports.");

  await prisma.avariaReport.createMany({
    data: [
      {
        type: "Poste Caído",
        lat: -25.9512,
        lng: 32.5890,
        description: "Poste de média tensão caído sobre a via pública na Rua da Resistência, Bairro Maxaquene A. O poste caiu após fortes ventos da madrugada. Cabos no chão, trânsito interrompido. Zona sinalizada por moradores.",
        reporterIp: "41.79.212.45",
        status: "IN_PROGRESS",
      },
      {
        type: "Transformador Avariado",
        lat: -25.8867,
        lng: 32.6124,
        description: "Transformador a fazer barulho anormal e a emitir faíscas na Av. Acordos de Lusaka, próximo ao Mercado do Zimpeto. Já houve um pequeno incêndio apagado pelos residentes. Sem energia em 3 quarteirões.",
        reporterIp: "41.79.245.12",
        status: "PENDING",
      },
      {
        type: "Cabo Partido",
        lat: -19.8437,
        lng: 34.8390,
        description: "Cabo aéreo de distribuição partido na Rua Major Serpa Pinto, Beira. O cabo caiu sobre árvores e está a balançar com o vento. Perigo iminente. Afecta o Bairro da Munhava central, incluindo a escola primária local.",
        reporterIp: "41.222.56.78",
        status: "RESOLVED",
      },
      {
        type: "Falha de Fornecimento",
        lat: -15.1165,
        lng: 39.2666,
        description: "Bairro de Napipine sem energia há mais de 6 horas. Nenhuma comunicação da EVN sobre a duração. O freezer do centro comunitário de saúde está a desligar. Medicamentos e vacinas em risco. Urgente.",
        reporterIp: "196.27.34.90",
        status: "PENDING",
      },
      {
        type: "Iluminação Pública",
        lat: -25.9692,
        lng: 32.5732,
        description: "Toda a iluminação pública da Av. Eduardo Mondlane entre a Praça dos Trabalhadores e a Praça 16 de Junho está inoperacional há 4 dias. A zona tem registado vários incidentes de insegurança durante a noite. Necessita de intervenção urgente.",
        reporterIp: "196.22.102.15",
        status: "IN_PROGRESS",
      },
    ],
  });

  console.log("Seeded 5 professional avaria reports.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
