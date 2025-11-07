import { formatDurationFromMinutes } from "@/utils/functions/formatDurationFromMinutes";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import { Fragment, useMemo, useState } from "react";

function FlightJourney({ title, segments }: any) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalDuration = segments.reduce(
    (sum: number, seg: any) => sum + (seg?.Duration || 0),
    0
  );

  const stopDetails = useMemo(() => {
    const stops = [];
    for (let i = 1; i < segments.length; i++) {
      const prevArrival = new Date(segments[i - 1]?.Destination?.ArrTime);
      const nextDeparture = new Date(segments[i]?.Origin?.DepTime);
      const layoverDuration = Math.round(
        (+nextDeparture - +prevArrival) / (1000 * 60)
      ); // in minutes
      stops.push({
        code: segments[i]?.Origin?.Airport?.AirportCode,
        layover: layoverDuration,
      });
    }
    return stops;
  }, [segments]);

  const totalStops = segments.length - 1;
  const originCode = segments[0]?.Origin?.Airport?.AirportCode;
  const originTime = segments[0]?.Origin?.DepTime;
  const destinationCode =
    segments[segments.length - 1]?.Destination?.Airport?.AirportCode;
  const destinationTime = segments[segments.length - 1]?.Destination?.ArrTime;

  return (
    <div className="flex gap-6 max-lg:flex-col w-full">
      <div className="flex-1 bg-white border-1 border-black/30 rounded-2xl p-6">
        {/* Title and Date */}
        <div className="flex items-end gap-4 mb-6">
          <h3 className="text-lg font-bold font-nunito text-black">{title}</h3>
          {originTime && (
            <span className="text-base font-medium font-nunito text-black">
              {format(parseISO(originTime), "EEEE dd MMMM")}
            </span>
          )}
        </div>

        {/* Origin > Duration & Stops > Destination Summary */}
        <div className="flex items-center justify-between mb-4 text-black font-nunito">
          {/* Origin */}
          <div className="flex flex-col items-start text-left">
            {segments[0]?.Airline?.AirlineCode && (
              <div className="w-6 h-6 mb-1">
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_URI}/logo/${segments[0].Airline.AirlineCode}`}
                  alt="Airline logo"
                  width={24}
                  height={24}
                />
              </div>
            )}
            <span className="text-2xl font-semibold">
              {originTime ? format(new Date(originTime), "HH:mm") : "--:--"}
            </span>
            <span className="text-base">{originCode}</span>
          </div>

          {/* Flight Line with duration and stops */}
          <div className="flex flex-col items-center gap-1 relative">
            <div className="text-xs relative group cursor-pointer text-center">
              <div>
                {totalStops === 0
                  ? "Non-stop"
                  : `${totalStops} stop${totalStops > 1 ? "s" : ""}`}
              </div>
              {totalStops > 0 && (
                <div className="absolute z-10 hidden group-hover:flex flex-col top-full mt-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-normal px-3 py-2 rounded-lg shadow-lg w-max min-w-[150px]">
                  {stopDetails.map((stop, index) => (
                    <div key={index} className="mb-1 last:mb-0">
                      <span className="font-semibold">{stop.code}</span>:{" "}
                      {formatDurationFromMinutes(stop.layover)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="w-15 h-px bg-black/30" />
              <span className="text-lg">✈️</span>
              <div className="w-15 h-px bg-black/30" />
            </div>

            <div className="text-xs text-center text-sm font-semibold">
              {formatDurationFromMinutes(totalDuration)}
            </div>
          </div>

          {/* Destination */}
          <div className="flex flex-col items-end text-right">
            {segments[segments.length - 1]?.Airline?.AirlineCode && (
              <div className="w-6 h-6 mb-1">
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_URI}/logo/${
                    segments[segments.length - 1].Airline.AirlineCode
                  }`}
                  alt="Airline logo"
                  width={24}
                  height={24}
                />
              </div>
            )}
            <span className="text-2xl font-semibold">
              {destinationTime
                ? format(new Date(destinationTime), "HH:mm")
                : "--:--"}
            </span>
            <span className="text-base">{destinationCode}</span>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-sm text-primary font-semibold underline underline-offset-4 cursor-pointer"
        >
          {isExpanded ? "Hide details" : "View more details"}
        </button>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-6 space-y-10">
            {segments.map((segment: any, index: number) => {
              const airlineCode = segment?.Airline?.AirlineCode;
              const flightNumber = `${segment?.Airline?.AirlineCode} ${segment?.Airline?.FlightNumber}`;

              return (
                <Fragment key={`${index}-expanded-flight-details`}>
                  <div className="flex items-start gap-6 font-nunito">
                    {/* Timeline */}
                    <div className="flex flex-col items-center h-[229px] justify-between">
                      <div className="flex flex-col items-center">
                        <div className="text-dark text-lg font-bold">
                          {segment?.Origin?.DepTime?.slice(11, 16) ?? "N/A"}
                        </div>
                        <div className="text-gray text-sm opacity-80">
                          {segment?.Origin?.DepTime &&
                            format(
                              parseISO(segment?.Origin?.DepTime),
                              "dd MMM"
                            )}
                        </div>
                      </div>

                      <div className="text-gray text-sm opacity-80 text-center">
                        {formatDurationFromMinutes(segment?.Duration)}
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="text-dark text-lg font-bold">
                          {segment?.Destination?.ArrTime?.slice(11, 16) ??
                            "N/A"}
                        </div>
                        <div className="text-gray text-sm opacity-80">
                          {segment?.Destination?.ArrTime &&
                            format(
                              parseISO(segment?.Destination?.ArrTime),
                              "dd MMM"
                            )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-between">
                      <div className="w-3 h-3 rounded-full border-2 border-black/30 bg-white z-10" />
                      <div className="w-0.5 bg-black/30 flex-grow my-1 h-[180px]" />
                      <div className="w-3 h-3 rounded-full border-2 border-black/30 bg-white z-10" />
                    </div>

                    {/* Flight Info */}
                    <div className="flex-1 flex flex-col justify-between h-[229px]">
                      <div className="space-y-1">
                        <div className="text-dark text-lg font-bold">
                          {segment?.Origin?.Airport?.CityName ?? "N/A"}
                        </div>
                        <div className="text-sm text-black/50">
                          {segment?.Origin?.Airport?.AirportName ?? "N/A"}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded shadow-sm flex items-center justify-center">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_URI}/logo/${airlineCode}`}
                              alt={`${segment?.Airline?.AirlineName} logo`}
                              width={90}
                              height={90}
                            />
                          </div>
                          <span className="text-base font-semibold text-primary">
                            {segment?.Airline?.AirlineName}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-black/50">
                          <span>{segment?.Airline?.FareClass}</span>
                          <span>{flightNumber}</span>
                          <span>{segment?.Craft}</span>
                          <span>{segment?.aircraft}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-dark text-lg font-bold">
                          {segment?.Destination?.Airport?.CityName ?? "N/A"}
                        </div>
                        <div className="text-sm text-black/50">
                          {segment?.Destination?.Airport?.AirportName ?? "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {index < segments.length - 1 && stopDetails[index] && (
                    <div className="mt-6 px-4 py-3 bg-black/5 rounded-lg border border-black/10 text-sm font-medium text-black/80">
                      <span className="text-primary font-semibold">
                        Change of plane
                      </span>{" "}
                      – {formatDurationFromMinutes(stopDetails[index].layover)}{" "}
                      layover in{" "}
                      <span className="font-semibold">
                        {stopDetails[index].code}
                      </span>
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FlightDetails({ fareQuote }: any) {
  // Flatten Segments for multi-city
  const allSegments = fareQuote?.Segments?.flat() || [];

  // Group by TripIndicator (fallback to array index if missing)
  const groupedTrips = allSegments.reduce((acc: any, seg: any, idx: number) => {
    const key = seg.TripIndicator || idx + 1;
    if (!acc[key]) acc[key] = [];
    acc[key].push(seg);
    return acc;
  }, {});

  const getTitle = (tripIndex: number) => {
    if (tripIndex === 1) return "Departing flight";
    if (tripIndex === 2) return "Return flight";
    return `Trip ${tripIndex}`;
  };

  return (
    <div className="flex flex-col gap-10 w-full">
      {Object.keys(groupedTrips)
        .sort((a, b) => +a - +b)
        .map((tripIndex) => (
          <FlightJourney
            key={tripIndex}
            title={getTitle(+tripIndex)}
            segments={groupedTrips[tripIndex]}
          />
        ))}
    </div>
  );
}
