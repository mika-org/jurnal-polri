import React from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser, isSuperAdminUser } from "@/lib/auth";
import { ExternalLink, Shield } from "lucide-react";
import LogoutButton from "./LogoutButton";
import AdminSidebarNav from "@/components/admin/AdminSidebarNav";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/api/auth/logout?redirect=/admin/login");
  }

  const isSuperAdmin = isSuperAdminUser(user);
  const isWartawan =
    user.roleSlug === "wartawan" ||
    user.superGroupName.toLowerCase().includes("wartawan") ||
    user.roleSlug === "reporter";

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-stone-900 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#180C0C] border-r border-[#2C1414] text-stone-300 flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="h-16 border-b border-[#2C1414] px-5 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-black/40 border border-amber-400/30 shrink-0">
              <Image
                src="/images/logo-icon.png"
                alt="Logo Presisi"
                fill
                className="object-contain p-0.5"
              />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block">
                ADMIN PRESISI
              </span>
              <span className="text-[10px] text-stone-400 block -mt-0.5">
                Portal Jurnal Polisi
              </span>
            </div>
          </Link>
        </div>

        {/* User Profile Card */}
        <div className="p-4 border-b border-[#2C1414] bg-[#200F0F]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#7F0000] text-amber-300 flex items-center justify-center font-bold text-sm border border-red-500/30">
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

        {/* Navigation Links with Active Color Differentiation */}
        <AdminSidebarNav isSuperAdmin={isSuperAdmin} isWartawan={isWartawan} />

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#2C1414] space-y-1">
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

          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-stone-50 text-stone-900">
        <header className="h-16 border-b border-[#2C1414] bg-[#180C0C] px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span>Sistem Manajemen Konten &amp; Iklan Portal Berita</span>
          </div>
        </header>

        <main className="p-6 lg:p-8 flex-1 bg-stone-50 text-stone-900">
          {children}
        </main>
      </div>
    </div>
  );
}
