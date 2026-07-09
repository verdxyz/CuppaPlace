// src/app/mitra/laporan/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useAuth } from "@/lib/auth";
import { apiMyCafes, apiMitraReport } from "@/lib/api";
import type { Cafe, ReportSeriesPoint } from "@/types/domain";
import { routeForRole } from "@/lib/roles";

type Period = "daily" | "monthly" | "yearly";

const COLOR = "#2b210a";

const FALLBACK = {
  daily: [
    { name: "Senin", value: 30 },
    { name: "Selasa", value: 50 },
    { name: "Rabu", value: 35 },
    { name: "Kamis", value: 55 },
    { name: "Jumat", value: 45 },
    { name: "Sabtu", value: 60 },
    { name: "Minggu", value: 60 },
  ],
  monthly: [
    { name: "Januari", value: 100 },
    { name: "Februari", value: 110 },
    { name: "Maret", value: 95 },
    { name: "April", value: 120 },
    { name: "Mei", value: 115 },
    { name: "Juni", value: 105 },
    { name: "Juli", value: 118 },
    { name: "Agustus", value: 125 },
    { name: "September", value: 110 },
    { name: "Oktober", value: 130 },
    { name: "November", value: 140 },
    { name: "Desember", value: 150 },
  ],
  yearly: [
    { name: "2020", value: 500 },
    { name: "2021", value: 700 },
    { name: "2022", value: 750 },
    { name: "2023", value: 720 },
    { name: "2024", value: 800 },
    { name: "2025", value: 850 },
    { name: "2026", value: 820 },
  ],
} satisfies Record<Period, ReportSeriesPoint[]>;

export default function LaporanPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && !["mitra", "admin"].includes(user.role)) {
      window.location.replace(routeForRole(user.role));
    }
  }, [loading, user]);

  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [cafeId, setCafeId] = useState<number | null>(null);

  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [daily, setDaily] = useState<ReportSeriesPoint[]>(FALLBACK.daily);
  const [monthly, setMonthly] = useState<ReportSeriesPoint[]>(FALLBACK.monthly);
  const [yearly, setYearly] = useState<ReportSeriesPoint[]>(FALLBACK.yearly);

  /** ringkasan angka besar di kartu */
  const totalDaily = useMemo(
    () => daily.reduce((a, b) => a + (Number(b.value) || 0), 0),
    [daily]
  );
  const totalMonthly = useMemo(
    () => monthly.reduce((a, b) => a + (Number(b.value) || 0), 0),
    [monthly]
  );
  const totalYearly = useMemo(
    () => yearly.reduce((a, b) => a + (Number(b.value) || 0), 0),
    [yearly]
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await apiMyCafes(); 
        const list = res.data ?? [];
        setCafes(list);
        if (list.length && !cafeId) setCafeId(list[0].id);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Gagal memuat daftar cafe";
        setErr(msg);
      }
    })();
  }, [cafeId]);

  /** fetch semua periode untuk cafe aktif */
  const fetchAll = useCallback(
    async (cid: number) => {
      setPending(true);
      setErr(null);
      try {
        const [rDaily, rMonthly, rYearly] = await Promise.all([
          apiMitraReport(cid, { period: "daily" }),
          apiMitraReport(cid, { period: "monthly" }),
          apiMitraReport(cid, { period: "yearly" }),
        ]);

        setDaily((rDaily?.series?.length ? rDaily.series : FALLBACK.daily) as ReportSeriesPoint[]);
        setMonthly((rMonthly?.series?.length ? rMonthly.series : FALLBACK.monthly) as ReportSeriesPoint[]);
        setYearly((rYearly?.series?.length ? rYearly.series : FALLBACK.yearly) as ReportSeriesPoint[]);
      } catch (e) {
        // aman: kalau gagal API, tampilkan fallback (UI tetap rapi)
        setDaily(FALLBACK.daily);
        setMonthly(FALLBACK.monthly);
        setYearly(FALLBACK.yearly);
        const msg = e instanceof Error ? e.message : "Gagal memuat laporan, menampilkan data contoh.";
        setErr(msg);
      } finally {
        setPending(false);
      }
    },
    []
  );

  useEffect(() => {
    if (cafeId) void fetchAll(cafeId);
  }, [cafeId, fetchAll]);

  /** komponen chart generik, biar DRY */
  const ChartBlock = ({
    title,
    data,
  }: {
    title: string;
    data: ReportSeriesPoint[];
  }) => (
    <div>
      <p className="font-semibold mb-2">{title}</p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 40, left: 40, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#1b1405", fontSize: 12 }}
              interval={0}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #ddd" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={COLOR}
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
  );

  return (
    <section className="p-8 text-[#1b1405] space-y-6">
      {/* Pilih Cafe (muncul hanya jika >1 cafe) */}
      {cafes.length > 1 && (
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Pilih Cafe:</span>
            <select
              className="border border-gray-300/80 rounded-md px-3 py-2 bg-white"
              value={cafeId ?? ""}
              onChange={(e) => setCafeId(Number(e.target.value) || null)}
              disabled={pending}
            >
              {cafes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Informasi Cafe / Ringkasan */}
      <div className="bg-white border border-gray-300/40 rounded-xl p-6 shadow-md">
        <h1 className="text-xl font-bold mb-4">Informasi Cafe</h1>

        {err && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
            {err}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="border border-gray-300/40 rounded-xl p-5 text-center shadow-sm bg-white">
            <p className="font-semibold">Harian</p>
            <p className="text-3xl font-bold mt-2">{totalDaily}</p>
          </div>
          <div className="border border-gray-300/40 rounded-xl p-5 text-center shadow-sm bg-white">
            <p className="font-semibold">Bulanan</p>
            <p className="text-3xl font-bold mt-2">{totalMonthly}</p>
          </div>
          <div className="border border-gray-300/40 rounded-xl p-5 text-center shadow-sm bg-white">
            <p className="font-semibold">Tahunan</p>
            <p className="text-3xl font-bold mt-2">{totalYearly}</p>
          </div>
        </div>
      </div>

      {/* Grafik Pengunjung */}
      <div className="bg-white border border-gray-300/40 rounded-xl p-6 shadow-md">
        <h2 className="text-lg font-bold mb-6">Grafik Pengunjung</h2>

        {/* shimmer sederhana saat loading */}
        {pending ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse h-72 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-14">
            <ChartBlock title="Harian" data={daily} />
            <ChartBlock title="Bulanan" data={monthly} />
            <ChartBlock title="Tahunan" data={yearly} />
          </div>
        )}
      </div>
    </section>
  );
}
