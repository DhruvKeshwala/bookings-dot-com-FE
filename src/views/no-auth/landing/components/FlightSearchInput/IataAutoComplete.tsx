"use client";

import { useEffect, useRef, useState } from "react";
import http from "@/services/http";
import PlaneTackOffIcon from "@/components/icons/PlaneIcon";
import cn from "@/utils/functions/class-name";
import { FaMapMarkerAlt, FaChevronDown, FaChevronRight } from "react-icons/fa";
import DepartIcon from "@/components/icons/DepartIcon";
import GoingIcon from "@/components/icons/GoingIcon";

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
      className="max-h-96 overflow-y-auto  scrollbar-hide"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {options.map((city) => {
        const isExpanded = expandedCities[city.city_code] ?? true; // expanded by default
        return (
          <div
            key={city.city_code}
            className="border-b last:border-b-0 border-gray-100"
          >
            {/* City header with arrow toggle */}
            <div
              className="flex items-center justify-between gap-2 px-4 pt-3 pb-1 cursor-pointer hover:bg-gray-50"
              // Use onMouseDown so it fires before the input loses focus
              onMouseDown={(e) => {
                e.preventDefault(); // keep focus on input; avoid closing
                toggleCity(city.city_code);
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-gray-500" />
                <div>
                  <div className="font-semibold text-sm">
                    {city.city_name}{" "}
                    {/* <span className="text-xs text-gray-400">
                      ({city.city_code})
                    </span> */}
                  </div>
                  <div className="text-xs text-gray-500">
                    {city.country_name}
                  </div>
                </div>
              </div>
              {isExpanded ? (
                <FaChevronDown className="text-gray-500 text-xs" />
              ) : (
                <FaChevronRight className="text-gray-500 text-xs" />
              )}
            </div>

            {/* Airports (only if expanded) */}
            {isExpanded &&
              city.airports.map((airport) => (
                <div
                  key={airport.airport_code}
                  className="flex items-center gap-2 px-10 py-2 cursor-pointer hover:bg-blue-50 "
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent blur before selection
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
                  <PlaneTackOffIcon className="text-gray-600 size-4.5" />
                  <div>
                    <div className="text-sm flex items-center gap-2">
                      <p className="truncate w-44 inline-block align-middle">
                        {airport.airport_name} Airport, ({airport.airport_code})
                      </p>{" "}
                      {/* <span className="text-xs text-gray-400 ">{airport.airport_code}</span> */}
                    </div>
                    <div className="text-xs text-gray-400">
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
  initialValue?: string;
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
  const [options, setOptions] = useState<CityOption[]>([]);
  const [inputValue, setInputValue] = useState(initialValue || "");
  const [searchValue, setSearchValue] = useState(initialValue || "");
  const [cacheResult, setCacheResult] = useState<Record<string, CityOption[]>>(
    {}
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultOptions: Record<string, any> = {
    lastDepartFrom: {
      code: "DEL",
      city: "Delhi",
      country: "India",
      airport_name: "Indira Gandhi International Airport",
      airport_code: "DEL",
    },
    lastGoingTo: {
      code: "BOM",
      city: "Mumbai",
      country: "India",
      airport_name: "Chhatrapati Shivaji Maharaj International Airport",
      airport_code: "BOM",
    },
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSelectedCity(parsed);
      setInputValue(
        parsed.airport_name
          ? `${parsed.airport_name} (${
              parsed.airport_code || parsed.code || ""
            })`
          : parsed.city
      );
    } else {
      const fallback = defaultOptions[storageKey];
      if (fallback) {
        setSelectedCity(fallback);
        setInputValue(`${fallback.airport_name} (${fallback.airport_code})`);
        localStorage.setItem(storageKey, JSON.stringify(fallback));
      }
    }
  }, [initialValue, setSelectedCity, storageKey]);

  // Open dropdown on input change
  const handleInputChange = (input: string) => {
    setInputValue(input);
    setDropdownOpen(true);
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
        "flex flex-col text-black justify-center",
        containerClassName
      )}
    >
      <p className="body-2-semibold text-[#646464] mb-2">{title}</p>

      <div className="relative">
        <div className="flex items-center gap-[10px] bg-white border border-[#CBCACA] rounded-[8px] px-[12px] py-[10px]">
          {title === "Going To" ? <GoingIcon /> : <DepartIcon />}
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent outline-none body-text text-[#646464] placeholder:font-bold"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setDropdownOpen(true)}
            // Remove onBlur; we now use a robust outside-click handler
            placeholder="Select..."
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Escape") setDropdownOpen(false);
            }}
          />
        </div>

        {inputValue.length > 1 && dropdownOpen && (
          <div
            className="absolute z-50 bg-white shadow-xl rounded-b-lg border border-t-0 border-gray-200"
            style={{
              ...(dropdownPlacement === "top"
                ? { bottom: "100%", top: "auto", marginBottom: 8 }
                : { top: "100%", bottom: "auto", marginTop: 8 }),
              right: "auto",
              left: 0,
              minWidth: "100%",
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
