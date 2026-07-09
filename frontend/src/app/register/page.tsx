"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Slideshow from "@/components/SlideShow";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { apiRegister, setAuthToken } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { routeForRole } from "@/lib/roles";
import type { Role } from "@/types/domain";

type RegisterRespLike = {
  token?: string;
  access_token?: string;
  data?: { token?: string; access_token?: string };
  user?: { role?: Role | string };
  message?: string;
};

function extractToken(resp: RegisterRespLike): string | undefined {
  return (
    resp.token ??
    resp.access_token ??
    resp.data?.token ??
    resp.data?.access_token
  );
}

function normalizeRole(raw: Role | string | undefined): Role | undefined {
  if (raw === "user" || raw === "mitra" || raw === "admin") return raw;
  return undefined;
}

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading, refreshMe } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kalau sudah login, jangan bisa register lagi → lempar sesuai role
  useEffect(() => {
    if (!loading && user) {
      router.replace(routeForRole(user.role));
    }
  }, [loading, user, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Nama wajib diisi.");
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email))
      return setError("Email tidak valid.");
    if (password.length < 6) return setError("Password minimal 6 karakter.");
    if (password !== password2)
      return setError("Konfirmasi password tidak sama.");

    try {
      setSubmitting(true);

      const resp = (await apiRegister({
        name: name.trim(),
        email: email.trim(),
        password,
      })) as unknown as RegisterRespLike;

      // ✅ ambil token dengan aman (token/access_token/data.token)
      const token = extractToken(resp);
      if (token) {
        setAuthToken(token);

        // opsional: kalau ada bagian lain masih baca cookie
        document.cookie = `cuppa_token=${token}; path=/; max-age=86400; SameSite=Lax; Secure`;
      }

      // refresh user session (akan call /api/auth/me dengan Bearer token)
      await refreshMe();

      // redirect berdasarkan role dari response (kalau ada), fallback "/"
      const role = normalizeRole(resp.user?.role);
      router.replace(routeForRole(role));
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Registrasi gagal. Coba lagi.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen relative">
      {/* Bagian Kiri (Form Sign Up) */}
      <div className="w-full md:w-[40%] bg-[#2b210a] flex flex-col justify-center items-center px-10 py-12 text-white z-10 relative">
        <div className="w-full max-w-sm space-y-6">
          <h1 className="text-4xl font-bold text-center mb-6 -mt-10">
            Sign Up
          </h1>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-semibold">Nama</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-md bg-[#4d4020] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-md bg-[#4d4020] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Masukkan email"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-md bg-[#4d4020] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Masukkan password"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold">
                Konfirmasi Password
              </label>
              <input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className="w-full p-3 rounded-md bg-[#4d4020] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Ulangi password"
                required
              />
            </div>

            {error && (
              <div className="text-sm bg-red-50 border border-red-200 text-red-900 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1b1405] py-3 rounded-md font-bold hover:bg-[#3a2f12] transition disabled:opacity-60"
            >
              {submitting ? "Membuat Akun..." : "Buat Akun"}
            </button>

            <p className="text-center text-sm">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-semibold hover:underline">
                Masuk
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Bagian Kanan */}
      <div className="hidden md:flex flex-col justify-center w-[60%] relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/img/login/LoginPage.jpg"
            alt="Coffeeshop"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 px-12">
          <h2 className="text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
            Hello, <br /> Selamat Datang!
          </h2>
          <p className="text-white text-base max-w-md drop-shadow-md">
            CuppaPlace menghubungkan pecinta kopi dengan coffeeshop terbaik yang
            telah bermitra.
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-[#2b210a]/90 z-50">
        <Slideshow />
      </div>
    </div>
  );
}
