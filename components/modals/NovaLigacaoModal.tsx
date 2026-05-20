"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const MZ_PHONE = /^8[2-7]\d{7}$/;

export function NovaLigacaoModal({ closeModal }: { closeModal: () => void }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ nome: "", nuit: "", telefone: "", endereco: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (f: string) => setTouched(prev => ({ ...prev, [f]: true }));

  const step1Valid = useMemo(
    () => data.nome.trim().length >= 3 && /^\d{9}$/.test(data.nuit) && MZ_PHONE.test(data.telefone),
    [data],
  );
  const step2Valid = useMemo(() => data.endereco.trim().length >= 10, [data]);

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (data.nome.trim().length < 5) newErrors.nome = "Insira o nome completo.";
      if (!/^\d{9}$/.test(data.nuit)) newErrors.nuit = "NUIT inválido (deve ter 9 dígitos).";
      if (!MZ_PHONE.test(data.telefone)) newErrors.telefone = "Contacto inválido (Ex: 841234567).";
      if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
      setErrors({}); setStep(2);
    } else {
      if (data.endereco.trim().length < 10) { setErrors({ endereco: "Forneça um endereço detalhado." }); return; }
      toast.success("Pedido de Nova Ligação submetido à EVN com sucesso!");
      closeModal();
      setData({ nome: "", nuit: "", telefone: "", endereco: "" });
    }
  };

  return (
    <div className="p-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-orange-500" style={{ background: "rgba(249,115,22,0.1)" }}><Zap className="w-8 h-8" /></div>
        <div><h2 className="text-3xl font-black text-white">Nova Ligação EVN</h2><p className="text-slate-400">Pedido oficial de integração à rede elétrica.</p></div>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <div className="h-1 flex-1 rounded-full bg-orange-500" />
        <div className="h-1 flex-1 rounded-full transition-colors" style={{ background: step > 1 ? "#f97316" : "rgba(255,255,255,0.1)" }} />
      </div>
      <p className="text-xs text-slate-500 mb-6">
        Passo {step} de 2 —{" "}
        {step === 1
          ? `${Math.round(([data.nome.trim().length >= 3, /^\d{9}$/.test(data.nuit), MZ_PHONE.test(data.telefone)].filter(Boolean).length / 3) * 50)}% completo`
          : `${data.endereco.trim().length >= 10 ? "100" : "50"}% completo`
        }
      </p>
      <form className="space-y-6">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h3 className="text-lg font-bold text-white pb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Passo 1: Dados do Titular</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-slate-300 block mb-2">Nome Completo</label>
                <input type="text"
                  className={`w-full border-2 p-4 rounded-xl outline-none transition-colors text-slate-100 placeholder:text-slate-600 ${touched.nome && data.nome.trim().length < 3 ? "border-red-500" : data.nome.trim().length >= 3 ? "border-green-500/60" : "border-white/10 focus:border-orange-500"}`}
                  style={{ background: "rgba(255,255,255,0.05)" }}
                  value={data.nome}
                  onChange={e => setData(d => ({ ...d, nome: e.target.value }))}
                  onBlur={() => touch("nome")}
                  placeholder="Como consta no BI" />
                {touched.nome && data.nome.trim().length < 3 && (
                  <p className="text-amber-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Mínimo 3 caracteres.</p>
                )}
                {errors.nome && <p className="text-red-400 text-xs mt-1 font-medium">{errors.nome}</p>}
              </div>
              <div>
                <label className="text-sm font-bold text-slate-300 block mb-2">NUIT (9 Dígitos)</label>
                <input type="text" maxLength={9}
                  className={`w-full border-2 p-4 rounded-xl font-mono outline-none transition-colors text-slate-100 placeholder:text-slate-600 ${touched.nuit && !/^\d{9}$/.test(data.nuit) ? "border-red-500" : /^\d{9}$/.test(data.nuit) ? "border-green-500/60" : "border-white/10 focus:border-orange-500"}`}
                  style={{ background: "rgba(255,255,255,0.05)" }}
                  value={data.nuit}
                  onChange={e => setData(d => ({ ...d, nuit: e.target.value.replace(/\D/g, "") }))}
                  onBlur={() => touch("nuit")}
                  placeholder="Ex: 123456789" />
                <div className="flex items-center justify-between mt-1">
                  {touched.nuit && !/^\d{9}$/.test(data.nuit)
                    ? <p className="text-amber-400 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.nuit || "NUIT deve ter 9 dígitos."}</p>
                    : <span />
                  }
                  <span className={`text-xs tabular-nums font-mono ${/^\d{9}$/.test(data.nuit) ? "text-emerald-400" : "text-slate-500"}`}>{data.nuit.length}/9</span>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-300 block mb-2">Telemóvel</label>
              <input type="tel"
                className={`w-full border-2 p-4 rounded-xl outline-none transition-colors text-slate-100 placeholder:text-slate-600 ${touched.telefone && !MZ_PHONE.test(data.telefone) ? "border-red-500" : MZ_PHONE.test(data.telefone) ? "border-green-500/60" : "border-white/10 focus:border-orange-500"}`}
                style={{ background: "rgba(255,255,255,0.05)" }}
                value={data.telefone}
                onChange={e => setData(d => ({ ...d, telefone: e.target.value.replace(/\D/g, "") }))}
                onBlur={() => touch("telefone")}
                placeholder="Ex: 840000000" />
              <div className="flex items-center justify-between mt-1">
                {touched.telefone && !MZ_PHONE.test(data.telefone)
                  ? <p className="text-amber-400 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.telefone || "Contacto inválido (Ex: 841234567)."}</p>
                  : <span />
                }
                <span className={`text-xs tabular-nums font-mono ${MZ_PHONE.test(data.telefone) ? "text-emerald-400" : "text-slate-500"}`}>{data.telefone.length}/9</span>
              </div>
            </div>
          </motion.div>
        )}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h3 className="text-lg font-bold text-white pb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Passo 2: Localização da Obra</h3>
            <div>
              <label className="text-sm font-bold text-slate-300 block mb-2">Endereço Completo</label>
              <textarea rows={4} className={`w-full border-2 p-4 rounded-xl outline-none resize-none transition-colors text-slate-100 placeholder:text-slate-600 ${errors.endereco ? "border-red-500" : "border-white/10 focus:border-orange-500"}`} style={{ background: errors.endereco ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.05)" }} value={data.endereco} onChange={e => setData(d => ({ ...d, endereco: e.target.value }))} placeholder="Descreva a província, cidade, bairro, etc." />
              {errors.endereco && <p className="text-red-400 text-xs mt-1 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.endereco}</p>}
            </div>
          </motion.div>
        )}
        <div className="flex gap-4 pt-4">
          {step === 2 && <button type="button" onClick={() => setStep(1)} className="font-bold py-4 px-8 rounded-xl transition-all text-slate-200" style={{ background: "rgba(255,255,255,0.08)" }}>Voltar</button>}
          <button type="button" onClick={handleNext}
            disabled={step === 1 ? !step1Valid : !step2Valid}
            style={{ opacity: (step === 1 ? step1Valid : step2Valid) ? 1 : 0.42, cursor: (step === 1 ? step1Valid : step2Valid) ? "pointer" : "not-allowed" }}
            className="flex-1 bg-orange-500 text-white font-bold py-4 rounded-xl transition-opacity shadow-lg shadow-orange-500/20">
            {step === 1 ? "Continuar" : "Submeter Pedido EVN"}
          </button>
        </div>
      </form>
    </div>
  );
}
