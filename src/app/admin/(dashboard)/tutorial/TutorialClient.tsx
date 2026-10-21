"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Shield,
  Users,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  Printer,
  Sparkles,
  Lock,
  Unlock,
  MessageSquare,
  ImageIcon,
  Settings,
  Layers,
  ArrowRight,
  ShieldAlert,
  Flame,
  Award,
} from "lucide-react";

interface RolePermissionInfo {
  role: string;
  badgeColor: string;
  description: string;
  scope: string;
  canCreateOwnArticle: boolean;
  canViewAllArticles: boolean;
  canPublishArticle: boolean;
  canUnlockArticle: boolean;
  canAccessTrash: boolean;
  canPrintKoranPDF: boolean;
  canManageAds: boolean;
  canEditStaticPages: boolean;
  canManageUsers: boolean;
  canEditSettings: boolean;
  canModerateComments: boolean;
  keyResponsibilities: string[];
}

const ROLES_DATA: RolePermissionInfo[] = [
  {
    role: "Super Admin (Owner)",
    badgeColor: "bg-[#7F0000] text-white border-red-900",
    description: "Pemilik sistem dan administrator tertinggi portal dengan hak akses tak terbatas (Wildcard '*').",
    scope: "Seluruh Modul & Konfigurasi Sistem",
    canCreateOwnArticle: true,
    canViewAllArticles: true,
    canPublishArticle: true,
    canUnlockArticle: true,
    canAccessTrash: true,
    canPrintKoranPDF: true,
    canManageAds: true,
    canEditStaticPages: true,
    canManageUsers: true,
    canEditSettings: true,
    canModerateComments: true,
    keyResponsibilities: [
      "Mengelola akun pengguna, hak akses, dan menetapkan peran jurnalis.",
      "Buka/tutup kunci edit naskah yang telah diajukan oleh wartawan/reporter.",
      "Akses kotak sampah (Trash Tab) untuk pemulihan atau penghapusan permanen berita.",
      "Membuat dan mencetak lembar edisi koran fisik PDF format A4 berwarna.",
      "Mengatur banner iklan sponsor mitra (karangan bunga, banner strip, dll).",
      "Memoderasi dan menghapus komentar atau balasan anonim yang melanggar aturan.",
      "Konfigurasi identitas media, kontak WhatsApp redaksi, dan halaman regulasi.",
    ],
  },
  {
    role: "Pemimpin Redaksi (Pemred)",
    badgeColor: "bg-red-800 text-white border-red-700",
    description: "Penanggung jawab utama isi berita portal dan kebijakan pemberitaan redaksional.",
    scope: "Modul Berita, Slider, Rubrik Kategori, Regulasi, dan Pemantauan User",
    canCreateOwnArticle: true,
    canViewAllArticles: true,
    canPublishArticle: true,
    canUnlockArticle: false,
    canAccessTrash: false,
    canPrintKoranPDF: false,
    canManageAds: false,
    canEditStaticPages: true,
    canManageUsers: false,
    canEditSettings: false,
    canModerateComments: true,
    keyResponsibilities: [
      "Memverifikasi naskah masuk dari wartawan sebelum dinyatakan layak terbit.",
      "Menetapkan berita yang tampil pada Headline Slider Utama dan Berita Pilihan.",
      "Mengelola kanal rubrik berita (Hukum, Patroli, Lalu Lintas, Politik, Sosial).",
      "Memperbarui naskah Susunan Redaksi dan Pedoman Media Siber Dewan Pers.",
      "Melihat daftar jurnalis dan memantau produktivitas peliputan tim.",
    ],
  },
  {
    role: "Redaktur Pelaksana / Editor",
    badgeColor: "bg-amber-600 text-white border-amber-700",
    description: "Pemeriksa tata bahasa, kurator fakta jurnalistik 5W+1H, dan penerbit naskah liputan.",
    scope: "Pembuatan & Penyuntingan Berita, Penerbitan Naskah, Pembaca Kategori",
    canCreateOwnArticle: true,
    canViewAllArticles: false,
    canPublishArticle: true,
    canUnlockArticle: false,
    canAccessTrash: false,
    canPrintKoranPDF: false,
    canManageAds: false,
    canEditStaticPages: false,
    canManageUsers: false,
    canEditSettings: false,
    canModerateComments: false,
    keyResponsibilities: [
      "Menyunting naskah liputan dari reporter sesuai kaidah PUEBI & Kode Etik Jurnalistik.",
      "Memastikan gambar sampul telah terkompresi WebP dan memiliki atribusi yang jelas.",
      "Mengubah status naskah dari DRAFT menjadi PUBLISHED (tayang ke pembaca).",
      "Berkoordinasi dengan Super Admin jika ada naskah yang memerlukan revisi penulis.",
    ],
  },
  {
    role: "Reporter / Wartawan Lapangan",
    badgeColor: "bg-stone-800 text-amber-300 border-stone-700",
    description: "Kontributor berita lapangan dan penyusun draf liputan dari berbagai biro daerah.",
    scope: "Hanya Dashboard Ringkas & Kelola Berita Milik Sendiri",
    canCreateOwnArticle: true,
    canViewAllArticles: false,
    canPublishArticle: false,
    canUnlockArticle: false,
    canAccessTrash: false,
    canPrintKoranPDF: false,
    canManageAds: false,
    canEditStaticPages: false,
    canManageUsers: false,
    canEditSettings: false,
    canModerateComments: false,
    keyResponsibilities: [
      "Menulis draf berita liputan peristiwa secara cepat, akurat, dan berimbang.",
      "Mengunggah foto kejadian asli (otomatis dikompresi menjadi WebP 100-140KB).",
      "Mengajukan draf berita ke meja redaksi. Naskah otomatis terkunci setelah diajukan.",
      "Hanya dapat melihat dan mengelola artikel yang ia tulis sendiri.",
      "Menu sensitif (Pengguna, Iklan, Halaman Statis, Pengaturan) otomatis disembunyikan.",
    ],
  },
  {
    role: "Manajer Iklan (Sponsorship)",
    badgeColor: "bg-blue-700 text-white border-blue-800",
    description: "Pengelola penempatan materi promosi mitra bisnis dan kerjasama periklanan.",
    scope: "Banner Iklan, Kontak Kerjasama, & Penempatan Sponsor",
    canCreateOwnArticle: false,
    canViewAllArticles: false,
    canPublishArticle: false,
    canUnlockArticle: false,
    canAccessTrash: false,
    canPrintKoranPDF: false,
    canManageAds: true,
    canEditStaticPages: false,
    canManageUsers: false,
    canEditSettings: true,
    canModerateComments: false,
    keyResponsibilities: [
      "Mengunggah banner promosi karangan bunga mitra dan sponsor di slot portal.",
      "Menentukan penempatan iklan (Sidebar, Strip Beranda, Atas Berita, Footer).",
      "Mengatur tautan pesanan WhatsApp dan masa tayang iklan aktif.",
    ],
  },
];

export default function TutorialClient() {
  const [activeTab, setActiveTab] = useState<"ROLES" | "ALUR_BERITA" | "KORAN_PDF" | "KOMPRESI_GAMBAR" | "KOMENTAR">("ROLES");
  const [selectedRole, setSelectedRole] = useState<string>("Super Admin (Owner)");

  const currentRoleData = ROLES_DATA.find((r) => r.role === selectedRole) || ROLES_DATA[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#7F0000] to-[#E50914] flex items-center justify-center text-white shadow-md shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-stone-900">
                Buku Tutorial &amp; Panduan Hak Akses
              </h1>
              <span className="text-[10px] bg-red-50 text-[#7F0000] font-bold px-2.5 py-0.5 rounded-full border border-red-200">
                Super Admin Eksklusif
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Dokumentasi komprehensif wewenang tiap peran pengguna, alur verifikasi berita, kompresi WebP, cetak koran A4, dan moderasi komentar.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/berita"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
          >
            <span>Buka Berita</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/admin/pengguna"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#E50914] hover:bg-[#B91C1C] text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Kelola Pengguna</span>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("ROLES")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "ROLES"
              ? "bg-[#7F0000] text-white shadow-xs"
              : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>1. Hak Akses &amp; Wewenang Setiap Peran</span>
        </button>

        <button
          onClick={() => setActiveTab("ALUR_BERITA")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "ALUR_BERITA"
              ? "bg-[#7F0000] text-white shadow-xs"
              : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>2. Alur Penerbitan &amp; Kunci Naskah</span>
        </button>

        <button
          onClick={() => setActiveTab("KORAN_PDF")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "KORAN_PDF"
              ? "bg-[#7F0000] text-white shadow-xs"
              : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200"
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>3. Panduan Cetak Koran PDF A4</span>
        </button>

        <button
          onClick={() => setActiveTab("KOMPRESI_GAMBAR")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "KOMPRESI_GAMBAR"
              ? "bg-[#7F0000] text-white shadow-xs"
              : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>4. Kompresi Otomatis WebP 100-140KB</span>
        </button>

        <button
          onClick={() => setActiveTab("KOMENTAR")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "KOMENTAR"
              ? "bg-[#7F0000] text-white shadow-xs"
              : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>5. Moderasi Komentar &amp; Balasan</span>
        </button>
      </div>

      {/* ====================================================================== */}
      {/* TAB 1: ROLES & PERMISSIONS */}
      {/* ====================================================================== */}
      {activeTab === "ROLES" && (
        <div className="space-y-6">
          {/* Role selector pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {ROLES_DATA.map((r) => (
              <button
                key={r.role}
                onClick={() => setSelectedRole(r.role)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedRole === r.role
                    ? "bg-red-50 border-red-400 text-[#7F0000] shadow-xs ring-1 ring-red-400"
                    : "bg-white border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Shield className="w-3.5 h-3.5 text-[#E50914]" />
                  <span className="font-bold text-xs">{r.role.split(" (")[0]}</span>
                </div>
                <span className="text-[10px] text-stone-500 line-clamp-1">{r.scope}</span>
              </button>
            ))}
          </div>

          {/* Active Role Detail Card */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-stone-900">{currentRoleData.role}</h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${currentRoleData.badgeColor}`}>
                    Role Terpilih
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1 max-w-2xl">{currentRoleData.description}</p>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-right">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">Cakupan Wilayah Akses:</span>
                <span className="text-xs font-bold text-stone-800">{currentRoleData.scope}</span>
              </div>
            </div>

            {/* Checklist Matrix */}
            <div>
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
                Kewenangan Modul Sistem:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-stone-100 bg-stone-50/60 flex items-center justify-between">
                  <span>Buat Berita Baru (Draf Sendiri)</span>
                  {currentRoleData.canCreateOwnArticle ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> BISA</span>
                  ) : (
                    <span className="text-stone-400 font-medium flex items-center gap-1"><XCircle className="w-4 h-4" /> TIDAK</span>
                  )}
                </div>

                <div className="p-3 rounded-lg border border-stone-100 bg-stone-50/60 flex items-center justify-between">
                  <span>Lihat Seluruh Berita Portal</span>
                  {currentRoleData.canViewAllArticles ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> BISA</span>
                  ) : (
                    <span className="text-amber-700 font-medium flex items-center gap-1"><HelpCircle className="w-4 h-4" /> HANYA MILIK SENDIRI</span>
                  )}
                </div>

                <div className="p-3 rounded-lg border border-stone-100 bg-stone-50/60 flex items-center justify-between">
                  <span>Terbitkan Berita (PUBLISH)</span>
                  {currentRoleData.canPublishArticle ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> BISA</span>
                  ) : (
                    <span className="text-stone-400 font-medium flex items-center gap-1"><XCircle className="w-4 h-4" /> TIDAK</span>
                  )}
                </div>

                <div className="p-3 rounded-lg border border-stone-100 bg-stone-50/60 flex items-center justify-between">
                  <span>Buka Kunci Edit Penulis (Unlock)</span>
                  {currentRoleData.canUnlockArticle ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> BISA</span>
                  ) : (
                    <span className="text-stone-400 font-medium flex items-center gap-1"><XCircle className="w-4 h-4" /> TIDAK</span>
                  )}
                </div>

                <div className="p-3 rounded-lg border border-stone-100 bg-stone-50/60 flex items-center justify-between">
                  <span>Kotak Sampah &amp; Hapus Permanen</span>
                  {currentRoleData.canAccessTrash ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> BISA</span>
                  ) : (
                    <span className="text-stone-400 font-medium flex items-center gap-1"><XCircle className="w-4 h-4" /> TIDAK</span>
                  )}
                </div>

                <div className="p-3 rounded-lg border border-stone-100 bg-stone-50/60 flex items-center justify-between">
                  <span>Cetak Koran PDF Format A4</span>
                  {currentRoleData.canPrintKoranPDF ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> BISA</span>
                  ) : (
                    <span className="text-stone-400 font-medium flex items-center gap-1"><XCircle className="w-4 h-4" /> TIDAK</span>
                  )}
                </div>

                <div className="p-3 rounded-lg border border-stone-100 bg-stone-50/60 flex items-center justify-between">
                  <span>Kelola Banner Iklan &amp; Mitra</span>
                  {currentRoleData.canManageAds ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> BISA</span>
                  ) : (
                    <span className="text-stone-400 font-medium flex items-center gap-1"><XCircle className="w-4 h-4" /> TIDAK</span>
                  )}
                </div>

                <div className="p-3 rounded-lg border border-stone-100 bg-stone-50/60 flex items-center justify-between">
                  <span>Sunting Halaman Statis / Regulasi</span>
                  {currentRoleData.canEditStaticPages ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> BISA</span>
                  ) : (
                    <span className="text-stone-400 font-medium flex items-center gap-1"><XCircle className="w-4 h-4" /> TIDAK</span>
                  )}
                </div>

                <div className="p-3 rounded-lg border border-stone-100 bg-stone-50/60 flex items-center justify-between">
                  <span>Manajemen Pengguna &amp; Akun</span>
                  {currentRoleData.canManageUsers ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> BISA</span>
                  ) : (
                    <span className="text-stone-400 font-medium flex items-center gap-1"><XCircle className="w-4 h-4" /> TIDAK</span>
                  )}
                </div>

                <div className="p-3 rounded-lg border border-stone-100 bg-stone-50/60 flex items-center justify-between">
                  <span>Pengaturan Portal &amp; Sosmed</span>
                  {currentRoleData.canEditSettings ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> BISA</span>
                  ) : (
                    <span className="text-stone-400 font-medium flex items-center gap-1"><XCircle className="w-4 h-4" /> TIDAK</span>
                  )}
                </div>

                <div className="p-3 rounded-lg border border-stone-100 bg-stone-50/60 flex items-center justify-between">
                  <span>Moderasi &amp; Hapus Komentar</span>
                  {currentRoleData.canModerateComments ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> BISA</span>
                  ) : (
                    <span className="text-stone-400 font-medium flex items-center gap-1"><XCircle className="w-4 h-4" /> TIDAK</span>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Responsibilities List */}
            <div className="pt-2">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5">
                Rincian Tanggung Jawab &amp; Operasional:
              </h3>
              <ul className="space-y-2 text-xs text-stone-700">
                {currentRoleData.keyResponsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-[#7F0000] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Full Role Comparison Table */}
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-stone-200 bg-stone-50">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-800">
                Tabel Matriks Perbandingan Hak Akses Seluruh Role
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#7F0000] text-white uppercase tracking-wider text-[10px] font-bold border-b border-red-900">
                  <tr>
                    <th className="py-3 px-4 text-white font-bold tracking-wider">Peran (Role)</th>
                    <th className="py-3 px-4 text-center text-white font-bold tracking-wider">Tulis Draf</th>
                    <th className="py-3 px-4 text-center text-white font-bold tracking-wider">Semua Berita</th>
                    <th className="py-3 px-4 text-center text-white font-bold tracking-wider">Terbitkan</th>
                    <th className="py-3 px-4 text-center text-white font-bold tracking-wider">Buka Kunci</th>
                    <th className="py-3 px-4 text-center text-white font-bold tracking-wider">Sampah / Hapus</th>
                    <th className="py-3 px-4 text-center text-white font-bold tracking-wider">Cetak Koran</th>
                    <th className="py-3 px-4 text-center text-white font-bold tracking-wider">Iklan Mitra</th>
                    <th className="py-3 px-4 text-center text-white font-bold tracking-wider">Kelola User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {ROLES_DATA.map((r) => (
                    <tr key={r.role} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-stone-900">{r.role}</td>
                      <td className="py-3.5 px-4 text-center">
                        {r.canCreateOwnArticle ? <span className="text-emerald-700 font-bold">✓</span> : <span className="text-stone-300">-</span>}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {r.canViewAllArticles ? <span className="text-emerald-700 font-bold">✓</span> : <span className="text-amber-600 text-[10px]">Hanya Sendiri</span>}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {r.canPublishArticle ? <span className="text-emerald-700 font-bold">✓</span> : <span className="text-stone-300">-</span>}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {r.canUnlockArticle ? <span className="text-emerald-700 font-bold">✓</span> : <span className="text-stone-300">-</span>}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {r.canAccessTrash ? <span className="text-emerald-700 font-bold">✓</span> : <span className="text-stone-300">-</span>}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {r.canPrintKoranPDF ? <span className="text-emerald-700 font-bold">✓</span> : <span className="text-stone-300">-</span>}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {r.canManageAds ? <span className="text-emerald-700 font-bold">✓</span> : <span className="text-stone-300">-</span>}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {r.canManageUsers ? <span className="text-emerald-700 font-bold">✓</span> : <span className="text-stone-300">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 2: ALUR PENERBITAN & KUNCI NASKAH */}
      {/* ====================================================================== */}
      {activeTab === "ALUR_BERITA" && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-black text-stone-900">
              Standar Operasional Prosedur (SOP) Penerbitan &amp; Mekanisme Kunci Naskah
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Untuk mencegah manipulasi fakta berita pasca diajukan ke redaksi, portal menerapkan sistem otomasi kunci edit.
            </p>
          </div>

          {/* Stepper Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 relative space-y-2">
              <span className="w-7 h-7 rounded-full bg-[#E50914] text-white font-bold text-xs flex items-center justify-center">1</span>
              <h4 className="font-bold text-xs text-stone-900">Wartawan Tulis Liputan</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Wartawan menulis fakta kejadian di menu Berita, memilih kategori, dan mengunggah foto lapangan.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 relative space-y-2">
              <span className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">2</span>
              <h4 className="font-bold text-xs text-stone-900">Diajukan &amp; Terkunci Otomatis</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Saat disimpan sebagai DRAFT/Diajukan, status kunci menjadi <strong>🔒 Terkunci</strong> agar naskah tidak berubah saat verifikasi.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 relative space-y-2">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">3</span>
              <h4 className="font-bold text-xs text-stone-900">Review Meja Redaksi</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Editor / Pemred memeriksa naskah. Jika ada koreksi berat, Super Admin dapat menekan tombol <strong>🔓 Buka Kunci</strong> agar wartawan bisa merevisi.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 relative space-y-2">
              <span className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">4</span>
              <h4 className="font-bold text-xs text-stone-900">Publikasi Tayang</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Naskah diubah statusnya menjadi <strong>PUBLISHED</strong> dan langsung tampil di portal web serta siap dibagikan ke media sosial.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-stone-600" />
              <span>Cara Menggunakan Tombol Kunci / Buka Kunci (Super Admin Only):</span>
            </h4>
            <p className="text-stone-600 leading-relaxed">
              Buka menu <strong>Kelola Berita</strong>. Pada kolom <em>Aksi</em> setiap baris berita, terdapat ikon gembok hijau/abu-abu. Klik ikon gembok tersebut untuk mengizinkan penulis menyunting kembali (status menjadi <em>Edit Dibuka</em>) atau menguncinya kembali.
            </p>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 3: CETAK KORAN PDF A4 */}
      {/* ====================================================================== */}
      {activeTab === "KORAN_PDF" && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-black text-stone-900">
              Panduan Pembuatan &amp; Pencetakan Lembar Edisi Koran PDF Ukuran A4 Multi-Halaman
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Portal dilengkapi engine tata letak koran fleksibel dengan banner header khusus gambar resmi redaksi, fitur drag &amp; drop, penyesuaian lebar kotak, pengisian ruang kosong, dan format teks 1-4 kolom.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#7F0000] text-white flex items-center justify-center font-bold">1</div>
              <h4 className="font-bold text-stone-900">Multi-Halaman A4</h4>
              <p className="text-stone-600 leading-relaxed">
                Anda dapat membuat beberapa halaman sekaligus (Cover Edisi Utama, Halaman Berita Daerah, Galeri, Opini). Klik <strong>+ Tambah Halaman Baru</strong> untuk menambah lembaran koran berikutnya.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#7F0000] text-white flex items-center justify-center font-bold">2</div>
              <h4 className="font-bold text-stone-900">Drag &amp; Drop &amp; Resize Kotak</h4>
              <p className="text-stone-600 leading-relaxed">
                Tahan ikon <strong>Grip (⠿)</strong> pada setiap kotak untuk memindahkan posisinya secara bebas. Gunakan tombol <strong>[-]</strong> dan <strong>[+]</strong> untuk mengubah lebar kotak (1/4, 1/3, 1/2, 2/3, 3/4, hingga Penuh).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#7F0000] text-white flex items-center justify-center font-bold">3</div>
              <h4 className="font-bold text-stone-900">Isi Ruang Kosong &amp; Teks Kolom</h4>
              <p className="text-stone-600 leading-relaxed">
                Bila terdapat ruang kosong pada baris koran, muncul slot bertitik kuning <strong>&quot;+ Isi Ruang Kosong Ini&quot;</strong>. Klik slot tersebut untuk menambahkan Teks Berita Multi-Kolom (1, 2, 3, atau 4 Kolom) atau Berita Foto.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#7F0000] text-white flex items-center justify-center font-bold">4</div>
              <h4 className="font-bold text-stone-900">Simpan &amp; Ekspor PDF A4</h4>
              <p className="text-stone-600 leading-relaxed">
                Klik <strong>Simpan Edisi</strong> ke basis data, lalu klik <strong>Cetak / Unduh PDF A4</strong>. Seluruh halaman koran akan langsung tercetak presisi di kertas ukuran A4.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 4: KOMPRESI GAMBAR WEBP */}
      {/* ====================================================================== */}
      {activeTab === "KOMPRESI_GAMBAR" && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-black text-stone-900">
              Otomasi Kompresi Gambar Berbasis Sharp (Maksimal 100KB - 140KB WebP)
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Setiap kali jurnalis mengunggah foto kejadian dari kamera DSLR atau HP (sering berukuran 3MB - 10MB), server secara otomatis mengoptimalkannya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2.5">
              <h4 className="font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Bagaimana Sistem Bekerja di Latar Belakang?</span>
              </h4>
              <p className="text-stone-600 leading-relaxed">
                Server menjalankan library image processing modern <strong>Sharp</strong> di endpoint <code className="bg-stone-200 px-1 py-0.5 rounded text-[11px]">/api/upload</code>:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-stone-600">
                <li>Mengubah resolusi maks lebar 1200px (format landscape 16:9 yang ideal untuk web berita).</li>
                <li>Mengonversi format JPG/PNG menjadi WebP modern dengan kompresi cerdas.</li>
                <li>Target bobot file ditekan di kisaran 100KB - 140KB tanpa mengorbankan ketajaman mata.</li>
                <li>Hasilnya: Pembaca di daerah dengan koneksi seluler hemat kuota dapat membuka portal dalam hitungan milidetik.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2.5">
              <h4 className="font-bold text-stone-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Tips Memilih Foto Jurnalistik Berkualitas:</span>
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-stone-600">
                <li>Gunakan foto orientasi mendatar (landscape).</li>
                <li>Pastikan subjek utama (personel, objek penindakan, atau narasumber) berada di tengah frame.</li>
                <li>Hindari watermark pihak ketiga atau screenshot teks yang buram.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 5: MODERASI KOMENTAR */}
      {/* ====================================================================== */}
      {activeTab === "KOMENTAR" && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-black text-stone-900">
              Sistem Komentar Pembaca, Balasan Bertingkat, &amp; Moderasi Admin
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Portal menyediakan ruang partisipasi publik dengan fitur komentar &amp; balasan anonim, dilengkapi kendali moderasi penuh oleh Super Admin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2.5">
              <h4 className="font-bold text-stone-900">Fitur untuk Pembaca Portal</h4>
              <ul className="list-disc pl-4 space-y-1.5 text-stone-600">
                <li>Pengunjung dapat berkomentar dengan mengisi Nama Lengkap atau memilih opsi <strong>Anonim / Samaran</strong>.</li>
                <li>Pengunjung lain dapat membalas komentar tersebut secara bertingkat (nested replies).</li>
                <li>Dilengkapi perlindungan anti-spam sederhana dan verifikasi captcha dasar.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2.5">
              <h4 className="font-bold text-stone-900">Kendali &amp; Tindakan Super Admin</h4>
              <ul className="list-disc pl-4 space-y-1.5 text-stone-600">
                <li>Super Admin dapat melihat jumlah komentar pada setiap artikel di tabel berita.</li>
                <li>Klik tombol <strong>Kelola Komentar (💬)</strong> di baris berita atau pada formulir edit berita.</li>
                <li>Admin dapat menghapus komentar atau balasan yang mengandung ujaran kebencian, hoax, atau SARA hanya dengan 1 klik.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
