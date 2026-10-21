"use client";

import React from "react";
import Image from "next/image";
import { Award, Shield, Star } from "lucide-react";

export interface NewspaperData {
  masthead: {
    image?: string;
    title?: string;
    taglineTop?: string;
    taglineBottom?: string;
    editionBadge: string;
    website?: string;
    organization?: string;
  };
  headline: {
    greeting: string;
    name: string;
    positionPrefix: string;
    position: string;
    positionSub: string;
    image: string;
  };
  sideStories: {
    id: string;
    title: string;
    image: string;
  }[];
  bottomArticles: {
    id: string;
    title: string;
    image: string;
    content: string;
  }[];
}

interface NewspaperA4CoverProps {
  data: NewspaperData;
}

export default function NewspaperA4Cover({ data }: NewspaperA4CoverProps) {
  const { masthead, headline, sideStories, bottomArticles } = data;

  return (
    <div
      id="newspaper-a4-cover"
      className="newspaper-sheet bg-white text-black font-sans relative overflow-hidden select-none border border-stone-300 shadow-2xl mx-auto"
      style={{
        width: "210mm",
        height: "297mm",
        maxHeight: "297mm",
        boxSizing: "border-box",
        padding: "5mm",
      }}
    >
      {/* Outer Border Frame */}
      <div className="w-full h-full border-2 border-stone-900 flex flex-col justify-between overflow-hidden p-1.5 bg-white">
        {/* ========================================================= */}
        {/* 1. MASTHEAD HEADER BANNER (Image Only) */}
        {/* ========================================================= */}
        <header className="w-full shrink-0 mb-1">
          <div className="relative w-full border border-black overflow-hidden bg-white shadow-2xs">
            <Image
              src={masthead.image || "/images/header-koran-default.webp"}
              alt="Header Koran Jurnal Polisi"
              width={1500}
              height={389}
              className="w-full h-auto object-cover block"
              priority
              unoptimized
            />
          </div>

          {/* Full-width Edition Strip */}
          <div className="w-full bg-[#E65100] border-x border-b border-black py-0.5 px-3 flex items-center justify-between text-white text-xs font-serif shadow-xs">
            <span className="font-bold text-[10px] uppercase">
              LEMBAR KHUSUS PERS &amp; INFORMASI PUBLIK
            </span>
            <span className="font-black text-sm tracking-widest uppercase drop-shadow-sm">
              {masthead.editionBadge}
            </span>
            <span className="font-bold text-[10px] uppercase">
              HALAMAN 1
            </span>
          </div>
        </header>

        {/* ========================================================= */}
        {/* 2. MAIN CONTENT GRID (A4 Upper Section) */}
        {/* ========================================================= */}
        <section className="grid grid-cols-12 gap-2 my-1 flex-1 overflow-hidden">
          {/* Left Hero Story (~58% Width - Col 7) */}
          <div className="col-span-7 relative rounded border border-black overflow-hidden flex flex-col justify-end bg-stone-900 shadow-sm">
            {/* Hero Photo */}
            <div className="absolute inset-0">
              <Image
                src={headline.image || "/images/ads/iklan-bunga.jpeg"}
                alt={headline.name}
                fill
                sizes="500px"
                className="object-cover object-top"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>

            {/* Floating Top Badge */}
            <div className="absolute top-2 left-2 z-10">
              <div className="w-9 h-9 rounded-full bg-amber-400 border border-white flex items-center justify-center text-stone-900 shadow-md">
                <Shield className="w-5 h-5 fill-amber-700 text-amber-900" />
              </div>
            </div>

            {/* Bottom Caption Overlay */}
            <div className="relative z-10 p-3 text-center space-y-1">
              {/* Calligraphy Greeting */}
              <p
                className="font-serif italic text-amber-300 text-2xl font-bold tracking-wide drop-shadow-md"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {headline.greeting}
              </p>

              {/* Person Name */}
              <h2 className="font-serif font-extrabold text-sm text-white uppercase tracking-tight leading-snug drop-shadow-md">
                {headline.name}
              </h2>

              {/* Position Details with Laurel Icons */}
              <div className="pt-0.5">
                <span className="text-[9px] text-amber-200 block uppercase font-bold tracking-wider">
                  {headline.positionPrefix}
                </span>
                <div className="flex items-center justify-center gap-1.5 my-0.5">
                  <span className="text-amber-400 font-serif text-sm">❦</span>
                  <span className="font-serif font-black text-lg text-amber-300 uppercase tracking-widest drop-shadow-sm">
                    {headline.position}
                  </span>
                  <span className="text-amber-400 font-serif text-sm">❦</span>
                </div>
                <span className="text-[8px] text-stone-200 block uppercase font-semibold tracking-wide">
                  {headline.positionSub}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side Stacked 3 Photo Stories (~42% Width - Col 5) */}
          <div className="col-span-5 flex flex-col justify-between gap-1.5">
            {sideStories.slice(0, 3).map((story, idx) => (
              <div
                key={story.id || idx}
                className="flex-1 relative rounded border border-black overflow-hidden bg-stone-100 flex flex-col justify-end shadow-xs min-h-[75px]"
              >
                {/* Photo */}
                <div className="absolute inset-0">
                  <Image
                    src={story.image || "/images/ads/iklan-bunga.jpeg"}
                    alt={story.title}
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                </div>

                {/* Caption Bar with Orange Accent */}
                <div className="relative z-10 bg-[#E65100]/90 backdrop-blur-xs p-1.5 border-t border-black">
                  <p className="text-[8.5px] font-serif font-bold text-white line-clamp-2 leading-tight drop-shadow-xs">
                    {story.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. BOTTOM NEWSPAPER ARTICLES (2 Boxed Columns) */}
        {/* ========================================================= */}
        <footer className="grid grid-cols-2 gap-2 shrink-0 pt-1 border-t-2 border-black">
          {bottomArticles.slice(0, 2).map((article, idx) => (
            <div
              key={article.id || idx}
              className="border border-black rounded-xs overflow-hidden bg-[#FFF9F2] flex flex-col justify-between"
            >
              {/* Box Title with Orange Header */}
              <div className="bg-[#FA9805] border-b border-black p-1.5">
                <h3 className="font-serif font-extrabold text-[9.5px] text-stone-900 line-clamp-2 leading-tight uppercase">
                  {article.title}
                </h3>
              </div>

              {/* Newspaper Body Section with thumbnail & 2-column text */}
              <div className="p-1.5 flex gap-1.5 items-start">
                {/* Thumbnail Photo */}
                <div className="relative w-20 h-16 shrink-0 rounded-xs overflow-hidden border border-black bg-stone-200">
                  <Image
                    src={article.image || "/images/ads/iklan-bunga.jpeg"}
                    alt={article.title}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                </div>

                {/* Two Column Newspaper Text */}
                <div
                  className="flex-1 font-serif text-[7.5px] text-justify text-stone-900 leading-[1.25] line-clamp-6"
                  style={{
                    columnCount: 2,
                    columnGap: "6px",
                    columnRule: "1px dotted #ccc",
                  }}
                >
                  {article.content}
                </div>
              </div>
            </div>
          ))}
        </footer>
      </div>

      {/* High-fidelity CSS Print Styling for A4 exact dimensions */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #newspaper-a4-cover,
          #newspaper-a4-cover * {
            visibility: visible;
          }
          #newspaper-a4-cover {
            position: fixed;
            left: 0;
            top: 0;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 4mm !important;
            box-shadow: none !important;
            border: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
