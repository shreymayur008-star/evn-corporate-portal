"use client";

import { useState, useMemo } from "react";
import { Zap, ChevronRight, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export function CredelecModal({ closeModal }: { closeModal: () => void }) {
  const [step, setStep] = useState<"INPUT" | "PROCESSING" | "SUCCESS">("INPUT");
  const [data, setData] = useState({ meter: "", amount: "" });
  const [token, setToken] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isValid = useMemo(() =>
    /^\d{11}$/.test(data.meter) && !isNaN(parseInt(data.amount)) && parseInt(data.amount) >= 100,
    [data],
  );

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!/^\d{11}$/.test(data.meter)) newErrors.meter = "O contador deve conter exatamente 11 números.";
    const amt = parseInt(data.amount);
    if (isNaN(amt) || amt < 100) newErrors.amount = "O valor mínimo de recarga é de 100 MZN.";
    if (Object.keys(newErrors).length) { setErrors(newErrors); toast.error("Corrija os erros assinalados."); return; }
    setErrors({});
    setStep("PROCESSING");
    setTimeout(() => {
      setToken(Array.from({ length: 5 }, () => Math.floor(1000 + Math.random() * 9000)).join("-"));
      setStep("SUCCESS");
      toast.success("Transação aprovada com sucesso!");
    }, 2500);
  };

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[500px]">
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 md:w-2/5 p-10 text-white flex flex-col justify-center relative overflow-hidden">
        <div aria-hidden className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <Zap className="w-16 h-16 mb-6 text-orange-100 relative z-10" />
        <h2 className="text-3xl font-black mb-4 relative z-10">Recarga<br />Credelec EVN</h2>
        <p className="text-orange-100 text-sm leading-relaxed relative z-10">Integração oficial e segura com M-Pesa, e-Mola, mKesh e bancos nacionais.</p>
      </div>
      <div className="md:w-3/5 p-10 flex flex-col justify-center">
        {step === "INPUT" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-bold text-slate-200 block mb-2">Número do Contador <span className="text-red-400">*</span></label>
              <input type="text" maxLength={11} placeholder="Introduza os 11 dígitos"
                className={`w-full border-2 p-4 rounded-xl font-mono text-lg outline-none transition-colors text-slate-100 placeholder:text-slate-600 ${errors.meter ? "border-red-500" : "border-white/10 focus:border-orange-500"}`}
                style={{ background: errors.meter ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.05)" }}
                value={data.meter} onChange={e => setData(d => ({ ...d, meter: e.target.value.replace(/\D/g, "") }))} />
              {errors.meter ? <p className="text-red-400 text-sm mt-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {errors.meter}</p> : <p className="text-slate-500 text-xs mt-2">O número encontra-se no seu cartão EVN.</p>}
            </div>
            <div>
              <label className="text-sm font-bold text-slate-200 block mb-2">Valor da Recarga (MZN) <span className="text-red-400">*</span></label>
              <input type="number" placeholder="Ex: 500"
                className={`w-full border-2 p-4 rounded-xl font-bold text-lg outline-none transition-colors text-slate-100 placeholder:text-slate-600 ${errors.amount ? "border-red-500" : "border-white/10 focus:border-orange-500"}`}
                style={{ background: errors.amount ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.05)" }}
                value={data.amount} onChange={e => setData(d => ({ ...d, amount: e.target.value }))} />
              {errors.amount && <p className="text-red-400 text-sm mt-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {errors.amount}</p>}
            </div>
            <button type="submit" disabled={!isValid} style={{ opacity: isValid ? 1 : 0.42, cursor: isValid ? "pointer" : "not-allowed" }}
              className="w-full bg-[#16a34a] text-white font-bold py-4 rounded-xl shadow-[0_4px_15px_rgba(22,163,74,0.3)] transition-opacity text-lg flex items-center justify-center gap-2">
              Pagar e Gerar Token <ChevronRight className="w-5 h-5" />
            </button>
          </form>
        )}
        {step === "PROCESSING" && (
          <div className="py-16 flex flex-col items-center text-center">
            <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">A processar transação</h3>
            <p className="text-slate-400">Por favor, confirme o pagamento no seu telemóvel...</p>
          </div>
        )}
        {step === "SUCCESS" && (
          <div className="py-12 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(22,163,74,0.15)", color: "#4ade80" }}><CheckCircle2 className="w-10 h-10" /></div>
            <h3 className="text-2xl font-bold text-white mb-2">Recarga Efetuada!</h3>
            <p className="text-slate-400 mb-8">Introduza o código abaixo no seu contador EVN.</p>
            <div className="rounded-2xl p-6 w-full mb-8" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <p className="font-mono text-4xl font-black text-slate-100 tracking-[0.2em]">{token}</p>
            </div>
            <button onClick={closeModal} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl transition-all">Fechar Janela</button>
          </div>
        )}
      </div>
    </div>
  );
}
