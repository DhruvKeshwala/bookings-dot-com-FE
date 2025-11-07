"use client";
import SelectDropdown from "@/components/ui/SelectDropdown";
import { routes } from "@/config/routes";
import http from "@/services/http";
import { AxiosResponse } from "axios";
import { addDays } from "date-fns";
import { SearchIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TravellerDropdown from "../TravellerDropdown";
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
  const router = useRouter();
  const pathname = usePathname();
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
          ? formatDateAsUTC(selectedDate)
          : selectedDate,
      travellers: JSON.stringify(travellers),
      travelClass: selectedClass?.value ?? "",
    };

    if (
      isRangePicker &&
      Array.isArray(selectedDateRange) &&
      selectedDateRange.length === 2 &&
      selectedDateRange[0] instanceof Date &&
      selectedDateRange[1] instanceof Date
    ) {
      parmas.dateRange = JSON.stringify([
        formatDateAsUTC(selectedDateRange[0]),
        formatDateAsUTC(selectedDateRange[1]),
      ]);
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

  useEffect(() => {
    if (showRangePicker) {
      setIsRangePicker(true);
    } else {
      setIsRangePicker(false);
    }
  }, [initialValue, showRangePicker]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-[24px]">
        {/* From Section */}
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
        {/* To Section */}
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

      <div className="flex items-center gap-4 mb-[24px]">
        {/* Dates */}
        <div className="w-full max-w-[218px]">
          <p className="body-2-semibold text-[#646464] mb-2">Dates</p>
          {isRangePicker ? (
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
        <div className="w-full max-w-[144px]">
          <p className="body-2-semibold text-[#646464] mb-2">Traveller</p>
          <TravellerDropdown
            travellers={travellers}
            setTravellers={setTravellers}
          />
        </div>

        {/* Class */}
        <div className="w-full max-w-[134px]">
          <p className="body-2-semibold text-[#646464] mb-2">Class</p>
          <SelectDropdown
            selectedItem={selectedClass}
            setSelectedItem={(item: any) => setSelectedClass(item)}
            items={travelClassOptions}
          />
        </div>
      </div>

      {/* Search Button */}
      {showSearchButton && (
        <button
          className="text-white btn-cta flex items-center justify-center gap-2 w-full min-h-[60px] rounded-[8px] bg-gradient cursor-pointer"
          onClick={handleSearch}
        >
          <SearchIcon /> Search
        </button>
      )}
    </div>
  );
}
