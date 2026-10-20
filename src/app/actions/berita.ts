"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { StatusArtikel } from "@prisma/client";

export async function simpanArtikel(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Tidak terautentikasi");

  const id = formData.get("id") as string | null;
  const judul = formData.get("judul") as string;
  const ringkasan = formData.get("ringkasan") as string;
  const konten = formData.get("konten") as string;
  const gambar_sampul = formData.get("gambar_sampul") as string;
  const kategori_id = formData.get("kategori_id") as string;
  const statusStr = (formData.get("status") as string) || "DRAFT";
  const is_draft = statusStr === "DRAFT";
  const adalah_utama = formData.get("adalah_utama") === "on";
  const adalah_pilihan = formData.get("adalah_pilihan") === "on";
  const tagsStr = (formData.get("tags") as string) || "";

  const slug = slugify(judul);
  const status = statusStr as StatusArtikel;

  let articleId = id;

  if (id) {
    // Update
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
        diterbitkan_pada: status === "PUBLISHED" ? new Date() : null,
      },
    });
  } else {
    // Create
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

  revalidatePath("/");
  revalidatePath("/admin/berita");
  revalidatePath(`/berita/${slug}`);

  return { success: true };
}

export async function hapusArtikel(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Tidak terautentikasi");

  await prisma.artikel.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/admin/berita");
  return { success: true };
}
