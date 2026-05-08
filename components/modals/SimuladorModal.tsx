"use client";

import { useState } from "react";
import { Calculator, AlertCircle } from "lucide-react";

export function SimuladorModal() {
  const [simulador, setSimulador] = useState({ ac: 4, fridge: 24, tv: 5, lights: 6 });

  const totalKwhDay = ((simulador.ac * 1500) + (simulador.fridge * 200) + (simulador.tv * 100) + (simulador.lights * 300)) / 1000;
  const totalKwhMonth = totalKwhDay * 30;
  const costMzn = totalKwhMonth * 7.5;

  const sliders = [
    { key: "ac" as const,     label: "Ar Condicionado (1500W)", val: simulador.ac },
    { key: "fridge" as const, label: "Frigorífico (200W)",       val: simulador.fridge },
    { key: "tv" as const,     label: "Televisão (100W)",         val: simulador.tv },
    { key: "lights" as const, label: "Iluminação (60W x5)",      val: simulador.lights },
  ];

  return (
    <div className="p-10 flex flex-col md:flex-row gap-10">
      <div className="md:w-1/2">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-blue-400" style={{ background: "rgba(59,130,246,0.1)" }}><Calculator className="w-8 h-8" /></div>
          <div><h2 className="text-3xl font-black text-white">Simulador de Consumo</h2><p className="text-slate-400">Estime a sua fatura mensal (MZN).</p></div>
        </div>
        <div className="space-y-6">
          {sliders.map(({ key, label, val }) => (
            <div key={key} className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex justify-between mb-2">
                <label className="font-bold text-sm text-slate-200">{label}</label>
                <span className="font-mono text-orange-500 font-bold">{val}h / dia</span>
              </div>
              <input type="range" min="0" max="24" value={val}
                onChange={e => setSimulador(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                className="w-full accent-orange-500" />
            </div>
          ))}
        </div>
      </div>

      <div className="md:w-1/2 rounded-3xl p-10 text-white flex flex-col justify-center" style={{ background: "rgba(3,3,9,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 className="text-xl font-bold mb-8 text-center text-slate-400 uppercase tracking-widest">Estimativa Mensal (30 dias)</h3>
        <div className="text-center mb-8">
          <span className="text-6xl font-black text-orange-500">{costMzn.toFixed(2)}</span>
          <span className="text-2xl ml-2">MZN</span>
        </div>
        <div className="p-6 rounded-2xl mb-8" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex justify-between pb-3 mb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <span className="text-slate-400">Consumo Diário</span><span className="font-bold text-slate-200">{totalKwhDay.toFixed(2)} kWh</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Consumo Mensal</span><span className="font-bold text-blue-400">{totalKwhMonth.toFixed(2)} kWh</span>
          </div>
        </div>
        {costMzn > 3000 && (
          <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-xl flex gap-3 text-red-200 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            Dica: Reduzir o uso do AC em 2 horas diárias poupará aproximadamente 675 MZN por mês.
          </div>
        )}
      </div>
    </div>
  );
}
