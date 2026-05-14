const esc = (s: string | number) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );

function pdfStyles(): string {
  return `
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 0; margin: 0; background: #fff; }
    .page { padding: 40px 50px; max-width: 800px; margin: 0 auto; min-height: 100vh; position: relative; }
    @media print {
      .page-break { page-break-before: always; }
      body { background: none; }
      .page { min-height: auto; padding: 20px 30px; }
    }
    .header { border-bottom: 4px solid #f97316; padding-bottom: 16px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-end; }
    .logo { color: #f97316; font-size: 34px; font-weight: 900; letter-spacing: -2px; margin: 0; line-height: 1; }
    .logo span { color: #0f172a; }
    .header-sub { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-top: 4px; }
    .header-text { text-align: right; color: #64748b; font-size: 11px; line-height: 1.6; }
    .doc-title { font-size: 22px; color: #0f172a; margin-bottom: 6px; text-transform: uppercase; font-weight: 900; letter-spacing: 0.5px; }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; margin-bottom: 20px; }
    .meta-box { background: #f8fafc; border-left: 4px solid #e2e8f0; border-radius: 0 6px 6px 0; padding: 10px 16px; margin-bottom: 24px; font-size: 12px; color: #64748b; font-weight: 600; line-height: 1.7; }
    .section-title { font-size: 13px; font-weight: 800; color: #f97316; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #fde8d0; padding-bottom: 6px; margin: 24px 0 14px; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px; }
    .data-table th { background: #f1f5f9; color: #475569; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 12px; text-align: left; border-bottom: 2px solid #e2e8f0; }
    .data-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: top; }
    .data-table tr:last-child td { border-bottom: none; }
    .row-total td { font-weight: 800; font-size: 15px; color: #ea580c; background: #fff7ed; border-top: 2px solid #fed7aa !important; padding-top: 14px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
    .info-cell { background: #f8fafc; border-radius: 8px; padding: 12px 14px; }
    .info-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .info-value { font-size: 14px; font-weight: 700; color: #0f172a; }
    .alert-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #dc2626; font-weight: 600; }
    .info-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #1d4ed8; font-weight: 600; }
    p { font-size: 13px; color: #334155; line-height: 1.65; margin-bottom: 12px; }
    ul, ol { font-size: 13px; color: #334155; padding-left: 20px; line-height: 1.7; margin-bottom: 12px; }
    li { margin-bottom: 6px; }
    .field-line { border: none; border-bottom: 1px dashed #94a3b8; height: 32px; width: 100%; margin-bottom: 16px; display: block; }
    .field-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; display: block; }
    .field-group { margin-bottom: 20px; }
    .signature-row { display: flex; justify-content: space-between; margin-top: 60px; gap: 40px; }
    .signature-block { flex: 1; text-align: center; }
    .signature-line { border-top: 1px solid #94a3b8; padding-top: 10px; font-size: 12px; color: #64748b; font-weight: 700; }
    .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 40px; padding-top: 12px; border-top: 1px solid #f1f5f9; }
  `;
}

function evnHeader(subtitle: string): string {
  return `
    <div class="header">
      <div>
        <div class="logo">&#9889; EVN<span>.</span></div>
        <div class="header-sub">Eletricidade Vantara Nacional, E.P.</div>
      </div>
      <div class="header-text">
        <strong>Av. 25 de Setembro, 1500 &mdash; Maputo</strong><br/>
        Tel: +258 21 352 400 &nbsp;|&nbsp; evn.co.mz<br/>
        ${esc(subtitle)}
      </div>
    </div>`;
}

function evnFooter(): string {
  const year = new Date().getFullYear();
  return `<div class="footer">Eletricidade Vantara Nacional, E.P. &copy; ${year} &mdash; Documento gerado electronicamente pelo Sistema de Gest&atilde;o EVN. V&aacute;lido sem assinatura manuscrita.</div>`;
}

function generateFatura(filename: string): string {
  const ref = `FT-${Math.floor(10000 + Math.random() * 90000)}`;
  const now = new Date();
  const date = now.toLocaleDateString("pt-MZ");
  const month = now.toLocaleString("pt-MZ", { month: "long" }).toUpperCase();
  const year = now.getFullYear();
  const payRef = Math.floor(100000000 + Math.random() * 900000000);
  const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 15).toLocaleDateString("pt-MZ");

  const leitAnterior = 48230;
  const leitAtual = 48480;
  const consumo = leitAtual - leitAnterior;
  const tarifaKwh = 7.0;
  const energiaAtiva = consumo * tarifaKwh;
  const taxaDisponib = 150.0;
  const taxaRadioTV = 100.0;
  const subtotal = energiaAtiva + taxaDisponib + taxaRadioTV;
  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  const fmt = (n: number) => n.toLocaleString("pt-MZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return `
    <div class="page">
      ${evnHeader("Direc&ccedil;&atilde;o Comercial")}
      <div class="doc-title">Fatura de Energia El&eacute;trica</div>
      <div class="badge">&#9679; FATURA N.&ordm; ${esc(ref)} &mdash; ${esc(month)} ${esc(year)}</div>
      <div class="meta-box">
        <strong>Emiss&atilde;o:</strong> ${esc(date)} &nbsp;|&nbsp;
        <strong>Vencimento:</strong> ${esc(dueDate)} &nbsp;|&nbsp;
        <strong>Ficheiro:</strong> ${esc(filename)}<br/>
        <strong>Contrato:</strong> CT-192837465 &nbsp;|&nbsp;
        <strong>Tarifa:</strong> Dom&eacute;stica &mdash; Monof&aacute;sica &nbsp;|&nbsp;
        <strong>Zona:</strong> Maputo &mdash; KaMpfumo
      </div>
      <div class="info-grid">
        <div class="info-cell"><div class="info-label">Titular</div><div class="info-value">Cliente EVN Verificado</div></div>
        <div class="info-cell"><div class="info-label">NUIT</div><div class="info-value">192 837 465</div></div>
        <div class="info-cell"><div class="info-label">Endere&ccedil;o de Fornecimento</div><div class="info-value">Av. Eduardo Mondlane, 256 &mdash; Maputo</div></div>
        <div class="info-cell"><div class="info-label">N.&ordm; de Instala&ccedil;&atilde;o</div><div class="info-value">INS-2024-00847</div></div>
      </div>

      <div class="section-title">Leituras do Contador</div>
      <table class="data-table">
        <thead><tr><th>Descri&ccedil;&atilde;o</th><th>Leitura (kWh)</th><th>Data</th></tr></thead>
        <tbody>
          <tr><td>Leitura Anterior</td><td>${leitAnterior.toLocaleString("pt-MZ")}</td><td>${new Date(now.getFullYear(), now.getMonth() - 1, 28).toLocaleDateString("pt-MZ")}</td></tr>
          <tr><td>Leitura Actual</td><td>${leitAtual.toLocaleString("pt-MZ")}</td><td>${esc(date)}</td></tr>
          <tr><td><strong>Consumo do Per&iacute;odo</strong></td><td><strong>${consumo} kWh</strong></td><td>&mdash;</td></tr>
        </tbody>
      </table>

      <div class="section-title">Detalhe de Encargos</div>
      <table class="data-table">
        <thead><tr><th>Descri&ccedil;&atilde;o</th><th>Qtd.</th><th>Tarifa (MZN)</th><th>Valor (MZN)</th></tr></thead>
        <tbody>
          <tr><td>Energia Activa Consumida</td><td>${consumo} kWh</td><td>${tarifaKwh.toFixed(2)}/kWh</td><td>${fmt(energiaAtiva)}</td></tr>
          <tr><td>Taxa de Disponibilidade de Rede</td><td>&mdash;</td><td>&mdash;</td><td>${fmt(taxaDisponib)}</td></tr>
          <tr><td>Taxa de R&aacute;dio e Televis&atilde;o (Decreto 27/2009)</td><td>&mdash;</td><td>&mdash;</td><td>${fmt(taxaRadioTV)}</td></tr>
          <tr><td>Sub-Total (sem IVA)</td><td>&mdash;</td><td>&mdash;</td><td>${fmt(subtotal)}</td></tr>
          <tr><td>IVA (16%)</td><td>&mdash;</td><td>&mdash;</td><td>${fmt(iva)}</td></tr>
          <tr class="row-total"><td colspan="3"><strong>TOTAL A PAGAR</strong></td><td><strong>${fmt(total)} MZN</strong></td></tr>
        </tbody>
      </table>
      <div class="alert-box">&#9888; Data limite de pagamento: <strong>${esc(dueDate)}</strong>. Ap&oacute;s esta data ser&aacute; cobrada multa de 2% sobre o valor em d&iacute;vida por m&ecirc;s de atraso.</div>
      ${evnFooter()}
    </div>

    <div class="page page-break">
      ${evnHeader("Anexo I &mdash; Instru&ccedil;&otilde;es de Pagamento")}
      <div class="doc-title" style="font-size:18px;">Refer&ecirc;ncia de Pagamento</div>
      <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;padding:24px;text-align:center;margin:20px 0;">
        <div style="font-size:12px;color:#92400e;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Refer&ecirc;ncia ATM / e-Metical / Balc&atilde;o EVN</div>
        <div style="font-size:40px;font-weight:900;color:#f97316;letter-spacing:4px;margin:8px 0;">${esc(payRef)}</div>
        <div style="font-size:14px;font-weight:700;color:#ea580c;">Entidade: <strong>900900</strong> &nbsp;|&nbsp; Valor: <strong>${fmt(total)} MZN</strong></div>
      </div>

      <div class="section-title">Canais de Pagamento Dispon&iacute;veis</div>
      <div class="info-grid">
        <div class="info-cell"><div class="info-label">M-Pesa</div><div class="info-value" style="font-size:12px;">Marque *150# &rarr; Pagamentos &rarr; Credelec/EVN &rarr; Entidade 900900</div></div>
        <div class="info-cell"><div class="info-label">e-Metical</div><div class="info-value" style="font-size:12px;">App e-Metical &rarr; Servi&ccedil;os &rarr; EVN &rarr; inserir refer&ecirc;ncia</div></div>
        <div class="info-cell"><div class="info-label">Millennium BIM / BCI</div><div class="info-value" style="font-size:12px;">NIB: 0001 0000 0000 1234 5678 9 &mdash; indicar n.&ordm; de fatura</div></div>
        <div class="info-cell"><div class="info-label">Balc&atilde;o EVN (Presencial)</div><div class="info-value" style="font-size:12px;">Av. 25 de Setembro, 1500 &mdash; Maputo (Seg a Sex, 08h&ndash;16h)</div></div>
      </div>

      <div class="section-title">Hist&oacute;rico de Consumo (6 Meses)</div>
      <table class="data-table">
        <thead><tr><th>M&ecirc;s</th><th>Consumo (kWh)</th><th>Valor (MZN)</th><th>Estado</th></tr></thead>
        <tbody>
          <tr><td>Janeiro 2026</td><td>340</td><td>2.380,00</td><td style="color:#16a34a;font-weight:700;">&#10003; Pago</td></tr>
          <tr><td>Fevereiro 2026</td><td>410</td><td>2.870,00</td><td style="color:#16a34a;font-weight:700;">&#10003; Pago</td></tr>
          <tr><td>Mar&ccedil;o 2026</td><td>380</td><td>2.660,00</td><td style="color:#16a34a;font-weight:700;">&#10003; Pago</td></tr>
          <tr><td>Abril 2026</td><td>290</td><td>2.030,00</td><td style="color:#16a34a;font-weight:700;">&#10003; Pago</td></tr>
          <tr><td>Maio 2026</td><td>${consumo}</td><td>${fmt(total)}</td><td style="color:#f97316;font-weight:700;">&#8987; Em aberto</td></tr>
        </tbody>
      </table>

      <div class="info-box">&#128222; Para reclama&ccedil;&otilde;es ou esclarecimentos, contacte a Linha EVN: <strong>800 203 333</strong> (gratuita) ou <strong>cliente@evn.co.mz</strong></div>
      ${evnFooter()}
    </div>`;
}

function generateEdital(filename: string): string {
  const ref = filename.replace(/\.pdf$/i, "");
  const date = new Date().toLocaleDateString("pt-MZ");
  const isEng = /eng/i.test(ref);

  const position = isEng
    ? "Engenheiro(a) Eletrot&eacute;cnico(a) S&eacute;nior"
    : "T&eacute;cnico(a) de Redes El&eacute;tricas";
  const department = isEng
    ? "Direc&ccedil;&atilde;o de Engenharia e Projetos"
    : "Direc&ccedil;&atilde;o de Opera&ccedil;&otilde;es e Manuten&ccedil;&atilde;o";
  const level = isEng
    ? "N&iacute;vel S&eacute;nior &mdash; Dedica&ccedil;&atilde;o exclusiva"
    : "N&iacute;vel T&eacute;cnico &mdash; Regime de turnos";
  const salary = isEng ? "95.000 &ndash; 140.000 MZN" : "45.000 &ndash; 65.000 MZN";

  const requirements = isEng
    ? [
        "Licenciatura ou Mestrado em Engenharia Eletrot&eacute;cnica (m&iacute;nimo 14 valores)",
        "Inscri&ccedil;&atilde;o v&aacute;lida na Ordem dos Engenheiros de Mo&ccedil;ambique (OEM)",
        "M&iacute;nimo de 5 anos de experi&ecirc;ncia comprovada em redes de distribui&ccedil;&atilde;o de energia",
        "Dom&iacute;nio de AutoCAD Electrical, ETAP ou software equivalente",
        "Experi&ecirc;ncia em projetos de Alta e M&eacute;dia Tens&atilde;o (AT/MT)",
        "Carta de condu&ccedil;&atilde;o v&aacute;lida &mdash; Categoria B",
        "Disponibilidade para desloca&ccedil;&otilde;es provinciais",
        "N&iacute;vel B2 de Ingl&ecirc;s (certificado valorizado)",
      ]
    : [
        "Bacharelato ou Licenciatura em Eletrotecnia ou Electr&oacute;nica Industrial",
        "Habilita&ccedil;&atilde;o para Trabalhos em Tens&atilde;o (HTT) em vigor",
        "M&iacute;nimo de 2 anos de experi&ecirc;ncia em instala&ccedil;&otilde;es el&eacute;tricas de baixa tens&atilde;o",
        "Conhecimento das normas NP EN 60364 e OHNE",
        "Carta de condu&ccedil;&atilde;o v&aacute;lida &mdash; Categoria B",
        "Disponibilidade para trabalhar em regime de turnos e chamadas de emerg&ecirc;ncia",
      ];

  const duties = isEng
    ? [
        "Elabora&ccedil;&atilde;o de estudos de viabilidade e anteprojetos de redes MT/BT",
        "Supervis&atilde;o de empreitadas de constru&ccedil;&atilde;o e reabilita&ccedil;&atilde;o de linhas el&eacute;tricas",
        "An&aacute;lise de falhas e proposta de solu&ccedil;&otilde;es de melhoria de fiabilidade",
        "Coordena&ccedil;&atilde;o com autarquias e entidades p&uacute;blicas para aprova&ccedil;&atilde;o de tra&ccedil;ados",
        "Elabora&ccedil;&atilde;o de relat&oacute;rios t&eacute;cnicos e mem&oacute;rias descritivas",
      ]
    : [
        "Interven&ccedil;&atilde;o em avarias da rede de distribui&ccedil;&atilde;o de baixa tens&atilde;o",
        "Execu&ccedil;&atilde;o de liga&ccedil;&otilde;es, cortes e reposi&ccedil;&otilde;es de fornecimento",
        "Leitura e substitui&ccedil;&atilde;o de contadores e equipamentos de medi&ccedil;&atilde;o",
        "Registo e reporte de ocorr&ecirc;ncias no sistema de gest&atilde;o EVN",
        "Participa&ccedil;&atilde;o em campanhas de dete&ccedil;&atilde;o de fraudes e liga&ccedil;&otilde;es ilegais",
      ];

  return `
    <div class="page">
      ${evnHeader(department)}
      <div class="doc-title">Edital de Recrutamento P&uacute;blico</div>
      <div class="badge">&#128203; REF: ${esc(ref)} &mdash; CONCURSO ABERTO</div>
      <div class="meta-box">
        <strong>Data de Publica&ccedil;&atilde;o:</strong> ${esc(date)} &nbsp;|&nbsp;
        <strong>Prazo de Candidatura:</strong> 30 dias corridos &nbsp;|&nbsp;
        <strong>Modalidade:</strong> Contrato a Termo Incerto com possibilidade de Efectiva&ccedil;&atilde;o
      </div>
      <div style="text-align:center;background:linear-gradient(135deg,#fff7ed,#fffbeb);border:1px solid #fed7aa;border-radius:12px;padding:32px;margin:24px 0;">
        <div style="font-size:12px;font-weight:800;color:#92400e;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;">Vaga Dispon&iacute;vel</div>
        <div style="font-size:24px;font-weight:900;color:#ea580c;margin-bottom:8px;">${position}</div>
        <div style="font-size:14px;color:#78350f;font-weight:600;">${department} &nbsp;&middot;&nbsp; ${level}</div>
      </div>

      <div class="section-title">Descri&ccedil;&atilde;o da Fun&ccedil;&atilde;o</div>
      <ul>${duties.map(d => `<li>${d}</li>`).join("")}</ul>

      <div class="section-title">Requisitos Obrigat&oacute;rios</div>
      <ul>${requirements.map(r => `<li>${r}</li>`).join("")}</ul>
      ${evnFooter()}
    </div>

    <div class="page page-break">
      ${evnHeader(`Edital ${esc(ref)} &mdash; Candidatura e Condi&ccedil;&otilde;es`)}
      <div class="section-title">Documentos a Submeter</div>
      <ol>
        <li>Curriculum Vitae actualizado (m&aacute;ximo 4 p&aacute;ginas), formato PDF</li>
        <li>Carta de Motiva&ccedil;&atilde;o (m&aacute;ximo 1 p&aacute;gina), dirigida &agrave; Dire&ccedil;&atilde;o de RH da EVN</li>
        <li>C&oacute;pia autenticada do(s) certificado(s) acad&eacute;mico(s)</li>
        <li>C&oacute;pia do Bilhete de Identidade ou DIRE em validade</li>
        <li>C&oacute;pia da Carta de Condu&ccedil;&atilde;o (quando aplic&aacute;vel)</li>
        <li>Comprovativos de experi&ecirc;ncia profissional (declara&ccedil;&otilde;es de empregadores anteriores)</li>
        ${isEng
          ? "<li>Certificado de Inscri&ccedil;&atilde;o na OEM (Ordem dos Engenheiros de Mo&ccedil;ambique)</li>"
          : "<li>Certificado HTT v&aacute;lido (quando aplic&aacute;vel)</li>"
        }
      </ol>

      <div class="section-title">Processo de Candidatura</div>
      <p>As candidaturas devem ser enviadas <strong>exclusivamente por e-mail</strong> para <strong>recrutamento@evn.co.mz</strong>, com o assunto: <em>&ldquo;Candidatura &mdash; ${esc(ref)} &mdash; [Nome Completo]&rdquo;</em>.</p>
      <p>Candidaturas incompletas ou fora do prazo n&atilde;o ser&atilde;o consideradas. A EVN reserva-se o direito de convocar apenas os candidatos que melhor correspondam ao perfil definido.</p>
      <div class="info-box">O processo inclui: triagem curricular &rarr; entrevista t&eacute;cnica &rarr; avalia&ccedil;&atilde;o psicot&eacute;cnica &rarr; proposta de contrata&ccedil;&atilde;o. Dura&ccedil;&atilde;o estimada: 45 dias &uacute;teis.</div>

      <div class="section-title">Remunera&ccedil;&atilde;o e Benef&iacute;cios</div>
      <div class="info-grid">
        <div class="info-cell"><div class="info-label">Sal&aacute;rio Base</div><div class="info-value">${salary}</div></div>
        <div class="info-cell"><div class="info-label">Seguro de Sa&uacute;de</div><div class="info-value">Plano EVN (titular + fam&iacute;lia)</div></div>
        <div class="info-cell"><div class="info-label">Subsídio de Campo/Turno</div><div class="info-value">${isEng ? "Incluído" : "Aplicável"}</div></div>
        <div class="info-cell"><div class="info-label">Viatura / Ajudas de Custo</div><div class="info-value">${isEng ? "Viatura de servi&ccedil;o" : "Ajudas de custo por desloca&ccedil;&atilde;o"}</div></div>
      </div>

      <div class="signature-row">
        <div class="signature-block"><div class="signature-line">A Dire&ccedil;&atilde;o de Recursos Humanos<br/>Eletricidade Vantara Nacional, E.P.</div></div>
        <div class="signature-block"><div class="signature-line">Data e Carimbo Oficial</div></div>
      </div>
      ${evnFooter()}
    </div>`;
}

function generateFormulario(filename: string): string {
  const date = new Date().toLocaleDateString("pt-MZ");
  if (/titular/i.test(filename)) return generateMudancaTitularidade(filename, date);
  if (/vistoria/i.test(filename)) return generatePedidoVistoria(filename, date);
  return generateNovaLigacaoForm(filename, date);
}

function generateMudancaTitularidade(filename: string, date: string): string {
  return `
    <div class="page">
      ${evnHeader("Direc&ccedil;&atilde;o Comercial &mdash; Formul&aacute;rio Oficial")}
      <div class="doc-title">Formul&aacute;rio de Mudan&ccedil;a de Titularidade</div>
      <div class="badge">&#128196; FORM-MT-001 &mdash; USE LETRAS MAI&Uacute;SCULAS</div>
      <div class="meta-box">Data: ${esc(date)} &nbsp;|&nbsp; Formul&aacute;rio: ${esc(filename)} &nbsp;|&nbsp; N.&ordm; Processo (uso interno): _______________</div>

      <div class="section-title">Sec&ccedil;&atilde;o A &mdash; Dados do Titular Actual (Cedente)</div>
      <div class="field-group"><span class="field-label">Nome Completo / Designa&ccedil;&atilde;o Social</span><span class="field-line"></span></div>
      <div class="info-grid">
        <div class="field-group"><span class="field-label">NUIT</span><span class="field-line"></span></div>
        <div class="field-group"><span class="field-label">BI / DIRE / Passaporte N.&ordm;</span><span class="field-line"></span></div>
      </div>
      <div class="field-group"><span class="field-label">Endere&ccedil;o (Prov&iacute;ncia, Cidade, Bairro, Rua)</span><span class="field-line"></span><span class="field-line" style="margin-top:-8px;"></span></div>
      <div class="info-grid">
        <div class="field-group"><span class="field-label">Telemo&oacute;vel</span><span class="field-line"></span></div>
        <div class="field-group"><span class="field-label">Email</span><span class="field-line"></span></div>
      </div>

      <div class="section-title">Sec&ccedil;&atilde;o B &mdash; Dados do Novo Titular (Cess&iacute;on&aacute;rio)</div>
      <div class="field-group"><span class="field-label">Nome Completo / Designa&ccedil;&atilde;o Social</span><span class="field-line"></span></div>
      <div class="info-grid">
        <div class="field-group"><span class="field-label">NUIT</span><span class="field-line"></span></div>
        <div class="field-group"><span class="field-label">BI / DIRE / Passaporte N.&ordm;</span><span class="field-line"></span></div>
      </div>
      <div class="info-grid">
        <div class="field-group"><span class="field-label">Telemo&oacute;vel</span><span class="field-line"></span></div>
        <div class="field-group"><span class="field-label">Email</span><span class="field-line"></span></div>
      </div>

      <div class="section-title">Sec&ccedil;&atilde;o C &mdash; Instala&ccedil;&atilde;o em Causa</div>
      <div class="info-grid">
        <div class="field-group"><span class="field-label">N.&ordm; do Contrato EVN</span><span class="field-line"></span></div>
        <div class="field-group"><span class="field-label">N.&ordm; do Contador</span><span class="field-line"></span></div>
      </div>
      <div class="field-group"><span class="field-label">Endere&ccedil;o Exacto da Instala&ccedil;&atilde;o</span><span class="field-line"></span></div>
      ${evnFooter()}
    </div>

    <div class="page page-break">
      ${evnHeader("Mudan&ccedil;a de Titularidade &mdash; Continua&ccedil;&atilde;o")}
      <div class="section-title">Sec&ccedil;&atilde;o D &mdash; Motivo da Transfer&ecirc;ncia (assinale com X)</div>
      <table class="data-table">
        <tbody>
          <tr><td style="width:40px;">[ ]</td><td>Venda / Compra do im&oacute;vel</td></tr>
          <tr><td>[ ]</td><td>Heran&ccedil;a / Sucess&atilde;o</td></tr>
          <tr><td>[ ]</td><td>Doa&ccedil;&atilde;o do im&oacute;vel</td></tr>
          <tr><td>[ ]</td><td>Arrendamento de longa dura&ccedil;&atilde;o (superior a 2 anos)</td></tr>
          <tr><td>[ ]</td><td>Outro: _________________________________________________</td></tr>
        </tbody>
      </table>

      <div class="section-title">Sec&ccedil;&atilde;o E &mdash; Documentos em Anexo (obrigat&oacute;rio)</div>
      <ol>
        <li>C&oacute;pia do documento de identifica&ccedil;&atilde;o de ambas as partes (BI / DIRE / Passaporte)</li>
        <li>C&oacute;pia autenticada do t&iacute;tulo de propriedade ou escritura de compra e venda</li>
        <li>&Uacute;ltima fatura EVN em nome do titular actual, com saldo zero (sem d&iacute;vidas)</li>
        <li>Comprovativo de pagamento da taxa de mudan&ccedil;a de titularidade (1.200 MZN)</li>
      </ol>

      <div class="section-title">Sec&ccedil;&atilde;o F &mdash; Declara&ccedil;&atilde;o e Assinaturas</div>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;font-size:12px;color:#475569;">Ambas as partes declaram que as informa&ccedil;&otilde;es prestadas s&atilde;o verdadeiras e que a transfer&ecirc;ncia de titularidade &eacute; efectuada de forma livre e consensual. O novo titular aceita todas as condi&ccedil;&otilde;es gerais do Contrato de Fornecimento de Energia El&eacute;ctrica da EVN.</p>
      </div>
      <div class="signature-row">
        <div class="signature-block"><div class="signature-line">Assinatura do Titular Actual (Cedente)<br/>Data: _______________</div></div>
        <div class="signature-block"><div class="signature-line">Assinatura do Novo Titular (Cess&iacute;on&aacute;rio)<br/>Data: _______________</div></div>
      </div>
      <div class="signature-row" style="margin-top:40px;">
        <div class="signature-block"><div class="signature-line">Validado por (Funcion&aacute;rio EVN)<br/>N.&ordm; Funcion&aacute;rio: _______________</div></div>
        <div class="signature-block"><div class="signature-line">Carimbo e Data EVN</div></div>
      </div>
      ${evnFooter()}
    </div>`;
}

function generatePedidoVistoria(filename: string, date: string): string {
  return `
    <div class="page">
      ${evnHeader("Direc&ccedil;&atilde;o T&eacute;cnica &mdash; Formul&aacute;rio Oficial")}
      <div class="doc-title">Pedido de Vistoria T&eacute;cnica</div>
      <div class="badge">&#128203; FORM-VT-002 &mdash; USE LETRAS MAI&Uacute;SCULAS</div>
      <div class="meta-box">Data: ${esc(date)} &nbsp;|&nbsp; Formul&aacute;rio: ${esc(filename)} &nbsp;|&nbsp; N.&ordm; Processo: _______________</div>

      <div class="section-title">Sec&ccedil;&atilde;o A &mdash; Dados do Requerente</div>
      <div class="field-group"><span class="field-label">Nome Completo / Designa&ccedil;&atilde;o Social</span><span class="field-line"></span></div>
      <div class="info-grid">
        <div class="field-group"><span class="field-label">NUIT</span><span class="field-line"></span></div>
        <div class="field-group"><span class="field-label">BI / DIRE / Passaporte N.&ordm;</span><span class="field-line"></span></div>
      </div>
      <div class="info-grid">
        <div class="field-group"><span class="field-label">Telemo&oacute;vel Principal</span><span class="field-line"></span></div>
        <div class="field-group"><span class="field-label">Email</span><span class="field-line"></span></div>
      </div>

      <div class="section-title">Sec&ccedil;&atilde;o B &mdash; Dados da Instala&ccedil;&atilde;o a Vistoriar</div>
      <div class="field-group"><span class="field-label">Endere&ccedil;o Completo (Prov&iacute;ncia, Cidade, Bairro, Rua, N.&ordm;)</span><span class="field-line"></span><span class="field-line" style="margin-top:-8px;"></span></div>
      <div class="info-grid">
        <div class="field-group">
          <span class="field-label">Tipo de Instala&ccedil;&atilde;o</span>
          <p style="font-size:12px;margin:4px 0;">[ ] Residencial &nbsp;&nbsp; [ ] Comercial &nbsp;&nbsp; [ ] Industrial &nbsp;&nbsp; [ ] Servi&ccedil;os P&uacute;blicos</p>
        </div>
        <div class="field-group"><span class="field-label">Pot&ecirc;ncia Solicitada (kVA)</span><span class="field-line"></span></div>
      </div>

      <div class="section-title">Sec&ccedil;&atilde;o C &mdash; Motivo do Pedido (assinale com X)</div>
      <table class="data-table">
        <tbody>
          <tr><td style="width:40px;">[ ]</td><td>Nova liga&ccedil;&atilde;o &agrave; rede el&eacute;trica</td></tr>
          <tr><td>[ ]</td><td>Aumento de pot&ecirc;ncia contratada</td></tr>
          <tr><td>[ ]</td><td>Verifica&ccedil;&atilde;o ap&oacute;s obras de remodelar&ccedil;&atilde;o</td></tr>
          <tr><td>[ ]</td><td>Regulariza&ccedil;&atilde;o de liga&ccedil;&atilde;o existente</td></tr>
          <tr><td>[ ]</td><td>Outro: _________________________________________________</td></tr>
        </tbody>
      </table>

      <div class="section-title">Sec&ccedil;&atilde;o D &mdash; Descri&ccedil;&atilde;o do Pedido</div>
      <div class="field-group"><span class="field-label">Descreva detalhadamente a sua situa&ccedil;&atilde;o</span><span class="field-line"></span><span class="field-line" style="margin-top:-8px;"></span><span class="field-line" style="margin-top:-8px;"></span></div>
      ${evnFooter()}
    </div>

    <div class="page page-break">
      ${evnHeader("Pedido de Vistoria T&eacute;cnica &mdash; Continua&ccedil;&atilde;o")}
      <div class="section-title">Sec&ccedil;&atilde;o E &mdash; Documentos em Anexo</div>
      <ol>
        <li>C&oacute;pia do documento de identifica&ccedil;&atilde;o do requerente</li>
        <li>T&iacute;tulo de ocupa&ccedil;&atilde;o / propriedade do im&oacute;vel (DUAT, escritura, etc.)</li>
        <li>Planta ou croquis da instala&ccedil;&atilde;o el&eacute;trica interna (quando dispon&iacute;vel)</li>
        <li>Termo de Responsabilidade assinado por T&eacute;cnico Habilitado (obrigat&oacute;rio para pot&ecirc;ncias &ge; 10 kVA)</li>
        <li>Licen&ccedil;a de constru&ccedil;&atilde;o ou de funcionamento (conforme aplic&aacute;vel)</li>
      </ol>

      <div class="section-title">Sec&ccedil;&atilde;o F &mdash; Disponibilidade para Vistoria</div>
      <div class="info-grid">
        <div class="field-group">
          <span class="field-label">Per&iacute;odo preferencial</span>
          <p style="font-size:12px;margin:4px 0;">[ ] Manh&atilde; (08h&ndash;12h) &nbsp;&nbsp; [ ] Tarde (12h&ndash;16h)</p>
        </div>
        <div class="field-group">
          <span class="field-label">Dias dispon&iacute;veis</span>
          <p style="font-size:12px;margin:4px 0;">[ ] Seg &nbsp; [ ] Ter &nbsp; [ ] Qua &nbsp; [ ] Qui &nbsp; [ ] Sex</p>
        </div>
      </div>
      <div class="field-group"><span class="field-label">Contacto para Agendamento</span><span class="field-line"></span></div>
      <div class="info-box">&#128222; O prazo de resposta da EVN ap&oacute;s recep&ccedil;&atilde;o do processo completo &eacute; de <strong>10 dias &uacute;teis</strong>. Ser&aacute; contactado pela nossa equipa para confirmar a data e hora da vistoria.</div>

      <div class="section-title">Sec&ccedil;&atilde;o G &mdash; Declara&ccedil;&atilde;o</div>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;font-size:12px;color:#475569;">Declaro que as informa&ccedil;&otilde;es constantes neste formul&aacute;rio s&atilde;o verdadeiras e autorizo a entrada de t&eacute;cnicos da EVN nas instala&ccedil;&otilde;es para realiza&ccedil;&atilde;o da vistoria t&eacute;cnica, em data e hora a acordar.</p>
      </div>
      <div class="signature-row">
        <div class="signature-block"><div class="signature-line">Assinatura do Requerente<br/>Data: _______________</div></div>
        <div class="signature-block"><div class="signature-line">Recep&ccedil;&atilde;o EVN (Carimbo)<br/>Data: _______________</div></div>
      </div>
      ${evnFooter()}
    </div>`;
}

function generateNovaLigacaoForm(filename: string, date: string): string {
  return `
    <div class="page">
      ${evnHeader("Direc&ccedil;&atilde;o Comercial &mdash; Nova Liga&ccedil;&atilde;o")}
      <div class="doc-title">Formul&aacute;rio de Nova Liga&ccedil;&atilde;o &agrave; Rede El&eacute;ctrica</div>
      <div class="badge">&#128196; FORM-NL-003 &mdash; USE LETRAS MAI&Uacute;SCULAS</div>
      <div class="meta-box">Data: ${esc(date)} &nbsp;|&nbsp; Formul&aacute;rio: ${esc(filename)} &nbsp;|&nbsp; N.&ordm; Processo: _______________</div>

      <div class="section-title">Sec&ccedil;&atilde;o A &mdash; Identifica&ccedil;&atilde;o do Requerente</div>
      <div class="field-group"><span class="field-label">Nome Completo / Denomina&ccedil;&atilde;o Social</span><span class="field-line"></span></div>
      <div class="info-grid">
        <div class="field-group"><span class="field-label">NUIT</span><span class="field-line"></span></div>
        <div class="field-group"><span class="field-label">BI / DIRE / Passaporte N.&ordm;</span><span class="field-line"></span></div>
      </div>
      <div class="field-group"><span class="field-label">Endere&ccedil;o do Requerente (Resid&ecirc;ncia / Sede)</span><span class="field-line"></span></div>
      <div class="info-grid">
        <div class="field-group"><span class="field-label">Telemo&oacute;vel</span><span class="field-line"></span></div>
        <div class="field-group"><span class="field-label">Email</span><span class="field-line"></span></div>
      </div>

      <div class="section-title">Sec&ccedil;&atilde;o B &mdash; Localiza&ccedil;&atilde;o e Tipo de Instala&ccedil;&atilde;o</div>
      <div class="field-group"><span class="field-label">Endere&ccedil;o Exacto da Nova Liga&ccedil;&atilde;o (Prov&iacute;ncia, Cidade, Bairro, Rua, N.&ordm;)</span><span class="field-line"></span><span class="field-line" style="margin-top:-8px;"></span></div>
      <div class="info-grid">
        <div class="field-group">
          <span class="field-label">Tipo de Uso</span>
          <p style="font-size:12px;margin:4px 0;">[ ] Residencial &nbsp;&nbsp; [ ] Comercial &nbsp;&nbsp; [ ] Industrial</p>
        </div>
        <div class="field-group">
          <span class="field-label">Tipo de Liga&ccedil;&atilde;o</span>
          <p style="font-size:12px;margin:4px 0;">[ ] Monof&aacute;sica (1F) &nbsp;&nbsp; [ ] Trif&aacute;sica (3F)</p>
        </div>
      </div>
      <div class="info-grid">
        <div class="field-group"><span class="field-label">Pot&ecirc;ncia Solicitada (kVA)</span><span class="field-line"></span></div>
        <div class="field-group">
          <span class="field-label">Tens&atilde;o Nominal</span>
          <p style="font-size:12px;margin:4px 0;">[ ] 220V &nbsp;&nbsp; [ ] 380V</p>
        </div>
      </div>
      ${evnFooter()}
    </div>

    <div class="page page-break">
      ${evnHeader("Formul&aacute;rio de Nova Liga&ccedil;&atilde;o &mdash; Continua&ccedil;&atilde;o")}
      <div class="section-title">Sec&ccedil;&atilde;o C &mdash; Equipamentos e Cargas Previstas</div>
      <table class="data-table">
        <thead><tr><th>Equipamento / Aparelho</th><th>Qtd.</th><th>Pot&ecirc;ncia Unit&aacute;ria (W)</th><th>Horas de Uso/Dia</th></tr></thead>
        <tbody>
          <tr><td>Ilumina&ccedil;&atilde;o (l&acirc;mpadas)</td><td></td><td></td><td></td></tr>
          <tr><td>Frigor&iacute;fico / Congelador</td><td></td><td></td><td></td></tr>
          <tr><td>Ar Condicionado</td><td></td><td></td><td></td></tr>
          <tr><td>Bomba de &Aacute;gua</td><td></td><td></td><td></td></tr>
          <tr><td>TV / Computador / Modem</td><td></td><td></td><td></td></tr>
          <tr><td>Outros equipamentos</td><td></td><td></td><td></td></tr>
        </tbody>
      </table>

      <div class="section-title">Sec&ccedil;&atilde;o D &mdash; Documentos Obrigat&oacute;rios em Anexo</div>
      <ol>
        <li>C&oacute;pia do documento de identifica&ccedil;&atilde;o (BI / DIRE / Passaporte)</li>
        <li>Prova de propriedade ou de ocupa&ccedil;&atilde;o leg&iacute;tima do im&oacute;vel (DUAT, escritura, contrato de arrendamento)</li>
        <li>Planta esquem&aacute;tica da instala&ccedil;&atilde;o el&eacute;trica interna</li>
        <li>Termo de Responsabilidade assinado por T&eacute;cnico Habilitado (obrigat&oacute;rio)</li>
        <li>Comprovativo de pagamento da taxa de liga&ccedil;&atilde;o EVN (valor indicado no or&ccedil;amento)</li>
      </ol>

      <div class="section-title">Sec&ccedil;&atilde;o E &mdash; Taxas e Prazos</div>
      <div class="info-grid">
        <div class="info-cell"><div class="info-label">Taxa de Liga&ccedil;&atilde;o (Estimativa)</div><div class="info-value">3.500 &ndash; 15.000 MZN</div></div>
        <div class="info-cell"><div class="info-label">Prazo de Execu&ccedil;&atilde;o</div><div class="info-value">15 a 45 dias &uacute;teis ap&oacute;s aprova&ccedil;&atilde;o</div></div>
      </div>

      <div class="section-title">Sec&ccedil;&atilde;o F &mdash; Declara&ccedil;&atilde;o</div>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;font-size:12px;color:#475569;">Declaro que todas as informa&ccedil;&otilde;es prestadas s&atilde;o verdadeiras e que a instala&ccedil;&atilde;o interna respeita as normas t&eacute;cnicas e de seguran&ccedil;a aplic&aacute;veis. Comprometo-me a cumprir as condi&ccedil;&otilde;es gerais do Contrato de Fornecimento de Energia El&eacute;ctrica da Eletricidade Vantara Nacional, E.P.</p>
      </div>
      <div class="signature-row">
        <div class="signature-block"><div class="signature-line">Assinatura do Requerente<br/>Data: _______________</div></div>
        <div class="signature-block"><div class="signature-line">Recep&ccedil;&atilde;o EVN (Carimbo)<br/>Data: _______________</div></div>
      </div>
      ${evnFooter()}
    </div>`;
}

export type DocType = "FATURA" | "EDITAL" | "FORMULARIO";

export function triggerDownload(filename: string, docType: DocType): void {
  const content =
    docType === "FATURA" ? generateFatura(filename)
    : docType === "EDITAL" ? generateEdital(filename)
    : generateFormulario(filename);

  const html = `<!DOCTYPE html><html lang="pt"><head><meta charset="UTF-8"><title>${esc(filename)}</title><style>${pdfStyles()}</style></head><body>${content}</body></html>`;

  // window.open MUST be called synchronously inside an onClick handler
  // (not in a promise or setTimeout) or Chrome blocks it as a popup.
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) {
    // Popup blocked — fallback: download raw HTML so the user gets something.
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename.replace(/\s+/g, "-")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return;
  }

  w.document.open();
  w.document.write(html);
  w.document.close();

  // Use the new window's own load event to trigger print.
  w.addEventListener("load", () => {
    setTimeout(() => {
      w.focus();
      w.print();
    }, 300);
  });

  // Fallback for when the load event doesn't fire (already loaded).
  setTimeout(() => {
    try { w.focus(); w.print(); } catch { /* window may have been closed */ }
  }, 800);
}
