// src/components/CafeSection.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiListCafes, API_BASE } from "@/lib/api";
import type { Cafe } from "@/types/domain";

export default function CafeSection() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await apiListCafes(); 
        if (!mounted) return;
        setCafes(res.data ?? []);
      } catch {
        setCafes([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section
      id="coffeeshop"
      className="bg-white text-[#2b210a] py-20 px-6 md:px-16"
    >
      <h2 className="text-4xl md:text-5xl font-extrabold mb-12">
        Rekomendasi untuk Kamu
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-20 justify-items-center">
        {loading && [0, 1, 2].map((i) => <SkeletonCard key={i} />)}
        {!loading &&
          cafes.map((cafe) => <CafeCard key={cafe.id} cafe={cafe} />)}
        {!loading && cafes.length === 0 && (
          <div className="col-span-full text-center text-sm text-gray-600">
            Belum ada data coffeeshop.
          </div>
        )}
      </div>

      <div className="flex justify-center mt-14">
        <AllCafesButton />
      </div>
    </section>
  );
}

function AllCafesButton() {
  const router = useRouter();
  return (
    <Link
      href="/pengguna/listCoffeeShop"
      className="bg-[#2b210a] text-white px-8 py-4 rounded-2xl text-lg font-medium hover:bg-[#4b3b09] transition"
    >
      Lihat Semua Daftar Coffeeshop
    </Link>
  );
}

function resolveCafeImage(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const src = raw.trim();
  if (!src) return null;

  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  if (API_BASE) {
    const base = API_BASE.replace(/\/+$/, "");
    const path = src.startsWith("/") ? src : `/${src}`;
    return `${base}${path}`;
  }

  return src.startsWith("/") ? src : `/${src}`;
}

function CafeCard({ cafe }: { cafe: Cafe }) {
  const router = useRouter();
  const cover = resolveCafeImage(cafe.cover_url);
  const logo = resolveCafeImage(cafe.logo_url);
  const photo = resolveCafeImage(cafe.photo_url);


  const baseImages: string[] = [];
  if (cover) baseImages.push(cover);
  else if (logo) baseImages.push(logo);
  else if (photo) baseImages.push(photo);

  // fallback ke gambar lokal yang PASTI ada
  const placeholder = "/img/login/LoginPage.jpg";

  const images = baseImages.length > 0 ? baseImages : [placeholder];
  const imagesExtended = [...images, images[0]];

  const [idx, setIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [hoverImage, setHoverImage] = useState(false);

  const slideRef = useRef<HTMLDivElement | null>(null);
  const slideCount = imagesExtended.length;

  const intervalMs = 3000;
  const transitionMs = 700;

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((prev) => prev + 1);
      setIsTransitioning(true);
    }, intervalMs);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (idx === images.length) {
      const endTimer = setTimeout(() => {
        setIsTransitioning(false);
        setIdx(0);
        setTimeout(() => setIsTransitioning(true), 20);
      }, transitionMs + 20);
      return () => clearTimeout(endTimer);
    }
  }, [idx, images.length, transitionMs]);

  const slideWidthPercent = 100 / slideCount;

  const slug = cafe.slug || String(cafe.id);
  const mapsHref = getMapsLink(cafe);

  return (
    <div className="relative w-[280px] sm:w-[300px] md:w-[350px] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all bg-white border border-gray-200 group">
      <div
        className="relative w-full h-[380px] overflow-hidden cursor-pointer"
        onMouseEnter={() => setHoverImage(true)}
        onMouseLeave={() => setHoverImage(false)}
      >
        <div
          ref={slideRef}
          className={`flex ${isTransitioning ? "transition-transform" : ""}`}
          style={{
            width: `${slideCount * 100}%`,
            transitionDuration: isTransitioning ? `${transitionMs}ms` : "0ms",
            transform: `translateX(-${idx * slideWidthPercent}%)`,
          }}
        >
          {imagesExtended.map((src, i) => (
            <div
              key={`${src}-${i}`}
              style={{ width: `${slideWidthPercent}%` }}
              className="relative h-[380px] flex-shrink-0"
            >
              <Image
                src={src}
                alt={`${cafe.name}-${i}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        <div
          className={`absolute bottom-0 left-0 w-full bg-white/20 backdrop-blur-sm text-white flex flex-col items-center justify-end transition-all duration-700 ease-in-out ${
            hoverImage ? "h-full" : "h-[60px]"
          }`}
        >
          <div
            className={`flex flex-col items-center transition-all duration-700 ease-in-out ${
              hoverImage ? "translate-y-[-120px]" : "translate-y-[40px]"
            }`}
          >
            <p className="text-2xl font-bold tracking-wide text-center">
              {cafe.name}
            </p>

            <button
              onClick={() => router.push(`/pengguna/coffeeshop/${cafe.id}`)}
              className={`mt-4 bg-white text-[#2b210a] font-semibold px-5 py-2 rounded-full shadow-sm transition-all duration-700 ease-in-out ${
                hoverImage
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-5"
              } hover:bg-[#4b3b09] hover:text-white`}
            >
              Lihat Selengkapnya
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 text-center bg-white">
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group/location relative flex items-center justify-center w-full transition-all duration-500"
        >
          <div className="w-80 h-10 absolute inset-0 rounded-xl bg-transparent group-hover/location:bg-[#271F01] transition-all duration-500"></div>

          <div className="flex items-center justify-center gap-2 z-10 py-1">
            <MapPin className="w-8 h-8 text-[#4b3b09] transition-all duration-500 group-hover/location:translate-x-[-24px] group-hover/location:text-white" />

            <span className="text-gray-700 text-sm font-medium transition-all duration-500 opacity-100 group-hover/location:opacity-0">
              {cafe.address ?? "Alamat tidak tersedia"}
            </span>
          </div>

          <span className="absolute z-10 justify-center text-white font-bold text-[16px] opacity-0 group-hover/location:opacity-100 transition-all duration-500 translate-y-2 group-hover/location:translate-y-0">
            Buka di Google Maps
          </span>
        </a>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="relative w-[280px] sm:w-[300px] md:w-[350px] rounded-2xl overflow-hidden shadow-md bg-white border border-gray-200">
      <div className="w-full h-[380px] bg-neutral-200 animate-pulse" />
      <div className="p-4">
        <div className="h-5 w-1/2 bg-neutral-200 rounded mb-2 animate-pulse" />
        <div className="h-4 w-full bg-neutral-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

function getMapsLink(cafe: Cafe): string {
  const lat = toNum(cafe.lat as string | number | null | undefined);
  const lng = toNum(cafe.lng as string | number | null | undefined);
  if (lat !== null && lng !== null) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
  const q = [cafe.name, cafe.address].filter(Boolean).join(" ");
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}`;
}

function toNum(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}
