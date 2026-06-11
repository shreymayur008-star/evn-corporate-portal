"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper, FileText, Zap, LogOut, Plus, Pencil, Trash2,
  X, Upload, Loader2, CheckCircle2, AlertOctagon, Mail, MapPin,
  Image as ImageIcon, AlertTriangle, Search, ExternalLink, ShoppingCart,
} from "lucide-react";
import PdfLink from "@/components/pdf/PdfLink";
import MediaCard from "@/components/admin/MediaCard";
import MediaPicker from "@/components/admin/MediaPicker";
import RichTextEditor from "@/components/admin/RichTextEditor";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ListToolbar from "@/components/admin/ListToolbar";
import Pagination from "@/components/admin/Pagination";
import { useDebounce } from "@/components/hooks/useDebounce";

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = "news" | "services" | "alerts" | "avarias" | "contact" | "media" | "orders";
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

interface Order {
  id: string; orderRef: string; nome: string; email: string;
  phone: string; items: Array<{meterNumber: string; amount: number}>;
  total: number; status: string; paymentRef?: string; createdAt: string;
}

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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: "rgba(2,6,23,0.85)", backdropFilter: "blur(16px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="w-full sm:max-w-2xl rounded-t-[1.5rem] sm:rounded-3xl flex flex-col max-h-[92vh] sm:max-h-[85vh]"
            style={{
              background: "rgba(8,8,12,0.97)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 32px 64px rgba(0,0,0,0.7)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag handle */}
            <div className="sm:hidden w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-1 shrink-0" />
            <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <h3 className="font-black text-white text-base sm:text-lg">{title}</h3>
              <button type="button" onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 sm:p-8 overflow-y-auto modal-scroll">{children}</div>
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
function CMSDashboard() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(() => {
    const t = searchParams.get("tab");
    const validTabs: Tab[] = ["news", "services", "alerts", "avarias", "contact", "media", "orders"];
    return validTabs.includes(t as Tab) ? (t as Tab) : "news";
  });

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

  // ── Detail view states ──────────────────────────────────────────────────────
  const [viewingArticle, setViewingArticle] = useState<NewsArticle | null>(null);
  const [viewingAlert, setViewingAlert] = useState<NetworkAlert | null>(null);
  const [viewingAvaria, setViewingAvaria] = useState<AvariaReportRow | null>(null);
  const [viewingAvariaStatus, setViewingAvariaStatus] = useState<"PENDING" | "IN_PROGRESS" | "RESOLVED">("PENDING");

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

  // ── Orders state ────────────────────────────────────────────────────────────
  const [orders,        setOrders]        = useState<Order[]>([]);
  const [ordersTotal,   setOrdersTotal]   = useState(0);
  const [ordersPage,    setOrdersPage]    = useState(1);
  const [ordersQ,       setOrdersQ]       = useState('');
  const [ordersStatus,  setOrdersStatus]  = useState('');
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [viewingOrder,  setViewingOrder]  = useState<Order | null>(null);

  // ── Debounced search values ─────────────────────────────────────────────────
  const debouncedNewsQ = useDebounce(newsQ, 300);
  const debouncedServicesQ = useDebounce(servicesQ, 300);
  const debouncedAlertsQ = useDebounce(alertsQ, 300);
  const debouncedAvariasQ = useDebounce(avariasQ, 300);
  const debouncedMessagesQ = useDebounce(messagesQ, 300);
  const debouncedMediaQ  = useDebounce(mediaQ, 300);
  const debouncedOrdersQ = useDebounce(ordersQ, 300);

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

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedOrdersQ) params.set('q', debouncedOrdersQ);
      if (ordersStatus)     params.set('status', ordersStatus);
      params.set('page', ordersPage.toString());
      const res  = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders ?? []);
      setOrdersTotal(data.total ?? 0);
    } catch {
      toast.error("Não foi possível carregar encomendas.");
    } finally {
      setOrdersLoading(false);
    }
  }, [debouncedOrdersQ, ordersStatus, ordersPage]);

  useEffect(() => { loadNews(); }, [loadNews]);
  useEffect(() => { loadServices(); }, [loadServices]);
  useEffect(() => { loadAlerts(); }, [loadAlerts]);
  useEffect(() => { loadAvarias(); }, [loadAvarias]);
  useEffect(() => { loadMessages(); }, [loadMessages]);
  useEffect(() => { loadMedia(); }, [loadMedia]);
  useEffect(() => { if (tab === 'orders') fetchOrders(); }, [tab, fetchOrders]);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setViewingArticle(null);
        setViewingAlert(null);
        setViewingAvaria(null);
        setOpenMessage(null);
        setViewingOrder(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Pesquisar"]');
        searchInput?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Reset page to 1 when filters change ────────────────────────────────────
  useEffect(() => { setNewsPage(1); }, [debouncedNewsQ, newsStatus, newsSort]);
  useEffect(() => { setServicesPage(1); }, [debouncedServicesQ, servicesStatus, servicesSort]);
  useEffect(() => { setAlertsPage(1); }, [debouncedAlertsQ, alertsStatus, alertsSort]);
  useEffect(() => { setAvariasPage(1); }, [debouncedAvariasQ, avariasStatus, avariasSort]);
  useEffect(() => { setMessagesPage(1); }, [debouncedMessagesQ, messagesStatus, messagesSort]);
  useEffect(() => { setMediaPage(1); }, [debouncedMediaQ, mediaStatus, mediaSort]);
  useEffect(() => { setOrdersPage(1); }, [debouncedOrdersQ, ordersStatus]);

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
    { key: "orders" as Tab, label: "Encomendas", icon: ShoppingCart, badge: 0 },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10" style={{ background: "#020617" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-10 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">EVN CMS</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Portal Administrativo · {new Date().toLocaleDateString("pt-PT", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Desktop: email pill */}
          {session?.user?.email && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                <span className="text-orange-400 text-xs font-bold uppercase">{session.user.email.charAt(0)}</span>
              </div>
              <span className="text-slate-400 text-sm">{session.user.email}</span>
            </div>
          )}
          {/* Mobile: avatar only */}
          {session?.user?.email && (
            <div className="sm:hidden w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
              <span className="text-orange-400 text-xs font-bold uppercase">{session.user.email.charAt(0)}</span>
            </div>
          )}
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-orange-400 hover:border-orange-500/30 transition-colors text-sm font-medium">
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Ver Portal</span>
          </a>
          <button onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-slate-400 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>

      {/* Tab Nav — mobile: select; desktop: button row */}
      <div className="sm:hidden mb-4">
        <select
          value={tab}
          onChange={(e) => setTab(e.target.value as Tab)}
          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border-2 border-white/10 focus:border-orange-500 outline-none text-slate-100 text-sm font-medium cursor-pointer"
          style={{ background: "rgba(8,8,12,0.9)" }}
        >
          {TABS.map(({ key, label }) => (
            <option key={key} value={key} style={{ background: "#020617" }}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden sm:flex gap-2 mb-8 flex-wrap">
        {TABS.map(({ key, label, icon: Icon, badge }) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={tab === key
              ? { background: "#f97316", color: "#fff", boxShadow: "0 0 20px rgba(249,115,22,0.35)" }
              : { background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }}
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
          <div className="flex items-center justify-between p-4 sm:p-6 flex-wrap gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
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
            {(newsQ !== "" || newsStatus !== "" || newsSort !== "newest") && (
              <button
                type="button"
                onClick={() => { setNewsQ(""); setNewsStatus(""); setNewsSort("newest"); setNewsPage(1); }}
                className="px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-orange-400 border border-white/10 hover:border-orange-500/30 transition-colors whitespace-nowrap"
              >
                Limpar filtros
              </button>
            )}
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
                    <div
                      className="flex-1 flex items-start gap-4 cursor-pointer"
                      onClick={() => setViewingArticle(n)}
                      title="Clique para ver detalhes"
                    >
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
                        <p className="font-bold text-white text-sm leading-snug line-clamp-2 break-words">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{n.shortDesc}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); openNewsEdit(n); }} className="p-2 rounded-xl text-slate-500 hover:text-orange-400 transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}><Pencil className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); deleteNews(n.id); }} className="p-2 rounded-xl text-slate-500 hover:text-red-400 transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}><Trash2 className="w-4 h-4" /></button>
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
          <div className="flex items-center justify-between p-4 sm:p-6 flex-wrap gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
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
            {(servicesQ !== "" || servicesStatus !== "" || servicesSort !== "newest") && (
              <button
                type="button"
                onClick={() => { setServicesQ(""); setServicesStatus(""); setServicesSort("newest"); setServicesPage(1); }}
                className="px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-orange-400 border border-white/10 hover:border-orange-500/30 transition-colors whitespace-nowrap"
              >
                Limpar filtros
              </button>
            )}
            {servicesLoading ? (
              <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
            ) : servicesList.length === 0 ? (
              <div className="text-center p-12 text-slate-500">
                {servicesQ || servicesStatus ? "Nenhum resultado para os filtros aplicados." : "Nenhum documento."}
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {servicesList.map((s) => (
                  <div key={s.id} className="flex items-start gap-3 py-4 hover:bg-white/[0.02] transition-colors rounded-xl px-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(59,130,246,0.1)" }}>
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm line-clamp-2 break-words leading-snug">{s.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 break-words">{s.fileSize} · {s.description}</p>
                      <div className="mt-2">
                        <PdfLink
                          type="FORMULARIO"
                          filename={s.title}
                          label="Pré-visualizar"
                          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-orange-400 border border-white/10 hover:border-orange-500/30 px-2 py-1 rounded-lg transition-colors"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
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
          <div className="flex items-center justify-between p-4 sm:p-6 flex-wrap gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
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
            {(alertsQ !== "" || alertsStatus !== "" || alertsSort !== "newest") && (
              <button
                type="button"
                onClick={() => { setAlertsQ(""); setAlertsStatus(""); setAlertsSort("newest"); setAlertsPage(1); }}
                className="px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-orange-400 border border-white/10 hover:border-orange-500/30 transition-colors whitespace-nowrap"
              >
                Limpar filtros
              </button>
            )}
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
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => setViewingAlert(a)}
                      title="Clique para ver detalhes"
                    >
                      <p className="font-bold text-white text-sm line-clamp-2 break-words">{a.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{a.zone} · {a.date} · {a.duration}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); openAlertEdit(a); }} className="p-2 rounded-xl text-slate-500 hover:text-orange-400 transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}><Pencil className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); deleteAlert(a.id); }} className="p-2 rounded-xl text-slate-500 hover:text-red-400 transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}><Trash2 className="w-4 h-4" /></button>
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
            {(avariasQ !== "" || avariasStatus !== "" || avariasSort !== "newest") && (
              <button
                type="button"
                onClick={() => { setAvariasQ(""); setAvariasStatus(""); setAvariasSort("newest"); setAvariasPage(1); }}
                className="px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-orange-400 border border-white/10 hover:border-orange-500/30 transition-colors whitespace-nowrap"
              >
                Limpar filtros
              </button>
            )}
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
                  <div key={a.id} className="flex flex-col sm:flex-row gap-3 py-4 hover:bg-white/[0.02] transition-colors rounded-xl px-2">
                    {/* Left: type + description */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => { setViewingAvaria(a); setViewingAvariaStatus(a.status); }}
                      title="Clique para ver detalhes"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-orange-500/20 border border-orange-500/40 text-orange-400 px-2 py-0.5 rounded text-xs uppercase font-bold">
                          {a.type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-200 leading-snug break-words">
                        {a.description.length > 100 ? a.description.slice(0, 100) + "…" : a.description}
                      </p>
                      {a.reporterIp && (
                        <p className="text-xs text-slate-500 mt-1">IP: {a.reporterIp}</p>
                      )}
                    </div>
                    {/* Right: coordinates + status + delete */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      <p className="text-xs text-slate-400 font-mono">
                        {a.lat.toFixed(4)}, {a.lng.toFixed(4)}
                      </p>
                      {(a.lat !== 0 || a.lng !== 0) && (
                        <a href={`https://www.google.com/maps?q=${a.lat},${a.lng}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors">
                          <MapPin className="w-3 h-3" /> Ver no mapa
                        </a>
                      )}
                      <select
                        value={a.status}
                        onChange={(e) => updateAvariaStatus(a.id, e.target.value as AvariaReportRow["status"])}
                        className={`border-2 ${statusBorderColor(a.status)} bg-black/40 text-slate-200 text-xs font-bold rounded-lg px-2 py-1.5 outline-none transition-colors cursor-pointer`}
                      >
                        <option value="PENDING">Pendente</option>
                        <option value="IN_PROGRESS">Em Curso</option>
                        <option value="RESOLVED">Resolvido</option>
                      </select>
                      <button onClick={() => deleteAvaria(a.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-red-400 transition-colors"
                        style={{ background: "rgba(255,255,255,0.05)" }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
            {(messagesQ !== "" || messagesStatus !== "" || messagesSort !== "newest") && (
              <button
                type="button"
                onClick={() => { setMessagesQ(""); setMessagesStatus(""); setMessagesSort("newest"); setMessagesPage(1); }}
                className="px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-orange-400 border border-white/10 hover:border-orange-500/30 transition-colors whitespace-nowrap"
              >
                Limpar filtros
              </button>
            )}
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
                        <span className="font-bold text-slate-100 truncate">{msg.nome}</span>
                        <span className="text-slate-500 text-sm truncate max-w-[160px]">{msg.email}</span>
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
                      className="p-2 rounded-xl text-slate-500 hover:text-red-400 transition-colors shrink-0"
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
                {mediaQ || mediaStatus ? "Nenhum resultado." : (
                  <div className="text-center py-16 px-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <ImageIcon className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-slate-300 font-bold mb-2">Biblioteca vazia</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                      Os ficheiros carregados nas notícias e serviços aparecem aqui automaticamente.
                      Para adicionar imagens, crie ou edite uma notícia e faça upload de uma imagem.
                    </p>
                  </div>
                )}
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

      {/* ── ORDERS TAB ──────────────────────────────────────────────────────── */}
      {tab === "orders" && (
        <GlassPanel>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Encomendas</h2>
                <p className="text-slate-500 text-sm mt-0.5">{ordersTotal} orders total</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={ordersQ}
                  onChange={e => { setOrdersQ(e.target.value); setOrdersPage(1); }}
                  placeholder="Search by ref, email, name, phone..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-white/10 focus:border-orange-500 outline-none text-slate-100 text-sm"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                />
              </div>
              <select
                value={ordersStatus}
                onChange={e => { setOrdersStatus(e.target.value); setOrdersPage(1); }}
                className="px-3 py-2.5 rounded-xl border-2 border-white/10 focus:border-orange-500 outline-none text-slate-100 text-sm cursor-pointer"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
              {ordersLoading ? (
                <div className="p-8 text-center text-slate-500">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No orders found</div>
              ) : (
                orders.map(order => (
                  <div key={order.id}
                    onClick={() => setViewingOrder(order)}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-white/[0.06] hover:bg-white/[0.02] cursor-pointer transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-orange-400 font-mono font-bold text-sm">{order.orderRef}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                          order.status === 'PAID'      ? 'bg-emerald-500/20 text-emerald-400' :
                          order.status === 'PENDING'   ? 'bg-amber-500/20 text-amber-400' :
                          order.status === 'FAILED'    ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>{order.status}</span>
                      </div>
                      <p className="text-slate-100 text-sm font-medium">{order.nome}</p>
                      <p className="text-slate-500 text-xs truncate">{order.email} · {order.phone}</p>
                      <p className="text-slate-600 text-xs mt-0.5">
                        {Array.isArray(order.items) ? order.items.length : 0} meter(s) ·{' '}
                        {new Date(order.createdAt).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <span className="text-orange-400 font-black text-lg">{order.total} MZN</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {ordersTotal > 20 && (
              <Pagination page={ordersPage} total={ordersTotal} limit={20} onPageChange={setOrdersPage} />
            )}
          </div>
        </GlassPanel>
      )}

      {/* ── ORDER DETAIL MODAL ──────────────────────────────────────────────── */}
      <Modal open={!!viewingOrder} onClose={() => setViewingOrder(null)} title={viewingOrder ? `Order — ${viewingOrder.orderRef}` : "Order"}>
        {viewingOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {([
                ['Customer',    viewingOrder.nome],
                ['Email',       viewingOrder.email],
                ['Phone',       viewingOrder.phone],
                ['Total',       `${viewingOrder.total} MZN`],
                ['Status',      viewingOrder.status],
                ['Payment Ref', viewingOrder.paymentRef ?? '—'],
                ['Created',     new Date(viewingOrder.createdAt).toLocaleString('pt-PT')],
              ] as [string, string][]).map(([label, val]) => (
                <div key={label} className="space-y-1">
                  <p className="text-slate-500 text-xs uppercase tracking-wider">{label}</p>
                  <p className={`text-sm font-medium ${label === 'Status' ?
                    viewingOrder.status === 'PAID'    ? 'text-emerald-400' :
                    viewingOrder.status === 'PENDING' ? 'text-amber-400'   : 'text-red-400'
                    : 'text-slate-200'}`}>{val}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Meter Items</p>
              {Array.isArray(viewingOrder.items) && viewingOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] mb-2">
                  <span className="text-slate-300 font-mono text-sm">⚡ {item.meterNumber}</span>
                  <span className="text-orange-400 font-bold">{item.amount} MZN</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-slate-500 text-xs uppercase tracking-wider">Update Status</p>
              <div className="flex gap-2 flex-wrap">
                {(['PENDING','PROCESSING','PAID','FAILED','CANCELLED'] as const).map(s => (
                  <button key={s} type="button"
                    onClick={async () => {
                      await fetch(`/api/admin/orders/${viewingOrder.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: s })
                      });
                      setViewingOrder(prev => prev ? { ...prev, status: s } : null);
                      fetchOrders();
                      toast.success(`Status updated to ${s}`);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                      viewingOrder.status === s
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'border-white/10 text-slate-400 hover:border-orange-500/50'
                    }`}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── ARTICLE DETAIL MODAL ────────────────────────────────────────────── */}
      <Modal
        open={!!viewingArticle}
        onClose={() => setViewingArticle(null)}
        title="Detalhes do Artigo"
      >
        {viewingArticle && (
          <div className="space-y-5">
            {viewingArticle.imgUrl && (
              <div className="rounded-xl overflow-hidden max-h-56">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={viewingArticle.imgUrl} alt={viewingArticle.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 font-bold uppercase text-xs tracking-widest">
                {viewingArticle.tag}
              </span>
              {viewingArticle.status === "PUBLISHED" && <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase">Publicado</span>}
              {viewingArticle.status === "DRAFT" && <span className="px-2 py-0.5 rounded bg-slate-500/20 text-slate-400 text-xs font-bold uppercase">Rascunho</span>}
              {viewingArticle.status === "SCHEDULED" && <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-bold uppercase">Agendado</span>}
              {viewingArticle.status === "ARCHIVED" && <span className="px-2 py-0.5 rounded bg-zinc-500/20 text-zinc-500 text-xs font-bold uppercase">Arquivado</span>}
              {viewingArticle.publishAt && (
                <span className="text-slate-500 text-xs">· {new Date(viewingArticle.publishAt).toLocaleString("pt-PT")}</span>
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-100 leading-tight">{viewingArticle.title}</h2>
            <p className="text-slate-400 text-base leading-relaxed border-l-4 border-orange-500/40 pl-4 italic">{viewingArticle.shortDesc}</p>
            <div
              className="prose-evn pt-2 border-t border-white/10"
              dangerouslySetInnerHTML={{ __html: viewingArticle.fullText || "<p>Sem conteúdo.</p>" }}
            />
            <div className="flex gap-3 pt-4 border-t border-white/10 justify-between">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-500 hover:text-orange-400 transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                Ver no Portal
              </a>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setViewingArticle(null); openNewsEdit(viewingArticle); }}
                  className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setViewingArticle(null)}
                  className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 text-sm transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── ALERT DETAIL MODAL ──────────────────────────────────────────────── */}
      <Modal
        open={!!viewingAlert}
        onClose={() => setViewingAlert(null)}
        title="Detalhes do Alerta"
      >
        {viewingAlert && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full font-bold uppercase text-xs tracking-widest ${
                viewingAlert.type === "URGENT"    ? "bg-red-500/20 text-red-400 border border-red-500/40" :
                viewingAlert.type === "SCHEDULED" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" :
                                                    "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              }`}>
                {viewingAlert.type === "URGENT" ? "Urgente" : viewingAlert.type === "SCHEDULED" ? "Agendado" : "Resolvido"}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded ${viewingAlert.active ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-500"}`}>
                {viewingAlert.active ? "Activo" : "Inactivo"}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-100">{viewingAlert.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Zona Afectada</p>
                <p className="text-slate-200 font-semibold">{viewingAlert.zone}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Data</p>
                <p className="text-slate-200 font-semibold">{viewingAlert.date}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Duração Estimada</p>
                <p className="text-slate-200 font-semibold">{viewingAlert.duration}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Descrição Completa</p>
              <p className="text-slate-300 leading-relaxed bg-white/[0.02] border border-white/10 rounded-xl p-4 whitespace-pre-wrap">
                {viewingAlert.description}
              </p>
            </div>
            <div className="flex gap-3 pt-4 border-t border-white/10 justify-end">
              <button
                type="button"
                onClick={() => { setViewingAlert(null); openAlertEdit(viewingAlert); }}
                className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </button>
              <button
                type="button"
                onClick={() => setViewingAlert(null)}
                className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 text-sm transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── AVARIA DETAIL MODAL ─────────────────────────────────────────────── */}
      <Modal
        open={!!viewingAvaria}
        onClose={() => setViewingAvaria(null)}
        title="Relatório de Avaria"
      >
        {viewingAvaria && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 font-bold uppercase text-xs tracking-widest border border-orange-500/30">
                {viewingAvaria.type}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                viewingAvaria.status === "PENDING"     ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                viewingAvaria.status === "IN_PROGRESS" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                                                         "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}>
                {viewingAvaria.status === "PENDING" ? "Pendente" : viewingAvaria.status === "IN_PROGRESS" ? "Em Curso" : "Resolvido"}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Descrição da Ocorrência</p>
              <p className="text-slate-300 leading-relaxed bg-white/[0.02] border border-white/10 rounded-xl p-4 whitespace-pre-wrap">
                {viewingAvaria.description}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Coordenadas GPS</p>
                {(viewingAvaria.lat !== 0 || viewingAvaria.lng !== 0) ? (
                  <a
                    href={`https://www.google.com/maps?q=${viewingAvaria.lat},${viewingAvaria.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:text-orange-300 font-mono text-sm flex items-center gap-1.5"
                  >
                    <MapPin className="w-4 h-4 shrink-0" />
                    {viewingAvaria.lat.toFixed(6)}, {viewingAvaria.lng.toFixed(6)}
                  </a>
                ) : (
                  <span className="text-slate-600 text-sm">GPS não capturado</span>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">IP do Reportante</p>
                <p className="text-slate-400 font-mono text-sm">{viewingAvaria.reporterIp ?? "Desconhecido"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Data do Relatório</p>
                <p className="text-slate-200 font-semibold">{new Date(viewingAvaria.createdAt).toLocaleString("pt-PT")}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Actualizar Estado</p>
              <div className="flex gap-2 flex-wrap">
                {(["PENDING", "IN_PROGRESS", "RESOLVED"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setViewingAvariaStatus(s)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                      viewingAvariaStatus === s
                        ? s === "PENDING"     ? "border-red-500 bg-red-500/15 text-red-300"
                        : s === "IN_PROGRESS" ? "border-amber-500 bg-amber-500/15 text-amber-300"
                        :                      "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                        : "border-white/10 text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    {s === "PENDING" ? "Pendente" : s === "IN_PROGRESS" ? "Em Curso" : "Resolvido"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-white/10 justify-end">
              <button
                type="button"
                onClick={async () => {
                  if (viewingAvariaStatus !== viewingAvaria.status) {
                    await updateAvariaStatus(viewingAvaria.id, viewingAvariaStatus);
                    setViewingAvaria(prev => prev ? { ...prev, status: viewingAvariaStatus } : null);
                  }
                  setViewingAvaria(null);
                }}
                className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors"
              >
                {viewingAvariaStatus !== viewingAvaria.status ? "Guardar e Fechar" : "Fechar"}
              </button>
            </div>
          </div>
        )}
      </Modal>

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
            <RichTextEditor
              value={newsForm.fullText}
              onChange={(html) => { setNewsForm(prev => ({ ...prev, fullText: html })); if (newsErrors.fullText) setNewsErrors(prev => ({ ...prev, fullText: "" })); }}
              placeholder="Escreva o conteúdo do artigo…"
              error={!!newsErrors.fullText}
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
                  <div className="prose-evn" dangerouslySetInnerHTML={{ __html: newsForm.fullText || "<p>Sem conteúdo.</p>" }} />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CMSDashboard />
    </Suspense>
  );
}
