"use client";

import Link from "next/link";
import { Zap, PhoneCall, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 mt-8" style={{ background: "rgba(2,6,23,0.95)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-12 sm:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1 mb-2 lg:mb-0">
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
                { label: "Recarga Credelec",  href: "/#credelec" },
                { label: "Nova Ligação",       href: "/#nova-ligacao" },
                { label: "Avisos de Corte",    href: "/#cortes" },
                { label: "Simulador MZN",      href: "/#simulador" },
                { label: "Meus Contratos",     href: "/#contratos" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-slate-500 hover:text-orange-400 text-sm transition-colors py-2 block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h5 className="font-black text-white text-sm uppercase tracking-widest mb-5">Empresa</h5>
            <ul className="space-y-3">
              {[
                { label: "Missão e Valores", href: "/#empresa" },
                { label: "Projectos EVN",    href: "/#projectos" },
                { label: "Recrutamento",     href: "/#concursos" },
                { label: "Imprensa",         href: "/imprensa" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-slate-500 hover:text-orange-400 text-sm transition-colors py-2 block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-2 sm:col-span-1">
            <h5 className="font-black text-white text-sm uppercase tracking-widest mb-5">Legal</h5>
            <ul className="space-y-3">
              {[
                { label: "Política de Privacidade", href: "/privacidade" },
                { label: "Termos de Utilização",    href: "/termos" },
                { label: "Proteção de Dados",       href: "/protecao-dados" },
                { label: "Acessibilidade",          href: "/acessibilidade" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-slate-500 hover:text-orange-400 text-sm transition-colors py-2 block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-slate-600 text-sm">© 2026 Eletricidade Vantara Nacional, E.P. Todos os direitos reservados.</p>
          <p className="text-slate-700 text-xs">Portal Digital EVN — Versão 3.0</p>
        </div>
      </div>
    </footer>
  );
}
