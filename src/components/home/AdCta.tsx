"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, ArrowUpRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

export interface AdItem {
  id?: string;
  judul?: string;
  gambar?: string;
  tautan?: string | null;
}

interface AdCtaProps {
  ads: AdItem[];
}

export default function AdCta({ ads }: AdCtaProps) {
  const fallbackAds: AdItem[] = [
    {
      id: "ad-fallback-1",
      judul: "Toko Bunga Sejahtera - Karangan Bunga & Papan Ucapan",
      gambar: "/images/ads/iklan-bunga.jpeg",
      tautan: "https://wa.me/6281234567890",
    },
    {
      id: "ad-fallback-2",
      judul: "Pusat Bunga Duka Cita & Selamat Resmi Terpercaya",
      gambar: "/images/ads/iklan-bunga.jpeg",
      tautan: "https://wa.me/6281234567890",
    },
  ];

  const resolvedAds = ads && ads.length > 0 ? ads : fallbackAds;

  // We can show 2 ads per slide if total >= 2, or slide 1-by-1
  const [startIndex, setStartIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = resolvedAds.length;

  const nextSlide = useCallback(() => {
    if (total <= 2) return;
    setStartIndex((prev) => (prev + 2 >= total ? 0 : prev + 2));
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 2) return;
    setStartIndex((prev) => (prev - 2 < 0 ? Math.max(0, total - 2) : prev - 2));
  }, [total]);

  useEffect(() => {
    if (total <= 2 || isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [total, isPaused, nextSlide]);

  const currentPair = [
    resolvedAds[startIndex % total],
    resolvedAds[(startIndex + 1) % total],
  ].filter(Boolean);

  const totalPages = Math.ceil(total / 2);
  const currentPage = Math.floor(startIndex / 2);

  return (
    <section className="my-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
        {/* Maroon CTA Block (1/3) */}
        <div className="bg-[#6B0000] text-white rounded-xl p-6 flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              <span>Ruang Promosi Mitra</span>
            </div>
            <h3 className="text-lg font-bold leading-snug">
              Pasang Iklan Banner &amp; Advertorial Usaha Anda
            </h3>
            <p className="text-xs text-white/80 leading-relaxed">
              Jangkau ribuan pembaca dari kalangan aparatur, praktisi hukum, dan masyarakat luas setiap hari.
            </p>
          </div>

          <div className="pt-6 relative z-10">
            <Link
              href="https://wa.me/6281234567890?text=Halo%20Redaksi%20Jurnal%20Polisi%2C%20saya%20tertarik%20untuk%20kerjasama%20iklan"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-md border border-white/80 text-white hover:bg-white hover:text-[#6B0000] text-xs font-bold transition-all shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Hubungi Kami</span>
            </Link>
          </div>

          {/* Decorative faint glow */}
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Banner Ads Container (2/3) - Supports Auto-sliding when multiple ads */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative group"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
            {currentPair.map((ad, idx) => (
              <Link
                key={ad.id || `${startIndex}-${idx}`}
                href={ad.tautan || "https://wa.me/6281234567890"}
                target="_blank"
                rel="noopener noreferrer"
                className="group/card relative h-[180px] sm:h-full min-h-[180px] rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all block bg-stone-100 dark:bg-stone-900 animate-in fade-in duration-300"
              >
                <Image
                  src={ad.gambar || "/images/ads/iklan-bunga.jpeg"}
                  alt={ad.judul || "Iklan Mitra"}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover group-hover/card:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 z-10">
                  <span>IKLAN</span>
                  <ArrowUpRight className="w-3 h-3 opacity-70" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3.5 text-white z-10">
                  <p className="text-xs sm:text-sm font-semibold line-clamp-2 leading-snug drop-shadow-sm group-hover/card:text-amber-300 transition-colors">
                    {ad.judul}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Navigation Arrows (if total > 2) */}
          {total > 2 && (
            <>
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Iklan Sebelumnya"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Iklan Berikutnya"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dot Indicators */}
              {totalPages > 1 && (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setStartIndex(i * 2)}
                      aria-label={`Ke halaman iklan ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentPage ? "w-5 bg-[#6B0000] dark:bg-red-400" : "w-1.5 bg-stone-300 dark:bg-stone-700"
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
