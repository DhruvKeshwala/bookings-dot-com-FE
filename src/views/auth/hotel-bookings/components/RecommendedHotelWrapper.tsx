"use client";

import { useEffect, useState } from "react";
import RecommendedHotel from "@/views/no-auth/hotels/detail/components/RecommendedHotel";
import RecommendedDestinations from "./RecommendedDestinations";

export default function RecommendedHotelWrapper() {
  const [recommendedRooms, setRecommendedRooms] = useState<any[] | null>(null);

  useEffect(() => {
    const hotelDataFromSession = sessionStorage.getItem("hotel_data");

    if (hotelDataFromSession) {
      try {
        const parsed = JSON.parse(hotelDataFromSession);
        const recommended = parsed?.recommended;

        if (Array.isArray(recommended) && recommended.length > 0) {
          setRecommendedRooms(recommended);
          return;
        }
      } catch (e) {
        console.error("Failed to parse hotel_data from sessionStorage:", e);
      }
    }

    setRecommendedRooms(null); // fallback case
  }, []);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <>
      {recommendedRooms ? (
        <RecommendedHotel
          recommendedRooms={recommendedRooms}
          formatPrice={formatPrice}
        />
      ) : (
        <RecommendedDestinations />
      )}
    </>
  );
}
