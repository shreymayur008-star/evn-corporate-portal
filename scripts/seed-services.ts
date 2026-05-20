import { prisma } from "../lib/db";

async function main() {
  await prisma.serviceDocument.deleteMany();
  console.log("Cleared existing service documents.");

  await prisma.serviceDocument.createMany({
    data: [
      {
        docId: "MOD-EVN-TRT-001",
        title: "Termo de Responsabilidade Técnica",
        description: "Documento obrigatório para eletricistas credenciados que realizam instalações elétricas em Moçambique. Certifica que a instalação foi executada em conformidade com as normas NP EN 60364 e regulamentos da ARENE. Deve ser assinado pelo instalador responsável e entregue à EVN antes da ligação.",
        fileSize: "2.1 MB",
        filePath: "/uploads/termo-responsabilidade-tecnica.pdf",
        active: true,
      },
      {
        docId: "MOD-EVN-VIS-002",
        title: "Requerimento para Pedido de Vistoria",
        description: "Formulário oficial para solicitação de vistoria técnica pela EVN a instalações eléctricas existentes ou novas. Necessário para aumento de potência contratada, mudança de classe tarifária, ou ligação de novas instalações à rede. Prazo de resposta da EVN: 10 dias úteis após recepção.",
        fileSize: "850 KB",
        filePath: "/uploads/requerimento-pedido-vistoria.pdf",
        active: true,
      },
      {
        docId: "MOD-EVN-MT-003",
        title: "Formulário de Mudança de Titularidade",
        description: "Requerimento para transferência do contrato de fornecimento eléctrico para outro titular. Aplicável em casos de compra e venda de imóvel, herança, divórcio ou cessão de estabelecimento comercial. Documentos obrigatórios: BI de ambas as partes, documento de propriedade ou escritura, e declaração assinada do cedente.",
        fileSize: "1.2 MB",
        filePath: "/uploads/formulario-mudanca-titularidade.pdf",
        active: true,
      },
    ],
  });

  console.log("Seeded 3 professional service documents.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
