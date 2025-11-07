"use client";

import { AirlineInfo, FlightOption } from "@/common/types/flight-data.types";
import http from "@/services/http";
import cn from "@/utils/functions/class-name";
import { formatDurationFromMinutes } from "@/utils/functions/formatDurationFromMinutes";
import { toCurrency } from "@/utils/functions/to-currency";
import { format } from "date-fns";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import FareRuleModal from "./FareRuleModal";
import FlightDetailsContent from "./FlightDetailsContent";

export interface SelectedFlight {
  id: string;
  type: "outbound" | "return";
  price: number;
  DepTime: string;
  ArrTime: string;
  Duration: string;
  airline: AirlineInfo;
}

interface FlightListingProps {
  flight: FlightOption[];
  onFlightSelect?: (flight: SelectedFlight) => void;
  selectedFlights?: SelectedFlight[];
  selectedDirection?: any;
  trace_id: any;
}

export default function FlightListing({
  flight,
  onFlightSelect,
  selectedDirection,
  trace_id,
}: Readonly<FlightListingProps>) {
  const searchParams = useSearchParams();
  const [ticket, setTicket] = useState<any>(null);
  const [error, setError] = useState("");
  const [expandedFare, setExpandedFare] = useState<number | null>(null);
  const [showFlightDetails, setShowFlightDetails] = useState(false);
  const [selectedFare, setSelectedFare] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [ruleDetail, setRuleDetail] = useState<string>("");
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const traceid = trace_id;

  const fetchFareRule = async (fare: any) => {
    try {
      const { data } = await http.post("/fareRule", {
        ResultIndex: fare?.ResultIndex,
        TraceId: traceid,
      });

      const detail =
        data?.Response?.FareRules?.[0]?.FareRuleDetail ||
        "No Fare Rule Details Available";
      setRuleDetail(detail);
      setIsOpen(true);
    } catch (err) {
      console.error("Failed to fetch fare rule:", err);
      setRuleDetail("Error fetching Fare Rule");
      setIsOpen(true);
    }
  };

  const handleArrowClick = (fareIndex: number) => {
    setExpandedFare(expandedFare === fareIndex ? null : fareIndex);
  };

  const handleFareScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const cardWidth = 296; // 280px width + 16px gap
    const scrollLeft = container.scrollLeft;
    const activeIndex = Math.round(scrollLeft / cardWidth);
    setActiveCardIndex(activeIndex);
  };
  const handleFareSelection = (selectedFare: any) => {
    setSelectedFare(selectedFare);
    onFlightSelect?.({
      id: selectedFare?.ResultIndex,
      type: selectedDirection ?? "outbound",
      price: selectedFare?.Fare?.PublishedFare ?? 0,
      DepTime: selectedFare?.Segments?.[0]?.[0]?.Origin?.DepTime,
      ArrTime: selectedFare?.Segments?.[0]?.[0]?.Destination?.ArrTime,
      Duration: selectedFare?.Segments?.[0]?.[0]?.Duration,
      airline: selectedFare?.Segments?.[0]?.[0]?.Airline,
    });
  };

  // Handle escape key and click outside for expanded sections
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowFlightDetails(false);
        setExpandedFare(null);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Check if click is outside the flight listing component
      if (!target.closest("[data-flight-listing]")) {
        setExpandedFare(null);
        setShowFlightDetails(false);
      }
    };

    if (showFlightDetails || expandedFare !== null) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFlightDetails, expandedFare]);

  const remainingSeats = flight?.[0]?.Segments?.[0]?.[0]?.NoOfSeatAvailable;

  const segments = flight?.[0]?.Segments?.[0];
  const lastSegment = segments?.[segments.length - 1];
  const segments2 = flight?.[0]?.Segments?.[1];
  const lastSegment2 = segments2?.[segments2.length - 1];

  const segmentsOut = flight?.[0]?.Segments?.[0];
  const firstOut = segmentsOut?.[0];
  const lastOut = segmentsOut?.[segmentsOut.length - 1];

  // Outbound Duration
  const durationOut = lastOut?.AccumulatedDuration
    ? lastOut.AccumulatedDuration
    : firstOut?.Duration;

  // Inbound
  const segmentsIn = flight?.[0]?.Segments?.[1];
  const firstIn = segmentsIn?.[0];
  const lastIn = segmentsIn?.[segmentsIn?.length - 1];

  // Inbound Duration
  const durationIn = lastIn?.AccumulatedDuration
    ? lastIn.AccumulatedDuration
    : firstIn?.Duration;

  const inboundSegments = flight?.[0]?.Segments?.[1] || [];
  const inboundStops =
    inboundSegments.length === 1
      ? "Non-Stop"
      : `Stops - ${inboundSegments.length - 1}`;

  const pnr = searchParams.get("reissue_pnr");
  const bookingId = searchParams.get("reissue_bookingId");

  useEffect(() => {
    if (!bookingId) return;
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access-token")
        : null;
    http
      .get(
        `/flight/history?bookingid=${bookingId}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      )
      .then((res) => {
        setTicket(res.data.data || res.data);
        setError("");
      })
      .catch((err) =>
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Error fetching ticket details"
        )
      );
  }, [bookingId]);

  const FareButton = (
    <button
      onClick={() => {
        setShowFlightDetails(false);
        handleArrowClick(0);
      }}
      className="bg-gradient px-[30px] py-[5.5px] rounded-[12px] btn-text text-white text-nowrap cursor-pointer"
    >
      View Fare
    </button>
  );

  return (
    <div className="w-full mt-[22px]" data-flight-listing>
      {/* flight card */}
      <div
        className="border-[1.7px] border-[#CBCACA] rounded-[18px] overflow-hidden transition-all duration-900 min-h-[122px] flex items-center"
        style={{
          boxShadow: isHovered
            ? "0px 2px 10px 0px rgba(1, 69, 105, 0.3)"
            : "0px 2px 4px 0px rgba(1, 69, 105, 0.23)",
          transition: "box-shadow 0.2s ease",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="w-full flex items-center justify-between px-5 gap-[16px]">
          {/* flight card left side  */}
          <div className="py-5">
            <div>
              <div
                className={`flex items-center gap-[8px] ${segments2 && "mb-5"}`}
              >
                {/* Domestic flight make and detail button  */}
                <div
                  className={`items-center gap-5 min-w-[90px] ${
                    segments2 && "flex"
                  }`}
                >
                  <div className="flex items-center gap-1 mb-[-3px]">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BASE_URI}/logo/${flight?.[0]?.AirlineCode}`}
                      alt={`${segments?.[0]?.Airline?.AirlineName} logo`}
                      width={18}
                      height={18}
                    />
                    <span
                      className={`text-primary body-2-semibold ${
                        segments && "whitespace-nowrap truncate max-w-20"
                      }  `}
                    >
                      {segments?.[0]?.Airline?.AirlineName || "Unknown Airline"}
                    </span>
                  </div>
                  {segments && !segments2 && (
                    <button
                      onClick={() => {
                        setExpandedFare(null);
                        setShowFlightDetails((pre) => !pre);
                      }}
                      className="body-3-small text-[#ff914d] pb-[2px] border-b cursor-pointer hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
                    >
                      Flight Details
                    </button>
                  )}
                </div>
                {/* Domestic flight time and stops  */}
                <div className="flex justify-center items-center w-full  self-stretch gap-[24px]">
                  <div className="flex flex-col justify-center items-center">
                    <div className="text-black body-2-semibold">
                      {segments?.[0]?.Origin?.DepTime
                        ? format(
                            new Date(segments?.[0]?.Origin?.DepTime),
                            "HH:mm"
                          )
                        : "No Time"}
                    </div>
                    <div className="text-black text-center text-nowrap font-nunito text-[12px] font-normal opacity-70">
                      {`${segments?.[0]?.Origin?.Airport.AirportCode} T${segments?.[0]?.Origin?.Airport.Terminal}` ||
                        "Unknown Airport"}
                    </div>
                  </div>

                  {/* Duration & Line */}
                  <div className="col-span-8 flex flex-col justify-center items-center gap-1">
                    <div className="text-black body-3-small opacity-60">
                      {flight?.[0]?.Segments[0]?.length === 1
                        ? "Non-Stop"
                        : `Stops - ${flight?.[0]?.Segments[0]?.length - 1}`}
                    </div>
                    <div className="w-[200px] h-[1px] bg-black/20" />
                    <div className="text-black body-3-small opacity-60">
                      {formatDurationFromMinutes(durationOut)}
                    </div>
                  </div>

                  {/* Arrival Time and Name */}
                  <div className=" flex flex-col justify-center items-center">
                    <div className="text-black body-2-semibold">
                      {lastSegment?.Destination?.ArrTime
                        ? format(
                            new Date(lastSegment?.Destination?.ArrTime),
                            "HH:mm"
                          )
                        : "No Time"}
                    </div>
                    <div className="text-black text-center text-nowrap font-nunito text-[12px] font-normal opacity-70">
                      {`${
                        lastSegment?.Destination?.Airport.AirportCode ??
                        "Unknown Airport"
                      } T${lastSegment?.Destination?.Airport.Terminal}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* international flight */}
              {segments2 && (
                <div className="flex gap-2 items-center mt-[16px]">
                  {/* international flight name and button */}
                  <div className="flex items-center gap-1 min-w-[90px]">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BASE_URI}/logo/${segments2?.[0]?.Airline?.AirlineCode}`}
                      alt={`${segments2?.[0]?.Airline?.AirlineName} logo`}
                      width={18}
                      height={18}
                      className="w-[18px] h-[18px] object-contain flex-shrink-0"
                    />
                    <span className="text-primary body-2-semibold whitespace-nowrap truncate max-w-20">
                      {segments2?.[0]?.Airline?.AirlineName ||
                        "Unknown Airline"}
                    </span>
                  </div>
                  {/* international flight time and stops */}
                  <div className="flex justify-center items-center w-full  self-stretch gap-[24px]">
                    <div className="flex flex-col justify-center items-center">
                      <div className="text-black body-2-semibold">
                        {segments2?.[0]?.Origin?.DepTime
                          ? format(
                              new Date(segments2?.[0]?.Origin?.DepTime),
                              "HH:mm"
                            )
                          : "No Time"}
                      </div>
                      <div className="text-black text-center text-nowrap font-nunito text-[12px] font-normal opacity-70">
                        {`${segments2?.[0]?.Origin?.Airport.AirportCode} T${segments2?.[0]?.Origin?.Airport.Terminal}` ||
                          "Unknown Airport"}
                      </div>
                    </div>

                    {/* Duration & Line */}
                    <div className="col-span-8 flex flex-col justify-center items-center gap-1">
                      <div className="text-black body-3-small opacity-60">
                        {inboundStops}
                      </div>
                      <div className="w-[200px] h-[1px] bg-black/20 duration-300"></div>
                      <div className="text-black body-3-small opacity-60">
                        {formatDurationFromMinutes(durationIn)}
                      </div>
                    </div>

                    {/* Arrival Time and Name */}
                    <div className=" flex flex-col justify-center items-center">
                      <div className="text-black body-2-semibold">
                        {lastSegment2?.Destination?.ArrTime
                          ? format(
                              new Date(lastSegment2?.Destination?.ArrTime),
                              "HH:mm"
                            )
                          : "No Time"}
                      </div>
                      <div className="text-black text-center text-nowrap font-nunito text-[12px] font-normal opacity-70">
                        {`${
                          lastSegment2?.Destination?.Airport.AirportCode ??
                          "Unknown Airport"
                        } T${lastSegment2?.Destination?.Airport.Terminal}`}
                      </div>
                    </div>
                  </div>
                  {/* Departure */}
                </div>
              )}
            </div>
            {/* international flight detail button*/}
            {segments2 && (
              <button
                onClick={() => {
                  setExpandedFare(null);
                  setShowFlightDetails((pre) => !pre);
                }}
                className="body-3-small text-[#ff914d] pb-[2px] border-b cursor-pointer hover:opacity-100 transition-opacity duration-300 whitespace-nowrap mt-"
              >
                Flight Details
              </button>
            )}
          </div>

          <div className="min-h-[122px] pl-[1px] bg-black/30" />

          {/* flight card right side  */}
          <div className="w-full max-w-[300px]">
            {pnr && bookingId ? (
              <div className="text-end">
                <div className="text-nowrap btn-text">
                  {toCurrency(flight[0]?.Fare?.PublishedFare)}
                </div>

                {ticket?.invoice?.[0]?.InvoiceAmount -
                  flight[0]?.Fare?.PublishedFare >=
                0 ? (
                  <p className="body-3-small text-[#FF0000] mb-2">
                    Fare Difference{" "}
                    {toCurrency(
                      flight[0]?.Fare?.PublishedFare -
                        ticket?.invoice?.[0]?.InvoiceAmount
                    )}
                  </p>
                ) : (
                  <p className="body-3-small text-[#FF0000] mb-2">
                    Fare Difference{" "}
                    {toCurrency(
                      flight[0]?.Fare?.PublishedFare -
                        ticket?.invoice?.[0]?.InvoiceAmount
                    )}
                  </p>
                )}
                {FareButton}
              </div>
            ) : (
              <div className="flex items-center w-full lg:w-auto gap-3 justify-between">
                <div className="text-center">
                  <div className="text-nowrap btn-text mb-1">
                    {toCurrency(flight[0]?.Fare?.PublishedFare)}
                  </div>
                  <p className="text-[#218701] body-3-small text-nowrap">
                    Only {remainingSeats} seat left!
                  </p>
                </div>
                {FareButton}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compact Fare Breakdown */}
      {expandedFare !== null && (
        <div
          className="rounded-xl shadow-lg p-6 mt-5 w-auto border-[1.7px] border-[#bfbcbc]"
          style={{
            animation: "slideInFromTop 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0px 2px 8px 0px rgba(1, 69, 105, 0.29)",
          }}
        >
          <div
            className="flex gap-4 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onScroll={handleFareScroll}
          >
            {flight?.map((fare: any, index: any) => (
              <div
                className="w-full max-w-[275px] rounded-2xl group flex flex-col overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl border-[1.5px] border-[#CBCACA] flex-shrink-0"
                key={`${index}-flt-list`}
              >
                <div className="bg-primary py-[13px] min-h-[75px] text-center text-white">
                  <div className="btn-cta">
                    {toCurrency(fare?.Fare?.PublishedFare)}
                  </div>
                  <div className="body-2-semibold">
                    {fare?.Segments?.[0]?.[0]?.SupplierFareClass}
                  </div>
                </div>

                <div className="px-4 py-3 flex flex-col gap-3 flex-1">
                  <div className="space-y-2 ">
                    <div className="body-text border-b-[1.5px] border-[#bfbcbc] pb-1.5">
                      Included per passenger
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Image
                          src="/icons/small_personal_item.svg"
                          width={24}
                          height={24}
                          alt="small_personal_item"
                        />
                        <p className="flex-1 body-3-small">
                          {"1 Small Personal Item"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {fare?.Segments?.[0]?.[0]?.CabinBaggage ? (
                          <Image
                            src="/icons/Carryonbaggage_availabe.svg"
                            width={24}
                            height={24}
                            alt="Carry-on baggage available"
                          />
                        ) : (
                          <Image
                            src="/icons/Carryonbaggage_not_availabe.svg"
                            width={24}
                            height={24}
                            alt="Carry-on baggage not available"
                          />
                        )}
                        <p className="flex-1 body-3-small">
                          {fare?.Segments?.[0]?.[0]?.CabinBaggage
                            ? `1 Carry-on Bag (${fare?.Segments?.[0]?.[0]?.CabinBaggage})*`
                            : "Add Carry-on Bag for a fee"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {fare?.Segments?.[0]?.[0]?.Baggage ? (
                          <Image
                            src="/icons/Checkedin_baggage_available.svg"
                            width={24}
                            height={24}
                            alt="Checked-in baggage available"
                          />
                        ) : (
                          <Image
                            src="/icons/Checkedin_baggage_not_available.svg"
                            width={24}
                            height={24}
                            alt="Checked-in baggage not available"
                          />
                        )}

                        <div className="flex-1 font-nunito text-xs text-gray leading-relaxed">
                          {fare?.Segments?.[0]?.[0]?.Baggage
                            ? (() => {
                                const baggageStr =
                                  fare.Segments[0][0].Baggage.trim(); // e.g. "30KG (2 Piece)" or "20KG"

                                // Match case with weight + pieces
                                const matchWithPieces = baggageStr.match(
                                  /(\d+KG).*?\((\d+)\s*Piece\)/i
                                );

                                if (matchWithPieces) {
                                  const [, weight, pieces] = matchWithPieces;
                                  return `${pieces} Checked Bag${
                                    Number(pieces) > 1 ? "s" : ""
                                  } (${weight})*`;
                                }

                                // Match case with only weight (no pieces mentioned)
                                const matchWeightOnly =
                                  baggageStr.match(/(\d+KG)/i);
                                if (matchWeightOnly) {
                                  const [weight] = matchWeightOnly;
                                  return `1 Checked Bag (${weight})*`;
                                }

                                // Fallback: show original
                                return `Checked Bag (${baggageStr})*`;
                              })()
                            : "Add checked baggage for a fee"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Icon handling */}
                        {fare?.FareInclusions &&
                        fare.FareInclusions.length > 0 ? (
                          fare.FareInclusions.some((inc: string) =>
                            inc.toLowerCase().includes("seat - free")
                          ) ? (
                            <Image
                              src="/icons/free_seat.svg"
                              width={24}
                              height={24}
                              alt="Free Seats"
                            />
                          ) : (
                            <Image
                              src="/icons/seatnotfree.svg"
                              width={24}
                              height={24}
                              alt="No Free Seats"
                            />
                          )
                        ) : (
                          <Image
                            src="/icons/seatnotfree.svg"
                            width={24}
                            height={24}
                            alt="No Seat Info"
                          />
                        )}

                        {/* Text handling */}
                        <p className="flex-1 body-3-small">
                          {fare?.FareInclusions &&
                          fare.FareInclusions.length > 0
                            ? fare.FareInclusions.some((inc: string) =>
                                inc.toLowerCase().includes("seat - free")
                              )
                              ? "Free Seat Selection"
                              : fare.FareInclusions.some((inc: string) =>
                                  inc
                                    .toLowerCase()
                                    .includes("seat - chargeable")
                                )
                              ? "Select seat for a fee"
                              : // fallback → show whatever seat string is present in API
                                fare.FareInclusions.find((inc: string) =>
                                  inc.toLowerCase().includes("seat")
                                ) || "Select seat for a fee"
                            : "Select seat for a fee"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2  pb-2 border-b border-[#bfbcbc]">
                        {fare?.IsFreeMealAvailable ? (
                          <Image
                            src="/icons/Free_Meal_Icon.svg"
                            width={24}
                            height={24}
                            alt="Free Meal"
                          />
                        ) : (
                          <Image
                            src="/icons/paid_meal.svg"
                            width={24}
                            height={24}
                            alt="Add Meal for a fee"
                          />
                        )}

                        <p className="flex-1 body-3-small">
                          {fare?.IsFreeMealAvailable
                            ? "Free Meal"
                            : "Add Meal for a fee"}
                        </p>
                      </div>

                      {/* Changes (Reissue) */}
                      <div
                        className="flex items-start gap-3 cursor-pointer"
                        onClick={() => fetchFareRule(fare)}
                      >
                        {(() => {
                          const reissueRules =
                            fare?.MiniFareRules?.[0]?.filter(
                              (rule: any) => rule.Type === "Reissue"
                            ) || [];

                          if (!reissueRules.length) {
                            return (
                              <>
                                <Image
                                  src="/icons/changes_not_allow.svg"
                                  width={20}
                                  height={20}
                                  alt="changes_not_allowed"
                                />
                                <span className="body-3-small">
                                  Changes not allowed
                                </span>
                              </>
                            );
                          }

                          // Extract numeric values, ignore %
                          const numericRules = reissueRules
                            .map((r: any) => {
                              const details = r.Details?.trim() || "";
                              const match = details.match(/(\d+)/);
                              const isPercentage = details.endsWith("%");
                              return !isPercentage && match
                                ? parseInt(match[1], 10)
                                : null;
                            })
                            .filter((v: number | null) => v !== null);

                          // Prefer highest numeric if available
                          if (numericRules.length) {
                            const highest = Math.min(...numericRules);
                            return (
                              <>
                                <Image
                                  src="/icons/changes_allow.svg"
                                  width={20}
                                  height={20}
                                  alt="changes"
                                />
                                <span className="body-3-small">
                                  Changes allowed for INR {highest}
                                </span>
                              </>
                            );
                          }

                          // Otherwise check NIL / NILL
                          const nilRule = reissueRules.find((r: any) =>
                            /(nil|nill|Nil|NIL|NILL|Nill|NiLL)/i.test(
                              r.Details || ""
                            )
                          );
                          if (nilRule) {
                            return (
                              <>
                                <Image
                                  src="/icons/changes_allow.svg"
                                  width={20}
                                  height={20}
                                  alt="changes"
                                />
                                <span className="body-3-small">
                                  changes allowed staring from 0
                                </span>
                              </>
                            );
                          }

                          // Fallback = not allowed
                          return (
                            <>
                              <Image
                                src="/icons/changes_not_allow.svg"
                                width={20}
                                height={20}
                                alt="changes_not_allowed"
                              />
                              <span className="body-3-small">
                                Changes not allowed
                              </span>
                            </>
                          );
                        })()}
                      </div>

                      {/* Refund / Cancellation */}
                      <div
                        className="flex items-start gap-3 cursor-pointer"
                        onClick={() => fetchFareRule(fare)}
                      >
                        {(() => {
                          const cancelRules =
                            fare?.MiniFareRules?.[0]?.filter(
                              (rule: any) => rule.Type === "Cancellation"
                            ) || [];

                          if (!cancelRules.length) {
                            return (
                              <>
                                <Image
                                  src="/icons/non_refundable.svg"
                                  width={20}
                                  height={20}
                                  alt="non_refundable"
                                />
                                <span className="body-3-small">
                                  Non-refundable
                                </span>
                              </>
                            );
                          }

                          const numericRules = cancelRules
                            .map((r: any) => {
                              const details = r.Details?.trim() || "";
                              const match = details.match(/(\d+)/);
                              const isPercentage = details.endsWith("%");
                              return !isPercentage && match
                                ? parseInt(match[1], 10)
                                : null;
                            })
                            .filter((v: number | null) => v !== null);

                          if (numericRules.length) {
                            const highest = Math.min(...numericRules);
                            return (
                              <>
                                <Image
                                  src="/icons/refundable.svg"
                                  width={20}
                                  height={20}
                                  alt="cancellation"
                                />
                                <span className="body-3-small">
                                  Refundable for INR {highest}
                                </span>
                              </>
                            );
                          }

                          const nilRule = cancelRules.find((r: any) =>
                            /(nil|nill|Nil|NIL|NILL|Nill|NiLL)/i.test(
                              r.Details || ""
                            )
                          );
                          if (nilRule) {
                            return (
                              <>
                                <Image
                                  src="/icons/refundable.svg"
                                  width={20}
                                  height={20}
                                  alt="cancellation"
                                />
                                <span className="body-3-small">
                                  Refundable for INR 0
                                </span>
                              </>
                            );
                          }

                          return (
                            <>
                              <Image
                                src="/icons/non_refundable.svg"
                                width={20}
                                height={20}
                                alt="non_refundable"
                              />
                              <span className="body-3-small">
                                Non-refundable
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleFareSelection(fare)} 
                    className={cn(
                      "cursor-pointer py-1 rounded-xl transition-all duration-300 transform self-center max-w-[144px] w-full btn-cta ",
                      selectedFare === 0
                        ? "bg-gradient-to-r from-[#FF914D] to-[#F25C54] text-white shadow-lg border"
                        : "text-coral shadow-md border-2  border-[#FF6B6B] text-[#FF6B6B] hover:text-white hover:bg-gradient-to-r hover:from-[#FF914D] hover:to-[#F25C54] hover:shadow-lg hover:border-transparent"
                    )}
                  >
                    {selectedFare === 0 ? "Selected" : "Select"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination dots */}
          {flight && flight.length > 3 && (
            <div className="flex justify-center mt-4 gap-2">
              {flight.map((_, idx) => (
                <span
                  key={idx}
                  className={
                    activeCardIndex === idx
                      ? "inline-block w-7 h-2.5 rounded-full bg-gradient-to-r from-[#FF7A3D] to-[#FFB199] transition-all duration-200"
                      : "inline-block w-2.5 h-2.5 rounded-full bg-[#DADADA] transition-all duration-200"
                  }
                ></span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Expanded Flight Details */}
      {showFlightDetails && (
        <div
          className="mt-3 bg-white rounded-2xl border-[1.7px] border-[#CBCACA] overflow-hidden transition-smooth"
          style={{
            boxShadow: "0px 2px 4px 0px rgba(1, 69, 105, 0.23)",
            animation: "slideInFromTop 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <FlightDetailsContent
            flight={flight}
            onFareSelect={() => {
              setShowFlightDetails(false);
            }}
          />
        </div>
      )}

      <FareRuleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={ruleDetail}
      />
    </div>
  );
}
