import { Download } from "lucide-react";

interface PdfLinkProps {
  type: "FATURA" | "EDITAL" | "FORMULARIO";
  filename: string;
  label?: string;
  className?: string;
}

export default function PdfLink({ type, filename, label, className }: PdfLinkProps) {
  const href = `/api/pdf?type=${type}&filename=${encodeURIComponent(filename)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className ?? "flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 hover:bg-orange-500/25 transition-colors text-sm font-medium"}
      onClick={(e) => e.stopPropagation()}
    >
      <Download className="w-4 h-4" aria-hidden="true" />
      {label ?? "Descarregar PDF"}
    </a>
  );
}
