import { NextRequest } from "next/server";

export interface ListParams {
  q: string;
  status: string | null;
  page: number;
  limit: number;
  sort: string;
}

export function parseListParams(req: NextRequest, defaultSort = "newest"): ListParams {
  const url = new URL(req.url);
  const sp = url.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(5, parseInt(sp.get("limit") ?? "20", 10) || 20));
  return {
    q: (sp.get("q") ?? "").trim().slice(0, 200),
    status: sp.get("status"),
    page,
    limit,
    sort: sp.get("sort") ?? defaultSort,
  };
}
