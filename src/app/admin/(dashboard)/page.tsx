import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Newspaper,
  Layers,
  Image as ImageIcon,
  Users,
  Eye,
  PlusCircle,
  ExternalLink,
  Edit,
  Clock,
} from "lucide-react";
import { formatTanggalWaktu } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [totalArtikel, totalHeadline, totalKategori, totalIklan, totalPengguna] =
    await Promise.all([
      prisma.artikel.count({ where: { deleted_at: null } }),
      prisma.artikel.count({
        where: { adalah_utama: true, status: "PUBLISHED", deleted_at: null },
      }),
      prisma.kategori.count({ where: { deleted_at: null } }),
      prisma.iklan.count({ where: { aktif: true, deleted_at: null } }),
      prisma.pengguna.count({ where: { deleted_at: null } }),
    ]);

  const recentArticles = await prisma.artikel.findMany({
    where: { deleted_at: null },
    include: {
      kategori: true,
      penulis: { select: { nama_lengkap: true } },
    },
    orderBy: { created_at: "desc" },
    take: 6,
  });

  const stats = [
    {
      label: "Total Artikel",
      value: totalArtikel,
      desc: "Naskah liputan tersimpan",
      icon: Newspaper,
      color: "from-red-600 to-rose-700",
    },
    {
      label: "Headline Slider",
      value: totalHeadline,
      desc: "Tayang di beranda utama",
      icon: Eye,
      color: "from-amber-600 to-orange-700",
    },
    {
      label: "Kategori Berita",
      value: totalKategori,
      desc: "Kanal liputan aktif",
      icon: Layers,
      color: "from-emerald-600 to-teal-700",
    },
    {
      label: "Iklan Aktif",
      value: totalIklan,
      desc: "Termasuk iklan-bunga.jpeg",
      icon: ImageIcon,
      color: "from-blue-600 to-indigo-700",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#1E1010] border border-[#3E1A1A] p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Pusat Komando Redaksi &amp; Publikasi
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Pantau performa konten berita, statistik pembaca, dan rotasi banner promosi mitra secara realtime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/berita/tambah"
            className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#B91C1C] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tulis Berita Baru</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-[#180C0C] border border-[#2C1414] rounded-xl p-5 shadow-xs flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  {s.label}
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  {s.value}
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">{s.desc}</p>
              </div>

              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${s.color} flex items-center justify-center text-white shadow-md`}
              >
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Articles Table */}
      <div className="bg-[#180C0C] border border-[#2C1414] rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#2C1414] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Artikel Terbaru Ditambahkan
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Daftar berita terkini yang telah masuk sistem
            </p>
          </div>
          <Link
            href="/admin/berita"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300"
          >
            Kelola Semua Berita →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1E1010] text-stone-400 uppercase tracking-wider text-[10px] border-b border-[#2C1414]">
              <tr>
                <th className="py-3 px-4">Judul Artikel</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Penulis</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Dibaca</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C1414] text-stone-300">
              {recentArticles.map((art) => (
                <tr key={art.id} className="hover:bg-[#200F0F] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white max-w-xs truncate">
                    {art.judul}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-[#2A1212] text-red-300 px-2 py-0.5 rounded text-[10px] font-semibold border border-red-900/50">
                      {art.kategori.nama}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-400">
                    {art.penulis.nama_lengkap}
                  </td>
                  <td className="py-3.5 px-4">
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
                  </td>
                  <td className="py-3.5 px-4 font-mono">{art.dilihat}</td>
                  <td className="py-3.5 px-4 text-stone-400">
                    {formatTanggalWaktu(art.created_at)}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <Link
                      href={`/berita/${art.slug}`}
                      target="_blank"
                      className="inline-flex p-1 text-stone-400 hover:text-white transition-colors"
                      title="Lihat Berita"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/admin/berita/${art.id}/edit`}
                      className="inline-flex p-1 text-amber-400 hover:text-amber-300 transition-colors"
                      title="Sunting Berita"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
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
