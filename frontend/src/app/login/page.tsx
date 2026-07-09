"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Slideshow from "@/components/SlideShow";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { canAccess, routeForRole } from "@/lib/roles";
import type { Role } from "@/types/domain";

import { apiLogin, setAuthToken, API_BASE } from "@/lib/api";

type LoginRespLike = {
  token?: string;
  access_token?: string;
  data?: { token?: string; access_token?: string };
  user?: { role?: Role | string };
  message?: string;
};

function extractToken(resp: LoginRespLike): string | undefined {
  return (
    resp.token ??
    resp.access_token ??
    resp.data?.token ??
    resp.data?.access_token
  );
}

function normalizeRole(raw: Role | string | undefined): Role | undefined {
  // Sesuaikan ini kalau Role di domain punya value lain
  if (raw === "user" || raw === "mitra" || raw === "admin") return raw;
  return undefined;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nextPath, setNextPath] = useState<string>("/");

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    setNextPath(qs.get("next") || "/");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!API_BASE) {
        throw new Error(
          "NEXT_PUBLIC_API_BASE belum di-set. Harusnya: https://cuppaplace.web.id"
        );
      }

      const resp = (await apiLogin({
        email: email.trim(),
        password,
      })) as unknown as LoginRespLike;

      const token = extractToken(resp);
      if (!token) throw new Error("Token tidak ditemukan dari response login.");

      setAuthToken(token);

      // opsional: kalau ada bagian app yang masih baca cookie
      document.cookie = `cuppa_token=${token}; path=/; max-age=86400; SameSite=Lax; Secure`;

      window.dispatchEvent(new Event("auth-update"));

      const role = normalizeRole(resp.user?.role);
      const preferred = nextPath || "/";

      const allowedPath =
        role === "user" && canAccess(role, preferred)
          ? preferred
          : routeForRole(role);

      router.replace(allowedPath);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Login gagal");
    }
  };

  return (
    <div className="flex min-h-screen relative">
      {/* LEFT – LOGIN FORM */}
      <div className="w-full md:w-[40%] bg-[#2b210a] flex flex-col justify-center items-center px-10 py-12 text-white z-10 relative">
        <div className="w-full max-w-sm space-y-6">
          <h1 className="text-4xl font-bold text-center mb-6 -mt-10">
            Sign In
          </h1>

          <form onSubmit={handleLogin} className="space-y-5">
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

            <div className="flex justify-between text-sm font-medium">
              <Link href="/lupa-password" className="hover:underline">
                Lupa Password
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1b1405] py-3 rounded-md font-bold hover:bg-[#3a2f12] transition"
            >
              Login
            </button>

            <p className="text-center text-sm">
              Tidak punya akun?{" "}
              <Link href="/register" className="font-semibold hover:underline">
                Buat Akun
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* RIGHT – BRAND PANEL */}
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
            bermitra.
          </p>
        </div>
      </div>

      {/* SLIDESHOW */}
      <div className="fixed bottom-0 left-0 w-full bg-[#2b210a]/90 z-50">
        <Slideshow />
      </div>
    </div>
  );
}
