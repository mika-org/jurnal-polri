"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Edit, ExternalLink, Layers } from "lucide-react";
import { simpanKategori, hapusKategori } from "@/app/actions/kategori";

interface CategoryData {
  id: string;
  nama: string;
  slug: string;
  slogan: string | null;
  tampil_di_cepat: boolean;
  _count: { artikel: number };
}

export default function KategoriClientManager({
  initialCategories,
}: {
  initialCategories: CategoryData[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: string, nama: string) => {
    if (confirm(`Hapus kategori "${nama}"?`)) {
      try {
        await hapusKategori(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
      } catch {
        alert("Gagal menghapus kategori");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    if (editItem) {
      formData.set("id", editItem.id);
    }

    try {
      await simpanKategori(formData);
      setIsModalOpen(false);
      window.location.reload();
    } catch {
      alert("Gagal menyimpan kategori");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditItem(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 bg-[#E50914] hover:bg-[#B91C1C] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori Baru</span>
        </button>
      </div>

      <div className="bg-[#180C0C] border border-[#2C1414] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1E1010] text-stone-400 uppercase tracking-wider text-[10px] border-b border-[#2C1414]">
              <tr>
                <th className="py-3 px-4">Nama Kategori</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Slogan</th>
                <th className="py-3 px-4">Kategori Cepat</th>
                <th className="py-3 px-4">Jumlah Artikel</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C1414] text-stone-300">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#200F0F] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-red-400" />
                    <span>{cat.nama}</span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-400 font-mono">
                    /{cat.slug}
                  </td>
                  <td className="py-3.5 px-4 text-stone-400">{cat.slogan || "-"}</td>
                  <td className="py-3.5 px-4">
                    {cat.tampil_di_cepat ? (
                      <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-800">
                        YA (Tampil di Beranda)
                      </span>
                    ) : (
                      <span className="text-stone-500 text-[10px]">TIDAK</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono">{cat._count.artikel}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/kategori/${cat.slug}`}
                        target="_blank"
                        className="p-1.5 rounded bg-[#2A1212] text-stone-300 hover:text-white"
                        title="Lihat Halaman Kategori"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => {
                          setEditItem(cat);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded bg-amber-950/60 text-amber-300 hover:text-amber-200 cursor-pointer"
                        title="Sunting"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.nama)}
                        className="p-1.5 rounded bg-red-950/60 text-red-400 hover:text-red-300 cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E1010] border border-[#3E1A1A] rounded-2xl max-w-md w-full p-6 shadow-2xl text-stone-200">
            <h3 className="text-base font-bold text-white mb-4">
              {editItem ? "Sunting Kategori" : "Tambah Kategori Baru"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  name="nama"
                  required
                  defaultValue={editItem?.nama}
                  placeholder="misal: Tipikor, Narkoba, Cyber Crime"
                  className="w-full px-3 py-2 bg-[#120808] border border-[#2C1414] rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Slogan / Tagline</label>
                <input
                  type="text"
                  name="slogan"
                  defaultValue={editItem?.slogan || ""}
                  placeholder="misal: Penindakan Khusus & Terarah"
                  className="w-full px-3 py-2 bg-[#120808] border border-[#2C1414] rounded-lg text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  name="tampil_di_cepat"
                  id="tampil-cepat-checkbox"
                  defaultChecked={editItem?.tampil_di_cepat}
                  className="rounded text-[#E50914]"
                />
                <label htmlFor="tampil-cepat-checkbox" className="text-stone-300 cursor-pointer">
                  Tampilkan di Kategori Cepat Beranda
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
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
