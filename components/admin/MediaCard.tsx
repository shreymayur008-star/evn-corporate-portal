"use client";
import { Trash2, Copy, FileText } from "lucide-react";

interface MediaAssetRow {
  id: number; filename: string; originalName: string; url: string;
  mimeType: string; sizeBytes: number; createdAt: string;
}

interface MediaCardProps {
  asset: MediaAssetRow;
  onCopyUrl: (url: string) => void;
  onDelete: (id: number, originalName: string) => void;
  onSelect?: (asset: MediaAssetRow) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaCard({ asset, onCopyUrl, onDelete, onSelect }: MediaCardProps) {
  const isImage = asset.mimeType.startsWith("image/");
  const isPdf = asset.mimeType === "application/pdf";

  return (
    <div className="group relative rounded-xl overflow-hidden border border-white/10 bg-white/[0.02] hover:border-orange-500/40 transition-colors">
      <button
        type="button"
        onClick={() => onSelect?.(asset)}
        className="w-full block"
        disabled={!onSelect}
        style={{ cursor: onSelect ? "pointer" : "default" }}
      >
        <div className="aspect-square bg-black/40 flex items-center justify-center overflow-hidden">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset.url} alt={asset.originalName} className="w-full h-full object-cover" />
          ) : isPdf ? (
            <div className="flex flex-col items-center text-red-400 gap-2">
              <FileText className="w-12 h-12" />
              <span className="text-xs font-bold uppercase tracking-widest">PDF</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-500 gap-2">
              <FileText className="w-12 h-12" />
              <span className="text-xs">Outro</span>
            </div>
          )}
        </div>
      </button>

      <div className="p-3">
        <p className="text-sm text-slate-200 font-medium truncate" title={asset.originalName}>
          {asset.originalName}
        </p>
        <p className="text-xs text-slate-500 mt-1">{formatSize(asset.sizeBytes)}</p>
      </div>

      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onCopyUrl(asset.url); }}
          className="p-1.5 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 text-slate-300 hover:text-orange-400 hover:border-orange-500/40 transition-colors"
          aria-label="Copiar URL"
          title="Copiar URL"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(asset.id, asset.originalName); }}
          className="p-1.5 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 text-slate-300 hover:text-red-400 hover:border-red-500/40 transition-colors"
          aria-label="Eliminar"
          title="Eliminar"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
