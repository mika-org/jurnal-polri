import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ChevronRight, ShieldCheck, Heart } from "lucide-react";

interface FooterProps {
  categories?: { id: string; nama: string; slug: string }[];
  settings?: Record<string, string>;
}

export default function Footer({ categories = [], settings = {} }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#6B0000] text-white pt-14 pb-8 overflow-hidden border-t-4 border-[#B91C1C]">
      {/* Background Building Silhouette */}
      <div className="absolute right-0 bottom-0 w-[450px] lg:w-[600px] h-[220px] pointer-events-none opacity-20 select-none">
        <Image
          src="/images/footer-building.svg"
          alt="Siluet Gedung Presisi"
          fill
          className="object-contain object-bottom-right"
        />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-4 lg:px-7">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Brand & About */}
          <div className="space-y-4">
            <Link href="/" className="inline-block group focus:outline-none" aria-label="Beranda Jurnal Polisi">
              <div className="relative h-[62px] sm:h-[68px] aspect-[1024/341] rounded-lg overflow-hidden shadow-md border border-white/15 group-hover:border-amber-400/50 transition-colors">
                <Image
                  src="/images/logo-banner.webp"
                  alt="Jurnal Polisi - Media Mitra Polri & TNI"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-xs text-white/80 leading-relaxed">
              {settings.tagline ||
                "Media informasi, edukasi, dan penegakan hukum independen yang menyajikan fakta berita kepolisian terkini dengan akurasi dan kredibilitas tinggi."}
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-amber-300 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Media Siber Terdaftar &amp; Taat Kode Etik Jurnalistik</span>
            </div>
          </div>

          {/* Column 2: Navigasi Utama */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-300 border-l-2 border-amber-400 pl-2">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-1.5 text-white/80 hover:text-white hover:translate-x-1 transition-all"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>Beranda Utama</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/redaksi"
                  className="flex items-center gap-1.5 text-white/80 hover:text-white hover:translate-x-1 transition-all"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>Susunan Redaksi</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/pedoman-media-siber"
                  className="flex items-center gap-1.5 text-white/80 hover:text-white hover:translate-x-1 transition-all"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pedoman Pemberitaan Media Siber</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/term-of-service"
                  className="flex items-center gap-1.5 text-white/80 hover:text-white hover:translate-x-1 transition-all"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>Syarat &amp; Ketentuan (ToS)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="flex items-center gap-1.5 text-white/80 hover:text-white hover:translate-x-1 transition-all"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>Akses Admin / Redaksi</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Kategori Utama */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-300 border-l-2 border-amber-400 pl-2">
              Kategori Liputan
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.length > 0 ? (
                categories.slice(0, 6).map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/kategori/${cat.slug}`}
                      className="flex items-center gap-1.5 text-white/80 hover:text-white hover:translate-x-1 transition-all"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                      <span>{cat.nama}</span>
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link href="/kategori/politik" className="flex items-center gap-1.5 text-white/80 hover:text-white">
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                      <span>Politik</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/kategori/hukum" className="flex items-center gap-1.5 text-white/80 hover:text-white">
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                      <span>Hukum</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/kategori/sosial" className="flex items-center gap-1.5 text-white/80 hover:text-white">
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sosial</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/kategori/patroli" className="flex items-center gap-1.5 text-white/80 hover:text-white">
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                      <span>Patroli</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Column 4: Kontak Redaksi */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-300 border-l-2 border-amber-400 pl-2">
              Kantor Redaksi
            </h4>
            <div className="space-y-3 text-xs text-white/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {settings.alamat ||
                    "Gedung Presisi Media Nusantara, Jl. Trunojoyo No. 3, Kebayoran Baru, Jakarta Selatan 12110"}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{settings.telepon || "(021) 7218000"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{settings.email || "redaksi@jurnalpolisi.id"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p>
            &copy; {currentYear} <strong>Jurnal Polisi</strong>. Hak Cipta Dilindungi Undang-Undang.
          </p>
          <p className="flex items-center gap-1 text-[11px]">
            <span>Menjaga Kemitraan Kamtibmas &amp; Keadilan Hukum</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
