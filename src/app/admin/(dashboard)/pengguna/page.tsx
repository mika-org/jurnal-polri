import React from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isWartawanUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import PenggunaClientManager from "./PenggunaClientManager";

export const dynamic = "force-dynamic";

export default async function AdminPenggunaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (isWartawanUser(user)) redirect("/admin/berita");

  const [users, roles] = await Promise.all([
    prisma.pengguna.findMany({
      where: { deleted_at: null },
      include: {
        peran: {
          include: {
            super_grup: true,
          },
        },
      },
      orderBy: { created_at: "asc" },
    }),
    prisma.peran.findMany({
      where: { deleted_at: null },
      include: {
        super_grup: true,
      },
      orderBy: { created_at: "asc" },
    }),
  ]);

  return (
    <PenggunaClientManager
      users={users}
      roles={roles}
      currentUserId={user.id}
    />
  );
}
