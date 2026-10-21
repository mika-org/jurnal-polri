import React from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isWartawanUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import PengaturanClientForm from "./PengaturanClientForm";

export const dynamic = "force-dynamic";

export default async function AdminPengaturanPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (isWartawanUser(user)) redirect("/admin/berita");

  const settingsRows = await prisma.pengaturan.findMany();
  const settings = settingsRows.reduce<Record<string, string>>((acc, curr) => {
    acc[curr.kunci] = curr.nilai;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white">
          Pengaturan Portal &amp; Kontak Redaksi
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          Konfigurasi identitas media, alamat kantor redaksi, telepon, email, dan akun media sosial
        </p>
      </div>

      <PengaturanClientForm initialSettings={settings} />
    </div>
  );
}
