"use client";

import { useState } from "react";
import { Review } from "@/types/coffeeshop";
import { ReviewList } from "./ReviewList";

interface ReviewSectionProps {
  reviews: Review[];
}

export default function ReviewSection({ reviews }: ReviewSectionProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return alert("Review tidak boleh kosong!");

    alert("Review berhasil dikirim (dummy).");
    setText("");
  };

  return (
    <section className="mb-16">
      <h2 className="font-semibold text-lg mb-3">Tulis Ulasan disini!</h2>

      {/* ===== FORM REVIEW ===== */}
      <div className=" border border-[#E6E1D6] p-4 rounded-xl mb-6 shadow-sm">
        <textarea
          placeholder="Tulis ulasan tentang coffeeshop di sini..."
          className="border border-gray-300 rounded-lg p-3 w-full h-[120px] resize-none outline-none focus:border-[#2b210a]"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="mt-3 w-full bg-[#2b210a] text-white py-3 rounded-lg font-medium hover:bg-[#3b2d10] transition"
        >
          Kirim Review
        </button>
      </div>

      {/* ===== LIST REVIEWS ===== */}
      <ReviewList reviews={reviews} />
    </section>
  );
}
