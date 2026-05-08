"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import type { DownloadState } from "@/app/_types";

export function ConcursosModal({
  onDownload,
  setDownload,
}: {
  onDownload: (f: string, t: "EDITAL", ds: (s: DownloadState) => void, done: () => void) => void;
  setDownload: (s: DownloadState) => void;
}) {
  const [selected, setSelected] = useState(1);

  const dl = (f: string) => onDownload(f, "EDITAL", setDownload, () => {});

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[600px]">
      <div className="md:w-1/3 flex flex-col h-full" style={{ background: "rgba(0,0,0,0.3)", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="p-8 text-white" style={{ background: "rgba(0,0,0,0.4)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <h2 className="text-2xl font-black mb-2">Vagas EVN</h2>
          <p className="text-slate-400 text-sm">Junte-se à equipa que eletrifica a nação.</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {[
            { id: 1, title: "Engenheiro Sênior",  sub: "Sede Operacional EVN" },
            { id: 2, title: "Técnico de Linhas",  sub: "Expansão de Rede Rural" },
          ].map(job => (
            <div key={job.id} onClick={() => setSelected(job.id)}
              className="p-4 rounded-xl border cursor-pointer select-none transition-all"
              style={{ background: selected === job.id ? "rgba(249,115,22,0.08)" : "rgba(255,255,255,0.04)", borderColor: selected === job.id ? "#f97316" : "rgba(255,255,255,0.08)" }}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-100 text-sm">{job.title}</h3>
                <span className="text-[10px] font-bold px-2 py-1 rounded text-green-400" style={{ background: "rgba(22,163,74,0.15)" }}>Aberto</span>
              </div>
              <p className="text-xs text-slate-500">{job.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="md:w-2/3 p-10">
        {selected === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="text-orange-500 font-bold text-sm tracking-widest uppercase mb-2 block">Ref: EVN-ENG-042</span>
            <h2 className="text-3xl font-black text-white mb-6">Engenheiro Eletrotécnico Sênior</h2>
            <div className="mb-8">
              <h4 className="font-bold text-slate-200 text-base mb-2">Requisitos</h4>
              <ul className="list-disc pl-5 text-slate-400 space-y-1 text-sm">
                <li>Licenciatura em Engenharia Eletrotécnica.</li>
                <li>Inscrição válida na Ordem dos Engenheiros.</li>
                <li>Mínimo de 5 anos de experiência.</li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h4 className="font-bold text-slate-200 mb-4">Submeter Candidatura</h4>
              <button onClick={() => dl("EVN-ENG-042")} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2">
                <Download className="w-4 h-4" /> Descarregar Termos de Referência PDF
              </button>
            </div>
          </motion.div>
        )}
        {selected === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="text-orange-500 font-bold text-sm tracking-widest uppercase mb-2 block">Ref: EVN-TEC-109</span>
            <h2 className="text-3xl font-black text-white mb-6">Técnico de Linhas (Média Tensão)</h2>
            <p className="text-slate-400 mb-8">Posição focada na expansão rápida e eletrificação rural da rede EVN.</p>
            <button onClick={() => dl("EVN-TEC-109")} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2">
              <Download className="w-4 h-4" /> Descarregar Edital Completo PDF
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
