export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { generateInvoiceHtml } from "@/components/pdf/generateInvoiceHtml";
import { generateEditalHtml } from "@/components/pdf/generateEditalHtml";
import { generateFormularioHtml } from "@/components/pdf/generateFormularioHtml";

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const type = sp.get("type") ?? "";
  const filename = decodeURIComponent(sp.get("filename") ?? "Documento EVN");

  let html: string;
  switch (type) {
    case "FATURA":     html = generateInvoiceHtml(filename);    break;
    case "EDITAL":     html = generateEditalHtml(filename);     break;
    case "FORMULARIO": html = generateFormularioHtml(filename); break;
    default:
      return NextResponse.json(
        { error: "Tipo inválido. Use FATURA, EDITAL ou FORMULARIO." },
        { status: 400 }
      );
  }

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
