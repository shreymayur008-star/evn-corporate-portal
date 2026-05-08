import type { DownloadState } from "@/app/_types";

type SetDownload = (s: DownloadState) => void;

const esc = (s: string | number) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );

function pdfStyles(): string {
  return `
    body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 0; margin: 0; background: #fff; }
    .page { padding: 40px 50px; max-width: 800px; margin: 0 auto; box-sizing: border-box; min-height: 100vh; position: relative; }
    .page-break { page-break-before: always; border-top: 1px dashed #cbd5e1; }
    @media print { .page-break { border-top: none; } body { background: none; } .page { min-height: auto; padding: 20px; } }
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
  `;
}

function generateFatura(filename: string): string {
  const ref = `FT-${Math.floor(10000 + Math.random() * 90000)}`;
  const date = new Date().toLocaleDateString("pt-MZ");
  const payRef = Math.floor(100000000 + Math.random() * 900000000);
  return `
    <div class="page">
      <div class="header"><div class="logo">⚡ EVN<span>.</span></div><div class="header-text"><strong>Eletricidade Vantara Nacional, E.P.</strong><br/>Direção Comercial<br/>Maputo, Moçambique</div></div>
      <h1 class="title">Fatura de Energia Elétrica</h1>
      <div class="meta">Data de Emissão: ${esc(date)} &nbsp;|&nbsp; Fatura Nº: ${esc(ref)} &nbsp;|&nbsp; Ficheiro: ${esc(filename)}</div>
      <div class="content">
        <h3>Resumo da Fatura</h3>
        <table class="data-table">
          <tr class="table-header"><th>Descrição</th><th>Valor (MZN)</th></tr>
          <tr><td>Energia Ativa (Consumo Real)</td><td>1,750.00</td></tr>
          <tr><td>Taxa de Rádio e TV</td><td>100.00</td></tr>
          <tr><td>Taxa Fixa EVN</td><td>150.00</td></tr>
          <tr class="table-total"><td>Total a Pagar</td><td>2,000.00 MZN</td></tr>
        </table>
        <p style="margin-top:30px; font-weight:bold; color:#ef4444; font-size:18px;">Data Limite: Dia 15 do mês corrente.</p>
      </div>
    </div>
    <div class="page page-break">
      <div class="header"><div class="logo">⚡ EVN<span>.</span></div><div class="header-text">Anexo I — Instruções de Pagamento</div></div>
      <div class="content">
        <h3>Pagamento via M-Pesa</h3>
        <ol>
          <li>Marque *150# no seu telemóvel.</li>
          <li>Selecione a opção 6 (Pagamentos) → 1 (Credelec / EVN).</li>
          <li>Entidade: <strong>900900</strong> — Referência: <strong>${esc(payRef)}</strong>.</li>
          <li>Insira o valor exato: 2,000.00 MZN.</li>
        </ol>
        <h3>Transferência Bancária (Millennium BIM / BCI)</h3>
        <p>NIB: 0001 0000 0000 1234 5678 9 — indique o número da fatura.</p>
      </div>
    </div>`;
}

function generateEdital(filename: string): string {
  const ref = esc(filename.replace(".pdf", ""));
  const date = new Date().toLocaleDateString("pt-MZ");
  return `
    <div class="page">
      <div class="header"><div class="logo">⚡ EVN<span>.</span></div><div class="header-text">Direção de Recursos Humanos<br/>Maputo, Moçambique</div></div>
      <h1 class="title">Edital de Recrutamento Oficial</h1>
      <div class="meta">Data de Emissão: ${esc(date)} &nbsp;|&nbsp; Referência: ${ref}</div>
      <div class="content" style="text-align:center; padding: 60px 20px;">
        <h2 style="font-size:28px; color:#f97316; margin-bottom:16px;">Concurso Público para Contratação</h2>
        <p style="font-size:16px; color:#334155; max-width:560px; margin:0 auto;">A Eletricidade Vantara Nacional (EVN), E.P., anuncia abertura de concurso para preenchimento de vaga.</p>
      </div>
    </div>
    <div class="page page-break">
      <div class="header"><div class="logo">⚡ EVN<span>.</span></div><div class="header-text">Edital: ${ref} — Requisitos</div></div>
      <div class="content">
        <h3>Requisitos e Qualificações</h3>
        <ul>
          <li>Licenciatura em Engenharia Eletrotécnica ou área equivalente.</li>
          <li>Inscrição válida na Ordem dos Engenheiros de Moçambique.</li>
          <li>Mínimo de 5 anos de experiência comprovada.</li>
          <li>Domínio de AutoCAD e software de gestão de redes elétricas.</li>
          <li>Carta de condução válida e disponibilidade para deslocações nacionais.</li>
        </ul>
        <h3 style="margin-top:24px;">Candidaturas</h3>
        <p>Enviar CV, carta de motivação e documentos autenticados para <strong>recrutamento@evn.co.mz</strong> no prazo de 30 dias.</p>
        <div class="signature-box"><div class="line">A Direção de Recursos Humanos<br/>Eletricidade Vantara Nacional, E.P.</div></div>
      </div>
    </div>`;
}

function generateFormulario(filename: string): string {
  const ref = esc(filename);
  const date = new Date().toLocaleDateString("pt-MZ");
  return `
    <div class="page">
      <div class="header"><div class="logo">⚡ EVN<span>.</span></div><div class="header-text">Direção Comercial<br/>Maputo, Moçambique</div></div>
      <h1 class="title">Formulário Oficial EVN</h1>
      <div class="meta">Data: ${esc(date)} &nbsp;|&nbsp; Formulário: ${ref}</div>
      <div class="content">
        <h3>Identificação do Requerente</h3>
        <p style="border-bottom:1px dashed #94a3b8; padding-bottom:5px; margin-top:20px;">Nome Completo / Designação Social: </p>
        <p style="border-bottom:1px dashed #94a3b8; padding-bottom:5px; margin-top:20px;">NUIT: </p>
        <p style="border-bottom:1px dashed #94a3b8; padding-bottom:5px; margin-top:20px;">Documento de Identificação (BI/DIRE/Passaporte) e Número: </p>
        <p style="border-bottom:1px dashed #94a3b8; padding-bottom:5px; margin-top:20px;">Endereço de Instalação (Província, Cidade, Bairro): </p>
        <p style="border-bottom:1px dashed #94a3b8; padding-bottom:5px; margin-top:20px;">Contacto Telefónico: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Email: </p>
      </div>
    </div>
    <div class="page page-break">
      <div class="header"><div class="logo">⚡ EVN<span>.</span></div><div class="header-text">Formulário: ${ref} — Termos</div></div>
      <div class="content">
        <h3>Termos e Condições</h3>
        <ol>
          <li>O requerente autoriza a entrada de técnicos da EVN nas instalações para vistoria e manutenção.</li>
          <li>A EVN responsabiliza-se pela rede apenas até ao ponto de entrega (contador).</li>
          <li>Qualquer fraude ou ligação clandestina resulta em corte imediato e procedimento legal.</li>
        </ol>
        <div style="background:#f1f5f9; padding:16px; border-radius:8px; margin-top:32px;">
          <p style="font-size:12px; margin:0;">Declaro que todas as informações prestadas são verdadeiras e aceito os termos da EVN.</p>
        </div>
        <div class="signature-box">
          <div class="line">Assinatura do Requerente</div>
          <div class="line">Reservado à EVN</div>
        </div>
      </div>
    </div>`;
}

export function triggerDownload(
  filename: string,
  docType: "FATURA" | "EDITAL" | "FORMULARIO",
  setDownload: SetDownload,
  onDone: () => void,
) {
  setDownload({ show: true, filename, docType, progress: 0 });
  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 20) + 10;
    if (progress >= 100) {
      clearInterval(interval);
      setDownload({ show: true, filename, docType, progress: 100 });

      setTimeout(() => {
        const content =
          docType === "FATURA" ? generateFatura(filename)
          : docType === "EDITAL" ? generateEdital(filename)
          : generateFormulario(filename);

        const fullHtml = `<!DOCTYPE html><html><head><title>${esc(filename)}</title><style>${pdfStyles()}</style></head><body>${content}<script>window.onload=()=>window.print();<\/script></body></html>`;

        const blob = new Blob([fullHtml], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(url), 60_000);

        onDone();
        setTimeout(() => setDownload({ show: false, filename: "", docType: "", progress: 0 }), 2000);
      }, 500);
    } else {
      setDownload({ show: true, filename, docType, progress });
    }
  }, 400);
}
