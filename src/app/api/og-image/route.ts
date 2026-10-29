import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Universal Open Graph / Social Media Preview Image Endpoint
 * Ensures all link previews (WhatsApp, Facebook, Twitter, Telegram, Discord, etc.)
 * receive an optimized, high-quality, 1200x630 JPEG image under 150KB.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const rawUrl = searchParams.get("url");

    let imageBuffer: Buffer | null = null;

    // 1. If slug is provided, fetch article cover image from database
    if (slug) {
      try {
        const article = await prisma.artikel.findUnique({
          where: { slug },
          select: { gambar_sampul: true },
        });
        if (article?.gambar_sampul) {
          imageBuffer = await loadImageBuffer(article.gambar_sampul);
        }
      } catch (err) {
        console.warn("Failed to retrieve article for OG image:", err);
      }
    }

    // 2. If rawUrl is provided and buffer not yet retrieved
    if (!imageBuffer && rawUrl) {
      imageBuffer = await loadImageBuffer(rawUrl);
    }

    // 3. Fallback to default portal logo banner
    if (!imageBuffer) {
      imageBuffer = await loadFallbackBuffer();
    }

    // 4. Format and compress to 1200x630 JPEG (~60-90KB)
    const jpegBuffer = await sharp(imageBuffer)
      .resize(1200, 630, {
        fit: "cover",
        position: "center",
      })
      .jpeg({
        quality: 82,
        progressive: true,
      })
      .toBuffer();

    return new NextResponse(jpegBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": jpegBuffer.length.toString(),
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("OG Image generation error:", error);

    // Fail-safe JPEG generation so crawler never receives 500 error
    try {
      const fallback = await sharp({
        create: {
          width: 1200,
          height: 630,
          channels: 3,
          background: { r: 124, g: 1, b: 6 }, // #7C0106 brand maroon
        },
      })
        .jpeg({ quality: 80 })
        .toBuffer();

      return new NextResponse(fallback, {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch {
      return new NextResponse("Error generating preview image", { status: 500 });
    }
  }
}

async function loadImageBuffer(src: string): Promise<Buffer | null> {
  try {
    if (src.startsWith("http://") || src.startsWith("https://")) {
      const res = await fetch(src, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; JurnalPolisiBot/1.0)",
        },
        signal: AbortSignal.timeout(4500),
      });
      if (res.ok) {
        const arr = await res.arrayBuffer();
        return Buffer.from(arr);
      }
    } else {
      // Local public file path (e.g., /uploads/... or /images/...)
      const cleanPath = src.replace(/^\/+/, "");
      const fullPath = path.join(process.cwd(), "public", cleanPath);
      return await fs.readFile(/*turbopackIgnore: true*/ fullPath);
    }
  } catch (err) {
    console.warn(`Could not load image buffer for ${src}:`, err);
  }
  return null;
}

async function loadFallbackBuffer(): Promise<Buffer> {
  const candidates = [
    path.join(process.cwd(), "public", "images", "logo-banner.png"),
    path.join(process.cwd(), "public", "images", "logo-hd.png"),
    path.join(process.cwd(), "public", "images", "logo-icon.png"),
  ];

  for (const candidate of candidates) {
    try {
      const buf = await fs.readFile(/*turbopackIgnore: true*/ candidate);
      return await sharp(buf)
        .resize(1200, 630, {
          fit: "contain",
          background: "#7C0106",
        })
        .toBuffer();
    } catch {
      // try next
    }
  }

  // Pure canvas fallback
  return await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: { r: 124, g: 1, b: 6 },
    },
  }).toBuffer();
}
