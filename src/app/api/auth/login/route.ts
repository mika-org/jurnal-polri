import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/password";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    const user = await prisma.pengguna.findUnique({
      where: { nama_pengguna: username },
      include: {
        peran: {
          include: {
            super_grup: true,
          },
        },
      },
    });

    if (!user || !user.aktif || user.deleted_at) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.kata_sandi);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.pengguna.update({
      where: { id: user.id },
      data: { terakhir_masuk: new Date() },
    });

    // Create tokens
    const accessToken = await signAccessToken({
      sub: user.id,
      username: user.nama_pengguna,
      roleId: user.peran_id,
      roleSlug: user.peran.slug,
      name: user.nama_lengkap,
    });

    const refreshToken = await signRefreshToken(user.id);

    // Save refresh token in database
    await prisma.tokenPenyegar.create({
      data: {
        pengguna_id: user.id,
        token_hash: refreshToken.slice(-32), // save identifiable hash/suffix
        kadaluarsa_pada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nama_pengguna: user.nama_pengguna,
        nama_lengkap: user.nama_lengkap,
        role: user.peran.nama,
      },
    });

    // Set HTTP-only cookies
    response.cookies.set("jp_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    response.cookies.set("jp_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server" },
      { status: 500 }
    );
  }
}
