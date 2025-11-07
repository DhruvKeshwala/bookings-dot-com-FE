"use client";
import Button from "@/components/ui/NewButton";
import Image from "next/image";
import React, { useState } from "react";

type AiSearchSectionProps = {
  type?: "default" | "flight" | "hotel" | "bus" | "shop" | "gigs" | string | undefined;
};

// const suggestions = [
//   "Create a new trip",
//   "Summer Vacation ideas",
//   "Weekend getaways",
//   "Weekend getaways",
//   "Find me flights under $100 to a beach destination for spring break",
// ];

const suggestions = {
  default: [
    "Create a new trip",
    "Summer Vacation ideas",
    "Weekend getaways",
    "Best travel deals",
    "Find me flights under $100 to a beach destination for spring break",
  ],
  flight: [
    "Cheapest Flight to Bali",
    "Flights to Thailand",
    "Create a trip to Vietnam",
    "Mumbai to Goa Flights",
    "Find flights from Delhi to Dubai under ₹20,000 this weekend",
  ],
  hotel: [
    "Find 4-star hotels in Bali",
    "Which hotels in Dubai",
    "Compare hotels near Eiffel Tower",
    "Family-friendly hotels in Goa",
    "Show me beachfront hotels in Goa under ₹5,000 per night",
  ],
}


export default function AiSearchSection({ type }: AiSearchSectionProps) {
  const [query, setQuery] = useState("");

const subhseading = {
  default: "Whether it’s destinations, itinerary, questions or deals, your AI buddy has the answer.",
  flight: " Looking for cheap flights, hidden airline deals, or travel tips? Your AI travel buddy helps you plan smarter and save more.",
  hotel: " Looking for the best hotels, hidden stay deals, or unique accommodations? Your AI travel buddy helps you find the right place for every destination.",
}

  return (
    <div 
      className="relative bg-primary full-bleed"
    >
      <section
        className="py-16 flex flex-col items-center"
      >
      <div className="max-w-[1280px] w-full mx-auto flex flex-col items-center z-10">
        <span className="bg-[#E8F3FB] text-base px-4 py-1 rounded-xl text-primary mb-4 tracking-wide font-medium font-nunito">
          BETA
        </span>
        <h2 className="text-white text-[22px]  font-bold mb-2 text-center font-raleway">
          Ask AI Travulu Anything.
        </h2>
        <p className="mb-5 text-[#E8F3FB] font-nunito font-bold text-lg">
           {subhseading[type as "default" | "flight" | "hotel"] || subhseading.default}
        </p>
        <form
          className="w-full flex justify-center mb-8 font-nunito"
          onSubmit={(e) => e.preventDefault()}
        >
          <div
            className="flex w-full max-w-3xl items-center bg-white rounded-full shadow-lg px-6 py-3 relative"
            style={{ boxShadow: "0 8px 24px 0 rgba(1,69,105,0.18)" }}
          >
            <Image
              src="/icons/aisearech.svg"
              alt="AI Icon"
              width={30}
              height={30}
              className=" rounded-full mr-4 shadow-lg object-cover"
            />
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-gray-700 text-lg placeholder-gray-400 placeholder:text-base placeholder:font-nunito placeholder:font-medium"
              placeholder="Ask AI what are you looking in your next trip?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button
              variant="solid"
              color="secondary"
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-8 py-2 rounded-full  text-white font-bold text-lg shadow-lg "
              style={{ boxShadow: "0 4px 16px 0 rgba(255,107,107,0.18)" }}
            >
              Search
            </Button>
          </div>
        </form>
        <div className="flex flex-wrap gap-4 justify-center mb-4">
          {(
            suggestions[type as "default" | "flight" | "hotel"] || suggestions.default
          ).map((s, i) => (
            <button
              key={i}
              className="px-5 py-2 rounded-lg border-[1.5px] border-white bg-transparent text-[#E8F3FB] text-base font-semibold font-nunito hover:bg-white/10 transition shadow-sm"
              onClick={() => setQuery(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at right, rgba(255,255,255,0.04) 0%, rgba(1,69,105,0.2) 100%)",
        }}
      ></div>
    </section>
    </div>
  );
}
