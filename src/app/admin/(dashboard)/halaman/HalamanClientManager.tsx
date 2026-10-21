"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Edit, Save, ExternalLink, Loader2, Check, Code, PenTool } from "lucide-react";
import { perbaruiHalaman } from "@/app/actions/halaman";
import CKEditor from "@/components/editor/CKEditor";

interface PageData {
  id: string;
  slug: string;
  judul: string;
  konten: string;
}

export default function HalamanClientManager({ pages }: { pages: PageData[] }) {
  const [selectedSlug, setSelectedSlug] = useState(pages[0]?.slug || "redaksi");
  const selectedPage = pages.find((p) => p.slug === selectedSlug) || pages[0];

  const [judul, setJudul] = useState(selectedPage?.judul || "");
  const [konten, setKonten] = useState(selectedPage?.konten || "");
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [editorMode, setEditorMode] = useState<"VISUAL" | "HTML">("VISUAL");

  const handleSelectPage = (slug: string) => {
    setSelectedSlug(slug);
    const p = pages.find((item) => item.slug === slug);
    if (p) {
      setJudul(p.judul);
      setKonten(p.konten);
      setSavedSuccess(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSavedSuccess(false);

    try {
      await perbaruiHalaman(selectedSlug, judul, konten);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      alert("Gagal memperbarui naskah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      {/* Left List of Pages */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider px-1 mb-2">
          Pilih Halaman
        </h2>
        {pages.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelectPage(p.slug)}
            className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              p.slug === selectedSlug
                ? "bg-red-50 border-red-300 text-[#7F0000] shadow-xs"
                : "bg-white border-stone-200 text-stone-700 hover:text-stone-900 hover:bg-stone-50 shadow-2xs"
            }`}
          >
            <p className="font-bold">{p.judul}</p>
            <p className="text-[10px] text-stone-400 font-mono mt-1">/{p.slug}</p>
          </button>
        ))}
      </div>

      {/* Editor Area */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7F0000] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Sunting: /{selectedSlug}
              </span>
              <Link
                href={`/${selectedSlug}`}
                target="_blank"
                className="text-stone-500 hover:text-stone-800 p-1 transition-colors"
                title="Lihat Pratinjau Publik"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#B91C1C] text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : savedSuccess ? (
                <Check className="w-4 h-4 text-emerald-300" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{savedSuccess ? "Tersimpan!" : "Simpan Perubahan"}</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Judul Dokumen
            </label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914]"
            />
          </div>

          <div>
            {/* Header Formatter with Mode Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Isi Konten Dokumen
              </label>

              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
                <button
                  type="button"
                  onClick={() => setEditorMode("VISUAL")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    editorMode === "VISUAL"
                      ? "bg-white text-stone-900 shadow-xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  <PenTool className="w-3 h-3 text-[#E50914]" />
                  <span>Formatter Visual (WYSIWYG)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode("HTML")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    editorMode === "HTML"
                      ? "bg-white text-stone-900 shadow-xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  <Code className="w-3 h-3 text-stone-600" />
                  <span>Kode HTML</span>
                </button>
              </div>
            </div>

            {/* Editor Switch */}
            {editorMode === "VISUAL" ? (
              <div className="space-y-1">
                <CKEditor
                  key={selectedSlug}
                  name="konten_editor"
                  initialValue={konten}
                  onChange={(val) => setKonten(val)}
                  placeholder="Tulis dan format dokumen di sini secara mudah..."
                />
                <p className="text-[11px] text-stone-500 pt-1">
                  Tips: Gunakan toolbar di atas untuk menebalkan teks, membuat judul (H2/H3), daftar poin, dan tabel tanpa perlu mengetik kode HTML.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <textarea
                  required
                  rows={16}
                  value={konten}
                  onChange={(e) => setKonten(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                  placeholder="Tulis format teks HTML langsung..."
                />
                <p className="text-[11px] text-stone-500 pt-1">
                  Mode Kode HTML aktif: Edit tag HTML langsung jika diperlukan.
                </p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
