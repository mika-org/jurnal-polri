import React from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSuperAdminUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ArticleForm from "../ArticleForm";

export const dynamic = "force-dynamic";

export default async function TambahBeritaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const isAdmin = isSuperAdminUser(user);

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
          {isAdmin
            ? "Lengkapi naskah, pilih kategori liputan, dan tetapkan status publikasi langsung"
            : "Tulis naskah liputan untuk diajukan ke Admin. Setelah disubmit, naskah akan ditinjau Admin."}
        </p>
      </div>

      <ArticleForm categories={categories} isAdmin={isAdmin} />
    </div>
  );
}
