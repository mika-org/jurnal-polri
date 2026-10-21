import { cookies } from "next/headers";
import { verifyAccessToken, JWTPayload } from "./jwt";
import { prisma } from "./prisma";

export async function getCurrentUser(): Promise<{
  id: string;
  nama_pengguna: string;
  nama_lengkap: string;
  email: string | null;
  roleId: string;
  roleName: string;
  roleSlug: string;
  superGroupName: string;
  permissions: string[];
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("jp_access_token")?.value;

  if (!token) return null;

  const payload: JWTPayload | null = await verifyAccessToken(token);
  if (!payload || !payload.sub) return null;

  const user = await prisma.pengguna.findUnique({
    where: { id: payload.sub },
    include: {
      peran: {
        include: {
          super_grup: true,
          peran_izin: {
            include: {
              izin: true,
            },
          },
        },
      },
    },
  });

  if (!user || !user.aktif || user.deleted_at) {
    return null;
  }

  const permissions = user.peran.peran_izin.map((pi) => pi.izin.kode);

  return {
    id: user.id,
    nama_pengguna: user.nama_pengguna,
    nama_lengkap: user.nama_lengkap,
    email: user.email,
    roleId: user.peran_id,
    roleName: user.peran.nama,
    roleSlug: user.peran.slug,
    superGroupName: user.peran.super_grup.nama,
    permissions,
  };
}

export function isWartawanUser(
  user: { roleSlug: string; superGroupName: string } | null | undefined
): boolean {
  if (!user) return false;
  return (
    user.roleSlug === "wartawan" ||
    user.roleSlug === "reporter" ||
    user.superGroupName.toLowerCase().includes("wartawan")
  );
}

export function isSuperAdminUser(
  user: { roleSlug: string; superGroupName: string } | null | undefined
): boolean {
  if (!user) return false;
  const sg = user.superGroupName.toLowerCase();
  const r = user.roleSlug.toLowerCase();
  return sg.includes("super admin") || r === "owner" || r === "super-admin" || r === "admin";
}
