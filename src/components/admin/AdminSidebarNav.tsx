"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  Layers,
  Image as ImageIcon,
  FileText,
  Users,
  Settings,
  Printer,
  BookOpen,
  ChevronRight,
} from "lucide-react";

interface AdminSidebarNavProps {
  isSuperAdmin: boolean;
  isWartawan: boolean;
}

export default function AdminSidebarNav({
  isSuperAdmin,
  isWartawan,
}: AdminSidebarNavProps) {
  const pathname = usePathname();

  interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }

  interface NavGroup {
    category: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = isWartawan
    ? [
        {
          category: "Utama",
          items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
        },
        {
          category: "Konten Berita",
          items: [{ label: "Kelola Berita", href: "/admin/berita", icon: Newspaper }],
        },
      ]
    : [
        {
          category: "Utama",
          items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
        },
        {
          category: "Konten & Berita",
          items: [
            { label: "Kelola Berita", href: "/admin/berita", icon: Newspaper },
            { label: "Kategori Berita", href: "/admin/kategori", icon: Layers },
            { label: "Halaman Statis", href: "/admin/halaman", icon: FileText },
          ],
        },
        {
          category: "Publikasi & Media",
          items: [
            ...(isSuperAdmin
              ? [{ label: "Cetak Koran PDF", href: "/admin/koran", icon: Printer }]
              : []),
            { label: "Banner Iklan", href: "/admin/iklan", icon: ImageIcon },
          ],
        },
        {
          category: "Sistem & Pengaturan",
          items: [
            { label: "Pengguna & Akses", href: "/admin/pengguna", icon: Users },
            ...(isSuperAdmin
              ? [{ label: "Buku Tutorial", href: "/admin/tutorial", icon: BookOpen }]
              : []),
            { label: "Pengaturan Portal", href: "/admin/pengaturan", icon: Settings },
          ],
        },
      ];

  return (
    <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
      {navGroups.map((group) => {
        if (!group.items.length) return null;
        return (
          <div key={group.category} className="space-y-1">
            <div className="px-3 pt-1 pb-1 text-[9.5px] font-extrabold uppercase tracking-wider text-stone-400/80 flex items-center gap-1.5 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600/80" />
              <span>{group.category}</span>
            </div>

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#B91C1C] to-[#E50914] text-white shadow-lg shadow-red-950/60 border-l-4 border-amber-300 translate-x-1"
                      : "text-stone-300 hover:text-white hover:bg-[#2A1212] border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? "text-amber-300 stroke-[2.5]" : "text-stone-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
