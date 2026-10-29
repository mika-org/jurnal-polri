import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NewsCard from "@/components/ui/NewsCard";
import SectionTitle from "@/components/ui/SectionTitle";
import BannerAd from "@/components/ads/BannerAd";
import { ArrowLeft, FolderOpen } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const currentCategory = await prisma.kategori.findUnique({
    where: { slug },
  });

  if (!currentCategory || currentCategory.deleted_at) {
    return { title: "Kategori Tidak Ditemukan | Jurnal Polisi" };
  }

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/kategori/${slug}`;
  const title = `Berita Kategori ${currentCategory.nama} | Jurnal Polisi`;
  const description =
    currentCategory.slogan ||
    `Kumpulan berita seputar ${currentCategory.nama}, investigasi, penegakan hukum, dan perkembangan terkini.`;
  const ogImage = `${siteUrl}/api/og-image`;

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "Jurnal Polisi",
      locale: "id_ID",
      type: "website",
      images: [
        {
          url: ogImage,
          secureUrl: ogImage,
          width: 1200,
          height: 630,
          type: "image/jpeg",
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function KategoriDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const currentCategory = await prisma.kategori.findUnique({
    where: { slug },
  });

  if (!currentCategory || currentCategory.deleted_at) {
    notFound();
  }

  const articles = await prisma.artikel.findMany({
    where: {
      kategori_id: currentCategory.id,
      status: "PUBLISHED",
      is_draft: false,
      deleted_at: null,
    },
    include: {
      kategori: true,
    },
    orderBy: { diterbitkan_pada: "desc" },
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

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FBEFEF] dark:bg-[#1E1010] flex items-center justify-center text-[#7F0000] dark:text-red-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                Kategori: {currentCategory.nama}
              </h1>
              {currentCategory.slogan && (
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {currentCategory.slogan}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Ad Strip (Using iklan-bunga.jpeg) */}
        <BannerAd
          judul="Toko Bunga Sejahtera - Karangan Bunga & Papan Ucapan"
          gambar="/images/ads/iklan-bunga.jpeg"
          tautan="https://wa.me/6281234567890"
          posisi="ARTICLE_TOP"
          className="mb-8"
        />

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="p-12 text-center bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500">
            Belum ada artikel yang diterbitkan dalam kategori ini.
          </div>
        )}
      </main>

      <Footer categories={categories} settings={settings} />
    </div>
  );
}
