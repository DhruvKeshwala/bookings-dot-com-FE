"use client";

import { BlackPersonIcon } from "@/components/icons/BlackPersonIcon";
import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { CrossIcon } from "@/components/icons/CrossIcon";
import { LocationIcon } from "@/components/icons/LocationIcon";
import http from "@/services/http";
import { fetchUserIp } from "@/utils/functions/hotelBookingApi";
import {useEffect, useRef } from "react";
import { toast } from "react-toastify";

interface CancelReservationModalProps {
  bookingHotel: any,
  onClose: () => void;
  setBookings: any
}

export default function CancelReservationModal({
  bookingHotel,
  onClose,
  setBookings
}: CancelReservationModalProps) {
  const checkIn = new Date(bookingHotel.checkInDate);
  const checkOut = new Date(bookingHotel.checkOutDate);
                      
  const nights = Math.round(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const modalRef = useRef<HTMLDivElement>(null);

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

const handleCancleProcess = async () => {
  try {
    const ipResponse = await fetchUserIp();
    const userIp = ipResponse.ip || "192.168.31.130";

    const payload = {
      EndUserIp: userIp,
      RequestType: 4,
      BookingId: bookingHotel.bookingId,
      Remarks: "Test remarks",
      BookingMode: 5,
      userId: bookingHotel?.user?.id,
    };

    const response = await http.post("/hotels/cancel", payload);

    if (response.data?.HotelChangeRequestResult?.ResponseStatus === 1) {
      toast("Booking cancelled successfully.");

      setBookings((prevBookings:any) =>
        prevBookings.filter((b:any) => b.bookingId !== bookingHotel.bookingId)
      );

      onClose();
    } else {
      toast(`Cancellation failed: ${response.data?.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Cancel API Error:", error);
    toast("Something went wrong while cancelling the booking.");
  }
};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div
        ref={modalRef}
        className="bg-white rounded-xl w-full mx-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg p-6 relative shadow-lg"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-5 right-5 text-black hover:text-gray-500"
        >
          {/* X Icon */}
          <CrossIcon />
        </button>

        {/* Header */}
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-nunito my-2 mb-2 whitespace-nowrap">
          Cancel Your Hotel Reservation
        </h2>
        <p className="text-xs font-nunito font-light mb-5">
          {bookingHotel.cancellationPolicy}
        </p>

        {/* Hotel Info */}
        <div className="text-lg md:text-xl font-bold font-nunito mb-2">
          {bookingHotel.hotelName}
        </div>
        <div className="text-base md:text-lg font-bold font-nunito mb-2">
          {bookingHotel.roomTypeName}
        </div>
        <div className="text-gray-400 text-sm font-light font-nunito mb-4">
          {bookingHotel.address}, {bookingHotel.city}
        </div>

        {/* Location */}
        <div className="flex items-center text-xs font-nunito font-semibold gap-2  text-gray-700 mb-1">
          <div>
            <LocationIcon />
          </div>
          <p className="whitespace-break-spaces">
            {bookingHotel.address}, {bookingHotel.city}
          </p>
        </div>

        {/* Date */}
        <div className="flex items-center text-xs font-nunito font-semibold gap-2  text-gray-700 mb-1">
          <div>
            <CalendarIcon />
          </div>
          {(() => {
            const options: Intl.DateTimeFormatOptions = {
              weekday: "short",
              day: "numeric",
              month: "short",
            };

            if (checkIn instanceof Date && checkOut instanceof Date) {
              const formattedCheckIn = checkIn.toLocaleDateString(
                "en-US",
                options
              );
              const formattedCheckOut = checkOut.toLocaleDateString(
                "en-US",
                options
              );

              return (
                <>
                  {formattedCheckIn} - {formattedCheckOut}
                </>
              );
            } else {
              console.error("checkIn or checkOut is not a valid Date object");
              return <>Invalid date</>;
            }
          })()}{" "}
          - {nights} Night
        </div>

        {/* Guests */}
        <div className="flex items-center text-xs font-nunito font-semibold gap-2 text-gray-700 mb-2">
          <div>
            <BlackPersonIcon />
          </div>
          {bookingHotel.rooms?.length} Room, {bookingHotel.passengers?.length}{" "}
          Guest
        </div>

        {/* Guests Info */}
        <div>
          <h4 className="text-base md:text-lg font-bold font-nunito mb-2">
            Guest Information
          </h4>
          {bookingHotel.passengers.map((pax: any, index: number) => (
            <div
              key={index}
              className="flex justify-between items-center font-nunito text-sm font-light"
            >
              <div className="flex items-center text-xs font-nunito font-semibold gap-2 text-gray-700 mb-2">
                <BlackPersonIcon />
                {pax?.title}{" "}
                {`${pax?.firstName
                  ?.charAt(0)
                  .toUpperCase()}${pax?.firstName?.slice(1)} ${pax?.lastName
                  ?.charAt(0)
                  .toUpperCase()}${pax?.lastName?.slice(1)}`}
              </div>
              <div className="text-xs text-[#00B4D8]">
                {pax.title === "Mr" || pax.title === "Mr." ? "Male" : "Female"}
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center font-nunito text-sm font-light">
            <div className=" text-gray-700">Room Number:</div>{" "}
            <div className="text-xs">
              {bookingHotel.rooms.map((room: any) => (
                <div key={room.id}> {room.roomId} </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-500 h-[1px] mt-5 "></div>

        {/* Cancellation Info */}
        <div className="text-lg md:text-xl font-bold font-nunito mt-4 mb-1">
          Cancellation Information
        </div>
        <p className="text-xs font-nunito font-light">
          Refunds will be issued using the same method of payment as the
          original booking.
        </p>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="w-6/12 lg:w-4/12 px-4 py-2 rounded-md cursor-pointer text-[#FF6B6B] border border-[#FF6B6B] hover:bg-[#ff6b6b79] hover:text-white text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleCancleProcess}
            className="w-6/12 lg:w-4/12 px-4 py-2 rounded-md cursor-pointer bg-[#FF6B6B] hover:bg-[#FF6B6B50] text-white text-sm"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
