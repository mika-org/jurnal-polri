"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PlusCircle,
  Search,
  X,
  Edit,
  ExternalLink,
  Flame,
  Star,
  FileCheck,
  FileClock,
  User,
  SlidersHorizontal,
  Trash2,
  RotateCcw,
  Lock,
  Unlock,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { formatTanggalWaktu } from "@/lib/utils";
import {
  hapusArtikel,
  pulihkanArtikel,
  hapusPermanenArtikel,
  toggleKunciEditArtikel,
} from "@/app/actions/berita";

export interface ArticleItem {
  id: string;
  judul: string;
  slug: string;
  gambar_sampul: string;
  status: string;
  is_draft: boolean;
  adalah_utama: boolean;
  adalah_pilihan: boolean;
  dilihat: number;
  created_at: Date | string;
  diterbitkan_pada: Date | string | null;
  deleted_at?: Date | string | null;
  penulis_id: string;
  kategori: {
    id: string;
    nama: string;
  };
  penulis: {
    nama_lengkap: string;
  };
}

interface CategoryOption {
  id: string;
  nama: string;
}

interface BeritaClientManagerProps {
  articles: ArticleItem[];
  trashArticles?: ArticleItem[];
  categories: CategoryOption[];
  isAdmin: boolean;
  isWartawan: boolean;
  currentUserId: string;
}

export default function BeritaClientManager({
  articles,
  trashArticles = [],
  categories,
  isAdmin,
  isWartawan,
  currentUserId,
}: BeritaClientManagerProps) {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "TRASH">("ACTIVE");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedHighlight, setSelectedHighlight] = useState("ALL");
  const [sortBy, setSortBy] = useState<"NEWEST" | "OLDEST" | "VIEWS">("NEWEST");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Soft Delete Handler (Hanya Admin)
  const handleSoftDelete = async (id: string, judul: string) => {
    if (!isAdmin) {
      alert("Hanya Admin yang berwenang menghapus berita");
      return;
    }
    if (confirm(`Pindahkan berita "${judul}" ke kotak sampah?`)) {
      setActionLoadingId(id);
      try {
        await hapusArtikel(id);
        window.location.reload();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Gagal memindahkan ke sampah");
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  // Restore Handler (Hanya Admin)
  const handleRestore = async (id: string, judul: string) => {
    if (!isAdmin) return;
    if (confirm(`Pulihkan berita "${judul}" kembali ke daftar aktif?`)) {
      setActionLoadingId(id);
      try {
        await pulihkanArtikel(id);
        window.location.reload();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Gagal memulihkan berita");
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  // Permanent Delete Handler (Hanya Admin)
  const handlePermanentDelete = async (id: string, judul: string) => {
    if (!isAdmin) return;
    if (
      confirm(
        `PERINGATAN: Berita "${judul}" akan dihapus permanen dari sistem dan tidak dapat dipulihkan. Lanjutkan?`
      )
    ) {
      setActionLoadingId(id);
      try {
        await hapusPermanenArtikel(id);
        window.location.reload();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Gagal menghapus permanen");
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  // Toggle Edit Lock Handler (Hanya Admin)
  const handleToggleLock = async (id: string, currentlyUnlocked: boolean) => {
    if (!isAdmin) return;
    const msg = currentlyUnlocked
      ? "Kunci kembali izin edit naskah ini untuk penulis?"
      : "Buka kunci edit naskah ini agar penulis dapat menyunting dan merevisi ulang?";

    if (confirm(msg)) {
      setActionLoadingId(id);
      try {
        await toggleKunciEditArtikel(id);
        window.location.reload();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Gagal mengubah status kunci");
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  // Filtering & Searching Logic for Active Articles
  const filteredArticles = useMemo(() => {
    return articles
      .filter((art) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = art.judul.toLowerCase().includes(q);
          const matchSlug = art.slug.toLowerCase().includes(q);
          const matchAuthor = art.penulis.nama_lengkap.toLowerCase().includes(q);
          if (!matchTitle && !matchSlug && !matchAuthor) return false;
        }

        // Category filter
        if (selectedCategory !== "ALL" && art.kategori.id !== selectedCategory) {
          return false;
        }

        // Status filter
        if (selectedStatus !== "ALL" && art.status !== selectedStatus) {
          return false;
        }

        // Highlight filter
        if (selectedHighlight === "HEADLINE" && !art.adalah_utama) return false;
        if (selectedHighlight === "PILIHAN" && !art.adalah_pilihan) return false;
        if (selectedHighlight === "DRAFT" && art.status !== "DRAFT") return false;
        if (selectedHighlight === "LOCKED" && art.is_draft) return false;
        if (selectedHighlight === "UNLOCKED" && !art.is_draft) return false;
        if (selectedHighlight === "MY_ARTICLES" && art.penulis_id !== currentUserId) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "NEWEST") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === "OLDEST") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === "VIEWS") {
          return b.dilihat - a.dilihat;
        }
        return 0;
      });
  }, [
    articles,
    searchQuery,
    selectedCategory,
    selectedStatus,
    selectedHighlight,
    sortBy,
    currentUserId,
  ]);

  const hasActiveFilter =
    searchQuery.trim() !== "" ||
    selectedCategory !== "ALL" ||
    selectedStatus !== "ALL" ||
    selectedHighlight !== "ALL" ||
    sortBy !== "NEWEST";

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedStatus("ALL");
    setSelectedHighlight("ALL");
    setSortBy("NEWEST");
  };

  // Quick stats
  const totalPublished = useMemo(
    () => articles.filter((a) => a.status === "PUBLISHED").length,
    [articles]
  );
  const totalDraft = useMemo(
    () => articles.filter((a) => a.status === "DRAFT").length,
    [articles]
  );
  const totalHeadline = useMemo(
    () => articles.filter((a) => a.adalah_utama).length,
    [articles]
  );

  return (
    <div className="space-y-5">
      {/* Top Header & New Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <span>Manajemen Berita &amp; Liputan</span>
            {isWartawan && (
              <span className="text-[10px] bg-amber-950 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-800">
                Akses Wartawan
              </span>
            )}
            {isAdmin && (
              <span className="text-[10px] bg-red-950 text-red-300 font-bold px-2 py-0.5 rounded border border-red-800">
                Super Admin
              </span>
            )}
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            {isAdmin
              ? "Kelola semua naskah berita portal, verifikasi pengajuan, kotak sampah, dan hak penerbitan."
              : "Daftar naskah liputan yang Anda tulis sendiri. Naskah yang diajukan akan ditinjau Admin sebelum tayang."}
          </p>
        </div>

        <Link
          href="/admin/berita/tambah"
          className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#B91C1C] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tulis Berita Baru</span>
        </Link>
      </div>

      {/* Tabs: Berita Aktif vs Kotak Sampah */}
      <div className="flex items-center gap-2 border-b border-[#2C1414] pb-2">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "ACTIVE"
              ? "bg-[#2A1212] text-white border border-[#4A1E1E]"
              : "text-stone-400 hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Berita Aktif</span>
          <span className="bg-[#180C0C] px-1.5 py-0.2 rounded text-[10px] font-mono text-stone-300 border border-[#2C1414]">
            {articles.length}
          </span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab("TRASH")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "TRASH"
                ? "bg-red-950/60 text-red-200 border border-red-800"
                : "text-stone-400 hover:text-red-300"
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Kotak Sampah</span>
            {trashArticles.length > 0 && (
              <span className="bg-red-900/60 text-red-200 px-1.5 py-0.2 rounded text-[10px] font-mono">
                {trashArticles.length}
              </span>
            )}
          </button>
        )}
      </div>

      {activeTab === "ACTIVE" ? (
        <>
          {/* Quick Summary Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#180C0C] border border-[#2C1414] rounded-xl p-3 flex items-center justify-between">
              <span className="text-stone-400">Total Berita</span>
              <span className="font-bold text-white font-mono text-sm">{articles.length}</span>
            </div>
            <div className="bg-[#180C0C] border border-[#2C1414] rounded-xl p-3 flex items-center justify-between">
              <span className="text-emerald-400 flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Terbit</span>
              </span>
              <span className="font-bold text-emerald-300 font-mono text-sm">{totalPublished}</span>
            </div>
            <div className="bg-[#180C0C] border border-[#2C1414] rounded-xl p-3 flex items-center justify-between">
              <span className="text-amber-400 flex items-center gap-1">
                <FileClock className="w-3.5 h-3.5" />
                <span>Draf</span>
              </span>
              <span className="font-bold text-amber-300 font-mono text-sm">{totalDraft}</span>
            </div>
            <div className="bg-[#180C0C] border border-[#2C1414] rounded-xl p-3 flex items-center justify-between">
              <span className="text-rose-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5" />
                <span>Headline</span>
              </span>
              <span className="font-bold text-rose-300 font-mono text-sm">{totalHeadline}</span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-[#180C0C] border border-[#2C1414] rounded-xl p-4 space-y-3 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  placeholder="Cari judul, slug, penulis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#120808] border border-[#2C1414] rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#E50914] transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 2. Filter Kategori */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#120808] border border-[#2C1414] rounded-lg text-xs text-stone-300 focus:outline-none focus:border-[#E50914] transition-colors"
                >
                  <option value="ALL">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      Kategori: {c.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Filter Status */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#120808] border border-[#2C1414] rounded-lg text-xs text-stone-300 focus:outline-none focus:border-[#E50914] transition-colors"
                >
                  <option value="ALL">Semua Status Publikasi</option>
                  <option value="PUBLISHED">PUBLISHED (Tayang)</option>
                  <option value="DRAFT">DRAFT (Konsep / Diajukan)</option>
                  <option value="ARCHIVED">ARCHIVED (Diarsipkan)</option>
                </select>
              </div>

              {/* 4. Filter Tipe / Kunci Edit */}
              <div>
                <select
                  value={selectedHighlight}
                  onChange={(e) => setSelectedHighlight(e.target.value)}
                  className="w-full px-3 py-2 bg-[#120808] border border-[#2C1414] rounded-lg text-xs text-stone-300 focus:outline-none focus:border-[#E50914] transition-colors"
                >
                  <option value="ALL">Semua Sorotan &amp; Kunci</option>
                  <option value="HEADLINE">Headline Utama (Hero Slider)</option>
                  <option value="PILIHAN">Berita Pilihan (Featured)</option>
                  <option value="LOCKED">🔒 Naskah Terkunci</option>
                  <option value="UNLOCKED">🔓 Izin Edit Dibuka</option>
                  {isAdmin && <option value="MY_ARTICLES">Berita Buatan Saya</option>}
                </select>
              </div>
            </div>

            {/* Sub-bar: Urutan & Reset */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#241111] text-xs">
              <div className="flex items-center gap-3">
                <span className="text-stone-400 flex items-center gap-1.5 text-[11px]">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
                  <span>Urutkan:</span>
                </span>
                <div className="inline-flex rounded-lg bg-[#120808] p-0.5 border border-[#2C1414]">
                  <button
                    onClick={() => setSortBy("NEWEST")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                      sortBy === "NEWEST"
                        ? "bg-[#E50914] text-white shadow-xs"
                        : "text-stone-400 hover:text-white"
                    }`}
                  >
                    Terbaru
                  </button>
                  <button
                    onClick={() => setSortBy("OLDEST")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                      sortBy === "OLDEST"
                        ? "bg-[#E50914] text-white shadow-xs"
                        : "text-stone-400 hover:text-white"
                    }`}
                  >
                    Terlama
                  </button>
                  <button
                    onClick={() => setSortBy("VIEWS")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
                      sortBy === "VIEWS"
                        ? "bg-[#E50914] text-white shadow-xs"
                        : "text-stone-400 hover:text-white"
                    }`}
                  >
                    <Flame className="w-3 h-3" />
                    <span>Terpopuler</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-stone-400 text-[11px]">
                  Menampilkan{" "}
                  <strong className="text-white font-mono">{filteredArticles.length}</strong> dari{" "}
                  <span className="font-mono">{articles.length}</span> berita
                </span>

                {hasActiveFilter && (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 font-semibold cursor-pointer underline"
                  >
                    <X className="w-3 h-3" />
                    <span>Reset Filter</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Articles Table */}
          <div className="bg-[#180C0C] border border-[#2C1414] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1E1010] text-stone-400 uppercase tracking-wider text-[10px] border-b border-[#2C1414]">
                  <tr>
                    <th className="py-3 px-4">Artikel</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Status &amp; Izin Edit</th>
                    <th className="py-3 px-4">Penulis</th>
                    <th className="py-3 px-4">Dibaca</th>
                    <th className="py-3 px-4">Tanggal Dibuat</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C1414] text-stone-300">
                  {filteredArticles.length > 0 ? (
                    filteredArticles.map((art) => {
                      // is_draft: true = izin edit dibuka oleh admin
                      // is_draft: false = terkunci
                      const isUnlocked = art.is_draft;
                      const canNonAdminEdit = isUnlocked;

                      return (
                        <tr key={art.id} className="hover:bg-[#200F0F] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-10 rounded overflow-hidden bg-stone-800 shrink-0 border border-[#2C1414]">
                                <Image
                                  src={art.gambar_sampul || "/images/ads/iklan-bunga.jpeg"}
                                  alt={art.judul}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="max-w-xs sm:max-w-md">
                                <p className="font-semibold text-white line-clamp-2 leading-snug">
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
                            <div className="flex items-center gap-1.5 flex-wrap">
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

                              {/* Kunci Edit Status Indicator */}
                              {isUnlocked ? (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950/60 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800/60">
                                  <Unlock className="w-2.5 h-2.5" />
                                  <span>Edit Dibuka</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-stone-900 text-stone-400 px-1.5 py-0.2 rounded border border-stone-800">
                                  <Lock className="w-2.5 h-2.5 text-stone-500" />
                                  <span>Terkunci</span>
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
                          <td className="py-3.5 px-4 text-stone-300">
                            <span className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-stone-500" />
                              <span>{art.penulis.nama_lengkap}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-stone-400">
                            {art.dilihat.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-stone-400">
                            {formatTanggalWaktu(art.created_at)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 1. View / Preview Link */}
                              <Link
                                href={`/berita/${art.slug}`}
                                target="_blank"
                                className="p-1.5 rounded bg-[#2A1212] text-stone-300 hover:text-white transition-colors"
                                title="Lihat Pratinjau Berita"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>

                              {/* 2. Edit Action: Admin ALWAYS can edit, Non-admin ONLY if unlocked */}
                              {isAdmin ? (
                                <Link
                                  href={`/admin/berita/${art.id}/edit`}
                                  className="p-1.5 rounded bg-amber-950/60 text-amber-300 hover:text-amber-200 transition-colors"
                                  title="Sunting Naskah Berita"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Link>
                              ) : canNonAdminEdit ? (
                                <Link
                                  href={`/admin/berita/${art.id}/edit`}
                                  className="p-1.5 rounded bg-amber-950/60 text-amber-300 hover:text-amber-200 transition-colors"
                                  title="Sunting Naskah (Izin Edit Dibuka oleh Admin)"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Link>
                              ) : (
                                <button
                                  disabled
                                  className="p-1.5 rounded bg-stone-900 text-stone-600 cursor-not-allowed"
                                  title="Naskah telah diajukan dan terkunci. Hanya Admin yang dapat membuka kunci edit kembali."
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* 3. Admin Only: Buka/Tutup Kunci Edit Penulis */}
                              {isAdmin && (
                                <button
                                  onClick={() => handleToggleLock(art.id, isUnlocked)}
                                  disabled={actionLoadingId === art.id}
                                  className={`p-1.5 rounded transition-colors cursor-pointer ${
                                    isUnlocked
                                      ? "bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60"
                                      : "bg-stone-800 text-stone-400 hover:text-white"
                                  }`}
                                  title={
                                    isUnlocked
                                      ? "Kunci kembali naskah ini agar penulis tidak dapat mengubah lagi"
                                      : "Buka kunci naskah ini agar penulis dapat menyunting revisi"
                                  }
                                >
                                  {isUnlocked ? (
                                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Lock className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}

                              {/* 4. Admin Only: Soft Delete (Pindah ke Sampah) */}
                              {isAdmin && (
                                <button
                                  onClick={() => handleSoftDelete(art.id, art.judul)}
                                  disabled={actionLoadingId === art.id}
                                  className="p-1.5 rounded bg-red-950/60 text-red-400 hover:text-red-300 transition-colors cursor-pointer disabled:opacity-50"
                                  title="Pindahkan ke Kotak Sampah"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-500 text-xs">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Search className="w-6 h-6 text-stone-600" />
                          <p>Tidak ada berita yang sesuai dengan filter atau kata kunci.</p>
                          {hasActiveFilter && (
                            <button
                              onClick={resetFilters}
                              className="text-red-400 hover:underline text-xs font-semibold cursor-pointer"
                            >
                              Hapus semua filter
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* KOTAK SAMPAH (TRASH TAB) - ADMIN ONLY */
        <div className="space-y-4">
          <div className="bg-[#200F0F] border border-red-900/40 rounded-xl p-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-red-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                Berita di kotak sampah tidak tampil di publik. Anda dapat memulihkannya kembali atau menghapusnya secara permanen.
              </span>
            </div>
            <span className="font-mono text-stone-400">
              {trashArticles.length} Berita di Kotak Sampah
            </span>
          </div>

          <div className="bg-[#180C0C] border border-[#2C1414] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1E1010] text-stone-400 uppercase tracking-wider text-[10px] border-b border-[#2C1414]">
                  <tr>
                    <th className="py-3 px-4">Artikel Terhapus</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Penulis</th>
                    <th className="py-3 px-4">Tanggal Dihapus</th>
                    <th className="py-3 px-4 text-right">Tindakan Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C1414] text-stone-300">
                  {trashArticles.length > 0 ? (
                    trashArticles.map((art) => (
                      <tr key={art.id} className="hover:bg-[#200F0F] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-10 rounded overflow-hidden bg-stone-800 shrink-0 border border-[#2C1414] opacity-75">
                              <Image
                                src={art.gambar_sampul || "/images/ads/iklan-bunga.jpeg"}
                                alt={art.judul}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div className="max-w-xs sm:max-w-md">
                              <p className="font-semibold text-stone-300 line-clamp-2 leading-snug">
                                {art.judul}
                              </p>
                              <p className="text-[10px] text-stone-500 font-mono">
                                /{art.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-stone-400">{art.kategori.nama}</td>
                        <td className="py-3.5 px-4 text-stone-400">{art.penulis.nama_lengkap}</td>
                        <td className="py-3.5 px-4 text-stone-400">
                          {art.deleted_at ? formatTanggalWaktu(art.deleted_at) : "-"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Pulihkan Button */}
                            <button
                              onClick={() => handleRestore(art.id, art.judul)}
                              disabled={actionLoadingId === art.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900/80 border border-emerald-800 text-[11px] font-bold transition-all cursor-pointer"
                              title="Pulihkan Berita"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Pulihkan</span>
                            </button>

                            {/* Hapus Permanen Button */}
                            <button
                              onClick={() => handlePermanentDelete(art.id, art.judul)}
                              disabled={actionLoadingId === art.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 text-red-300 hover:bg-red-900/80 border border-red-800 text-[11px] font-bold transition-all cursor-pointer"
                              title="Hapus Permanen dari Database"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Hapus Permanen</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-stone-500 text-xs">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Trash2 className="w-6 h-6 text-stone-600" />
                          <p>Kotak sampah kosong. Tidak ada berita yang dihapus.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
