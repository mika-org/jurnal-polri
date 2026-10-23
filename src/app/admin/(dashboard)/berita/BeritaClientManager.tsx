"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PlusCircle,
  Search,
  Edit,
  ExternalLink,
  Eye,
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
  MessageSquare,
  X,
} from "lucide-react";
import { formatTanggalWaktu } from "@/lib/utils";
import AdminArticleComments from "@/components/admin/AdminArticleComments";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
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
  ringkasan?: string | null;
  konten?: string;
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
  _count?: {
    komentar: number;
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
  const [selectedArticleForComments, setSelectedArticleForComments] = useState<{
    id: string;
    judul: string;
  } | null>(null);

  // Preview Modal Article State
  const [previewArticle, setPreviewArticle] = useState<ArticleItem | null>(null);

  // In-App Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    variant: "danger" | "warning";
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    variant: "warning",
    action: async () => { },
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Soft Delete Handler (Hanya Admin)
  const handleSoftDelete = (id: string, judul: string) => {
    if (!isAdmin) {
      alert("Hanya Admin yang berwenang menghapus berita");
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: "Pindahkan ke Kotak Sampah",
      message: `Pindahkan naskah berita "${judul}" ke kotak sampah? Anda dapat memulihkannya kembali nanti dari tab Kotak Sampah.`,
      confirmText: "Ya, Pindahkan ke Sampah",
      variant: "warning",
      action: async () => {
        setConfirmLoading(true);
        setActionLoadingId(id);
        try {
          await hapusArtikel(id);
          window.location.reload();
        } catch (err: unknown) {
          alert(err instanceof Error ? err.message : "Gagal memindahkan ke sampah");
        } finally {
          setActionLoadingId(null);
          setConfirmLoading(false);
        }
      },
    });
  };

  // Restore Handler (Hanya Admin)
  const handleRestore = async (id: string) => {
    if (!isAdmin) return;
    setActionLoadingId(id);
    try {
      await pulihkanArtikel(id);
      window.location.reload();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal memulihkan berita");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Permanent Delete Handler (Hanya Admin)
  const handlePermanentDelete = (id: string, judul: string) => {
    if (!isAdmin) return;

    setConfirmDialog({
      isOpen: true,
      title: "Hapus Berita Permanen",
      message: `PERINGATAN: Berita "${judul}" akan dihapus permanen dari basis data beserta seluruh data terkait dan tidak dapat dikembalikan. Lanjutkan?`,
      confirmText: "Ya, Hapus Permanen",
      variant: "danger",
      action: async () => {
        setConfirmLoading(true);
        setActionLoadingId(id);
        try {
          await hapusPermanenArtikel(id);
          window.location.reload();
        } catch (err: unknown) {
          alert(err instanceof Error ? err.message : "Gagal menghapus permanen");
        } finally {
          setActionLoadingId(null);
          setConfirmLoading(false);
        }
      },
    });
  };

  // Toggle Lock Handler (Hanya Admin)
  const handleToggleLock = async (id: string, currentUnlocked: boolean) => {
    if (!isAdmin) return;
    setActionLoadingId(id);
    try {
      await toggleKunciEditArtikel(id);
      window.location.reload();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal mengubah izin kunci edit");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered & Sorted Articles
  const filteredArticles = useMemo(() => {
    return articles
      .filter((art) => {
        // Search
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          const matchJudul = art.judul.toLowerCase().includes(q);
          const matchSlug = art.slug.toLowerCase().includes(q);
          const matchPenulis = art.penulis.nama_lengkap.toLowerCase().includes(q);
          const matchKategori = art.kategori.nama.toLowerCase().includes(q);
          if (!matchJudul && !matchSlug && !matchPenulis && !matchKategori) {
            return false;
          }
        }

        // Kategori
        if (selectedCategory !== "ALL" && art.kategori.id !== selectedCategory) {
          return false;
        }

        // Status
        if (selectedStatus !== "ALL" && art.status !== selectedStatus) {
          return false;
        }

        // Highlight & Lock filter
        if (selectedHighlight === "HEADLINE" && !art.adalah_utama) {
          return false;
        }
        if (selectedHighlight === "PILIHAN" && !art.adalah_pilihan) {
          return false;
        }
        if (selectedHighlight === "LOCKED" && art.is_draft) {
          return false; // is_draft: true = unlocked
        }
        if (selectedHighlight === "UNLOCKED" && !art.is_draft) {
          return false; // is_draft: false = locked
        }
        if (selectedHighlight === "MY_ARTICLES" && art.penulis_id !== currentUserId) {
          return false;
        }

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
      {/* Top Header Card & New Button */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
            <span>Manajemen Berita &amp; Liputan</span>
            {isWartawan && (
              <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                Akses Wartawan
              </span>
            )}
            {isAdmin && (
              <span className="text-[10px] bg-red-50 text-[#7F0000] font-bold px-2.5 py-0.5 rounded-full border border-red-200">
                Super Admin
              </span>
            )}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {isAdmin
              ? "Kelola semua naskah berita portal, verifikasi pengajuan, kotak sampah, dan hak penerbitan."
              : "Daftar naskah liputan yang Anda tulis sendiri. Naskah yang diajukan akan ditinjau Admin sebelum tayang."}
          </p>
        </div>

        <Link
          href="/admin/berita/tambah"
          className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#B91C1C] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tulis Berita Baru</span>
        </Link>
      </div>

      {/* Tabs: Berita Aktif vs Kotak Sampah */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === "ACTIVE"
              ? "bg-white text-stone-900 border border-stone-200 shadow-xs"
              : "text-stone-500 hover:text-stone-900"
            }`}
        >
          <FileText className="w-4 h-4 text-[#E50914]" />
          <span>Berita Aktif</span>
          <span className="bg-stone-100 px-1.5 py-0.2 rounded text-[10px] font-mono text-stone-700 border border-stone-200">
            {articles.length}
          </span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab("TRASH")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === "TRASH"
                ? "bg-red-50 text-red-700 border border-red-200 shadow-xs"
                : "text-stone-500 hover:text-red-600"
              }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Kotak Sampah</span>
            {trashArticles.length > 0 && (
              <span className="bg-red-100 text-red-700 px-1.5 py-0.2 rounded text-[10px] font-mono">
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
            <div className="bg-white border border-stone-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
              <span className="text-stone-500">Total Berita</span>
              <span className="font-bold text-stone-900 font-mono text-sm">{articles.length}</span>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
              <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Terbit</span>
              </span>
              <span className="font-bold text-emerald-700 font-mono text-sm">{totalPublished}</span>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
              <span className="text-amber-700 flex items-center gap-1 font-semibold">
                <FileClock className="w-3.5 h-3.5" />
                <span>Draf</span>
              </span>
              <span className="font-bold text-amber-700 font-mono text-sm">{totalDraft}</span>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
              <span className="text-rose-700 flex items-center gap-1 font-semibold">
                <Star className="w-3.5 h-3.5" />
                <span>Headline</span>
              </span>
              <span className="font-bold text-rose-700 font-mono text-sm">{totalHeadline}</span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Cari judul, slug, penulis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
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
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors"
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
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors"
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
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors"
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
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-stone-500 flex items-center gap-1.5 text-[11px]">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
                  <span>Urutkan:</span>
                </span>
                <div className="inline-flex rounded-lg bg-stone-100 p-0.5 border border-stone-200">
                  <button
                    onClick={() => setSortBy("NEWEST")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${sortBy === "NEWEST"
                        ? "bg-[#E50914] text-white shadow-xs font-bold"
                        : "text-stone-600 hover:text-stone-900"
                      }`}
                  >
                    Terbaru
                  </button>
                  <button
                    onClick={() => setSortBy("OLDEST")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${sortBy === "OLDEST"
                        ? "bg-[#E50914] text-white shadow-xs font-bold"
                        : "text-stone-600 hover:text-stone-900"
                      }`}
                  >
                    Terlama
                  </button>
                  <button
                    onClick={() => setSortBy("VIEWS")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer ${sortBy === "VIEWS"
                        ? "bg-[#E50914] text-white shadow-xs font-bold"
                        : "text-stone-600 hover:text-stone-900"
                      }`}
                  >
                    <Flame className="w-3 h-3" />
                    <span>Terpopuler</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-stone-500 text-[11px]">
                  Menampilkan{" "}
                  <strong className="text-stone-900 font-mono">{filteredArticles.length}</strong> dari{" "}
                  <span className="font-mono">{articles.length}</span> berita
                </span>

                {hasActiveFilter && (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 font-semibold cursor-pointer underline"
                  >
                    <X className="w-3 h-3" />
                    <span>Reset Filter</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Articles Table */}
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#7F0000] text-white uppercase tracking-wider text-[10px] font-bold border-b border-red-900">
                  <tr>
                    <th className="py-3 px-4 text-white font-bold tracking-wider">Artikel</th>
                    <th className="py-3 px-4 text-white font-bold tracking-wider">Kategori</th>
                    <th className="py-3 px-4 text-white font-bold tracking-wider">Status &amp; Izin Edit</th>
                    <th className="py-3 px-4 text-white font-bold tracking-wider">Penulis</th>
                    <th className="py-3 px-4 text-white font-bold tracking-wider">Dibaca</th>
                    <th className="py-3 px-4 text-white font-bold tracking-wider">Tanggal Dibuat</th>
                    <th className="py-3 px-4 text-right text-white font-bold tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {filteredArticles.length > 0 ? (
                    filteredArticles.map((art) => {
                      const isUnlocked = art.is_draft;
                      const canNonAdminEdit = isUnlocked;

                      return (
                        <tr key={art.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-10 rounded overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                                <Image
                                  src={art.gambar_sampul || "/images/ads/iklan-bunga.jpeg"}
                                  alt={art.judul}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="max-w-xs sm:max-w-md">
                                <p className="font-semibold text-stone-900 line-clamp-2 leading-snug">
                                  {art.judul}
                                </p>
                                <p className="text-[10px] text-stone-400 font-mono">
                                  /{art.slug}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-red-200">
                              {art.kategori.nama}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${art.status === "PUBLISHED"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : art.status === "DRAFT"
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : "bg-stone-100 text-stone-600"
                                  }`}
                              >
                                {art.status}
                              </span>

                              {/* Kunci Edit Status Indicator */}
                              {isUnlocked ? (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200 font-semibold">
                                  <Unlock className="w-2.5 h-2.5" />
                                  <span>Edit Dibuka</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded border border-stone-200">
                                  <Lock className="w-2.5 h-2.5 text-stone-500" />
                                  <span>Terkunci</span>
                                </span>
                              )}
                            </div>

                            {art.adalah_utama && (
                              <span className="block text-[9px] text-amber-600 font-bold">
                                ★ Headline Slider
                              </span>
                            )}
                            {art.adalah_pilihan && (
                              <span className="block text-[9px] text-rose-600 font-bold">
                                ♦ Berita Pilihan
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-stone-700">
                            <span className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-stone-400" />
                              <span>{art.penulis.nama_lengkap}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-stone-600">
                            {art.dilihat.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-stone-500">
                            {formatTanggalWaktu(art.created_at)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* 1. Tombol Aksi Preview Berita (Membuka Modal Preview) */}
                              <button
                                type="button"
                                onClick={() => setPreviewArticle(art)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-[#7F0000] text-[#7F0000] hover:text-white font-bold text-[11px] transition-all border border-red-200 shadow-2xs group cursor-pointer"
                                title="Lihat Pratinjau / Preview Naskah Berita"
                              >
                                <Eye className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                <span>Preview Berita</span>
                              </button>

                              {/* 1.5. Kelola Komentar Berita */}
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedArticleForComments({
                                      id: art.id,
                                      judul: art.judul,
                                    })
                                  }
                                  className="p-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer relative"
                                  title={`Kelola Komentar (${art._count?.komentar || 0})`}
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  {typeof art._count?.komentar === "number" && art._count.komentar > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-[#E50914] text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center font-mono">
                                      {art._count.komentar}
                                    </span>
                                  )}
                                </button>
                              )}

                              {/* 2. Edit Action: Admin ALWAYS can edit, Non-admin ONLY if unlocked */}
                              {isAdmin ? (
                                <Link
                                  href={`/admin/berita/${art.id}/edit`}
                                  className="p-1.5 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                                  title="Sunting Naskah Berita"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Link>
                              ) : canNonAdminEdit ? (
                                <Link
                                  href={`/admin/berita/${art.id}/edit`}
                                  className="p-1.5 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                                  title="Sunting Naskah (Izin Edit Dibuka oleh Admin)"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Link>
                              ) : (
                                <button
                                  disabled
                                  className="p-1.5 rounded bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200"
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
                                  className={`p-1.5 rounded transition-colors cursor-pointer border ${isUnlocked
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                      : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200"
                                    }`}
                                  title={
                                    isUnlocked
                                      ? "Kunci kembali naskah ini agar penulis tidak dapat mengubah lagi"
                                      : "Buka kunci naskah ini agar penulis dapat menyunting revisi"
                                  }
                                >
                                  {isUnlocked ? (
                                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
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
                                  className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
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
                          <Search className="w-6 h-6 text-stone-400" />
                          <p>Tidak ada berita yang sesuai dengan filter atau kata kunci.</p>
                          {hasActiveFilter && (
                            <button
                              onClick={resetFilters}
                              className="text-red-600 hover:underline text-xs font-semibold cursor-pointer"
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
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between text-xs text-amber-900 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Berita di kotak sampah tidak tampil di publik. Anda dapat memulihkannya kembali atau menghapusnya secara permanen.
              </span>
            </div>
            <span className="font-mono text-amber-800 font-bold">
              {trashArticles.length} Berita di Kotak Sampah
            </span>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#7F0000] text-white uppercase tracking-wider text-[10px] font-bold border-b border-red-900">
                  <tr>
                    <th className="py-3 px-4 text-white font-bold tracking-wider">Artikel Terhapus</th>
                    <th className="py-3 px-4 text-white font-bold tracking-wider">Kategori</th>
                    <th className="py-3 px-4 text-white font-bold tracking-wider">Penulis</th>
                    <th className="py-3 px-4 text-white font-bold tracking-wider">Tanggal Dihapus</th>
                    <th className="py-3 px-4 text-right text-white font-bold tracking-wider">Tindakan Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {trashArticles.length > 0 ? (
                    trashArticles.map((art) => (
                      <tr key={art.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-10 rounded overflow-hidden bg-stone-100 shrink-0 border border-stone-200 opacity-75">
                              <Image
                                src={art.gambar_sampul || "/images/ads/iklan-bunga.jpeg"}
                                alt={art.judul}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div className="max-w-xs sm:max-w-md">
                              <p className="font-semibold text-stone-900 line-clamp-2 leading-snug">
                                {art.judul}
                              </p>
                              <p className="text-[10px] text-stone-400 font-mono">
                                /{art.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-stone-600">{art.kategori.nama}</td>
                        <td className="py-3.5 px-4 text-stone-600">{art.penulis.nama_lengkap}</td>
                        <td className="py-3.5 px-4 text-stone-500">
                          {art.deleted_at ? formatTanggalWaktu(art.deleted_at) : "-"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRestore(art.id)}
                              disabled={actionLoadingId === art.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer disabled:opacity-50"
                              title="Pulihkan Berita Kembali ke Portal"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Pulihkan</span>
                            </button>

                            <button
                              onClick={() => handlePermanentDelete(art.id, art.judul)}
                              disabled={actionLoadingId === art.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
                              title="Hapus Permanen dari Basis Data"
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
                          <Trash2 className="w-6 h-6 text-stone-400" />
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

      {/* Modal Kelola Komentar Berita */}
      {selectedArticleForComments && (
        <AdminArticleComments
          artikelId={selectedArticleForComments.id}
          artikelJudul={selectedArticleForComments.judul}
          isModal={true}
          onClose={() => setSelectedArticleForComments(null)}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: PRATINJAU / PREVIEW BERITA (Tidak Langsung Redirect) */}
      {/* ========================================================= */}
      {previewArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col text-stone-900">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#E50914]" />
                <h3 className="text-sm font-bold text-stone-900">
                  Pratinjau / Preview Naskah Berita
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {/* Tombol redirect ke web yang berada di dalam modal */}
                <Link
                  href={`/berita/${previewArticle.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E50914] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  title="Buka naskah berita di halaman publik / tab baru"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di Tab Baru</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setPreviewArticle(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Article Preview Content Body */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-4 text-xs">
              {/* Cover Image */}
              {previewArticle.gambar_sampul && (
                <div className="relative w-full h-56 sm:h-72 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs">
                  <Image
                    src={previewArticle.gambar_sampul}
                    alt={previewArticle.judul}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Metadata: Category, Date, Author, Views */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 border-b border-stone-100 pb-2">
                <span className="bg-red-50 text-red-700 px-2.5 py-0.5 rounded font-bold border border-red-200">
                  {previewArticle.kategori.nama}
                </span>
                <span>•</span>
                <span className="font-medium text-stone-700">
                  Penulis: {previewArticle.penulis.nama_lengkap}
                </span>
                <span>•</span>
                <span>{formatTanggalWaktu(previewArticle.created_at)}</span>
                <span>•</span>
                <span className="font-mono">{previewArticle.dilihat.toLocaleString()} views</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${previewArticle.status === "PUBLISHED"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                >
                  {previewArticle.status}
                </span>
              </div>

              {/* Judul Utama */}
              <h1 className="font-serif font-black text-xl sm:text-2xl text-stone-900 leading-snug">
                {previewArticle.judul}
              </h1>

              {/* Ringkasan jika ada */}
              {previewArticle.ringkasan && (
                <div className="p-3 bg-stone-50 border-l-4 border-[#E50914] rounded-r-lg text-stone-700 italic leading-relaxed text-xs">
                  {previewArticle.ringkasan}
                </div>
              )}

              {/* Konten Berita Lengkap */}
              <div className="prose prose-sm max-w-none text-stone-800 leading-relaxed font-serif text-sm">
                {previewArticle.konten ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: previewArticle.konten }}
                    className="space-y-3"
                  />
                ) : (
                  <p className="text-stone-400 italic">
                    Konten naskah berita belum diisi.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs shrink-0">
              <span className="text-stone-400 text-[11px] font-mono">
                Slug: /{previewArticle.slug}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewArticle(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-semibold cursor-pointer"
                >
                  Tutup
                </button>
                <Link
                  href={`/berita/${previewArticle.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#E50914] hover:bg-[#B91C1C] text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di Halaman Web</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* IN-APP CONFIRM DIALOG (Menggantikan confirm browser) */}
      {/* ========================================================= */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        isLoading={confirmLoading}
        onConfirm={async () => {
          await confirmDialog.action();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
