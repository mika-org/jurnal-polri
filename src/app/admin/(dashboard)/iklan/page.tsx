import React from "react";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { PlusCircle, ExternalLink, Image as ImageIcon, Sparkles } from "lucide-react";
import { getCurrentUser, isWartawanUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import IklanClientManager from "./IklanClientManager";

export const dynamic = "force-dynamic";

export default async function AdminIklanPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (isWartawanUser(user)) redirect("/admin/berita");

  const ads = await prisma.iklan.findMany({
    where: { deleted_at: null },
    orderBy: [{ posisi: "asc" }, { urutan: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
            <span>Manajemen Banner Iklan Mitra</span>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
              iklan-bunga.jpeg Aktif
            </span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Kelola penempatan banner promosi (Sidebar, Home Strip, Atas Artikel, Footer)
          </p>
        </div>
      </div>

      <IklanClientManager initialAds={ads} />
    </div>
  );
}
