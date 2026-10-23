import React from "react";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSuperAdminUser } from "@/lib/auth";
import ArticleForm from "../../ArticleForm";

interface EditBeritaPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditBeritaPage({ params }: EditBeritaPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const isAdmin = isSuperAdminUser(user);
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

  // Hak Akses Edit:
  // Non-admin hanya bisa edit jika naskah miliknya sendiri DAN admin telah membuka kunci edit (is_draft === true)
  if (!isAdmin) {
    if (article.penulis_id !== user.id) {
      redirect("/admin/berita");
    }
    // Jika is_draft === false, berarti naskah terkunci dan menunggu admin
    if (!article.is_draft) {
      redirect("/admin/berita");
    }
  }

  const categories = await prisma.kategori.findMany({
    where: { deleted_at: null },
    orderBy: { urutan: "asc" },
    select: { id: true, nama: true },
  });

  const tagList = article.artikel_tag.map((at) => at.tag.nama).join(", ");

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
          Sunting Naskah Berita
        </h1>
        <p className="text-xs text-stone-600 mt-1 font-medium">
          {isAdmin
            ? "Perbarui konten berita, status publikasi, atau tinjau komentar pembaca di panel samping"
            : "Sunting naskah liputan revisi Anda dan ajukan kembali ke Admin"}
        </p>
      </div>

      <ArticleForm
        categories={categories}
        isAdmin={isAdmin}
        initialData={{
          id: article.id,
          judul: article.judul,
          slug: article.slug,
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
