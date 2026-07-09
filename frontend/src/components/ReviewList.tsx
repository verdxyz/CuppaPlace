"use client";

import { Review } from "@/types/coffeeshop";
import { ReviewCard } from "@/components/ReviewCard";

interface ReviewListProps {
  reviews: Review[];
}

export const ReviewList = ({ reviews }: ReviewListProps) => {
  return (
    <section className="space-y-6 mt-10">
      <h2 className="text-2xl font-bold text-coffee-dark">Ulasan Pelanggan</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
};
