import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BannerAd from "@/components/ads/BannerAd";
import { Scale } from "lucide-react";

export const metadata = {
  title: "Pedoman Media Siber | Jurnal Polisi",
  description: "Pedoman Pemberitaan Media Siber sesuai standar Dewan Pers Republik Indonesia.",
};

export default async function PedomanMediaSiberPage() {
  const page = await prisma.halaman.findUnique({
    where: { slug: "pedoman-media-siber" },
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

      <main className="flex-1 max-w-[1000px] w-full mx-auto px-4 lg:px-7 py-10">
        <div className="flex items-center gap-3 pb-6 mb-8 border-b border-stone-200 dark:border-stone-800">
          <div className="w-12 h-12 rounded-xl bg-[#FBEFEF] dark:bg-[#1E1010] flex items-center justify-center text-[#7F0000] dark:text-red-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100">
              {page?.judul || "Pedoman Pemberitaan Media Siber"}
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Standar dan kepatuhan kode etik jurnalistik siber sesuai Dewan Pers
            </p>
          </div>
        </div>

        <div className="w-full">
          <div
            dangerouslySetInnerHTML={{
              __html: page?.konten || "",
            }}
          />
        </div>

        <BannerAd
          judul="Toko Bunga Sejahtera - Karangan Bunga & Papan Ucapan"
          gambar="/images/ads/iklan-bunga.jpeg"
          tautan="https://wa.me/6281234567890"
          posisi="FOOTER"
          className="mt-10"
        />
      </main>

      <Footer categories={categories} settings={settings} />
    </div>
  );
}
