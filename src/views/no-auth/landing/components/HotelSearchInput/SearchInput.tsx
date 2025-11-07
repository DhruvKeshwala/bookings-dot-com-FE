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
import DepartIcon from "@/components/icons/DepartIcon";

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
    <div>
      <div className="flex items-center justify-between mb-[24px]">
        <h3 className="text-primary subheading">Find Your Perfect Stay</h3>
        <div className="h-[35px]" />
      </div>

      {/* Where */}
      <div className="mb-4">
        <p className="body-2-semibold text-[#646464] mb-2">Where To?</p>
        <div className="flex items-center gap-[10px] bg-white border border-[#CBCACA] rounded-[8px] px-[12px] py-[7px]">
          <DepartIcon />
          <LocationAutoComplete
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
          />
        </div>
      </div>

      <div className="w-full flex items-center gap-4 mb-[24px]">
        {/* Dates */}
        <div className="w-full max-w-[218px]">
          <p className="body-2-semibold text-[#646464] mb-2">Dates</p>
          <CustomDatePicker
            value={selectedDateRange}
            onChange={setSelectedDateRange}
            minDate={new Date()}
            rangePicker
            calendarFareData={{}}
          />
        </div>

        {/* Guests */}
        <div className="w-full max-w-[144px]">
          <p className="body-2-semibold text-[#646464] mb-2">Guests</p>
          <GuestsDropdown guests={guests} setGuests={setGuests} />
        </div>

        {/* Rooms */}
        <div className="w-full max-w-[134px]">
          <p className="body-2-semibold text-[#646464] mb-2">Rooms</p>
          <RoomsDropdown
            rooms={rooms}
            setRooms={setRooms}
            maxRooms={maxAllowedRooms}
          />
        </div>
      </div>

      {/* Search Button */}
      <button
        className="text-white btn-cta flex items-center justify-center gap-2 w-full min-h-[60px] rounded-[8px] bg-gradient cursor-pointer"
        onClick={handleSearch}
        disabled={loading}
      >
        <SearchIcon /> Search
      </button>

      {errorMessage && (
        <div className="text-center text-red-600 font-medium mt-4">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
