"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Save, Upload, Loader2, Sparkles } from "lucide-react";
import { simpanArtikel } from "@/app/actions/berita";

interface CategoryOption {
  id: string;
  nama: string;
}

interface ArticleFormProps {
  initialData?: {
    id: string;
    judul: string;
    ringkasan: string;
    konten: string;
    gambar_sampul: string;
    kategori_id: string;
    status: string;
    adalah_utama: boolean;
    adalah_pilihan: boolean;
    tags: string;
  };
  categories: CategoryOption[];
}

export default function ArticleForm({ initialData, categories }: ArticleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState(
    initialData?.gambar_sampul || "/images/ads/iklan-bunga.jpeg"
  );
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setCoverImage(data.url);
      } else {
        alert("Gagal mengunggah gambar");
      }
    } catch {
      alert("Error unggah file");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("gambar_sampul", coverImage);

    try {
      await simpanArtikel(formData);
      router.push("/admin/berita");
      router.refresh();
    } catch (err) {
      alert("Gagal menyimpan artikel");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between pb-4 border-b border-[#2C1414]">
        <Link
          href="/admin/berita"
          className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Berita</span>
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#B91C1C] text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Simpan Artikel</span>
        </button>
      </div>

      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (Main content) */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Judul Artikel
            </label>
            <input
              type="text"
              name="judul"
              required
              defaultValue={initialData?.judul}
              placeholder="Masukkan judul berita utama yang menarik & informatif..."
              className="w-full px-4 py-2.5 bg-[#180C0C] border border-[#2C1414] rounded-lg text-sm text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Ringkasan / Excerpt (Lead Paragraf)
            </label>
            <textarea
              name="ringkasan"
              required
              rows={3}
              defaultValue={initialData?.ringkasan}
              placeholder="Tulis ringkasan singkat untuk tampilan kartu berita & meta SEO..."
              className="w-full px-4 py-2.5 bg-[#180C0C] border border-[#2C1414] rounded-lg text-sm text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Isi Konten Berita (Mendukung Format HTML)
            </label>
            <textarea
              name="konten"
              required
              rows={12}
              defaultValue={initialData?.konten}
              placeholder="Tulis narasi berita lengkap di sini. Gunakan tag <p>, <h3>, <strong> untuk format..."
              className="w-full px-4 py-2.5 bg-[#180C0C] border border-[#2C1414] rounded-lg text-sm text-white font-sans placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Tag / Label (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              name="tags"
              defaultValue={initialData?.tags}
              placeholder="misal: Presisi, Kamtibmas, Patroli, Korlantas"
              className="w-full px-4 py-2 bg-[#180C0C] border border-[#2C1414] rounded-lg text-xs text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
            />
          </div>
        </div>

        {/* Right Column (Metadata & Cover) */}
        <div className="space-y-4">
          <div className="bg-[#180C0C] border border-[#2C1414] rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#2C1414] pb-2">
              Pengaturan Publikasi
            </h3>

            <div>
              <label className="block text-xs text-stone-400 mb-1">Kategori</label>
              <select
                name="kategori_id"
                required
                defaultValue={initialData?.kategori_id || categories[0]?.id}
                className="w-full px-3 py-2 bg-[#120808] border border-[#2C1414] rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-stone-400 mb-1">Status Naskah</label>
              <select
                name="status"
                defaultValue={initialData?.status || "PUBLISHED"}
                className="w-full px-3 py-2 bg-[#120808] border border-[#2C1414] rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
              >
                <option value="PUBLISHED">PUBLISHED (Terbitkan)</option>
                <option value="DRAFT">DRAFT (Simpan Draf)</option>
                <option value="ARCHIVED">ARCHIVED (Arsip)</option>
              </select>
            </div>

            <div className="pt-2 border-t border-[#2C1414] space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="adalah_utama"
                  defaultChecked={initialData?.adalah_utama}
                  className="rounded border-[#2C1414] text-[#E50914] focus:ring-[#E50914]"
                />
                <span className="text-stone-300">Tampilkan di Hero Slider (Utama)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="adalah_pilihan"
                  defaultChecked={initialData?.adalah_pilihan}
                  className="rounded border-[#2C1414] text-[#E50914] focus:ring-[#E50914]"
                />
                <span className="text-stone-300">Tampilkan di Berita Pilihan</span>
              </label>
            </div>
          </div>

          {/* Cover Image Upload & Preview */}
          <div className="bg-[#180C0C] border border-[#2C1414] rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#2C1414] pb-2">
              Gambar Sampul Berita
            </h3>

            <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-[#120808] border border-[#2C1414]">
              {coverImage ? (
                <Image
                  src={coverImage}
                  alt="Pratinjau Sampul"
                  fill
                  sizes="300px"
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-stone-600 text-xs">
                  Belum ada gambar
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] text-stone-400 mb-1">
                URL Gambar atau Unggah Baru
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://... atau /images/..."
                className="w-full px-3 py-1.5 bg-[#120808] border border-[#2C1414] rounded text-xs text-white placeholder-stone-600 mb-2"
              />

              <label className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-[#2A1212] hover:bg-[#3A1818] text-stone-300 text-xs font-semibold rounded cursor-pointer transition-colors border border-red-950">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? "Mengunggah..." : "Unggah Gambar dari Perangkat"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
