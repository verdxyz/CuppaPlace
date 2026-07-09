"use client";

import { Review } from "@/types/coffeeshop";
import { Card } from "@/components/coffee-shop/ui/card";
import { StarRating } from "@/components/coffee-shop/ui/StarRating";
import { format } from "date-fns";

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
  return (
    <Card className="p-6 bg-card border-border hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <img
          src={
            review.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.author}`
          }
          alt={review.author}
          className="w-12 h-12 rounded-full bg-muted"
        />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-coffee-dark">{review.author}</h4>
            <span className="text-xs text-muted-foreground">
              {format(new Date(review.date), "MMM dd, yyyy")}
            </span>
          </div>
          <StarRating rating={review.rating} />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {review.comment}
          </p>
        </div>
      </div>
    </Card>
  );
};
