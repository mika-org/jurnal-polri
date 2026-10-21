import React from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isWartawanUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import KategoriClientManager from "./KategoriClientManager";

export const dynamic = "force-dynamic";

export default async function AdminKategoriPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (isWartawanUser(user)) redirect("/admin/berita");

  const categories = await prisma.kategori.findMany({
    where: { deleted_at: null },
    include: {
      _count: {
        select: { artikel: true },
      },
    },
    orderBy: { urutan: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white">
          Kategori &amp; Kanal Liputan
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          Kelola topik berita, slogan kanal, dan kartu navigasi cepat beranda
        </p>
      </div>

      <KategoriClientManager initialCategories={categories} />
    </div>
  );
}
