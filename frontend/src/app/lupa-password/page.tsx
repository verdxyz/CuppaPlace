"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { apiForgotPassword } from "@/lib/api";
import Slideshow from "@/components/SlideShow";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      const res = await apiForgotPassword(email.trim());
      setMessage(
        res?.message ??
          "Jika email terdaftar, link reset password telah dikirim."
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          typeof err === "string"
            ? err
            : "Terjadi kesalahan saat mengirim permintaan reset password."
        );
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
            Lupa Password
          </h1>

          <p className="text-sm text-gray-200 text-center mb-4">
            Masukkan email yang terdaftar. Kami akan mengirimkan link untuk
            mengatur ulang password Anda.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              disabled={submitting || !email}
              className="w-full bg-[#1b1405] py-3 rounded-md font-bold hover:bg-[#3a2f12] transition disabled:opacity-60"
            >
              {submitting ? "Mengirim..." : "Kirim Link Reset"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full text-sm text-gray-200 hover:underline mt-1"
            >
              Kembali ke halaman login
            </button>
          </form>
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
            Tenang, <br /> kita bantu akses lagi.
          </h2>
          <p className="text-white text-base max-w-md drop-shadow-md">
            Hanya dengan beberapa langkah, kamu bisa kembali menikmati layanan
            CuppaPlace tanpa hambatan.
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
