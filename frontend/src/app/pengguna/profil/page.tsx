// frontend/src/app/pengguna/profil/page.tsx
"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Heart,
  Star,
  Lock,
  Bell,
  LogOut,
  Edit2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/pengguna/ui/button";
import { Badge } from "@/components/pengguna/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/pengguna/ui/avatar";
import { useAuth } from "@/lib/auth";
import { apiMyFavorites } from "@/lib/api";
import type { Cafe, User } from "@/types/domain";
import { useRouter } from "next/navigation";
import { apiMe } from "@/lib/api";

type FavoriteRow = {
  id: number;
  cafe: Cafe; // backend mengirim favorite dengan include { cafe }
};

export default function UserProfilePage() {
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1];
  };

  useEffect(() => {
    const token = getCookie("cuppa_token");
    if (!token) {
      router.replace("/login?next=/pengguna/profil");
    }
  }, [router]);

  useEffect(() => {
    if (loading) return;

    const token = getCookie("cuppa_token");
    if (!token) {
      router.replace("/login?next=/pengguna/profil");
      return;
    }

    (async () => {
      try {
        const me = await apiMe(); // apiMe HARUS kirim Authorization header
        setProfileUser(me.user ?? me);
      } catch {
        document.cookie = "cuppa_token=; path=/; max-age=0";
        window.dispatchEvent(new Event("auth-update"));
        router.replace("/login");
      } finally {
        setProfileLoading(false);
      }
    })();
  }, [loading, router]);

  // ====== Favorites (nyata dari backend) ======
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [favErr, setFavErr] = useState<string | null>(null);
  const [favLoading, setFavLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!profileUser) return;
    setFavLoading(true);
    setFavErr(null);
    (async () => {
      try {
        const rows = (await apiMyFavorites()) as FavoriteRow[];
        setFavorites(Array.isArray(rows) ? rows : []);
      } catch (e: unknown) {
        setFavErr(e instanceof Error ? e.message : "Gagal memuat favorit");
      } finally {
        setFavLoading(false);
      }
    })();
  }, [user]);

  // ====== Profile data dari user login (fallback bila kosong) ======
  const profile = useMemo(() => {
    const u = (profileUser ?? {}) as Partial<User>;
    const avatar =
      u.avatar_url ??
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        u.name || "User"
      )}`;
    return {
      name: u.name ?? "User",
      bio: "Coffee enthusiast & explorer of local cafés. Always on the hunt for the perfect espresso!",
      email: u.email ?? "-",
      phone: u.phone ?? "-",
      location: "-", // belum ada di schema user -> pakai placeholder
      avatar,
    };
  }, [user]);

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-[#271F01] text-[#271F01]"
              : "fill-gray-200 text-gray-300"
          }`}
        />
      ))}
    </div>
  );

  const initials =
    profile.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2) || "U";

  const onLogout = () => {
    logout();
    router.replace("/");
  };

  // Saat loading auth, tampilkan skeleton sederhana
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-white text-[#271F01]">
        <Navbar />
        <main className="container mx-auto px-8 py-8 max-w-6xl pt-28 space-y-8">
          <div className="h-40 rounded-xl border border-gray-300/40 animate-pulse bg-gray-100" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="h-60 rounded-xl border border-gray-300/40 animate-pulse bg-gray-100" />
              <div className="h-52 rounded-xl border border-gray-300/40 animate-pulse bg-gray-100" />
            </div>
            <div className="md:col-span-2 space-y-8">
              <div className="h-72 rounded-xl border border-gray-300/40 animate-pulse bg-gray-100" />
              <div className="h-72 rounded-xl border border-gray-300/40 animate-pulse bg-gray-100" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#271F01]">
      <Navbar />

      <main className="container mx-auto px-8 py-8 max-w-6xl pt-28 space-y-8">
        {/* Profile Header */}
        <div className="bg-white p-5 rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="relative flex flex-col md:flex-row items-center md:items-end gap-4">
            <Avatar className="h-32 w-32 p-5 rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="text-2xl bg-[#271F01] text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-3xl font-bold">{profile.name}</h2>
              <p className="mt-2 max-w-2xl text-gray-600">{profile.bio}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border border-gray-400/40 text-[#271F01]"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="bg-white p-5 rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Mail className="h-5 w-5 text-[#271F01]" />
                Account Information
              </h3>
              <InfoItem
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={profile.email}
              />
              <InfoItem
                icon={<Phone className="h-4 w-4" />}
                label="Phone"
                value={profile.phone}
              />
              <InfoItem
                icon={<MapPin className="h-4 w-4" />}
                label="Location"
                value={profile.location}
              />
            </div>

            {/* Settings */}
            <div className="bg-white p-5 rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-semibold mb-4">Settings</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border border-gray-400/40 text-[#271F01]"
                >
                  <Lock className="h-4 w-4" />
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border border-gray-400/40 text-[#271F01]"
                >
                  <Bell className="h-4 w-4" />
                  Notification Preferences
                </Button>
                <Button
                  variant="destructive"
                  className="w-full justify-start gap-2"
                  onClick={onLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="md:col-span-2 space-y-8">
            {/* Favorite Coffee Shops */}
            <div className="bg-white p-5 rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-[#271F01] fill-[#271F01]" />
                Favorite Coffee Shops
              </h3>

              {favErr && (
                <div className="text-sm text-red-600 mb-2">{favErr}</div>
              )}

              {favLoading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="h-40 rounded-xl border border-gray-300/40 animate-pulse bg-gray-100" />
                  <div className="h-40 rounded-xl border border-gray-300/40 animate-pulse bg-gray-100" />
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-sm text-neutral-600">
                  Belum ada favorit.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {favorites.map((row) => {
                    const cafe = row.cafe;
                    return (
                      <div
                        key={row.id}
                        className="bg-white rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                      >
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={
                              cafe.cover_url ??
                              "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800&q=60"
                            }
                            alt={cafe.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold mb-2">{cafe.name}</h3>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                              {renderStars(5)}
                              <span className="text-sm text-gray-500">
                                {cafe.address ?? "—"}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                router.push(`/pengguna/coffeeshop/${cafe.id}`)
                              }
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Reviews (placeholder tanpa dummy data) */}
            <div className="bg-white p-5 rounded-xl border border-gray-300/40 shadow-md hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-[#271F01]" />
                Recent Reviews
              </h3>
              <p className="text-sm text-gray-500">
                Belum ada riwayat ulasan. Fitur ini akan aktif ketika endpoint
                riwayat ulasan pengguna tersedia di backend.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Subcomponent InfoItem
function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1 mb-2">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <p className="text-[#271F01] pl-6">{value}</p>
    </div>
  );
}
