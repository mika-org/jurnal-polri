"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isWartawanUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function tambahPengguna(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Tidak terautentikasi");
  if (isWartawanUser(currentUser)) throw new Error("Tidak memiliki izin");

  const nama_pengguna = (formData.get("nama_pengguna") as string).trim().toLowerCase();
  const nama_lengkap = (formData.get("nama_lengkap") as string).trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const kata_sandi = formData.get("kata_sandi") as string;
  const peran_id = formData.get("peran_id") as string;

  if (!nama_pengguna || !nama_lengkap || !kata_sandi || !peran_id) {
    throw new Error("Lengkapi semua field yang diperlukan");
  }

  const existing = await prisma.pengguna.findFirst({
    where: {
      OR: [
        { nama_pengguna },
        ...(email ? [{ email }] : []),
      ],
    },
  });

  if (existing) {
    throw new Error("Nama pengguna atau email sudah terdaftar");
  }

  const passwordHash = await bcrypt.hash(kata_sandi, 12);

  await prisma.pengguna.create({
    data: {
      nama_pengguna,
      nama_lengkap,
      email,
      kata_sandi: passwordHash,
      peran_id,
      aktif: true,
    },
  });

  revalidatePath("/admin/pengguna");
  return { success: true };
}

export async function toggleStatusPengguna(id: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Tidak terautentikasi");
  if (isWartawanUser(currentUser)) throw new Error("Tidak memiliki izin");

  const user = await prisma.pengguna.findUnique({ where: { id } });
  if (!user) throw new Error("Pengguna tidak ditemukan");

  // Prevent disabling self
  if (user.id === currentUser.id) {
    throw new Error("Tidak dapat menonaktifkan akun sendiri");
  }

  await prisma.pengguna.update({
    where: { id },
    data: { aktif: !user.aktif },
  });

  revalidatePath("/admin/pengguna");
  return { success: true };
}

export async function hapusPengguna(id: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Tidak terautentikasi");
  if (isWartawanUser(currentUser)) throw new Error("Tidak memiliki izin");

  const user = await prisma.pengguna.findUnique({ where: { id } });
  if (!user) throw new Error("Pengguna tidak ditemukan");

  if (user.id === currentUser.id) {
    throw new Error("Tidak dapat menghapus akun Anda sendiri");
  }

  // Reassign any articles to current user so foreign key constraint is maintained
  await prisma.artikel.updateMany({
    where: { penulis_id: user.id },
    data: { penulis_id: currentUser.id },
  });

  // Delete refresh tokens
  await prisma.tokenPenyegar.deleteMany({
    where: { pengguna_id: user.id },
  });

  // Delete user record
  await prisma.pengguna.delete({
    where: { id: user.id },
  });

  revalidatePath("/admin/pengguna");
  return { success: true };
}

export async function editPengguna(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Tidak terautentikasi");
  if (isWartawanUser(currentUser)) throw new Error("Tidak memiliki izin");

  const id = formData.get("id") as string;
  const nama_pengguna = (formData.get("nama_pengguna") as string).trim().toLowerCase();
  const nama_lengkap = (formData.get("nama_lengkap") as string).trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const peran_id = formData.get("peran_id") as string;

  if (!id || !nama_pengguna || !nama_lengkap || !peran_id) {
    throw new Error("Lengkapi semua field yang diperlukan");
  }

  // Check unique username or email for other users
  const existing = await prisma.pengguna.findFirst({
    where: {
      id: { not: id },
      OR: [
        { nama_pengguna },
        ...(email ? [{ email }] : []),
      ],
    },
  });

  if (existing) {
    throw new Error("Nama pengguna atau email sudah digunakan oleh akun lain");
  }

  await prisma.pengguna.update({
    where: { id },
    data: {
      nama_pengguna,
      nama_lengkap,
      email,
      peran_id,
    },
  });

  revalidatePath("/admin/pengguna");
  return { success: true };
}

export async function ubahPasswordPengguna(id: string, kata_sandi_baru: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Tidak terautentikasi");
  if (isWartawanUser(currentUser)) throw new Error("Tidak memiliki izin");

  if (!id || !kata_sandi_baru || kata_sandi_baru.length < 6) {
    throw new Error("Kata sandi baru minimal 6 karakter");
  }

  const passwordHash = await bcrypt.hash(kata_sandi_baru, 12);

  await prisma.pengguna.update({
    where: { id },
    data: { kata_sandi: passwordHash },
  });

  revalidatePath("/admin/pengguna");
  return { success: true };
}

