import { prisma } from "./prisma";

export async function getUserPermissions(roleId: string): Promise<string[]> {
  const rolePermissions = await prisma.peranIzin.findMany({
    where: { peran_id: roleId },
    include: {
      izin: true,
    },
  });

  return rolePermissions.map((rp) => rp.izin.kode);
}

export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  if (userPermissions.includes("*")) {
    return true;
  }

  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // Handle prefix wildcards like "article:*" matching "article:publish"
  const [modul] = requiredPermission.split(":");
  if (userPermissions.includes(`${modul}:*`)) {
    return true;
  }

  return false;
}

export async function canUserPerform(roleId: string, permissionCode: string): Promise<boolean> {
  const permissions = await getUserPermissions(roleId);
  return hasPermission(permissions, permissionCode);
}
