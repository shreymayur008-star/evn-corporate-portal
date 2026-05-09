"use client";
import { Search } from "lucide-react";

interface Option { value: string; label: string }

interface ListToolbarProps {
  q: string;
  onQChange: (v: string) => void;
  placeholder?: string;
  status?: string;
  onStatusChange?: (v: string) => void;
  statusOptions?: Option[];
  sort?: string;
  onSortChange?: (v: string) => void;
  sortOptions?: Option[];
}

export default function ListToolbar({
  q, onQChange, placeholder = "Pesquisar…",
  status, onStatusChange, statusOptions,
  sort, onSortChange, sortOptions,
}: ListToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={q}
          onChange={(e) => onQChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-2 bg-white/[0.04] border-2 border-white/10 focus:border-orange-500 rounded-lg outline-none text-slate-100 placeholder:text-slate-500 text-sm transition-colors"
        />
      </div>
      {statusOptions && onStatusChange && (
        <select
          value={status ?? ""}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 bg-white/[0.04] border-2 border-white/10 focus:border-orange-500 rounded-lg outline-none text-slate-100 text-sm cursor-pointer"
        >
          <option value="">Todos</option>
          {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}
      {sortOptions && onSortChange && (
        <select
          value={sort ?? "newest"}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-2 bg-white/[0.04] border-2 border-white/10 focus:border-orange-500 rounded-lg outline-none text-slate-100 text-sm cursor-pointer"
        >
          {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}
    </div>
  );
}
