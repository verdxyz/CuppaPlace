"use client";
import Image from "next/image";
import { CoffeeShop } from "@/data/dummyCoffeeShop";
import { Star } from "lucide-react";

interface Props {
  shop: CoffeeShop;
}

export default function CoffeeShopHeader({ shop }: Props) {
  return (
    <section className="w-full mb-8">
      <button className="text-sm text-gray-600 mb-4 hover:underline">← Back</button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Image
          src={shop.images[0]}
          alt={shop.name}
          width={500}
          height={400}
          className="rounded-xl object-cover w-full h-[250px]"
        />
        {shop.images.slice(1).map((img, i) => (
          <Image
            key={i}
            src={img}
            alt={`${shop.name} ${i + 1}`}
            width={500}
            height={400}
            className="rounded-xl object-cover w-full h-[250px]"
          />
        ))}
      </div>
      <div className="mt-4">
        <h1 className="text-2xl font-bold">{shop.name}</h1>
        <div className="flex items-center text-yellow-500">
          {Array(shop.rating)
            .fill(0)
            .map((_, i) => (
              <Star key={i} fill="currentColor" size={18} />
            ))}
          <span className="ml-2 text-black font-medium">{shop.rating}/5</span>
        </div>
        <p className="text-gray-600 text-sm mt-1">{shop.address}</p>
        <p className="text-gray-500 text-xs">{shop.openHours}</p>
      </div>
    </section>
  );
}
