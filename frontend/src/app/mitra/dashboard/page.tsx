// src/app/mitra/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth";
import { apiMitraDashboard } from "@/lib/api";
import { routeForRole } from "@/lib/roles";
import type { MitraDashboardResp } from "@/types/domain";

export default function MitraDashboard() {
  const { user, loading } = useAuth();
  const [data, setData] = useState<MitraDashboardResp | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [fetching, setFetching] = useState<boolean>(false);

  // Guard role: hanya mitra & admin
  useEffect(() => {
    if (!loading) {
      if (!user) return; // biarkan middleware/route login yang handle
      if (user.role !== "mitra" && user.role !== "admin") {
        window.location.replace(routeForRole(user.role));
      }
    }
  }, [loading, user]);

  // Fetch data dashboard
  useEffect(() => {
    if (!user) return;
    const run = async () => {
      setFetching(true);
      setErr(null);
      try {
        const res = await apiMitraDashboard();
        setData(res);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Gagal memuat dashboard";
        setErr(msg);
      } finally {
        setFetching(false);
      }
    };
    void run();
  }, [user]);

  // Chart visitors: tidak ada dummy, kalau kosong ya grafis kosong
  const chartData = useMemo(
    () => data?.visitors ?? [],
    [data?.visitors]
  );

  // Cards summary: semua fallback ke 0 (bukan angka fiktif)
  const cards = useMemo(() => {
    const daily = data?.cards.daily_sales ?? 0;
    const monthly = data?.cards.monthly_sales ?? 0;
    const rating = data?.cards.avg_rating ?? 0;
    const reviews = data?.cards.review_count ?? 0;
    const favorites = data?.cards.favorites_count ?? 0;

    return [
      { title: "Total Penjualan Harian", value: daily.toLocaleString("id-ID") },
      { title: "Total Penjualan Bulanan", value: monthly.toLocaleString("id-ID") },
      {
        title: "AVG Rating",
        value: (
          <span className="flex items-center gap-2">
            <Star className="fill-yellow-400 text-yellow-400" size={22} />
            {Number(rating).toFixed(1)}
          </span>
        ),
      },
      { title: "Jumlah Ulasan", value: reviews.toLocaleString("id-ID") },
      { title: "Jumlah Favorit", value: favorites.toLocaleString("id-ID") },
    ];
  }, [data]);

  return (
    <>
      <div className="relative z-50">
        <Navbar />
      </div>

      <section className="p-8 grid grid-cols-3 gap-6 text-[#271F01] pt-24">
        {err && (
          <div className="col-span-3 bg-red-50 border border-red-200 text-red-900 rounded-xl p-3">
            {err}
          </div>
        )}

        {/* Kartu ringkasan */}
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <p className="font-semibold mb-1">{card.title}</p>
            <p className="text-3xl font-bold">
              {fetching && typeof card.value === "string" ? (
                <span className="inline-block w-24 h-7 bg-gray-200 rounded animate-pulse" />
              ) : (
                card.value
              )}
            </p>
          </div>
        ))}

        <div></div>

        {/* Grafik Pengunjung */}
        <div className="col-span-2 bg-white p-6 rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300">
          <p className="font-semibold mb-4">Grafik Pengunjung Harian</p>
          <div className="h-72 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 40, bottom: 15, left: 25, right: 25 }}
              >
                <XAxis
                  dataKey="name"
                  tickMargin={10}
                  tick={{ fill: "#1b1405", fontSize: 12 }}
                  padding={{ left: 30, right: 30 }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2b210a"
                  strokeWidth={3}
                  dot={false}
                  connectNulls
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Menu Rekomendasi (tanpa dummy) */}
        <div className="bg-white p-6 rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <p className="font-semibold">Menu Rekomendasi</p>
            <Link
              href="/mitra/menu"
              className="bg-[#2b210a] text-white px-3 py-1 rounded-md text-sm hover:bg-[#443716] transition"
            >
              Edit
            </Link>
          </div>

          {(!data?.recommendations || data.recommendations.length === 0) ? (
            <p className="text-sm text-gray-500">
              Belum ada menu rekomendasi. Silakan atur di halaman Menu Mitra.
            </p>
          ) : (
            <ul className="space-y-2">
              {(data.recommendations ?? []).map((menu, i) => (
                <li
                  key={`${menu}-${i}`}
                  className="px-3 py-2 bg-[#f5f5f5] rounded-md hover:bg-[#ebe7e3] transition"
                >
                  {menu}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
