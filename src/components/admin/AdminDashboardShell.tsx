"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Menu, X } from "lucide-react";
import AdminSidebarNav from "@/components/admin/AdminSidebarNav";

interface AdminDashboardShellProps {
  user: {
    nama_lengkap: string;
    roleName: string;
  };
  isSuperAdmin: boolean;
  isWartawan: boolean;
  logoutButton: React.ReactNode;
  children: React.ReactNode;
}

export default function AdminDashboardShell({
  user,
  isSuperAdmin,
  isWartawan,
  logoutButton,
  children,
}: AdminDashboardShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  const toggleMenu = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsMobileMenuOpen((prev) => !prev);
    } else {
      setIsDesktopSidebarOpen((prev) => !prev);
    }
  };

  return (
    <div className="h-dvh bg-[#F4F5F7] text-stone-900 flex flex-col md:flex-row relative overflow-hidden print:h-auto print:overflow-visible">
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-2xs md:hidden animate-fade-in print:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation (Drawer on Mobile, Fixed Full-Height on Desktop) */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 h-full w-64 bg-[#180C0C] border-r border-[#2C1414] text-stone-300 flex flex-col shrink-0 transition-all duration-200 ease-in-out print:hidden ${
          isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        } ${
          isDesktopSidebarOpen
            ? "md:translate-x-0 md:w-64"
            : "md:-translate-x-full md:w-0 md:border-r-0 md:overflow-hidden"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-[#2C1414] px-4 flex items-center justify-between shrink-0">
          <Link
            href="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2.5 min-w-0"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-black/40 border border-amber-400/30 shrink-0">
              <Image
                src="/images/logo-icon.png"
                alt="Logo Presisi"
                fill
                className="object-contain p-0.5"
              />
            </div>
            <div className="truncate">
              <span className="text-sm font-bold tracking-tight text-white block truncate">
                ADMIN PRESISI
              </span>
              <span className="text-[10px] text-stone-400 block -mt-0.5 truncate">
                Portal Jurnal Polisi
              </span>
            </div>
          </Link>

          {/* Close Button inside Sidebar */}
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              if (typeof window !== "undefined" && window.innerWidth >= 768) {
                setIsDesktopSidebarOpen(false);
              }
            }}
            aria-label="Tutup menu navigasi"
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#2A1212] transition-colors cursor-pointer"
            title="Tutup Menu Navigasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="p-4 border-b border-[#2C1414] bg-[#200F0F] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#7F0000] text-amber-300 flex items-center justify-center font-bold text-sm border border-red-500/30 shrink-0">
              {user.nama_lengkap.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {user.nama_lengkap}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-medium text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                  {user.roleName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <AdminSidebarNav
          isSuperAdmin={isSuperAdmin}
          isWartawan={isWartawan}
          onNavigate={() => setIsMobileMenuOpen(false)}
        />

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#2C1414] space-y-1 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-stone-400 hover:text-white hover:bg-[#2A1212] transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Lihat Web Publik</span>
            </span>
          </Link>

          {logoutButton}
        </div>
      </aside>

      {/* Main Content Area (Header Fixed, Only Main Scrolls) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-stone-50 text-stone-900 print:h-auto print:overflow-visible">
        <header className="h-16 border-b border-[#2C1414] bg-[#180C0C] px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 print:hidden">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger Menu Button */}
            <button
              type="button"
              onClick={toggleMenu}
              aria-label="Buka atau tutup menu navigasi"
              className="p-2 rounded-lg text-white hover:text-amber-300 hover:bg-[#2A1212] border border-[#3A1A1A] transition-colors cursor-pointer shrink-0 flex items-center justify-center"
              title="Buka / Tutup Menu Navigasi"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs sm:text-sm font-bold text-white truncate md:hidden">
                ADMIN PRESISI
              </span>
              <span className="hidden md:inline text-xs text-stone-400 truncate">
                Sistem Manajemen Konten &amp; Iklan Portal Berita
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
              {user.roleName}
            </span>
          </div>
        </header>

        <main className="p-3 sm:p-6 lg:p-8 flex-1 overflow-y-auto overflow-x-hidden bg-stone-50 text-stone-900 min-w-0 print:overflow-visible print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
