// frontend/src/components/CoffeeShopCard.tsx
"use client";

import { MapPin, Star } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  id: number | string;
  name: string;
  img?: string | null;
  location?: string | null;

  // backend kamu belum pasti punya ini, jadi optional
  rating?: number | null;
  reviews?: number | null;
  category?: string | null;
};

export default function CoffeeShopCard({
  id,
  name,
  img,
  location,
  rating,
  reviews,
  category,
}: Props) {
  const router = useRouter();

  const goDetail = () => {
    router.push(`/pengguna/coffeeshop/${id}`);
  };

  const finalImg = img || "/img/home/bg-section.jpg";
  const finalLocation = location || "Alamat belum tersedia";
  const finalRating = typeof rating === "number" && Number.isFinite(rating) ? rating : 0;
  const finalReviews = typeof reviews === "number" && Number.isFinite(reviews) ? reviews : 0;
  const finalCategory = category || "Coffee Shop";

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex overflow-hidden">
      {/* IMAGE */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={finalImg}
        alt={name}
        className="w-[320px] h-[190px] object-cover"
        loading="lazy"
        onError={(e) => {
          const el = e.currentTarget;
          if (el.src.includes("/img/home/bg-section.jpg")) return;
          el.src = "/img/home/bg-section.jpg";
        }}
      />

      {/* CONTENT */}
      <div className="flex flex-col justify-between p-5 w-full">
        <div>
          <h2 className="text-xl font-semibold text-[#2b210a]">{name}</h2>

          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
            <MapPin size={16} /> {finalLocation}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm mt-3">
            <span className="flex items-center gap-1 text-yellow-500 font-medium">
              <Star size={16} /> {finalRating}
            </span>
            <span className="text-gray-600">{finalCategory}</span>
            <span className="text-gray-500">{finalReviews} Ulasan</span>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={goDetail}
            className="px-5 py-2 rounded-full border bg-[#2b210a] text-white hover:bg-[#3C3110] transition"
          >
            Lihat Detail
          </button>
        </div>
      </div>
    </div>
  );
}
