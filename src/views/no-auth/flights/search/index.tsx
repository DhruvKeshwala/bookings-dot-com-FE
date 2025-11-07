"use client";

import { FlightData } from "@/common/types/flight-data.types";
import http from "@/services/http";
import cn from "@/utils/functions/class-name";
import dateTimeformatter from "@/utils/functions/dateTimeFormatter";
import { formatDurationFromMinutes } from "@/utils/functions/formatDurationFromMinutes";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import LoadingTransition from "../../components/LoadingTransition";
import DateSelector from "./components/DateSelector";
import DateSelectorInternational from "./components/DateSelectorInternational";
import FilterControls from "./components/FilterControls";
import FlightListing, { SelectedFlight } from "./components/FlightListing";
import FlightSelectionPopup from "./components/FlightSelectionPopup";
import QuickFilters, { FlightSummary } from "./components/QuickFilters";
import SearchSummary from "./components/SearchSummary";
import {
  bestOverall,
  filterDataByAirlines,
  getFlightTotalDuration,
} from "./functions";

type SortType = "cheapest" | "fastest" | "non_stop" | "best_overall";

const mapCabinClassToCode = (label: string): number => {
  const mapping: Record<string, number> = {
    all: 1,
    economy: 2,
    premiumeconomy: 3,
    business: 4,
    premiumbusiness: 5,
    first: 6,
  };
  return mapping[label.toLowerCase()] ?? 2;
};

const initialTravelers = { adults: 1, children: 0, infants: 0 };

export default function FlightSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDirection, setSelectedDirection] = useState<
    "outbound" | "return"
  >("outbound");
  const [results, setResults] = useState<FlightData>([]);
  const [flightSort, setFlightSort] = useState<SortType>("cheapest");
  const [flightResults, setFlightResults] = useState<any>([]);
  const [traceId, setTraceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFlights, setSelectedFlights] = useState<SelectedFlight[]>([]);
  const [visibleFlights, setVisibleFlights] = useState(15);

  const [selectedFilter, setSelectedFilter] = useState<any>({
    airlines: [],
    stops: [],
    duration: 50,
    inboundLimit: 50,
    maxPrice: 50000000,
    baggages: [],
    depTimeRange: [0, 24],
    arrTimeRange: [0, 24],
    depTimeRangeInternational: [0, 24],
    arrTimeRangeInternational: [0, 24],
  });

  const {
    origin,
    destination,
    date,
    travelClass,
    travellers,
    dateRange,
    pnr,
    bookingId,
  } = useMemo(() => {
    const parseJSON = <T,>(key: string, fallback: T): T => {
      try {
        const val = searchParams.get(key);
        return val ? JSON.parse(val) : fallback;
      } catch {
        return fallback;
      }
    };

    const o = searchParams.get("origin");
    const d = searchParams.get("destination");

    return {
      origin: o,
      destination: d,
      date: searchParams.get("date"),
      travelClass: searchParams.get("travelClass") ?? "0",
      travellers: parseJSON("travellers", initialTravelers),
      dateRange: parseJSON<string[] | null>("dateRange", null),
      pnr: searchParams.get("reissue_pnr"),
      bookingId: searchParams.get("reissue_bookingId"),
    };
  }, [searchParams]);

  function setSelectedDate(date: string) {
    const selectedDate = date.slice(0, 10);
    const params = new URLSearchParams(searchParams.toString());

    // if (dateRange && dateRange[0] && dateRange[1]) {
    //   const newDateRange: string[] = [...dateRange];
    //   if (selectedDirection === "outbound") {
    //     newDateRange[0] = selectedDate;
    //   } else {
    //     newDateRange[1] = selectedDate;
    //   }
    //   params.set("dateRange", JSON.stringify(newDateRange));
    //   params.set("date", selectedDate);
    // } else {
    //   params.set("date", selectedDate);
    // }
    if (dateRange && dateRange[0] && dateRange[1]) {
      // Parse both dates
      const oldStart = new Date(dateRange[0]);
      const oldEnd = new Date(dateRange[1]);

      // Calculate original difference (in days)
      const diffDays = Math.ceil(
        (oldEnd.getTime() - oldStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Create new start date
      const newStart = new Date(selectedDate);

      // Adjust end date by same difference
      const newEnd = new Date(newStart);
      newEnd.setDate(newEnd.getDate() + diffDays);

      // Format both for URL
      const newDateRange = [
        newStart.toISOString().slice(0, 10),
        newEnd.toISOString(),
      ];

      // Update URL params
      params.set("dateRange", JSON.stringify(newDateRange));
      params.set("date", selectedDate);
    } else {
      params.set("date", selectedDate);
    }
    router.push(`?${params.toString()}`);
  }

  const formattedDate = date ? format(new Date(date), "dd MMM yyyy") : "N/A";
  const totalTravellers =
    (travellers.adults ?? 0) +
    (travellers.children ?? 0) +
    (travellers.infants ?? 0);
  const totalPrice = selectedFlights.reduce(
    (sum, flight) => sum + flight.price,
    0
  );
  const isPopupVisible = selectedFlights.length > 0;
  const canFetch = origin && destination && date;

  // Build search payload and fetch flight data
  const getFlightList = async () => {
    setLoading(true);

    const commonSegment = {
      FlightCabinClass: String(mapCabinClassToCode(travelClass)),
    };

    const segments = [];

    if (dateRange && dateRange[0] && dateRange[1]) {
      segments.push({
        ...commonSegment,
        Origin: origin,
        Destination: destination,
        PreferredDepartureTime: String(dateRange?.[0])?.replace(
          /T.*Z$/,
          "T00:00:00"
        ),
        PreferredArrivalTime: String(dateRange?.[0])?.replace(
          /T.*Z$/,
          "T00:00:00"
        ),
      });
      segments.push({
        ...commonSegment,
        Origin: destination,
        Destination: origin,
        PreferredDepartureTime: String(dateRange?.[1])?.replace(
          /T.*Z$/,
          "T00:00:00"
        ),
        PreferredArrivalTime: String(dateRange?.[1])?.replace(
          /T.*Z$/,
          "T00:00:00"
        ),
      });
    } else {
      segments.push({
        ...commonSegment,
        Origin: origin,
        Destination: destination,
        PreferredDepartureTime: String(date)?.replace(/T.*Z$/, "T00:00:00"),
        PreferredArrivalTime: String(date)?.replace(/T.*Z$/, "T00:00:00"),
      });
    }

    try {
      if (pnr !== null && bookingId !== null) {
        const { data } = await http.post("/re-issue-search/flight", {
          AdultCount: String(travellers.adults),
          ChildCount: String(travellers.children),
          InfantCount: String(travellers.infants),
          DirectFlight: "false",
          OneStopFlight: "false",
          JourneyType: String(dateRange ? 2 : 1),
          PreferredAirlines: null,
          SearchType: "1",
          PNR: pnr,
          Bookingid: bookingId,
          Segments: segments,
          Sources: null,
        });
        if (data) {
          setTraceId(data?.TraceId ?? null);
          setFlightResults(data?.data ?? []);
        }
      } else {
        const { data } = await http.post("/search-flight", {
          AdultCount: String(travellers.adults),
          ChildCount: String(travellers.children),
          InfantCount: String(travellers.infants),
          DirectFlight: "false",
          OneStopFlight: "false",
          JourneyType: String(dateRange ? 2 : 1),
          PreferredAirlines: null,
          Segments: segments,
          Sources: null,
        });
        if (data) {
          setTraceId(data?.TraceId ?? null);
          setFlightResults(data?.data ?? []);
        }
      }
    } catch (err) {
      console.error("Flight API error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount/param change
  useEffect(() => {
    if (canFetch) getFlightList();
  }, [origin, destination, date, travelClass, travellers, dateRange]);

  useEffect(() => {
    if (flightResults?.length > 0) {
      if (selectedDirection === "return") {
        setResults(flightResults?.[1] ?? []);
      } else {
        setResults(flightResults?.[0] ?? []);
      }
    }
  }, [selectedDirection, flightResults]);

  // Reset visible flights when filters change
  useEffect(() => {
    setVisibleFlights(15);
  }, [results, selectedFilter, flightSort]);

  useEffect(() => {
  if (!flightResults?.length) return;

  const outboundFlight = flightResults?.[0]?.[0]?.[0];
  const returnFlight = flightResults?.[1]?.[0]?.[0];

  const newSelections: SelectedFlight[] = [];

  if (outboundFlight) {
    const outSeg = outboundFlight?.Segments?.[0]?.[0];
    newSelections.push({
      id: String(outboundFlight?.ResultIndex ?? ""),
      type: "outbound",
      price: Number(outboundFlight?.Fare?.PublishedFare ?? 0),
      DepTime: outSeg?.Origin?.DepTime ?? "",
      ArrTime: outSeg?.Destination?.ArrTime ?? "",
      Duration: String(outSeg?.Duration ?? ""),
      airline: outSeg?.Airline,
    });
  }

  if (returnFlight) {
    const inSeg = returnFlight?.Segments?.[0]?.[0];
    newSelections.push({
      id: String(returnFlight?.ResultIndex ?? ""),
      type: "return",
      price: Number(returnFlight?.Fare?.PublishedFare ?? 0),
      DepTime: inSeg?.Origin?.DepTime ?? "",
      ArrTime: inSeg?.Destination?.ArrTime ?? "",
      Duration: String(inSeg?.Duration ?? ""),
      airline: inSeg?.Airline,
    });
  }

  setSelectedFlights(newSelections);
  console.log("✅ Auto-selected flights:", newSelections);
}, [flightResults]);

  const handleViewMore = () => {
    setVisibleFlights((prev) => prev + 15);
  };
  const noIBexists = !!flightResults?.[1];

  const handleFlightSelect = (flight: SelectedFlight) => {
    if (!traceId || !flight?.id) {
      return;
    }
    if (pnr !== null && bookingId !== null) {
      if (!dateRange || !noIBexists) {
        const query = new URLSearchParams({
          traceid: traceId,
          flightId: flight.id,
          reissue_pnr: pnr,
          reissue_bookingId: bookingId,
        }).toString();

        const url = `/flights/booking?${query}`;
        const newWindow = window.open(url);
        if (!newWindow) {
          router.push(url);
        }
      }
    } else {
      if (!dateRange || !noIBexists) {
        const query = new URLSearchParams({
          traceid: traceId,
          flightId: flight.id,
        }).toString();

        const url = `/flights/booking?${query}`;
        const newWindow = window.open(url);
        if (!newWindow) {
          router.push(url);
        }
      }
    }
    setSelectedFlights((prev) => [
      ...prev.filter((f) => f.type !== flight.type),
      flight,
    ]);
  };

  const onBook = () => {
    if (
      selectedFlights[0] &&
      selectedFlights[1] &&
      selectedFlights[0].id &&
      selectedFlights[1].id &&
      traceId
    ) {
      const query = new URLSearchParams({
        traceid: traceId ?? "", // Fallback to empty string if null
        flightId: selectedFlights[0].id,
        flightId1: selectedFlights[1].id,
      }).toString();

      const url = `/flights/booking?${query}`;
      const newWindow = window.open(url);
      if (!newWindow) {
        router.push(url);
      }
    }else{
      setSelectedDirection("return")
    }
  };

  const handleClosePopup = () => setSelectedFlights([]);

  const flightData = {
    route: {
      from: { city: origin ?? "", code: origin ?? "" },
      to: { city: destination ?? "", code: destination ?? "" },
    },
    dates: formattedDate,
    travelers: `${totalTravellers} Traveller${totalTravellers > 1 ? "s" : ""}`,
    class: travelClass.charAt(0).toUpperCase() + travelClass.slice(1),
    totalResults: results.length,
    filteredResults: results.length,
  };

  const { outboundData, inboundData } = useMemo(() => {
    return selectedFlights.length > 0
      ? {
          outboundData:
            selectedFlights.find((f) => f.type === "outbound") ?? null,
          inboundData: selectedFlights.find((f) => f.type === "return") ?? null,
        }
      : {
          outboundData: null,
          inboundData: null,
        };
  }, [selectedFlights]);

  const filteredData = useMemo(() => {
    return filterDataByAirlines(
      results,
      selectedFilter?.airlines,
      selectedFilter?.stops,
      selectedFilter?.duration,
      selectedFilter?.inboundLimit,
      selectedFilter?.maxPrice,
      selectedFilter?.baggages,
      selectedFilter?.depTimeRange,
      selectedFilter?.arrTimeRange,
      selectedFilter?.depTimeRangeInternational,
      selectedFilter?.arrTimeRangeInternational
    );
  }, [results, selectedFilter]);

  const useSortedFlights = (flightData: any[][], sortType: SortType) => {
    const sortedFlights = useMemo(() => {
      const cloned = [...flightData];
      switch (sortType) {
        case "cheapest":
          return [...cloned]
            .map((group) =>
              [...group].sort(
                (a, b) => a.Fare?.PublishedFare - b.Fare?.PublishedFare
              )
            )
            .sort(
              (a, b) => a[0]?.Fare?.PublishedFare - b[0]?.Fare?.PublishedFare
            );

        case "fastest":
          return cloned.sort((a, b) => {
            const durationA = getFlightTotalDuration(a);
            const durationB = getFlightTotalDuration(b);
            return durationA - durationB;
          });

        case "non_stop": {
          // Assign a "stop count" score for sorting
          const flightsWithStopCount = cloned.map((group) => {
            const segments = group?.[0]?.Segments ?? [];
            // Count how many segments have more than 1 leg (stops)
            const stopCount = segments.reduce(
              (count: any, seg: any) =>
                count + (seg?.length && seg.length > 1 ? 1 : 0),
              0
            );
            return { group, stopCount };
          });

          // Sort first by stopCount (ascending), then fare, then duration
          const sortedFlights = flightsWithStopCount
            .sort((a, b) => {
              // 1️⃣ Prioritize fewer stops
              if (a.stopCount !== b.stopCount) return a.stopCount - b.stopCount;

              // 2️⃣ Then by fare
              const fareA = a.group?.[0]?.Fare?.PublishedFare ?? Infinity;
              const fareB = b.group?.[0]?.Fare?.PublishedFare ?? Infinity;
              if (fareA !== fareB) return fareA - fareB;

              // 3️⃣ Then by total duration
              const durationA = getFlightTotalDuration(a.group);
              const durationB = getFlightTotalDuration(b.group);
              return durationA - durationB;
            })
            .map((item) => item.group);

          return sortedFlights;
        }

        case "best_overall": {
          return bestOverall(cloned);
        }

        default:
          return cloned;
      }
    }, [flightData, sortType]);

    return sortedFlights;
  };

  const useFlightSummary = (flightData: FlightData): FlightSummary => {
    return useMemo(() => {
      if (!flightData || flightData.length === 0) {
        return {
          cheapestDetails: { price: null, duration: null },
          fastestDuration: null,
          fastestPrice: null,
          nonStopCount: 0,
          bestOverallCounts: { price: null, duration: null },
          nonStopDetails: { price: null, duration: null },
        };
      }

      let cheapestGroup: any[] | null = null;
      let minCheapestPrice = Infinity;

      // Fastest
      const fastestGroup = [...flightData].sort((a, b) => {
        const durationA = getFlightTotalDuration(a);
        const durationB = getFlightTotalDuration(b);
        return durationA - durationB;
      })[0];

      const fastestDuration = fastestGroup
        ? getFlightTotalDuration(fastestGroup)
        : null;
      const fastestPrice = fastestGroup?.[0]?.Fare?.PublishedFare ?? null;

      // Best overall
      const bestOverallShort = bestOverall(flightData);
      const bestOverallCounts = {
        duration: getFlightTotalDuration(bestOverallShort?.[0]) ?? null,
        price: bestOverallShort?.[0]?.[0]?.Fare?.PublishedFare ?? null,
      };

      // Cheapest
      for (const group of flightData) {
        const fares = group.map((item) => item.Fare?.PublishedFare ?? Infinity);
        const minFare = Math.min(...fares);
        if (minFare < minCheapestPrice) {
          minCheapestPrice = minFare;
          cheapestGroup = group;
        }
      }

      // const cheapestDetails = {
      //   price: minCheapestPrice === Infinity ? null : minCheapestPrice,
      //   duration: cheapestGroup ? getFlightTotalDuration(cheapestGroup) : null,
      // };

      const cheapestDetails = {
        price: minCheapestPrice === Infinity ? null : minCheapestPrice,
        duration: cheapestGroup ? getFlightTotalDuration(cheapestGroup) : null,
      };

      // Non-stop details — first non-stop flight in sorted list
      // const nonStopFlights = flightData.filter(
      //   (group) => group?.[0]?.Segments?.[0]?.length === 1
      // );

      // const nonStopCount = nonStopFlights.length;

      // const firstNonStop = nonStopFlights.sort((a, b) => {
      //   const fareA = a?.[0]?.Fare?.PublishedFare ?? Infinity;
      //   const fareB = b?.[0]?.Fare?.PublishedFare ?? Infinity;
      //   if (fareA !== fareB) return fareA - fareB;

      //   const durationA = getFlightTotalDuration(a);
      //   const durationB = getFlightTotalDuration(b);
      //   return durationA - durationB;
      // })[0];

      // const nonStopDetails = {
      //   price: firstNonStop?.[0]?.Fare?.PublishedFare ?? null,
      //   duration: getFlightTotalDuration(firstNonStop) ?? null,
      // };
      // Filter non-stop flights: every segment in the first trip has only one leg
      const nonStopFlights = flightData.filter((group) => {
        const segmentsGroups = group?.[0]?.Segments ?? [];
        return segmentsGroups.every((segment: any[]) => segment.length === 1);
      });

      const nonStopCount = nonStopFlights.length;

      // Sort by price first, then by duration
      const firstNonStop = nonStopFlights.sort((a, b) => {
        const fareA = a?.[0]?.Fare?.PublishedFare ?? Infinity;
        const fareB = b?.[0]?.Fare?.PublishedFare ?? Infinity;
        if (fareA !== fareB) return fareA - fareB;

        const durationA = getFlightTotalDuration(a);
        const durationB = getFlightTotalDuration(b);
        return durationA - durationB;
      })[0];

      // Details for the first non-stop flight
      const nonStopDetails = {
        price: firstNonStop?.[0]?.Fare?.PublishedFare ?? null,
        duration: firstNonStop ? getFlightTotalDuration(firstNonStop) : null,
      };

      return {
        cheapestDetails,
        fastestDuration,
        fastestPrice,
        nonStopCount,
        bestOverallCounts,
        nonStopDetails,
      };
    }, [flightData]);
  };
  const sortedFlightData = useSortedFlights(
    filteredData.filter((group): group is any[] => group !== null),
    flightSort
  );
  // const sortedFlightData = useSortedFlights(filteredData, flightSort); // selectedSortType: "cheapest" | "fastest"
  const summary = useFlightSummary(
    filteredData.filter((group): group is any[] => group !== null)
  );
  // console.log(">>summary", summary);
  if (!canFetch || loading) {
    return <LoadingTransition />;
  }

  const isDateRange = Boolean(dateRange && dateRange?.[0] && dateRange?.[1]);
  const pureInternationalreturn = !noIBexists && isDateRange;

  return (
    <div className="min-h-screen bg-white mt-[85px]">
      <div className="py-[40px] bg-primary px-5">
        <SearchSummary
          data={flightData}
          newData={{
            origin,
            destination,
            date,
            travelClass,
            travellers,
            dateRange,
          }}
        />
      </div>

      <div className="px-5 bg-[#FFF7F2]">
        <div className="relative max-w-[1080px] mx-auto py-[24px]">
          {/* Toggle for round trip views */}
          {noIBexists && dateRange ? (
            <div className="flex justify-center mb-6">
              <div className="relative rounded-full border shadow border-gray-300 overflow-hidden w-full transition-all duration-500 bg-white">
                <div
                  className={cn(
                    "absolute top-0 w-1/2 h-full bg-primary rounded-3xl transition-all duration-500 ease-out shadow-lg",
                    selectedDirection === "outbound"
                      ? "translate-x-0"
                      : "translate-x-full"
                  )}
                />
                <div className="relative flex">
                  {["outbound", "return"].map((dir) => {
                    const from = dir === "outbound" ? origin : destination;
                    const to = dir === "outbound" ? destination : origin;

                    return (
                      <button
                        key={dir}
                        onClick={() =>
                          setSelectedDirection(dir as "outbound" | "return")
                        }
                        className={cn(
                          "flex-1 flex items-center justify-center gap-7 py-2 transition-all duration-500 relative cursor-pointer group",
                          selectedDirection === dir
                            ? "text-white"
                            : "text-black hover:text-[#014569]"
                        )}
                      >
                        <span className="subheading">{from}</span>
                        <div
                          className={`max-w-[30px] w-full h-0.5 rounded-full transition-all duration-500 ${
                            selectedDirection === dir ? "bg-white" : "bg-black"
                          }`}
                        />
                        <span className="subheading">{to}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-6 h-[45px] text-white bg-primary rounded-full mb-6">
              <span className="subheading">{origin}</span>
              <div className="max-w-[30px] w-full h-0.5 bg-white" />
              <span className="subheading">{destination}</span>
            </div>
          )}

          {!pureInternationalreturn && (
            <DateSelector
              origin={origin}
              destination={destination}
              date={
                dateRange
                  ? selectedDirection === "outbound"
                    ? dateRange[0]
                    : dateRange[1]
                  : date
              }
              onDateClick={(date) => setSelectedDate(date)}
            />
          )}

          {pureInternationalreturn && (
            <DateSelectorInternational
              origin={origin}
              destination={destination}
              date={
                dateRange
                  ? selectedDirection === "outbound"
                    ? dateRange[0]
                    : dateRange[1]
                  : date
              }
              onDateClick={(date) => setSelectedDate(date)}
            />
          )}
        </div>
      </div>

      <div className="px-5">
        {/* Filters and Flight Results */}
        <div className="max-w-[1080px] mx-auto">
          <FilterControls
            isRoundTrip={Boolean(selectedDirection === "outbound")}
            data={results}
            setSelectedFilter={setSelectedFilter}
            totalResults={flightData.totalResults}
            filteredResults={sortedFlightData.length}
            isPureInternationalReturn={pureInternationalreturn}
          />

          {filteredData.length === 0 ? (
            <div className="text-center border-[1.7px] border-[#bfbcbc] rounded-2xl text-gray-700 heading-1 py-16 mt-10 ">
              No Flights Found
            </div>
          ) : (
            <div>
              <QuickFilters
                setFlightSort={setFlightSort}
                flightSort={flightSort}
                summary={summary}
              />

              <div className="flex max-w-[1280px] mx-auto mb-5">
                {/* Left Column - All flights */}
                <div className="flex-1 space-y-4">
                  {sortedFlightData
                    .slice(0, visibleFlights)
                    .map((flight, index) => (
                      <FlightListing
                        key={index}
                        flight={flight}
                        onFlightSelect={handleFlightSelect}
                        selectedFlights={selectedFlights}
                        selectedDirection={selectedDirection}
                        trace_id={traceId}
                      />
                    ))}
                </div>

                {/* Right Column - Sticky Banner */}
                <div className="hidden xl:block w-[320px]  ml-4 mt-5">
                  <div className="sticky top-5">
                    <Image
                      src="/assets/banners/GIF.svg"
                      alt="Flight Image"
                      width={320}
                      height={150}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {visibleFlights < sortedFlightData.length && (
                <div className="flex justify-center my-16">
                  <button
                    onClick={handleViewMore}
                    className="bg-primary text-[#FFF7F2] px-2  py-2 rounded-lg text-base font-bold font-nunito hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    View More
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Flights Summary Popup */}
        {dateRange && (
          <FlightSelectionPopup
            onBook={() => onBook()}
            outboundFlight={
              outboundData && {
                from: { city: "New York", code: origin },
                to: { city: "Indianapolis", code: destination },
                departure: dateTimeformatter(outboundData.DepTime),
                arrival: dateTimeformatter(outboundData.ArrTime),
                duration: formatDurationFromMinutes(outboundData.Duration),
                stops: "Non Stop",
                date: format(parseISO(dateRange[0]), "dd MMMM, yyyy"),
                airline: outboundData.airline,
              }
            }
            returnFlight={
              inboundData && {
                from: { city: "Indianapolis", code: destination },
                to: { city: "New York", code: origin },
                departure: dateTimeformatter(inboundData.DepTime),
                arrival: dateTimeformatter(inboundData.ArrTime),
                duration: formatDurationFromMinutes(inboundData.Duration),
                stops: "Non Stop",
                date: format(parseISO(dateRange[1]), "dd MMMM, yyyy"),
                airline: inboundData.airline,
              }
            }
            totalPrice={totalPrice}
            isVisible={isPopupVisible}
            onClose={handleClosePopup}
          />
        )}
      </div>
    </div>
  );
}
