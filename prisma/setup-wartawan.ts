import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Setting up Wartawan role and group...");

  let sgWartawan = await prisma.superGrup.findFirst({
    where: { slug: "wartawan" },
  });
  if (!sgWartawan) {
    sgWartawan = await prisma.superGrup.create({
      data: {
        nama: "Wartawan",
        slug: "wartawan",
        deskripsi: "Grup khusus wartawan peliput berita",
        adalah_sistem: false,
      },
    });
    console.log("Created SuperGrup Wartawan:", sgWartawan.id);
  }

  let roleWartawan = await prisma.peran.findFirst({
    where: { super_grup_id: sgWartawan.id, slug: "wartawan" },
  });
  if (!roleWartawan) {
    roleWartawan = await prisma.peran.create({
      data: {
        nama: "Wartawan",
        slug: "wartawan",
        super_grup_id: sgWartawan.id,
        deskripsi: "Wartawan dengan hak akses membuat dan menyunting berita sendiri",
      },
    });
    console.log("Created Peran Wartawan:", roleWartawan.id);
  }

  // Ensure permissions for wartawan
  const permCodes = ["article:create", "article:update:own", "category:read"];
  for (const code of permCodes) {
    let perm = await prisma.izin.findUnique({ where: { kode: code } });
    if (!perm) {
      perm = await prisma.izin.create({
        data: { kode: code, deskripsi: `Hak akses ${code}` },
      });
    }
    const hasPerm = await prisma.peranIzin.findUnique({
      where: {
        peran_id_izin_id: { peran_id: roleWartawan.id, izin_id: perm.id },
      },
    });
    if (!hasPerm) {
      await prisma.peranIzin.create({
        data: { peran_id: roleWartawan.id, izin_id: perm.id },
      });
    }
  }

  // Ensure wartawan user exists
  const existingUser = await prisma.pengguna.findFirst({
    where: { nama_pengguna: "wartawan" },
  });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash("wartawan123", 12);
    await prisma.pengguna.create({
      data: {
        nama_pengguna: "wartawan",
        nama_lengkap: "Wartawan Jurnal Polisi",
        email: "wartawan@jurnalpolisi.id",
        kata_sandi: passwordHash,
        aktif: true,
        peran_id: roleWartawan.id,
      },
    });
    console.log("Created user: wartawan / wartawan123");
  } else {
    await prisma.pengguna.update({
      where: { id: existingUser.id },
      data: { peran_id: roleWartawan.id },
    });
    console.log("Updated existing user wartawan with role Wartawan");
  }

  console.log("✓ Selesai konfigurasi Wartawan!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
