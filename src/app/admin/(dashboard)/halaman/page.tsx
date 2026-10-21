import React from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isWartawanUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import HalamanClientManager from "./HalamanClientManager";

export const dynamic = "force-dynamic";

export default async function AdminHalamanPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (isWartawanUser(user)) redirect("/admin/berita");

  const pages = await prisma.halaman.findMany({
    orderBy: { slug: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white">
          Kelola Halaman Statis &amp; Regulasi
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          Sunting naskah Susunan Redaksi, Pedoman Media Siber, dan Syarat Ketentuan Layanan (ToS)
        </p>
      </div>

      <HalamanClientManager pages={pages} />
    </div>
  );
}
