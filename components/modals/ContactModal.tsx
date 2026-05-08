"use client";

import { useState, useMemo } from "react";
import { PhoneCall, Mail, Smartphone, Send } from "lucide-react";
import toast from "react-hot-toast";

export function ContactModal() {
  const [form, setForm] = useState({ nome: "", email: "", mensagem: "" });

  const isValid = useMemo(
    () => form.nome.trim().length > 0 && form.email.trim().length > 0 && form.mensagem.trim().length > 0,
    [form],
  );

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.mensagem.trim()) return;
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      toast.success("Mensagem enviada! A EVN entrará em contacto brevemente.");
      setForm({ nome: "", email: "", mensagem: "" });
    } catch {
      toast.error("Não foi possível enviar a mensagem. Tente novamente.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[600px]">
      <div className="md:w-1/2 p-10 bg-slate-900 text-white flex flex-col justify-center">
        <PhoneCall className="w-16 h-16 text-orange-500 mb-6" />
        <h2 className="text-3xl font-black mb-4">Apoio EVN</h2>
        <p className="text-slate-400 mb-10 leading-relaxed">Centro de atendimento disponível 24/7 para responder a qualquer emergência ou dúvida.</p>
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-500"><PhoneCall className="w-6 h-6" /></div>
            <div><p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Linha Verde (Gratuita)</p><p className="text-2xl font-bold">1455</p></div>
          </div>
          <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700 cursor-pointer hover:border-[#25D366] transition-colors" onClick={() => toast.success("A abrir WhatsApp EVN...")}>
            <div className="w-12 h-12 bg-[#25D366]/20 rounded-full flex items-center justify-center text-[#25D366]"><Smartphone className="w-6 h-6" /></div>
            <div><p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">WhatsApp Oficial</p><p className="text-lg font-bold">+258 82 145 5000</p></div>
          </div>
          <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400"><Mail className="w-6 h-6" /></div>
            <div><p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Email Institucional</p><p className="text-lg font-bold">atendimento@evn.co.mz</p></div>
          </div>
        </div>
      </div>

      <div className="md:w-1/2 p-10 flex flex-col justify-center">
        <h3 className="text-2xl font-bold text-white mb-6">Envie uma Mensagem</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div><label className="text-sm font-bold text-slate-300 block mb-2">Seu Nome</label><input type="text" required className="w-full border p-4 rounded-xl outline-none transition-colors text-slate-100 placeholder:text-slate-600 focus:border-orange-500" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} /></div>
          <div><label className="text-sm font-bold text-slate-300 block mb-2">Email ou Contacto</label><input type="text" required className="w-full border p-4 rounded-xl outline-none transition-colors text-slate-100 placeholder:text-slate-600 focus:border-orange-500" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div><label className="text-sm font-bold text-slate-300 block mb-2">Mensagem Detalhada</label><textarea required rows={4} className="w-full border p-4 rounded-xl outline-none transition-colors resize-none text-slate-100 placeholder:text-slate-600 focus:border-orange-500" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} value={form.mensagem} onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))} /></div>
          <button type="submit" disabled={!isValid} style={{ opacity: isValid ? 1 : 0.42, cursor: isValid ? "pointer" : "not-allowed" }} className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl transition-opacity shadow-lg flex items-center justify-center gap-2"><Send className="w-5 h-5" /> Enviar para EVN</button>
        </form>
      </div>
    </div>
  );
}
