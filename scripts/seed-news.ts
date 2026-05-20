import { prisma } from "../lib/db";

async function main() {
  await prisma.newsArticle.deleteMany();
  console.log("Cleared existing articles.");

  await prisma.newsArticle.createMany({
    data: [
      {
        tag: "Infraestrutura",
        title: "EVN Expande Rede Eléctrica a 120 Novas Localidades Rurais em 2026",
        shortDesc: "O maior programa de eletrificação rural da história do país vai levar energia a mais de 520 mil famílias moçambicanas até ao final de 2026.",
        fullText: `<h2>Expansão histórica da rede eléctrica nacional</h2><p>A Eletricidade Vantara Nacional, E.P. (EVN) anunciou o maior programa de expansão da rede eléctrica da história de Moçambique, com um investimento de 1,2 mil milhões de meticais para levar energia a 120 novas localidades rurais em 8 das 11 províncias do país.</p><p>O programa beneficiará directamente mais de 520 mil famílias, representando aproximadamente 2,6 milhões de pessoas que terão acesso à electricidade pela primeira vez.</p><h2>Províncias abrangidas</h2><p>A expansão cobrirá Gaza, Inhambane, Sofala, Manica, Tete, Nampula, Niassa e Zambézia, com particular ênfase nas zonas de maior densidade populacional ainda sem ligação à rede nacional. Os trabalhos incluem 890 km de novas linhas de média tensão e a instalação de 340 transformadores de distribuição.</p><h2>Financiamento internacional</h2><p>O programa conta com o apoio do Banco Africano de Desenvolvimento (BAD) e da Agência Francesa de Desenvolvimento (AFD), que financiam 70% do custo total. Os restantes 30% são assegurados pelo Estado moçambicano. As obras nas províncias de Gaza e Inhambane já arrancaram.</p>`,
        imgUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80",
        status: "PUBLISHED",
        publishAt: null,
      },
      {
        tag: "Investimento",
        title: "Subestação de Matola II Inaugurada com Capacidade de 150 MVA",
        shortDesc: "A nova subestação vai eliminar as sobretensões crónicas que afectavam mais de 380 mil clientes na Grande Matola e reforçar o fornecimento industrial.",
        fullText: `<h2>Nova infraestrutura reforça o fornecimento na Grande Matola</h2><p>Foi inaugurada esta semana a Subestação de Matola II, uma infraestrutura de 150 MVA que representa o maior investimento individual em infraestrutura eléctrica na Área Metropolitana de Maputo dos últimos 15 anos.</p><p>A nova subestação, localizada na Zona Industrial da Matola, vai servir directamente 380 mil clientes residenciais e mais de 200 unidades industriais que historicamente sofriam quedas de tensão frequentes nos períodos de maior consumo.</p><h2>Especificações técnicas</h2><p>A subestação opera a 220/33/11 kV e está equipada com transformadores de última geração fabricados pela ABB e sistemas de telecomando que permitem a operação remota a partir do Centro de Despacho Nacional em Maputo. O sistema inclui ainda redundância automática que garante comutação em menos de 3 segundos em caso de falha.</p><h2>Impacto para a indústria</h2><p>Para o sector industrial, a nova infraestrutura significa uma tensão estável que reduzirá as perdas de produção estimadas em 45 milhões de meticais anuais devido às instabilidades da rede anterior. As empresas do Parque Industrial da Matola serão as primeiras a beneficiar da nova ligação.</p>`,
        imgUrl: "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=800&q=80",
        status: "PUBLISHED",
        publishAt: null,
      },
      {
        tag: "Sustentabilidade",
        title: "EVN Lança Programa Nacional de Eficiência Energética para Residências",
        shortDesc: "Clientes residenciais podem agora solicitar auditorias gratuitas e receber apoio para substituição de equipamentos de baixa eficiência por modelos Classe A.",
        fullText: `<h2>Eficiência energética chega às famílias moçambicanas</h2><p>A EVN lançou o Programa Nacional de Eficiência Energética (PNEE), uma iniciativa que oferece auditorias eléctricas gratuitas a clientes residenciais e apoio técnico para a transição para equipamentos de maior eficiência.</p><p>O programa, financiado através do Fundo de Energia (FUNAE) e da EVN, visa reduzir o consumo médio por fogo em 22% até 2028, o que equivale a poupar mais de 180 GWh anuais a nível nacional.</p><h2>Como aderir</h2><p>Os clientes podem solicitar uma auditoria gratuita através do portal EVN, da linha verde 1455 ou em qualquer balcão de atendimento. A auditoria, realizada por técnicos certificados, identifica os equipamentos de maior consumo e recomenda substituições com cálculo do retorno do investimento.</p><h2>Apoio à substituição de equipamentos</h2><p>Para equipamentos de aquecimento de água, frigoríficos e ar condicionado com classificação energética abaixo de D, a EVN oferece financiamento a taxa zero em parceria com quatro bancos comerciais moçambicanos. Os clientes que aderirem ao programa recebem ainda uma tarifa reduzida nas horas de menor consumo (22h-06h).</p>`,
        imgUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80",
        status: "PUBLISHED",
        publishAt: null,
      },
      {
        tag: "Cooperação",
        title: "EVN e FUNAE Assinam Protocolo para Eletrificação de 200 Escolas e Centros de Saúde",
        shortDesc: "O acordo garante energia limpa e estável a infraestruturas essenciais em zonas remotas onde a extensão da rede convencional não é economicamente viável.",
        fullText: `<h2>Parceria estratégica para infraestruturas essenciais</h2><p>A EVN e o Fundo de Energia (FUNAE) assinaram um protocolo de cooperação que prevê a eletrificação de 200 escolas primárias e 85 centros de saúde em zonas rurais remotas até 2027, utilizando sistemas de energia solar fotovoltaica com armazenamento em baterias.</p><p>O acordo, assinado na presença do Ministro dos Recursos Minerais e Energia, prevê um investimento conjunto de 890 milhões de meticais e deverá beneficiar directamente mais de 180 mil alunos e 420 mil utentes dos centros de saúde.</p><h2>Tecnologia adoptada</h2><p>Cada infraestrutura receberá um sistema solar dimensionado especificamente para as suas necessidades, com painéis fotovoltaicos, baterias de lítio-ferro-fosfato com autonomia de 48 horas e sistemas de gestão inteligente que transmitem dados de produção e consumo em tempo real para o centro de controlo da FUNAE em Maputo.</p><h2>Cronograma de implementação</h2><p>As primeiras 50 escolas e 20 centros de saúde nas províncias de Cabo Delgado e Niassa serão electrificadas até ao fim do terceiro trimestre de 2026. A implementação total estará concluída em Dezembro de 2027.</p>`,
        imgUrl: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&q=80",
        status: "PUBLISHED",
        publishAt: null,
      },
      {
        tag: "Tecnologia",
        title: "Centro de Despacho Nacional da EVN Modernizado com Sistema SCADA de Nova Geração",
        shortDesc: "O novo sistema permite monitorizar e controlar em tempo real toda a rede de transmissão nacional, reduzindo o tempo de resposta a avarias de 45 para 8 minutos.",
        fullText: `<h2>Modernização do coração operacional da rede eléctrica</h2><p>O Centro de Despacho Nacional (CDN) da EVN, em Maputo, foi equipado com um sistema SCADA (Supervisory Control and Data Acquisition) de nova geração que transforma radicalmente a capacidade de monitorização e controlo da rede eléctrica nacional.</p><p>O investimento de 23 milhões de dólares, financiado pelo Banco Mundial, inclui hardware de última geração, software proprietário desenvolvido especificamente para as características da rede moçambicana e formação de 45 engenheiros e técnicos da EVN.</p><h2>Capacidades do novo sistema</h2><p>O SCADA modernizado monitoriza em tempo real mais de 12.000 pontos de medição distribuídos por toda a rede de transmissão e distribuição nacional. O sistema incorpora inteligência artificial para previsão de falhas com 72 horas de antecedência, baseada em análise de padrões históricos, dados meteorológicos e estado dos equipamentos.</p><h2>Redução do tempo de resposta</h2><p>O impacto mais imediato é a redução do tempo médio de resposta a avarias, que caiu de 45 minutos para 8 minutos graças à localização automática de falhas e ao telecomando de disjuntores. Nos primeiros três meses de operação, o número de clientes afectados por interrupções não programadas reduziu 34%.</p>`,
        imgUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
        status: "PUBLISHED",
        publishAt: null,
      },
      {
        tag: "Tarifas",
        title: "EVN Anuncia Nova Estrutura Tarifária com Tarifa Social Reforçada para Baixo Consumo",
        shortDesc: "A revisão tarifária protege os consumidores de menor rendimento com uma tarifa social alargada e introduz incentivos para deslocação de consumo para horas de vazio.",
        fullText: `<h2>Nova estrutura tarifária promove equidade e eficiência</h2><p>A Autoridade Regulatória de Energia (ARENE) aprovou a nova estrutura tarifária da EVN, que entra em vigor no próximo trimestre e representa uma revisão profunda do modelo de preços vigente desde 2019.</p><p>A principal inovação é a ampliação da Tarifa Social, que passa a cobrir todos os clientes residenciais com consumo mensal até 150 kWh (anteriormente o limite era 100 kWh). Esta medida protege directamente 1,2 milhões de famílias moçambicanas de baixo rendimento.</p><h2>Tarifa bi-horária voluntária</h2><p>Os clientes com contadores electrónicos — actualmente 680 mil em todo o país — podem aderir voluntariamente à nova tarifa bi-horária, que oferece um desconto de 38% nas horas de vazio (22h-06h) em troca de uma tarifa ligeiramente mais elevada nas horas de ponta (18h-22h). A EVN estima que famílias que aderirem possam poupar até 840 meticais por mês.</p><h2>Ajuste para uso industrial</h2><p>Para o segmento industrial em Alta Tensão, a nova estrutura introduz um mecanismo de resposta à procura que permite às empresas negociar directamente com a EVN contratos de fornecimento flexíveis com preços diferenciados por período e nível de interruptibilidade aceite.</p>`,
        imgUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
        status: "PUBLISHED",
        publishAt: null,
      },
    ],
  });

  console.log("Seeded 6 professional news articles.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
