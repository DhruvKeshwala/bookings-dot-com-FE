"use client";

import { useState, useRef, useEffect } from "react";
import FilterPopup from "./FilterPopup";
import { FilterControlsProps } from "@/types/hotel.types";

const initialFilterState = {
  bookingFeatures: {
    freeCancellation: false,
    breakfastIncluded: false,
  },
  priceRanges: [],
  reviewScores: [],
  starRatings: [],
  showDiscountsOnly: false,
  roomTypes: [],
  amenities: [],
};

export default function FilterControls({
  filters,
  onApply,
  filteredCount,
  totalCount,
  allFetchedHotels,
  hasFiltersApplied,
}: FilterControlsProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    }
    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  const handleFilterApply = (filters: any) => {
    // Count active filters
    let count = 0;
    if (filters.bookingFeatures.freeCancellation) count++;
    if (filters.bookingFeatures.breakfastIncluded) count++;
    count += filters.priceRanges.length;
    count += filters.reviewScores.length;
    count += filters.starRatings.length;
    if (filters.showDiscountsOnly) count++;
    count += filters.roomTypes.length;
    count += filters.amenities.length;

    setActiveFiltersCount(count);
    onApply(filters);
  };

  const handleClearAll = () => {
    setActiveFiltersCount(0);
    onApply(initialFilterState);
  };

  return (
    <>
      <div className="flex justify-between items-center">
        {/* Filter Button */}
        <div className="relative" ref={wrapperRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-2 py-1 border border-primary rounded-lg bg-foreground hover:bg-gray-50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <svg
              className="w-6 h-6 text-primary"
              viewBox="0 0 24 25"
              fill="none"
            >
              <path
                d="M10 18.099H14V16.099H10V18.099ZM3 6.099V8.099H21V6.099H3ZM6 13.099H18V11.099H6V13.099Z"
                fill="currentColor"
              />
            </svg>
            <span className="text-lg font-semibold text-primary font-nunito hidden md:block cursor-pointer">
              Filter
            </span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <FilterPopup
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            onApply={handleFilterApply}
            filters={filters}
          />
        </div>

        {/* Results Count and Clear All */}
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-primary font-nunito">
            {hasFiltersApplied
              ? `${filteredCount} out of ${allFetchedHotels} results`
              : `${totalCount} out of ${allFetchedHotels} results`}
          </span>
          {hasFiltersApplied && (
            <button
              onClick={handleClearAll}
              className="ml-4 px-4 py-2 bg-gray-200 rounded text-sm font-semibold text-primary hover:bg-gray-300 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </>
  );
}
