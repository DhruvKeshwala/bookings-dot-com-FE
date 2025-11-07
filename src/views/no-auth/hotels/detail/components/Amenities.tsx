"use client";

import { AmenitiesProps } from "@/types/hotel.types";
import { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";

export default function Amenities({
  amenityIcons,
  prebookData,
  allPrebookData,
}: AmenitiesProps) {
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  // Normalize: split comma-separated items, trim, and filter out blanks
  const normalizeAmenities = (amenities: string[] = []): string[] => {
    return amenities.flatMap((item) =>
      item
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)
    );
  };

  // Collect amenities from all rooms in allPrebookData
  const allAmenitiesFromRooms = Object.values(allPrebookData ?? {}).flatMap((data) => {
    const amenities = data?.HotelResult?.[0]?.Rooms?.[0]?.Amenities ?? [];
    return normalizeAmenities(amenities);
  });

  // If allPrebookData is not present, fallback to prebookData
  const fallbackAmenities = normalizeAmenities(
    prebookData?.HotelResult?.[0]?.Rooms?.[0]?.Amenities ?? []
  );

  // Combine and deduplicate all amenities
  const allAmenities = Array.from(
    new Set([
      ...allAmenitiesFromRooms,
      ...(allAmenitiesFromRooms.length === 0 ? fallbackAmenities : []),
    ])
  );

  // Hide component if no amenities found
  if (!allAmenities.length) return null;

  return (
    <div className="mb-8">
      <h3 className="text-xl md:text-2xl font-bold mb-4 font-raleway text-black">
        Amenities
      </h3>

      <div className="flex flex-wrap gap-4">
        {(showAllAmenities ? allAmenities : allAmenities.slice(0, 9)).map((amenity, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-4 py-2 border border-black/40 rounded-lg"
          >
            <span className="text-[#014569] text-md">
              {amenityIcons[amenity] || <FaCheckCircle />}
            </span>
            <span className="text-black text-xs font-semibold font-nunito opacity-80">
              {amenity}
            </span>
          </div>
        ))}
      </div>

      {allAmenities.length > 9 && (
        <button
          onClick={() => setShowAllAmenities(!showAllAmenities)}
          className="mt-4 text-[#FF7F50] font-bold hover:underline"
        >
          {showAllAmenities ? "View Less" : "View More"}
        </button>
      )}
    </div>
  );
} 