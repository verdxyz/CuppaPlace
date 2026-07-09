// frontend/src/app/reset-password/ResetPasswordClient.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { apiResetPassword } from "@/lib/api";
import Slideshow from "@/components/SlideShow";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Token reset password tidak ditemukan atau tidak valid.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!token) {
      setError("Token tidak valid.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiResetPassword(token, password);
      setMessage(res?.message ?? "Password berhasil direset.");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        setError(
          (err as { message?: string }).message ??
            "Gagal mereset password. Silakan coba lagi nanti."
        );
      } else {
        setError("Gagal mereset password. Silakan coba lagi nanti.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen relative">
      {/* Panel kiri - form */}
      <div className="w-full md:w-[40%] bg-[#2b210a] flex flex-col justify-center items-center px-10 py-12 text-white z-10 relative">
        <div className="w-full max-w-sm space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 -mt-10">
            Atur Ulang Password
          </h1>

          {!token && (
            <p className="text-sm text-red-200 bg-red-800/40 border border-red-500/60 rounded-md px-3 py-2">
              Token tidak valid. Silakan ulangi proses lupa password.
            </p>
          )}

          {token && (
            <>
              <p className="text-sm text-gray-200 text-center mb-2">
                Masukkan password baru untuk akun Anda.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block mb-2 text-sm font-semibold">
                    Password baru
                  </label>
                  <input
                    type="password"
                    className="w-full p-3 rounded-md bg-[#4d4020] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold">
                    Konfirmasi password
                  </label>
                  <input
                    type="password"
                    className="w-full p-3 rounded-md bg-[#4d4020] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Ulangi password baru"
                  />
                </div>

                {message && (
                  <div className="text-sm text-emerald-200 bg-emerald-800/40 border border-emerald-500/60 rounded-md px-3 py-2">
                    {message}
                  </div>
                )}
                {error && (
                  <div className="text-sm text-red-200 bg-red-800/40 border border-red-500/60 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !token}
                  className="w-full bg-[#1b1405] py-3 rounded-md font-bold hover:bg-[#3a2f12] transition disabled:opacity-60"
                >
                  {submitting ? "Menyimpan..." : "Simpan Password Baru"}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="w-full text-sm text-gray-200 hover:underline mt-1"
                >
                  Kembali ke halaman login
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Panel kanan - gambar */}
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
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
            Password baru, <br /> pengalaman lama yang nyaman.
          </h2>
          <p className="text-white text-base max-w-md drop-shadow-md">
            Setelah reset password, kamu bisa kembali menjelajahi coffeeshop
            favorit tanpa hambatan.
          </p>
        </div>
      </div>

      {/* Slideshow bawah */}
      <div className="fixed bottom-0 left-0 w-full bg-[#2b210a]/90 z-50">
        <Slideshow />
      </div>
    </div>
  );
}
