"use client";

import NavbarMitra from "@/components/mitra/NavbarMitra";
import SideBarMitra from "@/components/mitra/SideBarMitra";
import { usePathname } from "next/navigation";

export default function MitraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // === Jika halaman adalah /mitra/daftar, tampilkan halaman polos ===
  if (pathname === "/mitra/daftar") {
    return <main className="min-h-screen bg-[#FFFFFF]">{children}</main>;
  }

  // === Judul halaman untuk halaman lain ===
  const getPageTitle = () => {
    if (pathname === "/mitra/dashboard") return "Dashboard";
    if (pathname === "/mitra/manajemen-cafe/informasi") return "Informasi Cafe";
    if (pathname === "/mitra/manajemen-cafe/menu") return "Kelola Menu";
    if (pathname === "/mitra/reviews") return "Reviews";
    if (pathname === "/mitra/laporan") return "Laporan";
    return "CuppaPlace Admin";
  };

  return (
    <div className="flex h-screen bg-[#FFFFFF]">
      {/* Sidebar */}
      <SideBarMitra />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <NavbarMitra title={getPageTitle()} />

        {/* Isi Halaman */}
        <main className="flex-1 overflow-y-auto p-2">{children}</main>
      </div>
    </div>
  );
}
