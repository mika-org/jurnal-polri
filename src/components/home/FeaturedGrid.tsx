"use client";

import React, { useRef } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import NewsCard from "@/components/ui/NewsCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface FeaturedArticle {
  id: string;
  judul: string;
  slug: string;
  ringkasan: string;
  gambar_sampul: string;
  kategoriNama: string;
  kategoriSlug: string;
  diterbitkan_pada?: Date | string | null;
  dilihat?: number;
}

interface FeaturedGridProps {
  articles: FeaturedArticle[];
}

export default function FeaturedGrid({ articles }: FeaturedGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const slideRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  const slideLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  if (!articles || articles.length === 0) return null;

  return (
    <section className="my-8 relative">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex-1">
          <SectionTitle
            title="Berita Pilihan"
            subtitle="Liputan mendalam dan informasi terverifikasi redaksi"
            seeAllHref="/cari"
          />
        </div>

        {/* Slide Controls */}
        <div className="hidden sm:flex items-center gap-1.5 pb-2 shrink-0">
          <button
            onClick={slideLeft}
            aria-label="Slide Berita Pilihan ke kiri"
            className="w-8 h-8 rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-[#680000] hover:text-white hover:border-[#680000] transition-colors flex items-center justify-center shadow-xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={slideRight}
            aria-label="Slide Berita Pilihan ke kanan"
            className="w-8 h-8 rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-[#680000] hover:text-white hover:border-[#680000] transition-colors flex items-center justify-center shadow-xs cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Slider Container */}
      <div className="relative group">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-3 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {articles.map((item) => (
            <div
              key={item.id}
              className="w-[280px] sm:w-[290px] md:w-[305px] shrink-0"
              style={{ scrollSnapAlign: "start" }}
            >
              <NewsCard
                id={item.id}
                judul={item.judul}
                slug={item.slug}
                ringkasan={item.ringkasan}
                gambar_sampul={item.gambar_sampul}
                kategoriNama={item.kategoriNama}
                kategoriSlug={item.kategoriSlug}
                diterbitkan_pada={item.diterbitkan_pada}
                dilihat={item.dilihat}
              />
            </div>
          ))}
        </div>

        {/* Floating Controls for Mobile / Hover */}
        <button
          onClick={slideLeft}
          aria-label="Geser ke kiri"
          className="sm:hidden absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-xs shadow"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={slideRight}
          aria-label="Geser ke kanan"
          className="sm:hidden absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-xs shadow"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
