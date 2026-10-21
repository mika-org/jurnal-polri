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
  if (!categories || categories.length === 0) return null;

  const getIcon = (nama: string) => {
    const lower = nama.toLowerCase();
    if (lower.includes("politik")) return <Flag className="w-5 h-5" />;
    if (lower.includes("hukum")) return <Scale className="w-5 h-5" />;
    if (lower.includes("sosial")) return <Users className="w-5 h-5" />;
    return <Shield className="w-5 h-5" />;
  };

  const getGridClass = () => {
    if (categories.length === 1) return "grid-cols-1";
    if (categories.length === 2) return "grid-cols-1 sm:grid-cols-2";
    if (categories.length === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
  };

  return (
    <div className={`grid ${getGridClass()} gap-3 w-full`}>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/kategori/${cat.slug}`}
          className="group relative overflow-hidden bg-white dark:bg-[#180C0C] border border-stone-200 dark:border-stone-800 rounded-xl p-3 sm:p-3.5 hover:border-red-200 dark:hover:border-stone-700 hover:shadow-sm transition-all duration-200 flex items-center justify-between"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center shrink-0 group-hover:bg-red-50 group-hover:text-[#B91C1C] dark:group-hover:bg-red-950/40 dark:group-hover:text-red-400 transition-colors duration-200">
              {getIcon(cat.nama)}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#990000] dark:group-hover:text-red-400 transition-colors truncate">
                {cat.nama}
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                {cat.slogan || "Kanal Berita Terkini"}
              </p>
            </div>
          </div>

          <div className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200 group-hover:bg-stone-200 dark:group-hover:bg-stone-700 transition-all transform group-hover:translate-x-0.5 shrink-0 ml-1">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      ))}
    </div>
  );
}
