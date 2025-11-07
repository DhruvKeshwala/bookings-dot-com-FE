"use client";

import { useState, useEffect } from "react";
import { addDays } from "date-fns";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import SearchIcon from "@/components/icons/SearchIcon";
import LocationAutoComplete from "@/views/no-auth/landing/components/HotelSearchInput/LocationAutoComplete";
import GuestsDropdown from "@/views/no-auth/landing/components/HotelSearchInput/GuestsDropdown";
import RoomsDropdown from "@/views/no-auth/landing/components/HotelSearchInput/RoomsDropdown";
import { routes } from "@/config/routes";
import type { LocationOption } from "@/types/LocationOption";
import { DateValueType, Guests, ModifySearchDropdownProps } from "@/types/hotel.types";

const CustomDatePicker = dynamic(() => import("@/components/ui/DatePicker"), {
  ssr: false,
});


export default function ModifySearchDropdown({
  isOpen,
  onClose,
  initialData,
}: ModifySearchDropdownProps) {
  const router = useRouter();
  const today = new Date();

  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<DateValueType>([
    today,
    addDays(today, 5),
  ]);
  const [guests, setGuests] = useState<Guests>({
    adults: initialData.guests,
    children: 0,
    childrenAges: [],
  });
  const [rooms, setRooms] = useState(initialData.rooms);

  // Update the useEffect to set the selectedLocation correctly
useEffect(() => {
  if (isOpen) {
    setSelectedLocation(initialData.location ? {
      id: 0,
      countryCode: "", // set appropriate values
      country: "", // set appropriate values
      cityCode: "", // set appropriate values
      city: initialData.location,
    } : null);
    setGuests((prev) => ({ ...prev, adults: initialData.guests }));
    setRooms(initialData.rooms);
  }
}, [isOpen, initialData]);
  const handleLocationSelect = (location: LocationOption) => {
  setSelectedLocation(location);
};

  const handleSearch = () => {
    const params: any = {
      location: selectedLocation,
      guests: JSON.stringify(guests),
      rooms: rooms.toString(),
    };

    if (selectedDateRange && Array.isArray(selectedDateRange)) {
      params.checkin = selectedDateRange[0]?.toISOString().split("T")[0] || "";
      params.checkout = selectedDateRange[1]?.toISOString().split("T")[0] || "";
    }

    const queryParams = new URLSearchParams(params);
    router.push(`${routes.hotels.search}?${queryParams.toString()}`);
    onClose();
  };

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out bg-white border border-gray-200 rounded-2xl mt-4 shadow-lg ${
        isOpen ? "max-h-96 opacity-100 py-6" : "max-h-0 opacity-0 py-0"
      }`}
    >
      <div className="px-6">
        <div className="flex flex-col gap-5">
          {/* Main Search Form */}
          <div className="flex items-center justify-between gap-12">
            <div className="flex justify-between items-center flex-1 gap-12">
              {/* Where */}
              <div className="flex-[2] min-w-[280px] border-b border-black/40 flex flex-col font-nunito text-black justify-start py-3 px-0">
                <div className="text-[22px] font-medium text-black opacity-60 mb-4">
                  Where
                </div>
                <div className="text-2xl font-bold text-black opacity-80">
                  <LocationAutoComplete
                    selectedLocation={selectedLocation}
                    onLocationSelect={handleLocationSelect}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="flex-[2] min-w-[200px] border-b border-black/40 flex flex-col font-nunito text-black justify-start py-3 px-3">
                <div className="text-[22px] font-medium text-black opacity-60 mb-4">
                  Dates
                </div>
                <div className="text-2xl font-bold text-black opacity-80">
                  <CustomDatePicker
                    value={selectedDateRange}
                    onChange={setSelectedDateRange}
                    minDate={new Date()}
                    rangePicker
                    calendarFareData={{}}
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="flex-1 min-w-[120px] border-b border-black/40 flex flex-col font-nunito text-black justify-start py-3 px-0">
                <div className="text-[22px] font-medium text-black opacity-60 mb-4">
                  Guests
                </div>
                <div className="text-2xl font-bold text-black opacity-80">
                  <GuestsDropdown guests={guests} setGuests={setGuests} />
                </div>
              </div>

              {/* Rooms */}
              <div className="flex-1 min-w-[100px] border-b border-black/40 flex flex-col font-nunito text-black justify-start py-3 px-3">
                <div className="text-[22px] font-medium text-black opacity-60 mb-4">
                  Rooms
                </div>
                <div className="text-2xl font-bold text-black opacity-80">
                  <RoomsDropdown rooms={rooms} setRooms={setRooms} />
                </div>
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="w-[170px] h-[83px] flex items-center justify-center gap-2.5 bg-gradient-to-b from-[#FF914D] to-[#F25C54] rounded-lg flex-shrink-0 hover:opacity-90 transition-opacity"
            >
              <SearchIcon className="w-6 h-6 text-white" />
              <span className="text-xl font-semibold text-white font-nunito">
                Search
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
