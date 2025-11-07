"use client";

import Loader from "@/components/ui/loader";
import http from "@/services/http";
import cn from "@/utils/functions/class-name";
import { toCurrency } from "@/utils/functions/to-currency";
import { useEffect, useRef, useState } from "react";

type DateSelectorProps = {
  origin: string | null;
  destination: string | null;
  date: string | null;
  onDateClick: (date: string) => void;
};

type FareDate = {
  day: string;
  price: string;
  isSelected: boolean;
  rawDate: string;
  airlineName: string;
  airlineCode: string;
};

export default function DateSelector({
  origin,
  destination,
  date,
  onDateClick,
}: Readonly<DateSelectorProps>) {
  const [dates, setDates] = useState<FareDate[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchCalendarFare = async () => {
    if (!origin || !destination || !date) return;

    setLoading(true);
    try {
      const baseDate = new Date(date);
      const today = new Date();
      const endDate = new Date(baseDate);
      endDate.setMonth(endDate.getMonth() + 1);

      const requests: Promise<any>[] = [];

      const current = new Date(today.getFullYear(), today.getMonth(), 1);
      while (
        current.getFullYear() < endDate.getFullYear() ||
        (current.getFullYear() === endDate.getFullYear() &&
          current.getMonth() <= endDate.getMonth())
      ) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, "0");

        let PreferredDepartureTime = `${year}-${month}-01T00:00:00`;

        if (
          year === today.getFullYear() &&
          current.getMonth() === today.getMonth()
        ) {
          const day = String(today.getDate()).padStart(2, "0");
          PreferredDepartureTime = `${year}-${month}-${day}T00:00:00`;
        }

        const PreferredArrivalTime = `${year}-${month}-28T00:00:00`;

        requests.push(
          http.post("/calendar-fare", {
            JourneyType: "1",
            PreferredAirlines: null,
            Segments: [
              {
                Origin: origin,
                Destination: destination,
                FlightCabinClass: "1",
                PreferredDepartureTime,
                PreferredArrivalTime,
              },
            ],
            Sources: null,
          })
        );

        current.setMonth(current.getMonth() + 1);
      }

      const responses = await Promise.all(requests);

      const selectedDateStr = new Date(date).toDateString();

      const allFareResults = responses.flatMap(({ data }) => {
        return (data?.Response?.SearchResults ?? []).map((item: any) => {
          const departureDate = new Date(item.DepartureDate);
          const isSelected = selectedDateStr === departureDate.toDateString();

          return {
            day: departureDate.toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            }),
            price: toCurrency(Math.floor(Number(item.Fare))),
            isSelected,
            rawDate: item.DepartureDate,
            airlineName: item.AirlineName,
            airlineCode: item.AirlineCode,
          };
        });
      });

      setDates(
        allFareResults.toSorted(
          (a, b) =>
            new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime()
        )
      );
    } catch (error) {
      console.error("Failed to fetch calendar fare:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (origin && destination && date) {
      fetchCalendarFare();
    }
  }, [origin, destination, date]);

  const dateRefs = useRef<HTMLDivElement[]>([]);

  const scrollBy = (distance: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: distance,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const selectedIndex = dates.findIndex((d) => d.isSelected);
    if (selectedIndex !== -1) {
      dateRefs.current[selectedIndex]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [dates]);

  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <div className="relative">
          {/* Scrollable Date Cards */}
          <div className="flex items-center justify-center">
            {/* Left Arrow */}
            <button
              onClick={() => scrollBy(-300)}
              className="hover:bg-gray-100 transition-colors w-[26px] h-[26px] cursor-pointer"
            >
              <svg width="26" height="26" viewBox="0 0 36 37" fill="none">
                <path
                  d="M19.9394 9.93945L11.3789 18.5L19.9394 27.0605L22.0604 24.9395L15.6209 18.5L22.0604 12.0605L19.9394 9.93945Z"
                  fill="black"
                />
              </svg>
            </button>

            <div
              className="flex gap-4 mx-1 overflow-x-auto max-lg:justify-center scrollbar-hide"
              ref={scrollContainerRef}
            >
              {dates.map((date, index) => (
                <div
                  onClick={() => onDateClick(date.rawDate)}
                  key={`${index}-horizontal-date`}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-2 py-3 rounded-xl border min-w-[130px] cursor-pointer transition-all",
                    date.isSelected
                      ? "bg-primary text-white border-primary shadow-lg"
                      : "bg-white text-black border-[#D7D7D7] hover:border-primary hover:shadow-md"
                  )}
                  ref={(el) => {
                    if (el) dateRefs.current[index] = el;
                  }}
                >
                  <div
                    className={cn(
                      "text-center",
                      date.isSelected ? "" : "text-black"
                    )}
                  >
                    <div className="body-2-semibold">{date?.day}</div>
                    <div
                      className={`btn-text ${!date.isSelected && "opacity-70"}`}
                    >
                      {date?.price}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "w-15 h-0.5 mt-[8px]",
                      date.isSelected ? "bg-white" : "bg-primary"
                    )}
                  />
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scrollBy(300)}
              className="hover:bg-gray-100 transition-colors w-[26px] h-[26px] cursor-pointer"
            >
              <svg width="26" height="26" viewBox="0 0 36 37" fill="none">
                <path
                  d="M14.5605 25.9245L23.121 17.364L14.5605 8.80347L12.4395 10.9245L18.879 17.364L12.4395 23.8035L14.5605 25.9245Z"
                  fill="black"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
