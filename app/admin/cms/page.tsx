"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper, FileText, Zap, LogOut, Plus, Pencil, Trash2,
  X, Upload, Loader2, CheckCircle2, AlertOctagon, Mail, MapPin,
  Image as ImageIcon, AlertTriangle, Search,
} from "lucide-react";
import MediaCard from "@/components/admin/MediaCard";
import MediaPicker from "@/components/admin/MediaPicker";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ListToolbar from "@/components/admin/ListToolbar";
import Pagination from "@/components/admin/Pagination";
import { useDebounce } from "@/components/hooks/useDebounce";

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = "news" | "services" | "alerts" | "avarias" | "contact" | "media";
type NewsStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";

interface NewsArticle {
  id: number; tag: string; title: string; shortDesc: string;
  fullText: string; imgUrl: string | null; status: NewsStatus; publishAt: string | null;
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
type AvariaReportRow = {
  id: number; type: string; lat: number; lng: number;
  description: string; reporterIp: string | null;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED"; createdAt: string;
};
type ContactMessageRow = {
  id: number; nome: string; email: string; mensagem: string;
  read: boolean; createdAt: string;
};
type MediaAssetRow = {
  id: number; filename: string; originalName: string; url: string;
  mimeType: string; sizeBytes: number; uploadedBy: string | null; createdAt: string;
};

const LIMIT = 20;

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

  // ── Confirm dialog state ────────────────────────────────────────────────────
  const [confirmState, setConfirmState] = useState<{
    open: boolean; title: string; message: string; onConfirm: () => void;
  } | null>(null);
  const askConfirm = (opts: Omit<NonNullable<typeof confirmState>, "open">) =>
    setConfirmState({ ...opts, open: true });

  // ── News state ──────────────────────────────────────────────────────────────
  const [newsList, setNewsList] = useState<NewsArticle[]>([]);
  const [newsTotal, setNewsTotal] = useState(0);
  const [newsPage, setNewsPage] = useState(1);
  const [newsQ, setNewsQ] = useState("");
  const [newsStatus, setNewsStatus] = useState("");
  const [newsSort, setNewsSort] = useState("newest");
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsModal, setNewsModal] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [newsForm, setNewsForm] = useState({ tag: "", title: "", shortDesc: "", fullText: "", imgUrl: "", status: "DRAFT" as NewsStatus, publishAt: "" });
  const [newsErrors, setNewsErrors] = useState<Record<string, string>>({});
  const [newsPreviewing, setNewsPreviewing] = useState(false);

  // ── Services state ──────────────────────────────────────────────────────────
  const [servicesList, setServicesList] = useState<ServiceDocument[]>([]);
  const [servicesTotal, setServicesTotal] = useState(0);
  const [servicesPage, setServicesPage] = useState(1);
  const [servicesQ, setServicesQ] = useState("");
  const [servicesStatus, setServicesStatus] = useState("");
  const [servicesSort, setServicesSort] = useState("newest");
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesModal, setServicesModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceDocument | null>(null);
  const [serviceForm, setServiceForm] = useState({ docId: "", title: "", fileSize: "", description: "", filePath: "", active: true });

  // ── Alerts state ────────────────────────────────────────────────────────────
  const [alertsList, setAlertsList] = useState<NetworkAlert[]>([]);
  const [alertsTotal, setAlertsTotal] = useState(0);
  const [alertsPage, setAlertsPage] = useState(1);
  const [alertsQ, setAlertsQ] = useState("");
  const [alertsStatus, setAlertsStatus] = useState("");
  const [alertsSort, setAlertsSort] = useState("newest");
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsModal, setAlertsModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<NetworkAlert | null>(null);
  const [alertForm, setAlertForm] = useState<{
    type: NetworkAlert["type"]; zone: string; title: string;
    date: string; duration: string; description: string; active: boolean;
  }>({ type: "SCHEDULED", zone: "", title: "", date: "", duration: "", description: "", active: true });

  // ── Avarias state ───────────────────────────────────────────────────────────
  const [avariasList, setAvariasList] = useState<AvariaReportRow[]>([]);
  const [avariasTotal, setAvariasTotal] = useState(0);
  const [avariasPage, setAvariasPage] = useState(1);
  const [avariasQ, setAvariasQ] = useState("");
  const [avariasStatus, setAvariasStatus] = useState("");
  const [avariasSort, setAvariasSort] = useState("newest");
  const [avariasLoading, setAvariasLoading] = useState(false);
  const [pendingAvariasCount, setPendingAvariasCount] = useState(0);

  // ── Contact messages state ──────────────────────────────────────────────────
  const [messagesList, setMessagesList] = useState<ContactMessageRow[]>([]);
  const [messagesTotal, setMessagesTotal] = useState(0);
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesQ, setMessagesQ] = useState("");
  const [messagesStatus, setMessagesStatus] = useState("");
  const [messagesSort, setMessagesSort] = useState("newest");
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [openMessage, setOpenMessage] = useState<ContactMessageRow | null>(null);

  // ── Media state ─────────────────────────────────────────────────────────────
  const [mediaList, setMediaList] = useState<MediaAssetRow[]>([]);
  const [mediaTotal, setMediaTotal] = useState(0);
  const [mediaPage, setMediaPage] = useState(1);
  const [mediaQ, setMediaQ] = useState("");
  const [mediaStatus, setMediaStatus] = useState("");
  const [mediaSort, setMediaSort] = useState("newest");
  const [mediaLoading, setMediaLoading] = useState(false);
  const [orphans, setOrphans] = useState<MediaAssetRow[]>([]);
  const [orphansChecking, setOrphansChecking] = useState(false);
  const [newsPickerOpen, setNewsPickerOpen] = useState(false);
  const [servicesPickerOpen, setServicesPickerOpen] = useState(false);

  // ── Debounced search values ─────────────────────────────────────────────────
  const debouncedNewsQ = useDebounce(newsQ, 300);
  const debouncedServicesQ = useDebounce(servicesQ, 300);
  const debouncedAlertsQ = useDebounce(alertsQ, 300);
  const debouncedAvariasQ = useDebounce(avariasQ, 300);
  const debouncedMessagesQ = useDebounce(messagesQ, 300);
  const debouncedMediaQ = useDebounce(mediaQ, 300);

  // ── Count fetchers ──────────────────────────────────────────────────────────
  const loadAvariasCount = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/avarias/count");
      if (res.ok) {
        const { count } = await res.json();
        setPendingAvariasCount(count);
      }
    } catch { /* silent */ }
  }, []);

  const loadMessagesCount = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/contact/count");
      if (res.ok) {
        const { count } = await res.json();
        setUnreadMessagesCount(count);
      }
    } catch { /* silent */ }
  }, []);

  // ── Fetchers ────────────────────────────────────────────────────────────────
  const loadNews = useCallback(async () => {
    setNewsLoading(true);
    try {
      const params = new URLSearchParams({
        q: debouncedNewsQ, status: newsStatus, sort: newsSort,
        page: String(newsPage), limit: String(LIMIT),
      });
      const res = await fetch(`/api/admin/news?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNewsList(data.items);
      setNewsTotal(data.total);
    } catch {
      toast.error("Não foi possível carregar notícias.");
    } finally {
      setNewsLoading(false);
    }
  }, [debouncedNewsQ, newsStatus, newsSort, newsPage]);

  const loadServices = useCallback(async () => {
    setServicesLoading(true);
    try {
      const params = new URLSearchParams({
        q: debouncedServicesQ, status: servicesStatus, sort: servicesSort,
        page: String(servicesPage), limit: String(LIMIT),
      });
      const res = await fetch(`/api/admin/services?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setServicesList(data.items);
      setServicesTotal(data.total);
    } catch {
      toast.error("Não foi possível carregar documentos.");
    } finally {
      setServicesLoading(false);
    }
  }, [debouncedServicesQ, servicesStatus, servicesSort, servicesPage]);

  const loadAlerts = useCallback(async () => {
    setAlertsLoading(true);
    try {
      const params = new URLSearchParams({
        q: debouncedAlertsQ, status: alertsStatus, sort: alertsSort,
        page: String(alertsPage), limit: String(LIMIT),
      });
      const res = await fetch(`/api/admin/alerts?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAlertsList(data.items);
      setAlertsTotal(data.total);
    } catch {
      toast.error("Não foi possível carregar alertas.");
    } finally {
      setAlertsLoading(false);
    }
  }, [debouncedAlertsQ, alertsStatus, alertsSort, alertsPage]);

  const loadAvarias = useCallback(async () => {
    setAvariasLoading(true);
    try {
      const params = new URLSearchParams({
        q: debouncedAvariasQ, status: avariasStatus, sort: avariasSort,
        page: String(avariasPage), limit: String(LIMIT),
      });
      const res = await fetch(`/api/admin/avarias?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAvariasList(data.items);
      setAvariasTotal(data.total);
      loadAvariasCount();
    } catch {
      toast.error("Não foi possível carregar avarias.");
    } finally {
      setAvariasLoading(false);
    }
  }, [debouncedAvariasQ, avariasStatus, avariasSort, avariasPage, loadAvariasCount]);

  const loadMessages = useCallback(async () => {
    setMessagesLoading(true);
    try {
      const params = new URLSearchParams({
        q: debouncedMessagesQ, status: messagesStatus, sort: messagesSort,
        page: String(messagesPage), limit: String(LIMIT),
      });
      const res = await fetch(`/api/admin/contact?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessagesList(data.items);
      setMessagesTotal(data.total);
      loadMessagesCount();
    } catch {
      toast.error("Não foi possível carregar mensagens.");
    } finally {
      setMessagesLoading(false);
    }
  }, [debouncedMessagesQ, messagesStatus, messagesSort, messagesPage, loadMessagesCount]);

  const loadMedia = useCallback(async () => {
    setMediaLoading(true);
    try {
      const params = new URLSearchParams({
        q: debouncedMediaQ, status: mediaStatus, sort: mediaSort,
        page: String(mediaPage), limit: String(LIMIT),
      });
      const res = await fetch(`/api/admin/media?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMediaList(data.items);
      setMediaTotal(data.total);
    } catch {
      toast.error("Não foi possível carregar media.");
    } finally {
      setMediaLoading(false);
    }
  }, [debouncedMediaQ, mediaStatus, mediaSort, mediaPage]);

  useEffect(() => { loadNews(); }, [loadNews]);
  useEffect(() => { loadServices(); }, [loadServices]);
  useEffect(() => { loadAlerts(); }, [loadAlerts]);
  useEffect(() => { loadAvarias(); }, [loadAvarias]);
  useEffect(() => { loadMessages(); }, [loadMessages]);
  useEffect(() => { loadMedia(); }, [loadMedia]);

  // ── Reset page to 1 when filters change ────────────────────────────────────
  useEffect(() => { setNewsPage(1); }, [debouncedNewsQ, newsStatus, newsSort]);
  useEffect(() => { setServicesPage(1); }, [debouncedServicesQ, servicesStatus, servicesSort]);
  useEffect(() => { setAlertsPage(1); }, [debouncedAlertsQ, alertsStatus, alertsSort]);
  useEffect(() => { setAvariasPage(1); }, [debouncedAvariasQ, avariasStatus, avariasSort]);
  useEffect(() => { setMessagesPage(1); }, [debouncedMessagesQ, messagesStatus, messagesSort]);
  useEffect(() => { setMediaPage(1); }, [debouncedMediaQ, mediaStatus, mediaSort]);

  // ── News CRUD ───────────────────────────────────────────────────────────────
  const validateNewsForm = (form: typeof newsForm): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (form.tag.trim().length < 1) errors.tag = "Categoria obrigatória.";
    if (form.title.trim().length < 3) errors.title = "Título demasiado curto (mínimo 3 caracteres).";
    if (form.shortDesc.trim().length < 10) errors.shortDesc = "Resumo demasiado curto (mínimo 10 caracteres).";
    if (form.fullText.trim().length < 20) errors.fullText = "Conteúdo demasiado curto (mínimo 20 caracteres).";
    if (form.status === "SCHEDULED" && !form.publishAt) {
      errors.publishAt = "Data de publicação obrigatória para artigos agendados.";
    }
    if (form.status === "SCHEDULED" && form.publishAt && new Date(form.publishAt) <= new Date()) {
      errors.publishAt = "Data deve ser no futuro.";
    }
    return errors;
  };

  const openNewsCreate = () => {
    setEditingNews(null);
    setNewsForm({ tag: "", title: "", shortDesc: "", fullText: "", imgUrl: "", status: "DRAFT", publishAt: "" });
    setNewsErrors({});
    setNewsModal(true);
  };
  const openNewsEdit = (n: NewsArticle) => {
    setEditingNews(n);
    const publishAt = n.publishAt ? new Date(n.publishAt).toISOString().slice(0, 16) : "";
    setNewsForm({ tag: n.tag, title: n.title, shortDesc: n.shortDesc, fullText: n.fullText, imgUrl: n.imgUrl ?? "", status: n.status, publishAt });
    setNewsErrors({});
    setNewsModal(true);
  };
  const saveNews = async () => {
    const errors = validateNewsForm(newsForm);
    setNewsErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Corrija os campos assinalados.");
      return;
    }
    const method = editingNews ? "PUT" : "POST";
    const url = editingNews ? `/api/admin/news/${editingNews.id}` : "/api/admin/news";
    const payload = {
      ...newsForm,
      imgUrl: newsForm.imgUrl || null,
      publishAt: newsForm.publishAt ? new Date(newsForm.publishAt).toISOString() : null,
    };
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) { toast.success(editingNews ? "Notícia atualizada." : "Notícia criada."); setNewsModal(false); loadNews(); }
    else toast.error("Erro ao guardar.");
  };
  const deleteNews = (id: number) => {
    askConfirm({
      title: "Apagar notícia?",
      message: "Esta acção é permanente e não pode ser desfeita.",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
        if (res.ok) { toast.success("Notícia apagada."); loadNews(); }
        else toast.error("Erro ao apagar.");
      },
    });
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
  const deleteService = (id: number) => {
    askConfirm({
      title: "Apagar documento?",
      message: "Esta acção é permanente e não pode ser desfeita.",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
        if (res.ok) { toast.success("Documento apagado."); loadServices(); }
        else toast.error("Erro ao apagar.");
      },
    });
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
  const deleteAlert = (id: number) => {
    askConfirm({
      title: "Apagar alerta?",
      message: "Esta acção é permanente e não pode ser desfeita.",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/alerts/${id}`, { method: "DELETE" });
        if (res.ok) { toast.success("Alerta apagado."); loadAlerts(); }
        else toast.error("Erro ao apagar.");
      },
    });
  };

  // ── Avarias handlers ────────────────────────────────────────────────────────
  const updateAvariaStatus = async (id: number, status: AvariaReportRow["status"]) => {
    try {
      const res = await fetch(`/api/admin/avarias/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setAvariasList((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      loadAvariasCount();
      toast.success("Estado actualizado.");
    } catch {
      toast.error("Não foi possível actualizar o estado.");
    }
  };
  const deleteAvaria = (id: number) => {
    askConfirm({
      title: "Eliminar relatório?",
      message: "Esta acção é permanente.",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/avarias/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error();
          toast.success("Relatório eliminado.");
          loadAvarias();
        } catch {
          toast.error("Não foi possível eliminar.");
        }
      },
    });
  };

  // ── Contact message handlers ─────────────────────────────────────────────────
  const markMessageRead = async (id: number, read: boolean) => {
    try {
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read }),
      });
      if (!res.ok) throw new Error();
      setMessagesList((prev) => prev.map((m) => (m.id === id ? { ...m, read } : m)));
      if (openMessage?.id === id) setOpenMessage((prev) => prev ? { ...prev, read } : prev);
      loadMessagesCount();
    } catch {
      toast.error("Não foi possível marcar a mensagem.");
    }
  };
  const deleteMessage = (id: number) => {
    askConfirm({
      title: "Eliminar mensagem?",
      message: "Esta acção é permanente.",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/contact/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error();
          if (openMessage?.id === id) setOpenMessage(null);
          toast.success("Mensagem eliminada.");
          loadMessages();
        } catch {
          toast.error("Não foi possível eliminar.");
        }
      },
    });
  };

  const handleOpenMessage = (msg: ContactMessageRow) => {
    setOpenMessage(msg);
    if (!msg.read) markMessageRead(msg.id, true);
  };

  // ── Status select border color ───────────────────────────────────────────────
  const statusBorderColor = (status: AvariaReportRow["status"]) => {
    if (status === "PENDING") return "border-red-500";
    if (status === "IN_PROGRESS") return "border-amber-500";
    return "border-emerald-500";
  };

  // ── Media handlers ───────────────────────────────────────────────────────────
  const handleCopyUrl = async (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success("URL copiado para a área de transferência.");
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };

  const handleDeleteMedia = (id: number, originalName: string) => {
    askConfirm({
      title: "Eliminar ficheiro?",
      message: `Esta acção vai eliminar "${originalName}" permanentemente. Se o ficheiro estiver em uso por uma notícia ou serviço, a referência ficará quebrada.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error();
          setMediaList((prev) => prev.filter((m) => m.id !== id));
          setMediaTotal((t) => t - 1);
          toast.success("Ficheiro eliminado.");
        } catch {
          toast.error("Não foi possível eliminar.");
        }
      },
    });
  };

  const checkOrphans = async () => {
    setOrphansChecking(true);
    try {
      const res = await fetch("/api/admin/media/orphans");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrphans(data.orphans);
      if (data.orphans.length === 0) {
        toast.success("Nenhum órfão encontrado — tudo arrumado!");
      } else {
        toast(`${data.orphans.length} ficheiro(s) órfão(s) detectado(s).`, { icon: "⚠️" });
      }
    } catch {
      toast.error("Não foi possível verificar órfãos.");
    } finally {
      setOrphansChecking(false);
    }
  };

  const cleanupOrphans = async () => {
    try {
      const res = await fetch("/api/admin/media/orphans/cleanup", { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(`${data.removed} ficheiro(s) eliminado(s).`);
      setOrphans([]);
      loadMedia();
    } catch {
      toast.error("Não foi possível limpar.");
    }
  };

  // ── Layout ──────────────────────────────────────────────────────────────────
  const TABS = [
    { key: "news" as Tab, label: "Notícias", icon: Newspaper, badge: 0 },
    { key: "services" as Tab, label: "Serviços", icon: FileText, badge: 0 },
    { key: "alerts" as Tab, label: "Alertas de Rede", icon: Zap, badge: 0 },
    { key: "avarias" as Tab, label: "Avarias", icon: AlertOctagon, badge: pendingAvariasCount },
    { key: "contact" as Tab, label: "Mensagens", icon: Mail, badge: unreadMessagesCount },
    { key: "media" as Tab, label: "Media", icon: ImageIcon, badge: 0 },
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
        {TABS.map(({ key, label, icon: Icon, badge }) => (
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
            {badge > 0 && (
              <span className="ml-1 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold"
                style={tab === key ? { background: "rgba(255,255,255,0.3)" } : undefined}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── NEWS TAB ────────────────────────────────────────────────────────── */}
      {tab === "news" && (
        <GlassPanel>
          <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 className="font-black text-white">
              Notícias <span className="text-slate-500 font-normal text-sm ml-2">({newsTotal})</span>
            </h2>
            <button onClick={openNewsCreate} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
              <Plus className="w-4 h-4" /> Nova Notícia
            </button>
          </div>
          <div className="p-6">
            <ListToolbar
              q={newsQ}
              onQChange={setNewsQ}
              placeholder="Pesquisar por título, descrição ou tag…"
              status={newsStatus}
              onStatusChange={setNewsStatus}
              statusOptions={[
                { value: "DRAFT",     label: "Rascunhos" },
                { value: "PUBLISHED", label: "Publicados" },
                { value: "SCHEDULED", label: "Agendados" },
                { value: "ARCHIVED",  label: "Arquivados" },
              ]}
              sort={newsSort}
              onSortChange={setNewsSort}
              sortOptions={[
                { value: "newest", label: "Mais recentes" },
                { value: "oldest", label: "Mais antigos" },
                { value: "az", label: "A → Z" },
                { value: "za", label: "Z → A" },
              ]}
            />
            {newsLoading ? (
              <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
            ) : newsList.length === 0 ? (
              <div className="text-center p-12 text-slate-500">
                {newsQ || newsStatus ? "Nenhum resultado para os filtros aplicados." : "Nenhuma notícia. Adicione a primeira."}
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {newsList.map((n) => (
                  <div key={n.id} className="flex items-start gap-4 py-4 group hover:bg-white/[0.02] transition-colors rounded-xl px-2">
                    {n.imgUrl && (
                      <img src={n.imgUrl} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">{n.tag}</span>
                        {n.status === "DRAFT" && <span className="text-xs px-2 py-0.5 rounded bg-slate-500/20 text-slate-400 font-bold uppercase">Rascunho</span>}
                        {n.status === "PUBLISHED" && <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase">Publicado</span>}
                        {n.status === "SCHEDULED" && <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold uppercase">Agendado{n.publishAt ? ` · ${new Date(n.publishAt).toLocaleString("pt-PT")}` : ""}</span>}
                        {n.status === "ARCHIVED" && <span className="text-xs px-2 py-0.5 rounded bg-zinc-500/20 text-zinc-500 font-bold uppercase">Arquivado</span>}
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
            <Pagination page={newsPage} total={newsTotal} limit={LIMIT} onPageChange={setNewsPage} />
          </div>
        </GlassPanel>
      )}

      {/* ── SERVICES TAB ────────────────────────────────────────────────────── */}
      {tab === "services" && (
        <GlassPanel>
          <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 className="font-black text-white">
              Documentos e Serviços <span className="text-slate-500 font-normal text-sm ml-2">({servicesTotal})</span>
            </h2>
            <button onClick={openServiceCreate} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
              <Plus className="w-4 h-4" /> Novo Documento
            </button>
          </div>
          <div className="p-6">
            <ListToolbar
              q={servicesQ}
              onQChange={setServicesQ}
              placeholder="Pesquisar por título, descrição ou docId…"
              status={servicesStatus}
              onStatusChange={setServicesStatus}
              statusOptions={[
                { value: "active", label: "Activos" },
                { value: "inactive", label: "Inactivos" },
              ]}
              sort={servicesSort}
              onSortChange={setServicesSort}
              sortOptions={[
                { value: "newest", label: "Mais recentes" },
                { value: "oldest", label: "Mais antigos" },
              ]}
            />
            {servicesLoading ? (
              <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
            ) : servicesList.length === 0 ? (
              <div className="text-center p-12 text-slate-500">
                {servicesQ || servicesStatus ? "Nenhum resultado para os filtros aplicados." : "Nenhum documento."}
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {servicesList.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 py-4 hover:bg-white/[0.02] transition-colors rounded-xl px-2">
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
            <Pagination page={servicesPage} total={servicesTotal} limit={LIMIT} onPageChange={setServicesPage} />
          </div>
        </GlassPanel>
      )}

      {/* ── ALERTS TAB ──────────────────────────────────────────────────────── */}
      {tab === "alerts" && (
        <GlassPanel>
          <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 className="font-black text-white">
              Alertas de Rede <span className="text-slate-500 font-normal text-sm ml-2">({alertsTotal})</span>
            </h2>
            <button onClick={openAlertCreate} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
              <Plus className="w-4 h-4" /> Novo Alerta
            </button>
          </div>
          <div className="p-6">
            <ListToolbar
              q={alertsQ}
              onQChange={setAlertsQ}
              placeholder="Pesquisar por título, zona ou descrição…"
              status={alertsStatus}
              onStatusChange={setAlertsStatus}
              statusOptions={[
                { value: "URGENT", label: "Urgente" },
                { value: "SCHEDULED", label: "Programado" },
                { value: "RESOLVED", label: "Resolvido" },
                { value: "active", label: "Activos" },
                { value: "inactive", label: "Inactivos" },
              ]}
              sort={alertsSort}
              onSortChange={setAlertsSort}
              sortOptions={[
                { value: "newest", label: "Mais recentes" },
                { value: "oldest", label: "Mais antigos" },
              ]}
            />
            {alertsLoading ? (
              <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
            ) : alertsList.length === 0 ? (
              <div className="text-center p-12 text-slate-500">
                {alertsQ || alertsStatus ? "Nenhum resultado para os filtros aplicados." : "Nenhum alerta."}
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {alertsList.map((a) => (
                  <div key={a.id} className="flex items-start gap-4 py-4 hover:bg-white/[0.02] transition-colors rounded-xl px-2">
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
            <Pagination page={alertsPage} total={alertsTotal} limit={LIMIT} onPageChange={setAlertsPage} />
          </div>
        </GlassPanel>
      )}

      {/* ── AVARIAS TAB ─────────────────────────────────────────────────────── */}
      {tab === "avarias" && (
        <GlassPanel>
          <div className="p-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 className="font-black text-white mb-1">Relatórios de Avaria</h2>
            <p className="text-sm text-slate-500">
              {avariasTotal} relatórios — {pendingAvariasCount} pendentes
            </p>
          </div>
          <div className="p-6">
            <ListToolbar
              q={avariasQ}
              onQChange={setAvariasQ}
              placeholder="Pesquisar por descrição ou tipo…"
              status={avariasStatus}
              onStatusChange={setAvariasStatus}
              statusOptions={[
                { value: "PENDING", label: "Pendente" },
                { value: "IN_PROGRESS", label: "Em Curso" },
                { value: "RESOLVED", label: "Resolvido" },
              ]}
              sort={avariasSort}
              onSortChange={setAvariasSort}
              sortOptions={[
                { value: "newest", label: "Mais recentes" },
                { value: "oldest", label: "Mais antigos" },
              ]}
            />
            {avariasLoading ? (
              <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
            ) : avariasList.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500 gap-3">
                <AlertOctagon className="w-10 h-10 opacity-30" />
                <span>{avariasQ || avariasStatus ? "Nenhum resultado para os filtros aplicados." : "Sem avarias reportadas."}</span>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {avariasList.map((a) => (
                  <div key={a.id} className="flex items-start gap-4 py-4 hover:bg-white/[0.02] transition-colors rounded-xl px-2">
                    {/* Left: type + description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-orange-500/20 border border-orange-500/40 text-orange-400 px-2 py-0.5 rounded text-xs uppercase font-bold">
                          {a.type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-200 leading-snug">
                        {a.description.length > 100 ? a.description.slice(0, 100) + "…" : a.description}
                      </p>
                      {a.reporterIp && (
                        <p className="text-xs text-slate-500 mt-1">IP: {a.reporterIp}</p>
                      )}
                    </div>
                    {/* Middle: coordinates + map link */}
                    <div className="shrink-0 text-center min-w-[140px]">
                      <p className="text-xs text-slate-400 font-mono">
                        {a.lat.toFixed(6)}, {a.lng.toFixed(6)}
                      </p>
                      <a
                        href={`https://www.google.com/maps?q=${a.lat},${a.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors mt-1"
                      >
                        <MapPin className="w-3 h-3" /> Ver no mapa
                      </a>
                      <p className="text-xs text-slate-600 mt-1">
                        {new Date(a.createdAt).toLocaleString("pt-PT")}
                      </p>
                    </div>
                    {/* Right: status select */}
                    <div className="shrink-0">
                      <select
                        value={a.status}
                        onChange={(e) => updateAvariaStatus(a.id, e.target.value as AvariaReportRow["status"])}
                        className={`border-2 ${statusBorderColor(a.status)} bg-black/40 text-slate-200 text-xs font-bold rounded-lg px-2 py-1.5 outline-none transition-colors cursor-pointer`}
                      >
                        <option value="PENDING">Pendente</option>
                        <option value="IN_PROGRESS">Em Curso</option>
                        <option value="RESOLVED">Resolvido</option>
                      </select>
                    </div>
                    {/* Far right: delete */}
                    <button
                      onClick={() => deleteAvaria(a.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-400 transition-colors shrink-0"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <Pagination page={avariasPage} total={avariasTotal} limit={LIMIT} onPageChange={setAvariasPage} />
          </div>
        </GlassPanel>
      )}

      {/* ── CONTACT MESSAGES TAB ────────────────────────────────────────────── */}
      {tab === "contact" && (
        <GlassPanel>
          <div className="p-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 className="font-black text-white mb-1">Mensagens de Contacto</h2>
            <p className="text-sm text-slate-500">
              {messagesTotal} mensagens — {unreadMessagesCount} não lidas
            </p>
          </div>
          <div className="p-6">
            <ListToolbar
              q={messagesQ}
              onQChange={setMessagesQ}
              placeholder="Pesquisar por nome, email ou mensagem…"
              status={messagesStatus}
              onStatusChange={setMessagesStatus}
              statusOptions={[
                { value: "unread", label: "Não Lidas" },
                { value: "read", label: "Lidas" },
              ]}
              sort={messagesSort}
              onSortChange={setMessagesSort}
              sortOptions={[
                { value: "newest", label: "Mais recentes" },
                { value: "oldest", label: "Mais antigos" },
              ]}
            />
            {messagesLoading ? (
              <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
            ) : messagesList.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500 gap-3">
                <Mail className="w-10 h-10 opacity-30" />
                <span>{messagesQ || messagesStatus ? "Nenhum resultado para os filtros aplicados." : "Sem mensagens recebidas."}</span>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {messagesList.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-start gap-4 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer group rounded-xl px-2"
                    onClick={() => handleOpenMessage(msg)}
                  >
                    {/* Unread dot */}
                    <div className="shrink-0 mt-2 w-2 h-2">
                      {!msg.read && <span className="block w-2 h-2 rounded-full bg-orange-500" />}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-slate-100">{msg.nome}</span>
                        <span className="text-slate-500 text-sm">{msg.email}</span>
                        <span className="text-slate-700 text-xs">·</span>
                        <span className="text-slate-600 text-xs">{new Date(msg.createdAt).toLocaleString("pt-PT")}</span>
                      </div>
                      <p className="text-slate-400 text-sm line-clamp-2">
                        {msg.mensagem.length > 140 ? msg.mensagem.slice(0, 140) + "…" : msg.mensagem}
                      </p>
                    </div>
                    {/* Delete */}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <Pagination page={messagesPage} total={messagesTotal} limit={LIMIT} onPageChange={setMessagesPage} />
          </div>
        </GlassPanel>
      )}

      {/* ── MEDIA TAB ───────────────────────────────────────────────────────── */}
      {tab === "media" && (
        <GlassPanel>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-2xl font-bold text-slate-100">
                Biblioteca de Media <span className="text-slate-500 text-base font-normal">({mediaTotal})</span>
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={checkOrphans}
                  disabled={orphansChecking}
                  className="px-4 py-2 rounded-lg border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  {orphansChecking ? "A verificar…" : "Verificar Órfãos"}
                </button>
              </div>
            </div>

            <ListToolbar
              q={mediaQ}
              onQChange={setMediaQ}
              placeholder="Pesquisar por nome do ficheiro…"
              status={mediaStatus}
              onStatusChange={setMediaStatus}
              statusOptions={[
                { value: "image", label: "Imagens" },
                { value: "pdf", label: "PDFs" },
              ]}
              sort={mediaSort}
              onSortChange={setMediaSort}
              sortOptions={[
                { value: "newest", label: "Mais recentes" },
                { value: "oldest", label: "Mais antigos" },
                { value: "largest", label: "Maiores primeiro" },
                { value: "smallest", label: "Menores primeiro" },
              ]}
            />

            {orphans.length > 0 && (
              <div className="mb-4 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-amber-300 font-bold mb-1">
                      {orphans.length} ficheiro(s) órfão(s) encontrado(s)
                    </p>
                    <p className="text-amber-200/80 text-sm mb-3">
                      Estes ficheiros não estão referenciados por nenhuma notícia ou serviço. Pode eliminá-los para libertar espaço.
                    </p>
                    <button
                      type="button"
                      onClick={() => askConfirm({
                        title: "Eliminar ficheiros órfãos?",
                        message: `Esta acção vai eliminar ${orphans.length} ficheiro(s) permanentemente. Confirmar?`,
                        onConfirm: cleanupOrphans,
                      })}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold transition-colors"
                    >
                      Eliminar Órfãos
                    </button>
                  </div>
                </div>
              </div>
            )}

            {mediaLoading ? (
              <div className="text-center py-12 text-slate-500">A carregar…</div>
            ) : mediaList.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                {mediaQ || mediaStatus ? "Nenhum resultado." : "Sem ficheiros carregados."}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {mediaList.map((asset) => (
                  <MediaCard
                    key={asset.id}
                    asset={asset}
                    onCopyUrl={handleCopyUrl}
                    onDelete={handleDeleteMedia}
                  />
                ))}
              </div>
            )}

            <Pagination page={mediaPage} total={mediaTotal} limit={LIMIT} onPageChange={setMediaPage} />
          </div>
        </GlassPanel>
      )}

      {/* ── NEWS MODAL ──────────────────────────────────────────────────────── */}
      <Modal open={newsModal} onClose={() => { setNewsModal(false); setNewsPreviewing(false); }} title={editingNews ? "Editar Notícia" : "Nova Notícia"}>
        <div className="space-y-5">
          <Field label="Tag (ex: Destaque)">
            <Input
              value={newsForm.tag}
              onChange={(e) => { setNewsForm({ ...newsForm, tag: e.target.value }); if (newsErrors.tag) setNewsErrors(prev => ({ ...prev, tag: "" })); }}
              placeholder="Destaque"
              className={newsErrors.tag ? "border-red-500" : ""}
            />
            {newsErrors.tag && <p className="text-red-400 text-xs mt-1">{newsErrors.tag}</p>}
          </Field>
          <Field label="Título">
            <Input
              value={newsForm.title}
              onChange={(e) => { setNewsForm({ ...newsForm, title: e.target.value }); if (newsErrors.title) setNewsErrors(prev => ({ ...prev, title: "" })); }}
              placeholder="Título da notícia"
              className={newsErrors.title ? "border-red-500" : ""}
            />
            {newsErrors.title && <p className="text-red-400 text-xs mt-1">{newsErrors.title}</p>}
          </Field>
          <Field label="Resumo">
            <Textarea
              rows={2}
              value={newsForm.shortDesc}
              onChange={(e) => { setNewsForm({ ...newsForm, shortDesc: e.target.value }); if (newsErrors.shortDesc) setNewsErrors(prev => ({ ...prev, shortDesc: "" })); }}
              placeholder="Descrição breve"
              className={newsErrors.shortDesc ? "border-red-500" : ""}
            />
            {newsErrors.shortDesc && <p className="text-red-400 text-xs mt-1">{newsErrors.shortDesc}</p>}
          </Field>
          <Field label="Conteúdo">
            <Textarea
              rows={5}
              value={newsForm.fullText}
              onChange={(e) => { setNewsForm({ ...newsForm, fullText: e.target.value }); if (newsErrors.fullText) setNewsErrors(prev => ({ ...prev, fullText: "" })); }}
              placeholder="Conteúdo completo da notícia"
              className={newsErrors.fullText ? "border-red-500" : ""}
            />
            {newsErrors.fullText && <p className="text-red-400 text-xs mt-1">{newsErrors.fullText}</p>}
          </Field>
          <Field label="URL / Caminho da Imagem">
            <div className="flex gap-3">
              <Input value={newsForm.imgUrl} onChange={(e) => setNewsForm({ ...newsForm, imgUrl: e.target.value })} placeholder="https://... ou /uploads/..." />
              <FileUpload onUploaded={(url) => setNewsForm({ ...newsForm, imgUrl: url })} />
              <button
                type="button"
                onClick={() => setNewsPickerOpen(true)}
                className="px-4 py-3 rounded-xl text-sm font-bold text-orange-400 whitespace-nowrap transition-colors"
                style={{ background: "rgba(249,115,22,0.12)", border: "2px solid rgba(249,115,22,0.3)" }}
              >
                Da Biblioteca
              </button>
            </div>
            {newsForm.imgUrl && (
              <div className="mt-2 rounded-lg overflow-hidden border border-white/10 max-w-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={newsForm.imgUrl} alt="Pré-visualização" className="w-full h-auto" />
              </div>
            )}
          </Field>
          <Field label="Estado">
            <div className="flex flex-wrap gap-2">
              {([
                { value: "DRAFT",     label: "Rascunho",  color: "slate" },
                { value: "PUBLISHED", label: "Publicado", color: "emerald" },
                { value: "SCHEDULED", label: "Agendado",  color: "orange" },
                { value: "ARCHIVED",  label: "Arquivado", color: "zinc" },
              ] as const).map((opt) => {
                const isActive = newsForm.status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setNewsForm(prev => ({ ...prev, status: opt.value }))}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors text-sm font-medium ${
                      isActive
                        ? opt.color === "emerald" ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                        : opt.color === "orange"  ? "border-orange-500 bg-orange-500/15 text-orange-300"
                        : opt.color === "zinc"    ? "border-zinc-500 bg-zinc-500/15 text-zinc-300"
                        :                           "border-slate-500 bg-slate-500/15 text-slate-300"
                        : "border-white/10 text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </Field>
          {newsForm.status === "SCHEDULED" && (
            <Field label="Publicar em">
              <input
                type="datetime-local"
                value={newsForm.publishAt}
                onChange={(e) => { setNewsForm(prev => ({ ...prev, publishAt: e.target.value })); if (newsErrors.publishAt) setNewsErrors(prev => ({ ...prev, publishAt: "" })); }}
                className={`w-full p-3 rounded-xl outline-none text-slate-100 transition-colors border-2 ${
                  newsErrors.publishAt ? "border-red-500" : "border-white/10 focus:border-orange-500"
                }`}
                style={{ background: "rgba(255,255,255,0.05)" }}
              />
              {newsErrors.publishAt && <p className="text-red-400 text-xs mt-1">{newsErrors.publishAt}</p>}
            </Field>
          )}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setNewsPreviewing(true)}
              className="px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-colors text-sm font-medium"
            >
              Pré-visualizar
            </button>
            <button onClick={saveNews} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> {editingNews ? "Guardar Alterações" : "Publicar Notícia"}
            </button>
          </div>
        </div>

        {/* ── PREVIEW OVERLAY ── */}
        <AnimatePresence>
          {newsPreviewing && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] overflow-y-auto p-4 sm:p-8"
              style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
              onClick={() => setNewsPreviewing(false)}
            >
              <motion.article
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                className="max-w-3xl mx-auto rounded-2xl overflow-hidden relative"
                style={{ background: "#09090b", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 32px 64px rgba(0,0,0,0.7)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setNewsPreviewing(false)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-lg text-slate-300 hover:bg-white/10 transition-colors"
                  style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
                  aria-label="Fechar pré-visualização"
                >
                  <X className="w-5 h-5" />
                </button>
                {newsForm.imgUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={newsForm.imgUrl} alt={newsForm.title} className="w-full h-64 object-cover" />
                )}
                <div className="p-6 sm:p-10">
                  <span className="inline-block px-3 py-1 rounded bg-orange-500/20 text-orange-400 font-bold uppercase text-xs tracking-widest mb-4">
                    {newsForm.tag || "Sem categoria"}
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-100 mb-3 leading-tight">
                    {newsForm.title || "Sem título"}
                  </h1>
                  <p className="text-lg text-slate-400 mb-6">{newsForm.shortDesc || "Sem resumo"}</p>
                  <div className="prose-evn whitespace-pre-line text-slate-400">{newsForm.fullText || "Sem conteúdo."}</div>
                  <p className="text-sm text-slate-500 mt-8 pt-4 border-t border-white/10">
                    Pré-visualização — não publicado.
                  </p>
                </div>
              </motion.article>
            </motion.div>
          )}
        </AnimatePresence>
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
              <button
                type="button"
                onClick={() => setServicesPickerOpen(true)}
                className="px-4 py-3 rounded-xl text-sm font-bold text-orange-400 whitespace-nowrap transition-colors"
                style={{ background: "rgba(249,115,22,0.12)", border: "2px solid rgba(249,115,22,0.3)" }}
              >
                Da Biblioteca
              </button>
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

      {/* ── OPEN MESSAGE MODAL ──────────────────────────────────────────────── */}
      <Modal open={!!openMessage} onClose={() => setOpenMessage(null)} title="Mensagem">
        {openMessage && (
          <div className="space-y-5">
            <div className="space-y-1">
              <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Remetente</p>
              <p className="text-white font-bold">{openMessage.nome}</p>
              <p className="text-slate-400 text-sm">{openMessage.email}</p>
              <p className="text-slate-600 text-xs">{new Date(openMessage.createdAt).toLocaleString("pt-PT")}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Mensagem</p>
              <div
                className="text-slate-200 text-sm leading-relaxed p-4 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", whiteSpace: "pre-wrap" }}
              >
                {openMessage.mensagem}
              </div>
            </div>
            <a
              href={`mailto:${openMessage.email}?subject=Re: Contacto EVN`}
              className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all"
            >
              <Mail className="w-4 h-4" /> Responder por email
            </a>
          </div>
        )}
      </Modal>

      {/* ── MEDIA PICKERS ───────────────────────────────────────────────────── */}
      <MediaPicker
        open={newsPickerOpen}
        filter="image"
        onPick={(asset) => setNewsForm((prev) => ({ ...prev, imgUrl: asset.url }))}
        onClose={() => setNewsPickerOpen(false)}
      />
      <MediaPicker
        open={servicesPickerOpen}
        filter="pdf"
        onPick={(asset) => setServiceForm((prev) => ({ ...prev, filePath: asset.url }))}
        onClose={() => setServicesPickerOpen(false)}
      />

      {/* ── CONFIRM DIALOG ──────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!confirmState?.open}
        title={confirmState?.title ?? ""}
        message={confirmState?.message ?? ""}
        variant="danger"
        onConfirm={() => { confirmState?.onConfirm(); setConfirmState(null); }}
        onCancel={() => setConfirmState(null)}
      />

      {/* Toaster already in root layout */}
    </div>
  );
}
