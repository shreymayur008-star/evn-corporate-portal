"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Zap, Loader2, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Credenciais inválidas. Verifique o email e a palavra-passe.");
    } else {
      router.push("/admin/cms");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#020617" }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-10"
        style={{
          background: "rgba(8,8,12,0.92)",
          backdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow:
            "0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <div className="text-center mb-10">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(249,115,22,0.12)" }}
          >
            <Zap className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-3xl font-black text-white mb-1">Portal Administrativo</h1>
          <p className="text-slate-400 text-sm">Eletricidade Vantara Nacional</p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="text-sm font-bold text-slate-300 block mb-2">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@evn.co.mz"
              className={`w-full border-2 p-4 rounded-xl outline-none transition-colors text-slate-100 placeholder:text-slate-600 ${
                error ? "border-red-500" : "border-white/10 focus:border-orange-500"
              }`}
              style={{ background: "rgba(255,255,255,0.05)" }}
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-300 block mb-2">Palavra-passe</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className={`w-full border-2 p-4 rounded-xl outline-none transition-colors text-slate-100 placeholder:text-slate-600 ${
                error ? "border-red-500" : "border-white/10 focus:border-orange-500"
              }`}
              style={{ background: "rgba(255,255,255,0.05)" }}
            />
          </div>

          {error && (
            <div
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar no CMS"}
          </button>
        </form>
      </div>
    </div>
  );
}
