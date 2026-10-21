"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSuperAdminUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface SimpanEdisiKoranPayload {
  id?: string;
  judul: string;
  nomor_edisi?: string;
  data_layout: string;
}

export async function simpanEdisiKoran(payload: SimpanEdisiKoranPayload) {
  const user = await getCurrentUser();
  if (!user || !isSuperAdminUser(user)) {
    throw new Error("Hanya Super Admin yang berwenang membuat dan menyimpan edisi koran");
  }

  const { id, judul, nomor_edisi, data_layout } = payload;
  if (!judul.trim()) {
    throw new Error("Judul edisi koran wajib diisi");
  }

  let edisi;
  if (id) {
    edisi = await prisma.edisiKoran.update({
      where: { id },
      data: {
        judul,
        nomor_edisi: nomor_edisi || null,
        data_layout,
        updated_at: new Date(),
      },
    });
  } else {
    edisi = await prisma.edisiKoran.create({
      data: {
        judul,
        nomor_edisi: nomor_edisi || null,
        data_layout,
      },
    });
  }

  revalidatePath("/admin/koran");
  return { success: true, edisi };
}

export async function ambilSemuaEdisiKoran() {
  return await prisma.edisiKoran.findMany({
    where: { deleted_at: null },
    orderBy: { created_at: "desc" },
  });
}

export async function hapusEdisiKoran(id: string) {
  const user = await getCurrentUser();
  if (!user || !isSuperAdminUser(user)) {
    throw new Error("Hanya Super Admin yang berwenang menghapus edisi koran");
  }

  await prisma.edisiKoran.delete({
    where: { id },
  });

  revalidatePath("/admin/koran");
  return { success: true };
}
