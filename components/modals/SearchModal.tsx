"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { ModalType, ApiNewsArticle } from "@/app/_types";

interface SearchItem { title: string; type: string; action: () => void; }

export function SearchModal({
  setActiveModal,
  newsData,
  openNewsArticle,
}: {
  setActiveModal: (m: ModalType) => void;
  newsData: ApiNewsArticle[];
  openNewsArticle: (id: number) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const SEARCH_INDEX = useMemo<SearchItem[]>(() => {
    const base: SearchItem[] = [
      { title: "Comprar Recarga Credelec",         type: "Serviço",       action: () => setActiveModal("CREDELEC") },
      { title: "Reportar Avaria / Piquete",         type: "Emergência",    action: () => setActiveModal("AVARIA") },
      { title: "Pedido de Nova Ligação",            type: "Serviço",       action: () => setActiveModal("NOVA_LIGACAO") },
      { title: "Vagas, Concursos e Recrutamento",   type: "Carreiras",     action: () => setActiveModal("CONCURSOS") },
      { title: "Consultar Faturas e Contratos",     type: "Cliente",       action: () => setActiveModal("CONTRATOS") },
      { title: "Projectos Estruturantes EVN",       type: "Institucional", action: () => setActiveModal("PROJECTOS") },
      { title: "Apoio ao Cliente (Telefone, Email)",type: "Contacto",      action: () => setActiveModal("CONTACT") },
      { title: "Catálogo de Serviços e Formulários",type: "Documentos",    action: () => setActiveModal("SERVICOS") },
      { title: "Missão, Visão e Valores",           type: "A Empresa",     action: () => setActiveModal("EMPRESA") },
      { title: "Avisos Nacionais e Cortes",         type: "Avisos",        action: () => setActiveModal("CORTES") },
      { title: "Simulador de Consumo de Energia",   type: "Serviço",       action: () => setActiveModal("SIMULADOR") },
    ];
    const news = newsData.map(n => ({ title: n.title, type: "Notícia", action: () => openNewsArticle(n.id) }));
    return [...base, ...news];
  }, [newsData, setActiveModal, openNewsArticle]);

  const results = useMemo(() => {
    if (!searchQuery) return SEARCH_INDEX;
    const q = searchQuery.toLowerCase();
    return SEARCH_INDEX.filter(i => i.title.toLowerCase().includes(q) || i.type.toLowerCase().includes(q));
  }, [searchQuery, SEARCH_INDEX]);

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      <div className="p-10 pb-6 sticky top-0 z-10" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(8,8,12,0.96)", backdropFilter: "blur(16px)" }}>
        <div className="flex items-center gap-4">
          <Search className="w-8 h-8 text-orange-500 shrink-0" />
          <input type="text" autoFocus placeholder="O que procura na EVN?" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-3xl font-black text-white placeholder:text-slate-600 outline-none bg-transparent" />
        </div>
      </div>
      <div className="p-10 flex-1">
        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((r, i) => (
              <div key={i} onClick={r.action}
                className="p-6 rounded-2xl cursor-pointer group transition-all select-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(249,115,22,0.5)"; e.currentTarget.style.background = "rgba(249,115,22,0.04)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              >
                <span className="text-orange-500 text-[10px] font-bold uppercase tracking-wider mb-2 block">{r.type}</span>
                <h3 className="font-bold text-slate-100 text-lg group-hover:text-orange-400 transition-colors">{r.title}</h3>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400">Nenhum resultado encontrado</h3>
            <p className="text-slate-500 mt-2">Tente usar termos como «Credelec», «Avaria», ou «Contratos».</p>
          </div>
        )}
      </div>
    </div>
  );
}
