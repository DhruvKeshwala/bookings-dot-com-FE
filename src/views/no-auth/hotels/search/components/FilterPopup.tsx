"use client";

import { FilterPopupProps, FilterState } from "@/types/hotel.types";
import { useEffect, useState } from "react";


export default function FilterPopup({
  isOpen,
  onClose,
  onApply,
  filters
}: FilterPopupProps) {
  const [filtersState, setFiltersState] = useState<FilterState>(filters);

  useEffect(() => {
    if (isOpen) {
      setFiltersState(filters);
    }
  }, [isOpen, filters]);

  

  if (!isOpen) return null;

  const handleBookingFeatureChange = (
    feature: keyof FilterState["bookingFeatures"],
  ) => {
    setFiltersState((prev) => {
      const newState = {
        ...prev,
        bookingFeatures: {
          ...prev.bookingFeatures,
          [feature]: !prev.bookingFeatures[feature],
        },
      };
      onApply(newState);
      return newState;
    });
  };

  const handleArrayFilterChange = (
    category: keyof Pick<
      FilterState,
      "priceRanges" | "reviewScores" | "roomTypes" | "amenities"
    >,
    value: string,
  ) => {
    setFiltersState((prev) => {
      const newState = {
        ...prev,
        [category]: prev[category].includes(value)
          ? prev[category].filter((item) => item !== value)
          : [...prev[category], value],
      };
      onApply(newState);
      return newState;
    });
  };

  const handleStarRatingChange = (rating: number) => {
    setFiltersState((prev) => {
      const newState = {
        ...prev,
        starRatings: prev.starRatings.includes(rating)
          ? prev.starRatings.filter((r) => r !== rating)
          : [...prev.starRatings, rating],
      };
      onApply(newState);
      return newState;
    });
  };

  const StarRating = ({ count }: { count: number }) => (
    <div className="flex items-center gap-1">
      {[...Array(count)].map((_, i) => (
        <svg key={i} className="w-4 h-4" viewBox="0 0 17 17" fill="none">
          <path
            d="M8.5 1.833L10.56 6.007L15.167 6.68L11.833 9.927L12.62 14.513L8.5 12.347L4.38 14.513L5.167 9.927L1.833 6.68L6.44 6.007L8.5 1.833Z"
            fill="#FCDB47"
            stroke="#FCDB47"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );

  const CheckboxIcon = ({ checked }: { checked: boolean }) => (
    <svg className="w-6 h-6 cursor-pointer" viewBox="0 0 24 24" fill="none">
      {checked ? (
        <path
          d="M10.933 13.519L8.707 11.293L7.293 12.707L11.067 16.481L16.769 9.641L15.231 8.359L10.933 13.519Z"
          fill="black"
        />
      ) : null}
      <path
        d="M19 3H5C3.897 3 3 3.897 3 5V19C3 20.103 3.897 21 5 21H19C20.103 21 21 20.103 21 19V5C21 3.897 20.103 3 19 3ZM5 19V5H19L19.002 19H5Z"
        fill="black"
      />
    </svg>
  );


  const reviewScores = [
    "5.0+ With honours",
    "4.5+ Excellent",
    "4.0+ Very good",
    "3.5+ Good",
    "3.0+ Satisfactory",
  ];

  const roomTypes = [
    "Single room",
    "Double room",
    "Twin room",
    "Triple room",
    "Family room",
    "Suite",
  ];

  const amenities = [
    "Wi-Fi",
    "Airport shuttle",
    "Parking",
    "Fitness centre",
    "Pool",
    "Spa",
  ];

  return (
    <div className="absolute top-full left-0 mt-2 w-96 bg-white shadow-2xl border border-gray-200 rounded-lg z-50 max-h-[600px] overflow-y-auto">
      <div className="p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold font-nunito text-black">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Book with peace of mind */}
        <div className="flex flex-col gap-4">
          <h3 className="text-2xl font-bold font-nunito text-black">
            Book with peace of mind
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <button
                onClick={() => handleBookingFeatureChange("freeCancellation")}
                className="flex items-center gap-4"
              >
                <CheckboxIcon
                  checked={filtersState.bookingFeatures.freeCancellation}
                />
                <span className="text-xl font-nunito text-black">
                  Free Cancellation
                </span>
              </button>
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={() => handleBookingFeatureChange("breakfastIncluded")}
                className="flex items-center gap-4"
              >
                <CheckboxIcon
                  checked={filtersState.bookingFeatures.breakfastIncluded}
                />
                <span className="text-xl font-nunito text-black">
                  Breakfast included
                </span>
              </button>
            </div>
          </div>
          <div className="w-full h-px bg-black bg-opacity-40"></div>
        </div>

        {/* Traveller review score */}
        <div className="flex flex-col gap-4">
          <h3 className="text-2xl font-bold font-nunito text-black">
            Traveller review score
          </h3>
          <div className="flex flex-col gap-3">
            {reviewScores.map((score) => (
              <div key={score} className="flex justify-between items-center">
                <button
                  onClick={() => handleArrayFilterChange("reviewScores", score)}
                  className="flex items-center gap-4"
                >
                  <CheckboxIcon
                    checked={filtersState.reviewScores.includes(score)}
                  />
                  <span className="text-lg font-nunito text-black">
                    {score}
                  </span>
                </button>
              </div>
            ))}
          </div>
          <div className="w-full h-px bg-black bg-opacity-40"></div>
        </div>

        {/* Hotel star rating */}
        <div className="flex flex-col gap-4">
          <h3 className="text-2xl font-bold font-nunito text-black">
            Hotel star rating
          </h3>
          <div className="flex flex-col gap-3">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex justify-between items-center">
                <button
                  onClick={() => handleStarRatingChange(stars)}
                  className="flex items-center gap-4"
                >
                  <CheckboxIcon checked={filtersState.starRatings.includes(stars)} />
                  <span className="text-lg font-nunito text-black">
                    {stars} star
                  </span>
                </button>
                <div className="flex items-center gap-4">
                  <StarRating count={stars} />
                </div>
              </div>
            ))}
          </div>
          <div className="w-full h-px bg-black bg-opacity-40"></div>
        </div>

        {/* Discounts */}
        <div className="flex flex-col gap-4">
          <h3 className="text-2xl font-bold font-nunito text-black">
            Discounts
          </h3>
          <div className="flex justify-between items-center">
            <button
              onClick={() =>
                setFiltersState((prev) => {
                  const newState = {
                    ...prev,
                    showDiscountsOnly: !prev.showDiscountsOnly,
                  };
                  onApply(newState);
                  return newState;
                })
              }
              className="flex items-center gap-4 flex-1"
            >
              <CheckboxIcon checked={filtersState.showDiscountsOnly} />
              <span className="text-lg font-nunito text-black">
                Only show hotels with discounts
              </span>
            </button>
          </div>
          <div className="w-full h-px bg-black bg-opacity-40"></div>
        </div>

        {/* Room types */}
        <div className="flex flex-col gap-4">
          <h3 className="text-2xl font-bold font-nunito text-black">
            Room types
          </h3>
          <div className="flex flex-col gap-3">
            {roomTypes.map((type) => (
              <div key={type} className="flex justify-between items-center">
                <button
                  onClick={() => handleArrayFilterChange("roomTypes", type)}
                  className="flex items-center gap-4 flex-1"
                >
                  <CheckboxIcon checked={filtersState.roomTypes.includes(type)} />
                  <span className="text-lg font-nunito text-black">{type}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-col gap-4">
          <h3 className="text-2xl font-bold font-nunito text-black">
            Amenities
          </h3>
          <div className="flex flex-col gap-3">
            {amenities.map((amenity) => (
              <div key={amenity} className="flex justify-between items-center">
                <button
                  onClick={() => handleArrayFilterChange("amenities", amenity)}
                  className="flex items-center gap-4 flex-1"
                >
                  <CheckboxIcon checked={filtersState.amenities.includes(amenity)} />
                  <span className="text-lg font-nunito text-black">
                    {amenity}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
