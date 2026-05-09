"use client";

import { Building, HardHat } from "lucide-react";
import type { ApiNewsArticle } from "@/app/_types";

export function EmpresaModal() {
  return (
    <div className="p-10 text-center">
      <Building className="w-20 h-20 text-orange-500 mx-auto mb-6" />
      <h2 className="text-4xl font-black text-white mb-6">A Nossa Missão</h2>
      <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">A Eletricidade Vantara Nacional (EVN) existe para iluminar o país, impulsionando o desenvolvimento com energia elétrica inteligente, fiável e sustentável.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
        <div className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h4 className="font-black text-white mb-2 text-xl">Visão EVN</h4>
          <p className="text-sm text-slate-400">Ser a rede elétrica de referência tecnológica no continente, com foco absoluto no consumidor.</p>
        </div>
        <div className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h4 className="font-black text-white mb-2 text-xl">Valores EVN</h4>
          <ul className="text-sm text-slate-400 list-disc pl-4 space-y-1"><li>Foco inabalável no Cliente</li><li>Transparência Operacional</li><li>Inovação e Smart Grids</li></ul>
        </div>
      </div>
    </div>
  );
}

export function ProjectosModal() {
  const projects = [
    { title: "Central Solar Nacional", desc: "Implementação de parque fotovoltaico de 41 MW.", badge: "Em Execução", badgeColor: "#22c55e", progress: 75, img: "https://images.unsplash.com/photo-1509391366360-1e97d5259d81?auto=format&fit=crop&w=800&q=80" },
    { title: "Nova Linha de Transmissão", desc: "Construção de linha de 400kV para escoamento eficiente.", badge: "Fase Inicial", badgeColor: "#f97316", progress: 15, img: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80" },
  ];
  return (
    <div className="p-10">
      <div className="text-center mb-10"><HardHat className="w-16 h-16 text-orange-500 mx-auto mb-4" /><h2 className="text-3xl font-black text-white">Projectos EVN em Curso</h2><p className="text-slate-400 mt-2">A construir o futuro energético do país.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map(p => (
          <div key={p.title} className="rounded-2xl overflow-hidden group" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="h-40 overflow-hidden relative">
              <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md" style={{ background: p.badgeColor }}>{p.badge}</div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">{p.title}</h3>
              <p className="text-sm text-slate-400 mb-6">{p.desc}</p>
              <div className="mb-2 flex justify-between text-xs font-bold text-slate-300"><span>Progresso da Obra</span><span>{p.progress}%</span></div>
              <div className="w-full rounded-full h-1.5" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div className="h-1.5 rounded-full" style={{ width: `${p.progress}%`, background: p.badgeColor }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NewsReaderModal({ article, closeModal }: { article: ApiNewsArticle; closeModal: () => void }) {
  return (
    <div>
      {article.imgUrl && (
        <div className="relative h-72">
          <img src={article.imgUrl} className="w-full h-full object-cover" alt="Notícia EVN" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#08080c] to-transparent pointer-events-none" />
        </div>
      )}
      <div className={`p-10 ${article.imgUrl ? "relative -mt-16 rounded-t-[2rem]" : ""}`} style={{ background: "#08080c" }}>
        <span className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">{article.tag}</span>
        <h2 className="text-3xl font-black text-white mt-4 mb-6 leading-tight">{article.title}</h2>
        <div className="leading-relaxed text-lg">
          <p className="mb-6 font-medium text-slate-200">{article.shortDesc}</p>
          <div className="prose-evn mb-8" dangerouslySetInnerHTML={{ __html: article.fullText }} />
        </div>
        <button onClick={closeModal} className="w-full font-bold py-4 rounded-xl transition-colors text-slate-200" style={{ background: "rgba(255,255,255,0.08)" }}>Fechar Leitura</button>
      </div>
    </div>
  );
}
