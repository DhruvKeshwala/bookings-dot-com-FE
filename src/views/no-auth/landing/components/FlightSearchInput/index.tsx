"use client";

import { memo, useCallback, useMemo, useState } from "react";

import { FlightSearchTypeEnum } from "@/common/enums";
import SearchInput from "./SearchInput";

// Memoized Radio Button
const FlightTypeRadio = memo(function FlightTypeRadio({
  label,
  value,
  isSelected,
  onSelect,
}: {
  label: string;
  value: FlightSearchTypeEnum;
  isSelected: boolean;
  onSelect: (val: FlightSearchTypeEnum) => void;
}) {
  return (
    <div
      role="button"
      onClick={() => onSelect(value)}
      className={`px-[10px] py-[5px] rounded-[8px] cursor-pointer ${
        isSelected ? "bg-primary text-white" : ""
      }`}
    >
      <span className="btn-text">{label}</span>
    </div>
  );
});

export default function FlightSearchInput() {
  const [selectedType, setSelectedType] = useState<FlightSearchTypeEnum>(
    FlightSearchTypeEnum["Round Trip"]
  );

  const flightTypes = useMemo(
    () =>
      Object.entries(FlightSearchTypeEnum).filter(([key]) =>
        isNaN(Number(key))
      ) as [string, FlightSearchTypeEnum][],
    []
  );

  const handleTypeChange = useCallback((type: FlightSearchTypeEnum) => {
    setSelectedType(type);
  }, []);

  return (
    <>
      {/* Flight Type Selector */}
      <div className="flex items-center justify-between mb-[24px]">
        <h3 className="text-primary subheading">
          Find Your Perfect {flightTypes ? "Flight" : "Stay"}
        </h3>
        {flightTypes && (
          <div className="flex gap-2">
            {flightTypes.map(([label, value]) => (
              <FlightTypeRadio
                key={value}
                label={label}
                value={value}
                isSelected={selectedType === value}
                onSelect={handleTypeChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Flight Search Input Fields */}

      <SearchInput
        showRangePicker={selectedType === FlightSearchTypeEnum["Round Trip"]}
      />
      {/* )} */}
    </>
  );
}
