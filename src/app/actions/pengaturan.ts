"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function perbaruiPengaturan(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Tidak terautentikasi");

  const entries = Array.from(formData.entries());

  for (const [key, value] of entries) {
    if (typeof value === "string") {
      await prisma.pengaturan.upsert({
        where: { kunci: key },
        update: { nilai: value },
        create: { kunci: key, nilai: value },
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/pengaturan");
  return { success: true };
}
