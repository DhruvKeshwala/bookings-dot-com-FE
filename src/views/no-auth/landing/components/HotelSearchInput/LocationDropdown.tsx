"use client";

import { useState, useRef, useEffect } from "react";

type LocationItem = {
  id: string;
  city: string;
  country: string;
};

type LocationDropdownProps = {
  selectedLocation: string;
  onLocationSelect: (location: string) => void;
};

const locations: LocationItem[] = [
  { id: "1", city: "New Delhi", country: "India" },
  { id: "2", city: "Mumbai", country: "India" },
  { id: "3", city: "Bangalore", country: "India" },
  { id: "4", city: "Chennai", country: "India" },
  { id: "5", city: "Kolkata", country: "India" },
  { id: "6", city: "Hyderabad", country: "India" },
];

export default function LocationDropdown({
  selectedLocation,
  onLocationSelect,
}: LocationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationClick = (location: LocationItem) => {
    onLocationSelect(location.city);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="text-lg lg:text-[14px] font-medium text-black opacity-60 mb-4">
          Where
        </div>
        <div className="text-xl lg:text-2xl font-bold text-black opacity-80">
          {selectedLocation}
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-[320px] bg-white border border-black/30 rounded-lg shadow-lg overflow-visible">
          {locations.map((location, index) => {
            const isSelected = location.city === selectedLocation;
            const isLast = index === locations.length - 1;

            return (
              <div
                key={location.id}
                className={`
                  flex flex-col gap-1 px-6 py-4 cursor-pointer transition-colors
                  ${
                    isSelected
                      ? "bg-[rgba(0,31,80,0.05)] text-[#001F50]"
                      : "bg-white text-black hover:bg-gray-50"
                  }
                  ${!isLast ? "border-b border-[#013B95]/40" : ""}
                `}
                onClick={() => handleLocationClick(location)}
              >
                <div className="text-base font-medium opacity-80">
                  {location.city}
                </div>
                <div className="text-sm font-medium opacity-80">
                  {location.country}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
