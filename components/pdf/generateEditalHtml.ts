import { esc, evnHeader, evnFooter, wrapHtml } from "./pdfShared";

function generateEditalEngBody(ref: string, date: string): string {
  const deadline = new Date(Date.now() + 30 * 24 * 3600 * 1000).toLocaleDateString("pt-MZ");
  return `
    <div class="page">
      ${evnHeader("Direc&ccedil;&atilde;o de Opera&ccedil;&otilde;es e Manuten&ccedil;&atilde;o")}
      <div class="doc-title">Edital de Recrutamento P&uacute;blico</div>
      <div class="badge">&#128203; REF: ${esc(ref)} &mdash; CONCURSO ABERTO</div>
      <div class="meta-box">
        <strong>Data de Publica&ccedil;&atilde;o:</strong> ${esc(date)} &nbsp;|&nbsp;
        <strong>Prazo de Candidatura:</strong> ${esc(deadline)} &nbsp;|&nbsp;
        <strong>Modalidade:</strong> Contrato a Termo com possibilidade de Efectiva&ccedil;&atilde;o
      </div>
      <div style="text-align:center;background:linear-gradient(135deg,#fff7ed,#fffbeb);border:1px solid #fed7aa;border-radius:12px;padding:32px;margin:24px 0;">
        <div style="font-size:12px;font-weight:800;color:#92400e;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;">Vaga Dispon&iacute;vel</div>
        <div style="font-size:24px;font-weight:900;color:#ea580c;margin-bottom:8px;">Engenheiro El&eacute;ctrico S&eacute;nior</div>
        <div style="font-size:14px;color:#78350f;font-weight:700;">Transmiss&atilde;o e Distribui&ccedil;&atilde;o</div>
        <div style="font-size:13px;color:#78350f;margin-top:6px;">Direc&ccedil;&atilde;o de Opera&ccedil;&otilde;es e Manuten&ccedil;&atilde;o &nbsp;&middot;&nbsp; Sede EVN, Maputo</div>
        <div style="margin-top:12px;display:inline-block;background:#fff;border:2px solid #f97316;border-radius:8px;padding:8px 20px;">
          <span style="font-size:13px;font-weight:800;color:#ea580c;">Sal&aacute;rio: 85.000 &ndash; 120.000 MZN bruto/m&ecirc;s</span>
        </div>
      </div>

      <div class="section-title">Fun&ccedil;&otilde;es e Responsabilidades</div>
      <ul>
        <li>Supervisionar a manuten&ccedil;&atilde;o preventiva e correctiva de subestac&otilde;es de alta tens&atilde;o at&eacute; 220 kV</li>
        <li>Lideran&ccedil;a t&eacute;cnica de equipa de 12 t&eacute;cnicos especializados em AT/MT</li>
        <li>Gest&atilde;o do or&ccedil;amento anual de manuten&ccedil;&atilde;o e elabora&ccedil;&atilde;o de relat&oacute;rios executivos</li>
        <li>Opera&ccedil;&atilde;o e monitoriza&ccedil;&atilde;o de sistemas SCADA e tele-controlo de rede</li>
        <li>Coordena&ccedil;&atilde;o de projectos de expans&atilde;o e reabilita&ccedil;&atilde;o da rede de distribui&ccedil;&atilde;o</li>
        <li>Represent&acirc;ncia da EVN nas inspec&ccedil;&otilde;es e articula&ccedil;&atilde;o com a ARENE</li>
        <li>Desenvolvimento e conduc&ccedil;&atilde;o de programas de forma&ccedil;&atilde;o t&eacute;cnica interna</li>
        <li>Coordena&ccedil;&atilde;o da resposta de emerg&ecirc;ncia a grandes avarias e eventos cr&iacute;ticos</li>
      </ul>

      <div class="section-title">Requisitos Obrigat&oacute;rios</div>
      <ul>
        <li>Licenciatura em Engenharia Electrot&eacute;cnica (m&iacute;nimo 5 anos de curso)</li>
        <li>Inscri&ccedil;&atilde;o v&aacute;lida na Ordem dos Engenheiros de Mo&ccedil;ambique (OEM)</li>
        <li>M&iacute;nimo de 7 anos de experi&ecirc;ncia comprovada em sistemas de AT (> 66 kV)</li>
        <li>Familiaridade com sistemas SCADA e protocolos IEC 60870 / DNP3</li>
        <li>Portugu&ecirc;s fluente (oral e escrito); Ingl&ecirc;s t&eacute;cnico valorizado</li>
        <li>Disponibilidade para deslocac&otilde;es a n&iacute;vel nacional</li>
        <li>Carta de condu&ccedil;&atilde;o v&aacute;lida &mdash; Categoria B</li>
      </ul>
      ${evnFooter()}
    </div>

    <div class="page page-break">
      ${evnHeader(`Edital ${esc(ref)} &mdash; Condi&ccedil;&otilde;es e Candidatura`)}

      <div class="section-title">O Que a EVN Oferece</div>
      <div class="info-grid">
        <div class="info-cell"><div class="info-label">Sal&aacute;rio Base</div><div class="info-value">85.000 &ndash; 120.000 MZN</div></div>
        <div class="info-cell"><div class="info-label">Sub&iacute;dio de Alojamento</div><div class="info-value">Inclu&iacute;do no pacote</div></div>
        <div class="info-cell"><div class="info-label">Seguro de Sa&uacute;de</div><div class="info-value">Plano familiar (titular + dependentes)</div></div>
        <div class="info-cell"><div class="info-label">Viatura de Servi&ccedil;o</div><div class="info-value">Atribu&iacute;da &agrave; fun&ccedil;&atilde;o</div></div>
        <div class="info-cell"><div class="info-label">Plano de Pens&otilde;es</div><div class="info-value">Contri buição EVN 8%</div></div>
        <div class="info-cell"><div class="info-label">F&eacute;rias Anuais</div><div class="info-value">22 dias &uacute;teis</div></div>
        <div class="info-cell"><div class="info-label">Forma&ccedil;&atilde;o</div><div class="info-value">Cont&iacute;nua e certificada (IEC, CIGRE)</div></div>
      </div>

      <div class="section-title">Documentos a Submeter</div>
      <ol>
        <li>Curriculum Vitae actualizado (m&aacute;ximo 4 p&aacute;ginas), formato PDF</li>
        <li>Carta de Motiva&ccedil;&atilde;o (m&aacute;ximo 1 p&aacute;gina), dirigida &agrave; Dire&ccedil;&atilde;o de Recursos Humanos da EVN</li>
        <li>C&oacute;pia autenticada do certificado acad&eacute;mico (Licenciatura em Engenharia)</li>
        <li>Certificado de Inscri&ccedil;&atilde;o v&aacute;lido na Ordem dos Engenheiros de Mo&ccedil;ambique (OEM)</li>
        <li>C&oacute;pia do Bilhete de Identidade ou DIRE em validade</li>
        <li>Comprovativos de experi&ecirc;ncia profissional (declara&ccedil;&otilde;es de empregadores anteriores)</li>
        <li>C&oacute;pia da Carta de Condu&ccedil;&atilde;o</li>
      </ol>

      <div class="section-title">Processo de Candidatura</div>
      <p>As candidaturas devem ser enviadas <strong>exclusivamente por e-mail</strong> para <strong>recrutamento@evn.co.mz</strong>, com o assunto: <em>&ldquo;Candidatura &mdash; ${esc(ref)} &mdash; [Nome Completo]&rdquo;</em>.</p>
      <p>Candidaturas incompletas ou fora do prazo n&atilde;o ser&atilde;o consideradas. A EVN reserva-se o direito de convocar apenas os candidatos que melhor correspondam ao perfil definido.</p>
      <div class="info-box">Processo de selec&ccedil;&atilde;o: triagem curricular &rarr; entrevista t&eacute;cnica &rarr; avalia&ccedil;&atilde;o psicot&eacute;cnica &rarr; proposta de contrata&ccedil;&atilde;o. Dura&ccedil;&atilde;o estimada: 45 dias &uacute;teis a partir da data de encerramento das candidaturas.</div>

      <div class="signature-row">
        <div class="signature-block"><div class="signature-line">A Dire&ccedil;&atilde;o de Recursos Humanos<br/>Eletricidade Vantara Nacional, E.P.</div></div>
        <div class="signature-block"><div class="signature-line">Data e Carimbo Oficial</div></div>
      </div>
      ${evnFooter()}
    </div>`;
}

function generateEditalTecBody(ref: string, date: string): string {
  const deadline = new Date(Date.now() + 30 * 24 * 3600 * 1000).toLocaleDateString("pt-MZ");
  return `
    <div class="page">
      ${evnHeader("Direc&ccedil;&atilde;o Regional Sul")}
      <div class="doc-title">Edital de Recrutamento P&uacute;blico</div>
      <div class="badge">&#128203; REF: ${esc(ref)} &mdash; CONCURSO ABERTO</div>
      <div class="meta-box">
        <strong>Data de Publica&ccedil;&atilde;o:</strong> ${esc(date)} &nbsp;|&nbsp;
        <strong>Prazo de Candidatura:</strong> ${esc(deadline)} &nbsp;|&nbsp;
        <strong>Modalidade:</strong> Contrato a Termo com possibilidade de Efectiva&ccedil;&atilde;o
      </div>
      <div style="text-align:center;background:linear-gradient(135deg,#fff7ed,#fffbeb);border:1px solid #fed7aa;border-radius:12px;padding:32px;margin:24px 0;">
        <div style="font-size:12px;font-weight:800;color:#92400e;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;">Vaga Dispon&iacute;vel</div>
        <div style="font-size:24px;font-weight:900;color:#ea580c;margin-bottom:8px;">T&eacute;cnico de Electrotecnia</div>
        <div style="font-size:14px;color:#78350f;font-weight:700;">Linhas de M&eacute;dia Tens&atilde;o</div>
        <div style="font-size:13px;color:#78350f;margin-top:6px;">Direc&ccedil;&atilde;o Regional Sul &nbsp;&middot;&nbsp; Base Operacional Matola</div>
        <div style="margin-top:12px;display:inline-block;background:#fff;border:2px solid #f97316;border-radius:8px;padding:8px 20px;">
          <span style="font-size:13px;font-weight:800;color:#ea580c;">Sal&aacute;rio: 45.000 &ndash; 62.000 MZN bruto/m&ecirc;s</span>
        </div>
      </div>

      <div class="section-title">Fun&ccedil;&otilde;es e Responsabilidades</div>
      <ul>
        <li>Instala&ccedil;&atilde;o e manuten&ccedil;&atilde;o de linhas a&eacute;reas e subterr&acirc;neas de m&eacute;dia tens&atilde;o (6 kV a 30 kV)</li>
        <li>Resposta a avarias em rota&ccedil;&atilde;o de piquete 24h (regime de turno)</li>
        <li>Execu&ccedil;&atilde;o de trabalhos de electrifica&ccedil;&atilde;o rural em zonas remotas</li>
        <li>Cumprimento rigoroso dos procedimentos de seguran&ccedil;a e uso de EPI</li>
        <li>Manuten&ccedil;&atilde;o e revis&atilde;o de ve&iacute;culos e equipamentos de campo</li>
        <li>Registo documental de ocorr&ecirc;ncias no sistema de gest&atilde;o EVN</li>
        <li>Coordena&ccedil;&atilde;o com equipas de outros sectores em interven&ccedil;&otilde;es complexas</li>
      </ul>

      <div class="section-title">Requisitos Obrigat&oacute;rios</div>
      <ul>
        <li>Curso T&eacute;cnico em Electrotecnia (ISET ou equivalente reconhecido pelo MINEDH)</li>
        <li>Credencial de instalador el&eacute;ctrico v&aacute;lida emitida pela ARENE</li>
        <li>M&iacute;nimo de 4 anos de experi&ecirc;ncia comprovada em campo (MT/BT)</li>
        <li>Certifica&ccedil;&atilde;o de Trabalhos em Altura (v&aacute;lida)</li>
        <li>Carta de condu&ccedil;&atilde;o v&aacute;lida (ve&iacute;culos pesados valorizado)</li>
        <li>Aptid&atilde;o f&iacute;sica comprovada (trabalho em altura e esforfos pesados)</li>
        <li>Sem acrofobia (trabalho obrigat&oacute;rio em postes e torres)</li>
      </ul>
      ${evnFooter()}
    </div>

    <div class="page page-break">
      ${evnHeader(`Edital ${esc(ref)} &mdash; Condi&ccedil;&otilde;es e Candidatura`)}

      <div class="section-title">Benef&iacute;cios Oferecidos</div>
      <div class="info-grid">
        <div class="info-cell"><div class="info-label">Sal&aacute;rio Base</div><div class="info-value">45.000 &ndash; 62.000 MZN</div></div>
        <div class="info-cell"><div class="info-label">Sub&iacute;dio de Turno/Piquete</div><div class="info-value">Aplic&aacute;vel por regime</div></div>
        <div class="info-cell"><div class="info-label">Seguro de Sa&uacute;de</div><div class="info-value">Plano EVN (titular)</div></div>
        <div class="info-cell"><div class="info-label">Ajudas de Custo</div><div class="info-value">Por desloca&ccedil;&atilde;o a campo</div></div>
        <div class="info-cell"><div class="info-label">EPI e Fardamento</div><div class="info-value">Fornecidos pela EVN</div></div>
        <div class="info-cell"><div class="info-label">Forma&ccedil;&atilde;o</div><div class="info-value">Cont&iacute;nua em seguran&ccedil;a e t&eacute;cnica</div></div>
      </div>

      <div class="section-title">Documentos a Submeter</div>
      <ol>
        <li>Curriculum Vitae actualizado (m&aacute;ximo 3 p&aacute;ginas), formato PDF</li>
        <li>Carta de Motiva&ccedil;&atilde;o (m&aacute;ximo 1 p&aacute;gina)</li>
        <li>C&oacute;pia autenticada do certificado do Curso T&eacute;cnico</li>
        <li>Credencial ARENE v&aacute;lida (c&oacute;pia frente e verso)</li>
        <li>Certifica&ccedil;&atilde;o de Trabalhos em Altura (c&oacute;pia)</li>
        <li>C&oacute;pia do Bilhete de Identidade em validade</li>
        <li>C&oacute;pia da Carta de Condu&ccedil;&atilde;o</li>
        <li>Comprovativos de experi&ecirc;ncia profissional</li>
      </ol>

      <div class="section-title">Processo de Candidatura</div>
      <p>As candidaturas devem ser enviadas para <strong>recrutamento@evn.co.mz</strong>, com o assunto: <em>&ldquo;Candidatura &mdash; ${esc(ref)} &mdash; [Nome Completo]&rdquo;</em>.</p>
      <div class="info-box">Processo de selec&ccedil;&atilde;o: triagem curricular &rarr; testes t&eacute;cnicos pr&aacute;ticos &rarr; exame m&eacute;dico &rarr; proposta de contrata&ccedil;&atilde;o. Dura&ccedil;&atilde;o estimada: 30 dias &uacute;teis.</div>

      <div class="signature-row">
        <div class="signature-block"><div class="signature-line">A Dire&ccedil;&atilde;o de Recursos Humanos<br/>Eletricidade Vantara Nacional, E.P.</div></div>
        <div class="signature-block"><div class="signature-line">Data e Carimbo Oficial</div></div>
      </div>
      ${evnFooter()}
    </div>`;
}

function generateEditalGenericBody(ref: string, date: string): string {
  const isEng = /eng/i.test(ref);
  const position = isEng
    ? "Engenheiro(a) Electrot&eacute;cnico(a) S&eacute;nior"
    : "T&eacute;cnico(a) de Redes El&eacute;ctricas";
  const department = isEng
    ? "Direc&ccedil;&atilde;o de Engenharia e Projectos"
    : "Direc&ccedil;&atilde;o de Opera&ccedil;&otilde;es e Manuten&ccedil;&atilde;o";
  const salary = isEng ? "95.000 &ndash; 140.000 MZN" : "45.000 &ndash; 65.000 MZN";
  const deadline = new Date(Date.now() + 30 * 24 * 3600 * 1000).toLocaleDateString("pt-MZ");

  return `
    <div class="page">
      ${evnHeader(department)}
      <div class="doc-title">Edital de Recrutamento P&uacute;blico</div>
      <div class="badge">&#128203; REF: ${esc(ref)} &mdash; CONCURSO ABERTO</div>
      <div class="meta-box">
        <strong>Data de Publica&ccedil;&atilde;o:</strong> ${esc(date)} &nbsp;|&nbsp;
        <strong>Prazo:</strong> ${esc(deadline)} &nbsp;|&nbsp;
        <strong>Modalidade:</strong> Contrato a Termo com possibilidade de Efectiva&ccedil;&atilde;o
      </div>
      <div style="text-align:center;background:linear-gradient(135deg,#fff7ed,#fffbeb);border:1px solid #fed7aa;border-radius:12px;padding:32px;margin:24px 0;">
        <div style="font-size:12px;font-weight:800;color:#92400e;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;">Vaga Dispon&iacute;vel</div>
        <div style="font-size:24px;font-weight:900;color:#ea580c;margin-bottom:8px;">${position}</div>
        <div style="font-size:14px;color:#78350f;font-weight:600;">${department}</div>
        <div style="margin-top:12px;display:inline-block;background:#fff;border:2px solid #f97316;border-radius:8px;padding:8px 20px;">
          <span style="font-size:13px;font-weight:800;color:#ea580c;">Sal&aacute;rio: ${salary}</span>
        </div>
      </div>

      <div class="section-title">Requisitos e Candidatura</div>
      <p>Para informa&ccedil;&otilde;es completas sobre requisitos e processo de candidatura consulte o edital completo em <strong>evn.co.mz/carreiras</strong> ou contacte <strong>recrutamento@evn.co.mz</strong> com a refer&ecirc;ncia <em>${esc(ref)}</em>.</p>

      <div class="signature-row">
        <div class="signature-block"><div class="signature-line">A Dire&ccedil;&atilde;o de Recursos Humanos<br/>Eletricidade Vantara Nacional, E.P.</div></div>
        <div class="signature-block"><div class="signature-line">Data e Carimbo Oficial</div></div>
      </div>
      ${evnFooter()}
    </div>`;
}

export function generateEditalHtml(filename: string): string {
  const ref = filename.replace(/\.pdf$/i, "");
  const date = new Date().toLocaleDateString("pt-MZ");
  let body: string;
  if (/EVN-ENG/i.test(ref)) body = generateEditalEngBody(ref, date);
  else if (/EVN-TEC/i.test(ref)) body = generateEditalTecBody(ref, date);
  else body = generateEditalGenericBody(ref, date);
  return wrapHtml(filename, body);
}
