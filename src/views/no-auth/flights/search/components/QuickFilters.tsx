import { formatDurationFromMinutes } from "@/utils/functions/formatDurationFromMinutes";
import { toCurrency } from "@/utils/functions/to-currency";

export type FlightSummary = {
  cheapestDetails: {
    price: number | null;
    duration: number | null;
  };
  fastestDuration: number | null;
  fastestPrice: number | null;
  nonStopCount: number;
  bestOverallCounts: {
    price: number | null;
    duration: number | null;
  };
  nonStopDetails: {
    price: number | null;
    duration: number | null;
  };
};

export default function QuickFilters({
  setFlightSort,
  flightSort,
  summary,
}: Readonly<{
  setFlightSort: any;
  flightSort: any;
  summary: FlightSummary;
}>) {
  const filters = [
    {
      name: "Cheapest",
      price: summary.cheapestDetails.price
        ? toCurrency(summary.cheapestDetails.price)
        : "",
      duration: summary.cheapestDetails.duration
        ? formatDurationFromMinutes(summary.cheapestDetails.duration)
        : "",
      type: "cheapest",
    },
    {
      name: "Fastest",
      price: summary.fastestPrice ? toCurrency(summary.fastestPrice) : "",
      duration: summary.fastestDuration
        ? formatDurationFromMinutes(summary.fastestDuration)
        : "",
      type: "fastest",
    },
    {
      name: "Non - Stop",
      price: summary.nonStopDetails.price
        ? toCurrency(summary.nonStopDetails.price)
        : "",
      duration: summary.nonStopDetails.duration
        ? formatDurationFromMinutes(summary.nonStopDetails.duration)
        : "",
      type: "non_stop",
    },
    {
      name: "Best Overall",
      price: summary.bestOverallCounts.price
        ? toCurrency(summary.bestOverallCounts.price)
        : "",
      duration: summary.bestOverallCounts.duration
        ? formatDurationFromMinutes(summary.bestOverallCounts.duration)
        : "",
      type: "best_overall",
    },
  ];

  return (
    <div className="w-full rounded-[24px] border border-[#BFBCBC] bg-white shadow-sm overflow-hidden">
      <div className="flex max-lg:flex-col">
        {filters.map((filter, index) => {
          const isActive = flightSort === filter.type;
          return (
            <div
              key={index}
              onClick={() => setFlightSort(filter.type)}
              className={`flex-1 relative cursor-pointer ${
                isActive ? "bg-primary text-white" : "bg-white text-black"
              } ${
                index < filters.length - 1 ? "border-r border-[#BFBCBC]" : ""
              }`}
            >
              <div className="flex flex-col items-center px-4 pt-1 pb-2">
                <div
                  className={`body-2-semibold ${
                    isActive ? "text-white" : "text-black"
                  }`}
                >
                  {filter.name}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`btn-text ${
                      isActive ? "text-white" : "text-black opacity-60"
                    }`}
                  >
                    {filter.price}
                  </span>
                  {filter.duration && filter.price && (
                    <span
                      className={`${
                        isActive ? "text-white" : "text-black opacity-60"
                      }`}
                    >
                      ●
                    </span>
                  )}
                  <span
                    className={`btn-text ${
                      isActive ? "text-white" : "text-black opacity-60"
                    }`}
                  >
                    {filter.duration}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
