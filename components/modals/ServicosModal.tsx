"use client";

import { FileText, Download } from "lucide-react";
import type { ApiServiceDoc } from "@/app/_types";

export function ServicosModal({
  servicesList,
  onDownload,
  loading,
}: {
  servicesList: ApiServiceDoc[];
  onDownload: (f: string, t: "FORMULARIO") => void;
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
            className="group p-6 rounded-2xl relative overflow-hidden cursor-pointer transition-all select-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)"; e.currentTarget.style.background = "rgba(59,130,246,0.04)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
            onClick={() => onDownload(item.title, "FORMULARIO")}
          >
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-100 text-lg mb-1 group-hover:text-blue-400 transition-colors">{item.title}</h4>
                <p className="text-sm text-slate-500">{item.description}</p>
              </div>
              <div className="flex flex-col items-center ml-4 shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}><Download className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" /></div>
                <span className="text-[10px] font-bold mt-2 text-slate-500">{item.fileSize}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
