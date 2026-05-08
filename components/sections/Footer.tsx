"use client";

import { Zap, PhoneCall, Mail } from "lucide-react";
import type { ModalType } from "@/app/_types";

export function Footer({ setActiveModal }: { setActiveModal: (m: ModalType) => void }) {
  return (
    <footer className="border-t border-white/5 mt-8" style={{ background: "rgba(2,6,23,0.95)" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 border-2 border-orange-500 rounded-full flex items-center justify-center" style={{ boxShadow: "0 0 16px rgba(249,115,22,0.25)" }}>
                <Zap className="w-5 h-5 text-orange-500" />
              </div>
              <span className="font-black text-white text-sm uppercase tracking-widest">Vantara Nacional</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">Energia inteligente, fiável e sustentável para Moçambique.</p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-slate-400 text-sm"><PhoneCall className="w-4 h-4 text-orange-500 shrink-0" /><span>Linha Verde: <strong className="text-slate-300">1455</strong></span></div>
              <div className="flex items-center gap-3 text-slate-400 text-sm"><Mail className="w-4 h-4 text-orange-500 shrink-0" /><span>atendimento@evn.co.mz</span></div>
            </div>
          </div>

          {/* Serviços */}
          <div>
            <h5 className="font-black text-white text-sm uppercase tracking-widest mb-5">Serviços</h5>
            <ul className="space-y-3">
              {[
                { label: "Recarga Credelec",   modal: "CREDELEC" as ModalType },
                { label: "Nova Ligação",        modal: "NOVA_LIGACAO" as ModalType },
                { label: "Avisos de Corte",     modal: "CORTES" as ModalType },
                { label: "Simulador MZN",       modal: "SIMULADOR" as ModalType },
                { label: "Meus Contratos",      modal: "CONTRATOS" as ModalType },
              ].map(({ label, modal }) => (
                <li key={label}>
                  <button type="button" onClick={() => setActiveModal(modal)}
                    className="text-slate-500 hover:text-orange-400 text-sm transition-colors bg-transparent border-0 p-0 cursor-pointer">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h5 className="font-black text-white text-sm uppercase tracking-widest mb-5">Empresa</h5>
            <ul className="space-y-3">
              {[
                { label: "Missão e Valores", modal: "EMPRESA" as ModalType },
                { label: "Projectos EVN",    modal: "PROJECTOS" as ModalType },
                { label: "Recrutamento",     modal: "CONCURSOS" as ModalType },
                { label: "Imprensa",         modal: "NEWS" as ModalType },
              ].map(({ label, modal }) => (
                <li key={label}>
                  <button type="button" onClick={() => setActiveModal(modal)}
                    className="text-slate-500 hover:text-orange-400 text-sm transition-colors bg-transparent border-0 p-0 cursor-pointer">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="font-black text-white text-sm uppercase tracking-widest mb-5">Legal</h5>
            <ul className="space-y-3">
              {["Política de Privacidade", "Termos de Utilização", "Proteção de Dados", "Acessibilidade"].map(label => (
                <li key={label}>
                  <span className="text-slate-500 text-sm">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-sm">© 2026 Eletricidade Vantara Nacional, E.P. Todos os direitos reservados.</p>
          <p className="text-slate-700 text-xs">Portal Digital EVN — Versão 3.0</p>
        </div>
      </div>
    </footer>
  );
}
