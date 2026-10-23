"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Shield, Lock, User, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal masuk. Periksa kembali akun Anda.");
        setIsLoading(false);
        return;
      }

      window.location.href = "/admin";
    } catch {
      setError("Terjadi kesalahan jaringan.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#120808] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative ambient gradient */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#7F0000]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#F28C00]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#1E1010] border border-[#3E1A1A] rounded-2xl shadow-2xl p-8 relative z-10 backdrop-blur-md">
        {/* Logo and Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-[#7F0000] to-[#E50914] shadow-xl mb-4 flex items-center justify-center">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-black/40">
              <Image
                src="/images/logo-bulat.png"
                alt="Jurnal Polisi"
                fill
                priority
                className="object-contain p-0.5"
              />
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Portal Redaksi &amp; Admin
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Masuk dengan kredensial terverifikasi institusi
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="misal: admin atau editor"
                className="w-full pl-10 pr-4 py-2.5 bg-[#120808] border border-stone-800 rounded-lg text-sm text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-[#E50914] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#120808] border border-stone-800 rounded-lg text-sm text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-[#E50914] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-[#B91C1C] to-[#E50914] hover:from-[#991B1B] hover:to-[#DC2626] text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
