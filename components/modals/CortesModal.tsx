"use client";

import { Activity } from "lucide-react";
import type { ApiAlert } from "@/app/_types";

export function CortesModal({ alertsList, loading }: { alertsList: ApiAlert[]; loading: boolean }) {
  return (
    <div className="p-5 sm:p-10 min-h-[400px] sm:min-h-[600px]">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-orange-500 shrink-0" style={{ background: "rgba(249,115,22,0.1)" }}><Activity className="w-7 h-7 sm:w-8 sm:h-8" /></div>
        <div><h2 className="text-2xl sm:text-3xl font-black text-white">Avisos Oficiais e Cortes</h2><p className="text-slate-400 text-sm">Boletim atualizado de manutenções na rede elétrica nacional.</p></div>
      </div>
      {loading ? (
        <div className="space-y-6 max-w-3xl">
          {[0, 1, 2].map(i => (
            <div key={i} className="p-6 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="space-y-3">
                <div className="h-5 w-48 rounded" style={{ background: "rgba(255,255,255,0.08)" }} />
                <div className="h-4 w-full rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
                <div className="h-4 w-3/4 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
                <div className="flex gap-4 pt-1">
                  <div className="h-8 w-32 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }} />
                  <div className="h-8 w-28 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
      <div className="space-y-6 max-w-3xl">
        {alertsList.map((alert) => {
          const cfg = {
            URGENT:    { bg: "rgba(127,29,29,0.25)", border: "rgba(239,68,68,0.25)",   stripe: "#ef4444", titleCls: "text-red-300",    badge: { bg: "rgba(239,68,68,0.15)",    color: "#fca5a5" }, label: "Urgente",   opacity: "" },
            SCHEDULED: { bg: "rgba(78,63,0,0.3)",    border: "rgba(234,179,8,0.2)",    stripe: "#facc15", titleCls: "text-yellow-300", badge: { bg: "rgba(234,179,8,0.15)",    color: "#fde047" }, label: "Agendado",  opacity: "" },
            RESOLVED:  { bg: "transparent",           border: "rgba(255,255,255,0.08)", stripe: "#64748b", titleCls: "text-slate-300",  badge: { bg: "rgba(255,255,255,0.06)",  color: "#94a3b8" }, label: "Concluído", opacity: "opacity-60 hover:opacity-100 transition-opacity" },
          }[alert.type];
          return (
            <div key={alert.id} className={`p-6 rounded-2xl relative overflow-hidden ${cfg.opacity}`} style={{ background: cfg.bg, border: `2px solid ${cfg.border}` }}>
              <div aria-hidden className="absolute top-0 left-0 w-2 h-full pointer-events-none" style={{ background: cfg.stripe }} />
              <div className="flex justify-between items-start mb-3">
                <h4 className={`font-black text-xl ${cfg.titleCls}`}>{alert.zone}</h4>
                <span className="text-xs font-bold px-3 py-1 rounded-full uppercase" style={{ background: cfg.badge.bg, color: cfg.badge.color }}>{cfg.label}</span>
              </div>
              <p className="text-slate-300 mb-4 leading-relaxed">{alert.description}</p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4">
                <div className="px-4 py-2 rounded-lg font-mono text-sm text-slate-300" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}><strong>Data:</strong> {alert.date}</div>
                <div className="px-4 py-2 rounded-lg font-mono text-sm text-slate-300" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}><strong>Duração:</strong> {alert.duration}</div>
              </div>
            </div>
          );
        })}
        {alertsList.length === 0 && <p className="text-slate-500 text-center py-16">Nenhum alerta ativo de momento.</p>}
      </div>
      )}
    </div>
  );
}
