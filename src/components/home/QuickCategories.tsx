import React from "react";
import Link from "next/link";
import { Flag, Scale, Users, Shield, ArrowRight } from "lucide-react";

interface CategoryItem {
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
  const getIcon = (nama: string) => {
    const lower = nama.toLowerCase();
    if (lower.includes("politik")) return <Flag className="w-5 h-5 text-[#7F0000] dark:text-red-400" />;
    if (lower.includes("hukum")) return <Scale className="w-5 h-5 text-[#7F0000] dark:text-red-400" />;
    if (lower.includes("sosial")) return <Users className="w-5 h-5 text-[#7F0000] dark:text-red-400" />;
    return <Shield className="w-5 h-5 text-[#7F0000] dark:text-red-400" />;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/kategori/${cat.slug}`}
          className="group relative overflow-hidden bg-[#FBEFEF] dark:bg-[#1E1010] border border-red-100/80 dark:border-stone-800 rounded-xl p-3 sm:p-3.5 hover:shadow-md transition-all duration-200 flex items-center justify-between"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-white dark:bg-stone-800 shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#7F0000] transition-all duration-200">
              <span className="group-hover:text-white transition-colors">
                {getIcon(cat.nama)}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#B91C1C] dark:group-hover:text-red-400 transition-colors truncate">
                {cat.nama}
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                {cat.slogan || "Kanal Berita Terkini"}
              </p>
            </div>
          </div>

          <div className="w-7 h-7 rounded-full bg-white/80 dark:bg-stone-800 flex items-center justify-center text-stone-400 group-hover:text-[#7F0000] group-hover:bg-white transition-all transform group-hover:translate-x-0.5 shrink-0 ml-1">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      ))}
    </div>
  );
}
