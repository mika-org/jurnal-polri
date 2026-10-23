"use client";

import React, { useState } from "react";
import { Save, Loader2, Check } from "lucide-react";
import { perbaruiPengaturan } from "@/app/actions/pengaturan";

export default function PengaturanClientForm({
  initialSettings,
}: {
  initialSettings: Record<string, string>;
}) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const formData = new FormData(e.currentTarget);
    try {
      await perbaruiPengaturan(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Gagal memperbarui pengaturan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
          Pengaturan Portal &amp; Informasi Kontak
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Sesuaikan data identitas situs, alamat kantor redaksi, dan nomor layanan aduan publik.
        </p>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4 shadow-xs">
        <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-2">
          Identitas Portal
        </h3>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">Nama Portal Berita</label>
          <input
            type="text"
            name="nama_portal"
            defaultValue={initialSettings.nama_portal || "JURNAL POLISI"}
            className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">Slogan / Tagline Resmi</label>
          <input
            type="text"
            name="tagline"
            defaultValue={
              initialSettings.tagline || "Media Informasi & Edukasi Kepolisian Terpercaya"
            }
            className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
          />
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4 shadow-xs">
        <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-2">
          Informasi Kontak Redaksi
        </h3>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">Alamat Kantor Redaksi</label>
          <textarea
            rows={2}
            name="alamat"
            defaultValue={
              initialSettings.alamat ||
              "Gedung Presisi Media Nusantara, Jl. Trunojoyo No. 3, Kebayoran Baru, Jakarta Selatan 12110"
            }
            className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Nomor Telepon Kantor</label>
            <input
              type="text"
              name="telepon"
              defaultValue={initialSettings.telepon || "(021) 7218000"}
              className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Email Resmi Redaksi</label>
            <input
              type="email"
              name="email"
              defaultValue={initialSettings.email || "redaksi@jurnalpolisi.id"}
              className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">WhatsApp Hotline / Iklan</label>
          <input
            type="text"
            name="whatsapp"
            defaultValue={initialSettings.whatsapp || "+62 812-3456-7890"}
            className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#B91C1C] text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4 text-emerald-300" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saved ? "Perubahan Disimpan!" : "Simpan Pengaturan"}</span>
        </button>
      </div>
    </form>
  );
}
