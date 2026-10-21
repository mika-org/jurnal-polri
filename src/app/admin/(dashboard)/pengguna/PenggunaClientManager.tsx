"use client";

import React, { useState } from "react";
import { Plus, CheckCircle, XCircle, User } from "lucide-react";
import { formatTanggalWaktu } from "@/lib/utils";
import { tambahPengguna, toggleStatusPengguna } from "@/app/actions/pengguna";

interface PeranOption {
  id: string;
  nama: string;
  slug: string;
  super_grup: {
    nama: string;
    slug: string;
  };
}

interface UserItem {
  id: string;
  nama_pengguna: string;
  nama_lengkap: string;
  email: string | null;
  aktif: boolean;
  terakhir_masuk: Date | string | null;
  peran: {
    id: string;
    nama: string;
    super_grup: {
      nama: string;
    };
  };
}

interface PenggunaClientManagerProps {
  users: UserItem[];
  roles: PeranOption[];
  currentUserId: string;
}

export default function PenggunaClientManager({
  users,
  roles,
  currentUserId,
}: PenggunaClientManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    try {
      await tambahPengguna(formData);
      setIsModalOpen(false);
      window.location.reload();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal menambahkan pengguna");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, nama: string) => {
    if (confirm(`Ubah status aktif akun "${nama}"?`)) {
      try {
        await toggleStatusPengguna(id);
        window.location.reload();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Gagal mengubah status");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Pengguna &amp; Hak Akses
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Grup Hak Akses: Super Admin (Akses Penuh) &amp; Wartawan (Hanya Buat Berita)
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg("");
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 bg-[#E50914] hover:bg-[#B91C1C] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      <div className="bg-[#180C0C] border border-[#2C1414] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1E1010] text-stone-400 uppercase tracking-wider text-[10px] border-b border-[#2C1414]">
              <tr>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Super Grup</th>
                <th className="py-3 px-4">Peran (Role)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Terakhir Masuk</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C1414] text-stone-300">
              {users.map((u) => {
                const isWartawan =
                  u.peran.super_grup.nama.toLowerCase().includes("wartawan") ||
                  u.peran.nama.toLowerCase().includes("wartawan") ||
                  u.peran.nama.toLowerCase().includes("reporter");

                return (
                  <tr key={u.id} className="hover:bg-[#200F0F] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isWartawan
                              ? "bg-amber-950 text-amber-300 border border-amber-800"
                              : "bg-[#7F0000] text-amber-300 border border-red-500/30"
                          }`}
                        >
                          {u.nama_lengkap.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{u.nama_lengkap}</p>
                          <p className="text-[10px] text-stone-500 font-mono">
                            @{u.nama_pengguna}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-400">{u.email || "-"}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          isWartawan
                            ? "bg-amber-950/40 text-amber-300 border-amber-800/60"
                            : "bg-[#2A1212] text-amber-300 border-amber-900/50"
                        }`}
                      >
                        {u.peran.super_grup.nama}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-stone-200">
                      {u.peran.nama}
                      {isWartawan && (
                        <span className="block text-[9px] text-stone-500 font-normal">
                          (Hanya buat &amp; kelola berita)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.aktif ? (
                        <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" />
                          <span>AKTIF</span>
                        </span>
                      ) : (
                        <span className="bg-red-950 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded border border-red-800 flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3" />
                          <span>NONAKTIF</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-stone-400">
                      {u.terakhir_masuk ? formatTanggalWaktu(u.terakhir_masuk) : "Belum pernah"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.id !== currentUserId && (
                        <button
                          onClick={() => handleToggle(u.id, u.nama_lengkap)}
                          className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                            u.aktif
                              ? "bg-red-950/60 text-red-300 hover:bg-red-900/80"
                              : "bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/80"
                          }`}
                        >
                          {u.aktif ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Pengguna */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E1010] border border-[#3E1A1A] rounded-2xl max-w-md w-full p-6 shadow-2xl text-stone-200">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <User className="w-4 h-4 text-red-400" />
              <span>Tambah Pengguna Baru</span>
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              Pilih hak akses: Super Admin (akses sistem penuh) atau Wartawan (khusus membuat berita).
            </p>

            {errorMsg && (
              <div className="bg-red-950/80 border border-red-800 text-red-200 px-3 py-2 rounded-lg text-xs mb-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  name="nama_lengkap"
                  required
                  placeholder="misal: Bripka Ahmad Supriyadi"
                  className="w-full px-3 py-2 bg-[#120808] border border-[#2C1414] rounded-lg text-white placeholder-stone-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">Nama Pengguna (Username)</label>
                  <input
                    type="text"
                    name="nama_pengguna"
                    required
                    placeholder="misal: ahmad_wartawan"
                    className="w-full px-3 py-2 bg-[#120808] border border-[#2C1414] rounded-lg text-white placeholder-stone-600 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Email (Opsional)</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="email@jurnalpolisi.id"
                    className="w-full px-3 py-2 bg-[#120808] border border-[#2C1414] rounded-lg text-white placeholder-stone-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Kata Sandi</label>
                <input
                  type="password"
                  name="kata_sandi"
                  required
                  placeholder="Minimal 6 karakter..."
                  className="w-full px-3 py-2 bg-[#120808] border border-[#2C1414] rounded-lg text-white placeholder-stone-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Grup &amp; Peran Hak Akses</label>
                <select
                  name="peran_id"
                  required
                  className="w-full px-3 py-2 bg-[#120808] border border-[#2C1414] rounded-lg text-white focus:outline-none focus:border-red-500"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.super_grup.nama} - {r.nama}{" "}
                      {r.slug === "wartawan" ? "(Hanya buat berita)" : ""}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-stone-400 mt-1">
                  Wartawan hanya memiliki hak akses membuat &amp; mengelola naskah liputan berita.
                </p>
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
                  {loading ? "Menyimpan..." : "Simpan Pengguna"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
