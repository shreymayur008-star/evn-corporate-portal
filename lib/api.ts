import type { NewsArticle, ServiceDocument, NetworkAlert } from "@prisma/client";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export async function fetchNews(): Promise<NewsArticle[]> {
  try {
    const res = await fetch(`${BASE}/api/news`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchServices(): Promise<ServiceDocument[]> {
  try {
    const res = await fetch(`${BASE}/api/services`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchAlerts(): Promise<NetworkAlert[]> {
  try {
    const res = await fetch(`${BASE}/api/alerts`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
