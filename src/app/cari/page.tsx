import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NewsCard from "@/components/ui/NewsCard";
import { Search, ArrowLeft } from "lucide-react";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const articles = query
    ? await prisma.artikel.findMany({
        where: {
          status: "PUBLISHED",
          is_draft: false,
          deleted_at: null,
          OR: [
            { judul: { contains: query, mode: "insensitive" } },
            { ringkasan: { contains: query, mode: "insensitive" } },
            { konten: { contains: query, mode: "insensitive" } },
            {
              artikel_tag: {
                some: {
                  tag: {
                    nama: { contains: query, mode: "insensitive" },
                  },
                },
              },
            },
          ],
        },
        include: {
          kategori: true,
        },
        orderBy: { diterbitkan_pada: "desc" },
      })
    : await prisma.artikel.findMany({
        where: {
          status: "PUBLISHED",
          is_draft: false,
          deleted_at: null,
        },
        include: { kategori: true },
        orderBy: { diterbitkan_pada: "desc" },
        take: 12,
      });

  const categories = await prisma.kategori.findMany({
    where: { deleted_at: null },
    orderBy: { urutan: "asc" },
  });

  const settingsRows = await prisma.pengaturan.findMany();
  const settings = settingsRows.reduce<Record<string, string>>((acc, curr) => {
    acc[curr.kunci] = curr.nilai;
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#120808] text-stone-900 dark:text-stone-100">
      <Header categories={categories} />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 lg:px-7 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#7F0000] dark:hover:text-red-400 font-medium transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-4">
            {query ? `Hasil Pencarian: "${query}"` : "Pencarian Berita Terkini"}
          </h1>

          {/* Search bar form */}
          <form method="GET" action="/cari" className="flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Masukkan kata kunci berita, kasus, nama, atau topik..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7F0000]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#E50914] hover:bg-[#B91C1C] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Cari
            </button>
          </form>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {articles.map((item) => (
              <NewsCard
                key={item.id}
                id={item.id}
                judul={item.judul}
                slug={item.slug}
                ringkasan={item.ringkasan}
                gambar_sampul={item.gambar_sampul}
                kategoriNama={item.kategori.nama}
                kategoriSlug={item.kategori.slug}
                diterbitkan_pada={item.diterbitkan_pada}
                dilihat={item.dilihat}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500 mt-8">
            Tidak ditemukan berita yang cocok dengan kata kunci &quot;{query}&quot;.
          </div>
        )}
      </main>

      <Footer categories={categories} settings={settings} />
    </div>
  );
}
