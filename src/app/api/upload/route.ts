import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

// Maximum target size: 100KB - 140KB (140 * 1024 = 143,360 bytes)
const MAX_BYTES = 140 * 1024;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const rawBuffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    let finalBuffer: Buffer = rawBuffer;
    let extension = path.extname(file.name).toLowerCase();
    const parsed = path.parse(file.name);
    const cleanBase = (parsed.name || "gambar").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);

    // Try compressing and converting to WebP using sharp
    try {
      let currentWidth = 1600;
      let currentQuality = 82;

      let compressed = await sharp(rawBuffer)
        .rotate() // Auto-rotate based on EXIF
        .resize({ width: currentWidth, withoutEnlargement: true, fit: "inside" })
        .webp({ quality: currentQuality, effort: 4 })
        .toBuffer();

      // Progressive reduction if size exceeds 140KB
      let attempts = 0;
      while (compressed.length > MAX_BYTES && attempts < 8) {
        attempts++;
        if (currentQuality > 45) {
          currentQuality -= 10;
        } else if (currentWidth > 900) {
          currentWidth = Math.round(currentWidth * 0.85);
          currentQuality = 60;
        } else {
          currentQuality = Math.max(25, currentQuality - 5);
        }

        compressed = await sharp(rawBuffer)
          .rotate()
          .resize({ width: currentWidth, withoutEnlargement: true, fit: "inside" })
          .webp({ quality: currentQuality, effort: 4 })
          .toBuffer();
      }

      finalBuffer = compressed;
      extension = ".webp";
    } catch (sharpErr) {
      console.warn("Sharp compression failed, fallback to raw buffer:", sharpErr);
      // If sharp cannot process (e.g. non-image or unsupported vector), preserve original
      extension = extension || ".png";
    }

    const filename = `${Date.now()}-${cleanBase}${extension}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, finalBuffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
      size: finalBuffer.length,
      sizeKb: Math.round(finalBuffer.length / 1024),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Gagal mengunggah dan mengompres gambar" },
      { status: 500 }
    );
  }
}
