import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface BannerAdProps {
  id?: string;
  judul?: string;
  gambar?: string;
  tautan?: string | null;
  posisi?: "SIDEBAR" | "HOME_STRIP" | "ARTICLE_TOP" | "FOOTER";
  className?: string;
}

export default function BannerAd({
  judul = "Toko Bunga Sejahtera - Karangan Bunga & Papan Ucapan",
  gambar = "/images/ads/iklan-bunga.jpeg",
  tautan = "https://wa.me/6281234567890",
  posisi = "SIDEBAR",
  className,
}: BannerAdProps) {
  const content = (
    <div
      className={cn(
        "relative group overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 shadow-sm transition-all duration-200 hover:shadow-md",
        posisi === "SIDEBAR" && "w-full aspect-[16/9] sm:aspect-[2/1] lg:aspect-[16/10]",
        posisi === "HOME_STRIP" && "w-full aspect-[21/9] sm:aspect-[3/1] lg:aspect-[16/7]",
        posisi === "ARTICLE_TOP" && "w-full aspect-[16/6] my-6",
        posisi === "FOOTER" && "w-full aspect-[16/5] my-6",
        className
      )}
    >
      <Image
        src={gambar || "/images/ads/iklan-bunga.jpeg"}
        alt={judul}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
      />
      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white/90 text-[10px] font-semibold px-2 py-0.5 rounded tracking-wider flex items-center gap-1 z-10">
        <span>IKLAN</span>
        {tautan && <ExternalLink className="w-2.5 h-2.5 opacity-70" />}
      </div>
      {judul && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-6 text-white text-xs font-medium line-clamp-1">
          {judul}
        </div>
      )}
    </div>
  );

  if (tautan) {
    return (
      <Link
        href={tautan}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Iklan: ${judul}`}
        className="block"
      >
        {content}
      </Link>
    );
  }

  return content;
}
