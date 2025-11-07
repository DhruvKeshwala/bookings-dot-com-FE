"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import FilterControls from "./components/FilterControls";
import SortTabs from "./components/SortTabs";
import HotelListing from "./components/HotelListing";
import MapView from "./components/MapView";
import http from "@/services/http";
import { useRef } from "react";
import LoadingTransition from "../../components/LoadingTransition";
import { generatePaxRooms } from "@/utils/functions/paxRooms";
import { useAtom } from "jotai";
import { appLoadingAtom } from "@/app/atoms/ui";
import { SessionManager } from "@/utils/functions/SessionManager";

const initialGuests = { adults: 2, children: 0 };

const initialFilterState = {
  bookingFeatures: {
    freeCancellation: false,
    breakfastIncluded: false,
  },
  priceRanges: [],
  reviewScores: [],
  starRatings: [],
  showDiscountsOnly: false,
  roomTypes: [],
  amenities: [],
};

export default function HotelSearch() {
  const rawParams = useSearchParams();
  const params = rawParams.get("params");
  const parsedParams = params ? JSON.parse(decodeURIComponent(params)) : {};

  const searchKey = useMemo(() => {
    if (!parsedParams.locationCityCode || !parsedParams.checkin || !parsedParams.checkout) {
      return null;
    }
    return `${parsedParams.locationCityCode}-${parsedParams.checkin}-${parsedParams.checkout}-${parsedParams.rooms || 1}`;
  }, [parsedParams]);

  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("top-reviews");
  const [hotels, setHotels] = useState<any[]>([]);
  const [message, setMessage] = useState<string>("");
  const [filters, setFilters] = useState(initialFilterState);
  const [filteredHotels, setFilteredHotels] = useState<any[]>([]);
  const [allHotelCodes, setAllHotelCodes] = useState<any[]>([]);
  const [allFetchedHotels, setAllFetchedHotels] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const lastSearchKey = useRef<string | null>(null);
  const [, setAppLoading] = useAtom(appLoadingAtom);
  const [filterloading, setFilterLoading] = useState(true);
  const [displayedHotelCount, setDisplayedHotelCount] = useState(30);
  const isApplyingApiFilters = useRef(false);

  function areFiltersEqual(
    a: {
      bookingFeatures: {
        freeCancellation: boolean;
        breakfastIncluded: boolean;
      };
      priceRanges: never[];
      reviewScores: never[];
      starRatings: never[];
      showDiscountsOnly: boolean;
      roomTypes: never[];
      amenities: never[];
    },
    b: {
      bookingFeatures: {
        freeCancellation: boolean;
        breakfastIncluded: boolean;
      };
      priceRanges: never[];
      reviewScores: never[];
      starRatings: never[];
      showDiscountsOnly: boolean;
      roomTypes: never[];
      amenities: never[];
    }
  ) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  const hasFiltersApplied = !areFiltersEqual(filters, initialFilterState);

  const sortedHotels = useMemo(() => {
    const sourceHotels = hasFiltersApplied ? filteredHotels : hotels;

    const getPrice = (hotel: any) =>
      hotel.Rooms?.[0]?.DayRates?.[0]?.[0]?.BasePrice || 0;
    const getRating = (hotel: any) => {
      if (hotel.HotelRating) {
        return typeof hotel.HotelRating === 'string'
          ? parseFloat(hotel.HotelRating) || 0
          : hotel.HotelRating;
      }
      return hotel.Rooms?.[0]?.Rating || hotel.rating || 0;
    };

    const sorted = [...sourceHotels];

    switch (sortBy) {
      case "low-to-high":
        sorted.sort((a, b) => getPrice(a) - getPrice(b));
        break;
      case "high-to-low":
        sorted.sort((a, b) => getPrice(b) - getPrice(a));
        break;
      case "top-reviews":
        sorted.sort((a, b) => getRating(b) - getRating(a));
        break;
      case "recommended":
        sorted.sort((a, b) => {
          const ratingA = getRating(a);
          const ratingB = getRating(b);
          const priceA = getPrice(a);
          const priceB = getPrice(b);
          if (ratingA !== ratingB) {
            return ratingB - ratingA;
          }

          return priceA - priceB;
        });
        break;
      default:
        // Return original order
        return [...sourceHotels];
    }

    return sorted;
  }, [allFetchedHotels, filteredHotels, sortBy, hasFiltersApplied]);

  const displayedHotels = useMemo(() => {
    return sortedHotels.slice(0, displayedHotelCount);
  }, [sortedHotels, displayedHotelCount]);

  const hasMoreHotels = sortedHotels.length > displayedHotelCount;

  const memoizedSearchParams = useMemo(() => {
    return {
      location: parsedParams?.location || "New Delhi",
      locationCityCode: parsedParams?.locationCityCode,
      locationNationality: parsedParams?.locationNationality,
      checkin: parsedParams?.checkin,
      checkout: parsedParams?.checkout,
      guests: parsedParams?.guestssearch ? JSON.parse(parsedParams.guestssearch) : initialGuests,
      rooms: parseInt(parsedParams?.rooms || "1"),
    };
  }, [rawParams, parsedParams]);

  // ✅ Add this right after the above:
  const {
    location,
    locationCityCode,
    locationNationality,
    checkin,
    checkout,
    guests,
    rooms,
  } = memoizedSearchParams;

  const requiredParamsMissing =
    !locationCityCode || !checkin || !checkout || !guests || !rooms;

  // Fetch hotel codes and their data
  useEffect(() => {
    if (requiredParamsMissing || !searchKey) {
      setMessage("Missing search parameters. Please start your search again.");
      setHotels([]);
      setLoading(false);
      setAppLoading(false);
      return;
    }

    if (lastSearchKey.current === searchKey) {
      return;
    }

    lastSearchKey.current = searchKey;
    setLoading(true);
    setAppLoading(true);

    const fetchHotelCodesAndSearch = async () => {
      try {
        setHotels([]);
        setAllHotelCodes([]);

        // STEP 1: Extract city name from location (e.g., "Surat, Gujarat" => "surat")
        const city = location?.split(",")[0]?.trim().toLowerCase();

        // STEP 2: Call airport API
        try {
          const airportRes = await http.get(`/hotel-airport?city=${city}`);
          const airportData = airportRes.data;
          console.log("Airport API Data:", airportData);
          sessionStorage.setItem("airportData", JSON.stringify(airportData));

          // You can use airportData as needed here (e.g., airport codes, nearby airports, etc.)
        } catch (airportErr) {
          console.warn("Failed to fetch from airport API:", airportErr);
        }

        // STEP 3: Proceed with hotel code DB check
        let response;
        try {
          response = await http.get(`/hotels/cityCode/${locationCityCode}`);
        } catch (checkErr) {
          console.warn("CityCode not found in DB. Will fallback.:", checkErr);
        }

        let hotelData;

        if (response?.data?.success && response.data?.data?.Hotels?.length) {
          // Data found in DB
          hotelData = response.data.data;
          console.log("Loaded hotels from DB");
        } else {
          // Not in DB: Call /hotel-codes API to fetch from TBO and store in DB
          console.log("Fetching from TBO and saving...");
          const fallbackRes = await http.get(
            `/hotels/hotel-codes/${locationCityCode}`
          );

          if (
            fallbackRes?.data?.success &&
            fallbackRes.data?.data?.Hotels?.length
          ) {
            hotelData = fallbackRes.data.data;
          } else {
            setMessage("No hotel codes found.");
            setLoading(false);
            setAppLoading(false);
            return;
          }
        }

        // ✅ STEP 4: Set hotel list
        setAllHotelCodes(hotelData.Hotels);

      } catch (error) {
        console.error("Hotel code fetch failed:", error);
        setMessage("Failed to fetch hotel codes.");
        setLoading(false);
        setAppLoading(false);
      }
    };

    fetchHotelCodesAndSearch();
  }, [searchKey, requiredParamsMissing]);

  // Fetch hotels for current batch
  useEffect(() => {
    if (allHotelCodes.length === 0) return;
    const codesToFetch = allHotelCodes;
    if (codesToFetch.length === 0) return;

    fetchHotelBatch(codesToFetch);
  }, [allHotelCodes]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);

    setTimeout(() => {
      const nextHotels = allFetchedHotels.slice(currentIndex, currentIndex + 30);

      if (nextHotels.length > 0) {
        setHotels(prev => [...prev, ...nextHotels]);
        setCurrentIndex(prev => prev + 30);
      }

      setIsLoadingMore(false);
    }, 300);
  };


  const getResponseTime = (count: number): number => {
    if (count >= 100) return 23;
    if (count >= 75) return 18;
    if (count >= 50) return 13;
    if (count >= 25) return 6;
    return Math.max(3, Math.floor(count / 5)); // fallback for small chunks
  };

  const fetchHotelBatch = async (hotelCodesChunk: any[]) => {
    setIsLoadingMore(true);
    try {
      const hotelCodes = hotelCodesChunk.map((h: any) => h.HotelCode);
      const isRefundable = filters?.bookingFeatures.freeCancellation || false;
      const isBreakfastIncluded = filters?.bookingFeatures.breakfastIncluded || false;

      sessionStorage.setItem("refundable", isRefundable || hasRefundableRooms ? "true" : "false");

      const payload = {
        CheckIn: checkin,
        CheckOut: checkout,
        HotelCodes: hotelCodes,
        GuestNationality: locationNationality,
        ResponseTime: getResponseTime(hotelCodesChunk.length),
        PaxRooms: generatePaxRooms(rooms, guests),
        IsDetailedResponse: true,
        Filters: {
          Refundable: isRefundable || hasRefundableRooms,
          NoOfRooms: 0,
          MealType: isBreakfastIncluded ? 1 : 0,
          OrderBy: 0,
          StarRating: 0,
          HotelName: null,
        },
      };

      const { data } = await http.post("/hotel/search", payload);

      if (data?.success === true && Array.isArray(data.HotelResult)) {
        SessionManager.startSession();
        const mergedHotels = data.HotelResult

        try {
          const hotelDetails = data?.details?.HotelDetails || [];
          const detailsMap = new Map(hotelDetails.map((d: any) => [d.HotelCode, d]));

          const hotelsWithDetails = mergedHotels.map((hotel: any) => {
            const details = detailsMap.get(hotel.HotelCode);
            return details ? { ...hotel, ...details } : hotel;
          });

          const validHotels = hotelsWithDetails.filter(
            (h: { Rooms: any[]; HotelFacilities?: any[] }) =>
              Array.isArray(h.Rooms) &&
              h.Rooms.length > 0 &&
              Array.isArray(h.HotelFacilities) &&
              h.HotelFacilities.length > 0
          );

          if (validHotels.length > 0) {
            setAllFetchedHotels(validHotels);
            setHotels(validHotels.slice(0, 30));
            setCurrentIndex(30);
            setLoading(false);
            setFilterLoading(false);
            setAppLoading(false);
          } else {
            setIsLoadingMore(false);
          }
        } catch (detailsError) {
          console.error("Error merging hotel details:", detailsError);

          const validHotels = mergedHotels.filter(
            (h: { Rooms: any[]; HotelFacilities?: any[] }) =>
              Array.isArray(h.Rooms) &&
              h.Rooms.length > 0 &&
              Array.isArray(h.HotelFacilities) &&
              h.HotelFacilities.length > 0
          );

          setHotels(validHotels);
          setLoading(false);
          setFilterLoading(false);
          setAppLoading(false);
        }
      } else if (data?.success === false) {
        // Handle no available rooms message
        setMessage(data?.error || "No available rooms for the given criteria.");
        setHotels([]);
        setLoading(false);
        setFilterLoading(false);
        setAppLoading(false);
      } else {
        setMessage(data?.error || "Failed to fetch hotels.");
        setHotels([]);
        setLoading(false);
        setFilterLoading(false);
        setAppLoading(false);
      }
    } catch (error) {
      console.error("Error fetching hotel batch:", error);
      setMessage("Failed to fetch hotels.");
      setLoading(false);
      setFilterLoading(false);
      setAppLoading(false);
    } finally {
      setIsLoadingMore(false);
      isApplyingApiFilters.current = false;
    }
  };

  useEffect(() => {
    const codesToFetch = allHotelCodes;
    if (filters && codesToFetch.length > 0) {
      isApplyingApiFilters.current = true;
      setFilterLoading(true);
      fetchHotelBatch(codesToFetch);
    }
  }, [filters.bookingFeatures.breakfastIncluded, filters?.bookingFeatures.freeCancellation]);


  function applyFilters(newFilters: typeof initialFilterState, skipLoading = false) {
    // Check if freeCancellation or breakfastIncluded changed
    const apiFiltersChanged = 
      newFilters.bookingFeatures.freeCancellation !== filters.bookingFeatures.freeCancellation ||
      newFilters.bookingFeatures.breakfastIncluded !== filters.bookingFeatures.breakfastIncluded;
    
    if (apiFiltersChanged) {
      // Just set filters - the useEffect will trigger API call
      setFilters(newFilters);
      return;
    }
    
    if (!skipLoading) {
      setFilterLoading(true);
    }
    setFilters(newFilters);
    setDisplayedHotelCount(30);
    let filtered = allFetchedHotels;

    // Star rating
    if ((newFilters.starRatings as number[]).length > 0) {
      filtered = filtered.filter((hotel) => {
        let rating = 0;
        if (hotel.HotelRating) {
          rating = hotel.HotelRating;
        } else if (hotel.Rooms?.[0]?.Rating) {
          rating = Number(hotel.Rooms[0].Rating);
        }
        return (newFilters.starRatings as number[]).includes(rating);
      });
    }

    // Review scores
    if (newFilters.reviewScores.length > 0) {
      filtered = filtered.filter((hotel) => {
        const rating = hotel.Rooms?.[0]?.Rating || hotel.HotelRating || 0;
        return newFilters.reviewScores.some((score: string) => {
          if (score.startsWith("5.0")) return rating >= 5.0;
          if (score.startsWith("4.5")) return rating >= 4.5;
          if (score.startsWith("4.0")) return rating >= 4.0;
          if (score.startsWith("3.5")) return rating >= 3.5;
          if (score.startsWith("3.0")) return rating >= 3.0;
          return false;
        });
      });
    }

    // Show discounts only
    if (newFilters.showDiscountsOnly) {
      filtered = filtered.filter((hotel) => {
        const discount = hotel.discount || hotel.Rooms?.[0]?.Discount;
        return !!discount;
      });
    }

    // Room types
    if (newFilters.roomTypes.length > 0) {
      filtered = filtered.filter((hotel) =>
        hotel.Rooms?.some(
          (room: { Name?: string[] }) =>
            Array.isArray(room.Name) &&
            room.Name.some((roomName: string) =>
              newFilters.roomTypes.some((type: string) =>
                roomName.toLowerCase().includes(type.toLowerCase())
              )
            )
        )
      );
    }

    // Amenities
    if (newFilters.amenities.length > 0) {
      filtered = filtered.filter(
        (hotel) =>
          hotel.HotelFacilities &&
          newFilters.amenities.every((amenity: string) => {
            if (
              amenity.toLowerCase() === "wi-fi" ||
              amenity.toLowerCase() === "wifi"
            ) {
              // Match any facility containing 'wifi' (case-insensitive)
              return hotel.HotelFacilities.some((f: string) =>
                f.toLowerCase().includes("wifi")
              );
            }
            return hotel.HotelFacilities.some((f: string) =>
              f.toLowerCase().includes(amenity.toLowerCase())
            );
          })
      );
    }

    setFilteredHotels([...filtered]);
    
    setTimeout(() => {
      setFilterLoading(false);
    }, 300);
  }

  useEffect(() => {
    if (isApplyingApiFilters.current) {
      return;
    }
    
    if (hasFiltersApplied) {
      applyFilters(filters, false);
    } else {
      setFilteredHotels([]);
      setFilterLoading(false);
      setDisplayedHotelCount(30);
    }
  }, [hotels, filters]);

  const handleViewMoreFiltered = () => {
    setDisplayedHotelCount(prev => prev + 30);
  };

  const formatDateRange = () => {
    if (!checkin || !checkout) return "15th - 26 April";
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const checkinFormatted = format(checkinDate, "do MMM");
    const checkoutFormatted = format(checkoutDate, "do MMM");
    return `${checkinFormatted} - ${checkoutFormatted}`;
  };

  const totalGuests = guests.adults + guests.children;

  const searchData = {
    location,
    dateRange: formatDateRange(),
    guests: totalGuests,
    rooms,
    locationCityCode,
    locationNationality,
    checkin,
    checkout,
    guestsData: guests,
  };

  const refundableValue = sessionStorage.getItem("refundable");
  const isRefundable = refundableValue === "true";

  const hasRefundableRooms = displayedHotels.some(
    (hotel) => hotel.Rooms?.some((room: any) => room?.IsRefundable === true)
  );
  
  if (loading) {
    return <LoadingTransition />;
  }

  return (
    <div className="min-h-screen bg-white text-black font-normal">
      <div className="w-full max-w-[1140] 2xl:max-w-[1440px] mx-auto px-20 py-3 max-2xl:px-0">
        {/* Header */}
        <div className="flex flex-col gap-3 md:gap-6 mb-3">
          <div>
            {(isRefundable || hasRefundableRooms) ? (
              <p className="text-3xl md:text-3xl font-medium font-sans">
                <span className="text-[#FF7F50] font-bold">Buy Now, Pay Later</span>{" "}
                <span className="text-[#014569] font-bold">for </span>
                <span className="text-[#FF7F50] font-bold">₹0</span>
                <span className="text-[#014569] font-bold">, Only on </span>
                <span className="text-[#014569] font-bold">Travulu!</span>
              </p>
            ) : (
              <h1 className="text-[24px] md:text-[32px] font-bold text-black font-raleway">
                <span className="text-black">Choose your preferred hotel in </span>
                <span className="text-[#00B4D8]">{location}</span>
              </h1>
            )}
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col gap-6 mb-10">
          <FilterControls
            filters={filters}
            onApply={applyFilters}
            filteredCount={filteredHotels.length}
            totalCount={hotels.length}
            allFetchedHotels={allFetchedHotels.length}
            hasFiltersApplied={hasFiltersApplied}
          />
          <SortTabs sortBy={sortBy} setSortBy={setSortBy} />
        </div>

        {/* Main Content */}
        {filterloading ? (
          // Show only the spinner when filter is loading
          <div className="flex flex-col items-center justify-center w-full min-h-[60vh] text-gray-600">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7F50] mb-4"></div>
            <p className="text-lg font-medium">Applying filters, please wait...</p>
          </div>
        ) : (
          <div className="w-full flex flex-col lg:flex-row gap-8 relative z-0">
            {/* Hotel Listings */}
            <div className=" w-full lg:w-[70%] ">
              <div className="flex flex-col gap-3">
                {message ? (
                  <div>{message}</div>
                ) : hasFiltersApplied && sortedHotels.length === 0 ? (
                  <div>No hotels found for selected filters.</div>
                ) : (
                  <>
                    {displayedHotels.map((hotel, index) => {
                      if (Array.isArray(hotel.Rooms) && hotel.Rooms.length > 0) {
                        return (
                          <HotelListing
                            key={hotel.id || hotel.HotelCode || index}
                            hotel={hotel}
                            allHotelCodes={hotels.map((h) => h.HotelCode)}
                            allHotels={hotels}
                            searchData={searchData}
                          />
                        );
                      } else if (hotel.message) {
                        return <div key={index}>{hotel.message}</div>;
                      }
                      return null;
                    })}

                    {/* View More Button for Filtered Hotels */}
                    {hasFiltersApplied && hasMoreHotels && (
                      <div className="flex justify-center mt-4">
                        <button
                          onClick={handleViewMoreFiltered}
                          className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-[#014569a9] transition-colors"
                        >
                          View More
                        </button>
                      </div>
                    )}

                    {/* Load More Button for Unfiltered Hotels (from API) */}
                    {!hasFiltersApplied && currentIndex < allFetchedHotels.length && (
                      <div className="flex justify-center mt-4">
                        {isLoadingMore ? (
                          <div className="flex items-center gap-2 text-gray-600">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7F50]"></div>
                          </div>
                        ) : (
                          <button
                            onClick={handleLoadMore}
                            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-[#014569a9] transition-colors"
                          >
                            View More
                          </button>
                        )}
                      </div>
                    )}

                  </>
                )}
              </div>
            </div>
            {/* Map */}
            <div className="flex-1 w-full lg:w-4/12 ">
              <MapView hotels={sortedHotels} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
