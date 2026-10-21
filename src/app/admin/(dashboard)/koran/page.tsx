import React from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSuperAdminUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import KoranClientManager from "./KoranClientManager";

export const dynamic = "force-dynamic";

export default async function AdminKoranPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  // Hanya Super Admin yang berwenang mengakses modul Cetak Koran
  if (!isSuperAdminUser(user)) {
    redirect("/admin");
  }

  const [editions, portalArticles] = await Promise.all([
    prisma.edisiKoran.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: "desc" },
    }),
    prisma.artikel.findMany({
      where: { status: "PUBLISHED", deleted_at: null },
      select: {
        id: true,
        judul: true,
        slug: true,
        gambar_sampul: true,
        ringkasan: true,
        kategori: { select: { nama: true } },
      },
      orderBy: { diterbitkan_pada: "desc" },
      take: 25,
    }),
  ]);

  return (
    <KoranClientManager
      initialEditions={editions}
      portalArticles={portalArticles}
    />
  );
}
