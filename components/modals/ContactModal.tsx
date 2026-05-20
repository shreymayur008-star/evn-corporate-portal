"use client";

import { useState } from "react";
import { Phone, MessageCircle, Mail, Send, ChevronDown } from "lucide-react";
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

function getEmailTemplate(topic: ContactTopic, nome: string, mensagem: string): { subject: string; body: string } {
  const ref    = `REF-${Date.now().toString().slice(-8)}`;
  const date   = new Date().toLocaleDateString("pt-PT", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const header = `EVN — Eletricidade Vantara Nacional, E.P.\nPortal Digital do Cliente\nData: ${date}\nReferência: ${ref}\n\n${"─".repeat(60)}\n\n`;
  const footer = `\n\n${"─".repeat(60)}\nEnviado através do Portal Digital EVN\nLinha Verde: 1455 (gratuita, 24h/7 dias)\nEmail institucional: atendimento@evn.co.mz\nSede: Av. 25 de Setembro, n.º 1218, Maputo, Moçambique`;

  const n = nome || "[O seu nome]";
  const m = mensagem || "[Descreva o seu pedido]";

  const templates: Record<ContactTopic, { subject: string; body: string }> = {
    "geral": {
      subject: `[EVN Portal] Pedido de Informação — ${ref}`,
      body: `${header}PEDIDO DE INFORMAÇÃO GERAL\n\nRequerente: ${n}\n\nMensagem:\n${m}\n\nPor favor, responda para o email registado na minha conta ou contacte-me pelo número indicado.${footer}`,
    },
    "fatura": {
      subject: `[EVN Portal] Reclamação de Faturação — Conta Nº [XXXXX] — ${ref}`,
      body: `${header}RECLAMAÇÃO DE FATURAÇÃO\n\nRequerente: ${n}\nNúmero de conta EVN: [Insira o seu número de conta]\nNúmero de contador: [Insira os 11 dígitos do contador]\nPeríodo em litígio: [Mês/Ano da factura contestada]\nValor faturado: [Valor em MZN]\nValor esperado (estimativa): [Valor em MZN]\n\nDescrição da reclamação:\n${m}\n\nDocumentos em anexo: [ ] Cópia da factura contestada  [ ] Facturas dos 3 meses anteriores  [ ] Fotografias do contador\n\nSolicito auditoria urgente da leitura e emissão de nota de crédito caso se confirme a anomalia.${footer}`,
    },
    "avaria": {
      subject: `[EVN Portal] AVARIA — Relatório de Ocorrência — ${ref} — URGENTE`,
      body: `${header}RELATÓRIO DE AVARIA / EMERGÊNCIA — URGENTE\n\nReportante: ${n}\nTelemóvel de contacto: [O seu número]\nData/Hora da ocorrência: ${new Date().toLocaleString("pt-PT")}\n\nLocalização da avaria:\nEndereço: [Rua, número, bairro]\nCidade/Distrito: [Cidade]\nReferência próxima: [Ponto de referência visível]\n\nTipo de avaria: [ ] Poste Caído  [ ] Cabo Partido  [ ] Transformador Avariado  [ ] Falha de Fornecimento  [ ] Iluminação Pública  [ ] Outro\n\nDescrição da ocorrência:\n${m}\n\nEstado de segurança: [ ] Zona isolada  [ ] Risco imediato para pessoas  [ ] Trânsito afectado  [ ] Incêndio/faísca\n\nEsta ocorrência foi também reportada através do formulário de avaria no Portal EVN.${footer}`,
    },
    "nova-ligacao": {
      subject: `[EVN Portal] Pedido de Nova Ligação à Rede Eléctrica — ${ref}`,
      body: `${header}PEDIDO DE NOVA LIGAÇÃO À REDE ELÉCTRICA\n\nRequerente: ${n}\nBI/NUIT: [Número de BI ou NUIT]\nTelemóvel: [O seu número]\n\nDados da instalação:\nEndereço da nova ligação: [Endereço completo]\nBairro/Localidade: [Bairro]\nCidade/Distrito/Província: [Localidade]\n\nDetalhes técnicos solicitados:\nTipo de ligação: [ ] Monofásica 220V  [ ] Trifásica 380V\nPotência solicitada: [kVA]\nUso previsto: [ ] Residencial  [ ] Comercial  [ ] Industrial  [ ] Agrícola\n\nMensagem adicional:\n${m}\n\nDocumentos a anexar: [ ] Cópia do BI  [ ] Título de propriedade/arrendamento  [ ] Termo de Responsabilidade Técnica (MOD-EVN-TRT-001)  [ ] Planta de localização${footer}`,
    },
    "titularidade": {
      subject: `[EVN Portal] Pedido de Mudança de Titularidade — Conta Nº [XXXXX] — ${ref}`,
      body: `${header}PEDIDO DE MUDANÇA DE TITULARIDADE\n\nTITULAR CEDENTE (actual):\nNome completo: [Nome]\nBI/NUIT: [Número]\nTelemóvel: [Número]\nNúmero de conta EVN: [Número de conta]\nNúmero de contador: [11 dígitos]\nMotivo da cedência: [ ] Venda do imóvel  [ ] Herança  [ ] Divórcio  [ ] Fim de arrendamento  [ ] Outro\n\nTITULAR CESSIONÁRIO (novo):\nNome completo: ${n}\nBI/NUIT: [Número]\nTelemóvel: [Número]\n\nMensagem adicional:\n${m}\n\nDocumentos a anexar: [ ] BI de ambas as partes (autenticados)  [ ] Escritura/certidão de propriedade ou contrato de arrendamento  [ ] Formulário MOD-EVN-MT-003${footer}`,
    },
    "eficiencia": {
      subject: `[EVN Portal] Adesão ao Programa Nacional de Eficiência Energética — ${ref}`,
      body: `${header}PEDIDO DE ADESÃO — PROGRAMA NACIONAL DE EFICIÊNCIA ENERGÉTICA (PNEE)\n\nRequerente: ${n}\nNúmero de conta EVN: [Número]\nEndereço da instalação: [Endereço]\nTipo de imóvel: [ ] Residencial  [ ] Comercial\n\nConsumo médio mensal estimado: [kWh]\nNúmero de pessoas no agregado familiar: [Número]\n\nEquipamentos a avaliar:\n[ ] Frigorífico/Congelador  [ ] Ar condicionado  [ ] Aquecedor de água  [ ] Iluminação  [ ] Máquina de lavar  [ ] Outro: ___\n\nDisponibilidade para auditoria gratuita:\nDatas preferidas: [Data 1] / [Data 2]\nHorário preferido: [ ] Manhã (8h-12h)  [ ] Tarde (14h-18h)\n\nMensagem adicional:\n${m}${footer}`,
    },
    "tarifas": {
      subject: `[EVN Portal] Consulta sobre Tarifas e Contratos — Conta Nº [XXXXX] — ${ref}`,
      body: `${header}CONSULTA SOBRE TARIFAS E CONTRATOS\n\nRequerente: ${n}\nNúmero de conta EVN: [Número]\nTarifa actual: [Ex: Doméstico Social Tipo B]\nConsumo médio mensal: [kWh]\nTipo de cliente: [ ] Residencial  [ ] Comercial  [ ] Industrial\n\nAssunto da consulta:\n[ ] Mudança de classe tarifária  [ ] Tarifa bi-horária  [ ] Aumento de potência  [ ] Redução de potência  [ ] Tarifa social  [ ] Cópia de contrato  [ ] Outro: ___\n\nPedido específico:\n${m}${footer}`,
    },
    "credelec": {
      subject: `[EVN Portal] Questão sobre Recarga Credelec — Contador Nº [XXXXXXXXXXX] — ${ref}`,
      body: `${header}QUESTÃO SOBRE RECARGA CREDELEC\n\nRequerente: ${n}\nNúmero de contador (11 dígitos): [Número]\nNúmero de conta EVN: [Número]\nTelemóvel de contacto: [Número]\n\nMotivo do contacto:\n[ ] Token não aceite pelo contador  [ ] Valor debitado mas token não recebido  [ ] Saldo incorrecto após recarga  [ ] Problema com plataforma M-Pesa/e-Mola  [ ] Contador a mostrar erro: [Código]  [ ] Outro: ___\n\nDescrição detalhada:\n${m}\n\nData/Hora da recarga problemática: [Data e hora]\nValor da recarga: [MZN]\nPlataforma utilizada: [ ] M-Pesa  [ ] e-Mola  [ ] mKesh  [ ] BIM  [ ] Outro\nNúmero de referência da transacção: [Referência]${footer}`,
    },
  };

  const { subject, body } = templates[topic];
  const MAX_BODY = 1800;
  const truncatedBody = body.length > MAX_BODY
    ? body.slice(0, MAX_BODY) + "\n\n[Mensagem truncada — consulte o portal para detalhes completos]"
    : body;
  return { subject, body: truncatedBody };
}

export function ContactModal() {
  const [form, setForm]       = useState({ nome: "", email: "", mensagem: "" });
  const [topic, setTopic]     = useState<ContactTopic>("geral");
  const [submitting, setSubmitting] = useState(false);

  const handleSendEmail = () => {
    const { subject, body } = getEmailTemplate(topic, form.nome, form.mensagem);
    const mailtoUrl = `mailto:shreymayur008@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const a = document.createElement("a");
    a.href = mailtoUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      toast("Se o cliente de email não abriu, envie para: shreymayur008@gmail.com", {
        duration: 6000,
        icon: "📧",
      });
    }, 1500);
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
    <div className="flex flex-col lg:flex-row min-h-[620px]">
      {/* Left panel — contact channels */}
      <div className="lg:w-5/12 p-8 flex flex-col justify-between" style={{ background: "rgba(5,5,15,0.6)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
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
      <div className="lg:w-7/12 p-8 flex flex-col">
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
          <div className="flex gap-3 pt-2">
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
  );
}
