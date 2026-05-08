export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Nenhum ficheiro recebido." }, { status: 400 });

  const allowedTypes = [
    "image/jpeg", "image/png", "image/webp",
    "application/pdf",
  ];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de ficheiro não permitido." }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Ficheiro demasiado grande (máx. 10 MB)." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, `${Date.now()}_${safeFilename}`);
  await writeFile(filePath, buffer);

  const publicPath = `/uploads/${path.basename(filePath)}`;
  return NextResponse.json({ url: publicPath });
}
