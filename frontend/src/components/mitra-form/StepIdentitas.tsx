// frontend/src/components/mitra-form/StepIdentitas.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, ImagePlus, Trash2 } from "lucide-react";

type ToastKind = "success" | "error" | "info";

type MitraFormValue = {
  cafe_name: string;
  address: string;
  phone: string;
  email: string;
  password: string;
  password2: string;
  nib: string;
  hours: string;
  lat?: number;
  lng?: number;
  instagram?: string;

  logoFile: File | null;
  coverFile: File | null;
  galleryFiles: File[];

  logoPreviewUrl: string | null;
  coverPreviewUrl: string | null;
  galleryPreviewUrls: string[];
};

export default function StepIdentitas({
  value,
  onChange,
  onNext,
  notify,
}: {
  value: MitraFormValue;
  onChange: (patch: Partial<MitraFormValue>) => void;
  onNext: () => void;
  notify?: (msg: string, kind?: ToastKind) => void;
}) {
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const revokeUrls = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      revokeUrls.current.forEach((u) => URL.revokeObjectURL(u));
      revokeUrls.current = [];
    };
  }, []);

  const handleText =
    (k: keyof MitraFormValue) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      // lat/lng input masuk string; kita convert di parent (page) biar simple
      onChange({ [k]: v } as unknown as Partial<MitraFormValue>);
    };

  const passwordStrength = useMemo(() => {
    const p = value.password || "";
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(s, 4);
  }, [value.password]);

  const strengthLabel =
    ["Sangat lemah", "Lemah", "Cukup", "Baik", "Kuat"][passwordStrength] ?? "—";

  const onPickLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify?.("File logo harus gambar.", "error");
      return;
    }
    const url = URL.createObjectURL(file);
    revokeUrls.current.push(url);
    onChange({ logoFile: file, logoPreviewUrl: url });
  };

  const removeLogo = () => {
    if (value.logoPreviewUrl) URL.revokeObjectURL(value.logoPreviewUrl);
    onChange({ logoFile: null, logoPreviewUrl: null });
  };

  const onPickCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify?.("File cover harus gambar.", "error");
      return;
    }
    const url = URL.createObjectURL(file);
    revokeUrls.current.push(url);
    onChange({ coverFile: file, coverPreviewUrl: url });
  };

  const removeCover = () => {
    if (value.coverPreviewUrl) URL.revokeObjectURL(value.coverPreviewUrl);
    onChange({ coverFile: null, coverPreviewUrl: null });
  };

  const onPickGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (!files.length) return;

    const current = value.galleryFiles.length;
    const left = Math.max(0, 8 - current);
    const take = files.slice(0, left);

    const urls = take.map((f) => {
      const u = URL.createObjectURL(f);
      revokeUrls.current.push(u);
      return u;
    });

    const mergedFiles = [...value.galleryFiles, ...take];
    const mergedUrls = [...value.galleryPreviewUrls, ...urls];
    onChange({ galleryFiles: mergedFiles, galleryPreviewUrls: mergedUrls });

    if (files.length > left) notify?.("Maksimal 8 foto suasana.", "info");
  };

  const removeGalleryAt = (idx: number) => {
    const files = [...value.galleryFiles];
    const urls = [...value.galleryPreviewUrls];
    if (urls[idx]) URL.revokeObjectURL(urls[idx]);
    files.splice(idx, 1);
    urls.splice(idx, 1);
    onChange({ galleryFiles: files, galleryPreviewUrls: urls });
  };

  const tryNext = () => {
    if (!value.cafe_name?.trim()) return notify?.("Nama Coffeeshop harus diisi.", "error");
    if (!value.email?.trim() || !/^\S+@\S+\.\S+$/.test(value.email))
      return notify?.("Email tidak valid.", "error");
    if (!value.phone?.trim() || value.phone.replace(/\D/g, "").length < 8)
      return notify?.("Nomor HP tidak valid.", "error");
    if (!value.address?.trim()) return notify?.("Alamat harus diisi.", "error");
    if (!value.password || value.password.length < 8)
      return notify?.("Password minimal 8 karakter.", "error");
    if (value.password !== value.password2)
      return notify?.("Konfirmasi password tidak sama.", "error");
    onNext();
  };

  return (
    <div className="flex flex-col justify-between min-h-[520px]">
      <p className="text-lg font-semibold">Identitas Coffee Shop</p>

      <div className="space-y-5 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-sm">Nama Coffeeshop</label>
            <input
              value={value.cafe_name}
              onChange={handleText("cafe_name")}
              className="w-full border border-gray-400 rounded-md px-3 py-2 mt-1 text-sm"
              placeholder="Contoh: Renjana Coffee"
            />
          </div>

          <div>
            <label className="font-semibold text-sm">Alamat</label>
            <input
              value={value.address}
              onChange={handleText("address")}
              className="w-full border border-gray-400 rounded-md px-3 py-2 mt-1 text-sm"
              placeholder="Jl. Depok No..."
            />
          </div>

          <div>
            <label className="font-semibold text-sm">Nomor HP</label>
            <input
              value={value.phone}
              onChange={handleText("phone")}
              inputMode="tel"
              className="w-full border border-gray-400 rounded-md px-3 py-2 mt-1 text-sm"
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div>
            <label className="font-semibold text-sm">Email</label>
            <input
              type="email"
              value={value.email}
              onChange={handleText("email")}
              className="w-full border border-gray-400 rounded-md px-3 py-2 mt-1 text-sm"
              placeholder="nama@domain.com"
            />
          </div>

          <div className="relative">
            <label className="font-semibold text-sm">Password</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={value.password}
                onChange={handleText("password")}
                className="w-full border border-gray-400 rounded-md px-3 py-2 mt-1 pr-10 text-sm"
                placeholder="Minimal 8 karakter"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-2 top-[10px] text-gray-600 hover:text-gray-800"
                aria-label={showPwd ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="mt-1 h-1.5 bg-gray-200 rounded">
              <div
                className={`h-1.5 rounded ${
                  passwordStrength <= 1
                    ? "bg-red-400 w-1/4"
                    : passwordStrength === 2
                    ? "bg-yellow-400 w-2/4"
                    : passwordStrength === 3
                    ? "bg-emerald-400 w-3/4"
                    : "bg-emerald-600 w-full"
                }`}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Kekuatan: {strengthLabel}</p>
          </div>

          <div className="relative">
            <label className="font-semibold text-sm">Konfirmasi Password</label>
            <div className="relative">
              <input
                type={showPwd2 ? "text" : "password"}
                value={value.password2}
                onChange={handleText("password2")}
                className="w-full border border-gray-400 rounded-md px-3 py-2 mt-1 pr-10 text-sm"
                placeholder="Ulangi password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd2((s) => !s)}
                className="absolute right-2 top-[10px] text-gray-600 hover:text-gray-800"
                aria-label={showPwd2 ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPwd2 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="font-semibold text-sm">Nomor Induk Berusaha (NIB)</label>
            <input
              value={value.nib}
              onChange={handleText("nib")}
              className="w-full border border-gray-400 rounded-md px-3 py-2 mt-1 text-sm"
              placeholder="(opsional)"
            />
          </div>

          <div>
            <label className="font-semibold text-sm">Jam Operasional</label>
            <input
              value={value.hours}
              onChange={handleText("hours")}
              className="w-full border border-gray-400 rounded-md px-3 py-2 mt-1 text-sm"
              placeholder="contoh: Sen–Min 08:00–22:00"
            />
          </div>

          <div>
            <label className="font-semibold text-sm">Instagram (opsional)</label>
            <input
              value={value.instagram ?? ""}
              onChange={handleText("instagram")}
              className="w-full border border-gray-400 rounded-md px-3 py-2 mt-1 text-sm"
              placeholder="@yourcafe"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-sm">Lat (opsional)</label>
              <input
                value={value.lat ?? ""}
                onChange={handleText("lat")}
                inputMode="decimal"
                className="w-full border border-gray-400 rounded-md px-3 py-2 mt-1 text-sm"
                placeholder="-6.9..."
              />
            </div>
            <div>
              <label className="font-semibold text-sm">Lng (opsional)</label>
              <input
                value={value.lng ?? ""}
                onChange={handleText("lng")}
                inputMode="decimal"
                className="w-full border border-gray-400 rounded-md px-3 py-2 mt-1 text-sm"
                placeholder="110.2..."
              />
            </div>
          </div>
        </div>

        {/* UPLOADS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LOGO */}
          <div>
            <label className="font-semibold text-sm mb-2 block">Logo Coffeeshop (opsional)</label>
            {value.logoPreviewUrl ? (
              <div className="relative w-40 h-40 rounded-lg overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value.logoPreviewUrl}
                  alt="Logo preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 bg-white rounded-full shadow p-1.5 text-red-600 hover:bg-red-50"
                  aria-label="Hapus logo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <label className="w-40 h-40 border rounded-lg flex flex-col items-center justify-center text-sm text-gray-600 cursor-pointer hover:bg-gray-50">
                <ImagePlus size={22} className="mb-1" />
                Unggah Logo
                <input type="file" accept="image/*" className="hidden" onChange={onPickLogo} />
              </label>
            )}
          </div>

          {/* COVER */}
          <div>
            <label className="font-semibold text-sm mb-2 block">Cover Coffeeshop (opsional)</label>
            {value.coverPreviewUrl ? (
              <div className="relative w-40 h-40 rounded-lg overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value.coverPreviewUrl}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeCover}
                  className="absolute -top-2 -right-2 bg-white rounded-full shadow p-1.5 text-red-600 hover:bg-red-50"
                  aria-label="Hapus cover"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <label className="w-40 h-40 border rounded-lg flex flex-col items-center justify-center text-sm text-gray-600 cursor-pointer hover:bg-gray-50">
                <ImagePlus size={22} className="mb-1" />
                Unggah Cover
                <input type="file" accept="image/*" className="hidden" onChange={onPickCover} />
              </label>
            )}
          </div>

          {/* GALLERY */}
          <div>
            <label className="font-semibold text-sm mb-2 block">Foto Suasana (opsional)</label>
            <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
              <ImagePlus size={18} />
              Tambah Foto
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onPickGallery}
              />
            </label>

            {value.galleryPreviewUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {value.galleryPreviewUrls.map((u, i) => (
                  <div key={i} className="relative rounded-md overflow-hidden border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt={`Galeri ${i + 1}`} className="w-full h-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryAt(i)}
                      className="absolute -top-2 -right-2 bg-white rounded-full shadow p-1 text-red-600 hover:bg-red-50"
                      aria-label="Hapus foto"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button
          type="button"
          onClick={tryNext}
          className="min-w-[150px] h-11 px-6 rounded-md font-semibold bg-[#271F01] text-white hover:bg-[#3b2f00] transition"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}
