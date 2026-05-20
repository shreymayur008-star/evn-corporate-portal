"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Eye, EyeOff, User, Mail, Phone, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: { id: number; nome: string; email: string }) => void;
  defaultTab?: "login" | "register";
}

type Tab = "login" | "register";

interface FormErrors {
  nome?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function AuthModal({ open, onClose, onSuccess, defaultTab = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    nome: "", email: "", telefone: "", password: "", confirmPassword: "",
  });

  const clearErrors = () => setErrors({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (!loginForm.email.includes("@")) { setErrors({ email: "Insira um email válido." }); return; }
    if (!loginForm.password) { setErrors({ password: "Insira a palavra-passe." }); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json() as { user?: { id: number; nome: string; email: string }; error?: string };
      if (!res.ok) { setErrors({ general: data.error }); return; }
      onSuccess(data.user!);
      onClose();
    } catch {
      setErrors({ general: "Erro de ligação. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    const errs: FormErrors = {};
    if (registerForm.nome.trim().length < 3) errs.nome = "Nome demasiado curto.";
    if (!registerForm.email.includes("@")) errs.email = "Email inválido.";
    if (registerForm.password.length < 8) errs.password = "Mínimo 8 caracteres.";
    if (registerForm.password !== registerForm.confirmPassword) errs.confirmPassword = "As palavras-passe não coincidem.";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: registerForm.nome,
          email: registerForm.email,
          password: registerForm.password,
          telefone: registerForm.telefone || undefined,
        }),
      });
      const data = await res.json() as { user?: { id: number; nome: string; email: string }; error?: string };
      if (!res.ok) { setErrors({ general: data.error }); return; }
      onSuccess(data.user!);
      onClose();
    } catch {
      setErrors({ general: "Erro de ligação. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field?: keyof FormErrors) =>
    `w-full pl-10 pr-4 py-3 rounded-xl outline-none text-slate-100 placeholder:text-slate-600 transition-colors text-sm ${
      field && errors[field]
        ? "bg-red-500/10 border-2 border-red-500/60 focus:border-red-400"
        : "bg-white/[0.05] border-2 border-white/10 focus:border-orange-500"
    }`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(9,9,11,0.97)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "1.5rem",
              boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(249,115,22,0.08)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-slate-100 font-black text-lg leading-none">Portal do Cliente</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Eletricidade Vantara Nacional</p>
                </div>
              </div>
              <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-500 hover:text-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-1 mx-6 mt-5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              {(["login", "register"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTab(t); clearErrors(); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                    tab === t ? "bg-orange-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {t === "login" ? "Iniciar Sessão" : "Criar Conta"}
                </button>
              ))}
            </div>

            {/* Forms */}
            <div className="p-6 space-y-4">
              {errors.general && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{errors.general}</p>
                </div>
              )}

              <AnimatePresence mode="wait">
                {tab === "login" ? (
                  <motion.form key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleLogin} className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="email" placeholder="Email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className={inputClass("email")} autoComplete="email" />
                      {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type={showPassword ? "text" : "password"} placeholder="Palavra-passe" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className={`${inputClass("password")} pr-10`} autoComplete="current-password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-60" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
                      {loading ? "A verificar…" : "Entrar"}
                    </button>
                    <p className="text-center text-slate-500 text-xs">
                      Não tem conta?{" "}
                      <button type="button" onClick={() => setTab("register")} className="text-orange-400 hover:text-orange-300 font-medium">
                        Registar agora
                      </button>
                    </p>
                  </motion.form>
                ) : (
                  <motion.form key="register" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onSubmit={handleRegister} className="space-y-3">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="text" placeholder="Nome completo" value={registerForm.nome} onChange={(e) => setRegisterForm({ ...registerForm, nome: e.target.value })} className={inputClass("nome")} autoComplete="name" />
                      {errors.nome && <p className="text-red-400 text-xs mt-1">{errors.nome}</p>}
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="email" placeholder="Email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} className={inputClass("email")} autoComplete="email" />
                      {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="tel" placeholder="Telemóvel (opcional)" value={registerForm.telefone} onChange={(e) => setRegisterForm({ ...registerForm, telefone: e.target.value })} className={inputClass()} autoComplete="tel" />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type={showPassword ? "text" : "password"} placeholder="Palavra-passe (mín. 8 caracteres)" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} className={`${inputClass("password")} pr-10`} autoComplete="new-password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                    </div>
                    <div className="relative">
                      <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type={showPassword ? "text" : "password"} placeholder="Confirmar palavra-passe" value={registerForm.confirmPassword} onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} className={inputClass("confirmPassword")} autoComplete="new-password" />
                      {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-60" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
                      {loading ? "A criar conta…" : "Criar Conta Gratuita"}
                    </button>
                    <p className="text-center text-slate-600 text-xs">
                      Ao registar, aceita os{" "}
                      <a href="/termos" target="_blank" className="text-orange-400/70 hover:text-orange-400">Termos de Utilização</a>
                      {" "}e a{" "}
                      <a href="/privacidade" target="_blank" className="text-orange-400/70 hover:text-orange-400">Política de Privacidade</a>
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
