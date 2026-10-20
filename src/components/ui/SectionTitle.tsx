import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  seeAllHref?: string;
  seeAllText?: string;
  className?: string;
}

export default function SectionTitle({
  title,
  subtitle,
  seeAllHref,
  seeAllText = "Lihat Semua",
  className,
}: SectionTitleProps) {
  return (
    <div className={cn("flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3 mb-5", className)}>
      <div className="flex items-center gap-2.5">
        <span className="w-1.5 h-6 rounded-full bg-[#E50914]" />
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {seeAllHref && (
        <Link
          href={seeAllHref}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#B91C1C] hover:text-[#E50914] dark:text-red-400 dark:hover:text-red-300 group transition-colors"
        >
          <span>{seeAllText}</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}
