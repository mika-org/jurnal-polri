import React from "react";
import { getCurrentUser, isSuperAdminUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import TutorialClient from "./TutorialClient";

export const dynamic = "force-dynamic";

export default async function AdminTutorialPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }

  // Tampilkan khusus untuk Super Admin sesuai permintaan
  if (!isSuperAdminUser(user)) {
    redirect("/admin/berita");
  }

  return <TutorialClient />;
}
