"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Menu, X, ChevronDown, Newspaper, FileText, Scale, Shield } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  categories?: { id: string; nama: string; slug: string }[];
}

export default function Header({ categories = [] }: HeaderProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/cari?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#680000] border-b border-[#550000] shadow-md transition-colors relative select-none">
      {/* Background Decorative Multi-Layer Orange/White Swoosh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="relative w-full h-full">
          <Image
            src="/images/header-swoosh.svg"
            alt="Header decorative swoosh"
            fill
            priority
            className="object-cover object-left"
          />
        </div>
      </div>

      <div className="relative max-w-[1340px] mx-auto px-3 sm:px-5 lg:px-7">
        <div className="flex items-center justify-between h-20 gap-3">
          {/* Logo Area (Left: Badge, Jurnal, Media Mitra, Polisi, Motto) */}
          <Link
            href="/"
            className="relative z-10 flex items-center shrink-0 py-1 focus:outline-none"
            aria-label="Beranda Jurnal Polisi"
          >
            <div className="relative w-[270px] sm:w-[320px] lg:w-[340px] h-[64px]">
              <Image
                src="/images/logo.svg"
                alt="Jurnal Polisi - Media Mitra Polri & TNI"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
          </Link>

          {/* Desktop Nav Pill */}
          <nav className="hidden xl:flex items-center bg-white rounded-full border border-stone-200/90 px-6 py-2 shadow-xs gap-5 text-xs lg:text-[13px] font-semibold text-stone-700 shrink-0">
            <Link
              href="/"
              className="hover:text-[#7A0C0C] transition-colors"
            >
              Beranda
            </Link>

            {/* Kategori Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsCategoryOpen(true)}
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
              <button
                className="flex items-center gap-1 hover:text-[#7A0C0C] transition-colors cursor-pointer"
                aria-expanded={isCategoryOpen}
              >
                <span>Kategori</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
              </button>

              {isCategoryOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-stone-200 py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-150">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/kategori/${cat.slug}`}
                        className="block px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                        onClick={() => setIsCategoryOpen(false)}
                      >
                        {cat.nama}
                      </Link>
                    ))
                  ) : (
                    <>
                      <Link
                        href="/kategori/politik"
                        className="block px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                      >
                        Politik
                      </Link>
                      <Link
                        href="/kategori/hukum"
                        className="block px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                      >
                        Hukum
                      </Link>
                      <Link
                        href="/kategori/sosial"
                        className="block px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                      >
                        Sosial
                      </Link>
                      <Link
                        href="/kategori/patroli"
                        className="block px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                      >
                        Patroli
                      </Link>
                      <Link
                        href="/kategori/lalu-lintas"
                        className="block px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                      >
                        Lalu Lintas
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <Link
              href="/redaksi"
              className="hover:text-[#B91C1C] transition-colors"
            >
              Redaksi
            </Link>
            <Link
              href="/pedoman-media-siber"
              className="hover:text-[#B91C1C] transition-colors"
            >
              Pedoman Media Siber
            </Link>
            <Link
              href="/term-of-service"
              className="hover:text-[#B91C1C] transition-colors"
            >
              Term of Service
            </Link>
          </nav>

          {/* Desktop Search Bar (Permanent White Rounded-full Input Pill) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative bg-white rounded-full px-4 py-2 border border-stone-200/90 shadow-xs w-48 sm:w-60 lg:w-72 shrink-0"
          >
            <input
              type="search"
              placeholder="Cari berita, topik, atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs text-stone-800 placeholder-stone-400 bg-transparent border-none focus:outline-none pr-6"
            />
            <button
              type="submit"
              aria-label="Lakukan Pencarian"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-600 hover:text-stone-950 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Right Action Icons (Moon ThemeToggle + Hamburger Menu) */}
          <div className="flex items-center gap-3 shrink-0 relative z-10">
            {/* Dark Mode Moon Toggle */}
            <ThemeToggle />

            {/* Mobile Hamburger / Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Buka navigasi menu"
              className="text-white hover:text-amber-300 p-1 flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 stroke-[2.5]" />
              ) : (
                <Menu className="w-6 h-6 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="bg-[#550000] border-t border-[#6B0000] px-4 py-5 space-y-4 shadow-2xl animate-in slide-in-from-top duration-200 relative z-40">
          <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-full px-4 py-2 text-stone-800">
            <input
              type="search"
              placeholder="Cari berita, topik, atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-transparent border-none focus:outline-none"
            />
            <button type="submit" aria-label="Cari">
              <Search className="w-4 h-4 text-stone-600" />
            </button>
          </form>

          <div className="grid grid-cols-1 gap-1 text-sm font-medium text-white/90">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <Newspaper className="w-4 h-4 text-amber-300" />
              <span>Beranda</span>
            </Link>

            <div className="px-3 py-1 text-xs font-bold text-amber-300 uppercase tracking-wider">
              Kategori Berita
            </div>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-6 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              >
                • {cat.nama}
              </Link>
            ))}

            <div className="border-t border-white/10 my-2 pt-2 space-y-1">
              <Link
                href="/redaksi"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-amber-300" />
                <span>Susunan Redaksi</span>
              </Link>
              <Link
                href="/pedoman-media-siber"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Scale className="w-4 h-4 text-amber-300" />
                <span>Pedoman Media Siber</span>
              </Link>
              <Link
                href="/term-of-service"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-amber-300" />
                <span>Term of Service</span>
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-amber-300 font-semibold"
              >
                <Shield className="w-4 h-4 text-amber-300" />
                <span>Masuk Admin</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
