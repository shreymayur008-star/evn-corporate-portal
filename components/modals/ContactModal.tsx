"use client";

import { useState } from "react";
import { Phone, MessageCircle, Mail, Send, ChevronDown, Copy, X } from "lucide-react";
import toast from "react-hot-toast";

type ContactTopic = "geral" | "fatura" | "avaria" | "nova-ligacao" | "titularidade" | "eficiencia" | "tarifas" | "credelec";

const TOPIC_LABELS: Record<ContactTopic, string> = {
  "geral":         "Informação Geral",
  "fatura":        "Reclamação de Factura",
  "avaria":        "Avaria / Emergência",
  "nova-ligacao":  "Nova Ligação",
  "titularidade":  "Mudança de Titularidade",
  "eficiencia":    "Eficiência Energética",
  "tarifas":       "Tarifas e Contratos",
  "credelec":      "Recarga Credelec",
};

const getEmailTemplate = (topic: ContactTopic, nome: string, mensagem: string): { subject: string; body: string } => {
  const ref = `EVN-${new Date().getFullYear()}-${Math.random().toString(36).slice(2,10).toUpperCase()}`;
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-PT", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });

  const header = (tipo: string) =>
`════════════════════════════════════════════════════════
EVN — ELETRICIDADE VANTARA NACIONAL, E.P.
Portal Digital do Cliente  |  evn.co.mz
════════════════════════════════════════════════════════

TIPO DE PEDIDO : ${tipo}
Referência     : ${ref}
Data           : ${dateStr}
Hora           : ${timeStr}
Canal          : Portal Digital EVN (localhost:3000)

────────────────────────────────────────────────────────
DADOS DO REQUERENTE
────────────────────────────────────────────────────────
Nome Completo  : ${nome || "[ Não fornecido ]"}
`;

  const footer =
`
────────────────────────────────────────────────────────
RESPOSTA E ACOMPANHAMENTO
────────────────────────────────────────────────────────
Prazo de resposta : 24 a 48 horas úteis
Referência a citar em toda a correspondência: ${ref}

Por favor responda para o email do remetente ou ligue:
  • Linha Verde (gratuita, 24h): 1455
  • WhatsApp Oficial: +258 84 518 4783
  • Email institucional: atendimento@evn.co.mz

════════════════════════════════════════════════════════
Eletricidade Vantara Nacional, E.P.
Av. 25 de Setembro, n.º 1218 — Maputo, Moçambique
NUIT: 400 020 350  |  Capital Social: 15.000.000.000 MZN
Regulado pela ARENE — Autoridade Regulatória de Energia
════════════════════════════════════════════════════════
Este email foi gerado automaticamente pelo Portal Digital
EVN. Não responda directamente a esta mensagem — use
sempre a referência ${ref} no assunto da sua resposta.
════════════════════════════════════════════════════════`;

  const templates: Record<ContactTopic, { subject: string; body: string }> = {

    "geral": {
      subject: `[EVN Portal] Pedido de Informação Geral — ${ref}`,
      body:
`${header("PEDIDO DE INFORMAÇÃO GERAL")}
────────────────────────────────────────────────────────
INFORMAÇÕES ADICIONAIS (preencha antes de enviar)
────────────────────────────────────────────────────────
Número de Conta EVN    : [ _________________________ ]
Número de Contador     : [ _________________________ ]
Assunto específico     : [ _________________________ ]
Melhor horário contacto: [ Manhã / Tarde / Indiferente ]

────────────────────────────────────────────────────────
MENSAGEM / PEDIDO
────────────────────────────────────────────────────────
${mensagem || "[ Descreva detalhadamente o seu pedido de informação ]"}
${footer}`,
    },

    "fatura": {
      subject: `[EVN Portal] RECLAMAÇÃO DE FATURAÇÃO — Conta Nº [XXXXX] — ${ref}`,
      body:
`${header("RECLAMAÇÃO FORMAL DE FATURAÇÃO")}
────────────────────────────────────────────────────────
IDENTIFICAÇÃO DO CONTRATO
────────────────────────────────────────────────────────
Número de Conta EVN    : [ _________________________ ]
Número de Contador     : [ ___ ___ ___ ___ ___ ] (11 dígitos)
Morada da Instalação   : [ _________________________ ]
Classe Tarifária actual: [ Doméstico / Comercial / Industrial ]

────────────────────────────────────────────────────────
DETALHES DA FACTURA EM LITÍGIO
────────────────────────────────────────────────────────
Período faturado       : [ Mês _________ / Ano ______ ]
Valor faturado (MZN)   : [ _________________________ ]
Valor estimado correcto: [ _________________________ ]
Diferença reclamada    : [ _________________________ ]
Leitura anterior (kWh) : [ _________________________ ]
Leitura actual (kWh)   : [ _________________________ ]
Consumo faturado (kWh) : [ _________________________ ]
Consumo habitual (kWh) : [ _________________________ ]

────────────────────────────────────────────────────────
MOTIVO DA RECLAMAÇÃO
────────────────────────────────────────────────────────
[ ] Leitura estimada incorrecta
[ ] Consumo muito acima do habitual sem justificação
[ ] Dupla cobrança detectada
[ ] Tarifa errada aplicada
[ ] Contador com suspeita de avaria
[ ] Outro: _________________________________________

────────────────────────────────────────────────────────
DESCRIÇÃO DETALHADA
────────────────────────────────────────────────────────
${mensagem || "[ Descreva a anomalia detectada na factura, incluindo qualquer informação relevante sobre o seu consumo habitual ]"}

────────────────────────────────────────────────────────
DOCUMENTOS A ANEXAR A ESTE EMAIL
────────────────────────────────────────────────────────
[ ] Cópia da factura contestada (PDF ou foto)
[ ] Facturas dos 3 meses anteriores
[ ] Fotografias do contador (leitura actual visível)
[ ] Comprovativos de pagamentos anteriores
${footer}`,
    },

    "avaria": {
      subject: `[EVN Portal] ⚡ AVARIA — Relatório de Ocorrência URGENTE — ${ref}`,
      body:
`${header("RELATÓRIO DE AVARIA / EMERGÊNCIA ELÉCTRICA")}
⚠️  ESTE PEDIDO TEM CARÁCTER URGENTE — RESPOSTA EM 2H  ⚠️

────────────────────────────────────────────────────────
LOCALIZAÇÃO DA OCORRÊNCIA
────────────────────────────────────────────────────────
Endereço exacto        : [ _________________________ ]
Bairro / Zona          : [ _________________________ ]
Cidade / Distrito      : [ _________________________ ]
Província              : [ _________________________ ]
Referência próxima     : [ (mercado, escola, cruzamento) ]
Coordenadas GPS        : [ Lat: _______ / Long: ______ ]

────────────────────────────────────────────────────────
TIPO DE AVARIA
────────────────────────────────────────────────────────
[ ] Poste caído / inclinado perigosamente
[ ] Cabo eléctrico partido (aéreo ou no chão)
[ ] Transformador com avaria / faíscas / incêndio
[ ] Falta de energia (sem aviso prévio)
[ ] Iluminação pública inoperacional
[ ] Oscilação / flutuação de tensão grave
[ ] Outro: _________________________________________

────────────────────────────────────────────────────────
AVALIAÇÃO DE SEGURANÇA
────────────────────────────────────────────────────────
Risco imediato para pessoas: [ SIM / NÃO ]
Trânsito afectado          : [ SIM / NÃO ]
Incêndio ou faíscas visíveis: [ SIM / NÃO ]
Zona já isolada            : [ SIM / NÃO ]
Fogos sem energia (estimativa): [ _______ fogos ]
Data/Hora da ocorrência    : [ ___/___/2026 às ____h ]

────────────────────────────────────────────────────────
DESCRIÇÃO DA OCORRÊNCIA
────────────────────────────────────────────────────────
${mensagem || "[ Descreva o que observou com o máximo de detalhe possível, incluindo eventuais riscos para pessoas ou propriedades próximas ]"}

────────────────────────────────────────────────────────
CONTACTO URGENTE DO REPORTANTE
────────────────────────────────────────────────────────
Telemóvel (disponível agora): [ +258 ______________ ]
${footer}`,
    },

    "nova-ligacao": {
      subject: `[EVN Portal] Pedido de Nova Ligação à Rede Eléctrica — ${ref}`,
      body:
`${header("PEDIDO DE NOVA LIGAÇÃO À REDE ELÉCTRICA")}
────────────────────────────────────────────────────────
IDENTIFICAÇÃO DO REQUERENTE
────────────────────────────────────────────────────────
BI / NUIT               : [ _________________________ ]
Telemóvel de contacto   : [ +258 __________________ ]
Morada permanente       : [ _________________________ ]

────────────────────────────────────────────────────────
DADOS DA INSTALAÇÃO A LIGAR
────────────────────────────────────────────────────────
Endereço da nova ligação: [ _________________________ ]
Bairro / Zona           : [ _________________________ ]
Cidade / Distrito       : [ _________________________ ]
Tipo de imóvel          : [ Habitação / Comércio / Indústria / Outro ]
Área útil (m²)          : [ _________________________ ]

────────────────────────────────────────────────────────
REQUISITOS TÉCNICOS
────────────────────────────────────────────────────────
Tensão solicitada    : [ 220V Monofásico / 380V Trifásico ]
Potência solicitada  : [ __________ kVA ]
Uso principal        : [ _________________________ ]
Contador preferido   : [ Pré-pago (Credelec) / Pós-pago ]

────────────────────────────────────────────────────────
INSTALADOR ELÉCTRICO RESPONSÁVEL
────────────────────────────────────────────────────────
Nome do electricista   : [ _________________________ ]
Credencial ARENE n.º   : [ _________________________ ]
Telemóvel              : [ +258 __________________ ]

────────────────────────────────────────────────────────
INFORMAÇÃO ADICIONAL
────────────────────────────────────────────────────────
${mensagem || "[ Informações complementares relevantes para o pedido de nova ligação ]"}

────────────────────────────────────────────────────────
DOCUMENTOS A ANEXAR
────────────────────────────────────────────────────────
[ ] Cópia do BI autenticada
[ ] Título de propriedade ou contrato de arrendamento
[ ] Planta de localização do imóvel
[ ] Termo de Responsabilidade Técnica (MOD-EVN-TRT-001)
[ ] Projecto de instalações eléctricas (se trifásico)
${footer}`,
    },

    "titularidade": {
      subject: `[EVN Portal] Pedido de Mudança de Titularidade — Conta Nº [XXXXX] — ${ref}`,
      body:
`${header("PEDIDO DE MUDANÇA DE TITULARIDADE DO CONTRATO")}
────────────────────────────────────────────────────────
TITULAR CEDENTE (ACTUAL TITULAR DO CONTRATO)
────────────────────────────────────────────────────────
Nome completo          : [ _________________________ ]
BI / NUIT              : [ _________________________ ]
Telemóvel              : [ +258 __________________ ]
Número de Conta EVN    : [ _________________________ ]
Número de Contador     : [ ___ ___ ___ ___ ___ ] (11 dígitos)
Motivo da cedência:
[ ] Venda do imóvel
[ ] Fim de contrato de arrendamento
[ ] Herança / falecimento do titular
[ ] Divórcio / separação
[ ] Outro: _________________________________________

────────────────────────────────────────────────────────
TITULAR CESSIONÁRIO (NOVO TITULAR)
────────────────────────────────────────────────────────
Nome completo          : ${nome || "[ _________________________ ]"}
BI / NUIT              : [ _________________________ ]
Telemóvel              : [ +258 __________________ ]
Email                  : [ _________________________ ]
Morada permanente      : [ _________________________ ]

────────────────────────────────────────────────────────
DADOS DO IMÓVEL EM QUESTÃO
────────────────────────────────────────────────────────
Endereço completo      : [ _________________________ ]
Tipo de imóvel         : [ Residencial / Comercial / Industrial ]
Potência contratada    : [ __________ kVA ]

────────────────────────────────────────────────────────
INFORMAÇÃO ADICIONAL
────────────────────────────────────────────────────────
${mensagem || "[ Informações complementares sobre a mudança de titularidade ]"}

────────────────────────────────────────────────────────
DOCUMENTOS A ANEXAR
────────────────────────────────────────────────────────
[ ] BI de ambas as partes (cópias autenticadas)
[ ] Escritura de compra e venda ou contrato de arrendamento
[ ] Certidão de propriedade actualizada
[ ] Em caso de herança: certidão de óbito + habilitação de herdeiros
[ ] Formulário MOD-EVN-MT-003 (disponível em evn.co.mz)
${footer}`,
    },

    "eficiencia": {
      subject: `[EVN Portal] Adesão ao Programa Nacional de Eficiência Energética — ${ref}`,
      body:
`${header("PEDIDO DE ADESÃO — PROGRAMA NACIONAL DE EFICIÊNCIA ENERGÉTICA (PNEE)")}
────────────────────────────────────────────────────────
DADOS DO CONTRATO EVN
────────────────────────────────────────────────────────
Número de Conta EVN    : [ _________________________ ]
Endereço da instalação : [ _________________________ ]
Tipo de cliente        : [ Residencial / Comercial ]
Classe tarifária actual: [ _________________________ ]

────────────────────────────────────────────────────────
PERFIL DE CONSUMO ENERGÉTICO
────────────────────────────────────────────────────────
Consumo médio mensal   : [ __________ kWh ]
Factura média mensal   : [ __________ MZN ]
N.º de pessoas no lar  : [ _________________________ ]
Horas de maior consumo : [ Manhã / Tarde / Noite ]

────────────────────────────────────────────────────────
EQUIPAMENTOS A AVALIAR NA AUDITORIA
────────────────────────────────────────────────────────
[ ] Frigorífico / Arca congeladora (classificação: ___ )
[ ] Ar condicionado (capacidade: _____ kW, ano: _____ )
[ ] Esquentador / Caldeira eléctrica
[ ] Máquina de lavar roupa
[ ] Iluminação (n.º de pontos: _____ )
[ ] Televisão / Equipamentos AV
[ ] Computadores / Equipamento de escritório
[ ] Motores / Bombas (uso comercial/industrial)
[ ] Outro: _________________________________________

────────────────────────────────────────────────────────
DISPONIBILIDADE PARA AUDITORIA GRATUITA
────────────────────────────────────────────────────────
Data preferida 1       : [ ___/___/2026 ]
Data preferida 2       : [ ___/___/2026 ]
Data preferida 3       : [ ___/___/2026 ]
Horário preferido      : [ 08h-12h / 14h-18h ]

────────────────────────────────────────────────────────
INTERESSE EM FINANCIAMENTO A TAXA ZERO
────────────────────────────────────────────────────────
[ ] Sim — estou interessado/a no financiamento para substituição de equipamentos
[ ] Não — apenas quero a auditoria gratuita

────────────────────────────────────────────────────────
MENSAGEM ADICIONAL
────────────────────────────────────────────────────────
${mensagem || "[ Informações complementares sobre o seu interesse no programa ]"}
${footer}`,
    },

    "tarifas": {
      subject: `[EVN Portal] Consulta sobre Tarifas e Contratos — Conta Nº [XXXXX] — ${ref}`,
      body:
`${header("CONSULTA SOBRE TARIFAS, CONTRATOS E SERVIÇOS EVN")}
────────────────────────────────────────────────────────
IDENTIFICAÇÃO DO CONTRATO
────────────────────────────────────────────────────────
Número de Conta EVN    : [ _________________________ ]
Número de Contador     : [ ___ ___ ___ ___ ___ ] (11 dígitos)
Classe tarifária actual: [ _________________________ ]
Consumo médio mensal   : [ __________ kWh ]
Tipo de cliente        : [ Residencial / Comercial / Industrial ]

────────────────────────────────────────────────────────
ASSUNTO DA CONSULTA (assinale o(s) aplicável(is))
────────────────────────────────────────────────────────
[ ] Comparação entre tarifas disponíveis para o meu perfil
[ ] Adesão à tarifa bi-horária (desconto 38% nas horas de vazio)
[ ] Elegibilidade para tarifa social
[ ] Aumento de potência contratada (actual: ___ kVA → solicitado: ___ kVA)
[ ] Redução de potência contratada
[ ] Cópia do contrato de fornecimento
[ ] Rectificação de dados contratuais
[ ] Rescisão de contrato
[ ] Outro: _________________________________________

────────────────────────────────────────────────────────
PARA PEDIDO DE TARIFA BI-HORÁRIA
────────────────────────────────────────────────────────
Tipo de contador actual: [ Electromecânico / Electrónico ]
Horas de maior consumo : [ Manhã / Tarde / Noite / Madrugada ]
Equipamentos de grande consumo nocturno: [ _________ ]

────────────────────────────────────────────────────────
PEDIDO ESPECÍFICO / QUESTÃO DETALHADA
────────────────────────────────────────────────────────
${mensagem || "[ Descreva detalhadamente a sua questão sobre tarifas, contratos ou serviços EVN ]"}

────────────────────────────────────────────────────────
SIMULAÇÃO SOLICITADA
────────────────────────────────────────────────────────
[ ] Sim — solicito simulação comparativa entre a minha tarifa actual e as alternativas
[ ] Não — apenas preciso de informação
${footer}`,
    },

    "credelec": {
      subject: `[EVN Portal] Questão Credelec — Contador Nº [XXXXXXXXXXX] — ${ref}`,
      body:
`${header("ASSISTÊNCIA TÉCNICA — RECARGA CREDELEC (PRÉ-PAGO)")}
────────────────────────────────────────────────────────
IDENTIFICAÇÃO DO CONTADOR PRÉ-PAGO
────────────────────────────────────────────────────────
Número de contador (11 dígitos):
[ ___ ] [ ___ ] [ ___ ] [ ___ ] [ ___ ] [ ___ ] [ ___ ] [ ___ ] [ ___ ] [ ___ ] [ ___ ]

Número de Conta EVN    : [ _________________________ ]
Marca / Modelo contador: [ _________________________ ]
Telemóvel de contacto  : [ +258 __________________ ]

────────────────────────────────────────────────────────
TIPO DE PROBLEMA (assinale o aplicável)
────────────────────────────────────────────────────────
[ ] Token de 20 dígitos recebido mas não aceite pelo contador
[ ] Recarga efectuada e debitada mas token não recebido
[ ] Saldo a zero imediatamente após recarga
[ ] Contador a mostrar código de erro — Código: [ _______ ]
[ ] Contador em modo TAMPER (adulteração detectada)
[ ] Contador sem display / display apagado
[ ] Limite de crédito ultrapassado — contador bloqueado
[ ] Problema com plataforma de pagamento
[ ] Outro: _________________________________________

────────────────────────────────────────────────────────
DETALHES DA RECARGA PROBLEMÁTICA
────────────────────────────────────────────────────────
Data e hora da recarga : [ ___/___/2026 às ____h____m ]
Valor recarregado (MZN): [ _________________________ ]
Plataforma utilizada:
[ ] M-Pesa (*150*1455*[contador]#)
[ ] e-Mola (*111*1455*[contador]#)
[ ] mKesh
[ ] Internet Banking BIM
[ ] Internet Banking Standard Bank / BCI
[ ] Loja / Agente autorizado EVN
[ ] Outro: _________________________________________
Referência da transacção: [ _________________________ ]
Token recebido (se aplicável):
[ ___ ] [ ___ ] [ ___ ] [ ___ ] [ ___ ] (20 dígitos)

────────────────────────────────────────────────────────
DESCRIÇÃO DO PROBLEMA
────────────────────────────────────────────────────────
${mensagem || "[ Descreva detalhadamente o problema com a recarga Credelec, incluindo o que aconteceu no contador quando introduziu o token ]"}

────────────────────────────────────────────────────────
COMPROVATIVO A ANEXAR
────────────────────────────────────────────────────────
[ ] Captura de ecrã do SMS de confirmação da recarga
[ ] Extrato bancário / M-Pesa comprovando o débito
[ ] Fotografia do display do contador com o código de erro
${footer}`,
    },

  };

  return templates[topic];
};

export function ContactModal() {
  const [form, setForm]       = useState({ nome: "", email: "", mensagem: "" });
  const [topic, setTopic]     = useState<ContactTopic>("geral");
  const [submitting, setSubmitting] = useState(false);
  const [emailTemplateModal, setEmailTemplateModal] = useState<{ open: boolean; subject: string; body: string } | null>(null);

  const handleSendEmail = () => {
    const { subject, body } = getEmailTemplate(topic, form.nome, form.mensagem);

    const shortBody = `Referência: ${subject.split('—').pop()?.trim() ?? ''}\n\nPor favor consulte o template completo em anexo / copiado abaixo.\n\nRequerente: ${form.nome || '(ver dados em baixo)'}\nMensagem: ${(form.mensagem || '').slice(0, 200)}`;

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=shreymayur008@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(shortBody)}`;

    window.open(gmailUrl, "_blank", "noopener,noreferrer");

    setEmailTemplateModal({ open: true, subject, body });
  };

  const handleSubmitMessage = async () => {
    if (!form.nome.trim() || form.nome.trim().length < 2) {
      toast.error("Insira o seu nome.");
      return;
    }
    if (!form.mensagem.trim() || form.mensagem.trim().length < 5) {
      toast.error("A mensagem é demasiado curta.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email?.trim() || "",
          mensagem: form.mensagem.trim(),
          assunto: topic || "geral",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || `HTTP ${res.status}`);
      }

      toast.success("Mensagem enviada com sucesso! Responderemos em 24–48 horas.");
      setForm({ nome: "", email: "", mensagem: "" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido.";
      toast.error(`Não foi possível enviar: ${msg}`);
      console.error("[ContactModal] submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase = "w-full p-3.5 rounded-xl outline-none transition-colors text-slate-100 placeholder:text-slate-600 focus:border-orange-500 bg-white/[0.05] border border-white/10 text-sm";

  return (
    <>
    <div className="flex flex-col lg:flex-row">
      {/* Left panel — contact channels */}
      <div className="w-full lg:w-5/12 p-5 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.06]" style={{ background: "rgba(5,5,15,0.6)" }}>
        <div>
          <p className="text-orange-500 font-bold uppercase text-xs tracking-widest mb-1">Central de Apoio</p>
          <h2 className="text-2xl font-black text-white mb-2">Apoio ao Cliente</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">Centro de atendimento disponível 24h, 7 dias por semana para emergências e dúvidas.</p>

          <div className="space-y-3">
            {/* WhatsApp */}
            <a
              href="https://wa.me/258845184783?text=Ol%C3%A1%2C%20entro%20em%20contacto%20atrav%C3%A9s%20do%20Portal%20EVN."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl border transition-colors group w-full"
              style={{ background: "rgba(34,197,94,0.06)", borderColor: "rgba(34,197,94,0.25)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(34,197,94,0.12)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(34,197,94,0.06)")}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(34,197,94,0.15)" }}>
                <MessageCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs uppercase tracking-widest font-bold text-emerald-500/70">WHATSAPP OFICIAL</p>
                <p className="text-slate-200 font-bold text-sm">+258 84 518 4783</p>
                <p className="text-slate-500 text-xs">Clique para iniciar conversa</p>
              </div>
            </a>

            {/* Linha Verde */}
            <a
              href="tel:+2581455"
              className="flex items-center gap-3 p-4 rounded-xl border transition-colors w-full"
              style={{ background: "rgba(249,115,22,0.06)", borderColor: "rgba(249,115,22,0.25)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(249,115,22,0.12)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(249,115,22,0.06)")}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(249,115,22,0.15)" }}>
                <Phone className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs uppercase tracking-widest font-bold text-orange-500/70">LINHA VERDE (GRATUITA)</p>
                <p className="text-slate-200 font-bold text-sm">1455</p>
                <p className="text-slate-500 text-xs">Disponível 24h · 7 dias por semana</p>
              </div>
            </a>

            {/* Email */}
            <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ background: "rgba(59,130,246,0.06)", borderColor: "rgba(59,130,246,0.2)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.15)" }}>
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs uppercase tracking-widest font-bold text-blue-500/70">EMAIL INSTITUCIONAL</p>
                <p className="text-slate-200 font-bold text-sm">atendimento@evn.co.mz</p>
                <p className="text-slate-500 text-xs">Resposta em 24–48 horas úteis</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)" }}>
          <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-1">Emergência Eléctrica</p>
          <p className="text-slate-300 text-xs leading-relaxed">Para avarias urgentes (postes caídos, cabos partidos, risco imediato), ligue para a Linha Verde <strong>1455</strong> ou use o formulário de Avaria no portal.</p>
        </div>
      </div>

      {/* Right panel — email form */}
      <div className="w-full lg:w-7/12 p-5 sm:p-8 flex flex-col">
        <h3 className="text-xl font-black text-white mb-1">Enviar Mensagem</h3>
        <p className="text-slate-500 text-sm mb-6">Seleccione o assunto e preencha os dados. O botão de email abre o seu cliente de correio com um modelo profissional pré-preenchido.</p>

        <form className="space-y-4 flex-1 flex flex-col">
          {/* Name */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Nome</label>
            <input type="text" placeholder="O seu nome completo" value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              className={inputBase} />
          </div>

          {/* Email (optional) */}
          <div>
            <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2 font-medium">
              EMAIL <span className="text-slate-600 normal-case tracking-normal">(opcional — para receber resposta)</span>
            </label>
            <input
              type="email"
              placeholder="O seu email"
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border-2 border-white/10 focus:border-orange-500 outline-none text-slate-100 placeholder:text-slate-600 text-sm transition-colors"
            />
          </div>

          {/* Topic selector */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Assunto</label>
            <div className="relative">
              <select
                value={topic}
                onChange={e => setTopic(e.target.value as ContactTopic)}
                className={`${inputBase} appearance-none pr-10 cursor-pointer`}
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                {(Object.entries(TOPIC_LABELS) as [ContactTopic, string][]).map(([val, label]) => (
                  <option key={val} value={val} style={{ background: "#0d0d14", color: "#e2e8f0" }}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Message */}
          <div className="flex-1 flex flex-col">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Mensagem
            </label>
            <textarea
              rows={5}
              placeholder="Descreva o seu pedido ou situação em detalhe…"
              value={form.mensagem}
              onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))}
              className={`${inputBase} resize-none flex-1`}
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleSendEmail}
              className="flex-1 flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-600 bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors font-medium text-sm"
            >
              <Mail className="w-4 h-4" />
              Enviar por Email
            </button>
            <button
              type="button"
              onClick={handleSubmitMessage}
              disabled={submitting}
              className="flex-1 flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors"
            >
              <Send className="w-4 h-4" />
              {submitting ? "A enviar…" : "Enviar Mensagem"}
            </button>
          </div>

          <p className="text-slate-600 text-xs text-center">
            &quot;Enviar por Email&quot; abre o seu cliente de correio com o modelo do assunto seleccionado pré-preenchido.
          </p>
        </form>
      </div>
    </div>

    {emailTemplateModal?.open && (
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-zinc-950 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <div>
              <h3 className="text-slate-100 font-bold">Template do Email</h3>
              <p className="text-slate-500 text-xs mt-0.5">Cole este conteúdo no corpo do email que acabou de abrir</p>
            </div>
            <button
              type="button"
              onClick={() => setEmailTemplateModal(null)}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <pre className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-white/[0.03] rounded-xl p-4 border border-white/10">
              {emailTemplateModal.body}
            </pre>
          </div>
          <div className="p-5 border-t border-white/10 flex gap-3">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(emailTemplateModal.body);
                toast.success("Template copiado! Cole-o no corpo do email.");
              }}
              className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copiar Template Completo
            </button>
            <button
              type="button"
              onClick={() => setEmailTemplateModal(null)}
              className="px-5 py-3 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 text-sm transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
