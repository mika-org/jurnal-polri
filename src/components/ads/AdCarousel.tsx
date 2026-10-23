"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdItem {
  id?: string;
  judul?: string;
  gambar?: string;
  tautan?: string | null;
}

interface AdCarouselProps {
  ads: AdItem[];
  posisi?: "SIDEBAR" | "HOME_STRIP" | "ARTICLE_TOP" | "FOOTER";
  className?: string;
  autoSlideInterval?: number;
}

export default function AdCarousel({
  ads,
  posisi = "SIDEBAR",
  className,
  autoSlideInterval = 5000,
}: AdCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const validAds = ads.length > 0 ? ads : [
    {
      id: "fallback",
      judul: "Toko Bunga Sejahtera - Karangan Bunga & Papan Ucapan",
      gambar: "/images/ads/iklan-bunga.jpeg",
      tautan: "https://wa.me/6281234567890",
    },
  ];

  const total = validAds.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const timer = setInterval(nextSlide, autoSlideInterval);
    return () => clearInterval(timer);
  }, [total, isPaused, nextSlide, autoSlideInterval]);

  const current = validAds[currentIndex];

  const aspectClass =
    posisi === "SIDEBAR"
      ? "w-full aspect-[16/9] sm:aspect-[2/1] lg:aspect-[16/10]"
      : posisi === "HOME_STRIP"
      ? "w-full aspect-[21/9] sm:aspect-[3/1] lg:aspect-[16/7]"
      : posisi === "ARTICLE_TOP"
      ? "w-full aspect-[16/6]"
      : "w-full aspect-[16/5]";

  const content = (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={cn(
        "relative group overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 shadow-sm transition-all duration-200 hover:shadow-md",
        aspectClass,
        className
      )}
    >
      {/* Background Slides */}
      {validAds.map((ad, idx) => (
        <div
          key={ad.id || idx}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <Image
            src={ad.gambar || "/images/ads/iklan-bunga.jpeg"}
            alt={ad.judul || "Iklan Banner"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        </div>
      ))}

      {/* Ad Tag Badge */}
      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white/90 text-[10px] font-semibold px-2 py-0.5 rounded tracking-wider flex items-center gap-1 z-20">
        <span>IKLAN</span>
        {current.tautan && <ExternalLink className="w-2.5 h-2.5 opacity-70" />}
      </div>

      {/* Title */}
      {current.judul && (
        <div className="absolute inset-x-0 bottom-0 p-3 pt-6 text-white text-xs font-medium line-clamp-1 z-20">
          {current.judul}
        </div>
      )}

      {/* Slide Navigation Arrows (only if multiple ads) */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Iklan Sebelumnya"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Iklan Berikutnya"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2 right-2.5 z-30 flex items-center gap-1">
            {validAds.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex ? "w-4 bg-amber-400" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  if (current.tautan) {
    return (
      <Link
        href={current.tautan}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Iklan: ${current.judul}`}
        className="block"
      >
        {content}
      </Link>
    );
  }

  return content;
}
