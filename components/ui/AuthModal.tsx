"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Eye, EyeOff, User, Mail, Phone, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: { id: number; nome: string; email: string }) => void;
  defaultTab?: "login" | "register";
}

type Tab = "login" | "register";

const STORAGE_KEY_NAME  = "evn_last_user_name";
const STORAGE_KEY_EMAIL = "evn_last_user_email";

export function saveUserLocally(nome: string, email: string) {
  try { localStorage.setItem(STORAGE_KEY_NAME, nome); localStorage.setItem(STORAGE_KEY_EMAIL, email); } catch { /* unavailable */ }
}

export function clearUserLocally() {
  try { localStorage.removeItem(STORAGE_KEY_NAME); localStorage.removeItem(STORAGE_KEY_EMAIL); } catch { /* unavailable */ }
}

export default function AuthModal({ open, onClose, onSuccess, defaultTab = "login" }: AuthModalProps) {
  const [tab, setTab]               = useState<Tab>(defaultTab);
  const [loading, setLoading]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const [loginForm, setLoginForm]     = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ nome: "", email: "", telefone: "", password: "", confirmPassword: "" });

  // Live validation touch tracking
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touchField  = (f: string) => setTouched(prev => ({ ...prev, [f]: true }));
  const clearTouched = () => setTouched({});

  // Pre-fill login email from localStorage when switching to login tab
  useEffect(() => {
    if (tab === "login") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_EMAIL);
        if (saved) setLoginForm(prev => ({ ...prev, email: prev.email || saved }));
      } catch { /* unavailable */ }
    }
  }, [tab]);

  // Sync defaultTab prop
  useEffect(() => { setTab(defaultTab); }, [defaultTab]);

  // Reset on open/close
  useEffect(() => {
    if (!open) { clearTouched(); setGeneralError(""); }
  }, [open]);

  const getFieldError = (field: string): string => {
    if (!touched[field]) return "";
    switch (field) {
      case "login_email":    return !loginForm.email.includes("@") ? "Email inválido." : "";
      case "login_password": return !loginForm.password ? "Insira a palavra-passe." : "";
      case "reg_nome":       return registerForm.nome.trim().length < 3 ? "Mínimo 3 caracteres." : "";
      case "reg_email":      return !registerForm.email.includes("@") ? "Email inválido." : "";
      case "reg_password":   return registerForm.password.length < 8 ? "Mínimo 8 caracteres." : "";
      case "reg_confirm":
        if (registerForm.confirmPassword.length === 0) return "Confirme a palavra-passe.";
        return registerForm.confirmPassword !== registerForm.password ? "As palavras-passe não coincidem." : "";
      default: return "";
    }
  };

  const passwordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8)           score++;
    if (pw.length >= 12)          score++;
    if (/[A-Z]/.test(pw))         score++;
    if (/[0-9]/.test(pw))         score++;
    if (/[^A-Za-z0-9]/.test(pw))  score++;
    const levels = [
      { label: "Muito Fraca",  color: "#ef4444" },
      { label: "Fraca",        color: "#f97316" },
      { label: "Média",        color: "#eab308" },
      { label: "Forte",        color: "#22c55e" },
      { label: "Muito Forte",  color: "#10b981" },
      { label: "Excelente",    color: "#06b6d4" },
    ];
    return { score, ...levels[Math.min(score, 5)] };
  };

  const inputClass = (hasError: boolean, extra = "") =>
    `w-full pl-10 pr-4 py-3 rounded-xl outline-none text-slate-100 placeholder:text-slate-600 transition-colors text-sm ${
      hasError
        ? "bg-red-500/10 border-2 border-red-500/60 focus:border-red-400"
        : "bg-white/[0.05] border-2 border-white/10 focus:border-orange-500"
    } ${extra}`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    // Touch all login fields on submit
    setTouched(prev => ({ ...prev, login_email: true, login_password: true }));
    if (!loginForm.email.includes("@") || !loginForm.password) return;

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/user/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(loginForm) });
      const data = await res.json() as { user?: { id: number; nome: string; email: string }; error?: string };
      if (!res.ok) { setGeneralError(data.error ?? "Erro ao iniciar sessão."); return; }
      saveUserLocally(data.user!.nome, data.user!.email);
      onSuccess(data.user!);
      onClose();
    } catch {
      setGeneralError("Erro de ligação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setTouched({ reg_nome: true, reg_email: true, reg_password: true, reg_confirm: true });
    if (
      registerForm.nome.trim().length < 3 ||
      !registerForm.email.includes("@") ||
      registerForm.password.length < 8 ||
      registerForm.password !== registerForm.confirmPassword
    ) return;

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/user/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome: registerForm.nome, email: registerForm.email, password: registerForm.password, telefone: registerForm.telefone || undefined }) });
      const data = await res.json() as { user?: { id: number; nome: string; email: string }; error?: string };
      if (!res.ok) { setGeneralError(data.error ?? "Erro ao criar conta."); return; }
      saveUserLocally(data.user!.nome, data.user!.email);
      onSuccess(data.user!);
      onClose();
    } catch {
      setGeneralError("Erro de ligação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const pwdErr    = getFieldError("reg_password");
  const pwdStr    = passwordStrength(registerForm.password);
  const confErr   = getFieldError("reg_confirm");
  const confMatch = registerForm.confirmPassword.length > 0 && registerForm.password === registerForm.confirmPassword;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
            style={{ background: "rgba(9,9,11,0.97)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1.5rem", boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(249,115,22,0.08)" }}
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
                <button key={t} type="button" onClick={() => { setTab(t); setGeneralError(""); clearTouched(); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${tab === t ? "bg-orange-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"}`}
                >
                  {t === "login" ? "Iniciar Sessão" : "Criar Conta"}
                </button>
              ))}
            </div>

            {/* Forms */}
            <div className="p-6 space-y-4">
              {generalError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{generalError}</p>
                </div>
              )}

              <AnimatePresence mode="wait">
                {tab === "login" ? (
                  <motion.form key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleLogin} className="space-y-3">
                    {/* Email */}
                    <div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="email" placeholder="Email" value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          onBlur={() => touchField("login_email")}
                          className={inputClass(!!getFieldError("login_email"))}
                          autoComplete="email" />
                      </div>
                      {getFieldError("login_email") && (
                        <p className="text-amber-400 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />{getFieldError("login_email")}
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type={showPassword ? "text" : "password"} placeholder="Palavra-passe"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          onBlur={() => touchField("login_password")}
                          className={inputClass(!!getFieldError("login_password"), "pr-10")}
                          autoComplete="current-password" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {getFieldError("login_password") && (
                        <p className="text-amber-400 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />{getFieldError("login_password")}
                        </p>
                      )}
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-60" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
                      {loading ? "A verificar…" : "Entrar"}
                    </button>
                    <p className="text-center text-slate-500 text-xs">
                      Não tem conta?{" "}
                      <button type="button" onClick={() => setTab("register")} className="text-orange-400 hover:text-orange-300 font-medium">Registar agora</button>
                    </p>
                  </motion.form>
                ) : (
                  <motion.form key="register" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onSubmit={handleRegister} className="space-y-3">
                    {/* Nome */}
                    <div>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="text" placeholder="Nome completo" value={registerForm.nome}
                          onChange={(e) => setRegisterForm({ ...registerForm, nome: e.target.value })}
                          onBlur={() => touchField("reg_nome")}
                          className={inputClass(!!getFieldError("reg_nome"))}
                          autoComplete="name" />
                      </div>
                      {getFieldError("reg_nome") && (
                        <p className="text-amber-400 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />{getFieldError("reg_nome")}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="email" placeholder="Email" value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          onBlur={() => touchField("reg_email")}
                          className={inputClass(!!getFieldError("reg_email"))}
                          autoComplete="email" />
                      </div>
                      {getFieldError("reg_email") && (
                        <p className="text-amber-400 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />{getFieldError("reg_email")}
                        </p>
                      )}
                    </div>

                    {/* Telefone */}
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="tel" placeholder="Telemóvel (opcional)" value={registerForm.telefone}
                        onChange={(e) => setRegisterForm({ ...registerForm, telefone: e.target.value })}
                        className={inputClass(false)}
                        autoComplete="tel" />
                    </div>

                    {/* Password with strength bar */}
                    <div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type={showPassword ? "text" : "password"} placeholder="Palavra-passe (mín. 8 caracteres)"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          onBlur={() => touchField("reg_password")}
                          className={inputClass(!!pwdErr, "pr-10")}
                          autoComplete="new-password" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {pwdErr && <p className="text-amber-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{pwdErr}</p>}
                      {registerForm.password.length > 0 && (
                        <div className="mt-2">
                          <div className="flex gap-1 mb-1">
                            {[1,2,3,4,5].map(i => (
                              <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                                style={{ background: i <= pwdStr.score ? pwdStr.color : "rgba(255,255,255,0.1)" }} />
                            ))}
                          </div>
                          <p className="text-xs transition-colors" style={{ color: pwdStr.color }}>{pwdStr.label}</p>
                        </div>
                      )}
                    </div>

                    {/* Confirm password */}
                    <div>
                      <div className="relative">
                        <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type={showPassword ? "text" : "password"} placeholder="Confirmar palavra-passe"
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                          onBlur={() => touchField("reg_confirm")}
                          className={inputClass(!!confErr, confMatch ? "pr-10" : "")}
                          autoComplete="new-password" />
                        {confMatch && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          </div>
                        )}
                      </div>
                      {confErr && <p className="text-amber-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{confErr}</p>}
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
