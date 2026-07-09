// frontend/src/app/mitra/daftar/page.tsx
"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import StepIndicator from "@/components/mitra-form/StepIndicator";
import StepIdentitas from "@/components/mitra-form/StepIdentitas";
import StepFasilitas from "@/components/mitra-form/StepFasilitas";
import StepVerifikasi from "@/components/mitra-form/StepVerifikasi";
import { apiRegisterMitra } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { routeForRole } from "@/lib/roles";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle, Info } from "lucide-react";

import type { OpeningHours, MitraFormData } from "@/types/mitra";
import { DEFAULT_OPENING_HOURS } from "@/types/mitra";

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  return h * 60 + m;
}

function validateOpeningHours(oh: OpeningHours | undefined): string[] {
  if (!oh) return ["Jam operasional belum diisi"];
  const days = Object.entries(oh) as [
    keyof OpeningHours,
    OpeningHours[keyof OpeningHours]
  ][];

  let atLeastOneOpen = false;
  const errs: string[] = [];

  days.forEach(([key, day]) => {
    const labelMap: Record<string, string> = {
      mon: "Senin",
      tue: "Selasa",
      wed: "Rabu",
      thu: "Kamis",
      fri: "Jumat",
      sat: "Sabtu",
      sun: "Minggu",
    };
    const label = labelMap[key] || String(key);

    if (!day.open) return;
    atLeastOneOpen = true;
    if (day.allDay) return;

    const ranges = day.ranges ?? [];
    if (!ranges.length) {
      errs.push(`${label}: belum ada rentang jam`);
      return;
    }

    type ParsedRange =
      | { ok: true; s: number; e: number }
      | { ok: false; msg: string };

    const parsed = ranges.map((r, i) => {
      const s = toMin(r.start);
      const e = toMin(r.end);
      if (Number.isNaN(s) || Number.isNaN(e))
        return { ok: false, msg: `${label}: format jam tidak valid (range #${i + 1})` };
      if (s >= e)
        return { ok: false, msg: `${label}: jam mulai harus < jam selesai (range #${i + 1})` };
      return { ok: true, s, e };
    }) as ParsedRange[];

    for (const p of parsed) {
      if (!p.ok) {
        errs.push(p.msg);
        return;
      }
    }

    const sorted = parsed
      .filter((p): p is { ok: true; s: number; e: number } => p.ok)
      .sort((a, b) => a.s - b.s);

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].s < sorted[i - 1].e) {
        errs.push(`${label}: rentang bertabrakan (range #${i} & #${i + 1})`);
        break;
      }
    }
  });

  if (!atLeastOneOpen) errs.push("Semua hari tutup — isi setidaknya 1 hari buka");
  return errs;
}

type ToastKind = "success" | "error" | "info";

function ConfirmLeaveModal({
  open,
  onStay,
  onLeave,
  targetLabel,
}: {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
  targetLabel?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" />
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="relative w-full sm:max-w-md mx-3 sm:mx-0 bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-5 text-[#271F01]">
          <p className="text-lg font-semibold mb-1">Keluar dari pendaftaran?</p>
          <p className="text-sm text-neutral-700">
            Data belum lengkap. Jika kamu keluar sekarang
            {targetLabel ? (
              <>
                {" "}
                menuju <b>{targetLabel}</b>
              </>
            ) : null}
            , perubahan bisa hilang.
          </p>
          <div className="mt-5 flex gap-3 justify-end">
            <button
              onClick={onStay}
              className="px-4 py-2 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50"
            >
              Tetap di sini
            </button>
            <button
              onClick={onLeave}
              className="px-4 py-2 rounded-md bg-[#2b210a] text-white hover:bg-[#423614]"
            >
              Tinggalkan halaman
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function parseOptionalNumber(v: unknown): number | undefined {
  if (v == null) return undefined;
  const n = typeof v === "number" ? v : Number(String(v));
  return Number.isFinite(n) ? n : undefined;
}

export default function GabungMitraPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<MitraFormData>({
    cafe_name: "",
    address: "",
    phone: "",
    email: "",
    password: "",
    password2: "",
    nib: "",
    hours: "",
    fasilitas: [],
    opening_hours: DEFAULT_OPENING_HOURS,

    logoFile: null,
    coverFile: null,
    galleryFiles: [],

    logoPreviewUrl: null,
    coverPreviewUrl: null,
    galleryPreviewUrls: [],
  });

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; kind: ToastKind } | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const pendingHrefRef = useRef<string | null>(null);
  const pendingBackRef = useRef<boolean>(false);

  const popstateHandlerRef = useRef<((e: PopStateEvent) => void) | null>(null);
  const skipGuardRef = useRef(false);

  const router = useRouter();
  const { refreshMe } = useAuth();

  const notify = useCallback((msg: string, kind: ToastKind = "info") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2600);
  }, []);

  const setIdentitas = useCallback((patch: Partial<MitraFormData>) => {
    // kalau lat/lng masuk string dari StepIdentitas, kita convert di sini
    const next: Partial<MitraFormData> = { ...patch };

    if ("lat" in patch) next.lat = parseOptionalNumber(patch.lat);
    if ("lng" in patch) next.lng = parseOptionalNumber(patch.lng);

    setForm((f) => ({ ...f, ...next }));
  }, []);

  const setFasilitas = useCallback((list: string[]) => {
    setForm((f) => ({ ...f, fasilitas: list }));
  }, []);

  const setOpeningHours = useCallback((oh: OpeningHours) => {
    setForm((f) => ({ ...f, opening_hours: oh }));
  }, []);

  const isStep1Valid = useMemo(() => {
    const { cafe_name, email, phone, address, password, password2 } = form;
    if (!cafe_name.trim()) return false;
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return false;
    if (!phone.trim() || phone.replace(/\D/g, "").length < 8) return false;
    if (!address.trim()) return false;
    if (!password || password.length < 8) return false;
    if (password !== password2) return false;
    return true;
  }, [form]);

  const isStep2Valid = useMemo(() => {
    if (form.fasilitas.length === 0) return false;
    const errs = validateOpeningHours(form.opening_hours);
    return errs.length === 0;
  }, [form.fasilitas, form.opening_hours]);

  const inProgress = useMemo(() => {
    const basic =
      form.cafe_name ||
      form.address ||
      form.phone ||
      form.email ||
      form.password ||
      form.password2 ||
      form.nib ||
      form.hours ||
      (form.fasilitas && form.fasilitas.length > 0) ||
      form.logoFile != null ||
      form.coverFile != null ||
      (form.galleryFiles && form.galleryFiles.length > 0);

    return !!basic || step > 1;
  }, [form, step]);

  const canGoStep2 = useCallback(() => {
    if (!form.cafe_name.trim()) return notify("Nama Coffeeshop harus diisi.", "error"), false;
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email))
      return notify("Email tidak valid.", "error"), false;
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 8)
      return notify("Nomor HP tidak valid.", "error"), false;
    if (!form.address.trim()) return notify("Alamat harus diisi.", "error"), false;
    if (!form.password || form.password.length < 8)
      return notify("Password minimal 8 karakter.", "error"), false;
    if (form.password !== form.password2)
      return notify("Konfirmasi password tidak sama.", "error"), false;
    return true;
  }, [form, notify]);

  const canGoStep3 = useCallback(() => {
    if (form.fasilitas.length === 0) return notify("Pilih setidaknya 1 fasilitas di Step 2.", "error"), false;
    const errs = validateOpeningHours(form.opening_hours);
    if (errs.length) {
      notify(`Periksa jam operasional:\n- ${errs.join("\n- ")}`, "error");
      return false;
    }
    return true;
  }, [form.fasilitas, form.opening_hours, notify]);

  const handleVerifyAndRegister = useCallback(
    async (_otp?: string) => {
      setSubmitting(true);
      try {
        // ✅ register SEKALI JALAN: data + logo + cover + gallery
        const res = await apiRegisterMitra({
          name: form.cafe_name,
          email: form.email,
          password: form.password,
          phone: form.phone,

          cafe_name: form.cafe_name,
          address: form.address,
          lat: form.lat,
          lng: form.lng,
          instagram: form.instagram,
          opening_hours: form.opening_hours,

          logo: form.logoFile,
          cover: form.coverFile,
          gallery: form.galleryFiles,
        });

        await refreshMe();
        setToast({ msg: "Pendaftaran mitra berhasil 🎉", kind: "success" });

        setTimeout(() => {
          router.replace(routeForRole(res.user.role));
        }, 300);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Registrasi mitra gagal";
        notify(msg, "error");
      } finally {
        setSubmitting(false);
      }
    },
    [form, refreshMe, router, notify]
  );

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!inProgress || skipGuardRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    if (inProgress) window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [inProgress]);

  useEffect(() => {
    history.pushState(null, "", location.href);
    const handler = (_e: PopStateEvent) => {
      if (!inProgress) {
        window.removeEventListener("popstate", handler);
        history.back();
        return;
      }
      pendingBackRef.current = true;
      pendingHrefRef.current = null;
      setConfirmOpen(true);
      history.pushState(null, "", location.href);
    };
    popstateHandlerRef.current = handler;
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [inProgress]);

  useEffect(() => {
    const onDocClick = (ev: MouseEvent) => {
      if (!inProgress) return;
      const target = ev.target as HTMLElement | null;
      const a = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!a) return;

      const href = a.getAttribute("href") || "";
      if (!href || href.startsWith("#")) return;

      ev.preventDefault();
      pendingHrefRef.current = a.href;
      pendingBackRef.current = false;
      setConfirmOpen(true);
    };
    document.addEventListener("click", onDocClick, true);
    return () => document.removeEventListener("click", onDocClick, true);
  }, [inProgress]);

  const handleStay = () => {
    pendingHrefRef.current = null;
    pendingBackRef.current = false;
    setConfirmOpen(false);
  };

  const handleLeave = () => {
    setConfirmOpen(false);

    skipGuardRef.current = true;
    if (popstateHandlerRef.current) {
      window.removeEventListener("popstate", popstateHandlerRef.current);
      popstateHandlerRef.current = null;
    }

    const href = pendingHrefRef.current;
    const back = pendingBackRef.current;
    pendingHrefRef.current = null;
    pendingBackRef.current = false;

    if (back) return history.back();

    if (href) {
      try {
        const u = new URL(href);
        const sameOrigin = u.origin === window.location.origin;
        const specialScheme = /^(tel:|mailto:|sms:|whatsapp:)/i.test(href);
        if (!sameOrigin || specialScheme) window.location.assign(href);
        else router.push(`${u.pathname}${u.search}${u.hash}`);
      } catch {
        window.location.assign(href);
      }
    }
  };

  const targetLabel = useMemo(() => {
    const href = pendingHrefRef.current;
    if (!href) return undefined;
    try {
      const u = new URL(href);
      return u.host === location.host ? u.pathname : href;
    } catch {
      return href;
    }
  }, [confirmOpen]);

  return (
    <div className="flex flex-col min-h-screen bg-white text-[#271F01] overflow-hidden">
      <div className="relative z-50">
        <Navbar />
      </div>

      <div className="sticky top-10">
        <div className="pt-[72px]">
          <StepIndicator step={step} />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-8 pb-12">
        <div className="w-full max-w-3xl min-h-[520px] flex flex-col justify-between">
          <div className="flex-1">
            {step === 1 && (
              <StepIdentitas
                value={form}
                onChange={setIdentitas}
                onNext={() => {
                  if (canGoStep2()) setStep(2);
                }}
                notify={notify}
              />
            )}

            {step === 2 && (
              <StepFasilitas
                selected={form.fasilitas}
                openingHours={form.opening_hours}
                onChange={setFasilitas}
                onChangeHours={setOpeningHours}
                onNext={() => {
                  if (canGoStep3()) setStep(3);
                }}
                onBack={() => setStep(1)}
                notify={notify}
              />
            )}

            {step === 3 && (
              <StepVerifikasi
                emailDefault={form.email}
                onBack={() => setStep(2)}
                onVerify={(otp) => {
                  if (submitting) return;
                  if (!isStep1Valid) return notify("Lengkapi data Step 1 dulu.", "error"), setStep(1);
                  if (!isStep2Valid) return notify("Lengkapi data Step 2 dulu.", "error"), setStep(2);
                  handleVerifyAndRegister(otp);
                }}
                submitting={submitting}
                notify={notify}
              />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]"
          >
            <div
              className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg border ${
                toast.kind === "success"
                  ? "bg-emerald-50/95 border-emerald-200 text-emerald-900"
                  : toast.kind === "error"
                  ? "bg-red-50/95 border-red-200 text-red-900"
                  : "bg-amber-50/95 border-amber-200 text-amber-900"
              }`}
            >
              {toast.kind === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : toast.kind === "error" ? (
                <XCircle className="w-5 h-5" />
              ) : (
                <Info className="w-5 h-5" />
              )}
              <span className="text-sm font-medium whitespace-pre-line">{toast.msg}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmOpen && (
          <ConfirmLeaveModal
            open={confirmOpen}
            onStay={handleStay}
            onLeave={handleLeave}
            targetLabel={targetLabel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
