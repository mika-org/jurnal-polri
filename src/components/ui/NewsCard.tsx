import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, Eye } from "lucide-react";
import Badge from "./Badge";
import { formatTanggal } from "@/lib/utils";

interface NewsCardProps {
  id: string;
  judul: string;
  slug: string;
  ringkasan: string;
  gambar_sampul: string;
  kategoriNama: string;
  kategoriSlug: string;
  diterbitkan_pada?: Date | string | null;
  dilihat?: number;
  priority?: boolean;
}

export default function NewsCard({
  judul,
  slug,
  ringkasan,
  gambar_sampul,
  kategoriNama,
  kategoriSlug,
  diterbitkan_pada,
  dilihat,
  priority = false,
}: NewsCardProps) {
  return (
    <article className="group flex flex-col bg-white dark:bg-[#1E1010] rounded-xl overflow-hidden border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-all duration-200">
      <Link href={`/berita/${slug}`} className="relative aspect-[16/9] w-full overflow-hidden bg-stone-100 dark:bg-stone-900 block">
        <Image
          src={gambar_sampul}
          alt={judul}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2.5 left-2.5">
          <Badge variant="solid" className="shadow-sm">
            {kategoriNama}
          </Badge>
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mb-2">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            {formatTanggal(diterbitkan_pada)}
          </span>
          {typeof dilihat === "number" && dilihat > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-stone-400" />
              {dilihat}
            </span>
          )}
        </div>

        <h3 className="text-sm lg:text-base font-semibold text-stone-900 dark:text-stone-100 group-hover:text-[#B91C1C] dark:group-hover:text-red-400 transition-colors line-clamp-3 leading-snug mb-2">
          <Link href={`/berita/${slug}`}>
            {judul}
          </Link>
        </h3>

        <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed mb-4 flex-1">
          {ringkasan}
        </p>

        <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 mt-auto">
          <Link
            href={`/berita/${slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#B91C1C] hover:text-[#E50914] dark:text-red-400 dark:hover:text-red-300 group/link transition-colors"
          >
            <span>Baca Selengkapnya</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
