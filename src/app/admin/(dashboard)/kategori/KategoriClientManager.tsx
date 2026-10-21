"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Edit, ExternalLink, Layers } from "lucide-react";
import { simpanKategori, hapusKategori } from "@/app/actions/kategori";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

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

  const handleDelete = (id: string, nama: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Hapus Kategori Berita",
      message: `Apakah Anda yakin ingin menghapus kategori "${nama}"? Artikel yang menggunakan kategori ini tidak akan dihapus.`,
      confirmText: "Ya, Hapus Kategori",
      variant: "danger",
      action: async () => {
        setConfirmLoading(true);
        try {
          await hapusKategori(id);
          setCategories((prev) => prev.filter((c) => c.id !== id));
        } catch {
          alert("Gagal menghapus kategori");
        } finally {
          setConfirmLoading(false);
        }
      },
    });
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
            Kategori Kanal Liputan
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Kelola pengelompokan rubrik berita dan navigasi portal berita Jurnal Polisi.
          </p>
        </div>

        <button
          onClick={() => {
            setEditItem(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 bg-[#E50914] hover:bg-[#B91C1C] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori Baru</span>
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#7F0000] text-white uppercase tracking-wider text-[10px] font-bold border-b border-red-900">
              <tr>
                <th className="py-3 px-4 text-white font-bold tracking-wider">Nama Kategori</th>
                <th className="py-3 px-4 text-white font-bold tracking-wider">Slug</th>
                <th className="py-3 px-4 text-white font-bold tracking-wider">Slogan</th>
                <th className="py-3 px-4 text-white font-bold tracking-wider">Kategori Cepat</th>
                <th className="py-3 px-4 text-white font-bold tracking-wider">Jumlah Artikel</th>
                <th className="py-3 px-4 text-right text-white font-bold tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-stone-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#E50914]" />
                    <span>{cat.nama}</span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-400 font-mono">
                    /{cat.slug}
                  </td>
                  <td className="py-3.5 px-4 text-stone-500">{cat.slogan || "-"}</td>
                  <td className="py-3.5 px-4">
                    {cat.tampil_di_cepat ? (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                        YA (Tampil di Beranda)
                      </span>
                    ) : (
                      <span className="text-stone-400 text-[10px]">TIDAK</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-stone-600">{cat._count.artikel}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/kategori/${cat.slug}`}
                        target="_blank"
                        className="p-1.5 rounded bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition-colors"
                        title="Lihat Halaman Kategori"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => {
                          setEditItem(cat);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 cursor-pointer transition-colors"
                        title="Sunting"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.nama)}
                        className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 cursor-pointer transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-stone-900">
            <h3 className="text-base font-bold text-stone-900 mb-4">
              {editItem ? "Sunting Kategori" : "Tambah Kategori Baru"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-600 font-semibold mb-1">Nama Kategori</label>
                <input
                  type="text"
                  name="nama"
                  required
                  defaultValue={editItem?.nama}
                  placeholder="misal: Tipikor, Narkoba, Cyber Crime"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">Slogan / Tagline</label>
                <input
                  type="text"
                  name="slogan"
                  defaultValue={editItem?.slogan || ""}
                  placeholder="misal: Penindakan Khusus & Terarah"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  name="tampil_di_cepat"
                  id="tampil-cepat-checkbox"
                  defaultChecked={editItem?.tampil_di_cepat}
                  className="rounded text-[#E50914] border-stone-300 focus:ring-[#E50914]"
                />
                <label htmlFor="tampil-cepat-checkbox" className="text-stone-700 cursor-pointer select-none">
                  Tampilkan di Kategori Cepat Beranda
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
                  {loading ? "Menyimpan..." : "Simpan"}
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
