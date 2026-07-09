// src/components/mitra-form/StepVerifikasi.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FormButton from "./FormButton";
import { apiSendOtp, apiVerifyOtp } from "@/lib/api";

type ToastKind = "success" | "error" | "info";

type Props = {
  /** Email dari Step 1 (harus sama di sini) */
  emailDefault?: string;
  onBack: () => void;
  /** Dipanggil saat OTP valid (backend verified); parent boleh lanjut register */
  onVerify: (otp?: string) => void;
  submitting?: boolean;
  notify?: (msg: string, kind?: ToastKind) => void;
};

const COOLDOWN_SECONDS = 45;

export default function StepVerifikasi({
  emailDefault,
  onBack,
  onVerify,
  submitting,
  notify,
}: Props) {
  const [email, setEmail] = useState(emailDefault ?? "");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState<number>(0);
  const [hasSent, setHasSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // kalau backend mengembalikan session/token untuk OTP, simpan di sini (opsional)
  const [otpSessionId] = useState<string | null>(null);

  const otpInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setEmail(emailDefault ?? ""), [emailDefault]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const normalizedDefault = useMemo(
    () => (emailDefault ?? "").trim().toLowerCase(),
    [emailDefault]
  );
  const normalizedCurrent = useMemo(
    () => email.trim().toLowerCase(),
    [email]
  );
  const emailMatches = useMemo(
    () => !normalizedDefault || normalizedCurrent === normalizedDefault,
    [normalizedCurrent, normalizedDefault]
  );

  const maskEmail = (em: string) => {
    try {
      const [u, d] = em.split("@");
      if (!u || !d) return em;
      const head = u.slice(0, 2);
      const tail = u.slice(-1);
      return `${head}${"*".repeat(Math.max(1, u.length - 3))}${tail}@${d}`;
    } catch {
      return em;
    }
  };

  const handleSendOtp = async () => {
    const em = email.trim();
    if (!em || !/^\S+@\S+\.\S+$/.test(em)) {
      notify?.("Isi email yang valid untuk mengirim OTP.", "error");
      return;
    }
    if (!emailMatches) {
      notify?.("Email harus sama seperti yang diisi pada Langkah 1.", "error");
      return;
    }

    try {
      setSending(true);
      // kirim reason register agar selaras dengan backend (kind = 'register')
      await apiSendOtp({ email: em, reason: "register" });
      setHasSent(true);
      setCooldown(COOLDOWN_SECONDS);
      setOtp("");
      setTimeout(() => otpInputRef.current?.focus(), 50);
      notify?.(`Kode OTP dikirim ke ${maskEmail(em)}.`, "info");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal mengirim OTP.";
      notify?.(msg, "error");
    } finally {
      setSending(false);
    }
  };

  const doVerify = async () => {
    if (!hasSent) {
      notify?.("Kirim OTP terlebih dahulu.", "error");
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      notify?.("Kode OTP harus 6 digit angka.", "error");
      return;
    }
    try {
      setVerifying(true);
      // kirim dalam bentuk { email, code, reason:'register' }
      await apiVerifyOtp({ email: email.trim(), code: otp, reason: "register" });
      onVerify(otp); // sukses → lanjutkan proses register dari parent
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Verifikasi OTP gagal.";
      notify?.(msg, "error");
    } finally {
      setVerifying(false);
    }
  };

  const handleOtpChange = (v: string) => {
    const onlyNum = v.replace(/\D/g, "").slice(0, 6);
    setOtp(onlyNum);
  };

  const handleOtpKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void doVerify();
    }
  };

  const disabledSend = sending || cooldown > 0;
  const disabledVerify = submitting || verifying;

  return (
    <div className="flex flex-col justify-between min-h-[520px]">
      {/* Konten */}
      <div className="space-y-6">
        <p className="text-lg font-semibold">Verifikasi Akun Mitra</p>

        <div className="space-y-2">
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Masukkan alamat email yang sama seperti pada Langkah 1, lalu kirim kode OTP
            untuk memverifikasi.
          </p>

          {/* Email */}
          <label className="font-semibold">Alamat Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contoh: coffeetime@gmail.com"
            className={`w-full border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2
              ${emailMatches ? "border-gray-400 focus:ring-[#271F01]" : "border-red-400 focus:ring-red-400"}`}
            aria-invalid={!emailMatches}
            aria-describedby={!emailMatches ? "email-help" : undefined}
          />
          {!emailMatches && (
            <p id="email-help" className="text-xs text-red-600">
              Email harus sama seperti yang diisi pada Langkah 1.
            </p>
          )}

          {/* Kirim OTP */}
          <button
            type="button"
            onClick={() => void handleSendOtp()}
            disabled={disabledSend}
            className={`w-full font-semibold py-2 rounded-md transition
              ${disabledSend
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-[#271F01] text-white hover:bg-[#3b2f00]"}`}
          >
            {cooldown > 0
              ? `Kirim ulang (${cooldown}s)`
              : hasSent
              ? (sending ? "Mengirim…" : "Kirim Ulang Kode")
              : (sending ? "Mengirim…" : "Kirim Kode OTP")}
          </button>
        </div>

        {/* OTP */}
        <div className="pt-4">
          <label className="font-semibold">Kode OTP</label>
          <input
            ref={otpInputRef}
            inputMode="numeric"
            pattern="\d{6}"
            type="text"
            value={otp}
            onChange={(e) => handleOtpChange(e.target.value)}
            onKeyDown={handleOtpKey}
            placeholder="Masukkan 6 digit kode OTP"
            maxLength={6}
            className="w-full border border-gray-400 rounded-md px-3 py-2 mt-1 text-center tracking-widest text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#271F01]"
          />
          <p className="text-xs text-gray-500 mt-2">
            Kode OTP hanya untuk verifikasi. Jangan bagikan kepada siapa pun.
          </p>
        </div>

        {/* Catatan password mengikuti input Step 1 */}
        <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-amber-900 text-xs">
          Password akun mitra akan menggunakan <b>password yang kamu tulis pada Langkah 1</b>.
          Kamu bisa menggantinya di halaman profil setelah login.
        </div>
      </div>

      {/* Aksi */}
      <div className="flex justify-between pt-6">
        <FormButton label="Kembali" onClick={onBack} secondary />
        <FormButton
          label={disabledVerify ? "Memproses…" : "Verifikasi & Daftar"}
          onClick={() => void doVerify()}
          disabled={disabledVerify}
        />
      </div>
    </div>
  );
}
