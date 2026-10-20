import React from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import NewsCard from "@/components/ui/NewsCard";

export interface FeaturedArticle {
  id: string;
  judul: string;
  slug: string;
  ringkasan: string;
  gambar_sampul: string;
  kategoriNama: string;
  kategoriSlug: string;
  diterbitkan_pada?: Date | string | null;
  dilihat?: number;
}

interface FeaturedGridProps {
  articles: FeaturedArticle[];
}

export default function FeaturedGrid({ articles }: FeaturedGridProps) {
  return (
    <section className="my-8">
      <SectionTitle
        title="Berita Pilihan"
        subtitle="Liputan mendalam dan informasi terverifikasi redaksi"
        seeAllHref="/cari"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {articles.map((item) => (
          <NewsCard
            key={item.id}
            id={item.id}
            judul={item.judul}
            slug={item.slug}
            ringkasan={item.ringkasan}
            gambar_sampul={item.gambar_sampul}
            kategoriNama={item.kategoriNama}
            kategoriSlug={item.kategoriSlug}
            diterbitkan_pada={item.diterbitkan_pada}
            dilihat={item.dilihat}
          />
        ))}
      </div>
    </section>
  );
}
