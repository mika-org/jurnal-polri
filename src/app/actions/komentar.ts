"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSuperAdminUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface CommentPayload {
  artikelId: string;
  isi: string;
  nama?: string | null;
  parentId?: string | null;
}

export interface KomentarItem {
  id: string;
  artikel_id: string;
  nama: string | null;
  isi: string;
  parent_id: string | null;
  created_at: Date;
  updated_at: Date;
  balasan?: KomentarItem[];
}

export async function tambahKomentar(payload: CommentPayload) {
  const { artikelId, isi, nama, parentId } = payload;

  if (!artikelId) {
    throw new Error("Artikel ID diperlukan");
  }

  const cleanIsi = (isi || "").trim();
  if (!cleanIsi) {
    throw new Error("Isi komentar tidak boleh kosong");
  }

  // Nama: jika kosong atau whitespace, otomatis "Anonim"
  const cleanNama = (nama || "").trim() || "Anonim";

  // Verifikasi artikel ada
  const artikel = await prisma.artikel.findUnique({
    where: { id: artikelId },
    select: { id: true, slug: true },
  });

  if (!artikel) {
    throw new Error("Artikel tidak ditemukan");
  }

  // Jika ada parentId, pastikan parent komentar ada
  if (parentId) {
    const parent = await prisma.komentar.findUnique({
      where: { id: parentId },
    });
    if (!parent) {
      throw new Error("Komentar yang dibalas tidak ditemukan");
    }
  }

  const komentar = await prisma.komentar.create({
    data: {
      artikel_id: artikelId,
      nama: cleanNama,
      isi: cleanIsi,
      parent_id: parentId || null,
    },
  });

  revalidatePath(`/berita/${artikel.slug}`);
  revalidatePath("/admin/berita");

  return { success: true, komentar };
}

export async function ambilKomentarArtikel(artikelId: string) {
  const comments = await prisma.komentar.findMany({
    where: {
      artikel_id: artikelId,
      deleted_at: null,
    },
    orderBy: {
      created_at: "asc",
    },
  });

  const parentComments: KomentarItem[] = [];
  const repliesMap = new Map<string, KomentarItem[]>();

  for (const c of comments) {
    if (c.parent_id) {
      const existing = repliesMap.get(c.parent_id) || [];
      existing.push(c as KomentarItem);
      repliesMap.set(c.parent_id, existing);
    } else {
      parentComments.push(c as KomentarItem);
    }
  }

  const tree: KomentarItem[] = parentComments.map((parent) => ({
    ...parent,
    balasan: repliesMap.get(parent.id) || [],
  }));

  // Induk terbaru di atas
  tree.reverse();

  return {
    comments: tree,
    total: comments.length,
  };
}

export async function hapusKomentar(id: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Tidak terautentikasi");
  }

  if (!isSuperAdminUser(user)) {
    throw new Error("Hanya Admin yang berwenang menghapus komentar");
  }

  const komentar = await prisma.komentar.findUnique({
    where: { id },
    include: { artikel: { select: { slug: true } } },
  });

  if (!komentar) {
    throw new Error("Komentar tidak ditemukan");
  }

  // Hapus komentar (cascade akan menghapus balasannya di DB)
  await prisma.komentar.delete({
    where: { id },
  });

  if (komentar.artikel?.slug) {
    revalidatePath(`/berita/${komentar.artikel.slug}`);
  }
  revalidatePath("/admin/berita");

  return { success: true };
}
