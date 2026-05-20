export type ModalType =
  | "NONE" | "AVARIA" | "CREDELEC" | "LOGIN" | "NEWS" | "CONTACT"
  | "CONCURSOS" | "EMPRESA" | "NOVA_LIGACAO" | "CORTES" | "CONTRATOS"
  | "PROJECTOS" | "SERVICOS" | "SEARCH" | "DASHBOARD" | "SIMULADOR";

export interface ApiNewsArticle {
  id: number;
  tag: string;
  title: string;
  shortDesc: string;
  fullText: string;
  imgUrl: string | null;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  publishAt: string | null;
}

export interface ApiServiceDoc {
  id: number;
  docId: string;
  title: string;
  fileSize: string;
  description: string;
  filePath: string;
}

export interface ApiAlert {
  id: number;
  type: "URGENT" | "SCHEDULED" | "RESOLVED";
  zone: string;
  title: string;
  date: string;
  duration: string;
  description: string;
}
