import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Badge from "@/components/ui/Badge";
import BannerAd from "@/components/ads/BannerAd";
import NewsCard from "@/components/ui/NewsCard";
import SocialShare from "@/components/berita/SocialShare";
import CommentSection from "@/components/berita/CommentSection";
import { ambilKomentarArtikel } from "@/app/actions/komentar";
import { Calendar, User, Eye, Share2, Tag as TagIcon, ArrowLeft } from "lucide-react";
import { formatTanggalWaktu } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.artikel.findUnique({
    where: { slug },
  });

  if (!article) return { title: "Berita Tidak Ditemukan | Jurnal Polisi" };

  return {
    title: `${article.judul} | Jurnal Polisi`,
    description: article.ringkasan,
    openGraph: {
      title: article.judul,
      description: article.ringkasan,
      images: [article.gambar_sampul],
      type: "article",
    },
  };
}

export default async function BeritaDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Find article
  const article = await prisma.artikel.findUnique({
    where: { slug },
    include: {
      kategori: true,
      penulis: {
        select: { nama_lengkap: true },
      },
      artikel_tag: {
        include: { tag: true },
      },
    },
  });

  if (!article || article.deleted_at || article.status !== "PUBLISHED") {
    notFound();
  }

  // Increment views safely without blocking if connection busy
  prisma.artikel
    .update({
      where: { id: article.id },
      data: { dilihat: { increment: 1 } },
    })
    .catch((err) => {
      console.warn("Failed to increment views:", err.message);
    });

  // Fetch related data in parallel
  const [categories, settingsRows, topAd, relatedArticles, commentsData] = await Promise.all([
    prisma.kategori.findMany({
      where: { deleted_at: null },
      orderBy: { urutan: "asc" },
    }),
    prisma.pengaturan.findMany(),
    prisma.iklan.findFirst({
      where: { posisi: "ARTICLE_TOP", aktif: true, deleted_at: null },
      orderBy: { urutan: "asc" },
    }),
    prisma.artikel.findMany({
      where: {
        kategori_id: article.kategori_id,
        id: { not: article.id },
        status: "PUBLISHED",
        is_draft: false,
        deleted_at: null,
      },
      include: { kategori: true },
      take: 4,
      orderBy: { diterbitkan_pada: "desc" },
    }),
    ambilKomentarArtikel(article.id),
  ]);

  const settings = settingsRows.reduce<Record<string, string>>((acc, curr) => {
    acc[curr.kunci] = curr.nilai;
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#120808] text-stone-900 dark:text-stone-100">
      <Header categories={categories} />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 lg:px-7 py-8">
        {/* Breadcrumb & Back */}
        <div className="mb-6 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-[#7F0000] dark:hover:text-red-400 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1.5">
            <Link href="/" className="hover:underline">Beranda</Link>
            <span>/</span>
            <Link href={`/kategori/${article.kategori.slug}`} className="hover:underline">
              {article.kategori.nama}
            </Link>
            <span>/</span>
            <span className="truncate max-w-[200px] text-stone-400">{article.judul}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          {/* Main Article Content */}
          <article className="space-y-6">
            {/* Header info */}
            <div className="space-y-3">
              <Link href={`/kategori/${article.kategori.slug}`}>
                <Badge variant="solid">{article.kategori.nama}</Badge>
              </Link>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 dark:text-stone-100 leading-tight">
                {article.judul}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 dark:text-stone-400 pt-1 border-y border-stone-100 dark:border-stone-800 py-3">
                <span className="flex items-center gap-1.5 font-medium text-stone-700 dark:text-stone-300">
                  <User className="w-4 h-4 text-[#7F0000] dark:text-red-400" />
                  <span>{article.penulis.nama_lengkap}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  <span>{formatTanggalWaktu(article.diterbitkan_pada)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-stone-400" />
                  <span>{article.dilihat + 1} Pembaca</span>
                </span>
              </div>
            </div>

            {/* Cover Image */}
            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shadow-sm border border-stone-200 dark:border-stone-800">
              <Image
                src={article.gambar_sampul}
                alt={article.judul}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover"
              />
            </div>

            {/* Top Article Ad (Using iklan-bunga.jpeg) */}
            <BannerAd
              judul={topAd?.judul || "Toko Bunga Sejahtera - Karangan Bunga & Papan Ucapan"}
              gambar={topAd?.gambar || "/images/ads/iklan-bunga.jpeg"}
              tautan={topAd?.tautan || "https://wa.me/6281234567890"}
              posisi="ARTICLE_TOP"
            />

            {/* Rich Content */}
            <div
              className="prose prose-stone dark:prose-invert max-w-none text-stone-800 dark:text-stone-200 leading-relaxed text-sm sm:text-base space-y-4"
              dangerouslySetInnerHTML={{ __html: article.konten }}
            />

            {/* Tags */}
            {article.artikel_tag.length > 0 && (
              <div className="pt-6 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-xs font-semibold text-stone-500">
                  <TagIcon className="w-3.5 h-3.5" />
                  <span>Topik Terkait:</span>
                </span>
                {article.artikel_tag.map((at) => (
                  <Link
                    key={at.tag.id}
                    href={`/cari?q=${encodeURIComponent(at.tag.nama)}`}
                    className="text-xs bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 px-2.5 py-1 rounded-full transition-colors"
                  >
                    #{at.tag.nama}
                  </Link>
                ))}
              </div>
            )}

            {/* Horizontal Social Share under Article Body */}
            <div className="pt-6 pb-2 border-t border-stone-200 dark:border-stone-800">
              <SocialShare title={article.judul} slug={article.slug} variant="horizontal" />
            </div>

            {/* Comment Section */}
            <CommentSection
              artikelId={article.id}
              initialComments={commentsData.comments}
              totalComments={commentsData.total}
            />
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-[#FBEFEF] dark:bg-[#1E1010] border border-red-100 dark:border-stone-800 rounded-xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#B91C1C]" />
                <span>Bagikan Berita</span>
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mb-4">
                Sebarkan informasi terverifikasi ini kepada rekan dan komunitas Anda melalui WhatsApp, Facebook, dan Instagram.
              </p>
              <SocialShare title={article.judul} slug={article.slug} variant="card" />
            </div>

            {/* Sidebar Ad (iklan-bunga.jpeg) */}
            <BannerAd
              judul="Pusat Karangan Bunga & Papan Ucapan"
              gambar="/images/ads/iklan-bunga.jpeg"
              tautan="https://wa.me/6281234567890"
              posisi="SIDEBAR"
            />
          </aside>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-12 pt-8 border-t border-stone-200 dark:border-stone-800">
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-[#E50914]" />
              <span>Berita Terkait Lainnya</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedArticles.map((rel) => (
                <NewsCard
                  key={rel.id}
                  id={rel.id}
                  judul={rel.judul}
                  slug={rel.slug}
                  ringkasan={rel.ringkasan}
                  gambar_sampul={rel.gambar_sampul}
                  kategoriNama={rel.kategori.nama}
                  kategoriSlug={rel.kategori.slug}
                  diterbitkan_pada={rel.diterbitkan_pada}
                  dilihat={rel.dilihat}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer categories={categories} settings={settings} />
    </div>
  );
}
