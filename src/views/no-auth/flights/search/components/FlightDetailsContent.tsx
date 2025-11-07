"use client";

import { FlightOption, Segment } from "@/common/types/flight-data.types";
import Button from "@/components/ui/NewButton";
import { formatDurationFromMinutes } from "@/utils/functions/formatDurationFromMinutes";
import { getMinutesDifference } from "@/utils/functions/getMinutesDifference";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import { Fragment } from "react";

interface FlightDetailsContentProps {
  flight: FlightOption[];
  onFareSelect: () => void;
}

export default function FlightDetailsContent({
  flight,
  onFareSelect,
}: Readonly<FlightDetailsContentProps>) {
  const renderFlightSegment = (
    segment: Segment,
    index: number,
    segmentGroup: number = 0
  ) => {
    return (
      <Fragment key={`${segmentGroup}-${index}-expanded-flight-details`}>
        <div className="flex items-center">
          {/* Timeline - Fixed width column */}
          <div className="flex flex-col items-center justify-between w-20 min-h-[180px] h-full text-center">
            <div>
              <h6 className="btn-text">
                {segment?.Origin?.DepTime?.slice(11, 16) ?? "N/A"}
              </h6>
              <p className="body-text opacity-60">
                {segment?.Origin?.DepTime &&
                  format(parseISO(segment?.Origin?.DepTime), "dd MMM")}
              </p>
            </div>

            <p className="body-text opacity-60">
              {formatDurationFromMinutes(segment?.Duration)}
            </p>

            <div className="flex flex-col items-center">
              <h6 className="btn-text">
                {segment?.Destination?.ArrTime?.slice(11, 16) ?? "N/A"}
              </h6>
              <p className="body-text opacity-60">
                {segment?.Destination?.ArrTime &&
                  format(parseISO(segment?.Destination?.ArrTime), "dd MMM")}
              </p>
            </div>
          </div>

          {/* Vertical Line - Fixed width column */}
          <div className="flex flex-col items-center w-8 flex-shrink-0 mx-4">
            {/* Top Dot */}
            <div className="w-3 h-3 rounded-full border-[2px] border-black bg-white z-10 mb-2" />

            {/* Line */}
            <div className="w-[1px] bg-primary h-[150px] flex-shrink-0" />

            {/* Bottom Dot */}
            <div className="w-3 h-3 rounded-full border-[2px] border-black bg-white z-10 mt-2" />
          </div>

          {/* Flight Information */}
          <div className="flex flex-col justify-between min-h-[180px]">
            {/* Departure */}
            <div>
              <div className="btn-cta">
                {segment?.Origin?.Airport?.CityName ?? "N/A"}
              </div>
              <div className="body-text opacity-60">
                {segment?.Origin?.Airport?.AirportName ?? "N/A"}
              </div>
            </div>

            {/* Flight Details */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_URI}/logo/${flight?.[0]?.AirlineCode}`}
                    alt={`${segment?.Airline?.AirlineName} logo`}
                    width={20}
                    height={18}
                  />
                </div>
                <div className="text-primary btn-text">
                  {segment?.Airline?.AirlineName}
                </div>
              </div>
              <div className="flex items-center gap-2 body-text opacity-60">
                <span>{segment?.Airline?.FareClass}</span>
                <span>•</span>
                <span>{segment?.Airline?.FlightNumber}</span>
                <span>•</span>
                <span>{segment?.Craft}</span>
              </div>
            </div>

            {/* Arrival */}
            <div>
              <div className="btn-cta">
                {segment?.Destination?.Airport?.CityName}
              </div>
              <div className="body-text opacity-60">
                {segment?.Destination?.Airport?.AirportName}
              </div>
            </div>
          </div>
        </div>

        {flight?.[0].Segments[segmentGroup][index + 1] &&
          renderLayover(
            getMinutesDifference(
              segment?.Destination?.ArrTime ?? "",
              flight?.[0].Segments[segmentGroup][index + 1]?.Origin?.DepTime ??
                ""
            ),
            segment?.Destination?.Airport?.CityName ?? "N/A"
          )}
      </Fragment>
    );
  };

  const renderLayover = (layoverDuration: any, layoverCityName: any) => (
    <div className="flex items-center py-5">
      {/* Timeline alignment - matches flight segment structure */}
      <div className="w-11 flex-shrink-0"></div>
      <Image
        src="/icons/Change.svg"
        alt="Change of plane"
        width={36}
        height={36}
        className=""
      />
      {/* Vertical dashed line - aligned with main timeline */}
      <div className="flex flex-col items-center w-8 flex-shrink-0 mx-4 h-[64px] ml-10">
        <div className="w-[2px] h-full border-l-2 border-dashed border-primary"></div>
      </div>

      {/* Layover Information */}
      <div className="flex-1">
        <h5 className="bg-gradient-to-t from-[#F25C54] to-[#FF914D] bg-clip-text text-transparent btn-text">
          Change of plane
        </h5>
        <p className="body-2-semibold">
          <span className="mr-1">{layoverDuration}</span>{" "}
          <span>Layover in {layoverCityName}</span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="px-6 py-8">
      {/* Detailed Flight Information  */}

      <div className="mb-[16px]">
        {/* List Segment */}
        {flight?.[0].Segments[0]?.map((item, index) =>
          renderFlightSegment(item, index, 0)
        )}
        {flight?.[0].Segments?.[1] &&
          flight?.[0].Segments?.[1]?.map((item, index) =>
            renderFlightSegment(item, index, 1)
          )}
      </div>

      {/* close Button */}
      <div className="flex justify-end">
        <button
          onClick={onFareSelect}
          className="bg-gradient min-w-[135px] px-[30px] py-[5.5px] rounded-[12px] btn-text text-white text-nowrap cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}
