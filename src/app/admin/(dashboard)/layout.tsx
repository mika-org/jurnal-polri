import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser, isSuperAdminUser } from "@/lib/auth";
import LogoutButton from "./LogoutButton";
import AdminDashboardShell from "@/components/admin/AdminDashboardShell";

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
    <AdminDashboardShell
      user={{
        nama_lengkap: user.nama_lengkap,
        roleName: user.roleName,
      }}
      isSuperAdmin={isSuperAdmin}
      isWartawan={isWartawan}
      logoutButton={<LogoutButton />}
    >
      {children}
    </AdminDashboardShell>
  );
}
