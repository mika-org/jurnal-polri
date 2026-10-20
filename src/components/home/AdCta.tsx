import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, ArrowUpRight, Sparkles } from "lucide-react";

interface AdItem {
  id: string;
  judul: string;
  gambar: string;
  tautan?: string | null;
}

interface AdCtaProps {
  ads: AdItem[];
}

export default function AdCta({ ads }: AdCtaProps) {
  return (
    <section className="my-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-4">
        {/* Maroon CTA Block (1/4) */}
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

        {/* 3 Banner Ads Container (3/4) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ads.slice(0, 3).map((ad, idx) => (
            <Link
              key={ad.id || idx}
              href={ad.tautan || "https://wa.me/6281234567890"}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative h-[180px] sm:h-full min-h-[170px] rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all block bg-stone-100 dark:bg-stone-900"
            >
              <Image
                src={ad.gambar || "/images/ads/iklan-bunga.jpeg"}
                alt={ad.judul || "Iklan Mitra"}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                <span>IKLAN</span>
                <ArrowUpRight className="w-3 h-3 opacity-70" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                <p className="text-xs font-semibold line-clamp-2 leading-snug drop-shadow-sm group-hover:text-amber-300 transition-colors">
                  {ad.judul}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
