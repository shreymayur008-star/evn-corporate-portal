import { prisma } from "../lib/db";

async function main() {
  await prisma.contactMessage.deleteMany();

  await prisma.contactMessage.createMany({
    data: [
      {
        nome: "Eng. Felicidade Cossa",
        email: "f.cossa@construmoz.co.mz",
        mensagem: "Bom dia, somos uma empresa de construção civil em fase de legalização de um condomínio residencial no Bairro do Triunfo, Maputo. Necessitamos de informações sobre os requisitos técnicos e o processo para solicitação de ligação trifásica de 400V com potência de 250 kVA. Podem indicar o procedimento e os documentos necessários? Obrigada.",
        read: false,
      },
      {
        nome: "Manuel Jeremias Nhantumbo",
        email: "mjeremias@gmail.com",
        mensagem: "Venho por este meio apresentar uma reclamação relativamente à minha factura do mês de Abril. O valor indicado é de 4.850 MZN, o que representa o triplo do valor habitual. Não adquiri nenhum equipamento novo nem alterei os meus hábitos de consumo. O número do meu contador é 08374619250. Por favor, solicito uma revisão urgente da leitura.",
        read: false,
      },
      {
        nome: "Dra. Anabela Machava",
        email: "amachava@saude.gov.mz",
        mensagem: "Sou directora do Centro de Saúde de Machava II e quero agradecer a rapidez com que a equipa da EVN interveio ontem durante a falha de energia que durou aproximadamente 2 horas. Os técnicos foram muito profissionais e comunicativos. O gerador de apoio foi essencial para manter os serviços críticos. Parabéns à equipa.",
        read: true,
      },
      {
        nome: "João Albino Sitoe",
        email: "jsitoe.consulting@outlook.com",
        mensagem: "Boa tarde. Estou interessado em compreender melhor as condições da nova tarifa bi-horária anunciada. Tenho 4 unidades de arrendamento no Bairro de Sommerschield e seria vantajoso perceber se consigo optimizar os custos de electricidade com este regime. Podem fornecer simulação comparativa entre a tarifa actual e a bi-horária para um consumo mensal de 800 kWh por fogo?",
        read: true,
      },
      {
        nome: "Associação de Moradores da Machava",
        email: "amachava.moradores@gmail.com",
        mensagem: "A nossa associação representa 1.200 famílias no Bairro da Machava Norte. Há 3 semanas que o poste central na Rua 4 está inclinado de forma perigosa. Já enviamos fotografias para o número de WhatsApp mas não obtivemos resposta. O poste representa risco para as crianças que passam na via. Pedimos intervenção urgente.",
        read: false,
      },
    ],
  });

  console.log("Seeded 5 professional contact messages.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
