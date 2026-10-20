"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PenempatanIklan } from "@prisma/client";

export async function simpanIklan(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Tidak terautentikasi");

  const id = formData.get("id") as string | null;
  const judul = formData.get("judul") as string;
  const gambar = (formData.get("gambar") as string) || "/images/ads/iklan-bunga.jpeg";
  const tautan = (formData.get("tautan") as string) || null;
  const posisi = (formData.get("posisi") as PenempatanIklan) || PenempatanIklan.SIDEBAR;
  const aktif = formData.get("aktif") === "on";

  if (id) {
    await prisma.iklan.update({
      where: { id },
      data: { judul, gambar, tautan, posisi, aktif },
    });
  } else {
    await prisma.iklan.create({
      data: { judul, gambar, tautan, posisi, aktif },
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/iklan");
  return { success: true };
}

export async function toggleIklan(id: string, aktif: boolean) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Tidak terautentikasi");

  await prisma.iklan.update({
    where: { id },
    data: { aktif },
  });

  revalidatePath("/");
  revalidatePath("/admin/iklan");
  return { success: true };
}

export async function hapusIklan(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Tidak terautentikasi");

  await prisma.iklan.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin/iklan");
  return { success: true };
}
