"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function perbaruiHalaman(slug: string, judul: string, konten: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Tidak terautentikasi");

  await prisma.halaman.update({
    where: { slug },
    data: { judul, konten },
  });

  revalidatePath(`/${slug}`);
  revalidatePath("/admin/halaman");
  return { success: true };
}
