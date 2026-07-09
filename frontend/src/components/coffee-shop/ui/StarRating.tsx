import { Star } from "lucide-react";

export const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ))}
  </div>
);
