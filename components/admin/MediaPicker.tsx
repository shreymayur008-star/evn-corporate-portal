"use client";
import { useEffect, useState, useCallback } from "react";
import { useDebounce } from "@/components/hooks/useDebounce";
import ListToolbar from "./ListToolbar";
import Pagination from "./Pagination";
import MediaCard from "./MediaCard";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface MediaAssetRow {
  id: number; filename: string; originalName: string; url: string;
  mimeType: string; sizeBytes: number; createdAt: string;
}

interface MediaPickerProps {
  open: boolean;
  filter?: "image" | "pdf";
  onPick: (asset: MediaAssetRow) => void;
  onClose: () => void;
}

const LIMIT = 24;

export default function MediaPicker({ open, filter, onPick, onClose }: MediaPickerProps) {
  const [items, setItems] = useState<MediaAssetRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(false);
  const debouncedQ = useDebounce(q, 300);

  const load = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: debouncedQ, status: filter ?? "", sort,
        page: String(page), limit: String(LIMIT),
      });
      const res = await fetch(`/api/admin/media?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data.items);
      setTotal(data.total);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [open, debouncedQ, filter, sort, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [debouncedQ, sort]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-xl font-bold text-slate-100">
                Selecionar Ficheiro{filter === "image" ? " (apenas imagens)" : filter === "pdf" ? " (apenas PDFs)" : ""}
              </h3>
              <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              <ListToolbar
                q={q} onQChange={setQ}
                placeholder="Pesquisar…"
                sort={sort} onSortChange={setSort}
                sortOptions={[
                  { value: "newest", label: "Mais recentes" },
                  { value: "oldest", label: "Mais antigos" },
                  { value: "largest", label: "Maiores" },
                  { value: "smallest", label: "Menores" },
                ]}
              />

              {loading ? (
                <div className="text-center py-12 text-slate-500">A carregar…</div>
              ) : items.length === 0 ? (
                <div className="text-center py-12 text-slate-500">Sem ficheiros disponíveis.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {items.map((asset) => (
                    <MediaCard
                      key={asset.id}
                      asset={asset}
                      onSelect={(a) => { onPick(a); onClose(); }}
                      onCopyUrl={() => {}}
                      onDelete={() => {}}
                    />
                  ))}
                </div>
              )}

              <Pagination page={page} total={total} limit={LIMIT} onPageChange={setPage} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
