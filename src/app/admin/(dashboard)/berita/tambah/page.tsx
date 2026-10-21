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
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
          Tulis Naskah Berita Baru
        </h1>
        <p className="text-xs text-stone-600 mt-1 font-medium">
          {isAdmin
            ? "Lengkapi naskah, pilih kategori liputan, dan tetapkan status publikasi langsung"
            : "Tulis naskah liputan untuk diajukan ke Admin. Setelah disubmit, naskah akan ditinjau Admin."}
        </p>
      </div>

      <ArticleForm categories={categories} isAdmin={isAdmin} />
    </div>
  );
}
