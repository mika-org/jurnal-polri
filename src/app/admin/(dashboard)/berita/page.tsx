import React from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSuperAdminUser, isWartawanUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import BeritaClientManager from "./BeritaClientManager";

export const dynamic = "force-dynamic";

export default async function AdminBeritaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const isAdmin = isSuperAdminUser(user);
  const isWartawan = isWartawanUser(user);

  // If Admin: view all articles.
  // If Non-admin (Pemimpin Redaksi, Editor, Reporter, Wartawan): ONLY view their own articles.
  const whereActiveClause: { deleted_at: null; penulis_id?: string } = {
    deleted_at: null,
  };
  if (!isAdmin) {
    whereActiveClause.penulis_id = user.id;
  }

  const [articles, categories, trashArticles] = await Promise.all([
    prisma.artikel.findMany({
      where: whereActiveClause,
      include: {
        kategori: {
          select: { id: true, nama: true },
        },
        penulis: {
          select: { nama_lengkap: true },
        },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.kategori.findMany({
      where: { deleted_at: null },
      select: { id: true, nama: true },
      orderBy: { urutan: "asc" },
    }),
    isAdmin
      ? prisma.artikel.findMany({
          where: {
            deleted_at: { not: null },
          },
          include: {
            kategori: {
              select: { id: true, nama: true },
            },
            penulis: {
              select: { nama_lengkap: true },
            },
          },
          orderBy: { deleted_at: "desc" },
        })
      : Promise.resolve([]),
  ]);

  return (
    <BeritaClientManager
      articles={articles}
      trashArticles={trashArticles}
      categories={categories}
      isAdmin={isAdmin}
      isWartawan={isWartawan}
      currentUserId={user.id}
    />
  );
}
