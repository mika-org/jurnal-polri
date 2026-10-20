"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Menu, X, ChevronDown, Shield, FileText, Scale, Newspaper } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  categories?: { id: string; nama: string; slug: string }[];
}

export default function Header({ categories = [] }: HeaderProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/cari?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#7F0000] border-b border-[#6B0000] shadow-md transition-colors relative overflow-visible">
      {/* Background Decorative Swoosh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-90">
        <div className="relative w-full h-full">
          <Image
            src="/images/header-swoosh.svg"
            alt="Header decorative swoosh"
            fill
            priority
            className="object-cover object-left-top"
          />
        </div>
      </div>

      <div className="relative max-w-[1280px] mx-auto px-4 lg:px-7">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo Area */}
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-lg"
          >
            <div className="relative w-[210px] h-[52px] sm:w-[260px] sm:h-[60px]">
              <Image
                src="/images/logo.svg"
                alt="Jurnal Polisi"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
          </Link>

          {/* Desktop Nav Pill (Rounded-full, White background with Maroon text) */}
          <nav className="hidden lg:flex items-center bg-white/95 backdrop-blur-md rounded-full px-5 py-2 shadow-inner border border-white/20 gap-1 text-sm font-semibold text-stone-800">
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-full hover:bg-stone-100 hover:text-[#7F0000] transition-colors"
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
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-full hover:bg-stone-100 hover:text-[#7F0000] transition-colors cursor-pointer"
                aria-expanded={isCategoryOpen}
              >
                <span>Kategori</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {isCategoryOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/kategori/${cat.slug}`}
                        className="block px-4 py-2 text-xs font-medium text-stone-700 hover:bg-[#FBEFEF] hover:text-[#7F0000] transition-colors"
                        onClick={() => setIsCategoryOpen(false)}
                      >
                        {cat.nama}
                      </Link>
                    ))
                  ) : (
                    <>
                      <Link
                        href="/kategori/politik"
                        className="block px-4 py-2 text-xs font-medium text-stone-700 hover:bg-[#FBEFEF] hover:text-[#7F0000]"
                      >
                        Politik
                      </Link>
                      <Link
                        href="/kategori/hukum"
                        className="block px-4 py-2 text-xs font-medium text-stone-700 hover:bg-[#FBEFEF] hover:text-[#7F0000]"
                      >
                        Hukum
                      </Link>
                      <Link
                        href="/kategori/sosial"
                        className="block px-4 py-2 text-xs font-medium text-stone-700 hover:bg-[#FBEFEF] hover:text-[#7F0000]"
                      >
                        Sosial
                      </Link>
                      <Link
                        href="/kategori/patroli"
                        className="block px-4 py-2 text-xs font-medium text-stone-700 hover:bg-[#FBEFEF] hover:text-[#7F0000]"
                      >
                        Patroli
                      </Link>
                      <Link
                        href="/kategori/lalu-lintas"
                        className="block px-4 py-2 text-xs font-medium text-stone-700 hover:bg-[#FBEFEF] hover:text-[#7F0000]"
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
              className="px-3.5 py-1.5 rounded-full hover:bg-stone-100 hover:text-[#7F0000] transition-colors"
            >
              Redaksi
            </Link>
            <Link
              href="/pedoman-media-siber"
              className="px-3.5 py-1.5 rounded-full hover:bg-stone-100 hover:text-[#7F0000] transition-colors"
            >
              Pedoman Media Siber
            </Link>
            <Link
              href="/term-of-service"
              className="px-3.5 py-1.5 rounded-full hover:bg-stone-100 hover:text-[#7F0000] transition-colors"
            >
              Terms of Service
            </Link>
          </nav>

          {/* Right Action Icons (Search, Dark Mode, Mobile Hamburger) */}
          <div className="flex items-center gap-2">
            {/* Desktop Search Bar or Icon */}
            <div className="relative">
              {isSearchOpen ? (
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center bg-white/95 text-stone-900 rounded-full px-3 py-1 shadow-md w-56 sm:w-64"
                >
                  <Search className="w-4 h-4 text-stone-400 shrink-0 mr-2" />
                  <input
                    type="search"
                    placeholder="Cari berita..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full text-xs bg-transparent border-none focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="text-stone-400 hover:text-stone-600 ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Cari Berita"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <ThemeToggle />

            {/* Admin Login shortcut */}
            <Link
              href="/admin/login"
              title="Portal Redaksi / Admin"
              className="w-9 h-9 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 flex items-center justify-center transition-all duration-200"
            >
              <Shield className="w-4 h-4" />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Buka navigasi mobile"
              className="lg:hidden w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#6B0000] border-t border-[#7F0000] px-4 py-4 space-y-3 shadow-2xl animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-lg px-3 py-2 text-stone-800">
            <Search className="w-4 h-4 text-stone-400 mr-2" />
            <input
              type="search"
              placeholder="Cari berita & topik..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm bg-transparent border-none focus:outline-none"
            />
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
                <span>Terms of Service</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
