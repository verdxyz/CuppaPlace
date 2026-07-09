"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, X, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const isCoffeeShopPage = pathname.startsWith("/pengguna/listCoffeeShop");

  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1];
  };

  const syncAuth = () => {
    setIsLoggedIn(!!getCookie("cuppa_token"));
  };

  useEffect(() => {
    setMounted(true);
    syncAuth();
  }, []);

  useEffect(() => {
    window.addEventListener("auth-update", syncAuth);
    return () => window.removeEventListener("auth-update", syncAuth);
  }, []);

  useEffect(() => {
    if (isCoffeeShopPage) return;
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isCoffeeShopPage]);

  if (!mounted) return null;

  const baseStyle =
    isCoffeeShopPage || isScrolled
      ? "bg-white text-[#2b210a]"
      : "bg-[#2b210a] text-white";

  const iconButtonStyle =
    isCoffeeShopPage || isScrolled
      ? "bg-[#f4f4f4] text-[#2b210a]"
      : "bg-[#3b2f00]";

  const handleLogout = () => {
    document.cookie = "cuppa_token=; path=/; max-age=0";
    window.dispatchEvent(new Event("auth-update"));
    router.push("/login");
  };

  const goToProfile = () => {
    router.push("/pengguna/profil");
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-10 py-4 shadow-md ${baseStyle}`}
    >
      <Link href="/" className="text-xl font-semibold">
        CuppaPlace
      </Link>

      <div className="hidden md:flex gap-10 font-medium">
        <Link href="/">Home</Link>
        <Link href="/pengguna/listCoffeeShop">Coffeeshop</Link>
        <Link href="/pengguna/kategori">Kategori</Link>
        <Link href="/pengguna/tentang-kami">Tentang Kami</Link>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          onClick={() => setSearchOpen(!searchOpen)}
          className={`p-3 rounded-full ${iconButtonStyle}`}
        >
          {searchOpen ? <X /> : <Search />}
        </motion.button>

        {isLoggedIn ? (
          <div className="relative group">
            {/* 🔥 KLIK AVATAR → PROFILE */}
            <Image
              src="/img/profile.png"
              alt="Profile"
              width={40}
              height={40}
              onClick={goToProfile}
              className="rounded-full cursor-pointer"
            />

            <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={goToProfile}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Profil
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <Link href="/login">
            <button className="bg-[#f4f4f4] text-[#2b210a] px-5 py-2 rounded-full font-semibold">
              Masuk
            </button>
          </Link>
        )}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-3 rounded-full ${iconButtonStyle}`}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
