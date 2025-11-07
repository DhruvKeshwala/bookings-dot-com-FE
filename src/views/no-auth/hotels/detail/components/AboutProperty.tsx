"use client";

import { AboutPropertyProps } from "@/types/hotel.types";
import { useState, useMemo } from "react";

export default function AboutProperty({ hotel }: AboutPropertyProps) {
  const [showAllAttractions, setShowAllAttractions] = useState(false);

  const parsedAttractions = useMemo(() => {
    const data = hotel?.Attractions;

    if (Array.isArray(data)) return data;

    if (data && typeof data === "object") {
      return Object.entries(data).map(([_, name]) => ({
        name: name,
      }));
    }

    return [];
  }, [hotel?.Attractions]);

  const attractionsToShow = !showAllAttractions
    ? parsedAttractions.slice(0, 4)
    : parsedAttractions;

  return (
    <div className="mb-8">
      <h3 className="text-xl md:text-2xl font-bold mb-4 font-raleway text-black">
        About this property
      </h3>

      <div className="flex flex-col gap-4">
        {/* Property Title */}
        <div className="flex flex-col gap-6 text-black font-nunito leading-6">
          <div className="text-black font-nunito leading-6">
            <div
              className="text-black font-nunito leading-6 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: hotel?.Description || "" }}
            />
          </div>
        </div>

        {/* First Attractions Section */}
        {parsedAttractions.length > 0 && (
          <div className="flex flex-col gap-4">
            <h4 className="text-sm md:text-xl font-bold text-black font-nunito leading-[30px]">
              Nearby Attractions
            </h4>
            <ul className="list-disc pl-5">
              {attractionsToShow.map((attraction: any, idx) => (
                <li
                  key={idx}
                  className="text-xs md:text-base text-black font-nunito leading-6"
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: attraction.name.replace(/<[^>]+>/g, ""),
                    }}
                  />
                  {attraction?.distance && (
                    <span className="ml-2 text-gray-600">
                      ({attraction?.distance})
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {/* Show View More button if there are more than 4 attractions */}
            {parsedAttractions.length > 4 && (
              <div className="flex justify-start">
                <button
                  onClick={() => setShowAllAttractions(!showAllAttractions)}
                  className="text-[#FF7F50] font-bold hover:underline"
                >
                  {showAllAttractions ? "View Less" : "View More"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
