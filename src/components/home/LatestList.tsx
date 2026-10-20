import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import BannerAd from "@/components/ads/BannerAd";
import Badge from "@/components/ui/Badge";
import { formatTanggal } from "@/lib/utils";

export interface LatestArticle {
  id: string;
  judul: string;
  slug: string;
  gambar_sampul: string;
  kategoriNama: string;
  diterbitkan_pada?: Date | string | null;
}

interface LatestListProps {
  articles: LatestArticle[];
  ad?: {
    id?: string;
    judul?: string;
    gambar?: string;
    tautan?: string | null;
  } | null;
}

export default function LatestList({ articles, ad }: LatestListProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 h-full">
      {/* Sidebar Banner Ad (Using iklan-bunga.jpeg) */}
      <BannerAd
        judul={ad?.judul || "Toko Bunga Sejahtera - Karangan Bunga & Papan Ucapan"}
        gambar={ad?.gambar || "/images/ads/iklan-bunga.jpeg"}
        tautan={ad?.tautan || "https://wa.me/6281234567890"}
        posisi="SIDEBAR"
      />

      {/* Latest News Card Container */}
      <div className="bg-white dark:bg-[#1E1010] rounded-xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm flex flex-col flex-1">
        {/* Header Title with "Lihat Semua" */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-[#E50914]" />
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Berita Terbaru
            </h3>
          </div>
          <Link
            href="/cari"
            className="text-[11px] font-semibold text-[#B91C1C] hover:text-[#E50914] dark:text-red-400 flex items-center gap-0.5 group"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Scrollable list: Exactly 3 items visible, then scroll for the rest */}
        <div className="h-[210px] overflow-y-auto space-y-2.5 pr-1.5">
          {articles.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-2.5 pb-2.5 border-b border-stone-100 dark:border-stone-800/60 last:border-0 last:pb-0 group"
            >
              {/* Thumbnail 64x48 */}
              <Link
                href={`/berita/${item.slug}`}
                className="relative w-16 h-12 shrink-0 rounded-md overflow-hidden bg-stone-100 dark:bg-stone-800 block"
              >
                <Image
                  src={item.gambar_sampul}
                  alt={item.judul}
                  fill
                  sizes="64px"
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </Link>

              {/* Text Meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 leading-tight">
                    {item.kategoriNama}
                  </Badge>
                  <span className="text-[10px] text-stone-400 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {formatTanggal(item.diterbitkan_pada)}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100 group-hover:text-[#B91C1C] dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                  <Link href={`/berita/${item.slug}`}>
                    {item.judul}
                  </Link>
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
