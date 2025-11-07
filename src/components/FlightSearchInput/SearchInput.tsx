"use client";
import SwapIcon from "@/components/icons/SwapIcon";
import Button from "@/components/ui/Button";
import SelectDropdown from "@/components/ui/SelectDropdown";
import { routes } from "@/config/routes";
import http from "@/services/http";
import cn from "@/utils/functions/class-name";
import TravellerDropdown from "@/views/no-auth/landing/components/TravellerDropdown";
import { AxiosResponse } from "axios";
import { addDays } from "date-fns";
import { SearchIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import IataAutoComplete from "./IataAutoComplete";
const CustomDatePicker = dynamic(() => import("@/components/ui/DatePicker"), {
  ssr: false,
});

type SelectedCityType = {
  id: number;
  code: string | any;
  city: string;
  country: string;
};

type DateValuePiece = Date | null;
type DateValueType = DateValuePiece | [DateValuePiece, DateValuePiece];

type PropsType = {
  showRangePicker?: boolean;
  showSearchButton?: boolean;
  showRemoveButton?: boolean;
  onRemove?: () => void;
  initialValue?: any;
  onClose?: () => void;
};

const travelClassOptions = [
  { value: "business", label: "Business" },
  { value: "economy", label: "Economy" },
  { value: "first", label: "First" },
];

const formatDateAsUTC = (date: Date) => {
  const d = new Date(date);
  return new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  ).toISOString();
};

export default function SearchInput({
  showRangePicker,
  showSearchButton = true,
  showRemoveButton = false,
  onRemove,
  initialValue,
  onClose,
}: Readonly<PropsType>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const today = new Date();

  const [isRangePicker, setIsRangePicker] = useState(showRangePicker);
  const [selectedDate, setSelectedDate] = useState<DateValueType>(
    initialValue?.date ? new Date(initialValue?.date) : today
  );

  const [selectedDateRange, setSelectedDateRange] = useState<DateValueType>(
    initialValue?.dateRange && Array.isArray(initialValue.dateRange)
      ? [
          new Date(initialValue.dateRange[0]),
          new Date(initialValue.dateRange[1]),
        ]
      : [today, addDays(today, 1)]
  );

  const [travellers, setTravellers] = useState(
    initialValue?.travellers ?? {
      adults: 1,
      children: 0,
      infants: 0,
    }
  );
  const [selectedClass, setSelectedClass] = useState(
    initialValue?.travelClass
      ? travelClassOptions.find(
          (flightClass) => flightClass.value === initialValue?.travelClass
        ) ?? {
          value: "economy",
          label: "Economy",
        }
      : {
          value: "economy",
          label: "Economy",
        }
  );

  const [selectedCity, setSelectedCity] = useState<SelectedCityType | null>(
    initialValue?.origin && initialValue?.origin.code
      ? initialValue.origin
      : null
  );
  const [selectedCityarrival, setSelectedCityarrival] =
    useState<SelectedCityType | null>(
      initialValue?.destination && initialValue?.destination.code
        ? initialValue.destination
        : null
    );

  const [calendarFareData, setCalendarFareData] = useState<
    Record<string, unknown>
  >({});
  const [, setCalendarFareDataReturn] = useState({});

  const parseJSON = <T,>(key: string, fallback: T): T => {
    try {
      const val = searchParams.get(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  };

  const origin = searchParams.get("origin") || "";

  const destination = searchParams.get("destination") || "";

  const pnr = searchParams.get("reissue_pnr");

  const bookingId = searchParams.get("reissue_bookingId");

  const dateRange: string[] | null = parseJSON<string[] | null>(
    "dateRange",
    null
  );

  const isDateRange =
    Array.isArray(dateRange) && !!dateRange[0] && !!dateRange[1];

  const handleSearch = () => {
    if (!selectedCity?.code || !selectedCityarrival?.code) {
      alert("Please select both departure and destination airports.");
      return;
    }

    // ✅ Create base params
    const params: Record<string, string> = {
      origin: selectedCity.code,
      destination: selectedCityarrival.code,
      date:
        selectedDate instanceof Date
          ? formatDateAsUTC(selectedDate)
          : String(selectedDate),
      travellers: JSON.stringify(travellers),
      travelClass: selectedClass?.value ?? "",
    };

    // ✅ Add optional date range if valid
    if (
      isDateRange &&
      Array.isArray(selectedDateRange) &&
      selectedDateRange.length === 2 &&
      selectedDateRange[0] instanceof Date &&
      selectedDateRange[1] instanceof Date
    ) {
      params.dateRange = JSON.stringify([
        formatDateAsUTC(selectedDateRange[0]),
        formatDateAsUTC(selectedDateRange[1]),
      ]);
    }

    // ✅ Add reissue info if present
    if (pnr && bookingId) {
      params.reissue_pnr = pnr;
      params.reissue_bookingId = bookingId;
    }

    // ✅ Convert to query string and navigate
    const queryParams = new URLSearchParams(params);
    router.push(`${routes.flights.search}?${queryParams.toString()}`);

    // ✅ Optional close handler
    onClose?.();
  };

  const fetchAllMonths = async () => {
    // Only proceed if both codes are present and non-empty
    if (!selectedCity?.code || !selectedCityarrival?.code) return;
    const results: Record<string, unknown> = {};

    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);

      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");

      const day =
        i === 0
          ? new Date().getDate().toString().padStart(2, "0") // current day
          : "01"; // otherwise 1st of the month

      const preferredDepartureTime = `${year}-${month}-${day}T00:00:00`;
      const preferredArrivalTime = `${year}-${month}-28T00:00:00`;

      try {
        const { data } = await http.post("/calendar-fare", {
          JourneyType: "1",
          PreferredAirlines: null,
          Segments: [
            {
              Origin: selectedCity.code,
              Destination: selectedCityarrival.code,
              FlightCabinClass: "1",
              PreferredDepartureTime: preferredDepartureTime,
              PreferredArrivalTime: preferredArrivalTime,
            },
          ],
          Sources: null,
        });
        results[`${year}-${month}`] = data;
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }

    setCalendarFareData(results);
  };

  useEffect(() => {
    if (selectedCity && selectedCityarrival) {
      fetchAllMonths();
    }
  }, [selectedCity, selectedCityarrival]);

  useEffect(() => {
    const isRange = Array.isArray(selectedDateRange);
    const fromDate = isRange ? selectedDateRange[0] : null;
    const toDate = isRange ? selectedDateRange[1] : null;

    if (fromDate && !toDate && selectedCity && selectedCityarrival) {
      const fetchReturnFare = async () => {
        const { data } = await http.post<AxiosResponse<unknown>>(
          "/calendar-fare",
          {
            JourneyType: "1",
            PreferredAirlines: null,
            Segments: [
              {
                Origin: selectedCity.code,
                Destination: selectedCityarrival.code,
                FlightCabinClass: "1",
                PreferredDepartureTime: fromDate.toISOString(),
                PreferredArrivalTime: new Date(
                  new Date().setMonth(fromDate.getMonth() + 1)
                ).toISOString(),
              },
            ],
            Sources: null,
          }
        );

        if (data?.data) {
          setCalendarFareDataReturn(data?.data);
        }
      };

      fetchReturnFare();
    }
  }, [selectedDateRange, selectedCity, selectedCityarrival]);

  useEffect(() => {
    if (showRangePicker) {
      setIsRangePicker(true);
    } else {
      setIsRangePicker(false);
    }
  }, [initialValue, showRangePicker]);

  return (
    <div className="self-stretch flex w-full gap-10 flex-wrap max-lg:max-w-full">
      <div className={`flex gap-2 justify-between w-full items-center`}>
        {/* From/To Section */}
        <div
          className={cn("flex items-center justify-evenly gap-2 max-w-[482px]")}
        >
          <IataAutoComplete
            title="Depart From"
            containerClassName="w-full"
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            initialValue={origin}
            storageKey="lastDepartFrom"
          />
          <button
            onClick={() => {
              if (selectedCity && selectedCityarrival) {
                setSelectedCity((prev) => {
                  // swap using previous value to avoid race condition
                  setSelectedCityarrival((prev2) => prev);
                  return selectedCityarrival;
                });
              }
            }}
          >
            <div className="ring-1 ring-primary rounded-full p-2 cursor-pointer">
              <SwapIcon className="size-3 lg:size-4.5" />
            </div>
          </button>
          <IataAutoComplete
            title="Going To"
            containerClassName="w-full"
            selectedCity={selectedCityarrival}
            setSelectedCity={setSelectedCityarrival}
            initialValue={destination}
            storageKey="lastGoingTo"
          />
        </div>

        {/* Dates */}
        <div
          className={`border-b relative border-black/40 flex-col font-nunito text-black justify-start h-[68px] flex items-start max-w-[210px]`}
        >
          <div className="text-black body-text opacity-60 mb-[18px] pl-3">
            Dates
          </div>
          {isDateRange ? (
            <CustomDatePicker
              value={selectedDateRange}
              onChange={setSelectedDateRange}
              minDate={new Date()}
              rangePicker
              calendarFareData={calendarFareData}
            />
          ) : (
            <CustomDatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              minDate={new Date()}
              calendarFareData={calendarFareData}
            />
          )}
        </div>

        {/* Traveller */}
        <div className="border-b border-black/40 flex items-start flex-col justify-start min-h-[64px] min-w-[115px]">
          <div className="text-black body-text opacity-60 mb-[18px] pl-3">
            Traveller
          </div>
          <TravellerDropdown
            travellers={travellers}
            setTravellers={setTravellers}
          />
        </div>

        {/* Class */}
        <div className="border-b border-black/40 flex items-start flex-col justify-start h-[68px] min-w-[105px]">
          <div className="text-black body-text opacity-60 mb-[18px] pl-3">
            Class
          </div>
          <SelectDropdown
            selectedItem={selectedClass}
            setSelectedItem={(item: any) => setSelectedClass(item)}
            items={travelClassOptions}
          />
        </div>

        {/* Search Button */}
        {showSearchButton && (
          <button
            onClick={handleSearch}
            className="text-white btn-cta bg-black flex items-center justify-center gap-[6px] min-w-[125px] min-h-[66px] rounded-[8px] bg-gradient cursor-pointer"
          >
            <SearchIcon className="w-5 h-5" />
            Search
          </button>
        )}

        {/* Remove Button */}
        {showRemoveButton && (
          <Button
            className="lg:col-span-2 border-red-500 text-red-500"
            onClick={onRemove}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
