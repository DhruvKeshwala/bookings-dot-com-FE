"use client";
import http from "@/services/http";
import cn from "@/utils/functions/class-name";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import LocationIcon from "../icons/Location";
import AirLaneIcon from "../icons/AirplaneIcon";

type Airport = {
  type: "airport";
  airport_name: string;
  airport_code: string;
};

type CityOption = {
  type: "city";
  city_name: string;
  city_code: string;
  country_name: string;
  country_code: string;
  airports: Airport[];
  airport_name: string;
  airport_code: string;
};

const fetchCityAirportOptions = async (
  query: string
): Promise<CityOption[]> => {
  if (!query) return [];
  try {
    const { data } = await http.get(
      `/airports/search?q=${encodeURIComponent(query)}`
    );
    if (Array.isArray(data)) return data;
    return [];
  } catch (error) {
    console.error("Failed to fetch city/airport options:", error);
    return [];
  }
};

const fetchCityAirportbyIATA = async (query: string): Promise<CityOption[]> => {
  if (!query) return [];
  try {
    const { data } = await http.get(
      `/airports/iatatoairportname?iata=${encodeURIComponent(query)}`
    );
    if (Array.isArray(data)) return data;
    return [];
  } catch (error) {
    console.error("Failed to fetch city/airport options:", error);
    return [];
  }
};

// ------------------------------
// Custom Dropdown UI (collapsible cities)
// ------------------------------
function DropdownMenu({
  options,
  selectOption,
  inputValue,
}: {
  options: CityOption[];
  selectOption: (opt: any) => void;
  inputValue: string;
}) {
  const [expandedCities, setExpandedCities] = useState<Record<string, boolean>>(
    {}
  );

  const toggleCity = (cityCode: string) => {
    setExpandedCities((prev) => ({
      ...prev,
      [cityCode]: !(prev[cityCode] ?? true),
    }));
  };

  if (!inputValue) {
    return <div className="px-4 py-3 text-gray-400 text-sm">Start typing…</div>;
  }

  if (options.length === 0) {
    return (
      <div className="px-4 py-3 text-gray-400 text-sm">No results found</div>
    );
  }

  return (
    <div
      className="max-h-96 overflow-y-auto  scrollbar-hide rounded-[12px]"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {options.map((city) => {
        const isExpanded = expandedCities[city.city_code] ?? true; // expanded by default
        return (
          <div
            key={city.city_code}
            className="border-b last:border-b-0 border-[#CBCACA]"
          >
            {/* City header with arrow toggle */}
            <div
              className="flex items-center justify-between gap-2 px-4 py-2 cursor-pointer hover:bg-gray-100"
              // Use onMouseDown so it fires before the input loses focus
              onMouseDown={(e) => {
                e.preventDefault(); // keep focus on input; avoid closing
                toggleCity(city.city_code);
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center gap-[16px]">
                <LocationIcon />
                <div>
                  <div className="subheading text-black">{city.city_name}</div>
                  <div className="body-text text-black">
                    {city.country_name}
                  </div>
                </div>
              </div>
              {isExpanded ? (
                <FaChevronDown className="text-black text-xs" />
              ) : (
                <FaChevronRight className="text-black text-xs" />
              )}
            </div>

            {/* Airports (only if expanded) */}
            {isExpanded &&
              city.airports.map((airport) => (
                <div
                  key={airport.airport_code}
                  className="flex items-center gap-2 py-2 cursor-pointer hover:bg-primary pl-[30px] group"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectOption({
                      code: airport.airport_code,
                      city: city.city_name,
                      country: city.country_name,
                      airport_name: airport.airport_name,
                      airport_code: airport.airport_code,
                    });
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <AirLaneIcon className="text-black group-hover:text-white" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="subheading truncate w-70 inline-block align-middle group-hover:text-white">
                        {airport.airport_name} Airport, ({airport.airport_code})
                      </p>
                    </div>
                    <div className="body-text text-black group-hover:text-white">
                      {city.city_name}, {city.country_name}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        );
      })}
    </div>
  );
}

type IataAutoCompleteType = {
  title: string;
  placement?: "left" | "right";
  dropdownPlacement?: "top" | "bottom";
  containerClassName?: string;
  selectedCity: any; // kept to match your signature
  setSelectedCity: (city: any) => void;
  initialValue?: any;
  storageKey: string;
};

// ------------------------------
// Main Select Component
// ------------------------------
const IataAutoComplete = ({
  title,
  containerClassName,
  dropdownPlacement = "bottom",
  setSelectedCity,
  initialValue,
  storageKey,
}: IataAutoCompleteType) => {
  const searchParams = useSearchParams();
  const [options, setOptions] = useState<CityOption[]>([]);
  const [inputValue, setInputValue] = useState(initialValue || "");
  const [searchValue, setSearchValue] = useState(initialValue || "");
  const [cacheResult, setCacheResult] = useState<Record<string, CityOption[]>>(
    {}
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pnr = searchParams.get("reissue_pnr");

  const bookingId = searchParams.get("reissue_bookingId");

  const isReissueMode = Boolean(pnr && bookingId);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = async () => {
      const results = await fetchCityAirportbyIATA(initialValue);
      const mappedResults: CityOption[] = results.map((res) => ({
        type: "city",
        city_name: res.city_name,
        city_code: res.city_code,
        country_name: res.country_name,
        country_code: res.country_code || "",
        airports: res.airports || [],
        airport_name: res.airport_name,
        airport_code: res.airport_code,
      }));
      setInputValue(
        mappedResults?.[0]?.airport_name
          ? `${mappedResults?.[0]?.airport_name} (${
              mappedResults?.[0]?.airport_code || ""
            })`
          : mappedResults?.[0]?.city_code
      );
    };
    handler();
  }, [initialValue, setSelectedCity, storageKey]);

  // Open dropdown on input change
  const handleInputChange = (input: string) => {
    setInputValue(input);
    setDropdownOpen(false);
    setSearchValue(input);
  };

  // Debounced search + simple cache
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!searchValue || searchValue.length < 2) {
        setOptions([]);
        return;
      }
      if (cacheResult[searchValue]) {
        setOptions(cacheResult[searchValue]);
        return;
      }
      const results = await fetchCityAirportOptions(searchValue);
      setOptions(results);
      setCacheResult((pre) => ({ ...pre, [searchValue]: results }));
    }, 350);

    return () => clearTimeout(handler);
  }, [searchValue]); // don't depend on cacheResult to avoid needless re-runs

  // Seed initial value search if provided
  useEffect(() => {
    if (initialValue) handleInputChange(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  // Close when clicking outside (reliable vs onBlur)
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!wrapperRef.current) return;
      if (target && wrapperRef.current.contains(target)) return; // click inside
      setDropdownOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "border-b border-black/40 flex flex-col justify-center ",
        containerClassName
      )}
    >
      <div className="text-black body-text opacity-60 pl-3 mb-[18px]">
        {title}
      </div>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className={`w-full bg-transparent outline-none px-3 subheading${
            isReissueMode ? "opacity-60 cursor-not-allowed" : ""
          }`}
          value={inputValue}
          onChange={(e) => {
            if (!isReissueMode) handleInputChange(e.target.value);
          }}
          onFocus={() => {
            if (!isReissueMode) setDropdownOpen(true);
          }}
          placeholder="Select..."
          autoComplete="off"
          onKeyDown={(e) => {
            if (e.key === "Escape") setDropdownOpen(false);
          }}
        />

        {inputValue.length > 1 && dropdownOpen && (
          <div
            className="absolute min-w-[374px] z-50 bg-white shadow-xl rounded-[12px] shadow-[0px_2px_4px_0px_rgba(1,59,149,0.12)] border border-t-0 border-gray-200 mt-[2px]"
            style={{
              ...(dropdownPlacement === "top"
                ? { bottom: "100%", top: "auto", marginBottom: 8 }
                : { top: "100%", bottom: "auto" }),
              right: 0,
              left: 0,
              maxWidth: "100vw",
            }}
          >
            <DropdownMenu
              options={options}
              selectOption={(option: any) => {
                setSelectedCity(option);
                localStorage.setItem(storageKey, JSON.stringify(option));
                setInputValue(
                  option.airport_name
                    ? `${option.airport_name} (${
                        option.airport_code || option.code || ""
                      })`
                    : option.city
                );
                setDropdownOpen(false);
                inputRef.current?.blur();
              }}
              inputValue={inputValue}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default IataAutoComplete;
