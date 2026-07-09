// src/app/mitra/manajemen-cafe/menu/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  apiMyCafes,
  apiCafeMenu,
  apiCreateMenuItem,
  apiUpdateMenuItem,
  apiDeleteMenuItem,
} from "@/lib/api";
import type { Cafe, MenuItem } from "@/types/domain";
import { routeForRole } from "@/lib/roles";

/** ====== Utilities ====== */
const toIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );

/** ====== Page ====== */
export default function KelolaMenuPage() {
  const { user, loading } = useAuth();

  // Guard role
  useEffect(() => {
    if (!loading) {
      if (!user) return;
      if (user.role !== "mitra" && user.role !== "admin") {
        window.location.replace(routeForRole(user.role));
      }
    }
  }, [loading, user]);

  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [activeCafeId, setActiveCafeId] = useState<number | null>(null);

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [fetching, setFetching] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // UI modal & toast
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [showConfirm, setShowConfirm] = useState<null | { id: number; name: string }>(null);
  const [toast, setToast] = useState<null | { kind: "success" | "error"; msg: string }>(null);

  const notify = useCallback((msg: string, kind: "success" | "error" = "success") => {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 2400);
  }, []);

  // Load cafes milik mitra
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await apiMyCafes(); // GET /api/users/me/cafes
        setCafes(res.data ?? []);
        if (res.data?.length && !activeCafeId) {
          setActiveCafeId(res.data[0].id);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Gagal memuat cafe";
        setErr(msg);
      }
    })();
  }, [user, activeCafeId]);

  // Load menu by cafe
  const refreshMenu = useCallback(async () => {
    if (!activeCafeId) return;
    setFetching(true);
    setErr(null);
    try {
      const res = await apiCafeMenu(activeCafeId);
      setMenu((res as { data: MenuItem[] }).data ?? res ?? []); // kompatibel dgn 2 bentuk response
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal memuat menu";
      setErr(msg);
    } finally {
      setFetching(false);
    }
  }, [activeCafeId]);

  useEffect(() => {
    void refreshMenu();
  }, [refreshMenu]);

  const activeCafe = useMemo(
    () => cafes.find((c) => c.id === activeCafeId) ?? null,
    [cafes, activeCafeId]
  );

  const onAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const onEdit = (item: MenuItem) => {
    setEditing(item);
    setShowForm(true);
  };

  const onDelete = (item: MenuItem) => {
    setShowConfirm({ id: item.id, name: item.name });
  };

  const handleDelete = async () => {
    if (!showConfirm) return;
    try {
      await apiDeleteMenuItem(showConfirm.id);
      notify("Menu dihapus");
      setShowConfirm(null);
      await refreshMenu();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal menghapus";
      notify(msg, "error");
    }
  };

  return (
    <div className="flex min-h-screen text-[#1b1405] bg-[#faf9f7]">
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Content */}
        <section className="p-8 space-y-6">
          {/* Header Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-300/40 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-md hover:shadow-lg">
            <div className="space-y-1">
              <h3 className="text-xl font-bold">Kelola Menu</h3>
              <p className="text-sm text-gray-600">
                Kelola menu yang ingin anda tampilkan di halaman coffeeshop!
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Pilih Cafe kalau >1 */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Cafe:</span>
                <select
                  className="border border-gray-300 rounded-md px-3 py-2"
                  value={activeCafeId ?? ""}
                  onChange={(e) => setActiveCafeId(Number(e.target.value) || null)}
                >
                  {cafes.length === 0 && <option value="">—</option>}
                  {cafes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={onAdd}
                className="bg-[#2b210a] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#423614] transition"
                disabled={!activeCafeId}
              >
                + Tambah Menu
              </button>
            </div>
          </div>

          {/* Error strip */}
          {err && (
            <div className="bg-red-50 border border-red-200 text-red-900 rounded-lg px-4 py-3">
              {err}
            </div>
          )}

          {/* Table Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-300/40 shadow-md hover:shadow-lg">
            <h3 className="text-xl font-bold mb-4">
              Daftar Menu {activeCafe ? `– ${activeCafe.name}` : ""}
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-100/40 border-b border-gray-300/40">
                    <th className="p-3 border-b border-gray-300/70">Nama Menu</th>
                    <th className="p-3 border-b border-gray-300/70">Kategori</th>
                    <th className="p-3 border-b border-gray-300/70">Harga</th>
                    <th className="p-3 border-b border-gray-300/70">Deskripsi</th>
                    <th className="p-3 border-b border-gray-300/70">Foto</th>
                    <th className="p-3 border-b border-gray-300/70 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {fetching ? (
                    [...Array(6)].map((_, i) => (
                      <tr key={i} className="border-b border-gray-300/70 h-12">
                        <td className="p-3">
                          <span className="inline-block h-4 w-32 bg-gray-200 rounded animate-pulse" />
                        </td>
                        <td className="p-3">
                          <span className="inline-block h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        </td>
                        <td className="p-3">
                          <span className="inline-block h-4 w-20 bg-gray-200 rounded animate-pulse" />
                        </td>
                        <td className="p-3">
                          <span className="inline-block h-4 w-48 bg-gray-200 rounded animate-pulse" />
                        </td>
                        <td className="p-3">
                          <span className="inline-block h-8 w-16 bg-gray-200 rounded animate-pulse" />
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-block h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : menu.length === 0 ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i} className="border-b border-gray-300/70 hover:bg-gray-50 transition h-12">
                        <td className="p-3">—</td>
                        <td className="p-3">—</td>
                        <td className="p-3">—</td>
                        <td className="p-3">—</td>
                        <td className="p-3">—</td>
                        <td className="p-3 text-center space-x-2">
                          <button className="text-blue-600 hover:underline text-sm" disabled>
                            Edit
                          </button>
                          <button className="text-red-600 hover:underline text-sm" disabled>
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    menu.map((m) => (
                      <tr key={m.id} className="border-b border-gray-300/70 hover:bg-gray-50 transition">
                        <td className="p-3 font-medium">{m.name}</td>
                        <td className="p-3">{m.category ?? "—"}</td>
                        <td className="p-3">{toIDR(m.price)}</td>
                        <td className="p-3">
                          <span className="line-clamp-2">{m.description ?? "—"}</span>
                        </td>
                        <td className="p-3">
                          {m.photo_url ? (
                            // pakai <img> biasa biar simpel; nanti bisa ganti ke next/image
                            <img
                              src={m.photo_url}
                              alt={m.name}
                              className="w-16 h-16 object-cover rounded border border-gray-200"
                            />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-3 text-center space-x-2">
                          <button
                            onClick={() => onEdit(m)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(m)}
                            className="text-red-600 hover:underline text-sm"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Modal Form */}
      {showForm && (
        <MenuFormModal
          cafeId={activeCafeId!}
          initial={editing ?? undefined}
          onClose={() => setShowForm(false)}
          onSaved={async () => {
            setShowForm(false);
            await refreshMenu();
            notify(editing ? "Menu diperbarui" : "Menu ditambahkan");
          }}
        />
      )}

      {/* Confirm Delete */}
      {showConfirm && (
        <ConfirmDialog
          title="Hapus Menu"
          message={`Yakin ingin menghapus "${showConfirm.name}"? Tindakan ini tidak dapat dibatalkan.`}
          onCancel={() => setShowConfirm(null)}
          onConfirm={handleDelete}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl px-4 py-2 shadow-lg border text-sm ${
            toast.kind === "success"
              ? "bg-emerald-50/95 border-emerald-200 text-emerald-900"
              : "bg-red-50/95 border-red-200 text-red-900"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/** ====== Modal Form (Tambah/Edit) ====== */
function MenuFormModal({
  cafeId,
  initial,
  onClose,
  onSaved,
}: {
  cafeId: number;
  initial?: MenuItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [price, setPrice] = useState<number>(initial?.price ?? 0);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [photoUrl, setPhotoUrl] = useState(initial?.photo_url ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!name.trim()) {
      setErr("Nama menu wajib diisi.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setErr("Harga harus lebih dari 0.");
      return;
    }

    setSaving(true);
    try {
      if (initial) {
        await apiUpdateMenuItem(initial.id, {
          name: name.trim(),
          category: category.trim() || undefined,
          price: Math.round(price),
          description: description.trim() || undefined,
          photo_url: photoUrl.trim() || undefined,
        });
      } else {
        await apiCreateMenuItem({
          cafe_id: cafeId,
          name: name.trim(),
          category: category.trim() || undefined,
          price: Math.round(price),
          description: description.trim() || undefined,
          photo_url: photoUrl.trim() || undefined,
        });
      }
      onSaved();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal menyimpan";
      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-end md:items-center justify-center p-0 md:p-6 z-50">
      <div className="w-full md:max-w-2xl bg-white rounded-t-2xl md:rounded-2xl border border-gray-200 shadow-xl">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h4 className="text-lg font-semibold">{initial ? "Edit Menu" : "Tambah Menu"}</h4>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nama Menu</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Kopi Susu Aren"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Kategori</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={category ?? ""}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Contoh: Coffee / Non-Coffee / Snack"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Harga (IDR)</label>
            <input
              type="number"
              min={0}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="Contoh: 25000"
              required
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium">Deskripsi</label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-[90px]"
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ringkas deskripsi menu..."
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium">Foto (URL)</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={photoUrl ?? ""}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://…"
            />
            <p className="text-xs text-gray-500 mt-1">
              *Sementara pakai URL. Jika nanti pakai upload file, tinggal ganti input ini ke uploader.
            </p>
          </div>

          {err && (
            <div className="md:col-span-2 bg-red-50 border border-red-200 text-red-900 rounded px-3 py-2 text-sm">
              {err}
            </div>
          )}

          <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-[#2b210a] text-white hover:bg-[#423614]"
            >
              {saving ? "Menyimpan…" : initial ? "Simpan Perubahan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** ====== Confirm Dialog ====== */
function ConfirmDialog({
  title,
  message,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold">{title}</h4>
        </div>
        <div className="px-6 py-4 text-sm text-gray-800">{message}</div>
        <div className="px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
