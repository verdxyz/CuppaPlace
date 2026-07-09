"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import React from "react";

interface Column {
  name: string;
  images: string[];
}

const HeroSection: React.FC = () => {
  const columns: Column[] = [
    {
      name: "renjana",
      images: [
        "/img/renjana/1.jpg",
        "/img/renjana/2.jpg",
        "/img/renjana/3.jpg",
        "/img/renjana/4.jpg",
      ],
    },
    {
      name: "terikat",
      images: [
        "/img/terikat/1.jpg",
        "/img/terikat/2.jpg",
        "/img/terikat/3.jpg",
        "/img/terikat/4.jpg",
      ],
    },
    {
      name: "satuperlima",
      images: [
        "/img/satuperlima/1.jpg",
        "/img/satuperlima/2.jpg",
        "/img/satuperlima/3.jpg",
        "/img/satuperlima/4.jpg",
      ],
    },
  ];

  return (
    <section className="relative flex flex-col md:flex-row bg-[#332800] text-white w-full overflow-hidden mt-20">
      {/* LEFT SIDE */}
      <div className="flex-1 flex flex-col justify-center px-10 md:px-16 pt-8 md:pt-8 pb-16">
        <h1 className="text-6xl md:text-8xl font-extrabold leading-[1.1] tracking-tight">
          Find Your <br /> Perfect Cup, <br /> Anytime, <br /> Anywhere.
        </h1>

        <p className="mt-6 text-lg text-gray-200 max-w-md">
          CuppaPlace menghubungkan pecinta kopi dengan coffeeshop terbaik yang
          telah bermitra.
        </p>

        <div className="mt-8 flex gap-6">
          {/* Tombol Gabung Mitra diarahkan ke halaman /mitra/daftar */}
          <Link
            href="/mitra/daftar"
            className="text-2xl bg-[#271F01] px-8 py-4 rounded-2xl font-medium shadow-md hover:bg-white hover:text-[#271F01] transition"
          >
            Gabung Mitra
          </Link>

          <Link
            href="/pengguna/listCoffeeShop"
            className="text-2xl ml-5 flex items-center gap-2 text-white"
          >
            Lihat Coffeeshop
            <span className="ml-2 w-8 h-8 bg-white text-[#271F01] rounded-full flex items-center justify-center hover:bg-[#271F01] hover:text-white transition">
              <ArrowRight className="w-6 h-6" />
            </span>
          </Link>
        </div>
      </div>

      {/* RIGHT SIDE - INFINITE SCROLLING IMAGES */}
      <div className="flex-1 flex justify-center md:justify-start items-start overflow-hidden h-[calc(100vh-80px)] -ml-20 md:-ml-28 pr-10 md:pr-16">
        <div className="flex gap-6">
          {columns.map((col, index) => (
            <div
              key={index}
              className={`flex flex-col gap-0 ${
                index % 2 === 0
                  ? "animate-scroll-up-loop"
                  : "animate-scroll-down-loop"
              }`}
            >
              {[...col.images, ...col.images].map((src, i) => (
                <Image
                  key={`${col.name}-${i}`}
                  src={src}
                  alt={`${col.name}-${i}`}
                  width={230}
                  height={349}
                  className="rounded-[15px] object-cover w-[230px] h-[349px]"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
