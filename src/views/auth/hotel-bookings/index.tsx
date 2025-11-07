"use client";
import { useState } from "react";

import BookedHotelList from "./components/BookedHotelList";
import HotelBookingSidebar from "./components/HotelBookingSidebar";
import RecommendedHotelWrapper from "./components/RecommendedHotelWrapper";

const FilterIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M10 18H14V16H10V18ZM3 6V8H21V6H3ZM6 13H18V11H6V13Z" fill="#001F50" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="#001F4D" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M6 9l6 6 6-6" />
  </svg>
);


export default function HotelBookings() {
  const [activeFilter, setActiveFilter] = useState<"all" | "past" | "upcoming" | "pending">("all");
  const [shownCount, setShownCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  return (
    <div className="flex flex-col gap-10 min-h-screen animate-in fade-in duration-500 py-6">
      {/* Page Header */}
      <div className="flex flex-col gap-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] font-normal text-black font-roboto">Booked Hotel Details</h2>

        {/* Filter Section */}
        <div className="flex items-center justify-between gap-4 animate-in slide-in-from-top duration-500">
          {/* Left Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-[#001f50] rounded-lg bg-white hover:bg-gray-50 transition-colors">
              <FilterIcon />
              <span className="text-sm sm:text-base font-semibold text-primary font-nunito hidden sm:block">
                Filter
              </span>
            </button>

            {/* Filter Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setActiveFilter("past")}
                className={`px-4 py-2 border rounded-lg text-sm sm:text-base font-semibold font-nunito transition-colors ${activeFilter === "past"
                    ? "bg-[#001F50] text-white border-[#001F50]"
                    : "bg-white text-[#001F50] border-[#001F50] hover:bg-[#001F50] hover:text-white"
                  }`}
              >
                Past
              </button>
              <button
                onClick={() => setActiveFilter("upcoming")}
                className={`px-4 py-2 border rounded-lg text-sm sm:text-base font-semibold font-nunito transition-colors ${activeFilter === "upcoming"
                    ? "bg-[#001F50] text-white border-[#001F50]"
                    : "bg-white text-[#001F50] border-[#001F50] hover:bg-[#001F50] hover:text-white"
                  }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveFilter("pending")}
                className={`px-4 py-2 border rounded-lg text-sm sm:text-base font-semibold font-nunito transition-colors ${activeFilter === "pending"
                    ? "bg-[#001F50] text-white border-[#001F50]"
                    : "bg-white text-[#001F50] border-[#001F50] hover:bg-[#001F50] hover:text-white"
                  }`}
              >
                Pending
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="hidden lg:block text-sm sm:text-base text-[#001F50] font-semibold font-nunito">
            {activeFilter === "all"
              ? `${totalCount} results`
              : `${shownCount} out of ${totalCount} results`}

            {activeFilter !== "all" && (
              <button
                onClick={() => setActiveFilter("all")}
                className="ml-4 px-4 py-2 bg-gray-200 rounded cursor-pointer text-sm font-semibold text-primary hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <button className="lg:hidden flex items-center gap-2 px-4 py-2 border border-[#001f50] rounded-lg bg-white hover:bg-gray-50 transition-colors">
            <span className="text-sm sm:text-base font-semibold text-primary font-nunito">
              Sort By
            </span>
            <ChevronDownIcon />
          </button>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col-reverse lg:flex-row gap-2 animate-in duration-500 delay-200">
          {/* Booking List */}
          <div className="w-full lg:w-8/12">
            <BookedHotelList
              activeFilter={activeFilter}
              onCountChange={(shown, total) => {
                setShownCount(shown);
                setTotalCount(total);
              }}
              setActiveFilter={setActiveFilter}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:w-4/12">
            <HotelBookingSidebar />
          </div>
        </div>

        {/* Recommended Section */}
        <div className="w-full animate-in slide-in-from-bottom duration-500 delay-300">
          <RecommendedHotelWrapper />
        </div>
      </div>
    </div>
  );
}
