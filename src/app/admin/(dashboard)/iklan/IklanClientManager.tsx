"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, ExternalLink, Loader2, Upload } from "lucide-react";
import { simpanIklan, toggleIklan, hapusIklan } from "@/app/actions/iklan";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

interface AdItem {
  id: string;
  judul: string;
  gambar: string;
  tautan: string | null;
  posisi: "SIDEBAR" | "HOME_STRIP" | "ARTICLE_TOP" | "FOOTER";
  aktif: boolean;
  urutan: number;
}

export default function IklanClientManager({ initialAds }: { initialAds: AdItem[] }) {
  const [ads, setAds] = useState(initialAds);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gambarUrl, setGambarUrl] = useState("/images/ads/iklan-bunga.jpeg");
  const [uploading, setUploading] = useState(false);

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
    variant: "danger",
    action: async () => {},
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleIklan(id, !currentStatus);
      setAds((prev) =>
        prev.map((ad) => (ad.id === id ? { ...ad, aktif: !currentStatus } : ad))
      );
    } catch {
      alert("Gagal mengubah status iklan");
    }
  };

  const handleDelete = (id: string, judul: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Hapus Banner Iklan",
      message: `Apakah Anda yakin ingin menghapus iklan banner "${judul}"?`,
      confirmText: "Ya, Hapus Iklan",
      variant: "danger",
      action: async () => {
        setConfirmLoading(true);
        try {
          await hapusIklan(id);
          setAds((prev) => prev.filter((ad) => ad.id !== id));
        } catch {
          alert("Gagal menghapus iklan");
        } finally {
          setConfirmLoading(false);
        }
      },
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setGambarUrl(data.url);
      }
    } catch {
      alert("Gagal mengunggah file");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("gambar", gambarUrl);

    try {
      await simpanIklan(formData);
      setIsModalOpen(false);
      window.location.reload();
    } catch {
      alert("Gagal menyimpan iklan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
            Banner Iklan &amp; Kerjasama Mitra
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Kelola banner sponsor, karangan bunga mitra, dan slot penempatan iklan di seluruh portal.
          </p>
        </div>

        <button
          onClick={() => {
            setGambarUrl("/images/ads/iklan-bunga.jpeg");
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 bg-[#E50914] hover:bg-[#B91C1C] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Banner Iklan Baru</span>
        </button>
      </div>

      {/* Grid of Ads */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div>
              {/* Image Preview */}
              <div className="relative aspect-[16/9] w-full bg-stone-100 border-b border-stone-100">
                <Image
                  src={ad.gambar}
                  alt={ad.judul}
                  fill
                  sizes="350px"
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                  {ad.posisi}
                </div>
                <div className="absolute top-2 right-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      ad.aktif
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {ad.aktif ? "AKTIF" : "NONAKTIF"}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="text-xs font-bold text-stone-900 line-clamp-2">
                  {ad.judul}
                </h4>
                {ad.tautan && (
                  <a
                    href={ad.tautan}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#7F0000] hover:underline flex items-center gap-1 truncate font-medium"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span>{ad.tautan}</span>
                  </a>
                )}
              </div>
            </div>

            <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs">
              <button
                onClick={() => handleToggle(ad.id, ad.aktif)}
                className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer border ${
                  ad.aktif
                    ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                }`}
              >
                {ad.aktif ? "Nonaktifkan" : "Aktifkan"}
              </button>

              <button
                onClick={() => handleDelete(ad.id, ad.judul)}
                className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                title="Hapus Iklan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Iklan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-stone-900">
            <h3 className="text-base font-bold text-stone-900 mb-4">
              Tambah Banner Iklan Baru
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-600 font-semibold mb-1">Judul / Nama Mitra</label>
                <input
                  type="text"
                  name="judul"
                  required
                  defaultValue="Toko Bunga Sejahtera - Karangan Bunga & Papan Ucapan"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">Posisi Tayang</label>
                <select
                  name="posisi"
                  defaultValue="SIDEBAR"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                >
                  <option value="SIDEBAR">SIDEBAR (Bilah Kanan Beranda)</option>
                  <option value="HOME_STRIP">HOME_STRIP (Blok Strip Promosi)</option>
                  <option value="ARTICLE_TOP">ARTICLE_TOP (Atas Isi Berita)</option>
                  <option value="FOOTER">FOOTER (Bawah Sebelum Kaki Halaman)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">Tautan Tujuan (Link / WhatsApp)</label>
                <input
                  type="text"
                  name="tautan"
                  defaultValue="https://wa.me/6281234567890"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Gambar Banner (Otomatis WebP)
                </label>
                <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-stone-100 border border-stone-200 mb-2">
                  <Image
                    src={gambarUrl}
                    alt="Pratinjau"
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                </div>
                <input
                  type="text"
                  value={gambarUrl}
                  onChange={(e) => setGambarUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded text-[11px] text-stone-900 mb-2 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                />
                <label className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded cursor-pointer transition-colors border border-stone-200">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? "Mengompres & Mengunggah..." : "Unggah & Kompres Gambar (WebP)"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  name="aktif"
                  id="aktif-checkbox"
                  defaultChecked
                  className="rounded text-[#E50914] border-stone-300 focus:ring-[#E50914]"
                />
                <label htmlFor="aktif-checkbox" className="text-stone-700 cursor-pointer select-none">
                  Aktifkan penayangan banner ini
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-lg cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#E50914] hover:bg-[#B91C1C] text-white font-bold rounded-lg cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
                >
                  {loading ? "Menyimpan..." : "Simpan Iklan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Confirm Dialog */}
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
