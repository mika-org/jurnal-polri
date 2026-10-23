import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Berhasil keluar" });
  response.cookies.delete("jp_access_token");
  response.cookies.delete("jp_refresh_token");
  return response;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const redirectPath = url.searchParams.get("redirect") || "/admin/login";
  const response = NextResponse.redirect(new URL(redirectPath, req.url));

  response.cookies.set("jp_access_token", "", {
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("jp_refresh_token", "", {
    maxAge: 0,
    path: "/",
  });

  return response;
}
