"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Activity, CreditCard, FileText, Zap, FileSearch,
  MessageSquare, Briefcase, Calculator, Search, Menu, Lock, ChevronRight, X,
} from "lucide-react";

import type { ModalType, ApiNewsArticle, ApiServiceDoc, ApiAlert } from "./_types";
import { useScrollProgress } from "@/components/hooks/useScrollProgress";
import { TiltCard } from "@/components/TiltCard";
import { ModalShell } from "@/components/modals/ModalShell";
import { DashboardModal } from "@/components/modals/DashboardModal";
import { CortesModal } from "@/components/modals/CortesModal";
import { SimuladorModal } from "@/components/modals/SimuladorModal";
import { SearchModal } from "@/components/modals/SearchModal";
import { ServicosModal } from "@/components/modals/ServicosModal";
import { CredelecModal } from "@/components/modals/CredelecModal";
import { NovaLigacaoModal } from "@/components/modals/NovaLigacaoModal";
import { ConcursosModal } from "@/components/modals/ConcursosModal";
import { ContactModal } from "@/components/modals/ContactModal";
import { ContratosModal } from "@/components/modals/ContratosModal";
import { LoginModal } from "@/components/modals/LoginModal";
import { AvariaModal } from "@/components/modals/AvariaModal";
import { EmpresaModal, ProjectosModal, NewsReaderModal } from "@/components/modals/OtherModals";
import { Footer } from "@/components/sections/Footer";
import AuthModal, { saveUserLocally, clearUserLocally } from "@/components/ui/AuthModal";

// ─── Fallback seed data ───────────────────────────────────────────────────────
const NEWS_FALLBACK: ApiNewsArticle[] = [
  { id: 1, tag: "Destaque",      title: "Administração da EVN visita províncias para monitorar reposição do sistema eléctrico.", shortDesc: "A EVN está no terreno para garantir a estabilidade da rede após os recentes eventos climáticos.", fullText: "Maputo — Em resposta aos recentes eventos climáticos severos, o Conselho de Administração da Eletricidade Vantara Nacional (EVN) iniciou uma visita de campo intensiva.", imgUrl: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80", status: "PUBLISHED", publishAt: null },
  { id: 2, tag: "Infraestrutura", title: "EVN necessita de 604 milhões de meticais para compensar danos das cheias.",           shortDesc: "Os fundos serão destinados à reconstrução urgente de subestações e linhas de média tensão.",  fullText: "A Eletricidade Vantara Nacional (EVN) anunciou hoje que será necessário um fundo de contingência de 604 milhões de meticais.", imgUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80", status: "PUBLISHED", publishAt: null },
  { id: 3, tag: "Cooperação",    title: "EVN estreita laços com parceiros internacionais para o desenvolvimento Nacional.",    shortDesc: "Novos acordos visam a expansão acelerada da rede elétrica para zonas rurais e industriais.",  fullText: "Num esforço contínuo para alcançar a eletrificação universal, a EVN assinou três novos memorandos de entendimento.", imgUrl: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400&q=80", status: "PUBLISHED", publishAt: null },
];
const SERVICES_FALLBACK: ApiServiceDoc[] = [
  { id: 1, docId: "mod-01",    title: "Formulário de Mudança de Titularidade", fileSize: "1.2 MB", description: "Acompanhar com cópia de BI e título de propriedade.", filePath: "" },
  { id: 2, docId: "req-vis",   title: "Requerimento para Pedido de Vistoria",  fileSize: "850 KB", description: "Obrigatório para aumento de potência elétrica.",     filePath: "" },
  { id: 3, docId: "term-resp", title: "Termo de Responsabilidade Técnica",     fileSize: "2.1 MB", description: "Exclusivo para eletricistas credenciados.",           filePath: "" },
];
const ALERTS_FALLBACK: ApiAlert[] = [
  { id: 1, type: "URGENT",    zone: "Sul — Rede Principal", title: "Interrupção Não Programada — Zona Sul",  date: "07 Mai 2026 · 02:15", duration: "Indeterminado", description: "Falha na subestação principal de Maputo Sul. Equipas técnicas no local. Previsão de reposição: 4–6 horas." },
  { id: 2, type: "SCHEDULED", zone: "Matola — KaTembe",    title: "Manutenção Preventiva Programada",        date: "09 Mai 2026 · 08:00", duration: "6 horas",        description: "Substituição de transformadores de 33kV. Afeta os bairros Infulene A e B." },
  { id: 3, type: "RESOLVED",  zone: "Gaza — Xai-Xai",     title: "Reposição Concluída — Gaza Norte",         date: "05 Mai 2026 · 18:40", duration: "Resolvido",      description: "Fornecimento totalmente restabelecido. Causa: queda de poste por ventos fortes." },
];

const SERVICES = [
  { icon: Activity,    label: "Avisos Nacionais",  action: "CORTES" },
  { icon: Calculator,  label: "Simulador MZN",     action: "SIMULADOR" },
  { icon: CreditCard,  label: "Comprar Credelec",  action: "CREDELEC" },
  { icon: FileText,    label: "Catálogo PDF",       action: "SERVICOS" },
  { icon: Zap,         label: "Nova Ligação",       action: "NOVA_LIGACAO" },
  { icon: FileSearch,  label: "Meus Contratos",    action: "CONTRATOS" },
  { icon: MessageSquare, label: "Apoio Cliente",   action: "CONTACT" },
  { icon: Briefcase,   label: "Recrutamento",      action: "CONCURSOS" },
] as const;

export default function EVNCorporatePortal() {
  const [activeModal, setActiveModal]   = useState<ModalType>("NONE");
  const [selectedNewsId, setSelectedNewsId] = useState(1);
  const [newsData, setNewsData]         = useState<ApiNewsArticle[]>([]);
  const [servicesList, setServicesList] = useState<ApiServiceDoc[]>([]);
  const [alertsList, setAlertsList]     = useState<ApiAlert[]>([]);
  const [newsLoading, setNewsLoading]         = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [alertsLoading, setAlertsLoading]     = useState(true);
  const [authModalOpen, setAuthModalOpen]       = useState(false);
  const [authModalTab, setAuthModalTab]         = useState<"login" | "register">("login");
  const [currentUser, setCurrentUser]           = useState<{ id: number; nome: string; email: string } | null>(null);
  const [welcomeBackName, setWelcomeBackName]   = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen]     = useState(false);
  const scrollProgress = useScrollProgress();

  const openModal = (m: ModalType) => { setActiveModal(m); setMobileMenuOpen(false); };

  useEffect(() => {
    const load = async <T,>(
      url: string,
      setter: (d: T[]) => void,
      fallback: T[],
      setLoading: (v: boolean) => void,
      label: string,
    ) => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status}`);
        const data = (await res.json()) as T[];
        setter(Array.isArray(data) && data.length ? data : fallback);
      } catch (err) {
        console.error(`[EVN] Falha ao carregar ${label}:`, err);
        setter(fallback);
      } finally {
        setLoading(false);
      }
    };
    load<ApiNewsArticle>("/api/news",    setNewsData,     NEWS_FALLBACK,     setNewsLoading,     "notícias");
    load<ApiServiceDoc>("/api/services", setServicesList, SERVICES_FALLBACK, setServicesLoading, "serviços");
    load<ApiAlert>("/api/alerts",        setAlertsList,   ALERTS_FALLBACK,   setAlertsLoading,   "alertas");
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "").toUpperCase();
    const validModals: Partial<Record<string, ModalType>> = {
      "CREDELEC":    "CREDELEC",
      "NOVA-LIGACAO":"NOVA_LIGACAO",
      "CORTES":      "CORTES",
      "SIMULADOR":   "SIMULADOR",
      "CONTRATOS":   "CONTRATOS",
      "AVARIA":      "AVARIA",
      "DASHBOARD":   "DASHBOARD",
      "SERVICOS":    "SERVICOS",
      "CONCURSOS":   "CONCURSOS",
      "EMPRESA":     "EMPRESA",
      "PROJECTOS":   "PROJECTOS",
    };
    const target = validModals[hash];
    if (target) {
      setTimeout(() => setActiveModal(target), 800);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("evn_last_user_name");
      if (saved) setWelcomeBackName(saved);
    } catch { /* unavailable */ }
  }, []);

  useEffect(() => {
    fetch("/api/auth/user/me")
      .then((r) => r.json())
      .then((data: { user?: { id: number; nome: string; email: string } }) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleAuthSuccess = (user: { id: number; nome: string; email: string }) => {
    const prevName = welcomeBackName;
    setCurrentUser(user);
    setWelcomeBackName(user.nome);
    saveUserLocally(user.nome, user.email);
    if (prevName && prevName === user.nome) {
      toast(`Bem-vindo de volta, ${user.nome.split(" ")[0]}!`, {
        style: { background: "#1a0a00", border: "1px solid #f97316", color: "#fdba74" },
        icon: "⚡",
      });
    } else {
      toast.success(`Bem-vindo ao Portal EVN, ${user.nome.split(" ")[0]}!`);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/user/logout", { method: "POST" });
    setCurrentUser(null);
    clearUserLocally();
    setWelcomeBackName(null);
  };

  const openNewsArticle = (id: number) => { setSelectedNewsId(id); setActiveModal("NEWS"); };
  const closeModal = () => { setActiveModal("NONE"); toast.dismiss(); };

  const activeArticle = newsData.find(n => n.id === selectedNewsId) ?? newsData[0];

  return (
    <div className="min-h-screen bg-transparent text-slate-200 font-sans">
      {/* Scroll progress bar */}
      <div aria-hidden style={{ position: "fixed", top: 0, left: 0, height: 2, width: `${scrollProgress * 100}%`, background: "linear-gradient(90deg,#f97316,#fb923c)", boxShadow: "0 0 12px #f97316", zIndex: 9999, transition: "width 0.1s linear" }} />

      {/* Top notification bar */}
      <div className="bg-black/50 backdrop-blur-xl py-2 px-4 md:px-8 flex justify-between items-center text-xs font-medium text-slate-400 border-b border-white/5">
        <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-orange-500" /><span>Eletricidade Vantara Nacional: Serviços Digitais Seguros e Verificados</span></div>
        <button onClick={() => { setAuthModalTab("login"); setAuthModalOpen(true); }} className="bg-orange-500/20 border border-orange-500/30 text-orange-300 px-4 py-1.5 rounded-full hover:bg-orange-500/30 transition-colors">Acesso Seguro</button>
      </div>

      {/* Header */}
      <header className="bg-[#0a0a0a]/75 backdrop-blur-2xl py-4 px-4 md:px-8 lg:px-16 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10 border-b border-white/10">
        <div onClick={() => setActiveModal("CORTES")} className="text-orange-400 font-bold text-xs uppercase tracking-wide cursor-pointer hover:bg-orange-500/10 px-4 py-2.5 rounded-lg flex items-center gap-2 border border-orange-500/25 transition-all"><Activity className="w-4 h-4 animate-pulse" /> Avisos Nacionais</div>
        <div className="flex flex-col items-center cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="w-12 h-12 border-2 border-orange-500 rounded-full flex items-center justify-center mb-1" style={{ boxShadow: "0 0 20px rgba(249,115,22,0.25)" }}><Zap className="w-6 h-6 text-orange-500" /></div>
          <h1 className="text-[10px] font-black text-center uppercase tracking-widest leading-tight text-slate-200">Eletricidade<br /><span className="text-orange-500">Vantara Nacional</span></h1>
        </div>
        {currentUser ? (
          <button type="button" onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-slate-300 hover:text-orange-400 hover:border-orange-500/30 transition-colors text-sm font-bold"
          >
            <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-black text-sm">
              {currentUser.nome.charAt(0).toUpperCase()}
            </div>
            {currentUser.nome.split(" ")[0]}
          </button>
        ) : (
          <button onClick={() => { setAuthModalTab("login"); setAuthModalOpen(true); }} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-[0_4px_20px_rgba(249,115,22,0.4)] flex items-center gap-2"><Lock className="w-4 h-4" /> Área de Cliente</button>
        )}
      </header>

      {/* Nav */}
      <nav className="bg-[#050510]/80 backdrop-blur-xl text-white px-4 md:px-8 lg:px-16 py-4 border-b border-white/5 relative z-30">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-8 font-medium text-sm">
            {[
              { label: "Início",       fn: () => window.scrollTo({ top: 0, behavior: "smooth" }), bold: true },
              { label: "A Empresa",    fn: () => openModal("EMPRESA") },
              { label: "Imprensa",     fn: () => { openNewsArticle(newsData[0]?.id ?? 1); setMobileMenuOpen(false); } },
              { label: "Recrutamento", fn: () => openModal("CONCURSOS") },
              { label: "Projectos",    fn: () => openModal("PROJECTOS") },
              { label: "Contactos",    fn: () => openModal("CONTACT") },
            ].map(({ label, fn, bold }) => (
              <li key={label}>
                <button type="button" onClick={fn} className={`${bold ? "font-bold text-orange-500" : "hover:text-orange-400 text-slate-300"} cursor-pointer transition-colors bg-transparent border-0 p-0 font-medium`}>{label}</button>
              </li>
            ))}
          </ul>

          {/* Mobile: hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden p-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <button type="button" onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-orange-400 hover:border-orange-500/30 transition-colors text-sm font-medium"
              >
                <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-xs">
                  {currentUser.nome.charAt(0).toUpperCase()}
                </div>
                {currentUser.nome.split(" ")[0]}
              </button>
            ) : welcomeBackName ? (
              <button type="button"
                onClick={() => { setAuthModalTab("login"); setAuthModalOpen(true); }}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 hover:bg-orange-500/20 transition-colors text-sm"
              >
                <div className="w-5 h-5 rounded-full bg-orange-500/30 flex items-center justify-center text-xs font-bold">
                  {welcomeBackName.charAt(0).toUpperCase()}
                </div>
                Bem-vindo de volta, {welcomeBackName.split(" ")[0]}
              </button>
            ) : (
              <button type="button"
                onClick={() => { setAuthModalTab("login"); setAuthModalOpen(true); }}
                className="hidden md:block px-4 py-2 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 hover:bg-orange-500/25 transition-colors text-sm font-medium"
              >
                Entrar / Registar
              </button>
            )}
            <button type="button" onClick={() => { openModal("SEARCH"); }} className="flex items-center gap-2 text-sm font-medium hover:text-orange-400 cursor-pointer bg-white/5 px-5 py-2.5 rounded-full transition-colors border border-white/10"><Search className="w-4 h-4" /><span className="hidden sm:inline">Procurar no Portal</span></button>
          </div>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed top-[130px] left-0 right-0 z-40 md:hidden border-b border-white/10"
            style={{ background: "rgba(5,5,16,0.97)", backdropFilter: "blur(20px)" }}
          >
            <div className="flex flex-col p-4 gap-1 max-w-7xl mx-auto">
              {[
                { label: "Início",       fn: () => { window.scrollTo({ top: 0, behavior: "smooth" }); setMobileMenuOpen(false); } },
                { label: "A Empresa",    fn: () => openModal("EMPRESA") },
                { label: "Imprensa",     fn: () => { openNewsArticle(newsData[0]?.id ?? 1); setMobileMenuOpen(false); } },
                { label: "Recrutamento", fn: () => openModal("CONCURSOS") },
                { label: "Projectos",    fn: () => openModal("PROJECTOS") },
                { label: "Contactos",    fn: () => openModal("CONTACT") },
                { label: "Avisos Nacionais", fn: () => openModal("CORTES") },
              ].map(({ label, fn }) => (
                <button key={label} type="button" onClick={fn}
                  className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 text-slate-300 hover:text-orange-400 transition-colors text-left w-full border border-transparent hover:border-white/10">
                  {label}
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </button>
              ))}
              {/* Mobile auth */}
              {currentUser ? (
                <button type="button" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-300 hover:text-orange-400 transition-colors w-full border border-transparent hover:border-white/10">
                  <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold">
                    {currentUser.nome.charAt(0).toUpperCase()}
                  </div>
                  Terminar Sessão ({currentUser.nome.split(" ")[0]})
                </button>
              ) : (
                <button type="button"
                  onClick={() => { setAuthModalTab("login"); setAuthModalOpen(true); setMobileMenuOpen(false); }}
                  className="mx-4 my-1 px-4 py-3 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 font-medium">
                  Entrar / Registar
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="w-full flex flex-col md:flex-row min-h-[420px] md:h-[500px] overflow-hidden relative">
        <div className="w-full md:w-1/2 px-4 sm:px-8 md:px-20 py-16 sm:py-20 flex flex-col justify-center z-10 relative">
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#020617]/85 via-[#020617]/50 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.85, duration: 0.7 }} className="font-mono text-sm uppercase tracking-[0.35em] mb-5 text-orange-500" style={{ textShadow: "0 0 20px rgba(249,115,22,0.45)" }}>ENERGIA INTELIGENTE</motion.p>
            <div className="overflow-hidden"><motion.h2 initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 3.05, duration: 0.9, ease: [0.16,1,0.3,1] }} className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-tight">PARA</motion.h2></div>
            <div className="overflow-hidden"><motion.h2 initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 3.2, duration: 0.9, ease: [0.16,1,0.3,1] }} className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight" style={{ color: "#f97316", textShadow: "0 0 48px rgba(249,115,22,0.35)" }}>MOÇAMBIQUE.</motion.h2></div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.45, duration: 0.6 }} className="mt-8 flex flex-col sm:flex-row gap-3">
              <button onClick={() => openModal("AVARIA")} className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-all active:scale-95 text-center" style={{ boxShadow: "0 4px 20px rgba(249,115,22,0.4)" }}>Reportar Emergência</button>
              <button onClick={() => openModal("CORTES")} className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold py-3 px-8 rounded-full transition-all active:scale-95 text-center">Avisos Nacionais</button>
            </motion.div>
          </div>
        </div>
        <div aria-hidden className="hidden md:block md:w-1/2 h-full relative pointer-events-none" />
      </section>

      {/* Services grid */}
      <motion.section className="py-20 px-4 max-w-6xl mx-auto" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ type: "spring", stiffness: 80, damping: 20 }}>
        <h2 className="text-3xl font-black text-center mb-3 text-white">Serviços Digitais Rápidos</h2>
        <p className="text-center text-slate-500 mb-12 text-sm tracking-wide">Acesso directo a todos os serviços EVN</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {SERVICES.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 100, damping: 20, delay: i * 0.06 }}>
              <TiltCard onClick={() => openModal(s.action as ModalType)} className="p-4 sm:p-6 rounded-2xl flex flex-col items-center group min-h-[100px] sm:min-h-[120px] justify-center" style={{ background: "rgba(10,10,10,0.6)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 32px 0 rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)" } as React.CSSProperties}>
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-3 text-slate-500 group-hover:text-orange-500 transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}><s.icon className="w-5 h-5 sm:w-7 sm:h-7" /></div>
                <span className="font-bold text-center text-xs sm:text-sm text-slate-200 group-hover:text-white transition-colors">{s.label}</span>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* News section */}
      <motion.section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ type: "spring", stiffness: 80, damping: 20 }}>
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-orange-500 font-bold uppercase text-xs tracking-widest mb-2">Portal de Comunicação</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100">Últimas Notícias</h2>
          </div>
          {newsData.length > 0 && (
            <span className="text-slate-500 text-sm hidden sm:block">{newsData.length} artigo(s)</span>
          )}
        </div>

        {newsLoading ? (
          <div className="space-y-6">
            <div className="animate-pulse rounded-2xl h-64" style={{ background: "rgba(255,255,255,0.06)" }} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="animate-pulse rounded-xl h-48" style={{ background: "rgba(255,255,255,0.06)" }} />
              ))}
            </div>
          </div>
        ) : newsData.length === 0 ? (
          <div className="text-center py-16 text-slate-500">Sem notícias publicadas.</div>
        ) : (
          <div className="space-y-6">
            {/* Featured article — full-width hero */}
            {newsData[0] && (
              <div
                className="relative overflow-hidden rounded-2xl cursor-pointer group"
                style={{ background: "rgba(10,10,10,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
                onClick={() => openNewsArticle(newsData[0].id)}
              >
                <div className="flex flex-col md:flex-row">
                  {newsData[0].imgUrl && (
                    <div className="md:w-1/2 aspect-[16/9] md:aspect-auto md:h-72 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={newsData[0].imgUrl}
                        alt={newsData[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-5 sm:p-8 flex flex-col justify-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 font-bold uppercase text-xs tracking-widest mb-4">
                      {newsData[0].tag}
                    </span>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-100 mb-4 leading-tight group-hover:text-orange-300 transition-colors">
                      {newsData[0].title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed line-clamp-3">{newsData[0].shortDesc}</p>
                    <div className="mt-6 flex items-center gap-2 text-orange-400 font-semibold text-sm">
                      Ler artigo completo
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Remaining articles — 3-column grid */}
            {newsData.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {newsData.slice(1).map((article) => (
                  <div
                    key={article.id}
                    className="flex flex-col overflow-hidden rounded-xl cursor-pointer group"
                    style={{ background: "rgba(10,10,10,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
                    onClick={() => openNewsArticle(article.id)}
                  >
                    {article.imgUrl && (
                      <div className="aspect-[16/9] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={article.imgUrl}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-5 flex flex-col">
                      <span className="inline-block px-2 py-0.5 rounded bg-orange-500/15 text-orange-400 font-bold uppercase text-xs tracking-widest mb-3 self-start">
                        {article.tag}
                      </span>
                      <h3 className="text-slate-100 font-bold leading-snug group-hover:text-orange-300 transition-colors line-clamp-2 flex-1">
                        {article.title}
                      </h3>
                      <p className="text-slate-500 text-sm mt-2 line-clamp-2">{article.shortDesc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.section>

      <Footer />

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        defaultTab={authModalTab}
      />

      {/* Modal engine */}
      <ModalShell activeModal={activeModal} closeModal={closeModal}>
        {activeModal === "DASHBOARD"    && <DashboardModal closeModal={closeModal} />}
        {activeModal === "CORTES"       && <CortesModal alertsList={alertsList} loading={alertsLoading} />}
        {activeModal === "SIMULADOR"    && <SimuladorModal />}
        {activeModal === "SEARCH"       && <SearchModal setActiveModal={setActiveModal} newsData={newsData} openNewsArticle={openNewsArticle} />}
        {activeModal === "SERVICOS"     && <ServicosModal servicesList={servicesList} loading={servicesLoading} />}
        {activeModal === "CREDELEC"     && <CredelecModal closeModal={closeModal} />}
        {activeModal === "NOVA_LIGACAO" && <NovaLigacaoModal closeModal={closeModal} />}
        {activeModal === "CONCURSOS"    && <ConcursosModal />}
        {activeModal === "CONTACT"      && <ContactModal />}
        {activeModal === "CONTRATOS"    && <ContratosModal />}
        {activeModal === "LOGIN"        && <LoginModal setActiveModal={setActiveModal} />}
        {activeModal === "AVARIA"       && <AvariaModal closeModal={closeModal} />}
        {activeModal === "EMPRESA"      && <EmpresaModal />}
        {activeModal === "PROJECTOS"    && <ProjectosModal />}
        {activeModal === "NEWS"         && activeArticle && <NewsReaderModal article={activeArticle} closeModal={closeModal} />}
      </ModalShell>
    </div>
  );
}
