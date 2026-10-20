"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar, ArrowRight } from "lucide-react";
import { formatTanggal } from "@/lib/utils";

export interface HeroArticle {
  id: string;
  judul: string;
  slug: string;
  ringkasan: string;
  gambar_sampul: string;
  kategoriNama: string;
  diterbitkan_pada?: Date | string | null;
}

interface HeroSliderProps {
  articles: HeroArticle[];
}

export default function HeroSlider({ articles }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    if (articles.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % articles.length);
  }, [articles.length]);

  const prevSlide = () => {
    if (articles.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
  };

  useEffect(() => {
    if (articles.length <= 1) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide, articles.length]);

  if (!articles || articles.length === 0) {
    return (
      <div className="h-[340px] sm:h-[400px] rounded-xl bg-stone-200 dark:bg-stone-900 flex items-center justify-center text-stone-500">
        Belum ada berita utama yang disematkan
      </div>
    );
  }

  const current = articles[currentIndex];

  return (
    <div className="relative h-[320px] sm:h-[355px] rounded-xl overflow-hidden shadow-lg border border-stone-200 dark:border-stone-800 group">
      {/* Background Images */}
      {articles.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <Image
            src={item.gambar_sampul}
            alt={item.judul}
            fill
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
          />
          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />
        </div>
      ))}

      {/* Hero Content Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-5 sm:p-8 text-white">
        {/* Label Berita Utama */}
        <div className="flex items-center gap-2 mb-2.5">
          <span className="bg-[#E50914] text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm">
            Berita Utama
          </span>
          <span className="bg-white/20 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded">
            {current.kategoriNama}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight max-w-2xl text-white hover:text-amber-300 transition-colors line-clamp-2 sm:line-clamp-3 mb-2 drop-shadow-sm">
          <Link href={`/berita/${current.slug}`}>{current.judul}</Link>
        </h2>

        {/* Excerpt */}
        <p className="text-xs sm:text-sm text-stone-200 line-clamp-2 max-w-2xl leading-relaxed mb-4 hidden sm:block">
          {current.ringkasan}
        </p>

        {/* Meta & Button */}
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/20">
          <div className="flex items-center gap-2 text-xs text-stone-300">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{formatTanggal(current.diterbitkan_pada)}</span>
          </div>

          <Link
            href={`/berita/${current.slug}`}
            className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#B91C1C] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-md shadow-md hover:shadow transition-all"
          >
            <span>Baca Selengkapnya</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Navigation Arrows */}
      {articles.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Slide sebelumnya"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-xs text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Slide berikutnya"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-xs text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {articles.length > 1 && (
        <div className="absolute bottom-3 right-4 z-30 flex items-center gap-1.5">
          {articles.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Ke slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? "w-6 bg-[#E50914]" : "w-2 bg-white/50 hover:bg-white"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
