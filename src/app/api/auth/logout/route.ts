import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Berhasil keluar" });
  response.cookies.delete("jp_access_token");
  response.cookies.delete("jp_refresh_token");
  return response;
}
