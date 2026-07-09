// src/components/mitra-form/StepFasilitas.tsx
"use client";

import { useMemo } from "react";
import type { OpeningHours, DayHours, TimeRange } from "@/types/mitra";

type Props = {
  selected: string[];
  openingHours: OpeningHours;
  onChange: (list: string[]) => void;
  onChangeHours: (hours: OpeningHours) => void;
  onNext: () => void;
  onBack: () => void;
  notify?: (msg: string, kind?: "success" | "error" | "info") => void;
};

const ALL_FACILITIES = [
  "Wi-Fi",
  "Indoor",
  "Outdoor",
  "Smoking Area",
  "Non-Smoking",
  "AC",
  "Colokan",
  "Toilet",
  "Mushola",
  "Live Music",
];

const DAY_LABELS: { key: keyof OpeningHours; label: string }[] = [
  { key: "mon", label: "Senin" },
  { key: "tue", label: "Selasa" },
  { key: "wed", label: "Rabu" },
  { key: "thu", label: "Kamis" },
  { key: "fri", label: "Jumat" },
  { key: "sat", label: "Sabtu" },
  { key: "sun", label: "Minggu" },
];

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  return h * 60 + m;
}

interface TimeValidationResult {
  ok: boolean;
  msg?: string;
  s?: number;
  e?: number;
}

interface ValidTimeRange {
  ok: true;
  s: number;
  e: number;
}

function validateAll(hours: OpeningHours): string[] {
  const errs: string[] = [];
  let oneOpen = false;

  for (const { key, label } of DAY_LABELS) {
    const d = hours[key];
    if (!d.open) continue;
    oneOpen = true;
    if (d.allDay) continue;
    const ranges = d.ranges ?? [];
    if (!ranges.length) {
      errs.push(`${label}: belum ada rentang jam`);
      continue;
    }
    const parsed = ranges.map((r, i) => {
      const s = toMin(r.start);
      const e = toMin(r.end);
      if (Number.isNaN(s) || Number.isNaN(e)) return { ok: false, msg: `${label}: format jam tidak valid (range #${i + 1})` };
      if (s >= e) return { ok: false, msg: `${label}: jam mulai harus < jam selesai (range #${i + 1})` };
      return { ok: true, s, e };
    });
    for (const p of parsed) if (!p.ok) { errs.push(p.msg!); continue; }
    const sorted = (parsed.filter((p): p is ValidTimeRange => p.ok)).sort((a, b) => a.s - b.s);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].s < sorted[i - 1].e) {
        errs.push(`${label}: rentang bertabrakan (range #${i} & #${i + 1})`);
        break;
      }
    }
  }
  if (!oneOpen) errs.push("Semua hari tutup—isi minimal 1 hari buka.");
  return errs;
}

export default function StepFasilitas({
  selected,
  openingHours,
  onChange,
  onChangeHours,
  onNext,
  onBack,
  notify,
}: Props) {
  const canNext = useMemo(() => {
    if (selected.length === 0) return false;
    return validateAll(openingHours).length === 0;
  }, [selected.length, openingHours]);

  const toggleItem = (name: string) => {
    const set = new Set(selected);
    if (set.has(name)) set.delete(name);
    else set.add(name);
    onChange(Array.from(set));
  };

  const setDay = (key: keyof OpeningHours, patch: Partial<DayHours>) => {
    onChangeHours({ ...openingHours, [key]: { ...openingHours[key], ...patch } });
  };

  const addRange = (key: keyof OpeningHours) => {
    const d = openingHours[key];
    const next: TimeRange = { start: "08:00", end: "22:00" };
    setDay(key, { ranges: [...(d.ranges ?? []), next], open: true, allDay: false });
  };

  const removeRange = (key: keyof OpeningHours, idx: number) => {
    const d = openingHours[key];
    const arr = [...(d.ranges ?? [])];
    arr.splice(idx, 1);
    setDay(key, { ranges: arr });
  };

  const updateRange = (key: keyof OpeningHours, idx: number, patch: Partial<TimeRange>) => {
    const d = openingHours[key];
    const arr = [...(d.ranges ?? [])];
    arr[idx] = { ...arr[idx], ...patch };
    setDay(key, { ranges: arr, allDay: false });
  };

  const toggleOpen = (key: keyof OpeningHours, open: boolean) => {
    if (!open) {
      setDay(key, { open: false, allDay: false, ranges: [] });
    } else {
      const current = openingHours[key];
      setDay(key, {
        open: true,
        allDay: false,
        ranges: current.ranges.length ? current.ranges : [{ start: "08:00", end: "22:00" }],
      });
    }
  };

  const setAllDay = (key: keyof OpeningHours, allDay: boolean) => {
    if (allDay) {
      setDay(key, { open: true, allDay: true, ranges: [{ start: "00:00", end: "23:59" }] });
    } else {
      setDay(key, { allDay: false, ranges: [{ start: "08:00", end: "22:00" }] });
    }
  };

  const copyFrom = (from: keyof OpeningHours, target: "all" | "weekdays" | "weekend") => {
    const src = openingHours[from];
    const payload: DayHours = { open: src.open, allDay: src.allDay, ranges: [...(src.ranges ?? [])] };
    const next = { ...openingHours };
    const wk: (keyof OpeningHours)[] = ["mon", "tue", "wed", "thu", "fri"];
    const we: (keyof OpeningHours)[] = ["sat", "sun"];
    if (target === "all") {
      (["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as (keyof OpeningHours)[]).forEach((k) => (next[k] = { ...payload }));
    } else if (target === "weekdays") {
      wk.forEach((k) => (next[k] = { ...payload }));
    } else {
      we.forEach((k) => (next[k] = { ...payload }));
    }
    onChangeHours(next);
    notify?.("Jam disalin.", "success");
  };

  const doNext = () => {
    if (!selected.length) {
      notify?.("Pilih setidaknya 1 fasilitas.", "error");
      return;
    }
    const errs = validateAll(openingHours);
    if (errs.length) {
      notify?.(`Periksa jam operasional:\n- ${errs.join("\n- ")}`, "error");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-300/40 shadow-md hover:shadow-lg">
        <h3 className="text-xl font-bold mb-2">Fasilitas</h3>
        <p className="text-sm text-gray-600 mb-4">Pilih fasilitas yang tersedia di coffeeshop-mu.</p>
        <div className="flex flex-wrap gap-2">
          {ALL_FACILITIES.map((f) => {
            const active = selected.includes(f);
            return (
              <button
                key={f}
                type="button"
                onClick={() => toggleItem(f)}
                className={`px-3 py-1.5 rounded-full border text-sm transition ${
                  active ? "bg-[#2b210a] text-white border-[#2b210a]" : "bg-white text-[#2b210a] border-gray-300 hover:bg-gray-50"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-300/40 shadow-md hover:shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-xl font-bold">Jam Operasional</h3>
            <p className="text-sm text-gray-600">Atur jam buka/tutup untuk setiap hari.</p>
          </div>
          <div className="flex gap-2">
          </div>
        </div>

        <div className="mt-5 space-y-5">
          {DAY_LABELS.map(({ key, label }) => {
            const d = openingHours[key];
            return (
              <div key={key} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <h4 className="font-semibold min-w-[68px]">{label}</h4>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={d.open} onChange={(e) => toggleOpen(key, e.target.checked)} />
                      <span>{d.open ? "Buka" : "Tutup"}</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={!!d.allDay} disabled={!d.open} onChange={(e) => setAllDay(key, e.target.checked)} />
                      <span>24 Jam</span>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
                      onClick={() => copyFrom(key, "all")}
                      title="Salin ke semua hari"
                    >
                      Copy → Semua
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
                      onClick={() => copyFrom(key, "weekdays")}
                      title="Salin ke Sen–Jum"
                    >
                      Copy → Weekdays
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
                      onClick={() => copyFrom(key, "weekend")}
                      title="Salin ke Sab–Min"
                    >
                      Copy → Weekend
                    </button>
                  </div>
                </div>

                {d.open && !d.allDay && (
                  <div className="mt-3 space-y-3">
                    {(d.ranges ?? []).map((r, idx) => (
                      <div key={idx} className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Mulai</label>
                          <input
                            type="time"
                            value={r.start}
                            onChange={(e) => updateRange(key, idx, { start: e.target.value })}
                            className="border rounded-md px-2 py-1"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Selesai</label>
                          <input
                            type="time"
                            value={r.end}
                            onChange={(e) => updateRange(key, idx, { end: e.target.value })}
                            className="border rounded-md px-2 py-1"
                          />
                        </div>
                        <button className="ml-auto px-3 py-1.5 rounded-md border text-sm text-red-600 hover:bg-red-50" onClick={() => removeRange(key, idx)}>
                          Hapus
                        </button>
                      </div>
                    ))}

                    <button className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50" onClick={() => addRange(key)}>
                      + Tambah Rentang Jam
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <button className="px-4 py-2 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50" onClick={onBack}>
          Kembali
        </button>
        <button
          className={`px-4 py-2 rounded-md ${canNext ? "bg-[#2b210a] text-white hover:bg-[#423614]" : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
          onClick={doNext}
          disabled={!canNext}
        >
          Lanjutkan
        </button>
      </div>
    </div>
  );
}
