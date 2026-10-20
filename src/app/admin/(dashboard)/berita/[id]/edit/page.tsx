import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleForm from "../../ArticleForm";

interface EditBeritaPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditBeritaPage({ params }: EditBeritaPageProps) {
  const { id } = await params;

  const article = await prisma.artikel.findUnique({
    where: { id },
    include: {
      artikel_tag: {
        include: { tag: true },
      },
    },
  });

  if (!article || article.deleted_at) {
    notFound();
  }

  const categories = await prisma.kategori.findMany({
    where: { deleted_at: null },
    orderBy: { urutan: "asc" },
    select: { id: true, nama: true },
  });

  const tagList = article.artikel_tag.map((at) => at.tag.nama).join(", ");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white">
          Sunting Naskah Berita
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          Perbarui konten berita, status publikasi, atau penempatan visual
        </p>
      </div>

      <ArticleForm
        categories={categories}
        initialData={{
          id: article.id,
          judul: article.judul,
          ringkasan: article.ringkasan,
          konten: article.konten,
          gambar_sampul: article.gambar_sampul,
          kategori_id: article.kategori_id,
          status: article.status,
          adalah_utama: article.adalah_utama,
          adalah_pilihan: article.adalah_pilihan,
          tags: tagList,
        }}
      />
    </div>
  );
}
