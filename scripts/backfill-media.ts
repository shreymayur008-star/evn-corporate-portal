// Run with: npx tsx scripts/backfill-media.ts
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "../lib/db";

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

async function main() {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  let files: string[] = [];
  try {
    files = await fs.readdir(uploadsDir);
  } catch {
    console.log("public/uploads/ does not exist — nothing to backfill.");
    return;
  }

  let inserted = 0, skipped = 0;
  for (const filename of files) {
    if (filename.startsWith(".")) continue;

    const stat = await fs.stat(path.join(uploadsDir, filename));
    if (!stat.isFile()) continue;

    const ext = path.extname(filename).toLowerCase();
    const mimeType = MIME_BY_EXT[ext] ?? "application/octet-stream";
    const url = `/uploads/${filename}`;

    const exists = await prisma.mediaAsset.findUnique({ where: { filename } });
    if (exists) { skipped++; continue; }

    await prisma.mediaAsset.create({
      data: {
        filename,
        originalName: filename,
        url,
        mimeType,
        sizeBytes: stat.size,
        uploadedBy: null,
      },
    });
    inserted++;
  }

  console.log(`Backfill complete: ${inserted} inserted, ${skipped} already indexed.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
