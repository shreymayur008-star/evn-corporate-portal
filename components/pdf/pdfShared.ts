export const esc = (s: string | number) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );

export function pdfStyles(): string {
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

export function evnHeader(subtitle: string): string {
  return `
    <div class="header">
      <div>
        <div class="logo">&#9889; EVN<span>.</span></div>
        <div class="header-sub">Eletricidade Vantara Nacional, E.P.</div>
      </div>
      <div class="header-text">
        <strong>Av. 25 de Setembro, 1500 &mdash; Maputo</strong><br/>
        Tel: +258 21 352 400 &nbsp;|&nbsp; evn.co.mz<br/>
        ${subtitle}
      </div>
    </div>`;
}

export function evnFooter(): string {
  const year = new Date().getFullYear();
  return `<div class="footer">Eletricidade Vantara Nacional, E.P. &copy; ${year} &mdash; Documento gerado electronicamente pelo Sistema de Gest&atilde;o EVN. V&aacute;lido sem assinatura manuscrita.</div>`;
}

export function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html><html lang="pt"><head><meta charset="UTF-8"><title>${esc(title)}</title><style>${pdfStyles()}</style></head><body>${body}
<script>
  window.addEventListener('load', function() {
    setTimeout(function() { window.print(); }, 400);
  });
</script>
</body></html>`;
}
