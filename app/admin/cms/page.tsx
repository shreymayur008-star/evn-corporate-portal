"use client";

import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper, FileText, Zap, LogOut, Plus, Pencil, Trash2,
  X, Upload, Loader2, CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = "news" | "services" | "alerts";

interface NewsArticle {
  id: number; tag: string; title: string; shortDesc: string;
  fullText: string; imgUrl: string; active: boolean;
}
interface ServiceDocument {
  id: number; docId: string; title: string; fileSize: string;
  description: string; filePath: string; active: boolean;
}
interface NetworkAlert {
  id: number; type: "URGENT" | "SCHEDULED" | "RESOLVED";
  zone: string; title: string; date: string; duration: string;
  description: string; active: boolean;
}

// ── Shared glass panel ────────────────────────────────────────────────────────
function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: "rgba(8,8,12,0.75)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(24px)",
      }}
    >
      {children}
    </div>
  );
}

// ── Alert badge ───────────────────────────────────────────────────────────────
function AlertBadge({ type }: { type: NetworkAlert["type"] }) {
  const map = {
    URGENT: { label: "Urgente", bg: "rgba(239,68,68,0.15)", color: "#f87171", border: "rgba(239,68,68,0.3)" },
    SCHEDULED: { label: "Agendado", bg: "rgba(234,179,8,0.15)", color: "#facc15", border: "rgba(234,179,8,0.3)" },
    RESOLVED: { label: "Resolvido", bg: "rgba(22,163,74,0.15)", color: "#4ade80", border: "rgba(22,163,74,0.3)" },
  };
  const s = map[type];
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  );
}

// ── Image / file upload helper ────────────────────────────────────────────────
function FileUpload({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      onUploaded(url);
      toast.success("Ficheiro carregado com sucesso.");
    } catch {
      toast.error("Erro ao carregar ficheiro.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={uploading}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-300 transition-colors"
      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
      {uploading ? "A carregar..." : "Carregar Ficheiro"}
      <input ref={inputRef} type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFile} />
    </button>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(2,6,23,0.85)", backdropFilter: "blur(16px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-2xl rounded-3xl overflow-hidden"
            style={{
              background: "rgba(8,8,12,0.97)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 32px 64px rgba(0,0,0,0.7)",
            }}
          >
            <div className="flex items-center justify-between px-8 py-5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <h3 className="font-black text-white text-lg">{title}</h3>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Input helper ──────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-400 block mb-2">{label}</label>
      {children}
    </div>
  );
}

function Input({ className, style, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      className={twMerge("w-full border-2 border-white/10 focus:border-orange-500 p-3 rounded-xl outline-none transition-colors text-slate-100 placeholder:text-slate-600", className)}
      style={{ background: "rgba(255,255,255,0.05)", ...style }}
    />
  );
}

function Textarea({ className, style, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...rest}
      className={twMerge("w-full border-2 border-white/10 focus:border-orange-500 p-3 rounded-xl outline-none transition-colors text-slate-100 placeholder:text-slate-600 resize-none", className)}
      style={{ background: "rgba(255,255,255,0.05)", ...style }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function CMSDashboard() {
  const [tab, setTab] = useState<Tab>("news");

  // ── News state ──────────────────────────────────────────────────────────────
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsModal, setNewsModal] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [newsForm, setNewsForm] = useState({ tag: "", title: "", shortDesc: "", fullText: "", imgUrl: "", active: true });

  // ── Services state ──────────────────────────────────────────────────────────
  const [services, setServices] = useState<ServiceDocument[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesModal, setServicesModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceDocument | null>(null);
  const [serviceForm, setServiceForm] = useState({ docId: "", title: "", fileSize: "", description: "", filePath: "", active: true });

  // ── Alerts state ────────────────────────────────────────────────────────────
  const [alerts, setAlerts] = useState<NetworkAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsModal, setAlertsModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<NetworkAlert | null>(null);
  const [alertForm, setAlertForm] = useState<{
    type: NetworkAlert["type"]; zone: string; title: string;
    date: string; duration: string; description: string; active: boolean;
  }>({ type: "SCHEDULED", zone: "", title: "", date: "", duration: "", description: "", active: true });

  // ── Fetchers ────────────────────────────────────────────────────────────────
  const loadNews = async () => {
    setNewsLoading(true);
    const res = await fetch("/api/admin/news");
    if (res.ok) setNews(await res.json());
    setNewsLoading(false);
  };
  const loadServices = async () => {
    setServicesLoading(true);
    const res = await fetch("/api/admin/services");
    if (res.ok) setServices(await res.json());
    setServicesLoading(false);
  };
  const loadAlerts = async () => {
    setAlertsLoading(true);
    const res = await fetch("/api/admin/alerts");
    if (res.ok) setAlerts(await res.json());
    setAlertsLoading(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadNews(); loadServices(); loadAlerts(); }, []);

  // ── News CRUD ───────────────────────────────────────────────────────────────
  const openNewsCreate = () => {
    setEditingNews(null);
    setNewsForm({ tag: "", title: "", shortDesc: "", fullText: "", imgUrl: "", active: true });
    setNewsModal(true);
  };
  const openNewsEdit = (n: NewsArticle) => {
    setEditingNews(n);
    setNewsForm({ tag: n.tag, title: n.title, shortDesc: n.shortDesc, fullText: n.fullText, imgUrl: n.imgUrl, active: n.active });
    setNewsModal(true);
  };
  const saveNews = async () => {
    const method = editingNews ? "PUT" : "POST";
    const url = editingNews ? `/api/admin/news/${editingNews.id}` : "/api/admin/news";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(newsForm) });
    if (res.ok) { toast.success(editingNews ? "Notícia atualizada." : "Notícia criada."); setNewsModal(false); loadNews(); }
    else toast.error("Erro ao guardar.");
  };
  const deleteNews = async (id: number) => {
    if (!confirm("Apagar esta notícia?")) return;
    const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Notícia apagada."); loadNews(); }
  };

  // ── Service CRUD ────────────────────────────────────────────────────────────
  const openServiceCreate = () => {
    setEditingService(null);
    setServiceForm({ docId: "", title: "", fileSize: "", description: "", filePath: "", active: true });
    setServicesModal(true);
  };
  const openServiceEdit = (s: ServiceDocument) => {
    setEditingService(s);
    setServiceForm({ docId: s.docId, title: s.title, fileSize: s.fileSize, description: s.description, filePath: s.filePath, active: s.active });
    setServicesModal(true);
  };
  const saveService = async () => {
    const method = editingService ? "PUT" : "POST";
    const url = editingService ? `/api/admin/services/${editingService.id}` : "/api/admin/services";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(serviceForm) });
    if (res.ok) { toast.success(editingService ? "Documento atualizado." : "Documento criado."); setServicesModal(false); loadServices(); }
    else toast.error("Erro ao guardar.");
  };
  const deleteService = async (id: number) => {
    if (!confirm("Apagar este documento?")) return;
    const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Documento apagado."); loadServices(); }
  };

  // ── Alert CRUD ──────────────────────────────────────────────────────────────
  const openAlertCreate = () => {
    setEditingAlert(null);
    setAlertForm({ type: "SCHEDULED", zone: "", title: "", date: "", duration: "", description: "", active: true });
    setAlertsModal(true);
  };
  const openAlertEdit = (a: NetworkAlert) => {
    setEditingAlert(a);
    setAlertForm({ type: a.type, zone: a.zone, title: a.title, date: a.date, duration: a.duration, description: a.description, active: a.active });
    setAlertsModal(true);
  };
  const saveAlert = async () => {
    const method = editingAlert ? "PUT" : "POST";
    const url = editingAlert ? `/api/admin/alerts/${editingAlert.id}` : "/api/admin/alerts";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(alertForm) });
    if (res.ok) { toast.success(editingAlert ? "Alerta atualizado." : "Alerta criado."); setAlertsModal(false); loadAlerts(); }
    else toast.error("Erro ao guardar.");
  };
  const deleteAlert = async (id: number) => {
    if (!confirm("Apagar este alerta?")) return;
    const res = await fetch(`/api/admin/alerts/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Alerta apagado."); loadAlerts(); }
  };

  // ── Layout ──────────────────────────────────────────────────────────────────
  const TABS = [
    { key: "news" as Tab, label: "Notícias", icon: Newspaper },
    { key: "services" as Tab, label: "Serviços", icon: FileText },
    { key: "alerts" as Tab, label: "Alertas de Rede", icon: Zap },
  ];

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: "#020617" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-white">EVN CMS</h1>
          <p className="text-slate-500 text-sm mt-1">Portal Administrativo de Conteúdos</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={
              tab === key
                ? { background: "#f97316", color: "#fff", boxShadow: "0 0 20px rgba(249,115,22,0.35)" }
                : { background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }
            }
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ── NEWS TAB ────────────────────────────────────────────────────────── */}
      {tab === "news" && (
        <GlassPanel>
          <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 className="font-black text-white">Notícias <span className="text-slate-500 font-normal text-sm ml-2">({news.length})</span></h2>
            <button onClick={openNewsCreate} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
              <Plus className="w-4 h-4" /> Nova Notícia
            </button>
          </div>
          {newsLoading ? (
            <div className="flex justify-center p-16"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
          ) : news.length === 0 ? (
            <div className="text-center p-16 text-slate-500">Nenhuma notícia. Adicione a primeira.</div>
          ) : (
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {news.map((n) => (
                <div key={n.id} className="flex items-start gap-4 p-6 group hover:bg-white/[0.02] transition-colors">
                  {n.imgUrl && (
                    <img src={n.imgUrl} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">{n.tag}</span>
                      {!n.active && <span className="text-xs font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">Inativo</span>}
                    </div>
                    <p className="font-bold text-white text-sm leading-snug truncate">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{n.shortDesc}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openNewsEdit(n)} className="p-2 rounded-xl text-slate-500 hover:text-orange-400 transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => deleteNews(n.id)} className="p-2 rounded-xl text-slate-500 hover:text-red-400 transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>
      )}

      {/* ── SERVICES TAB ────────────────────────────────────────────────────── */}
      {tab === "services" && (
        <GlassPanel>
          <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 className="font-black text-white">Documentos e Serviços <span className="text-slate-500 font-normal text-sm ml-2">({services.length})</span></h2>
            <button onClick={openServiceCreate} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
              <Plus className="w-4 h-4" /> Novo Documento
            </button>
          </div>
          {servicesLoading ? (
            <div className="flex justify-center p-16"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
          ) : services.length === 0 ? (
            <div className="text-center p-16 text-slate-500">Nenhum documento.</div>
          ) : (
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {services.map((s) => (
                <div key={s.id} className="flex items-center gap-4 p-6 hover:bg-white/[0.02] transition-colors">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(59,130,246,0.1)" }}>
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm">{s.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.fileSize} · {s.description}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openServiceEdit(s)} className="p-2 rounded-xl text-slate-500 hover:text-orange-400 transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => deleteService(s.id)} className="p-2 rounded-xl text-slate-500 hover:text-red-400 transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>
      )}

      {/* ── ALERTS TAB ──────────────────────────────────────────────────────── */}
      {tab === "alerts" && (
        <GlassPanel>
          <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 className="font-black text-white">Alertas de Rede <span className="text-slate-500 font-normal text-sm ml-2">({alerts.length})</span></h2>
            <button onClick={openAlertCreate} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
              <Plus className="w-4 h-4" /> Novo Alerta
            </button>
          </div>
          {alertsLoading ? (
            <div className="flex justify-center p-16"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
          ) : alerts.length === 0 ? (
            <div className="text-center p-16 text-slate-500">Nenhum alerta.</div>
          ) : (
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {alerts.map((a) => (
                <div key={a.id} className="flex items-start gap-4 p-6 hover:bg-white/[0.02] transition-colors">
                  <AlertBadge type={a.type} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm">{a.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{a.zone} · {a.date} · {a.duration}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openAlertEdit(a)} className="p-2 rounded-xl text-slate-500 hover:text-orange-400 transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => deleteAlert(a.id)} className="p-2 rounded-xl text-slate-500 hover:text-red-400 transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>
      )}

      {/* ── NEWS MODAL ──────────────────────────────────────────────────────── */}
      <Modal open={newsModal} onClose={() => setNewsModal(false)} title={editingNews ? "Editar Notícia" : "Nova Notícia"}>
        <div className="space-y-5">
          <Field label="Tag (ex: Destaque)">
            <Input value={newsForm.tag} onChange={(e) => setNewsForm({ ...newsForm, tag: e.target.value })} placeholder="Destaque" />
          </Field>
          <Field label="Título">
            <Input value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} placeholder="Título da notícia" />
          </Field>
          <Field label="Resumo">
            <Textarea rows={2} value={newsForm.shortDesc} onChange={(e) => setNewsForm({ ...newsForm, shortDesc: e.target.value })} placeholder="Descrição breve" />
          </Field>
          <Field label="Texto Completo">
            <Textarea rows={5} value={newsForm.fullText} onChange={(e) => setNewsForm({ ...newsForm, fullText: e.target.value })} placeholder="Conteúdo completo da notícia" />
          </Field>
          <Field label="URL / Caminho da Imagem">
            <div className="flex gap-3">
              <Input value={newsForm.imgUrl} onChange={(e) => setNewsForm({ ...newsForm, imgUrl: e.target.value })} placeholder="https://... ou /uploads/..." />
              <FileUpload onUploaded={(url) => setNewsForm({ ...newsForm, imgUrl: url })} />
            </div>
          </Field>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={newsForm.active} onChange={(e) => setNewsForm({ ...newsForm, active: e.target.checked })} className="w-4 h-4 accent-orange-500" />
            <span className="text-sm font-bold text-slate-300">Publicada (visível no portal)</span>
          </label>
          <button onClick={saveNews} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> {editingNews ? "Guardar Alterações" : "Publicar Notícia"}
          </button>
        </div>
      </Modal>

      {/* ── SERVICES MODAL ──────────────────────────────────────────────────── */}
      <Modal open={servicesModal} onClose={() => setServicesModal(false)} title={editingService ? "Editar Documento" : "Novo Documento"}>
        <div className="space-y-5">
          <Field label="ID Único (ex: mod-01)">
            <Input value={serviceForm.docId} onChange={(e) => setServiceForm({ ...serviceForm, docId: e.target.value })} placeholder="mod-01" />
          </Field>
          <Field label="Título do Documento">
            <Input value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} placeholder="Formulário de..." />
          </Field>
          <Field label="Tamanho (ex: 1.2 MB)">
            <Input value={serviceForm.fileSize} onChange={(e) => setServiceForm({ ...serviceForm, fileSize: e.target.value })} placeholder="1.2 MB" />
          </Field>
          <Field label="Descrição">
            <Textarea rows={2} value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} placeholder="Instruções de uso" />
          </Field>
          <Field label="Caminho do Ficheiro PDF">
            <div className="flex gap-3">
              <Input value={serviceForm.filePath} onChange={(e) => setServiceForm({ ...serviceForm, filePath: e.target.value })} placeholder="/uploads/formulario.pdf" />
              <FileUpload onUploaded={(url) => setServiceForm({ ...serviceForm, filePath: url })} />
            </div>
          </Field>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={serviceForm.active} onChange={(e) => setServiceForm({ ...serviceForm, active: e.target.checked })} className="w-4 h-4 accent-orange-500" />
            <span className="text-sm font-bold text-slate-300">Ativo no portal</span>
          </label>
          <button onClick={saveService} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> {editingService ? "Guardar Alterações" : "Criar Documento"}
          </button>
        </div>
      </Modal>

      {/* ── ALERTS MODAL ────────────────────────────────────────────────────── */}
      <Modal open={alertsModal} onClose={() => setAlertsModal(false)} title={editingAlert ? "Editar Alerta" : "Novo Alerta de Rede"}>
        <div className="space-y-5">
          <Field label="Tipo">
            <select
              value={alertForm.type}
              onChange={(e) => setAlertForm({ ...alertForm, type: e.target.value as NetworkAlert["type"] })}
              className="w-full border-2 border-white/10 focus:border-orange-500 p-3 rounded-xl outline-none transition-colors text-slate-100"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <option value="URGENT">Urgente</option>
              <option value="SCHEDULED">Agendado</option>
              <option value="RESOLVED">Resolvido</option>
            </select>
          </Field>
          <Field label="Zona / Região">
            <Input value={alertForm.zone} onChange={(e) => setAlertForm({ ...alertForm, zone: e.target.value })} placeholder="Sul — Rede Principal" />
          </Field>
          <Field label="Título do Alerta">
            <Input value={alertForm.title} onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })} placeholder="Interrupção não programada..." />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Data e Hora">
              <Input value={alertForm.date} onChange={(e) => setAlertForm({ ...alertForm, date: e.target.value })} placeholder="07 Mai 2026 · 02:15" />
            </Field>
            <Field label="Duração">
              <Input value={alertForm.duration} onChange={(e) => setAlertForm({ ...alertForm, duration: e.target.value })} placeholder="6 horas" />
            </Field>
          </div>
          <Field label="Descrição">
            <Textarea rows={3} value={alertForm.description} onChange={(e) => setAlertForm({ ...alertForm, description: e.target.value })} placeholder="Detalhes do alerta..." />
          </Field>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={alertForm.active} onChange={(e) => setAlertForm({ ...alertForm, active: e.target.checked })} className="w-4 h-4 accent-orange-500" />
            <span className="text-sm font-bold text-slate-300">Visível no portal</span>
          </label>
          <button onClick={saveAlert} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> {editingAlert ? "Guardar Alterações" : "Publicar Alerta"}
          </button>
        </div>
      </Modal>

      {/* Toaster already in root layout */}
    </div>
  );
}
