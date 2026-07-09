"use client";
import Image from "next/image";
import { MenuItem } from "@/data/dummyCoffeeShop";

export default function MenuCard({ menu }: { menu: MenuItem }) {
  return (
    <div className="relative bg-white rounded-xl shadow hover:shadow-lg transition-all duration-200 p-2 flex flex-col items-center text-center w-[140px]">
      <div className="absolute top-2 right-2 bg-[#2b210a] text-white text-xs px-2 py-1 rounded-full">
        {menu.price / 1000}K
      </div>
      <Image
        src={menu.image}
        alt={menu.name}
        width={100}
        height={100}
        className="object-contain h-[100px] mb-2"
      />
      <p className="font-medium text-sm">{menu.name}</p>
    </div>
  );
}
