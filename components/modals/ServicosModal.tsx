"use client";

import { FileText } from "lucide-react";
import type { ApiServiceDoc } from "@/app/_types";
import PdfLink from "@/components/pdf/PdfLink";

export function ServicosModal({
  servicesList,
  loading,
}: {
  servicesList: ApiServiceDoc[];
  loading: boolean;
}) {
  return (
    <div className="p-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-blue-400" style={{ background: "rgba(59,130,246,0.1)" }}><FileText className="w-8 h-8" /></div>
        <div><h2 className="text-3xl font-black text-white">Documentação EVN</h2><p className="text-slate-400">Descarregue os formulários oficiais em formato digital para impressão.</p></div>
      </div>
      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="p-6 rounded-2xl animate-pulse flex items-center justify-between" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="space-y-2 flex-1">
                <div className="h-5 w-64 rounded" style={{ background: "rgba(255,255,255,0.08)" }} />
                <div className="h-4 w-80 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>
              <div className="w-12 h-12 rounded-full ml-4 shrink-0" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>
          ))}
        </div>
      ) : (
      <div className="space-y-4">
        {servicesList.map(item => (
          <div key={item.docId}
            className="group p-6 rounded-2xl relative overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-100 text-lg mb-1">{item.title}</h4>
                <p className="text-sm text-slate-500">{item.description}</p>
              </div>
              <div className="ml-4 shrink-0">
                <PdfLink type="FORMULARIO" filename={item.title} />
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
