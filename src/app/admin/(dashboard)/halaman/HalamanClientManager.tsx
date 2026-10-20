"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Edit, Save, ExternalLink, Loader2, Check } from "lucide-react";
import { perbaruiHalaman } from "@/app/actions/halaman";

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
        {pages.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelectPage(p.slug)}
            className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              p.slug === selectedSlug
                ? "bg-[#2A1212] border-[#7F0000] text-white shadow-sm"
                : "bg-[#180C0C] border-[#2C1414] text-stone-400 hover:text-white hover:bg-[#200F0F]"
            }`}
          >
            <p className="font-bold">{p.judul}</p>
            <p className="text-[10px] text-stone-500 font-mono mt-1">/{p.slug}</p>
          </button>
        ))}
      </div>

      {/* Editor Area */}
      <div className="bg-[#180C0C] border border-[#2C1414] rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2C1414]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Sunting Halaman: /{selectedSlug}
              </span>
              <Link
                href={`/${selectedSlug}`}
                target="_blank"
                className="text-stone-400 hover:text-white p-1"
                title="Lihat Pratinjau Publik"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#B91C1C] text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow cursor-pointer disabled:opacity-50"
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
            <label className="block text-xs text-stone-400 mb-1">Judul Dokumen</label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#120808] border border-[#2C1414] rounded-lg text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-stone-400 mb-1">
              Isi Konten (Format Teks HTML Didukung)
            </label>
            <textarea
              required
              rows={16}
              value={konten}
              onChange={(e) => setKonten(e.target.value)}
              className="w-full px-4 py-3 bg-[#120808] border border-[#2C1414] rounded-lg text-xs text-stone-200 font-mono leading-relaxed"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
