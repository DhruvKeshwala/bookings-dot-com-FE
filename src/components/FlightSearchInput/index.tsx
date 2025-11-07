"use client";

import { memo, useCallback, useMemo, useState } from "react";

import { FlightSearchTypeEnum } from "@/common/enums";
// import MultiCitySearchInput from "./MultiCitySearchInput";
import cn from "@/utils/functions/class-name";
import { usePathname } from "next/navigation";
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
      className={cn(
        "flex items-center cursor-pointer gap-[12px]",
        isSelected ? "text-primary" : "text-black"
      )}
    >
      <div
        className={`flex justify-center items-center w-[19px] h-[19px] border-[1.2px] rounded-[9.5px] ${
          isSelected ? "border-primary" : "border-black"
        }`}
      >
        {isSelected && (
          <div className="bg-primary rounded-full w-[9px] h-[9px]" />
        )}
      </div>
      <span className="body-text">{label}</span>
    </div>
  );
});

export default function FlightSearchInput(initialValue: any) {
  const pathname = usePathname();
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
      <div
        className={`flex items-center gap-[32px] justify-start ${
          pathname?.startsWith("/hotels/search") ? "my-3" : "my-6"
        }`}
      >
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

      {/* Flight Search Input Fields */}
      <SearchInput initialValue={initialValue?.initialValue?.initialValue} />
      {/* )} */}
    </>
  );
}
