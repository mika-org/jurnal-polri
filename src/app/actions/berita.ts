"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSuperAdminUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { StatusArtikel } from "@prisma/client";

export async function simpanArtikel(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Tidak terautentikasi");

  const isAdmin = isSuperAdminUser(user);

  const id = formData.get("id") as string | null;
  const judul = formData.get("judul") as string;
  const ringkasan = formData.get("ringkasan") as string;
  const konten = formData.get("konten") as string;
  const gambar_sampul = formData.get("gambar_sampul") as string;
  const kategori_id = formData.get("kategori_id") as string;
  const tagsStr = (formData.get("tags") as string) || "";

  // Hak Akses Publish: Hanya Admin yang dapat publish. Non-admin dipaksa DRAFT
  let status: StatusArtikel = "DRAFT";
  let adalah_utama = false;
  let adalah_pilihan = false;
  let is_draft = false; // false = diajukan & terkunci untuk non-admin

  if (isAdmin) {
    const statusStr = (formData.get("status") as string) || "DRAFT";
    status = statusStr as StatusArtikel;
    adalah_utama = formData.get("adalah_utama") === "on";
    adalah_pilihan = formData.get("adalah_pilihan") === "on";
    // Admin can choose whether the article is locked or open for author edit
    is_draft = formData.get("buka_kunci_penulis") === "on";
  } else {
    // Non-admin: selalu DRAFT, tidak bisa pasang headline/pilihan
    status = "DRAFT";
    adalah_utama = false;
    adalah_pilihan = false;
    is_draft = false; // Setelah disubmit, otomatis terkunci
  }

  const slug = slugify(judul);
  let articleId = id;

  if (id) {
    // Cek naskah lama
    const existing = await prisma.artikel.findUnique({
      where: { id },
    });

    if (!existing) throw new Error("Artikel tidak ditemukan");

    // Jika non-admin: pastikan dia adalah penulisnya DAN naskah sedang dibuka kuncinya oleh admin
    if (!isAdmin) {
      if (existing.penulis_id !== user.id) {
        throw new Error("Anda hanya dapat mengedit berita buatan Anda sendiri");
      }
      // is_draft === false artinya terkunci
      if (!existing.is_draft) {
        throw new Error(
          "Naskah telah diajukan dan terkunci. Hanya Admin yang dapat membuka kunci edit."
        );
      }
    }

    await prisma.artikel.update({
      where: { id },
      data: {
        judul,
        slug,
        ringkasan,
        konten,
        gambar_sampul,
        kategori_id,
        status,
        is_draft,
        adalah_utama,
        adalah_pilihan,
        diterbitkan_pada: status === "PUBLISHED" ? existing.diterbitkan_pada || new Date() : null,
      },
    });
  } else {
    // Create new article
    const created = await prisma.artikel.create({
      data: {
        judul,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        ringkasan,
        konten,
        gambar_sampul: gambar_sampul || "/images/ads/iklan-bunga.jpeg",
        kategori_id,
        penulis_id: user.id,
        status,
        is_draft,
        adalah_utama,
        adalah_pilihan,
        diterbitkan_pada: status === "PUBLISHED" ? new Date() : null,
      },
    });
    articleId = created.id;
  }

  // Handle tags
  if (articleId && tagsStr) {
    const tagNames = tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    await prisma.artikelTag.deleteMany({ where: { artikel_id: articleId } });

    for (const name of tagNames) {
      const tagSlug = slugify(name);
      let tag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
      if (!tag) {
        tag = await prisma.tag.create({
          data: { nama: name, slug: tagSlug },
        });
      }
      await prisma.artikelTag.create({
        data: { artikel_id: articleId, tag_id: tag.id },
      });
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/berita");
  revalidatePath(`/berita/${slug}`);

  return { success: true };
}

// ── Soft Delete (Hanya Admin) ────────────────────────
export async function hapusArtikel(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Tidak terautentikasi");
  if (!isSuperAdminUser(user)) {
    throw new Error("Hanya Admin yang memiliki hak akses untuk menghapus berita");
  }

  await prisma.artikel.update({
    where: { id },
    data: { deleted_at: new Date() },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/berita");
  return { success: true };
}

// ── Pulihkan Berita dari Sampah (Hanya Admin) ─────────
export async function pulihkanArtikel(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Tidak terautentikasi");
  if (!isSuperAdminUser(user)) {
    throw new Error("Hanya Admin yang dapat memulihkan berita dari kotak sampah");
  }

  await prisma.artikel.update({
    where: { id },
    data: { deleted_at: null },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/berita");
  return { success: true };
}

// ── Hapus Permanen Berita (Hanya Admin) ───────────────
export async function hapusPermanenArtikel(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Tidak terautentikasi");
  if (!isSuperAdminUser(user)) {
    throw new Error("Hanya Admin yang dapat menghapus berita secara permanen");
  }

  await prisma.artikelTag.deleteMany({ where: { artikel_id: id } });
  await prisma.artikel.delete({ where: { id } });

  revalidatePath("/", "layout");
  revalidatePath("/admin/berita");
  return { success: true };
}

// ── Toggle Kunci Edit Naskah (Hanya Admin) ───────────
export async function toggleKunciEditArtikel(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Tidak terautentikasi");
  if (!isSuperAdminUser(user)) {
    throw new Error("Hanya Admin yang dapat membuka atau mengunci izin edit naskah");
  }

  const article = await prisma.artikel.findUnique({ where: { id } });
  if (!article) throw new Error("Artikel tidak ditemukan");

  // is_draft: true = izin edit terbuka untuk penulis
  // is_draft: false = terkunci
  const newLockStatus = !article.is_draft;

  await prisma.artikel.update({
    where: { id },
    data: { is_draft: newLockStatus },
  });

  revalidatePath("/admin/berita");
  return { success: true, isUnlocked: newLockStatus };
}
