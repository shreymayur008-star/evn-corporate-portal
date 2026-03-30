"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { 
  PhoneCall, Search, Menu, Zap, MessageSquare, FileText, 
  CreditCard, ChevronRight, MapPin, Loader2, CheckCircle2, ShieldAlert, X, User, 
  Mail, Smartphone, AlertCircle, Briefcase, Building, Calendar, FileSearch, 
  HardHat, Download, Send, Lock, Power, Activity, BarChart3, Calculator, KeyRound, ArrowLeft
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type ModalType = "NONE" | "AVARIA" | "CREDELEC" | "LOGIN" | "NEWS" | "CONTACT" | "CONCURSOS" | "EMPRESA" | "NOVA_LIGACAO" | "CORTES" | "CONTRATOS" | "PROJECTOS" | "SERVICOS" | "SEARCH" | "DASHBOARD" | "SIMULADOR";

// --- MOCK DATA ---
const NEWS_DATA = [
  { id: 1, tag: "Destaque", title: "Administração da EVN visita províncias para monitorar reposição do sistema eléctrico.", shortDesc: "A EVN está no terreno para garantir a estabilidade da rede após os recentes eventos climáticos.", fullText: "Maputo — Em resposta aos recentes eventos climáticos severos, o Conselho de Administração da Eletricidade Vantara Nacional (EVN) iniciou uma visita de campo intensiva. A prioridade máxima da EVN é restabelecer o fornecimento seguro de energia às comunidades afetadas e avaliar os danos nas infraestruturas críticas de transmissão.", img: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80" },
  { id: 2, tag: "Infraestrutura", title: "EVN necessita de 604 milhões de meticais para compensar danos das cheias.", shortDesc: "Os fundos serão destinados à reconstrução urgente de subestações e linhas de média tensão.", fullText: "A Eletricidade Vantara Nacional (EVN) anunciou hoje que será necessário um fundo de contingência de 604 milhões de meticais para reparar os danos causados pelas recentes inundações. Os fundos serão alocados imediatamente para a substituição de postes caídos e modernização das subestações.", img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80" },
  { id: 3, tag: "Cooperação", title: "EVN estreita laços com parceiros internacionais para o desenvolvimento Nacional.", shortDesc: "Novos acordos visam a expansão acelerada da rede elétrica para zonas rurais e industriais.", fullText: "Num esforço contínuo para alcançar a eletrificação universal, a Eletricidade Vantara Nacional (EVN) assinou três novos memorandos de entendimento com parceiros globais focando em energias renováveis e modernização da rede.", img: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400&q=80" }
];

const SERVICOS_LIST = [
  { id: "mod-01", title: "Formulário de Mudança de Titularidade", size: "1.2 MB", desc: "Acompanhar com cópia de BI e título de propriedade." },
  { id: "req-vis", title: "Requerimento para Pedido de Vistoria", size: "850 KB", desc: "Obrigatório para aumento de potência elétrica." },
  { id: "term-resp", title: "Termo de Responsabilidade Técnica", size: "2.1 MB", desc: "Exclusivo para eletricistas credenciados." }
];

const CONSUMPTION_DATA = [
  { month: 'Jan', kwh: 340, cost: 2380 }, { month: 'Fev', kwh: 410, cost: 2870 },
  { month: 'Mar', kwh: 380, cost: 2660 }, { month: 'Abr', kwh: 290, cost: 2030 },
  { month: 'Mai', kwh: 250, cost: 1750 }, { month: 'Jun', kwh: 270, cost: 1890 },
];

export default function EVNCorporatePortal() {
  // --- GLOBAL UI STATE ---
  const [activeModal, setActiveModal] = useState<ModalType>("NONE");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadState, setDownloadState] = useState({ show: false, filename: "", docType: "", progress: 0 });
  const [selectedNewsId, setSelectedNewsId] = useState(1);

  // --- FEATURE STATES ---
  const [credelecStep, setCredelecStep] = useState<"INPUT" | "PROCESSING" | "SUCCESS">("INPUT");
  const [credelecData, setCredelecData] = useState({ meter: "", amount: "" });
  const [token, setToken] = useState("");

  const [avariaData, setAvariaData] = useState({ type: "Poste Caído", lat: 0, lng: 0, desc: "" });
  const [isCapturing, setIsCapturing] = useState(false);

  // --- AUTH STATES ---
  const [loginStep, setLoginStep] = useState<"LOGIN" | "FORGOT" | "RECOVERY_SENT">("LOGIN");
  const [loginData, setLoginData] = useState({ contact: "", password: "" });
  const [forgotData, setForgotData] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [ligacaoStep, setLigacaoStep] = useState(1);
  const [ligacaoData, setLigacaoData] = useState({ nome: "", nuit: "", telefone: "", endereco: "" });

  const [contratoSearch, setContratoSearch] = useState("");
  const [contratoResult, setContratoResult] = useState<boolean>(false);
  const [isSearchingContrato, setIsSearchingContrato] = useState(false);

  const [contactForm, setContactForm] = useState({ nome: "", email: "", mensagem: "" });
  const [concursoSelected, setConcursoSelected] = useState(1);
  const [simulador, setSimulador] = useState({ ac: 4, fridge: 24, tv: 5, lights: 6 });

  // --- GENERAL HANDLERS ---
  const openNewsArticle = (id: number) => {
    setSelectedNewsId(id);
    setActiveModal("NEWS");
  };

  const closeModal = () => {
    setActiveModal("NONE");
    setErrors({});
    setSearchQuery("");
    setCredelecStep("INPUT");
    setLigacaoStep(1);
    setContratoResult(false);
    setContratoSearch("");
    setLoginStep("LOGIN");
  };

  // --- THE SEARCH ALGORITHM ---
  const SEARCH_INDEX = useMemo(() => {
    const base = [
      { title: "Comprar Recarga Credelec", type: "Serviço", action: () => setActiveModal("CREDELEC") },
      { title: "Reportar Avaria / Piquete", type: "Emergência", action: () => setActiveModal("AVARIA") },
      { title: "Pedido de Nova Ligação", type: "Serviço", action: () => setActiveModal("NOVA_LIGACAO") },
      { title: "Vagas, Concursos e Recrutamento", type: "Carreiras", action: () => setActiveModal("CONCURSOS") },
      { title: "Consultar Faturas e Contratos", type: "Cliente", action: () => setActiveModal("CONTRATOS") },
      { title: "Projectos Estruturantes EVN", type: "Institucional", action: () => setActiveModal("PROJECTOS") },
      { title: "Apoio ao Cliente (Telefone, Email)", type: "Contacto", action: () => setActiveModal("CONTACT") },
      { title: "Catálogo de Serviços e Formulários", type: "Documentos", action: () => setActiveModal("SERVICOS") },
      { title: "Missão, Visão e Valores", type: "A Empresa", action: () => setActiveModal("EMPRESA") },
      { title: "Avisos Nacionais e Cortes", type: "Avisos", action: () => setActiveModal("CORTES") },
      { title: "Simulador de Consumo de Energia", type: "Serviço", action: () => setActiveModal("SIMULADOR") },
    ];
    const news = NEWS_DATA.map(n => ({ title: n.title, type: "Notícia", action: () => openNewsArticle(n.id) }));
    return [...base, ...news];
  }, []);

  const filteredSearchResults = useMemo(() => {
    if (!searchQuery) return SEARCH_INDEX;
    const lowerQuery = searchQuery.toLowerCase();
    return SEARCH_INDEX.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) || item.type.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, SEARCH_INDEX]);

  // --- THE MULTI-PAGE RICH PDF GENERATOR ---
  const triggerDownload = (filename: string, docType: "FATURA" | "EDITAL" | "FORMULARIO") => {
    if (downloadState.show) return; 
    setDownloadState({ show: true, filename, docType, progress: 0 });
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 20) + 10;
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setDownloadState({ show: true, filename, docType, progress: 100 });
        
        setTimeout(() => {
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            let multiPageContent = "";

            if (docType === "FATURA") {
              multiPageContent = `
                <div class="page">
                  <div class="header"><div class="logo">⚡ EVN<span>.</span></div><div class="header-text"><strong>Eletricidade Vantara Nacional, E.P.</strong><br/>Direção Comercial<br/>Maputo, Moçambique</div></div>
                  <h1 class="title">Fatura de Energia Elétrica</h1>
                  <div class="meta">Data de Emissão: ${new Date().toLocaleDateString()} &nbsp;|&nbsp; Fatura Nº: FT-${Math.floor(10000 + Math.random()*90000)} &nbsp;|&nbsp; Ficheiro: ${filename}</div>
                  <div class="content">
                    <h3>Resumo da Fatura</h3>
                    <p>Estimado Cliente, segue abaixo o detalhe do seu consumo referente ao período homologado.</p>
                    <table class="data-table">
                      <tr class="table-header"><th>Descrição</th><th>Valor (MZN)</th></tr>
                      <tr><td>Energia Ativa (Consumo Real)</td><td>1,750.00</td></tr>
                      <tr><td>Taxa de Rádio e TV</td><td>100.00</td></tr>
                      <tr><td>Taxa Fixa EVN</td><td>150.00</td></tr>
                      <tr class="table-total"><td>Total a Pagar</td><td>2,000.00 MZN</td></tr>
                    </table>
                    <p style="margin-top:30px; font-weight:bold; color:#ef4444; font-size:18px;">Data Limite de Pagamento: Dia 15 do mês corrente.</p>
                  </div>
                </div>
                <div class="page page-break">
                  <div class="header"><div class="logo">⚡ EVN<span>.</span></div><div class="header-text">Anexo I - Fatura Nº: FT-${Math.floor(10000 + Math.random()*90000)}</div></div>
                  <div class="content">
                    <h3>Detalhamento do Consumo Diário</h3>
                    <p>Este gráfico tabular representa as leituras do seu contador inteligente durante os últimos 30 dias de faturação.</p>
                    <table class="data-table" style="font-size:12px;">
                      <tr class="table-header"><th>Semana</th><th>Leitura Inicial (kWh)</th><th>Leitura Final (kWh)</th><th>Consumo (kWh)</th></tr>
                      <tr><td>Semana 1</td><td>15040</td><td>15100</td><td>60</td></tr>
                      <tr><td>Semana 2</td><td>15100</td><td>15180</td><td>80</td></tr>
                      <tr><td>Semana 3</td><td>15180</td><td>15230</td><td>50</td></tr>
                      <tr><td>Semana 4</td><td>15230</td><td>15290</td><td>60</td></tr>
                      <tr class="table-total"><td>Total Mensal</td><td>--</td><td>--</td><td>250 kWh</td></tr>
                    </table>
                    <p style="margin-top:20px;">Tarifa Aplicada: Doméstica Simples (Escalão 2) - 7.00 MZN / kWh.</p>
                  </div>
                </div>
                <div class="page page-break">
                  <div class="header"><div class="logo">⚡ EVN<span>.</span></div><div class="header-text">Anexo II - Fatura Nº: FT-${Math.floor(10000 + Math.random()*90000)}</div></div>
                  <div class="content">
                    <h3>Instruções de Pagamento</h3>
                    <p>Para sua comodidade, a EVN disponibiliza múltiplos canais de pagamento digitais e físicos.</p>
                    <h4>Pagamento via M-Pesa:</h4>
                    <ol>
                      <li>Marque *150# no seu telemóvel.</li>
                      <li>Selecione a opção 6 (Pagamentos).</li>
                      <li>Selecione a opção 1 (Credelec / EVN).</li>
                      <li>Introduza a Entidade: <strong>900900</strong> e a Referência: <strong>${Math.floor(100000000 + Math.random()*900000000)}</strong>.</li>
                      <li>Insira o valor exato da fatura (2,000.00 MZN).</li>
                    </ol>
                    <h4>Pagamento via Transferência Bancária (Millennium BIM / BCI):</h4>
                    <p>NIB: 0001 0000 0000 1234 5678 9</p>
                    <p>Indique o número da Fatura no descritivo da transferência.</p>
                  </div>
                </div>
                <div class="page page-break">
                  <div class="header"><div class="logo">⚡ EVN<span>.</span></div><div class="header-text">Anexo III - Fatura Nº: FT-${Math.floor(10000 + Math.random()*90000)}</div></div>
                  <div class="content">
                    <h3>Dicas de Eficiência Energética</h3>
                    <p>A EVN compromete-se com a sustentabilidade. Reduza a sua fatura e a sua pegada de carbono seguindo estes passos:</p>
                    <ul>
                      <li>Desligue aparelhos no botão: O modo "Standby" (luz vermelha) continua a consumir até 10% da energia total.</li>
                      <li>Utilize lâmpadas LED: Consomem até 80% menos energia e duram 25 vezes mais que as lâmpadas incandescentes.</li>
                      <li>Regule o Ar Condicionado: Mantenha a temperatura entre 23ºC e 24ºC. Cada grau a menos aumenta o consumo em cerca de 7%.</li>
                      <li>Manutenção do Frigorífico: Evite abrir a porta frequentemente e garanta que as borrachas de vedação estão intactas.</li>
                    </ul>
                    <div style="margin-top:40px; padding:20px; background:#f1f5f9; border-radius:8px; text-align:center;">
                      <strong>Linha de Apoio ao Cliente: 1455</strong><br/>Disponível 24/7 para esclarecimentos sobre a sua fatura.
                    </div>
                  </div>
                </div>
              `;
            } else if (docType === "EDITAL") {
              multiPageContent = `
                <div class="page">
                  <div class="header"><div class="logo">⚡ EVN<span>.</span></div><div class="header-text">Direção de Recursos Humanos<br/>Maputo, Moçambique</div></div>
                  <h1 class="title">Edital de Recrutamento Oficial</h1>
                  <div class="meta">Data de Emissão: ${new Date().toLocaleDateString()} &nbsp;|&nbsp; Referência: ${filename.replace('.pdf','')}</div>
                  <div class="content" style="text-align:center; padding: 100px 20px;">
                    <h2 style="font-size:32px; color:#f97316; margin-bottom:20px;">Concurso Público para Contratação</h2>
                    <p style="font-size:18px; color:#334155; max-width:600px; margin:0 auto;">A Eletricidade Vantara Nacional (EVN), E.P., no âmbito do seu plano estratégico de modernização e expansão da rede elétrica nacional, anuncia a abertura de concurso para preenchimento de vaga.</p>
                  </div>
                </div>
                <div class="page page-break">
                  <div class="header"><div class="logo">⚡ EVN<span>.</span></div><div class="header-text">Edital: ${filename.replace('.pdf','')} - Página 2</div></div>
                  <div class="content">
                    <h3>1. Descrição e Responsabilidades da Função</h3>
                    <p>O candidato selecionado integrará o quadro de pessoal efetivo da EVN e terá as seguintes responsabilidades principais:</p>
                    <ul>
                      <li>Supervisionar e executar a manutenção preventiva e corretiva de infraestruturas de alta e média tensão.</li>
                      <li>Garantir o cumprimento rigoroso das normas de Higiene, Saúde e Segurança no Trabalho (HSST).</li>
                      <li>Elaborar relatórios técnicos diários e analisar métricas de falhas no sistema SCADA.</li>
                      <li>Liderar equipas técnicas de intervenção rápida no terreno durante situações de emergência (Avarias).</li>
                      <li>Participar no planeamento estratégico de expansão de novas subestações.</li>
                    </ul>
                    <h3 style="margin-top:30px;">2. Requisitos e Qualificações</h3>
                    <ul>
                      <li>Licenciatura pré-Bolonha ou Mestrado Integrado em Engenharia Eletrotécnica ou área equivalente.</li>
                      <li>Inscrição válida e regularizada na Ordem dos Engenheiros de Moçambique.</li>
                      <li>Mínimo de 5 anos de experiência comprovada em funções similares.</li>
                      <li>Domínio de software de gestão de redes elétricas e AutoCAD.</li>
                      <li>Carta de condução válida e disponibilidade para deslocações a nível nacional.</li>
                    </ul>
                  </div>
                </div>
                <div class="page page-break">
                  <div class="header"><div class="logo">⚡ EVN<span>.</span></div><div class="header-text">Edital: ${filename.replace('.pdf','')} - Página 3</div></div>
                  <div class="content">
                    <h3>3. Condições Contratuais e Benefícios</h3>
                    <p>A EVN oferece um pacote de remuneração altamente competitivo e condições estruturadas para o desenvolvimento de carreira:</p>
                    <ul>
                      <li><strong>Tipo de Contrato:</strong> Contrato de Trabalho por Tempo Indeterminado (Efetivo).</li>
                      <li><strong>Remuneração:</strong> Vencimento base compatível com a grelha salarial para quadros superiores, acrescido de subsídio de risco e isenção de horário de trabalho.</li>
                      <li><strong>Seguro de Saúde:</strong> Cobertura médica completa extensível ao agregado familiar direto.</li>
                      <li><strong>Formação:</strong> Acesso a programas de certificação internacional em Smart Grids e Energias Renováveis.</li>
                      <li><strong>Local de Trabalho:</strong> Sede Operacional em Maputo, com deslocações pontuais.</li>
                    </ul>
                  </div>
                </div>
                <div class="page page-break">
                  <div class="header"><div class="logo">⚡ EVN<span>.</span></div><div class="header-text">Edital: ${filename.replace('.pdf','')} - Página 4</div></div>
                  <div class="content">
                    <h3>4. Processo de Candidatura e Seleção</h3>
                    <p>O processo de seleção obedecerá às seguintes fases eliminatórias:</p>
                    <ol>
                      <li><strong>Triagem Curricular:</strong> Avaliação do Curriculum Vitae e cartas de recomendação (Peso: 20%).</li>
                      <li><strong>Prova de Conhecimentos:</strong> Exame escrito sobre regulamentação do sector elétrico nacional e resolução de problemas práticos (Peso: 40%).</li>
                      <li><strong>Avaliação Psicotécnica:</strong> Testes de raciocínio lógico e gestão de stress.</li>
                      <li><strong>Entrevista Final:</strong> Entrevista presencial com o painel da Direção de Operações e Recursos Humanos (Peso: 40%).</li>
                    </ol>
                    <div style="background:#fef3c7; padding:15px; border-left:4px solid #f59e0b; margin-top:20px;">
                      <strong>Prazos e Submissão:</strong> As candidaturas devem ser submetidas acompanhadas de Carta de Motivação, CV detalhado e cópias autenticadas de certificados, para o email <strong>recrutamento@evn.co.mz</strong>, no prazo máximo de 30 dias corridos a partir da data deste edital.
                    </div>
                  </div>
                </div>
                <div class="page page-break">
                  <div class="header"><div class="logo">⚡ EVN<span>.</span></div><div class="header-text">Edital: ${filename.replace('.pdf','')} - Página 5</div></div>
                  <div class="content">
                    <h3>5. Disposições Finais e Legais</h3>
                    <p>A Eletricidade Vantara Nacional garante a total confidencialidade e proteção dos dados pessoais fornecidos pelos candidatos durante este processo, em conformidade com a legislação de proteção de dados vigente.</p>
                    <p><strong>Política de Igualdade de Oportunidades:</strong> A EVN é um empregador que promove ativamente a igualdade de oportunidades. Não discriminamos com base na raça, género, religião, origem nacional, orientação sexual, idade ou deficiência. Encorajamos fortemente a candidatura de mulheres e jovens talentos a posições técnicas.</p>
                    <div class="signature-box" style="margin-top:100px;">
                      <div class="line" style="width:100%;">A Direção de Recursos Humanos<br/>Eletricidade Vantara Nacional, E.P.</div>
                    </div>
                  </div>
                </div>
              `;
            } else {
              multiPageContent = `
                <div class="page">
                  <div class="header"><div class="logo">⚡ EVN<span>.</span></div><div class="header-text">Direção Comercial<br/>Maputo, Moçambique</div></div>
                  <h1 class="title">Formulário Oficial EVN</h1>
                  <div class="meta">Data de Emissão: ${new Date().toLocaleDateString()} &nbsp;|&nbsp; Formulário: ${filename}</div>
                  <div class="content">
                    <h3>1. Identificação do Requerente (A preencher em LETRA DE FORMA)</h3>
                    <p style="margin-top:25px; border-bottom:1px dashed #94a3b8; padding-bottom:5px;">Nome Completo / Designação Social da Empresa: </p>
                    <p style="margin-top:25px; border-bottom:1px dashed #94a3b8; padding-bottom:5px;">Número Único de Identificação Tributária (NUIT): </p>
                    <p style="margin-top:25px; border-bottom:1px dashed #94a3b8; padding-bottom:5px;">Tipo de Documento (BI/DIRE/Passaporte) e Número: </p>
                    <p style="margin-top:25px; border-bottom:1px dashed #94a3b8; padding-bottom:5px;">Endereço Físico de Instalação (Província, Cidade, Bairro, Quarteirão): </p>
                    <p style="margin-top:25px; border-bottom:1px dashed #94a3b8; padding-bottom:5px;">Contacto Telefónico Principal: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Email: </p>
                    
                    <h3 style="margin-top:40px;">2. Detalhes Técnicos do Pedido</h3>
                    <p style="margin-top:25px; border-bottom:1px dashed #94a3b8; padding-bottom:5px;">Finalidade da Ligação (Doméstica / Comercial / Industrial): </p>
                    <p style="margin-top:25px; border-bottom:1px dashed #94a3b8; padding-bottom:5px;">Potência Requisitada (kVA) e Tipo (Monofásica / Trifásica): </p>
                    <p style="margin-top:25px; border-bottom:1px dashed #94a3b8; padding-bottom:5px;">Número do Contador Atual (Se aplicável): </p>
                  </div>
                </div>
                <div class="page page-break">
                  <div class="header"><div class="logo">⚡ EVN<span>.</span></div><div class="header-text">Formulário: ${filename} - Página 2</div></div>
                  <div class="content">
                    <h3>3. Checklist de Documentação Obrigatória</h3>
                    <p>O presente formulário só será processado se for acompanhado da seguinte documentação válida (marque com um X o que foi anexado):</p>
                    <ul style="list-style-type: none; padding-left:0;">
                      <li style="margin-bottom:15px;">[ &nbsp; ] Cópia Autenticada do Bilhete de Identidade (ou Passaporte/DIRE para cidadãos estrangeiros).</li>
                      <li style="margin-bottom:15px;">[ &nbsp; ] Declaração do NUIT (Número Único de Identificação Tributária).</li>
                      <li style="margin-bottom:15px;">[ &nbsp; ] Documento comprovativo de titularidade do imóvel (Certidão de Registo Predial, Contrato de Promessa de Compra e Venda, ou Declaração do Bairro).</li>
                      <li style="margin-bottom:15px;">[ &nbsp; ] Termo de Responsabilidade Técnica (Apenas obrigatório para novas ligações ou aumento de potência, assinado por eletricista credenciado).</li>
                      <li style="margin-bottom:15px;">[ &nbsp; ] <em>Para Empresas:</em> Cópia da Certidão de Registo Comercial e Alvará.</li>
                    </ul>
                  </div>
                </div>
                <div class="page page-break">
                  <div class="header"><div class="logo">⚡ EVN<span>.</span></div><div class="header-text">Formulário: ${filename} - Página 3</div></div>
                  <div class="content">
                    <h3>4. Termos e Condições do Serviço</h3>
                    <p>Ao assinar o presente documento, o requerente declara ter lido, compreendido e aceite os seguintes termos estabelecidos pela Eletricidade Vantara Nacional:</p>
                    <ol>
                      <li style="margin-bottom:10px;"><strong>Acesso à Propriedade:</strong> O requerente autoriza a livre entrada de técnicos credenciados da EVN nas instalações para efeitos de vistoria, instalação, leitura, manutenção ou corte do serviço.</li>
                      <li style="margin-bottom:10px;"><strong>Responsabilidade da Instalação:</strong> A EVN responsabiliza-se pela rede elétrica apenas até ao ponto de entrega (contador). Toda a infraestrutura interna é da inteira e exclusiva responsabilidade do cliente.</li>
                      <li style="margin-bottom:10px;"><strong>Vandalismo e Fraude:</strong> Qualquer alteração, viciação do contador ou ligação clandestina resultará no corte imediato do fornecimento e respetivo procedimento legal com aplicação de multas pesadas.</li>
                      <li style="margin-bottom:10px;"><strong>Pagamento:</strong> O cliente obriga-se a efetuar o pagamento das faturas (se sistema pós-pago) até à data limite estipulada, sujeitando-se ao corte por mora.</li>
                    </ol>
                  </div>
                </div>
                <div class="page page-break">
                  <div class="header"><div class="logo">⚡ EVN<span>.</span></div><div class="header-text">Formulário: ${filename} - Página 4</div></div>
                  <div class="content">
                    <h3>5. Política de Privacidade e Tratamento de Dados</h3>
                    <p>A Eletricidade Vantara Nacional garante que os dados pessoais recolhidos neste formulário serão processados de forma confidencial e utilizados exclusivamente para efeitos de gestão do contrato de fornecimento de energia elétrica, faturação, prestação de apoio técnico e cumprimento de obrigações legais perante o Estado.</p>
                    <p>Os dados não serão partilhados com entidades terceiras para fins de marketing sem o consentimento prévio e explícito do titular.</p>
                    
                    <div style="background:#f1f5f9; padding:20px; border-radius:8px; margin-top:40px;">
                      <h4 style="margin-top:0;">Declaração do Requerente</h4>
                      <p style="font-size:12px;">Declaro sob compromisso de honra que todas as informações prestadas neste formulário são verdadeiras e que aceito integralmente as condições da EVN.</p>
                      <div class="signature-box">
                        <div class="line">Assinatura do Requerente<br/><span style="font-size:10px;">(Conforme Documento de Identificação)</span></div>
                        <div class="line">Reservado à EVN<br/><span style="font-size:10px;">(Carimbo, Data e Assinatura do Funcionário)</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }

            printWindow.document.write(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>${filename}</title>
                <style>
                  body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 0; margin: 0; background: #fff; }
                  .page { padding: 40px 50px; max-width: 800px; margin: 0 auto; box-sizing: border-box; min-height: 100vh; position: relative; }
                  .page-break { page-break-before: always; border-top: 1px dashed #cbd5e1; }
                  @media print { 
                    .page-break { border-top: none; } 
                    body { background: none; }
                    .page { min-height: auto; padding: 20px; }
                  }
                  .header { border-bottom: 4px solid #f97316; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
                  .logo { color: #f97316; font-size: 32px; font-weight: 900; letter-spacing: -1px; margin: 0; line-height: 1; }
                  .logo span { color: #0f172a; }
                  .header-text { text-align: right; color: #64748b; font-size: 12px; line-height: 1.4; }
                  .title { font-size: 26px; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; font-weight: 900; }
                  .meta { color: #64748b; font-size: 13px; margin-bottom: 30px; font-weight: bold; background: #f8fafc; padding: 10px 15px; border-radius: 6px; border-left: 4px solid #cbd5e1; }
                  .content { padding-bottom: 50px; }
                  .content h3 { color: #f97316; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px; margin-top: 0; }
                  .content h4 { color: #334155; font-size: 16px; margin-bottom: 10px; margin-top: 25px; }
                  .content p { line-height: 1.6; color: #334155; margin-bottom: 15px; font-size: 14px; }
                  .content ul, .content ol { line-height: 1.6; color: #334155; padding-left: 20px; font-size: 14px; }
                  .content li { margin-bottom: 8px; }
                  .data-table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px; font-size: 14px; }
                  .data-table th, .data-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }
                  .data-table th { background: #f8fafc; color: #475569; font-weight: bold; text-transform: uppercase; font-size: 12px; }
                  .table-total { font-weight: bold; font-size: 16px; background: #fff7ed; }
                  .table-total td { color: #f97316; border-top: 2px solid #f97316; border-bottom: none; }
                  .signature-box { margin-top: 60px; display: flex; justify-content: space-between; }
                  .line { border-top: 1px solid #94a3b8; width: 45%; text-align: center; padding-top: 10px; font-size: 14px; color: #64748b; font-weight: bold; }
                </style>
              </head>
              <body>
                ${multiPageContent}
                <script>window.onload = () => { window.print(); }</script>
              </body>
              </html>
            `);
            printWindow.document.close();
          }
          toast.success(`Formato PDF de "${filename}" preparado com sucesso.`);
          setTimeout(() => setDownloadState(prev => ({ ...prev, show: false })), 2000);
        }, 500);
      } else {
        setDownloadState({ show: true, filename, docType, progress: currentProgress });
      }
    }, 400);
  };

  // --- FORM SUBMISSIONS ---
  const handleCredelecPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!/^\d{11}$/.test(credelecData.meter)) newErrors.meter = "O contador deve conter exatamente 11 números.";
    const amountNum = parseInt(credelecData.amount);
    if (isNaN(amountNum) || amountNum < 100) newErrors.amount = "O valor mínimo de recarga é de 100 MZN.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Corrija os erros assinalados a vermelho.");
      return;
    }

    setErrors({});
    setCredelecStep("PROCESSING");
    setTimeout(() => {
      setToken(Array.from({ length: 5 }, () => Math.floor(1000 + Math.random() * 9000)).join("-"));
      setCredelecStep("SUCCESS");
      toast.success("Transação aprovada com sucesso!");
    }, 2500);
  };

  const handleGPSCapture = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setAvariaData(prev => ({ ...prev, lat: -25.9692, lng: 32.5732 }));
      setIsCapturing(false);
      setErrors(prev => ({ ...prev, gps: "" }));
      toast.success("Coordenadas GPS EVN capturadas com precisão!");
    }, 1500);
  };

  const submitAvaria = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!avariaData.lat) newErrors.gps = "A captura de coordenadas GPS é obrigatória.";
    if (avariaData.desc.trim().length < 10) newErrors.desc = "Forneça mais detalhes sobre o incidente (min. 10 caracteres).";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    toast.success("Alerta Vermelho registado! A equipa técnica EVN foi despachada.");
    closeModal();
    setAvariaData({ type: "Poste Caído", lat: 0, lng: 0, desc: "" });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(loginData.contact.length < 5 || loginData.password.length < 6) return setErrors({auth: "Credenciais inválidas."});
    
    setErrors({});
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      setActiveModal("DASHBOARD");
      toast.success("Sessão Iniciada. Bem-vindo à Área de Cliente.");
    }, 1500);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotData);
    const isPhone = /^8[2-7]\d{7}$/.test(forgotData);
    if (!isEmail && !isPhone) {
      setErrors({forgot: "Insira um contacto válido registado no sistema."});
      return;
    }
    setErrors({});
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      setLoginStep("RECOVERY_SENT");
    }, 1500);
  }

  const handleLigacaoNext = () => {
    const newErrors: Record<string, string> = {};
    if (ligacaoStep === 1) {
      if (ligacaoData.nome.trim().length < 5) newErrors.nome = "Insira o nome completo.";
      if (!/^\d{9}$/.test(ligacaoData.nuit)) newErrors.nuit = "NUIT inválido (deve ter 9 dígitos).";
      if (!/^8[2-7]\d{7}$/.test(ligacaoData.telefone)) newErrors.telefone = "Contacto inválido (Ex: 841234567).";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    if (ligacaoStep === 1) setLigacaoStep(2);
    else {
      if (ligacaoData.endereco.length < 10) {
        setErrors({ endereco: "Forneça um endereço detalhado." });
        return;
      }
      toast.success("Pedido de Nova Ligação submetido à EVN com sucesso!");
      closeModal();
      setLigacaoData({ nome: "", nuit: "", telefone: "", endereco: "" });
    }
  };

  const searchContrato = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{9}$/.test(contratoSearch)) {
      setErrors({ search: "NUIT inválido. Introduza 9 dígitos." });
      return;
    }
    setErrors({});
    setIsSearchingContrato(true);
    setTimeout(() => {
      setIsSearchingContrato(false);
      setContratoResult(true);
      toast.success("Contrato EVN localizado na base de dados.");
    }, 1500);
  };

  const submitContactMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.mensagem) return;
    toast.success("Mensagem enviada! A EVN entrará em contacto brevemente.");
    setContactForm({ nome: "", email: "", mensagem: "" });
  };

  // ==========================================
  // RENDER: MAIN PAGE
  // ==========================================
  const activeNewsArticle = NEWS_DATA.find(n => n.id === selectedNewsId) || NEWS_DATA[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans transition-colors duration-300">

      {/* --- TOP NOTIFICATION BAR --- */}
      <div className="bg-slate-100 py-2 px-4 md:px-8 flex justify-between items-center text-xs font-medium text-slate-600 border-b border-slate-200">
        <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-orange-500" /><span>Eletricidade Vantara Nacional: Serviços Digitais Seguros e Verificados</span></div>
        <button onClick={() => setActiveModal("LOGIN")} className="bg-slate-900 text-white px-4 py-1.5 rounded-full hover:bg-slate-800 transition-colors shadow-sm">Acesso Seguro</button>
      </div>

      {/* --- HEADER --- */}
      <header className="bg-white py-4 px-4 md:px-8 lg:px-16 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm relative z-10 border-b border-slate-200">
        <div onClick={() => setActiveModal("CORTES")} className="text-orange-500 font-bold text-xs uppercase tracking-wide cursor-pointer hover:bg-orange-50 px-4 py-2.5 rounded-lg flex items-center gap-2 border border-orange-200 transition-all shadow-sm">
          <Activity className="w-4 h-4 animate-pulse" /> Avisos Nacionais
        </div>
        <div className="flex flex-col items-center cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.scrollTo(0,0)}>
          <div className="w-12 h-12 border-2 border-orange-500 rounded-full flex items-center justify-center mb-1 bg-white shadow-md"><Zap className="w-6 h-6 text-orange-500" /></div>
          <h1 className="text-[10px] font-black text-center uppercase tracking-widest leading-tight">Eletricidade<br/><span className="text-orange-500">Vantara Nacional</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveModal("LOGIN")} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-[0_4px_20px_rgba(249,115,22,0.3)] active:scale-95 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Área de Cliente
          </button>
        </div>
      </header>

      {/* --- NAVIGATION MENU --- */}
      <nav className="bg-slate-900 text-white px-4 md:px-8 lg:px-16 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <ul className="hidden md:flex items-center gap-8 font-medium text-sm">
            <li className="font-bold text-orange-500 cursor-pointer">Início</li>
            <li onClick={() => setActiveModal("EMPRESA")} className="hover:text-orange-400 cursor-pointer transition-colors">A Empresa</li>
            <li onClick={() => openNewsArticle(1)} className="hover:text-orange-400 cursor-pointer transition-colors">Imprensa</li>
            <li onClick={() => setActiveModal("CONCURSOS")} className="hover:text-orange-400 cursor-pointer transition-colors">Recrutamento</li>
            <li onClick={() => setActiveModal("PROJECTOS")} className="hover:text-orange-400 cursor-pointer transition-colors">Projectos</li>
            <li onClick={() => setActiveModal("CONTACT")} className="hover:text-orange-400 cursor-pointer transition-colors">Contactos</li>
          </ul>
          <Menu className="md:hidden w-6 h-6 cursor-pointer text-orange-500" />
          <div onClick={() => setActiveModal("SEARCH")} className="flex items-center gap-2 text-sm font-medium hover:text-orange-400 cursor-pointer bg-slate-800 px-5 py-2.5 rounded-full transition-colors shadow-inner border border-slate-700">
            <Search className="w-4 h-4" /> Procurar no Portal
          </div>
        </div>
      </nav>

      {/* --- HERO --- */}
      <section className="w-full bg-slate-900 flex flex-col md:flex-row h-[400px] overflow-hidden relative">
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-gradient-to-r from-orange-600 to-orange-500 z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">ENERGIA INTELIGENTE PARA MOÇAMBIQUE.</h2>
          <button onClick={() => setActiveModal("AVARIA")} className="bg-white text-orange-600 font-bold py-3 px-8 rounded-full w-max shadow-lg hover:bg-slate-100 transition-colors">Reportar Emergência</button>
        </div>
        <div className="w-full md:w-1/2 h-full relative opacity-80"><img src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=2000&q=80" className="w-full h-full object-cover" alt="EVN" /></div>
      </section>

      {/* --- SERVICES GRID --- */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-black text-center mb-10 text-slate-900">Serviços Digitais Rápidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Activity, label: "Avisos Nacionais", action: "CORTES" },
            { icon: Calculator, label: "Simulador MZN", action: "SIMULADOR" },
            { icon: CreditCard, label: "Comprar Credelec", action: "CREDELEC" },
            { icon: FileText, label: "Catálogo PDF", action: "SERVICOS" },
            { icon: Zap, label: "Nova Ligação", action: "NOVA_LIGACAO" },
            { icon: FileSearch, label: "Meus Contratos", action: "CONTRATOS" },
            { icon: MessageSquare, label: "Apoio Cliente", action: "CONTACT" },
            { icon: Briefcase, label: "Recrutamento", action: "CONCURSOS" },
          ].map((s, i) => (
            <div key={i} onClick={() => setActiveModal(s.action as ModalType)} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:border-orange-500 hover:shadow-lg transition-all cursor-pointer flex flex-col items-center group">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors text-slate-400"><s.icon className="w-8 h-8" /></div>
              <span className="font-bold text-center text-sm">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* --- NEWS SECTION --- */}
      <section className="py-16 bg-white px-4 md:px-8 lg:px-16 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10"><div><h2 className="text-3xl font-black text-slate-900">Notícias EVN</h2><p className="text-slate-500 mt-2">Fique a par das últimas novidades do sector energético.</p></div></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 group cursor-pointer" onClick={() => openNewsArticle(NEWS_DATA[0].id)}>
              <div className="overflow-hidden rounded-3xl mb-4 relative h-[400px] shadow-lg"><img src={NEWS_DATA[0].img} alt="EVN News" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /><div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div><div className="absolute bottom-0 left-0 p-8"><span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">{NEWS_DATA[0].tag}</span><h3 className="text-3xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors leading-tight">{NEWS_DATA[0].title}</h3><p className="text-slate-300 line-clamp-2">{NEWS_DATA[0].shortDesc}</p></div></div>
            </div>
            <div className="flex flex-col gap-6">
              {NEWS_DATA.slice(1).map((news) => (
                <div key={news.id} className="group cursor-pointer flex flex-col gap-3" onClick={() => openNewsArticle(news.id)}><div className="w-full h-40 rounded-2xl overflow-hidden shadow-sm"><img src={news.img} alt="EVN News" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div><div><span className="text-orange-500 text-[10px] font-bold uppercase tracking-wider mb-1 inline-block">{news.tag}</span><h4 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-orange-500 transition-colors">{news.title}</h4></div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          THE ULTIMATE DYNAMIC MODAL ENGINE
      ========================================== */}
      <AnimatePresence>
        {activeModal !== "NONE" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
            
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className={`bg-white text-slate-800 w-full rounded-[2rem] shadow-2xl relative flex flex-col overflow-hidden max-h-[95vh] ${activeModal === "DASHBOARD" || activeModal === "SIMULADOR" ? "max-w-6xl" : "max-w-4xl"}`}>
              
              <button onClick={closeModal} className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full z-50 transition-colors"><X className="w-6 h-6" /></button>

              <div className="overflow-y-auto w-full h-full custom-scrollbar relative">

                {/* --- SECURE DOWNLOAD OVERLAY --- */}
                <AnimatePresence>
                  {downloadState.show && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center">
                      <div className="w-28 h-28 bg-blue-50 border-4 border-blue-100 rounded-full flex items-center justify-center mb-6 relative shadow-inner">
                        {downloadState.progress === 100 ? <CheckCircle2 className="w-12 h-12 text-green-500" /> : <Lock className="w-10 h-10 text-blue-500 animate-pulse" />}
                        {downloadState.progress < 100 && (<svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="transparent" stroke="#e2e8f0" strokeWidth="8" /><circle cx="50" cy="50" r="46" fill="transparent" stroke="#3b82f6" strokeWidth="8" strokeDasharray={`${(downloadState.progress / 100) * 289} 289`} transform="rotate(-90 50 50)" className="transition-all duration-300" /></svg>)}
                      </div>
                      <h3 className="text-3xl font-black text-slate-900 mb-3">{downloadState.progress === 100 ? "Documento PDF Preparado!" : "A Gerar Ficheiro PDF Seguro"}</h3>
                      <p className="text-slate-500 max-w-md font-medium mb-8 text-lg">{downloadState.progress === 100 ? "A abrir o documento oficial para guardar/imprimir..." : "A estabelecer ligação encriptada à base de dados EVN para gerar o documento certificado..."}</p>
                      <div className="bg-slate-100 border border-slate-200 px-8 py-4 rounded-xl max-w-lg w-full truncate shadow-sm"><span className="text-base font-mono text-slate-700 font-bold">{downloadState.filename}.pdf</span></div>
                      {downloadState.progress < 100 && <p className="text-blue-600 font-black text-2xl mt-8">{downloadState.progress}%</p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* --- 1. SMART DASHBOARD (ÁREA DE CLIENTE) --- */}
                {activeModal === "DASHBOARD" && (
                  <div className="flex flex-col h-full bg-slate-50 min-h-[700px]">
                    <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                      <div><h2 className="text-3xl font-black">Dashboard Inteligente</h2><p className="text-orange-400 font-mono mt-1">Contrato NUIT: 192837465 | Status: Activo</p></div>
                      <button onClick={closeModal} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Power className="w-4 h-4"/> Terminar Sessão</button>
                    </div>
                    
                    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                          <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-lg flex items-center gap-2"><BarChart3 className="text-orange-500"/> Consumo Energético Mensal</h3></div>
                          <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={CONSUMPTION_DATA}>
                                <defs><linearGradient id="colorKwh" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient></defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val} kWh`} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="kwh" stroke="#f97316" strokeWidth={3} fill="url(#colorKwh)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><p className="text-slate-500 text-sm font-bold mb-1">Gasto Acumulado (2026)</p><h4 className="text-3xl font-black text-slate-900">13,500 <span className="text-sm text-slate-400">MZN</span></h4></div>
                          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><p className="text-slate-500 text-sm font-bold mb-1">Impacto Ambiental</p><h4 className="text-3xl font-black text-green-600">-12% <span className="text-sm text-slate-400">Emissão CO2</span></h4></div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                          <h3 className="font-bold text-lg mb-6">Medidor Inteligente</h3>
                          <div className="relative w-40 h-40 mx-auto">
                            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90"><circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="10"/><circle cx="50" cy="50" r="45" fill="none" stroke="#16a34a" strokeWidth="10" strokeDasharray="283" strokeDashoffset="100" className="transition-all duration-1000"/></svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-black">1.2</span><span className="text-xs text-slate-400 font-bold">kW Atual</span></div>
                          </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                          <h3 className="font-bold text-lg mb-4 border-b pb-2">Faturas & Documentos</h3>
                          <div className="space-y-3">
                            <button onClick={() => triggerDownload("Fatura_Maio_2026", "FATURA")} className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3 rounded-xl flex justify-between items-center transition-colors"><span className="font-medium text-sm">Fatura Maio 2026</span><Download className="w-4 h-4 text-orange-500"/></button>
                            <button onClick={() => triggerDownload("Fatura_Abril_2026", "FATURA")} className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3 rounded-xl flex justify-between items-center transition-colors"><span className="font-medium text-sm">Fatura Abril 2026</span><Download className="w-4 h-4 text-orange-500"/></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- 2. AVISOS NACIONAIS E CORTES (REPLACED MAP) --- */}
                {activeModal === "CORTES" && (
                  <div className="p-10 bg-slate-50 min-h-[600px]">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600"><Activity className="w-8 h-8" /></div>
                      <div><h2 className="text-3xl font-black text-slate-900">Avisos Oficiais e Cortes</h2><p className="text-slate-500">Boletim atualizado de manutenções na rede elétrica nacional.</p></div>
                    </div>
                    
                    <div className="space-y-6 max-w-3xl">
                      {/* Critical Warning */}
                      <div className="bg-white border-2 border-red-200 p-6 rounded-2xl relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-black text-red-900 text-xl">Zona Sul - Rede Principal</h4>
                          <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Urgente</span>
                        </div>
                        <p className="text-slate-700 mb-4 leading-relaxed">Interrupção programada devido a manutenção corretiva inadiável na Subestação N.º 2 para garantir a resiliência da rede durante a época de chuvas. Bairros afetados: Central, Polana e Alto Maé.</p>
                        <div className="flex gap-4">
                          <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg font-mono text-sm"><strong>Data:</strong> Amanhã, 12 de Abril</div>
                          <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg font-mono text-sm"><strong>Duração:</strong> 08:00h – 14:00h</div>
                        </div>
                      </div>

                      {/* Scheduled Maintenance */}
                      <div className="bg-white border-2 border-yellow-200 p-6 rounded-2xl relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400"></div>
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-black text-yellow-900 text-xl">Matola - Corredor Industrial</h4>
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase">Agendado</span>
                        </div>
                        <p className="text-slate-700 mb-4 leading-relaxed">Expansão da rede de média tensão e substituição de postes de madeira por betão armado. A intervenção visa aumentar a capacidade de fornecimento às novas zonas habitacionais.</p>
                        <div className="flex gap-4">
                          <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg font-mono text-sm"><strong>Data:</strong> Sábado, 15 de Abril</div>
                          <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg font-mono text-sm"><strong>Duração:</strong> 09:00h – 15:00h</div>
                        </div>
                      </div>
                      
                      {/* Notice */}
                      <div className="bg-white border-2 border-slate-200 p-6 rounded-2xl relative overflow-hidden shadow-sm opacity-70 hover:opacity-100 transition-opacity">
                        <div className="absolute top-0 left-0 w-2 h-full bg-slate-400"></div>
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-black text-slate-800 text-xl">Província de Gaza - Chókwè</h4>
                          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase">Concluído</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">Os trabalhos de reposição dos ramais afetados pelas intempéries foram concluídos com sucesso. A rede opera a 100% da capacidade comercial.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- 3. SIMULADOR DE CONSUMO --- */}
                {activeModal === "SIMULADOR" && (
                  <div className="p-10 flex flex-col md:flex-row gap-10">
                    <div className="md:w-1/2">
                      <div className="flex items-center gap-4 mb-8"><div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600"><Calculator className="w-8 h-8"/></div><div><h2 className="text-3xl font-black">Simulador de Consumo</h2><p className="text-slate-500">Estime a sua fatura mensal (MZN).</p></div></div>
                      
                      <div className="space-y-6">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                          <div className="flex justify-between mb-2"><label className="font-bold text-sm">Ar Condicionado (1500W)</label><span className="font-mono text-orange-500 font-bold">{simulador.ac}h / dia</span></div>
                          <input type="range" min="0" max="24" value={simulador.ac} onChange={e=>setSimulador({...simulador, ac: parseInt(e.target.value)})} className="w-full accent-orange-500" />
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                          <div className="flex justify-between mb-2"><label className="font-bold text-sm">Frigorífico (200W)</label><span className="font-mono text-orange-500 font-bold">{simulador.fridge}h / dia</span></div>
                          <input type="range" min="0" max="24" value={simulador.fridge} onChange={e=>setSimulador({...simulador, fridge: parseInt(e.target.value)})} className="w-full accent-orange-500" />
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                          <div className="flex justify-between mb-2"><label className="font-bold text-sm">Televisão (100W)</label><span className="font-mono text-orange-500 font-bold">{simulador.tv}h / dia</span></div>
                          <input type="range" min="0" max="24" value={simulador.tv} onChange={e=>setSimulador({...simulador, tv: parseInt(e.target.value)})} className="w-full accent-orange-500" />
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                          <div className="flex justify-between mb-2"><label className="font-bold text-sm">Iluminação (60W x5)</label><span className="font-mono text-orange-500 font-bold">{simulador.lights}h / dia</span></div>
                          <input type="range" min="0" max="24" value={simulador.lights} onChange={e=>setSimulador({...simulador, lights: parseInt(e.target.value)})} className="w-full accent-orange-500" />
                        </div>
                      </div>
                    </div>
                    <div className="md:w-1/2 bg-slate-900 rounded-3xl p-10 text-white flex flex-col justify-center shadow-inner">
                      <h3 className="text-xl font-bold mb-8 text-center text-slate-400 uppercase tracking-widest">Estimativa Mensal (30 dias)</h3>
                      {(() => {
                        const totalKwhDay = ((simulador.ac * 1500) + (simulador.fridge * 200) + (simulador.tv * 100) + (simulador.lights * 300)) / 1000;
                        const totalKwhMonth = totalKwhDay * 30;
                        const costMzn = totalKwhMonth * 7.5;
                        return (
                          <>
                            <div className="text-center mb-8"><span className="text-6xl font-black text-orange-500">{costMzn.toFixed(2)}</span><span className="text-2xl ml-2">MZN</span></div>
                            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8"><div className="flex justify-between border-b border-slate-700 pb-3 mb-3"><span className="text-slate-400">Consumo Diário</span><span className="font-bold">{totalKwhDay.toFixed(2)} kWh</span></div><div className="flex justify-between"><span className="text-slate-400">Consumo Mensal</span><span className="font-bold text-blue-400">{totalKwhMonth.toFixed(2)} kWh</span></div></div>
                            {costMzn > 3000 && (<div className="bg-red-500/20 border border-red-500/30 p-4 rounded-xl flex gap-3 text-red-200 text-sm"><AlertCircle className="w-5 h-5 shrink-0" /> Dica: Reduzir o uso do AC em 2 horas diárias poupará aproximadamente 675 MZN por mês.</div>)}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}

                {/* --- 4. SEARCH MODAL --- */}
                {activeModal === "SEARCH" && (
                  <div className="flex flex-col h-full min-h-[600px]">
                    <div className="p-10 pb-6 border-b border-slate-100 sticky top-0 bg-white z-10"><div className="flex items-center gap-4"><Search className="w-8 h-8 text-orange-500 shrink-0" /><input type="text" autoFocus placeholder="O que procura na EVN?" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full text-3xl font-black text-slate-900 placeholder:text-slate-300 outline-none" /></div></div>
                    <div className="p-10 bg-slate-50 flex-1">
                      {filteredSearchResults.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{filteredSearchResults.map((result, i) => (<div key={i} onClick={result.action} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-orange-500 hover:shadow-md transition-all cursor-pointer group"><span className="text-orange-500 text-[10px] font-bold uppercase tracking-wider mb-2 block">{result.type}</span><h3 className="font-bold text-slate-900 text-lg group-hover:text-orange-600 transition-colors">{result.title}</h3></div>))}</div>
                      ) : (
                        <div className="text-center py-20"><Search className="w-16 h-16 text-slate-300 mx-auto mb-4" /><h3 className="text-xl font-bold text-slate-500">Nenhum resultado encontrado</h3><p className="text-slate-400 mt-2">Tente usar termos como "Credelec", "Avaria", ou "Contratos".</p></div>
                      )}
                    </div>
                  </div>
                )}

                {/* --- 5. CATÁLOGO DE SERVIÇOS (TAILORED PDF DOWNLOADS) --- */}
                {activeModal === "SERVICOS" && (
                  <div className="p-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600"><FileText className="w-8 h-8" /></div>
                      <div><h2 className="text-3xl font-black text-slate-900">Documentação EVN</h2><p className="text-slate-500">Descarregue os formulários oficiais em formato digital para impressão.</p></div>
                    </div>
                    <div className="space-y-4">
                      {SERVICOS_LIST.map((item) => (
                        <div key={item.id} className="group bg-white border border-slate-200 p-6 rounded-2xl relative overflow-hidden shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-pointer" onClick={() => triggerDownload(item.title, "FORMULARIO")}>
                          <div className="relative z-10 flex items-center justify-between">
                            <div><h4 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">{item.title}</h4><p className="text-sm text-slate-500">{item.desc}</p></div>
                            <div className="flex flex-col items-center ml-4 shrink-0"><div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors bg-slate-50 group-hover:bg-blue-50"><Download className="w-5 h-5 text-slate-400 group-hover:text-blue-600" /></div><span className="text-[10px] font-bold mt-2 text-slate-400">{item.size}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- 6. CREDELEC --- */}
                {activeModal === "CREDELEC" && (
                  <div className="flex flex-col md:flex-row h-full min-h-[500px]">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 md:w-2/5 p-10 text-white flex flex-col justify-center relative overflow-hidden"><div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div><Zap className="w-16 h-16 mb-6 text-orange-100 relative z-10" /><h2 className="text-3xl font-black mb-4 relative z-10">Recarga<br/>Credelec EVN</h2><p className="text-orange-100 text-sm leading-relaxed relative z-10">Integração oficial e segura com M-Pesa, e-Mola, mKesh e bancos nacionais.</p></div>
                    <div className="md:w-3/5 p-10 flex flex-col justify-center bg-white">
                      {credelecStep === "INPUT" && (
                        <form onSubmit={handleCredelecPurchase} className="space-y-6">
                          <div><label className="text-sm font-bold text-slate-900 block mb-2">Número do Contador <span className="text-red-500">*</span></label><input type="text" maxLength={11} placeholder="Introduza os 11 dígitos" className={`w-full bg-slate-50 border-2 ${errors.meter ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-slate-200 focus:border-orange-500'} p-4 rounded-xl font-mono text-lg outline-none transition-colors`} value={credelecData.meter} onChange={e => setCredelecData({...credelecData, meter: e.target.value.replace(/\D/g, '')})} />{errors.meter ? (<p className="text-red-600 text-sm mt-2 flex items-center gap-1 font-medium"><AlertCircle className="w-4 h-4"/> {errors.meter}</p>) : (<p className="text-slate-400 text-xs mt-2">O número encontra-se no seu cartão EVN.</p>)}</div>
                          <div><label className="text-sm font-bold text-slate-900 block mb-2">Valor da Recarga (MZN) <span className="text-red-500">*</span></label><input type="number" placeholder="Ex: 500" className={`w-full bg-slate-50 border-2 ${errors.amount ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-slate-200 focus:border-orange-500'} p-4 rounded-xl font-bold text-lg outline-none transition-colors`} value={credelecData.amount} onChange={e => setCredelecData({...credelecData, amount: e.target.value})} />{errors.amount && <p className="text-red-600 text-sm mt-2 flex items-center gap-1 font-medium"><AlertCircle className="w-4 h-4"/> {errors.amount}</p>}</div>
                          <button type="submit" className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-4 rounded-xl shadow-[0_4px_15px_rgba(22,163,74,0.3)] transition-all text-lg flex items-center justify-center gap-2">Pagar e Gerar Token <ChevronRight className="w-5 h-5" /></button>
                        </form>
                      )}
                      {credelecStep === "PROCESSING" && (<div className="py-16 flex flex-col items-center justify-center text-center"><Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-6" /><h3 className="text-2xl font-bold text-slate-900 mb-2">A processar transação</h3><p className="text-slate-500">Por favor, confirme o pagamento no seu telemóvel...</p></div>)}
                      {credelecStep === "SUCCESS" && (<div className="py-12 text-center"><div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-10 h-10" /></div><h3 className="text-2xl font-bold text-slate-900 mb-2">Recarga Efetuada!</h3><p className="text-slate-500 mb-8">Introduza o código abaixo no seu contador EVN.</p><div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 w-full mb-8 shadow-inner"><p className="font-mono text-4xl font-black text-slate-800 tracking-[0.2em]">{token}</p></div><button onClick={closeModal} className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-xl transition-all">Fechar Janela</button></div>)}
                    </div>
                  </div>
                )}

                {/* --- 7. NOVA LIGAÇÃO --- */}
                {activeModal === "NOVA_LIGACAO" && (
                  <div className="p-10"><div className="flex items-center gap-4 mb-8"><div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500"><Zap className="w-8 h-8" /></div><div><h2 className="text-3xl font-black text-slate-900">Nova Ligação EVN</h2><p className="text-slate-500">Pedido oficial de integração à rede elétrica.</p></div></div><div className="flex items-center gap-2 mb-8"><div className="h-2 flex-1 rounded-full bg-orange-500"></div><div className={`h-2 flex-1 rounded-full transition-colors ${ligacaoStep > 1 ? 'bg-orange-500' : 'bg-slate-200'}`}></div></div><form className="space-y-6">{ligacaoStep === 1 && (<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6"><h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Passo 1: Dados do Titular</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="text-sm font-bold text-slate-700 block mb-2">Nome Completo</label><input type="text" className={`w-full bg-slate-50 border-2 ${errors.nome ? 'border-red-500' : 'border-slate-200 focus:border-orange-500'} p-4 rounded-xl outline-none transition-colors`} value={ligacaoData.nome} onChange={e => setLigacaoData({...ligacaoData, nome: e.target.value})} placeholder="Como consta no BI" />{errors.nome && <p className="text-red-500 text-xs mt-1 font-medium">{errors.nome}</p>}</div><div><label className="text-sm font-bold text-slate-700 block mb-2">NUIT (9 Dígitos)</label><input type="text" maxLength={9} className={`w-full bg-slate-50 border-2 ${errors.nuit ? 'border-red-500' : 'border-slate-200 focus:border-orange-500'} p-4 rounded-xl font-mono outline-none transition-colors`} value={ligacaoData.nuit} onChange={e => setLigacaoData({...ligacaoData, nuit: e.target.value.replace(/\D/g, '')})} placeholder="Ex: 123456789" />{errors.nuit && <p className="text-red-500 text-xs mt-1 font-medium">{errors.nuit}</p>}</div></div><div><label className="text-sm font-bold text-slate-700 block mb-2">Telemóvel</label><input type="tel" className={`w-full bg-slate-50 border-2 ${errors.telefone ? 'border-red-500' : 'border-slate-200 focus:border-orange-500'} p-4 rounded-xl outline-none transition-colors`} value={ligacaoData.telefone} onChange={e => setLigacaoData({...ligacaoData, telefone: e.target.value.replace(/\D/g, '')})} placeholder="Ex: 840000000" />{errors.telefone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.telefone}</p>}</div></motion.div>)}{ligacaoStep === 2 && (<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6"><h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Passo 2: Localização da Obra</h3><div><label className="text-sm font-bold text-slate-700 block mb-2">Endereço Completo</label><textarea rows={4} className={`w-full bg-slate-50 border-2 ${errors.endereco ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-orange-500'} p-4 rounded-xl outline-none resize-none transition-colors`} value={ligacaoData.endereco} onChange={e => setLigacaoData({...ligacaoData, endereco: e.target.value})} placeholder="Descreva a província, cidade, bairro, etc." />{errors.endereco && <p className="text-red-500 text-xs mt-1 font-medium">{errors.endereco}</p>}</div></motion.div>)}<div className="flex gap-4 pt-4">{ligacaoStep === 2 && (<button type="button" onClick={() => setLigacaoStep(1)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 px-8 rounded-xl transition-all">Voltar</button>)}<button type="button" onClick={handleLigacaoNext} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/20">{ligacaoStep === 1 ? "Continuar" : "Submeter Pedido EVN"}</button></div></form></div>
                )}

                {/* --- 8. CONCURSOS --- */}
                {activeModal === "CONCURSOS" && (
                  <div className="flex flex-col md:flex-row h-full min-h-[600px]">
                    <div className="md:w-1/3 bg-slate-50 border-r border-slate-200 flex flex-col h-full"><div className="p-8 bg-slate-900 text-white"><h2 className="text-2xl font-black mb-2">Vagas EVN</h2><p className="text-slate-400 text-sm">Junte-se à equipa que eletrifica a nação.</p></div><div className="flex-1 overflow-y-auto p-4 space-y-3"><div onClick={() => setConcursoSelected(1)} className={`p-4 rounded-xl border cursor-pointer transition-all ${concursoSelected === 1 ? 'bg-white border-orange-500 shadow-md ring-1 ring-orange-500' : 'bg-white border-slate-200 hover:border-orange-300'}`}><div className="flex justify-between items-start mb-2"><h3 className="font-bold text-slate-900 text-sm">Engenheiro Sênior</h3><span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">Aberto</span></div><p className="text-xs text-slate-500">Sede Operacional EVN</p></div><div onClick={() => setConcursoSelected(2)} className={`p-4 rounded-xl border cursor-pointer transition-all ${concursoSelected === 2 ? 'bg-white border-orange-500 shadow-md ring-1 ring-orange-500' : 'bg-white border-slate-200 hover:border-orange-300'}`}><div className="flex justify-between items-start mb-2"><h3 className="font-bold text-slate-900 text-sm">Técnico de Linhas</h3><span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">Aberto</span></div><p className="text-xs text-slate-500">Expansão de Rede Rural</p></div></div></div>
                    <div className="md:w-2/3 p-10 bg-white">
                      {concursoSelected === 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><span className="text-orange-500 font-bold text-sm tracking-widest uppercase mb-2 block">Ref: EVN-ENG-042</span><h2 className="text-3xl font-black text-slate-900 mb-6">Engenheiro Eletrotécnico Sênior</h2><div className="prose prose-slate prose-sm max-w-none mb-8"><h4 className="font-bold text-slate-800 text-base">Descrição da Função</h4><p className="text-slate-600 mb-4">O candidato será responsável por supervisionar a manutenção preventiva e corretiva de subestações de alta tensão.</p><h4 className="font-bold text-slate-800 text-base">Requisitos</h4><ul className="list-disc pl-5 text-slate-600 space-y-1 mb-4"><li>Licenciatura em Engenharia Eletrotécnica.</li><li>Inscrição válida na Ordem dos Engenheiros.</li><li>Mínimo de 5 anos de experiência.</li></ul></div><div className="bg-slate-50 p-6 rounded-2xl border border-slate-200"><h4 className="font-bold text-slate-900 mb-4">Submeter Candidatura</h4><button onClick={() => triggerDownload("EVN-ENG-042", "EDITAL")} className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2"><Download className="w-4 h-4" /> Descarregar Termos de Referência PDF</button></div></motion.div>)}
                      {concursoSelected === 2 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><span className="text-orange-500 font-bold text-sm tracking-widest uppercase mb-2 block">Ref: EVN-TEC-109</span><h2 className="text-3xl font-black text-slate-900 mb-6">Técnico de Linhas (Média Tensão)</h2><p className="text-slate-600 mb-8">Posição focada na expansão rápida e eletrificação rural da rede EVN.</p><button onClick={() => triggerDownload("EVN-TEC-109", "EDITAL")} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2"><Download className="w-4 h-4" /> Descarregar Edital Completo PDF</button></motion.div>)}
                    </div>
                  </div>
                )}

                {/* --- 9. PROJECTOS --- */}
                {activeModal === "PROJECTOS" && (
                  <div className="p-10"><div className="text-center mb-10"><HardHat className="w-16 h-16 text-orange-500 mx-auto mb-4" /><h2 className="text-3xl font-black text-slate-900">Projectos EVN em Curso</h2><p className="text-slate-500 mt-2">A construir o futuro energético do país.</p></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm group"><div className="h-40 overflow-hidden relative"><img src="https://images.unsplash.com/photo-1509391366360-1e97d5259d81?auto=format&fit=crop&w=800&q=80" alt="Solar" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /><div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">Em Execução</div></div><div className="p-6"><h3 className="text-xl font-bold text-slate-900 mb-2">Central Solar Nacional</h3><p className="text-sm text-slate-600 mb-6">Implementação de parque fotovoltaico de 41 MW.</p><div className="mb-2 flex justify-between text-xs font-bold text-slate-700"><span>Progresso da Obra</span><span>75%</span></div><div className="w-full bg-slate-100 rounded-full h-2.5"><div className="bg-green-500 h-2.5 rounded-full" style={{width: '75%'}}></div></div></div></div><div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm group"><div className="h-40 overflow-hidden relative"><img src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80" alt="Transmission" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /><div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">Fase Inicial</div></div><div className="p-6"><h3 className="text-xl font-bold text-slate-900 mb-2">Nova Linha de Transmissão</h3><p className="text-sm text-slate-600 mb-6">Construção de linha de 400kV para escoamento eficiente.</p><div className="mb-2 flex justify-between text-xs font-bold text-slate-700"><span>Progresso da Obra</span><span>15%</span></div><div className="w-full bg-slate-100 rounded-full h-2.5"><div className="bg-orange-500 h-2.5 rounded-full" style={{width: '15%'}}></div></div></div></div></div></div>
                )}

                {/* --- 10. CONTACTOS --- */}
                {activeModal === "CONTACT" && (
                  <div className="flex flex-col md:flex-row h-full min-h-[600px]">
                    <div className="md:w-1/2 p-10 bg-slate-900 text-white flex flex-col justify-center">
                      <PhoneCall className="w-16 h-16 text-orange-500 mb-6" />
                      <h2 className="text-3xl font-black mb-4">Apoio EVN</h2>
                      <p className="text-slate-400 mb-10 leading-relaxed">Centro de atendimento disponível 24/7 para responder a qualquer emergência ou dúvida.</p>
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700"><div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-500"><PhoneCall className="w-6 h-6" /></div><div><p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Linha Verde (Gratuita)</p><p className="text-2xl font-bold">1455</p></div></div>
                        <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700 cursor-pointer hover:border-[#25D366] transition-colors" onClick={() => toast.success("A abrir WhatsApp EVN...")}><div className="w-12 h-12 bg-[#25D366]/20 rounded-full flex items-center justify-center text-[#25D366]"><Smartphone className="w-6 h-6" /></div><div><p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">WhatsApp Oficial</p><p className="text-lg font-bold">+258 82 145 5000</p></div></div>
                        <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700"><div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400"><Mail className="w-6 h-6" /></div><div><p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Email Institucional</p><p className="text-lg font-bold">atendimento@evn.co.mz</p></div></div>
                      </div>
                    </div>
                    <div className="md:w-1/2 p-10 bg-white flex flex-col justify-center">
                      <h3 className="text-2xl font-bold text-slate-900 mb-6">Envie uma Mensagem</h3>
                      <form onSubmit={submitContactMessage} className="space-y-5">
                        <div><label className="text-sm font-bold text-slate-700 block mb-2">Seu Nome</label><input type="text" required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-orange-500 transition-colors" value={contactForm.nome} onChange={e => setContactForm({...contactForm, nome: e.target.value})} /></div>
                        <div><label className="text-sm font-bold text-slate-700 block mb-2">Email ou Contacto</label><input type="text" required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-orange-500 transition-colors" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} /></div>
                        <div><label className="text-sm font-bold text-slate-700 block mb-2">Mensagem Detalhada</label><textarea required rows={4} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-orange-500 transition-colors resize-none" value={contactForm.mensagem} onChange={e => setContactForm({...contactForm, mensagem: e.target.value})} /></div>
                        <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"><Send className="w-5 h-5" /> Enviar para EVN</button>
                      </form>
                    </div>
                  </div>
                )}

                {/* --- 11. CONTRATOS --- */}
                {activeModal === "CONTRATOS" && (
                  <div className="p-10">
                    <div className="text-center mb-10"><div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6"><FileSearch className="w-10 h-10 text-orange-500" /></div><h2 className="text-3xl font-black text-slate-900 mb-2">Gestão de Contratos EVN</h2><p className="text-slate-500">Consulte o estado da sua ligação e titularidade.</p></div>
                    {!contratoResult ? (
                      <form onSubmit={searchContrato} className="max-w-md mx-auto"><label className="text-sm font-bold text-slate-700 block mb-2 text-center">Insira o seu NUIT (9 Dígitos)</label><div className="flex flex-col gap-3"><input type="text" maxLength={9} className={`w-full bg-slate-50 border-2 ${errors.search ? 'border-red-500' : 'border-slate-200 focus:border-orange-500'} p-4 rounded-xl font-mono text-center text-xl outline-none transition-colors`} placeholder="Ex: 123456789" value={contratoSearch} onChange={e => setContratoSearch(e.target.value.replace(/\D/g, ''))} />{errors.search && <p className="text-red-500 text-xs font-bold text-center">{errors.search}</p>}<button type="submit" disabled={isSearchingContrato} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">{isSearchingContrato ? <Loader2 className="w-6 h-6 animate-spin" /> : "Validar Contrato EVN"}</button></div></form>
                    ) : (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-xl"><div className="flex justify-between items-start border-b border-slate-100 pb-6 mb-6"><div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Titular do Contrato</p><h3 className="text-2xl font-black text-slate-900">Cliente Verificado</h3><p className="text-sm text-slate-500 font-mono mt-1">NUIT: {contratoSearch}</p></div><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">Activo na Rede EVN</span></div><div className="grid grid-cols-2 gap-4 mb-8"><div className="bg-slate-50 p-4 rounded-2xl"><p className="text-xs text-slate-500 font-bold mb-1">Tipo de Ligação</p><p className="font-bold text-slate-900">Doméstica - Monofásica</p></div><div className="bg-slate-50 p-4 rounded-2xl"><p className="text-xs text-slate-500 font-bold mb-1">Situação Financeira</p><p className="font-bold text-green-600">Sem dívidas à EVN</p></div></div><button onClick={() => setContratoResult(false)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-4 rounded-xl transition-all">Nova Pesquisa</button></motion.div>
                    )}
                  </div>
                )}

                {/* --- 12. LOGIN / FORGOT PASSWORD FLOW --- */}
                {activeModal === "LOGIN" && (
                  <div className="p-10 text-center max-w-md mx-auto relative h-[500px]">
                    <AnimatePresence mode="wait">
                      {loginStep === "LOGIN" && (
                        <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                          <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6"><User className="w-10 h-10" /></div>
                          <h2 className="text-3xl font-black mb-2">Portal do Cliente EVN</h2><p className="text-slate-500 mb-8">Acesso seguro ao seu Smart Dashboard.</p>
                          <form onSubmit={handleLoginSubmit} className="space-y-5 text-left">
                            <div><label className="text-sm font-bold block mb-2">Contacto ou Email Registado</label><input type="text" className={`w-full bg-slate-50 border-2 ${errors.auth ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-orange-500'} p-4 rounded-xl outline-none transition-colors`} value={loginData.contact} onChange={e => setLoginData({...loginData, contact: e.target.value})} placeholder="Ex: 840000000" /></div>
                            <div><label className="text-sm font-bold block mb-2">Palavra-passe</label><input type="password" className={`w-full bg-slate-50 border-2 ${errors.auth ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-orange-500'} p-4 rounded-xl outline-none transition-colors`} value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} placeholder="••••••••" />{errors.auth && <p className="text-red-500 text-xs mt-1 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.auth}</p>}</div>
                            <div className="text-right"><span onClick={()=>setLoginStep("FORGOT")} className="text-sm font-bold text-orange-500 cursor-pointer hover:underline">Esqueceu a senha?</span></div>
                            <button type="submit" disabled={isLoggingIn} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2">{isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar no Dashboard"}</button>
                          </form>
                        </motion.div>
                      )}
                      {loginStep === "FORGOT" && (
                        <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                           <div className="w-20 h-20 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center mx-auto mb-6"><KeyRound className="w-10 h-10" /></div>
                           <h2 className="text-3xl font-black mb-2">Recuperar Senha</h2><p className="text-slate-500 mb-8">Insira o seu contacto para receber um código de acesso.</p>
                           <form onSubmit={handleForgotSubmit} className="space-y-5 text-left">
                            <div><label className="text-sm font-bold block mb-2">Email ou Telemóvel</label><input type="text" className={`w-full bg-slate-50 border-2 ${errors.forgot ? 'border-red-500' : 'border-slate-200 focus:border-slate-500'} p-4 rounded-xl outline-none transition-colors`} value={forgotData} onChange={e => setForgotData(e.target.value)} placeholder="Ex: 840000000" />{errors.forgot && <p className="text-red-500 text-xs mt-1 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.forgot}</p>}</div>
                            <button type="submit" disabled={isLoggingIn} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2">{isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : "Recuperar Acesso"}</button>
                            <button type="button" onClick={()=>setLoginStep("LOGIN")} className="w-full bg-transparent text-slate-600 font-bold py-3 flex justify-center items-center gap-2 hover:text-slate-900"><ArrowLeft className="w-4 h-4"/> Voltar ao Login</button>
                           </form>
                        </motion.div>
                      )}
                      {loginStep === "RECOVERY_SENT" && (
                        <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full pt-10">
                          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"><CheckCircle2 className="w-12 h-12" /></div>
                          <h2 className="text-2xl font-black mb-2">Instruções Enviadas</h2><p className="text-slate-500 mb-8">Verifique o seu telemóvel ou email para redefinir a palavra-passe.</p>
                          <button onClick={()=>setLoginStep("LOGIN")} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold">Voltar</button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* --- 13. AVARIA --- */}
                {activeModal === "AVARIA" && (
                  <div className="p-10"><div className="flex items-center gap-4 mb-8"><div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600"><ShieldAlert className="w-8 h-8" /></div><div><h2 className="text-3xl font-black text-slate-900">Piquete EVN (Emergência)</h2><p className="text-slate-500">Reporte falhas elétricas graves na sua zona.</p></div></div><form onSubmit={submitAvaria} className="space-y-6"><div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3"><AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5"/><p className="text-sm text-red-800 font-medium">AVISO: Não se aproxime de cabos de alta tensão caídos no solo. Mantenha distância.</p></div><div><label className="text-sm font-bold block mb-2">Coordenadas GPS (Obrigatórias) <span className="text-red-500">*</span></label><div className={`bg-slate-50 border-2 ${errors.gps ? 'border-red-500 bg-red-50' : 'border-slate-200'} rounded-xl p-4 flex justify-between items-center transition-colors`}><div className="flex items-center gap-2 font-bold"><MapPin className={`w-5 h-5 ${avariaData.lat ? "text-green-500" : "text-slate-400"}`} />{avariaData.lat ? <span className="text-green-600">Localização ({avariaData.lat.toFixed(4)}, {avariaData.lng.toFixed(4)})</span> : <span className="text-slate-500">A aguardar sensor do dispositivo...</span>}</div><button type="button" onClick={handleGPSCapture} disabled={isCapturing} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg text-sm font-bold transition-colors">{isCapturing ? "A ler..." : "Capturar"}</button></div>{errors.gps && <p className="text-red-600 text-sm mt-2 font-bold flex items-center gap-1"><AlertCircle className="w-4 h-4"/> {errors.gps}</p>}</div><div><label className="text-sm font-bold block mb-2">Descrição Visual da Avaria <span className="text-red-500">*</span></label><textarea rows={4} className={`w-full bg-slate-50 border-2 ${errors.desc ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-orange-500'} p-4 rounded-xl outline-none resize-none transition-colors`} placeholder="Descreva a ocorrência..." value={avariaData.desc} onChange={e => setAvariaData({...avariaData, desc: e.target.value})} />{errors.desc && <p className="text-red-600 text-sm mt-2 font-bold flex items-center gap-1"><AlertCircle className="w-4 h-4"/> {errors.desc}</p>}</div><button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl text-lg shadow-[0_4px_15px_rgba(220,38,38,0.3)] transition-all">Emitir Alerta à Central EVN</button></form></div>
                )}

                {/* --- 14. NEWS READER --- */}
                {activeModal === "NEWS" && activeNewsArticle && (
                  <div><div className="relative h-72"><img src={activeNewsArticle.img} className="w-full h-full object-cover" alt="Notícia EVN" /><div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div></div><div className="p-10 relative -mt-16 bg-white rounded-t-[2rem]"><span className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">{activeNewsArticle.tag}</span><h2 className="text-3xl font-black mt-4 mb-6 leading-tight">{activeNewsArticle.title}</h2><div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-lg"><p className="mb-6 font-medium text-slate-800">{activeNewsArticle.shortDesc}</p><p className="mb-8 whitespace-pre-line">{activeNewsArticle.fullText}</p></div><button onClick={closeModal} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-4 rounded-xl transition-colors">Fechar Leitura</button></div></div>
                )}
                
                {/* --- 15. EMPRESA --- */}
                {activeModal === "EMPRESA" && (
                  <div className="p-10 text-center"><Building className="w-20 h-20 text-orange-500 mx-auto mb-6" /><h2 className="text-4xl font-black mb-6">A Nossa Missão</h2><p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">A Eletricidade Vantara Nacional (EVN) existe para iluminar o país, impulsionando o desenvolvimento com energia elétrica inteligente, fiável e sustentável.</p><div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto"><div className="bg-slate-50 p-6 rounded-2xl border border-slate-200"><h4 className="font-black text-slate-900 mb-2 text-xl">Visão EVN</h4><p className="text-sm text-slate-600">Ser a rede elétrica de referência tecnológica no continente, com foco absoluto no consumidor.</p></div><div className="bg-slate-50 p-6 rounded-2xl border border-slate-200"><h4 className="font-black text-slate-900 mb-2 text-xl">Valores EVN</h4><ul className="text-sm text-slate-600 list-disc pl-4 space-y-1"><li>Foco inabalável no Cliente</li><li>Transparência Operacional</li><li>Inovação e Smart Grids</li></ul></div></div></div>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}