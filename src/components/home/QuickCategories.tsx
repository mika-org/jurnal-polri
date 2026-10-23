"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { Flag, Scale, Landmark, Shield, ChevronLeft, ChevronRight, Siren, Car, Users, School } from "lucide-react";

export interface CategoryItem {
  id: string;
  nama: string;
  slug: string;
  slogan?: string | null;
  ikon?: string | null;
}

interface QuickCategoriesProps {
  categories: CategoryItem[];
}

export default function QuickCategories({ categories }: QuickCategoriesProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!categories || categories.length === 0) return null;

  const getIcon = (nama: string) => {
    const lower = nama.toLowerCase();
    if (lower.includes("politik")) {
      return <Flag className="w-8 h-8 sm:w-9 sm:h-9 text-[#8B0000] fill-[#8B0000] transition-transform duration-200" />;
    }
    if (lower.includes("hukum") || lower.includes("kriminal") || lower.includes("keadilan")) {
      return <Scale className="w-8 h-8 sm:w-9 sm:h-9 text-[#8B0000] transition-transform duration-200" />;
    }
    if (lower.includes("sosial") || lower.includes("pendidikan")) {
      return <Landmark className="w-8 h-8 sm:w-9 sm:h-9 text-[#8B0000] transition-transform duration-200" />;
    }
    if (lower.includes("sekolah") || lower.includes("edukasi")) {
      return <School className="w-8 h-8 sm:w-9 sm:h-9 text-[#8B0000] transition-transform duration-200" />;
    }
    if (lower.includes("patroli") || lower.includes("lalu")) {
      return <Car className="w-8 h-8 sm:w-9 sm:h-9 text-[#8B0000] transition-transform duration-200" />;
    }
    if (lower.includes("kamtibmas") || lower.includes("aparat")) {
      return <Siren className="w-8 h-8 sm:w-9 sm:h-9 text-[#8B0000] transition-transform duration-200" />;
    }
    if (lower.includes("masyarakat") || lower.includes("warga")) {
      return <Users className="w-8 h-8 sm:w-9 sm:h-9 text-[#8B0000] transition-transform duration-200" />;
    }
    return <Shield className="w-8 h-8 sm:w-9 sm:h-9 text-[#8B0000] transition-transform duration-200" />;
  };

  const getDefaultSlogan = (nama: string) => {
    const lower = nama.toLowerCase();
    if (lower.includes("politik")) return "Isu Strategis Bangsa";
    if (lower.includes("hukum") || lower.includes("kriminal")) return "Penegakan Hukum";
    if (lower.includes("sosial") || lower.includes("pendidikan")) return "Keamanan dan Ketertiban";
    if (lower.includes("patroli")) return "Kemitraan Kamtibmas Presisi";
    if (lower.includes("lalu")) return "Keselamatan & Kamseltibcarlantas";
    return "Kanal Informasi & Aspirasi Publik";
  };

  const renderCard = (cat: CategoryItem) => (
    <Link
      key={cat.id}
      href={`/kategori/${cat.slug}`}
      className="group relative flex flex-col items-center justify-center text-center bg-[#FBF0F0] dark:bg-[#1E0F0F] border border-[#F3DCDC] dark:border-[#381B1B] rounded-2xl py-6 px-4 hover:shadow-md hover:border-red-300 dark:hover:border-red-900/60 hover:-translate-y-0.5 transition-all duration-200 select-none w-full h-full min-h-[140px]"
    >
      <div className="mb-3 text-[#8B0000] dark:text-red-400 group-hover:scale-110 transition-transform duration-200 flex items-center justify-center">
        {getIcon(cat.nama)}
      </div>
      <h3 className="text-sm sm:text-base font-bold text-[#7A0C0C] dark:text-red-200 tracking-tight leading-snug line-clamp-1 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">
        {cat.nama}
      </h3>
      <p className="text-xs text-[#8A2B2B] dark:text-red-300/80 mt-1 font-medium line-clamp-1">
        {cat.slogan || getDefaultSlogan(cat.nama)}
      </p>
    </Link>
  );

  // If 3 or fewer items, show clean responsive grid
  if (categories.length <= 3) {
    return (
      <div className={`grid grid-cols-1 ${categories.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 md:grid-cols-3"} gap-3.5 w-full`}>
        {categories.map((cat) => renderCard(cat))}
      </div>
    );
  }

  // If more than 3 items, render responsive carousel slider (showing 3 per view on desktop)
  return (
    <div className="relative w-full group/carousel">
      <div className="overflow-hidden px-1 py-1" ref={emblaRef}>
        <div className="flex -ml-3.5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] pl-3.5 min-w-0"
            >
              {renderCard(cat)}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Slider Navigation Buttons */}
      <button
        type="button"
        onClick={scrollPrev}
        aria-label="Kategori Sebelumnya"
        className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-[#1E0F0F] border border-stone-200 dark:border-stone-700 shadow-md text-[#7A0C0C] dark:text-red-300 flex items-center justify-center hover:bg-red-50 dark:hover:bg-stone-800 transition-all z-10 opacity-80 group-hover/carousel:opacity-100 hover:scale-110 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        aria-label="Kategori Selanjutnya"
        className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-[#1E0F0F] border border-stone-200 dark:border-stone-700 shadow-md text-[#7A0C0C] dark:text-red-300 flex items-center justify-center hover:bg-red-50 dark:hover:bg-stone-800 transition-all z-10 opacity-80 group-hover/carousel:opacity-100 hover:scale-110 cursor-pointer"
      >
        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
      </button>
    </div>
  );
}
