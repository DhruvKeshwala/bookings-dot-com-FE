"use client";

import Button from "@/components/ui/Button";
import NewButton from "@/components/ui/NewButton";
import SelectDropdown from "@/components/ui/SelectDropdown";
import { addDays } from "date-fns";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import IataAutoComplete from "./IataAutoComplete";
import { AxiosResponse } from "axios";
import http from "@/services/http";
import TravellerDropdown from "../TravellerDropdown";
import SwapIcon from "@/components/icons/SwapIcon";
import { routes } from "@/config/routes";
import cn from "@/utils/functions/class-name";
import { SearchIcon } from "lucide-react";
const   CustomDatePicker = dynamic(() => import("@/components/ui/DatePicker"), {
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

export default function SearchInput({
  showRangePicker,
  showSearchButton = true,
  showRemoveButton = false,
  onRemove,
  initialValue,
  onClose,
}: Readonly<PropsType>) {
  const router = useRouter();
  const pathname = usePathname();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<DateValueType>(
    initialValue?.date ?? today
  );
  const [selectedDateRange, setSelectedDateRange] = useState<DateValueType>(
    initialValue?.dateRange ?? [today, addDays(today, 1)]
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

  const handleSearch = () => {
    if (!selectedCity?.code || !selectedCityarrival?.code) {
      alert("Please select both departure and destination airports.");
      return;
    }
    const parmas: any = {
      origin: selectedCity.code,
      destination: selectedCityarrival.code,
      date:
        selectedDate instanceof Date
          ? selectedDate.toISOString()
          : selectedDate,
      travellers: JSON.stringify(travellers),
      travelClass: selectedClass?.value ?? "",
    };

    if (showRangePicker) {
      parmas.dateRange = JSON.stringify(selectedDateRange);
    }

    const queryParams = new URLSearchParams(parmas);

    router.push(`${routes.flights.search}?${queryParams.toString()}`);

    if (onClose) {
      onClose();
    }
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

  return (
    <div className="self-stretch flex w-full gap-10 flex-wrap max-lg:max-w-full">
      <div
        className={`grid grid-cols-1 md:grid-cols-2 ${pathname?.startsWith("/hotels/search")
            ? "lg:grid-cols-16"
            : showSearchButton || showRemoveButton
              ? "lg:grid-cols-15"
              : "lg:grid-cols-13"
          } gap-4 lg:gap-6 justify-between w-full items-center`}
      >
        {/* From/To Section */}
        <div
          className={cn(
            "flex items-center justify-evenly gap-2 lg:gap-6",
            showRangePicker ? "lg:col-span-6" : "lg:col-span-7"
          )}
        >
          <IataAutoComplete
            title="Depart From"
            containerClassName="w-full"
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            initialValue={
              initialValue?.origin && initialValue?.origin.code
                ? initialValue.origin
                : null
            }
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
            initialValue={
              initialValue?.destination && initialValue?.destination.code
                ? initialValue.destination
                : null
            }
            storageKey="lastGoingTo"
          />
        </div>

        {/* Dates */}
        <div
          className={`${
            showRangePicker ? "lg:col-span-3" : "lg:col-span-2"
          } border-b relative border-black/40 flex-col font-nunito text-black justify-start h-[60px] flex items-start `}
        >
          <div className="text-black text-xs lg:text-base font-nunito opacity-60 mb-1">
            Dates
          </div>
          {showRangePicker ? (
            <CustomDatePicker
              value={selectedDateRange}
              onChange={setSelectedDateRange}
              minDate={new Date()}
              rangePicker
              calendarFareData={
                calendarFareData
                // Array.isArray(selectedDateRange) && selectedDateRange[1]
                //   ? calendarFareDataReturn
                //   : calendarFareDataOnward
              }
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
        <div className="lg:col-span-2 border-b border-black/40 flex items-start  flex-col font-nunito text-black justify-start h-[60px]">
          <div className="text-black text-xs lg:text-base font-nunito  opacity-60 mb-1">
            Traveller
          </div>
          <TravellerDropdown
            travellers={travellers}
            setTravellers={setTravellers}
          />
        </div>

        {/* Class */}
        <div className="lg:col-span-2 border-b border-black/40 flex items-start  flex-col font-nunito text-black justify-start h-[60px]">
          <div className="text-black text-xs lg:text-base font-nunito  opacity-60 mb-1">
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
          <NewButton
            onClick={handleSearch}
            size="lg"
            variant="solid"
            color="secondary"
            className="h-full gap-1 items-center font-bold font-nunito text-[20px]"
          >
            <SearchIcon className="w-5 h-5" />
            Search
          </NewButton>
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
