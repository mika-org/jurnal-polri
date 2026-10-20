import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { PlusCircle, Edit, Trash2, ExternalLink, Eye, Calendar, Sparkles } from "lucide-react";
import { formatTanggalWaktu } from "@/lib/utils";
import DeleteArticleButton from "./DeleteArticleButton";

export const dynamic = "force-dynamic";

export default async function AdminBeritaPage() {
  const articles = await prisma.artikel.findMany({
    where: { deleted_at: null },
    include: {
      kategori: true,
      penulis: { select: { nama_lengkap: true } },
    },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Manajemen Berita &amp; Liputan
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Kelola publikasi, status draf, headline hero slider, dan artikel pilihan
          </p>
        </div>

        <Link
          href="/admin/berita/tambah"
          className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#B91C1C] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tulis Berita Baru</span>
        </Link>
      </div>

      <div className="bg-[#180C0C] border border-[#2C1414] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1E1010] text-stone-400 uppercase tracking-wider text-[10px] border-b border-[#2C1414]">
              <tr>
                <th className="py-3 px-4">Artikel</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Status &amp; Tipe</th>
                <th className="py-3 px-4">Penulis</th>
                <th className="py-3 px-4">Dibaca</th>
                <th className="py-3 px-4">Tanggal Dibuat</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C1414] text-stone-300">
              {articles.map((art) => (
                <tr key={art.id} className="hover:bg-[#200F0F] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-10 rounded overflow-hidden bg-stone-800 shrink-0">
                        <Image
                          src={art.gambar_sampul}
                          alt={art.judul}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="max-w-xs sm:max-w-md">
                        <p className="font-semibold text-white line-clamp-2">
                          {art.judul}
                        </p>
                        <p className="text-[10px] text-stone-500 font-mono">
                          /{art.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-[#2A1212] text-red-300 px-2 py-0.5 rounded text-[10px] font-semibold border border-red-900/50">
                      {art.kategori.nama}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 space-y-1">
                    <div className="flex items-center gap-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          art.status === "PUBLISHED"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : art.status === "DRAFT"
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : "bg-stone-800 text-stone-400"
                        }`}
                      >
                        {art.status}
                      </span>
                      {art.is_draft && (
                        <span className="text-[9px] bg-stone-800 text-stone-300 px-1 py-0.2 rounded">
                          is_draft
                        </span>
                      )}
                    </div>
                    {art.adalah_utama && (
                      <span className="block text-[9px] text-amber-400 font-semibold">
                        ★ Headline Slider
                      </span>
                    )}
                    {art.adalah_pilihan && (
                      <span className="block text-[9px] text-rose-400 font-semibold">
                        ♦ Berita Pilihan
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-stone-400">
                    {art.penulis.nama_lengkap}
                  </td>
                  <td className="py-3.5 px-4 font-mono">{art.dilihat}</td>
                  <td className="py-3.5 px-4 text-stone-400">
                    {formatTanggalWaktu(art.created_at)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/berita/${art.slug}`}
                        target="_blank"
                        className="p-1.5 rounded bg-[#2A1212] text-stone-300 hover:text-white transition-colors"
                        title="Lihat Pratinjau Berita"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/admin/berita/${art.id}/edit`}
                        className="p-1.5 rounded bg-amber-950/60 text-amber-300 hover:text-amber-200 transition-colors"
                        title="Sunting Naskah"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      <DeleteArticleButton id={art.id} judul={art.judul} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
