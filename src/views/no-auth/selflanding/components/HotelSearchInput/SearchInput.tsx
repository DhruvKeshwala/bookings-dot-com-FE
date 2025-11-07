import { useState, useEffect } from "react";
import NewButton from "@/components/ui/NewButton";
import { addDays } from "date-fns";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import SearchIcon from "@/components/icons/SearchIcon";
import LocationAutoComplete from "./LocationAutoComplete";
import GuestsDropdown from "./GuestsDropdown";
import RoomsDropdown from "./RoomsDropdown";
import { routes } from "@/config/routes";
import { DateValueType, SelectedCityType } from "@/types/hotel.types";
import "@/app/hotel.css";
import { toast } from "react-toastify";

const CustomDatePicker = dynamic(() => import("@/components/ui/DatePicker"), {
  ssr: false,
});

type Guests = {
  adults: number;
  children: number;
  childrenAges: string[];
};

export default function SearchInput() {
  const router = useRouter();
  const today = new Date();
  const [selectedDateRange, setSelectedDateRange] = useState<DateValueType>([
    today,
    addDays(today, 5),
  ]);
  const [guests, setGuests] = useState<Guests>({
    adults: 2,
    children: 0,
    childrenAges: [],
  });
  const [rooms, setRooms] = useState(1);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedCityType | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLocationSelect = (location: SelectedCityType) => {
    setSelectedLocation(location);
    setErrorMessage(null); 
  };

  const formatDateToYYYYMMDD = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSearch = async () => {
    if (!selectedLocation) {
      toast.error("Please select your destination");
      return;
    }

    try {
      const params: Record<string, string> = {
        location: selectedLocation?.city || "",
        locationCityCode: selectedLocation?.cityCode || "",
        locationNationality: selectedLocation?.countryCode || "",
        guestssearch: JSON.stringify(guests),
        rooms: rooms.toString(),
      };

      if (Array.isArray(selectedDateRange)) {
        const [checkinDate, checkoutDate] = selectedDateRange;
        params.checkin = formatDateToYYYYMMDD(checkinDate);
        params.checkout = formatDateToYYYYMMDD(checkoutDate);
      }

      const encodedParams = encodeURIComponent(JSON.stringify(params));
      router.push(`${routes.hotels.search}?params=${encodedParams}`);
    } catch (error) {
      console.error("Failed to search hotels", error);
      alert("Failed to search hotels. Please try again.");
    }
  };

  //  Calculate dynamic max allowed rooms
  const totalGuests = guests.adults + guests.children;
  const maxAllowedRooms = Math.min(6, totalGuests || 1);

  // Auto-correct room count if guests are less than rooms
  useEffect(() => {
    if (rooms > maxAllowedRooms) {
      setRooms(maxAllowedRooms);
    }
  }, [guests]);

  return (
    <div className="self-stretch flex w-full gap-10 flex-wrap max-lg:max-w-full mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-15 gap-6 lg:gap-6 justify-between w-full items-center">
        {/* Where */}
        <div className="lg:col-span-6 flex flex-col font-nunito text-black justify-start border-b border-black/40">
          <div className="hidden md:block lg:text-[14px] font-medium text-black opacity-60 mb-2">
            Where
          </div>
          <div className="block md:hidden text-xs md:text-lg lg:text-[14px] font-medium text-black opacity-60 mb-2">
            Select City, Location or Hotel Name
          </div>

          <LocationAutoComplete
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
          />
        </div>

        {/* Dates */}
        <div className="lg:col-span-3 border-b relative border-black/40 flex flex-col font-nunito text-black justify-start">
          <div className="hidden md:block lg:text-[14px] font-medium text-black opacity-60 mb-3.5 xl:mb-2.5">
            Dates
          </div>
          <CustomDatePicker
            value={selectedDateRange}
            onChange={setSelectedDateRange}
            minDate={new Date()}
            rangePicker
            calendarFareData={{}}
          />
        </div>

        {/* Guests */}
        <div className="lg:col-span-2 border-b border-black/40 flex flex-col font-nunito text-black justify-start">
          <div className="hidden md:block lg:text-[14px] font-medium text-black opacity-60 mb-2.5">
            Guests
          </div>
          <GuestsDropdown guests={guests} setGuests={setGuests} />
        </div>

        {/* Rooms */}
        <div className="lg:col-span-2 border-b border-black/40 flex flex-col font-nunito text-black justify-start">
          <div className="hidden md:block lg:text-[14px] font-medium text-black opacity-60 mb-2.5">
            Rooms
          </div>
          <RoomsDropdown
            rooms={rooms}
            setRooms={setRooms}
            maxRooms={maxAllowedRooms}
          />
        </div>

        {/* Search Button */}
        <NewButton
          onClick={handleSearch}
          size="xl"
          variant="solid"
          color="secondary"
          className="flex items-center justify-center gap-2 px-4 py-2"
          isDisabled={loading}
        >
          <SearchIcon className="w-5 h-5" />
          <span className="text-lg font-semibold">Search</span>
        </NewButton>
      </div>

      {errorMessage && (
        <div className="text-center text-red-600 font-medium mt-4">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
