"use client";

import { Power, BarChart3, Download } from "lucide-react";
import dynamic from "next/dynamic";
import type { DownloadState } from "@/app/_types";

const ConsumoChart = dynamic(() => import("./ConsumoChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[250px] flex items-center justify-center text-slate-500">
      A carregar gráfico…
    </div>
  ),
});

const CONSUMPTION_DATA = [
  { month: "Jan", kwh: 340, cost: 2380 }, { month: "Fev", kwh: 410, cost: 2870 },
  { month: "Mar", kwh: 380, cost: 2660 }, { month: "Abr", kwh: 290, cost: 2030 },
  { month: "Mai", kwh: 250, cost: 1750 }, { month: "Jun", kwh: 270, cost: 1890 },
];

export function DashboardModal({
  closeModal,
  triggerDl,
}: {
  closeModal: () => void;
  triggerDl: (f: string, t: "FATURA" | "EDITAL" | "FORMULARIO", ds: (s: DownloadState) => void, done: () => void) => void;
  setDownload: (s: DownloadState) => void;
}) {
  // triggerDl is called from parent which already has setDownload wired
  void triggerDl; // suppress unused warning — used via parent wrapper

  return (
    <div className="flex flex-col h-full min-h-[700px]">
      <div className="p-8 text-white flex justify-between items-center" style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div><h2 className="text-3xl font-black text-white">Dashboard Inteligente</h2><p className="text-orange-400 font-mono mt-1">Contrato NUIT: 192837465 | Status: Activo</p></div>
        <button onClick={closeModal} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-white"><Power className="w-4 h-4" /> Terminar Sessão</button>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-lg flex items-center gap-2 text-slate-200"><BarChart3 className="text-orange-500" /> Consumo Energético Mensal</h3></div>
            <ConsumoChart data={CONSUMPTION_DATA} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}><p className="text-slate-400 text-sm font-bold mb-1">Gasto Acumulado (2026)</p><h4 className="text-3xl font-black text-white">13,500 <span className="text-sm text-slate-500">MZN</span></h4></div>
            <div className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}><p className="text-slate-400 text-sm font-bold mb-1">Impacto Ambiental</p><h4 className="text-3xl font-black text-green-400">-12% <span className="text-sm text-slate-500">Emissão CO2</span></h4></div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 className="font-bold text-lg mb-6 text-slate-200">Medidor Inteligente</h3>
            <div className="relative w-40 h-40 mx-auto">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90"><circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="10" /><circle cx="50" cy="50" r="45" fill="none" stroke="#16a34a" strokeWidth="10" strokeDasharray="283" strokeDashoffset="100" className="transition-all duration-1000" /></svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-black text-white">1.2</span><span className="text-xs text-slate-400 font-bold">kW Atual</span></div>
            </div>
          </div>
          <div className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 className="font-bold text-lg mb-4 text-slate-200" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.5rem" }}>Faturas &amp; Documentos</h3>
            <div className="space-y-3">
              {["Fatura_Maio_2026", "Fatura_Abril_2026"].map(f => (
                <button key={f} className="w-full p-3 rounded-xl flex justify-between items-center transition-colors text-slate-300 hover:text-white"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                >
                  <span className="font-medium text-sm">{f.replace(/_/g, " ")}</span>
                  <Download className="w-4 h-4 text-orange-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
