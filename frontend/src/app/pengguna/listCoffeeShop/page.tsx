// frontend/src/app/pengguna/listCoffeeShop/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import SlideShow from "@/components/SlideShow";
import { Coffee, Search } from "lucide-react";
import CoffeeShopCard from "@/components/CoffeeShopCard";
import { apiListCafes } from "@/lib/api";
import type { Cafe } from "@/types/domain";

type UiCafeCard = {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  category: string;
  img: string;
};

function pickImage(cafe: Cafe): string {
  // prioritas cover -> gallery[0] -> logo -> fallback
  const cover = cafe.cover_url ?? null;
  const g0 = cafe.galleries?.[0]?.image_url ?? null;
  const logo = cafe.logo_url ?? null;
  return cover || g0 || logo || "/img/home/bg-section.jpg";
}

// debounce helper (tanpa library)
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

export default function CoffeeShopPage() {
  const [items, setItems] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await apiListCafes({
          search: debouncedSearch.trim() ? debouncedSearch.trim() : undefined,
          limit: 50,
          offset: 0,
        });

        if (!active) return;
        setItems(res.data ?? []);
      } catch (e: unknown) {
        if (!active) return;
        const msg =
          typeof e === "object" && e !== null && "message" in e
            ? String((e as { message?: string }).message ?? "")
            : "";
        setError(msg || "Gagal memuat daftar coffeeshop.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [debouncedSearch]);

  const cards: UiCafeCard[] = useMemo(() => {
    return (items ?? []).map((c) => ({
      id: Number(c.id),
      name: c.name || "Coffeeshop",
      location: (c.address ?? "Alamat belum diisi").toString(),

      // NOTE:
      // Backend /api/cafes kamu belum kirim avg_rating & review_count,
      // jadi default 0 (tetap aman).
      rating: 0,
      reviews: 0,

      category: "Coffee Shop",
      img: pickImage(c),
    }));
  }, [items]);

  return (
    <div className="bg-[#F7F5F2] min-h-screen flex flex-col">
      {/* NAVBAR */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      {/* CONTENT */}
      <main className="flex-1 pt-[115px] max-w-6xl mx-auto w-full px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#2b210a] flex items-center gap-2">
              <Coffee className="text-[#5a452b]" /> Daftar Coffee Shop
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Temukan coffee shop terbaik yang kamu inginkan!!!
            </p>
          </div>

          {/* SEARCH */}
          <div className="w-full md:w-[360px]">
            <label className="text-xs text-gray-600 mb-1 block">
              Cari coffeeshop
            </label>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Contoh: Semarang / nama cafe..."
                className="w-full text-sm outline-none bg-transparent"
              />
            </div>
            {search !== debouncedSearch ? (
              <p className="text-[11px] text-gray-400 mt-1">
                Mencari...
              </p>
            ) : null}
          </div>
        </div>

        {/* STATES */}
        {loading ? (
          <div className="py-10">
            <p className="text-center text-sm text-gray-500">
              Memuat daftar coffeeshop...
            </p>
          </div>
        ) : error ? (
          <div className="py-10">
            <p className="text-center text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl py-3 px-4">
              {error}
            </p>
          </div>
        ) : cards.length === 0 ? (
          <div className="py-10">
            <p className="text-center text-sm text-gray-600">
              Tidak ada coffeeshop ditemukan.
            </p>
          </div>
        ) : (
          <div className="space-y-6 mb-10 mt-6">
            {cards.map((shop) => (
              <CoffeeShopCard
                key={shop.id}
                id={shop.id}
                name={shop.name}
                img={shop.img}
                location={shop.location}
                rating={shop.rating}
                reviews={shop.reviews}
                category={shop.category}
              />
            ))}
          </div>
        )}
      </main>

      {/* SLIDESHOW */}
      <div>
        <SlideShow />
      </div>
    </div>
  );
}
