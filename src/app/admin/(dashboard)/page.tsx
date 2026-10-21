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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-stone-200 p-6 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
            Pusat Komando Redaksi &amp; Publikasi
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Pantau performa konten berita, statistik pembaca, dan rotasi banner promosi mitra secara realtime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/berita/tambah"
            className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#B91C1C] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
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
              className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex items-center justify-between hover:border-stone-300 transition-colors"
            >
              <div>
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  {s.label}
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
                  {s.value}
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">{s.desc}</p>
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
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              Artikel Terbaru Ditambahkan
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Daftar berita terkini yang telah masuk sistem
            </p>
          </div>
          <Link
            href="/admin/berita"
            className="text-xs font-bold text-[#E50914] hover:text-[#B91C1C] transition-colors"
          >
            Kelola Semua Berita →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#7F0000] text-white uppercase tracking-wider text-[10px] font-bold border-b border-red-900">
              <tr>
                <th className="py-3 px-4 text-white font-bold tracking-wider">Judul Artikel</th>
                <th className="py-3 px-4 text-white font-bold tracking-wider">Kategori</th>
                <th className="py-3 px-4 text-white font-bold tracking-wider">Penulis</th>
                <th className="py-3 px-4 text-white font-bold tracking-wider">Status</th>
                <th className="py-3 px-4 text-white font-bold tracking-wider">Dibaca</th>
                <th className="py-3 px-4 text-white font-bold tracking-wider">Tanggal</th>
                <th className="py-3 px-4 text-right text-white font-bold tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {recentArticles.map((art) => (
                <tr key={art.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-stone-900 max-w-xs truncate">
                    {art.judul}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-red-200">
                      {art.kategori.nama}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    {art.penulis.nama_lengkap}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        art.status === "PUBLISHED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : art.status === "DRAFT"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {art.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-stone-600">{art.dilihat}</td>
                  <td className="py-3.5 px-4 text-stone-500">
                    {formatTanggalWaktu(art.created_at)}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <Link
                      href={`/berita/${art.slug}`}
                      target="_blank"
                      className="inline-flex p-1 text-stone-400 hover:text-stone-800 transition-colors"
                      title="Lihat Berita"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/admin/berita/${art.id}/edit`}
                      className="inline-flex p-1 text-amber-600 hover:text-amber-800 transition-colors"
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
