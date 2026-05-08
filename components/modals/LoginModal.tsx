"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Loader2, KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import type { ModalType } from "@/app/_types";

export function LoginModal({ setActiveModal }: { setActiveModal: (m: ModalType) => void }) {
  const [loginStep, setLoginStep] = useState<"LOGIN" | "FORGOT" | "RECOVERY_SENT">("LOGIN");
  const [loginData, setLoginData] = useState({ contact: "", password: "" });
  const [forgotData, setForgotData] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loginValid = useMemo(
    () => loginData.contact.includes("@") && loginData.password.length >= 4,
    [loginData],
  );

  const handleLogin = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!loginValid) return setErrors({ auth: "Credenciais inválidas." });
    setErrors({});
    setIsLoggingIn(true);
    setTimeout(() => { setIsLoggingIn(false); setActiveModal("DASHBOARD"); toast.success("Bem-vindo à Área de Cliente."); }, 1500);
  };

  const handleForgot = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotData) || /^8[2-7]\d{7}$/.test(forgotData);
    if (!ok) { setErrors({ forgot: "Insira um contacto válido registado no sistema." }); return; }
    setErrors({});
    setIsLoggingIn(true);
    setTimeout(() => { setIsLoggingIn(false); setLoginStep("RECOVERY_SENT"); }, 1500);
  };

  return (
    <div className="p-10 text-center max-w-md mx-auto relative h-[500px]">
      <AnimatePresence mode="wait">
        {loginStep === "LOGIN" && (
          <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(249,115,22,0.12)" }}><User className="w-10 h-10 text-orange-500" /></div>
            <h2 className="text-3xl font-black mb-2 text-white">Portal do Cliente EVN</h2>
            <p className="text-slate-400 mb-8">Acesso seguro ao seu Smart Dashboard.</p>
            <form onSubmit={handleLogin} className="space-y-5 text-left">
              <div><label className="text-sm font-bold text-slate-300 block mb-2">Contacto ou Email Registado</label><input type="text" className={`w-full border-2 p-4 rounded-xl outline-none transition-colors text-slate-100 placeholder:text-slate-600 ${errors.auth ? "border-red-500" : "border-white/10 focus:border-orange-500"}`} style={{ background: "rgba(255,255,255,0.05)" }} value={loginData.contact} onChange={e => setLoginData(d => ({ ...d, contact: e.target.value }))} placeholder="Ex: 840000000" /></div>
              <div><label className="text-sm font-bold text-slate-300 block mb-2">Palavra-passe</label><input type="password" className={`w-full border-2 p-4 rounded-xl outline-none transition-colors text-slate-100 placeholder:text-slate-600 ${errors.auth ? "border-red-500" : "border-white/10 focus:border-orange-500"}`} style={{ background: "rgba(255,255,255,0.05)" }} value={loginData.password} onChange={e => setLoginData(d => ({ ...d, password: e.target.value }))} placeholder="••••••••" />
                {errors.auth && <p className="text-red-400 text-xs mt-1 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.auth}</p>}
              </div>
              <div className="text-right"><span onClick={() => setLoginStep("FORGOT")} className="text-sm font-bold text-orange-500 cursor-pointer hover:underline">Esqueceu a senha?</span></div>
              <button type="submit" disabled={isLoggingIn || !loginValid} style={{ opacity: loginValid && !isLoggingIn ? 1 : 0.42, cursor: loginValid && !isLoggingIn ? "pointer" : "not-allowed" }} className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl transition-opacity shadow-lg flex justify-center items-center gap-2">
                {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar no Dashboard"}
              </button>
            </form>
          </motion.div>
        )}
        {loginStep === "FORGOT" && (
          <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(255,255,255,0.08)" }}><KeyRound className="w-10 h-10 text-slate-300" /></div>
            <h2 className="text-3xl font-black mb-2 text-white">Recuperar Senha</h2>
            <p className="text-slate-400 mb-8">Insira o seu contacto para receber um código de acesso.</p>
            <form onSubmit={handleForgot} className="space-y-5 text-left">
              <div><label className="text-sm font-bold text-slate-300 block mb-2">Email ou Telemóvel</label><input type="text" className={`w-full border-2 p-4 rounded-xl outline-none transition-colors text-slate-100 placeholder:text-slate-600 ${errors.forgot ? "border-red-500" : "border-white/10 focus:border-orange-500"}`} style={{ background: "rgba(255,255,255,0.05)" }} value={forgotData} onChange={e => setForgotData(e.target.value)} placeholder="Ex: 840000000" />
                {errors.forgot && <p className="text-red-400 text-xs mt-1 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.forgot}</p>}
              </div>
              <button type="submit" disabled={isLoggingIn} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2">{isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : "Recuperar Acesso"}</button>
              <button type="button" onClick={() => setLoginStep("LOGIN")} className="w-full bg-transparent text-slate-500 font-bold py-3 flex justify-center items-center gap-2 hover:text-slate-300 transition-colors"><ArrowLeft className="w-4 h-4" /> Voltar ao Login</button>
            </form>
          </motion.div>
        )}
        {loginStep === "RECOVERY_SENT" && (
          <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full pt-10">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(22,163,74,0.12)" }}><CheckCircle2 className="w-12 h-12 text-green-400" /></div>
            <h2 className="text-2xl font-black mb-2 text-white">Instruções Enviadas</h2>
            <p className="text-slate-400 mb-8">Verifique o seu telemóvel ou email para redefinir a palavra-passe.</p>
            <button onClick={() => setLoginStep("LOGIN")} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-all">Voltar</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
