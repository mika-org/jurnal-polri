import React from "react";
import { prisma } from "@/lib/prisma";
import ArticleForm from "../ArticleForm";

export const dynamic = "force-dynamic";

export default async function TambahBeritaPage() {
  const categories = await prisma.kategori.findMany({
    where: { deleted_at: null },
    orderBy: { urutan: "asc" },
    select: { id: true, nama: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white">
          Tulis Naskah Berita Baru
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          Lengkapi naskah, pilih kategori liputan, dan tetapkan penempatan artikel
        </p>
      </div>

      <ArticleForm categories={categories} />
    </div>
  );
}
