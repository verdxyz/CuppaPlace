"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { MapPin, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  apiCafeDetail,
  apiCafeMenu,
  apiCafeReviews,
  apiCreateReview,
} from "@/lib/api";
import type { Cafe, MenuItem, Review } from "@/types/domain";
import { useAuth } from "@/lib/auth";
import CafeLiveFeed from "@/components/CafeLiveFeed";

function pickHeroImage(cafe: Cafe): string | null {
  if (cafe.cover_url) return cafe.cover_url;
  const g0 = cafe.galleries?.[0]?.image_url;
  if (g0) return g0;
  return null;
}

export default function CafeDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>(); // ✅ ambil params lewat hook
  const cafeId = Number(params?.id); // ✅ aman

  const { user } = useAuth();

  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newRating, setNewRating] = useState<number>(5);
  const [newText, setNewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    if (!cafeId || Number.isNaN(cafeId)) {
      setError("Coffeeshop tidak ditemukan.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [cafeRes, menuRes, reviewsRes] = await Promise.all([
          apiCafeDetail(cafeId),
          apiCafeMenu(cafeId),
          apiCafeReviews(cafeId, { limit: 20, status: "published" }),
        ]);

        if (!active) return;

        const menuData = Array.isArray(menuRes)
          ? menuRes
          : (menuRes as { data?: MenuItem[] })?.data ?? [];

        setCafe(cafeRes as Cafe);
        setMenus(menuData);
        setReviews((reviewsRes as { data?: Review[] })?.data ?? []);
      } catch (e: unknown) {
        if (!active) return;
        const msg =
          typeof e === "object" && e !== null && "message" in e
            ? (e as { message?: string }).message
            : undefined;
        setError(msg ?? "Gagal memuat data coffeeshop.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [cafeId]);

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu untuk memberi ulasan.");
      return;
    }
    if (!newText.trim()) {
      alert("Ulasan tidak boleh kosong.");
      return;
    }

    try {
      setSubmitting(true);
      const created = await apiCreateReview(cafeId, {
        rating: newRating,
        text: newText.trim(),
      });

      setReviews((prev) => [created as Review, ...prev]);
      setNewText("");
      setNewRating(5);
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err !== null && "message" in err
          ? (err as { message?: string }).message
          : undefined;
      alert(msg ?? "Gagal mengirim ulasan.");
    } finally {
      setSubmitting(false);
    }
  };

  const openMaps = () => {
    if (!cafe) return;
    const lat = cafe.lat ?? null;
    const lng = cafe.lng ?? null;

    let url: string;
    if (
      lat != null &&
      lng != null &&
      !Number.isNaN(Number(lat)) &&
      !Number.isNaN(Number(lng))
    ) {
      url = `https://www.google.com/maps?q=${lat},${lng}`;
    } else {
      const q = [cafe.name, cafe.address].filter(Boolean).join(" ");
      url = `https://www.google.com/maps?q=${encodeURIComponent(q)}`;
    }
    window.open(url, "_blank");
  };

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-white text-[#271F01]">
        <Navbar />
        <main className="container mx-auto px-4 md:px-8 pt-28 pb-10">
          <p className="text-center text-sm text-gray-500">
            Memuat data coffeeshop...
          </p>
        </main>

        {/* Live comment tetap bisa muncul */}
        {!Number.isNaN(cafeId) && cafeId ? (
          <div className="container mx-auto px-4 md:px-8 pb-10">
            <CafeLiveFeed
              variant="row"
              title="Live Comment"
              cafeId={cafeId}
              user={user ? { id: user.id, name: user.name } : null}
            />
          </div>
        ) : null}
      </div>
    );
  }

  // ERROR / NOT FOUND
  if (error || !cafe) {
    return (
      <div className="min-h-screen bg-white text-[#271F01]">
        <Navbar />
        <main className="container mx-auto px-4 md:px-8 pt-28 pb-10">
          <p className="text-center text-red-600 bg-red-50 border border-red-100 rounded-lg py-3 px-4">
            {error ?? "Coffeeshop tidak ditemukan."}
          </p>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Kembali
            </button>
          </div>
        </main>

        {!Number.isNaN(cafeId) && cafeId ? (
          <div className="container mx-auto px-4 md:px-8 pb-10">
            <CafeLiveFeed
              variant="row"
              title="Live Comment"
              cafeId={cafeId}
              user={user ? { id: user.id, name: user.name } : null}
            />
          </div>
        ) : null}
      </div>
    );
  }

  const hero = pickHeroImage(cafe);

  return (
    <div className="min-h-screen bg-white text-[#271F01]">
      <Navbar />

      <main className="container mx-auto px-4 md:px-8 pt-28 pb-10 space-y-7">
        {/* HEADER */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-gray-200/80 rounded-2xl px-5 py-4 bg-[#faf7f2]">
          <div className="space-y-2">
            <button
              onClick={() => router.back()}
              className="text-xs text-gray-600 hover:text-[#271F01] hover:underline"
            >
              ← Kembali
            </button>

            <div className="flex items-start gap-3">
              {cafe.logo_url ? (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-200 bg-white">
                  <Image
                    src={cafe.logo_url}
                    alt={`${cafe.name} logo`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : null}

              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold">{cafe.name}</h1>
                {cafe.address && (
                  <p className="flex items-center gap-1 text-sm text-gray-700">
                    <MapPin size={16} className="text-[#271F01]" />
                    <span>{cafe.address}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
              <span className="font-semibold text-lg">
                {avgRating.toFixed(1)}{" "}
                <span className="text-sm text-gray-500">({reviews.length} ulasan)</span>
              </span>
            </div>
            <button
              onClick={openMaps}
              className="inline-flex items-center gap-2 bg-[#271F01] text-white px-4 py-2 rounded-xl hover:bg-[#3C3110] text-sm"
            >
              <MapPin size={16} />
              Buka di Google Maps
            </button>
          </div>
        </section>

        

        {/* MAIN GRID */}
        <section className="grid gap-6 md:grid-cols-3">
          {/* LEFT */}
          <div className="md:col-span-2 space-y-4">
            <div className="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden border border-gray-200/80">
              {hero ? (
                <Image src={hero} alt={cafe.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-[#f3eee5] flex items-center justify-center text-sm text-gray-500">
                  Foto tidak tersedia
                </div>
              )}
            </div>

            {cafe.galleries && cafe.galleries.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {cafe.galleries.slice(0, 8).map((g) => (
                  <div
                    key={g.id}
                    className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-200 bg-[#f3eee5]"
                  >
                    <Image src={g.image_url} alt="Gallery" fill className="object-cover" />
                  </div>
                ))}
              </div>
            ) : null}

            <div className="border border-gray-200/80 rounded-2xl px-4 py-4 bg-white">
              <h2 className="text-xl font-semibold mb-3">Menu</h2>
              {menus.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Belum ada menu yang terdaftar untuk coffeeshop ini.
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {menus.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 rounded-xl border border-gray-200/70 hover:border-[#271F01]/60 hover:shadow-sm transition"
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#f3eee5] flex-shrink-0">
                        {item.photo_url ? (
                          <Image src={item.photo_url} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold text-sm">{item.name}</h3>
                        {item.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                        )}
                        <p className="text-sm font-semibold text-[#271F01]">
                          Rp {new Intl.NumberFormat("id-ID").format(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-4">
            <section className="border border-gray-200/80 rounded-2xl px-4 py-4 bg-white">
              <h2 className="text-lg font-semibold mb-3">Tulis Ulasan</h2>
              {!user && (
                <p className="text-xs text-gray-500 mb-2">
                  Anda perlu login terlebih dahulu untuk menulis ulasan.
                </p>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Rating</label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value) || 5)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#271F01]"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ulasan</label>
                  <textarea
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#271F01]"
                    placeholder="Ceritakan pengalamanmu di coffeeshop ini..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !user}
                  className="w-full bg-[#271F01] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#3C3110] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Mengirim..." : "Kirim Ulasan"}
                </button>
              </form>
            </section>

            <section className="border border-gray-200/80 rounded-2xl px-4 py-4 bg-white">
              <h2 className="text-lg font-semibold mb-3">Ulasan Pengunjung</h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Belum ada ulasan. Jadilah yang pertama memberikan ulasan!
                </p>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200/80 rounded-xl px-3 py-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#f3eee5] flex items-center justify-center text-xs font-semibold text-[#271F01]">
                            {review.user?.name?.charAt(0) ?? "U"}
                          </div>
                          <div>
                            <p className="text-xs font-semibold">{review.user?.name ?? "User"}</p>
                            <p className="text-[10px] text-gray-500">
                              {new Date(review.created_at).toLocaleDateString("id-ID")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[11px]">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-400" />
                          <span className="font-semibold">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {review.comment ?? review.text ?? "—"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
        {/* LIVE COMMENT FULL WIDTH (SESUIAI DESAIN KAMU) */}
        <CafeLiveFeed
          variant="row"
          title="Live Comment"
          cafeId={cafeId}
          user={user ? { id: user.id, name: user.name } : null}
        />
      </main>
    </div>
  );
}
