"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, X, LayoutDashboard, Newspaper, Bell,
  AlertOctagon, Mail, ImageIcon, ExternalLink,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminFloatingButtonProps {
  isAdmin: boolean;
}

interface QuickStat {
  label: string;
  value: number | string;
  color: string;
}

export default function AdminFloatingButton({ isAdmin }: AdminFloatingButtonProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stats, setStats] = useState<QuickStat[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [hasPendingItems, setHasPendingItems] = useState(false);

  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  // Lightweight pending-items check on mount
  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      fetch("/api/admin/avarias/count").then(r => r.json()).catch(() => ({ count: 0 })),
      fetch("/api/admin/contact/count").then(r => r.json()).catch(() => ({ count: 0 })),
    ]).then(([avarias, messages]) => {
      setHasPendingItems((avarias.count + messages.count) > 0);
    });
  }, [isAdmin]);

  // Fetch quick stats when drawer opens
  useEffect(() => {
    if (!drawerOpen || !isAdmin) return;

    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const [avariasRes, messagesRes, newsRes] = await Promise.all([
          fetch("/api/admin/avarias/count"),
          fetch("/api/admin/contact/count"),
          fetch("/api/admin/news?status=PUBLISHED&limit=1"),
        ]);
        const avarias = avariasRes.ok ? await avariasRes.json() : { count: 0 };
        const messages = messagesRes.ok ? await messagesRes.json() : { count: 0 };
        const news = newsRes.ok ? await newsRes.json() : { total: 0 };

        setStats([
          { label: "Avarias Pendentes", value: avarias.count, color: "text-red-400" },
          { label: "Mensagens Não Lidas", value: messages.count, color: "text-amber-400" },
          { label: "Artigos Publicados", value: news.total ?? 0, color: "text-emerald-400" },
        ]);
      } catch {
        setStats([]);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [drawerOpen, isAdmin]);

  // Close drawer on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawerOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!isAdmin || isAdminPage) return null;

  const quickLinks = [
    { href: "/admin/cms", label: "Dashboard CMS", icon: LayoutDashboard },
    { href: "/admin/cms?tab=news", label: "Gerir Notícias", icon: Newspaper },
    { href: "/admin/cms?tab=alerts", label: "Alertas de Rede", icon: Bell },
    { href: "/admin/cms?tab=avarias", label: "Relatórios de Avaria", icon: AlertOctagon },
    { href: "/admin/cms?tab=contact", label: "Mensagens", icon: Mail },
    { href: "/admin/cms?tab=media", label: "Biblioteca de Media", icon: ImageIcon },
  ];

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[210] w-full sm:w-80 flex flex-col"
            style={{
              background: "rgba(9,9,11,0.96)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "-20px 0 60px rgba(0,0,0,0.6)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-slate-100 font-bold text-sm">Painel Admin</p>
                  <p className="text-slate-500 text-xs">Portal EVN</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-500 hover:text-slate-200 transition-colors"
                aria-label="Fechar painel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick stats */}
            <div className="p-4 border-b border-white/[0.08]">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-medium">
                Resumo Operacional
              </p>
              {loadingStats ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 rounded-lg bg-white/[0.04] animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]"
                    >
                      <span className="text-slate-400 text-sm">{stat.label}</span>
                      <span className={`font-bold text-lg ${stat.color}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-medium">
                Acesso Rápido
              </p>
              <div className="space-y-1">
                {quickLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/20 group-hover:border-orange-500/40 transition-colors">
                      <Icon className="w-4 h-4 text-orange-400" />
                    </div>
                    <span className="text-slate-300 text-sm font-medium group-hover:text-slate-100 transition-colors flex-1">
                      {label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/[0.08]">
              <Link
                href="/admin/cms"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Abrir CMS Completo
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trigger button wrapper (relative for pulse dot positioning) */}
      <div className="fixed bottom-6 right-6 z-[190] relative">
        {hasPendingItems && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-zinc-950" />
          </span>
        )}
        <motion.button
          type="button"
          onClick={() => setDrawerOpen((prev) => !prev)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.5, type: "spring", damping: 15 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2.5 pl-4 pr-5 py-3 rounded-2xl font-bold text-sm text-white shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            boxShadow: "0 8px 32px rgba(249,115,22,0.45), 0 2px 8px rgba(0,0,0,0.4)",
          }}
          aria-label="Entrar no CMS"
        >
          {drawerOpen ? (
            <><X className="w-4 h-4" /> Fechar Painel</>
          ) : (
            <><Shield className="w-4 h-4" /> Entrar no CMS</>
          )}
        </motion.button>
      </div>
    </>
  );
}
