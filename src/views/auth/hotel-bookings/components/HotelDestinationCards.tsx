"use client";

import { useState } from "react";

interface DestinationCard {
  image: string;
  title: string;
  price: string;
  duration: string;
  description: string;
  buttonStyle: "outline" | "filled";
}

const destinations: DestinationCard[] = [
  {
    image: "https://api.builder.io/api/v1/image/assets/TEMP/d05c78223e064457aa6a44256cbc76f03837df47?width=512",
    title: "Thailand",
    price: "$1000",
    duration: "3 Days 4 Night",
    description: "we curate exceptional travel experiences and.",
    buttonStyle: "outline",
  },
  {
    image: "https://api.builder.io/api/v1/image/assets/TEMP/9109bbbc541bcf023912ce912a35f6a59f274060?width=543",
    title: "Thailand",
    price: "$1000",
    duration: "3 Days 4 Night",
    description: "we curate exceptional travel experiences and.",
    buttonStyle: "filled",
  },
  {
    image: "https://api.builder.io/api/v1/image/assets/TEMP/d05c78223e064457aa6a44256cbc76f03837df47?width=512",
    title: "Thailand",
    price: "$1000",
    duration: "3 Days 4 Night",
    description: "we curate exceptional travel experiences and.",
    buttonStyle: "outline",
  },
  {
    image: "https://api.builder.io/api/v1/image/assets/TEMP/d05c78223e064457aa6a44256cbc76f03837df47?width=512",
    title: "Thailand",
    price: "$1000",
    duration: "3 Days 4 Night",
    description: "we curate exceptional travel experiences and.",
    buttonStyle: "outline",
  },
  {
    image: "https://api.builder.io/api/v1/image/assets/TEMP/d05c78223e064457aa6a44256cbc76f03837df47?width=512",
    title: "Thailand",
    price: "$1000",
    duration: "3 Days 4 Night",
    description: "we curate exceptional travel experiences and.",
    buttonStyle: "outline",
  },
];

const PaginationDots = ({ total, current }: { total: number; current: number }) => (
  <div className="flex items-center justify-center gap-1.5">
    <div className="w-7 h-3 bg-[#00B4D8] rounded-full"></div>
    {Array.from({ length: total - 1 }, (_, index) => (
      <div key={index} className="w-3 h-3 bg-[#DADADA] rounded-full"></div>
    ))}
  </div>
);

const ClockIcon = () => (
  <svg width="19" height="19" viewBox="0 0 21 21" fill="none" className="w-5 h-5">
    <path
      d="M10.3369 18.66C14.8031 18.66 18.4238 15.0393 18.4238 10.5731C18.4238 6.10682 14.8031 2.48621 10.3369 2.48621C5.87062 2.48621 2.25 6.10682 2.25 10.5731C2.25 15.0393 5.87062 18.66 10.3369 18.66Z"
      stroke="black"
      strokeWidth="1.55268"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.3359 5.72095V10.5731L13.5707 12.1904"
      stroke="black"
      strokeWidth="1.55268"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DestinationCard = ({ destination }: { destination: DestinationCard }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`flex flex-col bg-white rounded-xl border transition-all duration-300 ${
        isHovered 
          ? "shadow-lg border-gray-300" 
          : "shadow-sm border-gray-200"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative w-full h-48 rounded-t-xl overflow-hidden">
        <img
          src={destination.image}
          alt={destination.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-4">
        {/* Header with title and price */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#181D27] font-nunito">
            {destination.title}
          </h3>
          <div className="text-lg font-bold text-black font-nunito">
            {destination.price}
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-1.5 opacity-60">
          <ClockIcon />
          <span className="text-sm font-medium text-black font-nunito">
            {destination.duration}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-black opacity-80 font-nunito leading-relaxed">
          {destination.description}
        </p>

        {/* Book Button */}
        <button
          className={`w-full py-2.5 px-6 rounded-lg border transition-all duration-300 font-medium text-lg font-roboto ${
            destination.buttonStyle === "filled" || isHovered
              ? "bg-[#F25C54] text-white border-[#F25C54] hover:bg-[#E54B43]"
              : "border-[#F25C54] text-[#F25C54] hover:bg-[#F25C54] hover:text-white"
          }`}
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default function HotelDestinationCards() {
  return (
    <div className="space-y-6">
      {/* Section Title */}
      <h2 className="text-2xl font-bold text-black font-raleway">
        Recommended Destinations
      </h2>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {destinations.map((destination, index) => (
          <DestinationCard key={index} destination={destination} />
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center pt-4">
        <PaginationDots total={5} current={0} />
      </div>
    </div>
  );
}
