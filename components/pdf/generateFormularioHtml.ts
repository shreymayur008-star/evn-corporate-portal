import { esc, evnHeader, evnFooter, wrapHtml } from "./pdfShared";

function generateMudancaTitularidadeBody(filename: string, date: string): string {
  return `
    <div class="page">
      ${evnHeader("Direc&ccedil;&atilde;o Comercial &mdash; Formul&aacute;rio Oficial")}
      <div class="doc-title">Requerimento de Mudan&ccedil;a de Titularidade &mdash; Fornecimento El&eacute;ctrico</div>
      <div class="badge">&#128196; MOD-EVN-MT-003/2026 &mdash; USE LETRAS MAI&Uacute;SCULAS</div>
      <div class="meta-box">
        <strong>Data:</strong> ${esc(date)} &nbsp;|&nbsp; <strong>Formul&aacute;rio:</strong> ${esc(filename)} &nbsp;|&nbsp; <strong>N.&ordm; Processo (uso interno):</strong> _______________<br/>
        <em>Base legal: Regulamento do Servi&ccedil;o P&uacute;blico de Electricidade, Artigo 23.&ordm;</em>
      </div>

      <div class="section-title">Sec&ccedil;&atilde;o A &mdash; Titular Cedente (Actual)</div>
      <div class="field-group"><span class="field-label">Nome Completo / Designa&ccedil;&atilde;o Social</span><span class="field-line"></span></div>
      <div class="info-grid">
        <div class="field-group"><span class="field-label">NUIT</span><span class="field-line"></span></div>
        <div class="field-group"><span class="field-label">BI / DIRE / Passaporte N.&ordm;</span><span class="field-line"></span></div>
      </div>
      <div class="info-grid">
        <div class="field-group"><span class="field-label">Telemo&oacute;vel</span><span class="field-line"></span></div>
        <div class="field-group"><span class="field-label">Email</span><span class="field-line"></span></div>
      </div>
      <div class="field-group"><span class="field-label">Morada (Prov&iacute;ncia, Cidade, Bairro, Rua)</span><span class="field-line"></span><span class="field-line" style="margin-top:-8px;"></span></div>
      <div class="field-group"><span class="field-label">Assinatura do Cedente</span><span class="field-line"></span></div>

      <div class="section-title">Sec&ccedil;&atilde;o B &mdash; Titular Cess&iacute;on&aacute;rio (Novo)</div>
      <div class="field-group"><span class="field-label">Nome Completo / Designa&ccedil;&atilde;o Social</span><span class="field-line"></span></div>
      <div class="info-grid">
        <div class="field-group"><span class="field-label">NUIT</span><span class="field-line"></span></div>
        <div class="field-group"><span class="field-label">BI / DIRE / Passaporte N.&ordm;</span><span class="field-line"></span></div>
      </div>
      <div class="info-grid">
        <div class="field-group"><span class="field-label">Telemo&oacute;vel</span><span class="field-line"></span></div>
        <div class="field-group"><span class="field-label">Email</span><span class="field-line"></span></div>
      </div>
      <div class="field-group"><span class="field-label">Morada (Prov&iacute;ncia, Cidade, Bairro, Rua)</span><span class="field-line"></span><span class="field-line" style="margin-top:-8px;"></span></div>
      <div class="field-group"><span class="field-label">Assinatura do Cess&iacute;on&aacute;rio</span><span class="field-line"></span></div>

      <div class="section-title">Sec&ccedil;&atilde;o C &mdash; Im&oacute;vel / Instala&ccedil;&atilde;o</div>
      <div class="field-group"><span class="field-label">Endere&ccedil;o Completo da Instala&ccedil;&atilde;o</span><span class="field-line"></span><span class="field-line" style="margin-top:-8px;"></span></div>
      <div class="info-grid">
        <div class="field-group">
          <span class="field-label">Tipo de Im&oacute;vel</span>
          <p style="font-size:12px;margin:4px 0;">[ ] Residencial &nbsp;&nbsp; [ ] Comercial &nbsp;&nbsp; [ ] Industrial</p>
        </div>
        <div class="field-group"><span class="field-label">Pot&ecirc;ncia Contratada Actual (kVA)</span><span class="field-line"></span></div>
      </div>
      <div class="info-grid">
        <div class="field-group"><span class="field-label">N.&ordm; do Contador</span><span class="field-line"></span></div>
        <div class="field-group"><span class="field-label">N.&ordm; de Conta EVN</span><span class="field-line"></span></div>
      </div>
      ${evnFooter()}
    </div>

    <div class="page page-break">
      ${evnHeader("MOD-EVN-MT-003/2026 &mdash; Mudan&ccedil;a de Titularidade (Continua&ccedil;&atilde;o)")}

      <div class="section-title">Sec&ccedil;&atilde;o D &mdash; Documentos Obrigat&oacute;rios em Anexo</div>
      <ol>
        <li>C&oacute;pia autenticada do Bilhete de Identidade de ambas as partes</li>
        <li>Escritura ou certid&atilde;o de propriedade do im&oacute;vel</li>
        <li>Caso de heran&ccedil;a: certid&atilde;o de &oacute;bito + habilita&ccedil;&atilde;o de herdeiros</li>
        <li>&Uacute;ltima fatura EVN em nome do cedente, com saldo liquidado</li>
        <li>Comprovativo de pagamento da taxa de mudan&ccedil;a de titularidade (1.200 MZN)</li>
      </ol>

      <div class="section-title">Sec&ccedil;&atilde;o E &mdash; Declara&ccedil;&atilde;o</div>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;font-size:12px;color:#475569;">
          Os abaixo assinados declaram, sob compromisso de honra, que todas as informa&ccedil;&otilde;es constantes neste requerimento s&atilde;o verdadeiras, que a transfer&ecirc;ncia de titularidade &eacute; efectuada de forma livre e consensual, e que o im&oacute;vel objecto do pedido n&atilde;o tem quaisquer dividas pendentes junto da EVN. O novo titular aceita integralmente as Condi&ccedil;&otilde;es Gerais do Contrato de Fornecimento de Energia El&eacute;ctrica da Eletricidade Vantara Nacional, E.P., comprometendo-se ao pagamento atempado das faturas. A EVN fica autorizada a proceder &agrave; altera&ccedil;&atilde;o dos dados contratuais ap&oacute;s verifica&ccedil;&atilde;o da documenta&ccedil;&atilde;o.
        </p>
      </div>

      <div class="signature-row">
        <div class="signature-block"><div class="signature-line">Assinatura do Titular Cedente<br/>Data: _______________</div></div>
        <div class="signature-block"><div class="signature-line">Assinatura do Titular Cess&iacute;on&aacute;rio<br/>Data: _______________</div></div>
      </div>

      <div class="section-title" style="margin-top:40px;">Sec&ccedil;&atilde;o F &mdash; Uso Interno EVN</div>
      <div class="info-grid">
        <div class="info-cell"><div class="info-label">Protocolo N.&ordm;</div><div class="info-value" style="font-size:13px;">&nbsp;</div></div>
        <div class="info-cell"><div class="info-label">Data de Recep&ccedil;&atilde;o</div><div class="info-value" style="font-size:13px;">&nbsp;</div></div>
        <div class="info-cell"><div class="info-label">Funcion&aacute;rio Receptor</div><div class="info-value" style="font-size:13px;">&nbsp;</div></div>
        <div class="info-cell"><div class="info-label">Data de Liga&ccedil;&atilde;o Efectuada</div><div class="info-value" style="font-size:13px;">&nbsp;</div></div>
      </div>
      <div class="field-group" style="margin-top:12px;"><span class="field-label">Despacho / Observa&ccedil;&otilde;es</span><span class="field-line"></span><span class="field-line" style="margin-top:-8px;"></span></div>

      <div class="signature-row" style="margin-top:30px;">
        <div class="signature-block"><div class="signature-line">Validado por (Funcion&aacute;rio EVN)<br/>N.&ordm; Funcion&aacute;rio: _______________</div></div>
        <div class="signature-block"><div class="signature-line">Carimbo Oficial EVN<br/>Data: _______________</div></div>
      </div>
      ${evnFooter()}
    </div>`;
}

function generatePedidoVistoriaBody(filename: string, date: string): string {
  return `
    <div class="page">
      ${evnHeader("Direc&ccedil;&atilde;o T&eacute;cnica &mdash; Formul&aacute;rio Oficial")}
      <div class="doc-title">Requerimento para Pedido de Vistoria T&eacute;cnica</div>
      <div class="badge">&#128203; MOD-EVN-VT-002/2026 &mdash; USE LETRAS MAI&Uacute;SCULAS</div>
      <div class="meta-box">
        <strong>Data:</strong> ${esc(date)} &nbsp;|&nbsp; <strong>Formul&aacute;rio:</strong> ${esc(filename)} &nbsp;|&nbsp; <strong>N.&ordm; Processo:</strong> _______________<br/>
        <em>Utilizar para: Nova Liga&ccedil;&atilde;o / Aumento de Pot&ecirc;ncia / Reclassifica&ccedil;&atilde;o Tarif&aacute;ria / Inspec&ccedil;&atilde;o de Seguran&ccedil;a</em>
      </div>

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
        <div class="field-group"><span class="field-label">Pot&ecirc;ncia Actual (kVA)</span><span class="field-line"></span></div>
        <div class="field-group"><span class="field-label">Pot&ecirc;ncia Solicitada (kVA)</span><span class="field-line"></span></div>
      </div>

      <div class="section-title">Sec&ccedil;&atilde;o C &mdash; Natureza do Pedido (assinale com X)</div>
      <table class="data-table">
        <tbody>
          <tr><td style="width:40px;">[ ]</td><td>Nova Liga&ccedil;&atilde;o &agrave; Rede El&eacute;ctrica</td></tr>
          <tr><td>[ ]</td><td>Aumento de Pot&ecirc;ncia Contratada</td></tr>
          <tr><td>[ ]</td><td>Reclassifica&ccedil;&atilde;o Tarif&aacute;ria</td></tr>
          <tr><td>[ ]</td><td>Inspec&ccedil;&atilde;o de Seguran&ccedil;a</td></tr>
          <tr><td>[ ]</td><td>Outro: _________________________________________________</td></tr>
        </tbody>
      </table>

      <div class="section-title">Sec&ccedil;&atilde;o D &mdash; Uso Previsto</div>
      <div class="info-grid">
        <div class="field-group">
          <span class="field-label">Tipo de Instala&ccedil;&atilde;o</span>
          <p style="font-size:12px;margin:4px 0;">[ ] Residencial &nbsp;&nbsp; [ ] Comercial &nbsp;&nbsp; [ ] Industrial</p>
        </div>
        <div class="field-group"><span class="field-label">N.&ordm; de Conta EVN (se j&aacute; existir)</span><span class="field-line"></span></div>
      </div>

      <div class="section-title">Sec&ccedil;&atilde;o E &mdash; Instalador El&eacute;ctrico Respons&aacute;vel</div>
      <div class="info-grid">
        <div class="field-group"><span class="field-label">Nome do Instalador</span><span class="field-line"></span></div>
        <div class="field-group"><span class="field-label">Credencial ARENE N.&ordm;</span><span class="field-line"></span></div>
      </div>
      <div class="field-group"><span class="field-label">Telemo&oacute;vel do Instalador</span><span class="field-line"></span></div>
      ${evnFooter()}
    </div>

    <div class="page page-break">
      ${evnHeader("MOD-EVN-VT-002/2026 &mdash; Pedido de Vistoria (Continua&ccedil;&atilde;o)")}

      <div class="section-title">Sec&ccedil;&atilde;o F &mdash; Datas Prefer&ecirc;nciais para Vistoria</div>
      <div class="info-grid">
        <div class="field-group"><span class="field-label">1.&ordf; Prefer&ecirc;ncia (data e hora)</span><span class="field-line"></span></div>
        <div class="field-group"><span class="field-label">2.&ordf; Prefer&ecirc;ncia (data e hora)</span><span class="field-line"></span></div>
      </div>
      <div class="field-group"><span class="field-label">3.&ordf; Prefer&ecirc;ncia (data e hora)</span><span class="field-line"></span></div>
      <div class="field-group"><span class="field-label">Observa&ccedil;&otilde;es / Informa&ccedil;&otilde;es Adicionais</span><span class="field-line"></span><span class="field-line" style="margin-top:-8px;"></span><span class="field-line" style="margin-top:-8px;"></span></div>

      <div class="section-title">Sec&ccedil;&atilde;o G &mdash; Documentos em Anexo</div>
      <ol>
        <li>C&oacute;pia do documento de identifica&ccedil;&atilde;o do requerente</li>
        <li>T&iacute;tulo de ocupa&ccedil;&atilde;o / propriedade do im&oacute;vel (DUAT, escritura, etc.)</li>
        <li>Planta ou croquis da instala&ccedil;&atilde;o el&eacute;ctrica interna (quando dispon&iacute;vel)</li>
        <li>Termo de Responsabilidade T&eacute;cnica assinado (MOD-EVN-TRT-001) &mdash; obrigat&oacute;rio para pot&ecirc;ncias &ge; 10 kVA</li>
        <li>Licen&ccedil;a de constru&ccedil;&atilde;o ou de funcionamento (conforme aplic&aacute;vel)</li>
      </ol>

      <div class="info-box">&#128222; O prazo de resposta da EVN ap&oacute;s recep&ccedil;&atilde;o do processo completo &eacute; de <strong>10 dias &uacute;teis</strong>. Ser&aacute; contactado para confirmar data e hora da vistoria.</div>

      <div class="section-title">Sec&ccedil;&atilde;o H &mdash; Declara&ccedil;&atilde;o</div>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;font-size:12px;color:#475569;">Declaro que as informa&ccedil;&otilde;es constantes neste formul&aacute;rio s&atilde;o verdadeiras e autorizo a entrada de t&eacute;cnicos da EVN nas instala&ccedil;&otilde;es para realiza&ccedil;&atilde;o da vistoria t&eacute;cnica, em data e hora a acordar. Estou ciente de que a EVN se reserva o direito de recusar ou adiar a vistoria em caso de documenta&ccedil;&atilde;o incompleta.</p>
      </div>
      <div class="signature-row">
        <div class="signature-block"><div class="signature-line">Assinatura do Requerente<br/>Data: _______________</div></div>
        <div class="signature-block"><div class="signature-line">Recep&ccedil;&atilde;o EVN (Carimbo)<br/>Data: _______________</div></div>
      </div>
      ${evnFooter()}
    </div>`;
}

function generateNovaLigacaoBody(filename: string, date: string): string {
  return `
    <div class="page">
      ${evnHeader("Direc&ccedil;&atilde;o Comercial &mdash; Nova Liga&ccedil;&atilde;o")}
      <div class="doc-title">Formul&aacute;rio de Pedido de Nova Liga&ccedil;&atilde;o &agrave; Rede El&eacute;ctrica</div>
      <div class="badge">&#128196; MOD-EVN-NL-001/2026 &mdash; USE LETRAS MAI&Uacute;SCULAS</div>
      <div class="meta-box"><strong>Data:</strong> ${esc(date)} &nbsp;|&nbsp; <strong>Formul&aacute;rio:</strong> ${esc(filename)} &nbsp;|&nbsp; <strong>N.&ordm; Processo:</strong> _______________</div>

      <div class="section-title">Passo 1 &mdash; Dados do Requerente</div>
      <div class="field-group"><span class="field-label">Nome Completo / Denomina&ccedil;&atilde;o Social</span><span class="field-line"></span></div>
      <div class="info-grid">
        <div class="field-group"><span class="field-label">NUIT</span><span class="field-line"></span></div>
        <div class="field-group">
          <span class="field-label">Tipo de Identifica&ccedil;&atilde;o</span>
          <p style="font-size:12px;margin:4px 0;">[ ] BI &nbsp;&nbsp; [ ] DIRE &nbsp;&nbsp; [ ] Passaporte &nbsp;&nbsp; [ ] Outro</p>
        </div>
      </div>
      <div class="info-grid">
        <div class="field-group"><span class="field-label">N.&ordm; do Documento</span><span class="field-line"></span></div>
        <div class="field-group"><span class="field-label">Naturalidade</span><span class="field-line"></span></div>
      </div>
      <div class="field-group"><span class="field-label">Morada Permanente (Prov&iacute;ncia, Cidade, Bairro, Rua)</span><span class="field-line"></span></div>
      <div class="info-grid">
        <div class="field-group"><span class="field-label">Telemo&oacute;vel</span><span class="field-line"></span></div>
        <div class="field-group"><span class="field-label">Email</span><span class="field-line"></span></div>
      </div>

      <div class="section-title">Passo 2 &mdash; Dados da Instala&ccedil;&atilde;o</div>
      <div class="field-group"><span class="field-label">Endere&ccedil;o Exacto da Nova Liga&ccedil;&atilde;o (Prov&iacute;ncia, Cidade, Bairro, Rua, N.&ordm;)</span><span class="field-line"></span><span class="field-line" style="margin-top:-8px;"></span></div>
      <div class="info-grid">
        <div class="field-group">
          <span class="field-label">Tipo de Im&oacute;vel</span>
          <p style="font-size:12px;margin:4px 0;">[ ] Residencial &nbsp;&nbsp; [ ] Comercial &nbsp;&nbsp; [ ] Industrial</p>
        </div>
        <div class="field-group"><span class="field-label">&Aacute;rea &Uacute;til (m&sup2;)</span><span class="field-line"></span></div>
      </div>
      <div class="info-grid">
        <div class="field-group">
          <span class="field-label">Tipo de Cliente</span>
          <p style="font-size:12px;margin:4px 0;">[ ] Dom&eacute;stico &nbsp;&nbsp; [ ] N&atilde;o Dom&eacute;stico &nbsp;&nbsp; [ ] Industrial</p>
        </div>
        <div class="field-group"><span class="field-label">Pot&ecirc;ncia Solicitada (kVA)</span><span class="field-line"></span></div>
      </div>
      <div class="info-grid">
        <div class="field-group">
          <span class="field-label">Tens&atilde;o de Fornecimento Solicitada</span>
          <p style="font-size:12px;margin:4px 0;">[ ] 220V Monof&aacute;sico &nbsp;&nbsp; [ ] 380V Trif&aacute;sico</p>
        </div>
      </div>
      ${evnFooter()}
    </div>

    <div class="page page-break">
      ${evnHeader("MOD-EVN-NL-001/2026 &mdash; Nova Liga&ccedil;&atilde;o (Continua&ccedil;&atilde;o)")}

      <div class="section-title">Passo 3 &mdash; Instala&ccedil;&atilde;o Interna / T&eacute;cnico Respons&aacute;vel</div>
      <div class="info-grid">
        <div class="field-group"><span class="field-label">Electricista Respons&aacute;vel</span><span class="field-line"></span></div>
        <div class="field-group"><span class="field-label">N.&ordm; Credencial ARENE</span><span class="field-line"></span></div>
      </div>
      <div class="field-group"><span class="field-label">Telemo&oacute;vel do Electricista</span><span class="field-line"></span></div>
      <div class="info-box">O Termo de Responsabilidade T&eacute;cnica (MOD-EVN-TRT-001) assinado pelo electricista &eacute; documento obrigat&oacute;rio para este pedido.</div>

      <div class="section-title">Documentos Obrigat&oacute;rios em Anexo</div>
      <ol>
        <li>C&oacute;pia do documento de identifica&ccedil;&atilde;o (BI / DIRE / Passaporte)</li>
        <li>Prova de propriedade ou ocupa&ccedil;&atilde;o leg&iacute;tima do im&oacute;vel (DUAT, escritura, contrato de arrendamento)</li>
        <li>Planta esquem&aacute;tica da instala&ccedil;&atilde;o el&eacute;ctrica interna</li>
        <li>Termo de Responsabilidade T&eacute;cnica (MOD-EVN-TRT-001) assinado pelo electricista</li>
        <li>Comprovativo de pagamento da taxa de liga&ccedil;&atilde;o EVN (valor indicado no or&ccedil;amento)</li>
      </ol>

      <div class="section-title">Taxas e Prazos de Refer&ecirc;ncia</div>
      <div class="info-grid">
        <div class="info-cell"><div class="info-label">Taxa de Liga&ccedil;&atilde;o (Estimativa)</div><div class="info-value">3.500 &ndash; 15.000 MZN</div></div>
        <div class="info-cell"><div class="info-label">Prazo de Execu&ccedil;&atilde;o</div><div class="info-value">15 a 45 dias &uacute;teis ap&oacute;s aprova&ccedil;&atilde;o</div></div>
      </div>

      <div class="section-title">Declara&ccedil;&atilde;o e Assinaturas</div>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;font-size:12px;color:#475569;">
          Declaro que todas as informa&ccedil;&otilde;es prestadas neste formul&aacute;rio s&atilde;o verdadeiras e que a instala&ccedil;&atilde;o interna respeita as normas t&eacute;cnicas e de seguran&ccedil;a aplic&aacute;veis. Comprometo-me a cumprir as Condi&ccedil;&otilde;es Gerais do Contrato de Fornecimento de Energia El&eacute;ctrica da Eletricidade Vantara Nacional, E.P., nomeadamente o pagamento regular das faturas e a n&atilde;o adultera&ccedil;&atilde;o do contador ou da liga&ccedil;&atilde;o.
        </p>
      </div>
      <div class="signature-row">
        <div class="signature-block"><div class="signature-line">Assinatura do Requerente<br/>Data: _______________</div></div>
        <div class="signature-block"><div class="signature-line">Assinatura do Electricista<br/>Credencial: _______________</div></div>
      </div>
      <div class="signature-row" style="margin-top:40px;">
        <div class="signature-block"><div class="signature-line">Recep&ccedil;&atilde;o EVN (Funcion&aacute;rio)<br/>Data: _______________</div></div>
        <div class="signature-block"><div class="signature-line">Carimbo Oficial EVN</div></div>
      </div>
      ${evnFooter()}
    </div>`;
}

export function generateFormularioHtml(filename: string): string {
  const date = new Date().toLocaleDateString("pt-MZ");
  let body: string;
  if (/titular/i.test(filename)) body = generateMudancaTitularidadeBody(filename, date);
  else if (/vistoria/i.test(filename)) body = generatePedidoVistoriaBody(filename, date);
  else body = generateNovaLigacaoBody(filename, date);
  return wrapHtml(filename, body);
}
