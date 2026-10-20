"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function simpanKategori(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Tidak terautentikasi");

  const id = formData.get("id") as string | null;
  const nama = formData.get("nama") as string;
  const slogan = formData.get("slogan") as string | null;
  const ikon = formData.get("ikon") as string | null;
  const tampil_di_cepat = formData.get("tampil_di_cepat") === "on";
  const slug = slugify(nama);

  if (id) {
    await prisma.kategori.update({
      where: { id },
      data: { nama, slug, slogan, ikon, tampil_di_cepat },
    });
  } else {
    await prisma.kategori.create({
      data: { nama, slug, slogan, ikon, tampil_di_cepat },
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/kategori");
  return { success: true };
}

export async function hapusKategori(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Tidak terautentikasi");

  await prisma.kategori.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin/kategori");
  return { success: true };
}
