import { prisma } from "../lib/db";

async function main() {
  await prisma.mediaAsset.deleteMany();
  console.log("Cleared existing media assets.");

  await prisma.mediaAsset.createMany({
    data: [
      {
        filename: "evn-linhas-alta-tensao-maputo.jpg",
        originalName: "Linhas de Alta Tensão — Maputo",
        url: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&q=80",
        mimeType: "image/jpeg",
        sizeBytes: 524288,
        uploadedBy: "admin@evn.co.mz",
      },
      {
        filename: "evn-subestacao-distribuicao-eletrica.jpg",
        originalName: "Subestação de Distribuição Eléctrica",
        url: "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=1200&q=80",
        mimeType: "image/jpeg",
        sizeBytes: 687321,
        uploadedBy: "admin@evn.co.mz",
      },
      {
        filename: "evn-tecnico-campo-manutencao.jpg",
        originalName: "Técnico de Campo — Manutenção de Rede",
        url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&q=80",
        mimeType: "image/jpeg",
        sizeBytes: 445120,
        uploadedBy: "admin@evn.co.mz",
      },
      {
        filename: "evn-paineis-solares-zona-rural.jpg",
        originalName: "Painéis Solares — Eletrificação Rural",
        url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80",
        mimeType: "image/jpeg",
        sizeBytes: 512000,
        uploadedBy: "admin@evn.co.mz",
      },
      {
        filename: "evn-cidade-maputo-luzes-noturnas.jpg",
        originalName: "Cidade de Maputo — Vista Nocturna",
        url: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1200&q=80",
        mimeType: "image/jpeg",
        sizeBytes: 798432,
        uploadedBy: "admin@evn.co.mz",
      },
      {
        filename: "evn-operador-centro-controlo-scada.jpg",
        originalName: "Centro de Controlo SCADA — Operador",
        url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80",
        mimeType: "image/jpeg",
        sizeBytes: 365890,
        uploadedBy: "admin@evn.co.mz",
      },
      {
        filename: "evn-instalacao-nova-ligacao-residencial.jpg",
        originalName: "Nova Ligação — Instalação Residencial",
        url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80",
        mimeType: "image/jpeg",
        sizeBytes: 423100,
        uploadedBy: "admin@evn.co.mz",
      },
      {
        filename: "evn-contador-eletrico-digital.jpg",
        originalName: "Contador Eléctrico Digital — Credelec",
        url: "https://images.unsplash.com/photo-1548337138-e87d889cc369?w=1200&q=80",
        mimeType: "image/jpeg",
        sizeBytes: 298500,
        uploadedBy: "admin@evn.co.mz",
      },
      {
        filename: "evn-equipa-intervencao-avaria.jpg",
        originalName: "Equipa de Intervenção Rápida — Avaria",
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
        mimeType: "image/jpeg",
        sizeBytes: 512765,
        uploadedBy: "admin@evn.co.mz",
      },
      {
        filename: "evn-rede-distribuicao-bairro-residencial.jpg",
        originalName: "Rede de Distribuição — Bairro Residencial",
        url: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&q=80",
        mimeType: "image/jpeg",
        sizeBytes: 634210,
        uploadedBy: "admin@evn.co.mz",
      },
    ],
  });

  console.log("Seeded 10 EVN media assets.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
