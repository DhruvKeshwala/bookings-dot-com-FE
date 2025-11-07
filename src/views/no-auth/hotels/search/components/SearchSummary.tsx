"use client";

import { ServiceTypeEnum } from "@/common/enums";
import { BusIcon } from "@/components/icons/BusIcon";
import HotelIcon from "@/components/icons/HotelIcon";
import PlaneIcon from "@/components/icons/PlaneIcon";
import SearchIcon from "@/components/icons/SearchIcon";
import { ShopIcon } from "@/components/icons/ShopIcon";
import WorldIcon from "@/components/icons/WorldIcon";
import NewButton from "@/components/ui/NewButton";
import { routes } from "@/config/routes";
import type { LocationOption } from "@/types/LocationOption";
import { DateValueType, Guests, SearchSummaryProps, SelectedCityType } from "@/types/hotel.types";
import FlightSearchInput from "@/views/no-auth/landing/components/FlightSearchInput"; // Added import for Flight
import GuestsDropdown from "@/views/no-auth/landing/components/HotelSearchInput/GuestsDropdown";
import LocationAutoComplete from "@/views/no-auth/landing/components/HotelSearchInput/LocationAutoComplete";
import RoomsDropdown from "@/views/no-auth/landing/components/HotelSearchInput/RoomsDropdown";
import { addDays } from "date-fns";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CustomDatePicker = dynamic(() => import("@/components/ui/DatePicker"), {
  ssr: false,
});


export default function SearchSummary({ data, className }: SearchSummaryProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<DateValueType>(null);
  const [guests, setGuests] = useState<Guests>({
    adults: data.guestsData?.adults || 2,
    children: data.guestsData?.children || 0,
    childrenAges: data.guestsData?.childrenAges || [],
  });
  const [rooms, setRooms] = useState(data.rooms);

  const [activeService, setActiveService] = useState<ServiceTypeEnum>(ServiceTypeEnum.Hotel);

  const productOfferingTabs = [
    { icon: <PlaneIcon />, title: "Flight", type: ServiceTypeEnum.Flight },
    { icon: <BusIcon />, title: "Bus", type: ServiceTypeEnum.Bus },
    { icon: <HotelIcon />, title: "Hotel", type: ServiceTypeEnum.Hotel },
    { icon: <ShopIcon />, title: "Shop", type: ServiceTypeEnum.Shop },
    { icon: <WorldIcon />, title: "Gigs", type: ServiceTypeEnum.Gigs },
  ];

  useEffect(() => {
    populateFormFromData();
  }, [data]);

  const populateFormFromData = () => {
    if (data.locationCityCode && data.location) {
      setSelectedLocation({
        id: 0,
        countryCode: data.locationNationality || "",
        country: "",
        cityCode: data.locationCityCode,
        city: data.location,
      });
    } else {
      setSelectedLocation(null);
    }

    if (data.checkin && data.checkout) {
      setSelectedDateRange([new Date(data.checkin), new Date(data.checkout)]);
    } else {
      const today = new Date();
      setSelectedDateRange([today, addDays(today, 5)]);
    }

    setGuests({
      adults: data.guestsData?.adults || 2,
      children: data.guestsData?.children || 0,
      childrenAges: data.guestsData?.childrenAges || [],
    });
    setRooms(data.rooms);
  };

  const handleLocationSelect = (location: SelectedCityType) => {
    setSelectedLocation(location);
  };

  const handleDateRangeChange = (dateRange: DateValueType) => {
    setSelectedDateRange(dateRange);
  };

  const handleGuestsChange = (newGuests: { adults: number; children: number; childrenAges: string[] }) => {
    setGuests(newGuests);
  };

  const handleRoomsChange = (newRooms: number) => {
    setRooms(newRooms);
  };

  const handleSearch = async (
    location?: LocationOption | null,
    dateRange?: DateValueType,
    guestsData?: { adults: number; children: number; },
    roomsCount?: number
  ) => {
    try {
      setLoading(true);
      setError(null);

      const currentLocation = location || selectedLocation;
      const currentDateRange = dateRange || selectedDateRange;
      const currentGuests = guestsData || guests;
      const currentRooms = roomsCount || rooms;

      const params: Record<string, string> = {
        location: currentLocation?.city || "",
        locationCityCode: currentLocation?.cityCode || "",
        locationNationality: currentLocation?.countryCode || "",
        guestssearch: JSON.stringify(currentGuests),
        rooms: currentRooms.toString(),
      };

      if (Array.isArray(currentDateRange)) {
        const [checkinDate, checkoutDate] = currentDateRange;
        params.checkin = checkinDate?.toISOString().split("T")[0] || "";
        params.checkout = checkoutDate?.toISOString().split("T")[0] || "";
      }

      const encodedParams = encodeURIComponent(JSON.stringify(params));

      router.push(`${routes.hotels.search}?params=${encodedParams}`);
    } catch (error) {
      console.error("Failed to search hotels", error);
      setError("Failed to search hotels. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderSearchSection = () => {
    switch (activeService) {
      case ServiceTypeEnum.Hotel:
        return (
          <div
            className="flex flex-col md:flex-row items-center justify-between bg-white rounded-b-2xl px-3 lg:px-8 py-3 gap-2 md:gap-2"
            style={{ borderLeft: "none", borderRight: "none" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-17 gap-6 lg:gap-6 justify-between w-full items-center">
              {/* Where */}
              <div className="lg:col-span-6 flex flex-col font-nunito text-black justify-start border-b border-black/40">
                <div className="hidden md:block lg:text-[14px] font-medium text-black opacity-60 mb-2">Where</div>
                <div className="block md:hidden text-xs md:text-lg lg:text-[14px] font-medium text-black opacity-60 mb-2">
                  Select City, Location or Hotel Name
                </div>

                <LocationAutoComplete selectedLocation={selectedLocation} onLocationSelect={handleLocationSelect} />
              </div>

              {/* Dates */}
              <div className="lg:col-span-4 border-b relative border-black/40 flex flex-col font-nunito text-black justify-start overflow-visible">
                <div className="hidden md:block lg:text-[14px] font-medium text-black opacity-60 mb-3.5 xl:mb-2.5">Dates</div>
                <div className="relative z-[10] overflow-visible search-summary-datepicker">
                  <CustomDatePicker
                    value={selectedDateRange}
                    onChange={handleDateRangeChange}
                    minDate={new Date()}
                    rangePicker
                    calendarFareData={{}}
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="lg:col-span-2 border-b border-black/40 flex flex-col font-nunito text-black justify-start">
                <div className="hidden md:block lg:text-[14px] font-medium text-black opacity-60 mb-2.5">Guests</div>
                <GuestsDropdown
                  guests={{
                    adults: guests.adults,
                    children: guests.children,
                    childrenAges: guests.childrenAges,
                  }}
                  setGuests={handleGuestsChange}
                />
              </div>

              {/* Rooms */}
              <div className="lg:col-span-2 border-b border-black/40 flex flex-col font-nunito text-black justify-start">
                <div className="hidden md:block lg:text-[14px] font-medium text-black opacity-60 mb-2.5">Rooms</div>
                <RoomsDropdown rooms={rooms} setRooms={handleRoomsChange} />
              </div>

              {/* Search Button */}
              <NewButton
                onClick={() => handleSearch(selectedLocation, selectedDateRange, guests, rooms)}
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
          </div>
        );

      case ServiceTypeEnum.Flight:
         return (
    <div className="bg-white rounded-b-2xl p-[10px] pl-[36px]">
      <FlightSearchInput />
    </div>
  );

      case ServiceTypeEnum.Bus:
      case ServiceTypeEnum.Shop:
      case ServiceTypeEnum.Gigs:
        return (
          <div className="bg-white p-4 rounded-b-2xl text-black">
            <p className="text-lg font-medium">{activeService} search coming soon.</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`relative z-10 max-w-[1280px] min-h-10 lg:min-h-20 search-summary-container ${
        className ?? "mt-4 md:mt-8"
      }`}
    >
      {/* Tabs container - remove border-bottom by removing border-b or border-bottom */}
      <div
        className="flex flex-wrap text-primary bg-white rounded-t-2xl px-3 lg:px-8 py-3 gap-4 md:gap-2 w-full items-center gap-3 lg:gap-6 justify-start"
        style={{ borderBottom: "none" }} // to ensure no border bottom
      >
        {productOfferingTabs.map(({ icon, title, type }, index) => (
          <button
            key={`${index}-${type}`}
            type="button"
            className={`cursor-pointer disabled:cursor-not-allowed justify-center items-center rounded-lg border-[2px] flex gap-2  px-2 py-1  ${activeService === type ? "bg-primary text-foreground" : ""}`}
            onClick={() => setActiveService(type)}
          >
            {icon}
            <span
              className={activeService !== type ? "hidden lg:inline" : ""}
            >
              {title}
            </span>
          </button>
        ))}
      </div>

      {/* Conditionally rendered search section */}
      {renderSearchSection()}

      {error && <div className="text-red-500 font-semibold text-center mt-2">{error}</div>}
    </div>
  );
}
