"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Save, Upload, Loader2, ExternalLink, MessageSquare } from "lucide-react";
import { simpanArtikel } from "@/app/actions/berita";
import CKEditor from "@/components/editor/CKEditor";
import AdminArticleComments from "@/components/admin/AdminArticleComments";

interface ArticleFormProps {
  categories: { id: string; nama: string }[];
  isAdmin: boolean;
  initialData?: {
    id?: string;
    judul?: string;
    slug?: string;
    ringkasan?: string;
    konten?: string;
    gambar_sampul?: string;
    kategori_id?: string;
    status?: string;
    adalah_utama?: boolean;
    adalah_pilihan?: boolean;
    tags?: string;
  };
}

export default function ArticleForm({
  categories,
  isAdmin,
  initialData,
}: ArticleFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverImage, setCoverImage] = useState(
    initialData?.gambar_sampul || "/images/ads/iklan-bunga.jpeg"
  );
  const [manualCoverUrl, setManualCoverUrl] = useState("");

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
        alert(data.error || "Gagal mengunggah gambar");
      }
    } catch {
      alert("Terjadi kesalahan saat mengunggah gambar");
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
      window.location.href = "/admin/berita";
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan artikel");
    } finally {
      setLoading(false);
    }
  };

  const handleScrollToComments = () => {
    const el = document.getElementById("komentar-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      el.classList.add("ring-2", "ring-[#E50914]");
      setTimeout(() => el.classList.remove("ring-2", "ring-[#E50914]"), 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/berita"
            className="inline-flex items-center gap-1.5 text-xs text-stone-700 hover:text-stone-900 font-bold transition-colors bg-white hover:bg-stone-50 px-3.5 py-2 rounded-lg border border-stone-200 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-stone-500" />
            <span>Kembali</span>
          </Link>

          {/* Tombol Aksi Preview Berita */}
          {initialData?.slug && (
            <Link
              href={`/berita/${initialData.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs text-stone-700 hover:text-stone-900 font-bold transition-colors bg-white hover:bg-stone-50 px-3.5 py-2 rounded-lg border border-stone-200 shadow-2xs"
              title="Buka pratinjau berita di tab baru"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
              <span>Preview Berita</span>
            </Link>
          )}

          {/* Tombol Aksi Lihat Komentar */}
          {initialData?.id && (
            <button
              type="button"
              onClick={handleScrollToComments}
              className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-800 font-bold transition-colors bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-lg border border-blue-200 shadow-2xs cursor-pointer"
              title="Lihat komentar pembaca di samping formulir"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Lihat Komentar</span>
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#B91C1C] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isAdmin ? "Simpan & Publikasikan Berita" : "Kirim & Ajukan Naskah"}</span>
        </button>
      </div>

      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Main content) */}
        <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-8 space-y-5">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Judul Artikel
              </label>
              <input
                type="text"
                name="judul"
                required
                defaultValue={initialData?.judul}
                placeholder="Masukkan judul berita utama yang menarik & informatif..."
                className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Ringkasan / Excerpt (Lead Paragraf)
              </label>
              <textarea
                name="ringkasan"
                required
                rows={3}
                defaultValue={initialData?.ringkasan}
                placeholder="Tulis ringkasan singkat untuk tampilan kartu berita & meta SEO..."
                className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Isi Konten Berita (Formatter Visual)
              </label>
              <CKEditor
                name="konten"
                initialValue={initialData?.konten || ""}
                placeholder="Tulis narasi berita lengkap di sini dengan format naskah berita..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Tag / Label (Pisahkan dengan koma)
              </label>
              <input
                type="text"
                name="tags"
                defaultValue={initialData?.tags}
                placeholder="misal: Presisi, Kamtibmas, Patroli, Korlantas"
                className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914]"
              />
            </div>
          </div>
        </div>

        {/* Right Column (Metadata, Cover & Daftar Komentar Disamping Form) */}
        <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-4 space-y-5">
          {/* Box Pengaturan Publikasi */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-2">
              Pengaturan Publikasi
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Kategori</label>
              <select
                name="kategori_id"
                required
                defaultValue={initialData?.kategori_id || categories[0]?.id}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nama}
                  </option>
                ))}
              </select>
            </div>

            {isAdmin ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Status Publikasi</label>
                  <select
                    name="status"
                    defaultValue={initialData?.status || "PUBLISHED"}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                  >
                    <option value="PUBLISHED">PUBLISHED (Tayangkan di Portal)</option>
                    <option value="DRAFT">DRAFT (Simpan Konsep)</option>
                    <option value="ARCHIVED">ARCHIVED (Diarsipkan)</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-stone-100 space-y-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="adalah_utama"
                      defaultChecked={initialData?.adalah_utama}
                      className="rounded border-stone-300 text-[#E50914] focus:ring-[#E50914]"
                    />
                    <span className="text-stone-700">Tampilkan di Hero Slider (Headline)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="adalah_pilihan"
                      defaultChecked={initialData?.adalah_pilihan}
                      className="rounded border-stone-300 text-[#E50914] focus:ring-[#E50914]"
                    />
                    <span className="text-stone-700">Berita Pilihan Redaksi</span>
                  </label>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 space-y-1">
                  <p className="font-bold">Alur Pengajuan Wartawan:</p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Naskah yang Anda kirim akan berstatus <strong>DRAFT (Diajukan)</strong> dan terkunci otomatis untuk menunggu persetujuan Redaksi / Admin sebelum tayang di portal.
                  </p>
                </div>
                <input type="hidden" name="status" value="DRAFT" />
              </div>
            )}
          </div>

          {/* Cover Image Upload Box */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-2">
              Gambar Sampul Berita
            </h3>

            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
              <Image
                src={coverImage}
                alt="Pratinjau Sampul"
                fill
                className="object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-white text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                  <span>Mengompres &amp; Mengunggah...</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block w-full text-center px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 rounded-lg text-xs font-bold transition-all cursor-pointer border border-stone-200">
                <span className="inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pilih &amp; Unggah Gambar Sampul</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[10px] text-stone-500 text-center">
                Otomatis dikonversi ke WebP &amp; dikompresi (Maks. 100KB - 140KB)
              </p>
            </div>

            {/* Manual Cover URL fallback */}
            <div className="pt-2 border-t border-stone-100">
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Atau Tempel URL Gambar:
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="https://... atau /images/..."
                  value={manualCoverUrl}
                  onChange={(e) => setManualCoverUrl(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#E50914]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (manualCoverUrl.trim()) {
                      setCoverImage(manualCoverUrl.trim());
                      setManualCoverUrl("");
                    }
                  }}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 text-xs font-semibold rounded cursor-pointer transition-colors"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>

          {/* Daftar Komentar Disimpan Disamping Form Berita */}
          {initialData?.id && (
            <div id="komentar-section" className="transition-all rounded-xl">
              <AdminArticleComments
                artikelId={initialData.id}
                artikelJudul={initialData.judul}
              />
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
