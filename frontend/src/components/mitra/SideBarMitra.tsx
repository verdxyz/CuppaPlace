"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Coffee,
  FileText,
  BarChart2,
  LogOut,
  ChevronDown,
  ChevronRight,
  Info,
  Utensils,
} from "lucide-react";

interface SidebarProps {
  currentPage?: string;
}

export default function Sidebar({ currentPage }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openCafe, setOpenCafe] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    // Hapus token kalau ada
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    // Redirect user
    router.push("/");
  };

  return (
    <>
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
        {/* Logo */}
        <div>
          <h1 className="text-2xl font-bold px-6 py-6 text-[#2b210a]">CuppaPlace</h1>

          {/* Navigation */}
          <nav className="mt-2 space-y-1 text-gray-800">
            {/* Dashboard */}
            <Link
              href="/mitra/dashboard"
              className={`flex items-center gap-3 px-6 py-3 hover:bg-[#f3f1ed] ${
                pathname === "/mitra/dashboard" || currentPage === "dashboard"
                  ? "bg-[#f3f1ed] font-semibold text-[#2b210a]"
                  : ""
              }`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>

            {/* Manajemen Cafe */}
            <div>
              <button
                onClick={() => setOpenCafe(!openCafe)}
                className={`flex items-center justify-between w-full px-6 py-3 hover:bg-[#f3f1ed] ${
                  pathname.startsWith("/mitra/manajemen-cafe") ||
                  currentPage?.startsWith("manajemen-cafe")
                    ? "bg-[#f3f1ed] font-semibold text-[#2b210a]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Coffee size={18} />
                  Manajemen Cafe
                </div>
                {openCafe ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {/* Submenu */}
              {openCafe && (
                <div className="ml-10 mt-1 text-sm space-y-1">
                  <Link
                    href="/mitra/manajemen-cafe/informasi"
                    className={`flex items-center gap-2 ${
                      pathname === "/mitra/manajemen-cafe/informasi" ||
                      currentPage === "manajemen-cafe-informasi"
                        ? "font-semibold text-[#2b210a]"
                        : "hover:text-[#2b210a]/70"
                    }`}
                  >
                    <Info size={14} /> Informasi Cafe
                  </Link>
                  <Link
                    href="/mitra/manajemen-cafe/menu"
                    className={`flex items-center gap-2 ${
                      pathname === "/mitra/manajemen-cafe/menu" ||
                      currentPage === "manajemen-cafe-menu"
                        ? "font-semibold text-[#2b210a]"
                        : "hover:text-[#2b210a]/70"
                    }`}
                  >
                    <Utensils size={14} /> Kelola Menu
                  </Link>
                </div>
              )}
            </div>

            {/* Reviews */}
            <Link
              href="/mitra/ulasan"
              className={`flex items-center gap-3 px-6 py-3 hover:bg-[#f3f1ed] ${
                pathname === "/mitra/reviews" || currentPage === "reviews"
                  ? "bg-[#f3f1ed] font-semibold text-[#2b210a]"
                  : ""
              }`}
            >
              <FileText size={18} />
              Ulasan
            </Link>

            {/* Laporan */}
            <Link
              href="/mitra/laporan"
              className={`flex items-center gap-3 px-6 py-3 hover:bg-[#f3f1ed] ${
                pathname === "/mitra/laporan" || currentPage === "laporan"
                  ? "bg-[#f3f1ed] font-semibold text-[#2b210a]"
                  : ""
              }`}
            >
              <BarChart2 size={18} />
              Laporan
            </Link>
          </nav>
        </div>

        {/* Logout */}
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 text-[#2b210a] font-medium hover:opacity-70"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Modal Logout */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[300px] shadow-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-[#2b210a] mb-2">Konfirmasi</h3>
            <p className="text-gray-600 text-sm mb-6">Anda yakin ingin keluar?</p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Tidak
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[#2b210a] text-white rounded-lg hover:opacity-90"
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
