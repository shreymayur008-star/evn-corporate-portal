import { esc, evnHeader, evnFooter, wrapHtml } from "./pdfShared";

function generateFaturaBody(filename: string): string {
  const invoiceNum = `EVN-2026-${Math.random().toString().slice(2, 10)}`;
  const now = new Date();
  const date = now.toLocaleDateString("pt-MZ");
  const month = now.toLocaleString("pt-MZ", { month: "long" }).toUpperCase();
  const year = now.getFullYear();
  const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 15).toLocaleDateString("pt-MZ");
  const accountNum = `CT-${Math.floor(100000000 + Math.random() * 900000000)}`;
  const meterNum = `CNT-${Math.floor(1000000 + Math.random() * 9000000)}`;
  const payRef = Math.floor(100000000 + Math.random() * 900000000);

  // Consumption (total ~155 kWh → crosses into escalão 2)
  const leitAnterior = 12340 + Math.floor(Math.random() * 1000);
  const consumo = 148 + Math.floor(Math.random() * 20); // 148–168 kWh
  const leitAtual = leitAnterior + consumo;
  const mediaDay = (consumo / 30).toFixed(1);
  const consumoPrev = consumo - 12 + Math.floor(Math.random() * 24); // ± for comparison
  const diffPct = (((consumo - consumoPrev) / consumoPrev) * 100).toFixed(0);
  const diffSign = consumo >= consumoPrev ? "+" : "";

  // Tariff: escalão 1 = 0–100 kWh @ 4.20, escalão 2 = remainder @ 5.85
  const esc1Kwh = 100;
  const esc2Kwh = consumo - 100;
  const tarifa1 = 4.20;
  const tarifa2 = 5.85;
  const esc1Val = esc1Kwh * tarifa1;
  const esc2Val = esc2Kwh * tarifa2;
  const taxaDisponib = 285.00;
  const taxaRadioTV = 50.00;
  const subtotal = esc1Val + esc2Val + taxaDisponib + taxaRadioTV;
  const iva = subtotal * 0.17;
  const total = subtotal + iva;
  const fmt = (n: number) => n.toLocaleString("pt-MZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // 6-month history (simulated)
  const months6 = ["Novembro", "Dezembro", "Janeiro", "Fevereiro", "Mar&ccedil;o", "Abril"].map((m, i) => {
    const c = 100 + Math.floor(Math.random() * 80);
    const v = c * 4.8 + taxaDisponib + taxaRadioTV;
    return { m, c, v: fmt(v + v * 0.17), paid: i < 5 };
  });

  return `
    <div class="page">
      ${evnHeader("Direc&ccedil;&atilde;o Comercial")}
      <div class="doc-title">Fatura Mensal de Consumo El&eacute;ctrico</div>
      <div class="badge">&#9679; FATURA N.&ordm; ${esc(invoiceNum)} &mdash; ${esc(month)} ${esc(year)}</div>
      <div class="meta-box">
        <strong>Emiss&atilde;o:</strong> ${esc(date)} &nbsp;|&nbsp;
        <strong>Vencimento:</strong> ${esc(dueDate)} &nbsp;|&nbsp;
        <strong>Per&iacute;odo:</strong> ${esc(filename)}<br/>
        <strong>Contrato:</strong> ${esc(accountNum)} &nbsp;|&nbsp;
        <strong>Contador:</strong> ${esc(meterNum)} &nbsp;|&nbsp;
        <strong>Zona:</strong> Maputo &mdash; KaMpfumo
      </div>

      <div class="info-grid">
        <div class="info-cell"><div class="info-label">Titular</div><div class="info-value">Cliente EVN Verificado</div></div>
        <div class="info-cell"><div class="info-label">NUIT</div><div class="info-value">192 837 465</div></div>
        <div class="info-cell"><div class="info-label">Endere&ccedil;o de Fornecimento</div><div class="info-value">Av. Eduardo Mondlane, 256 &mdash; Maputo</div></div>
        <div class="info-cell"><div class="info-label">Tipo de Conta / Tarifa</div><div class="info-value">Dom&eacute;stico Tipo B &mdash; 220V Monof&aacute;sico<br/><span style="font-size:11px;color:#94a3b8;">Tarifa Social Escal&atilde;o 2 (101&ndash;200 kWh)</span></div></div>
      </div>

      <div class="section-title">Leituras do Contador</div>
      <table class="data-table">
        <thead><tr><th>Descri&ccedil;&atilde;o</th><th style="text-align:right;">Leitura (kWh)</th><th>Data</th></tr></thead>
        <tbody>
          <tr><td>Leitura Anterior</td><td style="text-align:right;">${leitAnterior.toLocaleString("pt-MZ")}</td><td>${new Date(now.getFullYear(), now.getMonth() - 1, 28).toLocaleDateString("pt-MZ")}</td></tr>
          <tr><td>Leitura Actual</td><td style="text-align:right;">${leitAtual.toLocaleString("pt-MZ")}</td><td>${esc(date)}</td></tr>
          <tr><td><strong>Consumo do Per&iacute;odo</strong></td><td style="text-align:right;"><strong>${consumo} kWh</strong></td><td>&mdash;</td></tr>
          <tr><td>Consumo M&eacute;dio Di&aacute;rio</td><td style="text-align:right;">${mediaDay} kWh/dia</td><td>Per&iacute;odo: 30 dias</td></tr>
          <tr><td>Compara&ccedil;&atilde;o M&ecirc;s Anterior (${consumoPrev} kWh)</td><td style="text-align:right;">${diffSign}${diffPct}%</td><td>&mdash;</td></tr>
        </tbody>
      </table>

      <div class="section-title">Detalhe de Encargos</div>
      <table class="data-table">
        <thead><tr><th>Rubrica</th><th style="text-align:right;">kWh / Unid.</th><th style="text-align:right;">Tarifa MZN</th><th style="text-align:right;">Total MZN</th></tr></thead>
        <tbody>
          <tr><td>Energia Activa &mdash; Escal&atilde;o 1 (0&ndash;100 kWh)</td><td style="text-align:right;">${esc1Kwh}</td><td style="text-align:right;">${tarifa1.toFixed(2)}/kWh</td><td style="text-align:right;">${fmt(esc1Val)}</td></tr>
          <tr><td>Energia Activa &mdash; Escal&atilde;o 2 (101+ kWh)</td><td style="text-align:right;">${esc2Kwh}</td><td style="text-align:right;">${tarifa2.toFixed(2)}/kWh</td><td style="text-align:right;">${fmt(esc2Val)}</td></tr>
          <tr><td>Taxa de Disponibilidade (Pot&ecirc;ncia 3,45 kVA)</td><td style="text-align:right;">1 m&ecirc;s</td><td style="text-align:right;">285,00</td><td style="text-align:right;">${fmt(taxaDisponib)}</td></tr>
          <tr><td>Taxa de R&aacute;dio e Televis&atilde;o (Decreto 27/2009)</td><td style="text-align:right;">&mdash;</td><td style="text-align:right;">&mdash;</td><td style="text-align:right;">${fmt(taxaRadioTV)}</td></tr>
          <tr><td><strong>Subtotal sem impostos</strong></td><td>&mdash;</td><td>&mdash;</td><td style="text-align:right;"><strong>${fmt(subtotal)}</strong></td></tr>
          <tr><td>IVA 17%</td><td>&mdash;</td><td>&mdash;</td><td style="text-align:right;">${fmt(iva)}</td></tr>
          <tr class="row-total"><td colspan="3"><strong>TOTAL A PAGAR</strong></td><td style="text-align:right;"><strong>${fmt(total)} MZN</strong></td></tr>
        </tbody>
      </table>
      <div class="alert-box">&#9888; Data limite de pagamento: <strong>${esc(dueDate)}</strong>. Ap&oacute;s esta data ser&aacute; cobrada multa de 5% + taxa de reconex&atilde;o de 350 MZN.</div>
      ${evnFooter()}
    </div>

    <div class="page page-break">
      ${evnHeader("Anexo &mdash; Instru&ccedil;&otilde;es de Pagamento")}

      <div class="doc-title" style="font-size:18px;">Refer&ecirc;ncia de Pagamento</div>
      <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;padding:24px;text-align:center;margin:20px 0;">
        <div style="font-size:12px;color:#92400e;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Entidade EVN &mdash; Fatura ${esc(invoiceNum)}</div>
        <div style="font-size:40px;font-weight:900;color:#f97316;letter-spacing:4px;margin:8px 0;">${esc(payRef)}</div>
        <div style="font-size:14px;font-weight:700;color:#ea580c;">Entidade: <strong>900900</strong> &nbsp;|&nbsp; Valor: <strong>${fmt(total)} MZN</strong></div>
      </div>

      <div class="section-title">Canais de Pagamento Dispon&iacute;veis</div>
      <div class="info-grid">
        <div class="info-cell">
          <div class="info-label">M-Pesa</div>
          <div class="info-value" style="font-size:12px;">*150*1455*${payRef}#</div>
        </div>
        <div class="info-cell">
          <div class="info-label">e-Mola</div>
          <div class="info-value" style="font-size:12px;">*111*1455*${payRef}#</div>
        </div>
        <div class="info-cell">
          <div class="info-label">mKesh</div>
          <div class="info-value" style="font-size:12px;">Via app EVN ou agente autorizado</div>
        </div>
        <div class="info-cell">
          <div class="info-label">BIM / Standard Bank</div>
          <div class="info-value" style="font-size:12px;">Transfer&ecirc;ncia NIB: 000901234567890<br/>Ref: ${esc(invoiceNum)}</div>
        </div>
        <div class="info-cell" style="grid-column:span 2;">
          <div class="info-label">Balc&otilde;es EVN Presenciais</div>
          <div class="info-value" style="font-size:12px;">Numerário ou cheque visado &mdash; Av. 25 de Setembro, 1500 Maputo &nbsp;|&nbsp; Seg&ndash;Sex 08h&ndash;16h</div>
        </div>
      </div>

      <div class="section-title">Hist&oacute;rico de Consumo (6 Meses)</div>
      <table class="data-table">
        <thead><tr><th>M&ecirc;s</th><th style="text-align:right;">Consumo (kWh)</th><th style="text-align:right;">Valor (MZN)</th><th>Estado</th></tr></thead>
        <tbody>
          ${months6.map(row => `<tr>
            <td>${row.m} ${year}</td>
            <td style="text-align:right;">${row.c}</td>
            <td style="text-align:right;">${row.v}</td>
            <td style="${row.paid ? "color:#16a34a;font-weight:700;" : "color:#f97316;font-weight:700;"}">${row.paid ? "&#10003; Pago" : "&#8987; Em aberto"}</td>
          </tr>`).join("")}
          <tr><td><strong>${esc(month)} ${esc(year)}</strong></td><td style="text-align:right;"><strong>${consumo}</strong></td><td style="text-align:right;"><strong>${fmt(total)}</strong></td><td style="color:#f97316;font-weight:700;">&#8987; Em aberto</td></tr>
        </tbody>
      </table>

      <div class="info-box">&#128222; Linha EVN (gratuita): <strong>800 203 333</strong> &nbsp;|&nbsp; Email: <strong>cliente@evn.co.mz</strong><br/>Para reclama&ccedil;&otilde;es ou leituras incorrectas, contacte-nos at&eacute; 10 dias ap&oacute;s emiss&atilde;o da fatura.</div>

      <div class="section-title">Notas Legais</div>
      <p style="font-size:11px;color:#94a3b8;">Este documento foi gerado electronicamente pelo Sistema de Gest&atilde;o EVN e &eacute; v&aacute;lido sem assinatura manuscrita (Decreto-Lei n.&ordm; 7/2017 &mdash; Factura Electr&oacute;nica). Em caso de pagamento ap&oacute;s a data de vencimento, a EVN reserva-se o direito de aplicar multa de mora de 5% e cobrar a taxa de reconex&atilde;o (350 MZN) nos termos do Regulamento do Servi&ccedil;o P&uacute;blico de Electricidade.</p>

      <div class="signature-row">
        <div class="signature-block"><div class="signature-line">Eletricidade Vantara Nacional, E.P.<br/>Direc&ccedil;&atilde;o Comercial</div></div>
        <div class="signature-block"><div class="signature-line">Documento v&aacute;lido sem assinatura<br/>${esc(date)}</div></div>
      </div>
      ${evnFooter()}
    </div>`;
}

export function generateInvoiceHtml(filename: string): string {
  return wrapHtml(filename, generateFaturaBody(filename));
}
