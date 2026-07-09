"use client";

import Navbar from "@/components/Navbar";
import Slideshow from "@/components/SlideShow";
import {
  Laptop,
  Users,
  Palette,
  Coffee,
  Music,
  Building2,
  Wallet,
  Flame,
  Baby,
} from "lucide-react";

export default function KategoriPage() {
  const categories = [
    { icon: <Laptop size={36} strokeWidth={1.6} />, name: "Workplace" },
    { icon: <Users size={36} strokeWidth={1.6} />, name: "Meeting Spot" },
    { icon: <Baby size={36} strokeWidth={1.6} />, name: "Family Friendly" },
    { icon: <Palette size={36} strokeWidth={1.6} />, name: "Aesthetic" },
    { icon: <Flame size={36} strokeWidth={1.6} />, name: "Cozy & Relaxed" },
    { icon: <Music size={36} strokeWidth={1.6} />, name: "Live Music" },
    { icon: <Wallet size={36} strokeWidth={1.6} />, name: "Affordable" },
    { icon: <Building2 size={36} strokeWidth={1.6} />, name: "Strategic" },
    { icon: <Coffee size={36} strokeWidth={1.6} />, name: "Signature Drink" },
  ];

  return (
    <main className="bg-[#ffff] text-[#2b210a] min-h-screen flex flex-col">
      {/* Navbar di atas */}
      <Navbar />

      {/* Bagian kategori */}
      <section className="flex-1 pt-30 pb-30 px-6 md:px-16 py-20">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center">
          Kategori Coffeeshop
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 justify-items-center">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="flex items-center gap-5 bg-white border border-[#E6E1D6] 
                text-[#271F01] font-semibold text-xl p-10 rounded-3xl 
                shadow-md hover:shadow-lg hover:-translate-y-2 
                hover:bg-[#f5f5f5] transition-all duration-200 
                w-full max-w-md"
            >
              <div className="text-[#4B3F25]">{cat.icon}</div>
              <p>{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Slideshow di bawah halaman tanpa jarak */}
      <section className="mt-0 pt-0 pb-0 m-0">
        <Slideshow />
      </section>
    </main>
  );
}
