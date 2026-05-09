export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_MIME = [
  "image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml",
  "application/pdf",
];

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Nenhum ficheiro recebido." }, { status: 400 });

  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de ficheiro não permitido." }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Ficheiro demasiado grande (máx. 10 MB)." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${Date.now()}_${safeFilename}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  const url = `/uploads/${filename}`;

  const session = await auth();
  const uploadedBy = session?.user?.email ?? null;

  const asset = await prisma.mediaAsset.create({
    data: {
      filename,
      originalName: file.name,
      url,
      mimeType: file.type,
      sizeBytes: file.size,
      uploadedBy,
    },
  });

  return NextResponse.json({ url, asset });
}
