"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileSearch, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function ContratosModal() {
  const [search, setSearch] = useState("");
  const [result, setResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!/^\d{9}$/.test(search)) { setErrors({ search: "NUIT inválido. Introduza 9 dígitos." }); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => { setLoading(false); setResult(true); toast.success("Contrato EVN localizado na base de dados."); }, 1500);
  };

  return (
    <div className="p-10">
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(249,115,22,0.1)" }}><FileSearch className="w-10 h-10 text-orange-500" /></div>
        <h2 className="text-3xl font-black text-white mb-2">Gestão de Contratos EVN</h2>
        <p className="text-slate-400">Consulte o estado da sua ligação e titularidade.</p>
      </div>

      {!result ? (
        <form onSubmit={handleSearch} className="max-w-md mx-auto">
          <label className="text-sm font-bold text-slate-300 block mb-2 text-center">Insira o seu NUIT (9 Dígitos)</label>
          <div className="flex flex-col gap-3">
            <input type="text" maxLength={9} className={`w-full border-2 p-4 rounded-xl font-mono text-center text-xl outline-none transition-colors text-slate-100 placeholder:text-slate-600 ${errors.search ? "border-red-500" : "border-white/10 focus:border-orange-500"}`} style={{ background: "rgba(255,255,255,0.05)" }} placeholder="Ex: 123456789" value={search} onChange={e => setSearch(e.target.value.replace(/\D/g, ""))} />
            {errors.search && <p className="text-red-400 text-xs font-bold text-center">{errors.search}</p>}
            <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Validar Contrato EVN"}
            </button>
          </div>
        </form>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto rounded-3xl p-8" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex justify-between items-start pb-6 mb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div><p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Titular do Contrato</p><h3 className="text-2xl font-black text-white">Cliente Verificado</h3><p className="text-sm text-slate-400 font-mono mt-1">NUIT: {search}</p></div>
            <span className="text-xs font-bold px-3 py-1 rounded-full text-green-400" style={{ background: "rgba(22,163,74,0.15)", border: "1px solid rgba(22,163,74,0.3)" }}>Activo na Rede EVN</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }}><p className="text-xs text-slate-500 font-bold mb-1">Tipo de Ligação</p><p className="font-bold text-white">Doméstica - Monofásica</p></div>
            <div className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }}><p className="text-xs text-slate-500 font-bold mb-1">Situação Financeira</p><p className="font-bold text-green-400">Sem dívidas à EVN</p></div>
          </div>
          <button onClick={() => setResult(false)} className="w-full font-bold py-4 rounded-xl transition-all text-slate-200" style={{ background: "rgba(255,255,255,0.08)" }}>Nova Pesquisa</button>
        </motion.div>
      )}
    </div>
  );
}
