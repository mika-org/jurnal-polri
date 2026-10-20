import React from "react";
import { prisma } from "@/lib/prisma";
import { Users, Shield, CheckCircle, Clock } from "lucide-react";
import { formatTanggalWaktu } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPenggunaPage() {
  const users = await prisma.pengguna.findMany({
    where: { deleted_at: null },
    include: {
      peran: {
        include: {
          super_grup: true,
        },
      },
    },
    orderBy: { created_at: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Pengguna &amp; Hak Akses (RBAC)
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Hierarki Super Grup &rarr; Peran &rarr; Izin Berjenjang Sistem
          </p>
        </div>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C1414] text-stone-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#200F0F] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#7F0000] text-amber-300 flex items-center justify-center font-bold text-xs">
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
                    <span className="bg-[#2A1212] text-amber-300 px-2 py-0.5 rounded text-[10px] font-semibold border border-amber-900/50">
                      {u.peran.super_grup.nama}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-stone-200">
                    {u.peran.nama}
                  </td>
                  <td className="py-3.5 px-4">
                    {u.aktif ? (
                      <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1 w-fit">
                        <CheckCircle className="w-3 h-3" />
                        <span>AKTIF</span>
                      </span>
                    ) : (
                      <span className="bg-red-950 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded border border-red-800">
                        NONAKTIF
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-stone-400">
                    {u.terakhir_masuk ? formatTanggalWaktu(u.terakhir_masuk) : "Belum pernah"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
