"use client";

import { AirlineInfo } from "@/common/types/flight-data.types";
import SmallAirLaneIcon from "@/components/icons/SmallAirplanIcon";
import Image from "next/image";

interface FlightLeg {
  from: { city: string; code: string };
  to: { city: string; code: string };
  departure: string;
  arrival: string;
  duration: string;
  stops: string;
  flightNumber: string;
  date: string;
  airline: AirlineInfo;
}

interface FlightSelectionPopupProps {
  outboundFlight?: FlightLeg | any;
  returnFlight?: FlightLeg | any;
  totalPrice: number;
  isVisible: boolean;
  onClose: () => void;
  onBook: () => void;
}

export default function FlightSelectionPopup({
  outboundFlight,
  returnFlight,
  totalPrice,
  isVisible,
  onClose,
  onBook,
}: Readonly<FlightSelectionPopupProps>) {
  if (!isVisible) return null;

  const to24HourFormat = (time: string): string => {
    const [hourMin, modifier] = time.trim().split(" ");
    const [hours, minutes] = hourMin.split(":");
    let h = parseInt(hours, 10);
    if (modifier.toUpperCase() === "PM" && h !== 12) h += 12;
    if (modifier.toUpperCase() === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${minutes}`;
  };
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 ease-in-out bg-primary h-[85px] px-4 md:px-16">
      <div className="max-w-[1300px] mx-auto flex items-center justify-evenly gap-4 mt-3">
        {/* Outbound Flight */}
        {outboundFlight && (
          <>
            <div className="flex items-center gap-4 w-full">
              <div className="text-center">
                <div className="max-w-[36px] mx-auto max-h-[36px] overflow-hidden bg-white rounded flex items-center justify-center flex-col gap-1">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_URI}/logo/${outboundFlight.airline.AirlineCode}`}
                    alt={`${outboundFlight.airline.AirlineName} logo`}
                    className="w-5 h-w-5"
                    width={100}
                    height={100}
                  />
                  <p className="text-[12px] font-semibold">
                    {outboundFlight.airline.AirlineName}
                  </p>
                </div>
                {/* Flight Numbers */}
                <div className="body-3-small text-white hidden md:block w-[60px]">
                  {`${outboundFlight.airline.FareClass} ${outboundFlight.airline.FlightNumber}`}
                </div>
              </div>

              <div className="flex flex-col gap-2 max-w-[300px] w-full">
                <div className="flex items-center gap-3 justify-between">
                  <span className="text-white btn-cta">
                    {outboundFlight.from.code}
                  </span>
                  <div className="flex flex-col items-center max-w-[180px] min-w-[85px] w-full border-white border-b border-dashed">
                    <SmallAirLaneIcon />
                  </div>
                  <span className="text-white btn-cta">
                    {outboundFlight.to.code}
                  </span>
                </div>
                <span className="text-center text-white body-3-small">
                  {outboundFlight.date}
                </span>
              </div>
            </div>

            {/* Vertical Dividers */}
            <div className="hidden md:block w-[1px] h-[50px] border-white border-r border-dashed" />

            {/* Flight Times */}
            <div className="w-full">
              <div className="flex flex-col gap-2 hidden md:flex max-w-[300px] w-full mx-auto">
                <div className="flex items-center justify-between gap-3 ">
                  <span className="text-white btn-cta">
                    {to24HourFormat(outboundFlight.departure)}
                  </span>
                  <div className="flex flex-col items-center max-w-[180px] min-w-[85px] w-full border-white border-b border-dashed">
                    <SmallAirLaneIcon />
                  </div>
                  <span className="text-white btn-cta">
                    {to24HourFormat(outboundFlight.arrival)}
                  </span>
                </div>
                <span className="text-white body-3-small text-center">
                  {outboundFlight.duration} | {outboundFlight.stops}
                </span>
              </div>
            </div>

            {/* Vertical Divider */}

            <div className="hidden md:block w-[1px] h-[50px] border-white border-r" />
          </>
        )}

        {/* Return Flight */}
        {returnFlight && (
          <>
            <div className="hidden md:flex items-center gap-4 w-full">
              <div className="text-center">
                <div className="max-w-[36px] mx-auto max-h-[36px] overflow-hidden bg-white rounded flex items-center justify-center flex-col gap-1">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_URI}/logo/${returnFlight.airline.AirlineCode}`}
                    alt={`${returnFlight.airline.AirlineName} logo`}
                    className="w-4 h-w-4"
                    width={100}
                    height={100}
                  />
                  <p className="text-[10px] font-semibold text-nowrap">
                    {returnFlight.airline.AirlineName}
                  </p>
                </div>
                {/* Flight Numbers */}
                <div className="body-3-small text-white hidden md:block w-[60px]">
                  {`${returnFlight.airline.FareClass} ${returnFlight.airline.FlightNumber}`}
                </div>
              </div>

              <div className="flex flex-col gap-2 max-w-[300px] w-full">
                <div className="flex items-center gap-3 justify-between">
                  <span className="text-white btn-cta">
                    {returnFlight.from.code}
                  </span>
                  <div className="flex flex-col items-center max-w-[180px] min-w-[85px] w-full border-white border-b border-dashed">
                    <SmallAirLaneIcon />
                  </div>
                  <span className="text-white btn-cta">
                    {returnFlight.to.code}
                  </span>
                </div>
                <span className="text-center text-white body-3-small">
                  {returnFlight.date}
                </span>
              </div>
            </div>
            {/* Vertical Dividers */}
            <div className="hidden md:block w-[1px] h-[50px] border-white border-r border-dashed" />

            {/* Flight Times */}
            <div className="w-full hidden md:flex">
              <div className="flex flex-col gap-2 hidden md:flex max-w-[300px] w-full mx-auto">
                <div className="flex items-center justify-between gap-3 ">
                  <span className="text-white btn-cta">
                    {to24HourFormat(returnFlight.departure)}
                  </span>
                  <div className="flex flex-col items-center max-w-[180px] min-w-[85px] w-full border-white border-b border-dashed">
                    <SmallAirLaneIcon />
                  </div>
                  <span className="text-white btn-cta">
                    {to24HourFormat(returnFlight.arrival)}
                  </span>
                </div>
                <span className="text-white body-3-small text-center">
                  {returnFlight.duration} | {returnFlight.stops}
                </span>
              </div>
            </div>

            {/* Vertical Dividers */}
            <div className="hidden md:block w-[1px] h-[50px] border-white border-r" />
          </>
        )}

        {/* Price and Book Button */}
        <div className="w-full">
          <div className="flex items-center gap-4 max-w-[218px] w-full mx-auto">
            <div className="flex flex-col gap-1 text-white text-nowrap">
              <span className="body-text">Total Price</span>
              <span className="btn-cta">₹{totalPrice.toLocaleString()}</span>
            </div>

            <button
              onClick={onBook}
              className="bg-gradient cursor-pointer text-white px-[25px] py-3 rounded-[10.707px] font-nunito text-[16px] font-medium hover:bg-[#FF5555] transition-colors text-nowrap"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
