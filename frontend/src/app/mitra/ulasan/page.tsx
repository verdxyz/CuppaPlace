"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiMyCafes, apiCafeReviews } from "@/lib/api";
import type { Cafe, Review, ListReviewsResp } from "@/types/domain";
import { routeForRole } from "@/lib/roles";

function Stars({ n }: { n: number }) {
  return (
    <div className="flex items-center text-yellow-500">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );
}

function fmtDate(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toISOString().slice(0, 10);
  } catch {
    return iso;
  }
}

export default function ReviewsPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && !["mitra", "admin"].includes(user.role)) {
      window.location.replace(routeForRole(user.role));
    }
  }, [loading, user]);

  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);

  const [items, setItems] = useState<Review[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [avg, setAvg] = useState<number>(0);
  const [counts, setCounts] = useState<Record<number, number>>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  });

  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [pending, setPending] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const res = await apiMyCafes();
        const list = res.data ?? [];
        setCafes(list);
        if (list.length && !activeId) setActiveId(list[0].id);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Gagal memuat daftar cafe");
      }
    })();
  }, [user, activeId]);

  const fetchReviews = useCallback(
    async (cid: number, star?: number | null) => {
      setPending(true);
      setErr(null);
      try {
        const resp = await apiCafeReviews(cid, {
          rating: star ?? undefined,
          limit: 100,
        });

        const payload = resp as ListReviewsResp;
        const data = payload.data ?? [];

        let avgLocal = payload.avg ?? 0;
        let countsLocal = payload.counts;

        if (!avgLocal || !countsLocal) {
          const cts: Record<number, number> = { 1:0,2:0,3:0,4:0,5:0 };
          let sum = 0;
          data.forEach((r: Review) => {
            cts[r.rating] = (cts[r.rating] ?? 0) + 1;
            sum += r.rating;
          });
          countsLocal = cts;
          avgLocal = data.length ? Number((sum / data.length).toFixed(2)) : 0;
        }

        setItems(data);
        setTotal(payload.total ?? data.length);
        setAvg(avgLocal);
        setCounts({
          1: countsLocal[1] ?? 0,
          2: countsLocal[2] ?? 0,
          3: countsLocal[3] ?? 0,
          4: countsLocal[4] ?? 0,
          5: countsLocal[5] ?? 0,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Gagal memuat ulasan";
        setErr(msg);
        showToast(msg);
      } finally {
        setPending(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    if (!activeId) return;
    void fetchReviews(activeId, ratingFilter);
  }, [activeId, ratingFilter, fetchReviews]);

  const activeCafe = useMemo(
    () => cafes.find((c) => c.id === activeId) ?? null,
    [cafes, activeId]
  );

  return (
    <section className="p-8 text-[#1b1405] space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          {activeCafe ? (
            <>
              Ulasan untuk: <b>{activeCafe.name}</b>
              {ratingFilter && (
                <span className="ml-2 text-gray-500">(Filter: {ratingFilter}★)</span>
              )}
            </>
          ) : "Tidak ada cafe"}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Pilih Cafe:</span>
          <select
            className="border border-gray-300/80 rounded-md px-3 py-2 bg-white"
            value={activeId ?? ""}
            onChange={(e) => setActiveId(Number(e.target.value) || null)}
          >
            {cafes.length === 0 && <option value="">—</option>}
            {cafes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-300/40 rounded-xl p-6 shadow-md">
        <h1 className="text-xl font-bold mb-3">Ulasan Pelanggan</h1>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Star size={30} className="fill-[#2b210a] text-[#2b210a]" />
            <p className="text-2xl font-bold">
              {avg || 0} <span className="text-base font-normal">/ 5.0</span>
            </p>
            <span className="text-sm text-gray-500">({total} ulasan)</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {[5,4,3,2,1].map((star) => (
              <button
                key={star}
                onClick={() => setRatingFilter(ratingFilter === star ? null : star)}
                disabled={pending}
                className={`border rounded-md px-3 py-1 text-sm flex items-center gap-2 transition-all duration-150
                  ${ratingFilter === star
                    ? "bg-[#2b210a] text-white border-[#2b210a]"
                    : "border-[#2b210a]/20 hover:bg-[#f9f8f6] hover:shadow-sm"
                  }`}
              >
                <Star
                  size={14}
                  className={ratingFilter === star ? "fill-white" : "fill-[#2b210a] text-[#2b210a]"}
                />
                {star} bintang
                <span className="text-xs opacity-75">({counts[star] ?? 0})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {pending && (
        <div className="bg-white border border-gray-300/40 rounded-xl p-6 shadow-md space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse flex gap-4 items-start">
              <div className="bg-[#f5f3f0] rounded-full w-12 h-12"></div>
              <div className="flex-1">
                <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-full bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!pending && (
        <div className="bg-white border border-gray-300/40 rounded-xl p-6 shadow-md space-y-6">
          {items.length === 0 && (
            <div className="text-sm text-gray-500">Belum ada ulasan untuk filter ini.</div>
          )}

          {items.map((review) => (
            <div key={review.id} className="border-b border-gray-300/40 pb-4 last:border-none">
              <div className="flex gap-4 items-start">
                <div className="bg-[#f5f3f0] rounded-full p-3 w-12 h-12 flex items-center justify-center text-xl text-[#2b210a] font-bold shadow-sm">
                  <span>👤</span>
                </div>

                <div className="flex-1">
                  <p className="font-bold">{review.user?.name || "Pengguna"}</p>
                  <Stars n={review.rating} />
                  <p className="text-sm text-gray-500 mb-2">{fmtDate(review.created_at)}</p>
                  <p className="leading-relaxed text-[#2b210a]/90">
                    {review.comment ?? ((review as unknown as Record<string, unknown>).text as string | undefined) ?? "—"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl px-4 py-2 shadow-lg border text-sm bg-red-50/95 border-red-200 text-red-900">
          {toast}
        </div>
      )}
    </section>
  );
}
