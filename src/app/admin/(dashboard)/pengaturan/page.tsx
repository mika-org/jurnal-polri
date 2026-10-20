import React from "react";
import { prisma } from "@/lib/prisma";
import PengaturanClientForm from "./PengaturanClientForm";

export const dynamic = "force-dynamic";

export default async function AdminPengaturanPage() {
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
