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
  // 1. Fetch categories
  const categories = await prisma.kategori.findMany({
    where: { deleted_at: null },
    orderBy: { urutan: "asc" },
  });

  // 2. Fetch headline articles for hero slider
  const headlineArticles = await prisma.artikel.findMany({
    where: {
      status: "PUBLISHED",
      is_draft: false,
      adalah_utama: true,
      deleted_at: null,
    },
    include: {
      kategori: true,
    },
    orderBy: { diterbitkan_pada: "desc" },
    take: 5,
  });

  // 3. Fetch latest articles for sidebar list
  const latestArticles = await prisma.artikel.findMany({
    where: {
      status: "PUBLISHED",
      is_draft: false,
      deleted_at: null,
    },
    include: {
      kategori: true,
    },
    orderBy: { diterbitkan_pada: "desc" },
    take: 6,
  });

  // 4. Fetch featured articles for grid
  const featuredArticles = await prisma.artikel.findMany({
    where: {
      status: "PUBLISHED",
      is_draft: false,
      adalah_pilihan: true,
      deleted_at: null,
    },
    include: {
      kategori: true,
    },
    orderBy: { diterbitkan_pada: "desc" },
    take: 8,
  });

  // 5. Fetch quick categories (Politik, Hukum, Sosial)
  const quickCategories = await prisma.kategori.findMany({
    where: {
      tampil_di_cepat: true,
      deleted_at: null,
    },
    orderBy: { urutan: "asc" },
    take: 3,
  });

  // 6. Fetch ads (including iklan-bunga.jpeg)
  const sidebarAd = await prisma.iklan.findFirst({
    where: {
      posisi: "SIDEBAR",
      aktif: true,
      deleted_at: null,
    },
    orderBy: { urutan: "asc" },
  });

  const homeStripAds = await prisma.iklan.findMany({
    where: {
      posisi: "HOME_STRIP",
      aktif: true,
      deleted_at: null,
    },
    orderBy: { urutan: "asc" },
    take: 3,
  });

  // Fallback ad array if less than 3
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
          {
            id: "ad-fallback-3",
            judul: "Florist Mitra Presisi - Diskon Pemesanan Kolektif",
            gambar: "/images/ads/iklan-bunga.jpeg",
            tautan: "https://wa.me/6281234567890",
          },
        ];

  // 7. Fetch settings
  const settingsRows = await prisma.pengaturan.findMany();
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

            {/* KATEGORI CEPAT (3 CARDS) */}
            <QuickCategories categories={quickCategories} />
          </div>

          {/* Kolom Kanan: Banner Iklan + Berita Terbaru */}
          <LatestList
            articles={latestArticles.map((a) => ({
              id: a.id,
              judul: a.judul,
              slug: a.slug,
              gambar_sampul: a.gambar_sampul,
              kategoriNama: a.kategori.nama,
              diterbitkan_pada: a.diterbitkan_pada,
            }))}
            ad={
              sidebarAd
                ? {
                    id: sidebarAd.id,
                    judul: sidebarAd.judul,
                    gambar: sidebarAd.gambar,
                    tautan: sidebarAd.tautan,
                  }
                : null
            }
          />
        </section>

        {/* BERITA PILIHAN (4 KOLOM) */}
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

        {/* CTA IKLAN (1/4 CTA + 3/4 IKLAN BANNER DENGAN IKLAN-BUNGA.JPEG) */}
        <AdCta ads={resolvedStripAds} />
      </main>

      <Footer categories={categories} settings={settings} />
    </div>
  );
}
