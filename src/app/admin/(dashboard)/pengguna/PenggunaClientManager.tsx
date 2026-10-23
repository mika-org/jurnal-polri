"use client";

import React, { useState } from "react";
import { Plus, CheckCircle, XCircle, User, Shield, Trash2, Edit, KeyRound } from "lucide-react";
import { formatTanggalWaktu } from "@/lib/utils";
import {
  tambahPengguna,
  editPengguna,
  ubahPasswordPengguna,
  toggleStatusPengguna,
  hapusPengguna,
} from "@/app/actions/pengguna";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

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
    slug: string;
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
  // Modal Tambah
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Modal Edit
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Modal Ubah Password
  const [passwordUser, setPasswordUser] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Custom In-App Confirm Dialog (Menggantikan Alert/Confirm Browser)
  const [confirmState, setConfirmState] = useState<{
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
    variant: "warning",
    action: async () => {},
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Submit Tambah Pengguna
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

  // Submit Edit Pengguna
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditLoading(true);
    setEditError("");

    const formData = new FormData(e.currentTarget);
    formData.append("id", editingUser.id);

    try {
      await editPengguna(formData);
      setEditingUser(null);
      window.location.reload();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Gagal memperbarui pengguna");
    } finally {
      setEditLoading(false);
    }
  };

  // Submit Ubah Password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUser) return;
    setPasswordError("");

    if (newPassword.length < 6) {
      setPasswordError("Kata sandi baru minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi kata sandi tidak cocok");
      return;
    }

    setPasswordLoading(true);
    try {
      await ubahPasswordPengguna(passwordUser.id, newPassword);
      setPasswordUser(null);
      setNewPassword("");
      setConfirmPassword("");
      alert("Kata sandi berhasil diperbarui!");
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : "Gagal mengubah kata sandi");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Request Confirmation for Status Toggle
  const requestToggle = (id: string, nama: string, currentStatus: boolean) => {
    setConfirmState({
      isOpen: true,
      title: currentStatus ? "Nonaktifkan Akun Pengguna" : "Aktifkan Akun Pengguna",
      message: `Apakah Anda yakin ingin ${currentStatus ? "menonaktifkan" : "mengaktifkan"} akses akun "${nama}"?`,
      confirmText: currentStatus ? "Ya, Nonaktifkan" : "Ya, Aktifkan",
      variant: currentStatus ? "warning" : "warning",
      action: async () => {
        setConfirmLoading(true);
        try {
          await toggleStatusPengguna(id);
          window.location.reload();
        } catch (err: unknown) {
          alert(err instanceof Error ? err.message : "Gagal mengubah status");
        } finally {
          setConfirmLoading(false);
        }
      },
    });
  };

  // Request Confirmation for Delete User
  const requestDelete = (id: string, nama: string) => {
    setConfirmState({
      isOpen: true,
      title: "Hapus Akun Pengguna",
      message: `PERINGATAN: Apakah Anda yakin ingin menghapus akun "${nama}" secara permanen? Semua data artikel yang ditulis oleh pengguna ini akan tetap aman dan dialihkan ke akun Anda. Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Ya, Hapus Akun",
      variant: "danger",
      action: async () => {
        setConfirmLoading(true);
        try {
          await hapusPengguna(id);
          window.location.reload();
        } catch (err: unknown) {
          alert(err instanceof Error ? err.message : "Gagal menghapus pengguna");
        } finally {
          setConfirmLoading(false);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900">
            Pengguna &amp; Hak Akses
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Kelola akun, hak akses Super Admin, Wartawan, ubah kata sandi, dan status aktif.
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg("");
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 bg-[#E50914] hover:bg-[#B91C1C] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#7F0000] text-white uppercase tracking-wider text-[10px] font-bold border-b border-red-900">
              <tr>
                <th className="py-3 px-4 text-white font-bold tracking-wider">Pengguna</th>
                <th className="py-3 px-4 text-white font-bold tracking-wider">Email</th>
                <th className="py-3 px-4 text-white font-bold tracking-wider">Super Grup</th>
                <th className="py-3 px-4 text-white font-bold tracking-wider">Peran (Role)</th>
                <th className="py-3 px-4 text-white font-bold tracking-wider">Status</th>
                <th className="py-3 px-4 text-white font-bold tracking-wider">Terakhir Masuk</th>
                <th className="py-3 px-4 text-right text-white font-bold tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {users.map((u) => {
                const isSuperAdmin =
                  u.peran.slug === "owner" ||
                  u.peran.super_grup.nama.toLowerCase().includes("super admin");

                const isWartawan =
                  u.peran.super_grup.nama.toLowerCase().includes("wartawan") ||
                  u.peran.nama.toLowerCase().includes("wartawan") ||
                  u.peran.nama.toLowerCase().includes("reporter");

                return (
                  <tr key={u.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isSuperAdmin
                              ? "bg-red-700 text-white shadow-xs border border-red-800"
                              : isWartawan
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-red-50 text-[#7F0000] border border-red-200"
                          }`}
                        >
                          {isSuperAdmin ? <Shield className="w-4 h-4 text-amber-300" /> : u.nama_lengkap.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-stone-900 flex items-center gap-1.5">
                            <span>{u.nama_lengkap}</span>
                            {isSuperAdmin && (
                              <span className="text-[9px] bg-red-100 text-[#7F0000] font-black px-1.5 py-0.2 rounded border border-red-200">
                                SUPER ADMIN
                              </span>
                            )}
                            {u.id === currentUserId && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded border border-amber-200">
                                ANDA
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-stone-400 font-mono">
                            @{u.nama_pengguna}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">{u.email || "-"}</td>
                    <td className="py-3.5 px-4">
                      {isSuperAdmin ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-red-50 text-[#7F0000] border-red-200 inline-flex items-center gap-1">
                          <Shield className="w-3 h-3 text-[#E50914]" />
                          <span>Super Admin</span>
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            isWartawan
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-red-50 text-[#7F0000] border-red-200"
                          }`}
                        >
                          {u.peran.super_grup.nama}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-stone-900">
                      {isSuperAdmin ? (
                        <span className="font-bold text-[#7F0000]">
                          Super Admin (Akses Penuh)
                        </span>
                      ) : (
                        u.peran.nama
                      )}
                      {isWartawan && (
                        <span className="block text-[9px] text-stone-400 font-normal">
                          (Hanya buat &amp; kelola berita)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.aktif ? (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" />
                          <span>AKTIF</span>
                        </span>
                      ) : (
                        <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200 flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3" />
                          <span>NONAKTIF</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500">
                      {u.terakhir_masuk ? formatTanggalWaktu(u.terakhir_masuk) : "Belum pernah"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Pengguna */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditError("");
                            setEditingUser(u);
                          }}
                          className="p-1.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors cursor-pointer"
                          title="Edit Data Pengguna"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Ubah Password */}
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordError("");
                            setNewPassword("");
                            setConfirmPassword("");
                            setPasswordUser(u);
                          }}
                          className="p-1.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors cursor-pointer"
                          title="Ubah Kata Sandi Akun"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Aktif / Nonaktif */}
                        {u.id !== currentUserId && (
                          <button
                            type="button"
                            onClick={() => requestToggle(u.id, u.nama_lengkap, u.aktif)}
                            className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer border ${
                              u.aktif
                                ? "bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-200"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                            }`}
                            title={u.aktif ? "Nonaktifkan akun" : "Aktifkan akun"}
                          >
                            {u.aktif ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        )}

                        {/* Hapus Pengguna */}
                        {u.id !== currentUserId && (
                          <button
                            type="button"
                            onClick={() => requestDelete(u.id, u.nama_lengkap)}
                            className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                            title="Hapus Akun Pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: TAMBAH PENGGUNA */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-stone-900">
            <h3 className="text-base font-bold text-stone-900 mb-1 flex items-center gap-2">
              <User className="w-4 h-4 text-[#E50914]" />
              <span>Tambah Pengguna Baru</span>
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Pilih hak akses: Super Admin (akses sistem penuh) atau Wartawan (khusus membuat berita).
            </p>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs mb-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-600 font-semibold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  name="nama_lengkap"
                  required
                  placeholder="misal: Bripka Ahmad Supriyadi"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Nama Pengguna (Username)</label>
                  <input
                    type="text"
                    name="nama_pengguna"
                    required
                    placeholder="misal: ahmad_wartawan"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Email (Opsional)</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="email@jurnalpolisi.id"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">Kata Sandi</label>
                <input
                  type="password"
                  name="kata_sandi"
                  required
                  placeholder="Minimal 6 karakter..."
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">Grup &amp; Peran Hak Akses</label>
                <select
                  name="peran_id"
                  required
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                >
                  {roles.map((r) => {
                    const isSA =
                      r.slug === "owner" ||
                      r.super_grup.nama.toLowerCase().includes("super admin");
                    return (
                      <option key={r.id} value={r.id}>
                        {isSA
                          ? "Super Admin (Akses Penuh Seluruh Sistem & Modul)"
                          : `${r.super_grup.nama} - ${r.nama}`}{" "}
                        {r.slug === "wartawan" ? "(Hanya buat & kelola berita)" : ""}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[10px] text-stone-500 mt-1">
                  Wartawan hanya memiliki hak akses membuat &amp; mengelola naskah liputan berita.
                </p>
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
                  {loading ? "Menyimpan..." : "Simpan Pengguna"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: EDIT DATA PENGGUNA */}
      {/* ========================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-stone-900">
            <h3 className="text-base font-bold text-stone-900 mb-1 flex items-center gap-2">
              <Edit className="w-4 h-4 text-amber-600" />
              <span>Edit Data Pengguna</span>
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Perbarui nama lengkap, username, email, dan peran hak akses pengguna.
            </p>

            {editError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs mb-4">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-600 font-semibold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  name="nama_lengkap"
                  required
                  defaultValue={editingUser.nama_lengkap}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Nama Pengguna (Username)</label>
                  <input
                    type="text"
                    name="nama_pengguna"
                    required
                    defaultValue={editingUser.nama_pengguna}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingUser.email || ""}
                    placeholder="email@jurnalpolisi.id"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">Grup &amp; Peran Hak Akses</label>
                <select
                  name="peran_id"
                  required
                  defaultValue={editingUser.peran.id}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                >
                  {roles.map((r) => {
                    const isSA =
                      r.slug === "owner" ||
                      r.super_grup.nama.toLowerCase().includes("super admin");
                    return (
                      <option key={r.id} value={r.id}>
                        {isSA
                          ? "Super Admin (Akses Penuh Seluruh Sistem & Modul)"
                          : `${r.super_grup.nama} - ${r.nama}`}{" "}
                        {r.slug === "wartawan" ? "(Hanya buat & kelola berita)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-lg cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 bg-[#E50914] hover:bg-[#B91C1C] text-white font-bold rounded-lg cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
                >
                  {editLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: UBAH PASSWORD PENGGUNA */}
      {/* ========================================================= */}
      {passwordUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-stone-900">
            <h3 className="text-base font-bold text-stone-900 mb-1 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>Ubah Kata Sandi Akun</span>
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Atur kata sandi baru untuk akun <strong>{passwordUser.nama_lengkap}</strong> (@{passwordUser.nama_pengguna}).
            </p>

            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs mb-4">
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-600 font-semibold mb-1">Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter..."
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">Konfirmasi Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru..."
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setPasswordUser(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-lg cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
                >
                  {passwordLoading ? "Menyimpan..." : "Perbarui Kata Sandi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: IN-APP CONFIRM DIALOG (Menggantikan confirm browser) */}
      {/* ========================================================= */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        variant={confirmState.variant}
        isLoading={confirmLoading}
        onConfirm={async () => {
          await confirmState.action();
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
