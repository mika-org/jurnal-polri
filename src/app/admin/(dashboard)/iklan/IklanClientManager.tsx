"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, ExternalLink, Loader2, Upload } from "lucide-react";
import { simpanIklan, toggleIklan, hapusIklan } from "@/app/actions/iklan";

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

  const handleDelete = async (id: string, judul: string) => {
    if (confirm(`Hapus iklan banner: "${judul}"?`)) {
      try {
        await hapusIklan(id);
        setAds((prev) => prev.filter((ad) => ad.id !== id));
      } catch {
        alert("Gagal menghapus iklan");
      }
    }
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
      <div className="flex justify-end">
        <button
          onClick={() => {
            setGambarUrl("/images/ads/iklan-bunga.jpeg");
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 bg-[#E50914] hover:bg-[#B91C1C] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow cursor-pointer"
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
            className="bg-[#180C0C] border border-[#2C1414] rounded-xl overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div>
              {/* Image Preview */}
              <div className="relative aspect-[16/9] w-full bg-[#120808] border-b border-[#2C1414]">
                <Image
                  src={ad.gambar}
                  alt={ad.judul}
                  fill
                  sizes="350px"
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {ad.posisi}
                </div>
                <div className="absolute top-2 right-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      ad.aktif
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-red-950 text-red-300 border border-red-800"
                    }`}
                  >
                    {ad.aktif ? "AKTIF" : "NONAKTIF"}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="text-xs font-bold text-white line-clamp-2">
                  {ad.judul}
                </h4>
                {ad.tautan && (
                  <a
                    href={ad.tautan}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 truncate"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span>{ad.tautan}</span>
                  </a>
                )}
              </div>
            </div>

            <div className="p-3 bg-[#1E1010] border-t border-[#2C1414] flex items-center justify-between text-xs">
              <button
                onClick={() => handleToggle(ad.id, ad.aktif)}
                className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  ad.aktif
                    ? "bg-amber-950 text-amber-300 hover:bg-amber-900"
                    : "bg-emerald-950 text-emerald-300 hover:bg-emerald-900"
                }`}
              >
                {ad.aktif ? "Nonaktifkan" : "Aktifkan"}
              </button>

              <button
                onClick={() => handleDelete(ad.id, ad.judul)}
                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E1010] border border-[#3E1A1A] rounded-2xl max-w-lg w-full p-6 shadow-2xl text-stone-200">
            <h3 className="text-base font-bold text-white mb-4">
              Tambah Banner Iklan Baru
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">Judul / Nama Mitra</label>
                <input
                  type="text"
                  name="judul"
                  required
                  defaultValue="Toko Bunga Sejahtera - Karangan Bunga & Papan Ucapan"
                  className="w-full px-3 py-2 bg-[#120808] border border-[#2C1414] rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Posisi Tayang</label>
                <select
                  name="posisi"
                  defaultValue="SIDEBAR"
                  className="w-full px-3 py-2 bg-[#120808] border border-[#2C1414] rounded-lg text-white"
                >
                  <option value="SIDEBAR">SIDEBAR (Bilah Kanan Beranda)</option>
                  <option value="HOME_STRIP">HOME_STRIP (Blok Strip Promosi)</option>
                  <option value="ARTICLE_TOP">ARTICLE_TOP (Atas Isi Berita)</option>
                  <option value="FOOTER">FOOTER (Bawah Sebelum Kaki Halaman)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Tautan Tujuan (Link / WhatsApp)</label>
                <input
                  type="text"
                  name="tautan"
                  defaultValue="https://wa.me/6281234567890"
                  className="w-full px-3 py-2 bg-[#120808] border border-[#2C1414] rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">
                  Gambar Banner (Menggunakan iklan-bunga.jpeg)
                </label>
                <div className="relative aspect-[16/9] w-full rounded overflow-hidden bg-black mb-2">
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
                  className="w-full px-3 py-1.5 bg-[#120808] border border-[#2C1414] rounded text-[11px] text-white mb-2"
                />
                <label className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-[#2A1212] hover:bg-[#3A1818] text-stone-300 text-xs font-semibold rounded cursor-pointer transition-colors border border-red-950">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? "Mengunggah..." : "Unggah Gambar Lain"}</span>
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
                  className="rounded text-[#E50914]"
                />
                <label htmlFor="aktif-checkbox" className="text-stone-300 cursor-pointer">
                  Aktifkan penayangan banner ini
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#2C1414]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#E50914] hover:bg-[#B91C1C] text-white font-bold rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "Simpan Iklan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
