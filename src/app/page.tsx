import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSlider from "@/components/home/HeroSlider";
import LatestList from "@/components/home/LatestList";
import QuickCategories from "@/components/home/QuickCategories";
import FeaturedGrid from "@/components/home/FeaturedGrid";
import AdCta from "@/components/home/AdCta";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch all home data concurrently with Promise.all to avoid connection bottleneck
  const [
    categories,
    headlineArticles,
    latestArticles,
    featuredArticles,
    rawQuickCategories,
    sidebarAds,
    homeStripAds,
    settingsRows,
  ] = await Promise.all([
    // 1. Fetch categories for navigation & footer
    prisma.kategori.findMany({
      where: { deleted_at: null },
      orderBy: { urutan: "asc" },
    }),

    // 2. Fetch headline articles for hero slider
    prisma.artikel.findMany({
      where: {
        status: "PUBLISHED",
        is_draft: false,
        adalah_utama: true,
        deleted_at: null,
      },
      include: { kategori: true },
      orderBy: { diterbitkan_pada: "desc" },
      take: 5,
    }),

    // 3. Fetch latest articles for sidebar list
    prisma.artikel.findMany({
      where: {
        status: "PUBLISHED",
        is_draft: false,
        deleted_at: null,
      },
      include: { kategori: true },
      orderBy: { diterbitkan_pada: "desc" },
      take: 6,
    }),

    // 4. Fetch featured articles for slider
    prisma.artikel.findMany({
      where: {
        status: "PUBLISHED",
        is_draft: false,
        adalah_pilihan: true,
        deleted_at: null,
      },
      include: { kategori: true },
      orderBy: { diterbitkan_pada: "desc" },
      take: 12,
    }),

    // 5. Fetch quick categories (No take: 3 limit so newly added/toggled categories always appear!)
    prisma.kategori.findMany({
      where: {
        tampil_di_cepat: true,
        deleted_at: null,
      },
      orderBy: { urutan: "asc" },
    }),

    // 6. Fetch top right sidebar ads (fetch all so it can auto-slide if multiple)
    prisma.iklan.findMany({
      where: {
        posisi: "SIDEBAR",
        aktif: true,
        deleted_at: null,
      },
      orderBy: { urutan: "asc" },
    }),

    // 7. Fetch bottom ads (HOME_STRIP and FOOTER for auto-sliding)
    prisma.iklan.findMany({
      where: {
        posisi: { in: ["HOME_STRIP", "FOOTER"] },
        aktif: true,
        deleted_at: null,
      },
      orderBy: { urutan: "asc" },
    }),

    // 8. Fetch portal settings
    prisma.pengaturan.findMany(),
  ]);

  // Fallback quick categories if none explicitly marked (pass all so slider can activate if > 3)
  const quickCategories =
    rawQuickCategories.length > 0 ? rawQuickCategories : categories;

  // Fallback ads if none in database
  const resolvedSidebarAds =
    sidebarAds.length > 0
      ? sidebarAds
      : [
          {
            id: "ad-sidebar-default",
            judul: "Toko Bunga Sejahtera - Karangan Bunga & Papan Ucapan",
            gambar: "/images/ads/iklan-bunga.jpeg",
            tautan: "https://wa.me/6281234567890",
          },
        ];

  const resolvedStripAds =
    homeStripAds.length > 0
      ? homeStripAds
      : [
          {
            id: "ad-fallback-1",
            judul: "Toko Bunga Sejahtera - Karangan Bunga & Papan Ucapan",
            gambar: "/images/ads/iklan-bunga.jpeg",
            tautan: "https://wa.me/6281234567890",
          },
          {
            id: "ad-fallback-2",
            judul: "Pusat Bunga Duka Cita & Selamat Resmi Terpercaya",
            gambar: "/images/ads/iklan-bunga.jpeg",
            tautan: "https://wa.me/6281234567890",
          },
        ];

  const settings = settingsRows.reduce<Record<string, string>>((acc, curr) => {
    acc[curr.kunci] = curr.nilai;
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#120808] text-stone-900 dark:text-stone-100 transition-colors">
      <Header categories={categories} />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 lg:px-7 py-6">
        {/* HERO SECTION + SIDEBAR (2/3 + 1/3) */}
        <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 lg:gap-5 items-start">
          {/* Kolom Kiri: Hero Slider + Kategori Cepat langsung di bawahnya */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <HeroSlider
              articles={headlineArticles.map((a) => ({
                id: a.id,
                judul: a.judul,
                slug: a.slug,
                ringkasan: a.ringkasan,
                gambar_sampul: a.gambar_sampul,
                kategoriNama: a.kategori.nama,
                diterbitkan_pada: a.diterbitkan_pada,
              }))}
            />

            {/* KATEGORI CEPAT (Tampil semua yang diaktifkan) */}
            <QuickCategories categories={quickCategories} />
          </div>

          {/* Kolom Kanan: Banner Iklan (Bisa Slide Otomatis jika Banyak) + Berita Terbaru */}
          <LatestList
            articles={latestArticles.map((a) => ({
              id: a.id,
              judul: a.judul,
              slug: a.slug,
              gambar_sampul: a.gambar_sampul,
              kategoriNama: a.kategori.nama,
              diterbitkan_pada: a.diterbitkan_pada,
            }))}
            ads={resolvedSidebarAds}
          />
        </section>

        {/* BERITA PILIHAN (Slide ke Kanan) */}
        <FeaturedGrid
          articles={featuredArticles.map((a) => ({
            id: a.id,
            judul: a.judul,
            slug: a.slug,
            ringkasan: a.ringkasan,
            gambar_sampul: a.gambar_sampul,
            kategoriNama: a.kategori.nama,
            kategoriSlug: a.kategori.slug,
            diterbitkan_pada: a.diterbitkan_pada,
            dilihat: a.dilihat,
          }))}
        />

        {/* CTA IKLAN (Bisa Slide Otomatis jika Banyak) */}
        <AdCta ads={resolvedStripAds} />
      </main>

      <Footer categories={categories} settings={settings} />
    </div>
  );
}
