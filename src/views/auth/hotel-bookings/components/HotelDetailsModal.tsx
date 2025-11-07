"use client";

import { useEffect, useRef } from "react";
import { CrossIcon } from "@/components/icons/CrossIcon";
import { LocationIcon } from "@/components/icons/LocationIcon";
import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { BlackPersonIcon } from "@/components/icons/BlackPersonIcon";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

interface HotelDetailsModalProps {
  hotelDetails: any;
  onClose: () => void;
}

export default function HotelDetailsModal({ hotelDetails, onClose }: HotelDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const lat = parseFloat(hotelDetails.latitude);
  const lng = parseFloat(hotelDetails.longitude);

  const center = {
    lat: isNaN(lat) ? 28.6139 : lat,
    lng: isNaN(lng) ? 77.2090 : lng,
  };

  const checkIn = new Date(hotelDetails.checkInDate);
  const checkOut = new Date(hotelDetails.checkOutDate);
                      
  const nights = Math.round(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleHotelTicketPrint = (bookingid: string) => {
  const newWindow = window.open(`/hotel-ticket/${bookingid}`);
  if (!newWindow) alert("Please allow popups for this site.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 p-4">
      <div
        ref={modalRef}
        className="bg-white  sm:max-w-xl md:max-w-3xl lg:max-w-5xl w-full rounded-lg shadow-xl overflow-y-auto max-h-[80vh] relative p-10"
      >
        {/* Close Button */}
        <div className="my-2">
          <h2 className="text-2xl lg:text-3xl font-bold font-nunito mb-4">
            Hotel Detail
          </h2>
          <button
            onClick={onClose}
            className="absolute top-10 right-10 text-black hover:text-gray-500 text-2xl font-bold"
          >
            <CrossIcon />
          </button>
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-6 ">
          {/* Left Side: Map */}
          <div className="w-full lg:w-1/2">
            <div className="w-full h-[300px] rounded-md overflow-hidden">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={center}
                  zoom={16}
                  options={{
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                  }}
                >
                  <Marker
                    position={center}
                    label={{
                      text: hotelDetails.hotelName || "",
                      className: "bg-[#014569] !text-white px-2 py-1 rounded font-semibold",
                    }}
                    icon={{
                      url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    }}
                  />
                </GoogleMap>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                  Loading map...
                </div>
              )}
            </div>
            <div className="mt-4 font-nunito">
              <p className="text-lg font-bold mb-2">
                Free Cancellation Until May 21
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {hotelDetails.cancellationPolicy}
              </p>

              <p className="text-lg font-bold mt-4 lg:mt-4">
                Scheduled Check-In And Check-Out Time
              </p>
              <div className="text-sm text-gray-600 mt-1">
                {(() => {
                  const optionsDate: Intl.DateTimeFormatOptions = {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  };

                  const optionsTime: Intl.DateTimeFormatOptions = {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  };

                  let formattedCheckIn = '';
                  let formattedCheckOut = '';

                  if (checkIn instanceof Date && checkOut instanceof Date) {
                    formattedCheckIn = `${checkIn.toLocaleDateString('en-US', optionsDate)} at ${checkIn.toLocaleTimeString('en-US', optionsTime)}`;
                    formattedCheckOut = `${checkOut.toLocaleDateString('en-US', optionsDate)} at ${checkOut.toLocaleTimeString('en-US', optionsTime)}`;
                  } else {
                    console.error('checkIn or checkOut is not a valid Date object');
                  }

                  return (
                    <>
                      <p>
                        Check-in: <span className="text-xs">{formattedCheckIn}</span>
                      </p>
                      <p>
                        Checkout: <span className="text-xs">{formattedCheckOut}</span>
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Right Side: Info */}
          <div className="w-full lg:w-1/2 space-y-7">
            <div>
              <h2 className="text-xl font-bold font-nunito mb-2">{ hotelDetails.hotelName }</h2>
              <div className="flex justify-between items-center font-nunito text-sm font-light">
                <div>Order Number</div>{" "}
                <div className="font-bold">{ hotelDetails.bookingId }</div>
              </div>
            </div>

            <div className="mb-0">
              <h3 className="text-lg font-bold font-nunito mb-2">
                {hotelDetails.roomTypeName}
              </h3>
              <p className="text-sm text-gray-500">
                {hotelDetails.address}, {hotelDetails.city}
              </p>
              <div className="flex items-center text-xs font-nunito font-semibold gap-2  text-gray-700 mt-1 mb-1">
                <div>
                  <LocationIcon />
                </div>
                <p className="whitespace-break-spaces">
                  {hotelDetails.address}, {hotelDetails.city}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center rounded-md text-sm">
              <div>
                <div className="flex items-center text-xs font-nunito font-semibold gap-2  text-gray-700 mb-1">
                  <div>
                    <CalendarIcon />
                  </div>
                  {(() => {
                    const options: Intl.DateTimeFormatOptions = {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    };

                    if (checkIn instanceof Date && checkOut instanceof Date) {
                      const formattedCheckIn = checkIn.toLocaleDateString('en-US', options);
                      const formattedCheckOut = checkOut.toLocaleDateString('en-US', options);

                      return (
                        <>
                          {formattedCheckIn} - {formattedCheckOut}
                        </>
                      );
                    } else {
                      console.error('checkIn or checkOut is not a valid Date object');
                      return <>Invalid date</>;
                    }
                  })()} - {nights} Night
                </div>
                <div className="flex items-center text-xs font-nunito font-semibold gap-2 text-gray-700 mb-2">
                  <div>
                    <BlackPersonIcon />
                  </div>
                  {hotelDetails.rooms?.length} Room, {hotelDetails.passengers?.length} Guest
                </div>
              </div>
              <button className="text-[#FF6B6B] text-sm font-medium hover:underline">
                Edit
              </button>
            </div>

            <div className="w-full bg-gray-500 h-[1px] mt-5 "></div>

            <div>
              <h4 className="text-lg font-bold font-nunito mb-2">
                Guest Information
              </h4>
              {hotelDetails.passengers.map((guest: any, index: number) => (
                <div key={index} className="flex justify-between items-center font-nunito text-sm font-light">
                  <div className="flex items-center text-sm font-nunito font-semibold gap-2 text-gray-700 mb-2">
                    <BlackPersonIcon />
                    {guest?.title} {`${guest?.firstName?.charAt(0).toUpperCase()}${guest?.firstName?.slice(1)} ${guest?.lastName?.charAt(0).toUpperCase()}${guest?.lastName?.slice(1)}`}
                  </div>
                  <div className="text-sm text-[#00B4D8]">
                    {guest?.title === "Mr" || guest?.title === "Mr." ? "Male" : "Female"}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between font-nunito text-sm">
                <span>Room Price For {nights} Night & {hotelDetails.passengers.length} Guest</span>
                <span className="font-bold">₹{hotelDetails.totalAmount}</span>
              </div>
              {/* <div className="flex justify-between font-nunito text-sm">
                <span>65% Coupon Discount</span>
                <span className="font-bold">- ₹0</span>
              </div> */}
              <div className="flex justify-between font-nunito font-semibold text-base">
                <span className="font-bold">Total</span>
                <span className="font-bold">₹{hotelDetails.totalAmount}</span>
              </div>
            </div>

            <div className="w-full flex items-center justify-center mx-auto">
              <button onClick={() => handleHotelTicketPrint(hotelDetails.bookingId)} className="bg-[#FF6B6B] text-white px-4 py-2 rounded-md text-sm hover:bg-[#ff6b6b94]">
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
