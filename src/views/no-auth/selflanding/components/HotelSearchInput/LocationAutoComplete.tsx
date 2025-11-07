"use client";

import { useRef, useState, useEffect } from "react";
import Select, { OptionProps, StylesConfig } from "react-select";
import cn from "@/utils/functions/class-name";
import { debounce } from "@/utils/functions/debounce";
import HotelIcon from "@/components/icons/HotelIcon";
import type { LocationOption } from "@/types/LocationOption";
import { LocationAutoCompleteProps } from "@/types/hotel.types";
import { fetchUserIp } from "@/utils/functions/hotelBookingApi";

const CustomOption = (props: OptionProps<LocationOption, false>) => {
  const { data, innerProps, isFocused } = props;

  return (
    <div
      {...innerProps}
      className={cn(
        "cursor-pointer bg-white p-4 flex text-black items-center gap-3 font-nunito",
        isFocused && "bg-highlight text-primary",
      )}
    >
      <HotelIcon className="text-gray-500 size-5" />
      <div>
        <h4 className="font-medium opacity-80 font-nunito font-sm">{data.city}</h4>
        <p className="text-sm font-medium opacity-80 font-nunito font-xs">{data.country}</p>
      </div>
    </div>
  );
};

const LocationAutoComplete = ({
  selectedLocation,
  onLocationSelect,
  onCitySelected,
}: LocationAutoCompleteProps) => {
  const [options, setOptions] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [defaultOptions, setDefaultOptions] = useState<LocationOption[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [ipData, setIpData] = useState<{ country_code?: string; city?: string } | null>(null);

  // Ref to hold data in memory
  const allCitiesCache = useRef<LocationOption[] | null>(null);
  // Ref to track if initialization has been done
  const isInitialized = useRef(false);

  // Get user's location based on IP and find relevant cities
  const fetchLocationSuggestions = async () => {
    try {
      const ipResponse = await fetchUserIp();
      setIpData(ipResponse);

      if (ipResponse.country_code && allCitiesCache.current) {
        const userCountry = ipResponse.country_code.toLowerCase();
        const userCity = ipResponse.city?.toLowerCase();

        const relevantCities = allCitiesCache.current
          .filter((location) => {
            const locationCountry = location.countryCode.toLowerCase();
            return locationCountry === userCountry;
          })
          .sort((a, b) => {
            if (userCity) {
              const aCity = a.city.toLowerCase();
              const bCity = b.city.toLowerCase();
              const aSimilarity = aCity.includes(userCity) || userCity.includes(aCity);
              const bSimilarity = bCity.includes(userCity) || userCity.includes(bCity);

              if (aSimilarity && !bSimilarity) return -1;
              if (!aSimilarity && bSimilarity) return 1;
            }
            return 0;
          })
          .slice(0, 5);

        setDefaultOptions(relevantCities);
      }
    } catch (err) {
      console.error("Failed to fetch location suggestions", err);
      setDefaultOptions([]);
    }
  };

  // Fetch and store data
  const fetchAndCacheLocations = async () => {
    if (isDataLoaded && allCitiesCache.current) {
      console.log("Data already loaded, skipping API call");
      return;
    }

    if (isInitialized.current) {
      console.log("Initialization already done, skipping API call");
      return;
    }

    console.log("Starting to fetch cities data...");
    isInitialized.current = true;

    const localData = localStorage.getItem("allCities");

    if (localData) {
      try {
        allCitiesCache.current = JSON.parse(localData);
        setIsDataLoaded(true);
        console.log("Loaded cities from localStorage");
        return;
      } catch (err) {
        console.warn("Failed to parse cached cities", err);
        localStorage.removeItem("allCities");
      }
    }

    try {
      setLoading(true);
      console.log("Making API call to fetch cities...");
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URI}/hotels/all-cities`);
      const data = await res.json();

      if (Array.isArray(data)) {
        allCitiesCache.current = data;
        localStorage.setItem("allCities", JSON.stringify(data));
        setIsDataLoaded(true);
        console.log("Successfully loaded cities from API");
      } else {
        allCitiesCache.current = [];
        setIsDataLoaded(true);
        console.log("API returned invalid data");
      }
    } catch (err) {
      console.error("Failed to fetch cities", err);
      allCitiesCache.current = [];
      setIsDataLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const searchLocations = async (query: string) => {
    if (!query || query.length < 2) {
      setOptions(defaultOptions);
      return;
    }

    if (!allCitiesCache.current) {
      console.warn("Cities data not loaded yet");
      return;
    }

    const filtered = (allCitiesCache.current || [])
      .filter(
        (location) =>
          location.city.toLowerCase().includes(query.toLowerCase()) ||
          location.country.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 20);

    setOptions(filtered);
  };

  const handleInputChange = debounce(searchLocations, 300);

  const selectedValue =
    options.find((c) => c.city === selectedLocation?.city) || selectedLocation || null;

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized.current) {
      console.log("useEffect: Already initialized, skipping");
      return;
    }

    console.log("useEffect: Starting initialization");
    const initializeData = async () => {
      await fetchAndCacheLocations();
      await fetchLocationSuggestions();
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (defaultOptions.length > 0) {
      setOptions(defaultOptions);
    }
  }, [defaultOptions]);

  return (
    <div>
      <Select
        instanceId="location_autocomplete"
        value={selectedValue}
        onChange={(value) => {
          if (value) {
            // Override countryCode with user's country_code from IP if available
            const updatedValue = {
              ...value,
              countryCode: ipData?.country_code || value.countryCode,
            };
            onLocationSelect(updatedValue);
            onCitySelected?.(updatedValue.cityCode);
          }
        }}
        onInputChange={(input) => {
          handleInputChange(input);
          return input;
        }}
        options={options}
        getOptionValue={(option) => option.cityCode}
        getOptionLabel={(option) => `${option.city}, ${option.country}`}
        placeholder="Search destination..."
        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
        components={{ Option: CustomOption }}
        styles={customStyles}
        isClearable={false}
        isSearchable={true}
        isLoading={loading}
        onMenuOpen={() => {
          if (options.length === 0) {
            setOptions(defaultOptions);
          }
        }}
        classNamePrefix="location-select"
      />
    </div>
  );
};

export default LocationAutoComplete;

const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

const customStyles: StylesConfig<LocationOption, false> = {
  control: (base) => ({
    ...base,
    fontSize: isMobile ? "0.875rem" : "1.5rem",
    fontWeight: "bold",
    backgroundColor: "transparent",
    border: "none",
    boxShadow: "none",
    padding: 0,
    margin: 0,
    minHeight: "auto",
  }),
  dropdownIndicator: () => ({ display: "none" }),
  indicatorSeparator: () => ({ display: "none" }),
  menu: (base) => ({
    ...base,
    minWidth: 320,
    borderRadius: "0.5rem",
    overflow: "hidden",
    left: isMobile ? -20 : 0,
    // border: "1px solid rgba(0, 0, 0, 0.30)",
    // boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    zIndex: 9999,
  }),
  option: (base) => ({ ...base }),
  singleValue: (base) => ({
    ...base,
    color: "#000",
    fontSize: "1.1rem",
    fontWeight: "bold",
  }),
  valueContainer: (base) => ({
    ...base,
    padding: 0,
  }),
  placeholder: (base) => ({
    ...base,
    color: "#000",
    fontSize: "1.125rem",
    fontWeight: "bold",
  }),
  input: (base) => ({
    ...base,
    color: "#000",
    fontSize: "1rem",
    fontWeight: "bold",
  }),
};
