"use client";

import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { NightIcon } from "@/components/icons/NightIcon";
import http from "@/services/http";
import { BookedHotelListProps, HotelBooking } from "@/types/hotel.types";
import { useEffect, useState } from "react";
import { DeluxRoomIcon } from "@/components/icons/DeluxRoomIcon";
import { ConfirmedIcon } from "@/components/icons/ConfirmedIcon";
import { EmailIcon } from "@/components/icons/EmailIcon";
import { HotelIcon2 } from "@/components/icons/HotelIcon2";
import { PersonIcon2 } from "@/components/icons/PersonIcon2";
import CancelReservationModal from "./CancelReservationModal";
import HotelDetailsModal from "./HotelDetailsModal";
import { format } from "date-fns";
import { useAtom } from "jotai";
import { userAtom } from "@/app/atoms/auth";
import "@/app/hotel.css";
import { toast } from "react-toastify";
import { LOCAL_KEY } from "@/common/enums";
import { getStorageItem } from "@/services/storage";
import { PiWarningCircleFill } from "react-icons/pi";
import { Cashfree, load } from "@cashfreepayments/cashfree-js";
import { generateHotelBookingId } from "@/utils/functions";
import { createHotelBooking, createPaymentOrder, fetchBookingDetails, fetchHotelBookingHistory, fetchUserIp, saveBookingDetails, sendPendingMail } from "@/utils/functions/hotelBookingApi";

const BookingCard = ({ booking, setBookings, setActiveFilter }: { booking: HotelBooking, setBookings: any, setActiveFilter: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHotelDetailsOpen, setIsHotelDetailsOpen] = useState(false);
  const [cashfree, setCashfree] = useState<Cashfree | null>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const checkIn = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);
  const checkInDate = format(checkIn, 'dd, MMMM yyyy');
  const checkOutDate = format(checkOut, 'dd, MMMM yyyy')

  const orderId = generateHotelBookingId();
  const token = getStorageItem(LOCAL_KEY.ACCESS_TOKEN);

  const nights = Math.round(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );

  useEffect(() => {
    const shouldBlockScroll = isOpen || isHotelDetailsOpen;

    if (shouldBlockScroll || isPaymentProcessing) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isOpen, isHotelDetailsOpen, isPaymentProcessing]);

  const handleCloseCancleModal = () => {
    setIsOpen(false);
  }

  const handleCloseHotelDetailsModal = () => {
    setIsHotelDetailsOpen(false)
  }

  const handleResendConfirmation = async () => {
    try {
      if (!booking.bookingId) {
        toast.error("Missing bookingId.");
        return;
      }

      if (!token) {
        toast.error("User not authenticated.");
        return;
      }

      const response = await http.get(
        `/hotel/resend-confirmation/mail?bookingid=${booking.bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response?.data) {
        throw new Error("Empty response from API.");
      }

      toast.success("Confirmation email resent successfully.");

    } catch (error: any) {
      console.error("Error resending confirmation email:", error);
      toast.error("Failed to resend confirmation email.");
    }
  };

  useEffect(() => {
    const initializeCashfree = async () => {
      try {
        const cashfreeSDK = await load({
          mode: "sandbox",
        });
        setCashfree(cashfreeSDK);
        console.log("Cashfree SDK initialized");
      } catch (error) {
        console.error("Failed to initialize Cashfree SDK:", error);
      }
    };

    initializeCashfree();
  }, []);

  function transformBookingData(data: any): HotelBooking[] {
    const bookings = Array.isArray(data) ? data : [data];

    return bookings.map((item) => ({
      ...item,
      rateConditions: JSON.parse(item.rateConditions),
      user: { ...item.user },
      passengers: item.passengers.map((p: any) => ({ ...p })),
    }));
  }

  const handlePayment = async () => {
    try {
      const { user, bookingId, netAmount } = booking;
      const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URI || "https://api.travulu.in";
      const paymentPayload = {
        orderId: orderId,
        amount: Math.round(parseFloat(netAmount)),
        order_currency: "INR",
        customer: {
          id: String(user?.id),
          name: `${user?.firstName ?? "Guest"} ${user?.lastName ?? ""}`,
          email: user?.email,
          phone: user?.phone || "9999999999",
        },
        order_meta: {
          return_url: `${baseUrl}/thankyou`,
        },
        order_note: "hotel booking payment",
      };

      const { data } = await createPaymentOrder(paymentPayload);

      if (!data?.payment_session_id) {
        toast.error("Failed to get payment session ID.");
        return;
      }

      const checkoutOptions = {
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_modal",
      };

      const result = await (cashfree as any)?.checkout(checkoutOptions);

      if (result.error) {
        toast.error("Payment popup closed or failed.");
        return;
      }

      if (result.paymentDetails) {
        setIsPaymentProcessing(true);

        let userIp = "127.0.0.1";
        try {
          const ipResponse = await fetchUserIp();
          userIp = ipResponse?.ip || userIp;
        } catch {
          console.warn("Could not fetch IP, using fallback IP:", userIp);
        }

        // Step 1: Generate voucher
        let generatedBookingId = "";
        try {
          const voucherResponse = await http.post("/hotels/generate-voucher", {
            BookingId: bookingId,
            EndUserIp: userIp,
          });

          const voucherResult = voucherResponse?.data?.GenerateVoucherResult;

          if (
            voucherResult?.Error?.ErrorCode !== 0 ||
            voucherResult?.Error?.ErrorMessage !== ""
          ) {
            toast.error(
              voucherResult?.Error?.ErrorMessage || "Failed to generate hotel voucher."
            );
            return;
          }

          generatedBookingId = voucherResult?.BookingId?.toString();
        } catch (voucherErr) {
          console.error("Voucher generation failed:", voucherErr);
          toast.error("Voucher generation failed. Please try again.");
          return;
        }

        // Step 2: Booking details with 60s timeout
        let hotelDetails = null;
        try {
          const bookingDetailsPromise = fetchBookingDetails(generatedBookingId, userIp);

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Booking details timeout")), 60000)
          );

          const bookingDetailsResponse: any = await Promise.race([
            bookingDetailsPromise,
            timeoutPromise,
          ]);

          hotelDetails = bookingDetailsResponse?.data?.GetBookingDetailResult;

          // Safely call create API but don't block flow
          try {
            const allPassengers = hotelDetails?.Rooms?.flatMap(
              (room: any) => room?.HotelPassenger || []
            );

            const leadPassenger = allPassengers?.find((p: any) => p?.LeadPassenger === true);
            const nonLeadPassenger = allPassengers?.find((p: any) => p?.LeadPassenger === false);
            const selectedPassenger = leadPassenger || nonLeadPassenger;

            const guestFullName = selectedPassenger
              ? `${selectedPassenger?.FirstName || ""} ${selectedPassenger?.LastName || ""}`.trim()
              : "Guest";

            const guestEmail = selectedPassenger?.Email;
            const guestPhone = selectedPassenger?.Phoneno;

            const numberOfGuests =
              hotelDetails?.Rooms?.reduce(
                (total: number, room: any) =>
                  total + (room?.AdultCount || 0) + (room?.ChildCount || 0),
                0
              ) || 0;

            const rawRoomTypeName = hotelDetails?.Rooms?.[0]?.RoomTypeName || "";
            const roomType = rawRoomTypeName.split("Room")[0]?.trim();

            const inclusionText = hotelDetails?.Rooms?.[0]?.Inclusion || "";
            const mealPlan = inclusionText.toLowerCase().includes("breakfast")
              ? "breakfast_only"
              : "room_only";

            const createPayload = {
              booking_date: hotelDetails?.BookingDate,
              booking_reference: hotelDetails?.BookingRefNo,
              check_in_date: hotelDetails?.CheckInDate,
              check_out_date: hotelDetails?.CheckOutDate,
              guest_country: hotelDetails?.GuestNationality,
              guest_email: guestEmail,
              guest_name: guestFullName,
              guest_phone: guestPhone,
              hotel_id: String(hotelDetails?.HotelId),
              hotel_name: hotelDetails?.HotelName,
              meal_plan: mealPlan,
              name: guestFullName,
              number_of_guests: numberOfGuests,
              number_of_rooms: hotelDetails?.NoOfRooms,
              room_type: roomType || "Room",
            };

            await createHotelBooking(createPayload);
          } catch (createErr) {
            console.error("⚠️ Hotel booking create failed:", createErr);
          }

        } catch (bookingDetailsErr) {
          console.error("Booking details fetch failed or timed out:", bookingDetailsErr);

          // Send pending booking email
          try {
            const pendingMailResponse = await sendPendingMail(token);

            if (!pendingMailResponse?.data) {
              throw new Error("Empty response from pending booking email API.");
            }

            toast.success(
              "Booking is being processed. A pending booking email has been sent."
            );
          } catch (pendingMailError) {
            console.error("Pending mail failed:", pendingMailError);
            toast.error("Failed to send pending booking email.");
          }

          return;
        }

        // Step 3: Save booking details internally
        try {
          await saveBookingDetails(generatedBookingId, user?.id.toString());
        } catch (saveErr) {
          console.error("Error saving booking details:", saveErr);
          toast.error("Failed to save booking details.");
          return;
        }

        // Step 4: Fetch user booking history and set it
        try {
          const response = await fetchHotelBookingHistory(user?.id.toString());
          const transformed = transformBookingData(response.data);
          setBookings(transformed);
        } catch (historyErr) {
          console.error("Booking history fetch failed:", historyErr);
          toast.error("Failed to update booking history.");
          return;
        }

        // All success
        toast.success("🎉 Booking completed successfully!");
      }
    } catch (error) {
      console.error("Payment or booking process failed:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPaymentProcessing(false);
      setActiveFilter("all");
    }
  };

  const formatDate = (isoDateString: any) => {
    const date = new Date(isoDateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };


  return (
    <div className="bg-white border border-gray-300 rounded-xl p-4 md:p-6 shadow-sm w-full">
      {booking.voucherStatus === false && (
        <div className="text-red-500 font-semibold text-xs pb-2 flex">
          <PiWarningCircleFill size={18} className="mt-0.5" />
          <p className="pl-1">
            Payment Due By {formatDate(booking.lastCancellationDeadline)}. Your Reservation Is On Hold. Please Pay Now To Confirm Your Booking.
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start gap-2 w-full">
        {/* Left Side - Hotel Details */}
        <div className="w-full md:w-80 border-gray-200">
          {/* Status and Hotel Badge */}

          {booking.voucherStatus !== false && (
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-md">
                <HotelIcon2 />
                <span className="text-xs font-semibold text-blue-600 font-nunito">Hotel</span>
              </div>
              <div className="flex items-center text-green-600 gap-1 text-[10px] font-nunito font-medium">
                <ConfirmedIcon />
                Confirmed
              </div>
            </div>
          )}

          {/* Hotel Name */}
          <h3 className="text-lg font-bold font-nunito text-gray-900 mb-2">
            {booking.hotelName}
          </h3>

          {/* Booking Details */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <div className="flex items-center gap-1">
                <CalendarIcon />
                <span className="text-xs font-medium text-black font-nunito capitalize">
                  {checkInDate}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarIcon />
                <span className="text-xs font-medium text-black font-nunito capitalize">
                  {checkOutDate}
                </span>
              </div>
            </div>

            <div className="flex flex-row lg:flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <NightIcon />
                <span className="text-xs font-medium text-black font-nunito capitalize">
                  {nights} Nights
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <PersonIcon2 />
                <span className="text-xs font-medium text-black font-nunito capitalize">
                  {booking.passengers?.length} Person
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <DeluxRoomIcon />
                <span className="text-xs font-medium text-black font-nunito capitalize">
                  {booking.roomType}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-px bg-gray-200 mx-4 hidden md:block self-stretch"></div>

        {/* Right Side - Room Number and Email */}
        <div className="w-full md:w-auto flex flex-col justify-between items-start gap-4 md:items-end">
          {/* Room Number */}
          {booking.voucherStatus !== false ? (
            <div className="flex justify-between items-center w-full">
              <span className="font-bold font-nunito text-xs text-gray-800 flex justify-between">Room Number:-</span>
              <span className="font-normal font-nunito text-[10px]">
                {booking.rooms.map(room => (
                  <div key={room.id}>{room.roomId}</div>
                ))}
              </span>
            </div>
          ) : (
            <div className="flex justify-between items-center w-full">
              <span className="font-normal font-nunito text-base text-gray-800">Booking Code:-</span>
              <span className="font-bold font-nunito text-base ">{booking.bookingId}</span>
            </div>
          )}

          {/* Action Buttons */}
          {booking.voucherStatus !== false && (
            <div className="w-full flex justify-between items-center gap-2">
              <button className="min-w-[48%] cursor-pointer border border-[#001f50] text-[#001f50] px-4.5 py-2 text-xs font-semibold font-nunito rounded-lg hover:bg-[#001f501e] transition whitespace-nowrap">Change Hotel</button>
              <button onClick={() => setIsOpen(true)} className="min-w-[48%] cursor-pointer border border-[#001f50] text-[#001f50] px-4.5 py-2 text-xs font-semibold font-nunito rounded-lg hover:bg-[#001f501e] transition whitespace-nowrap">Cancel Hotel</button>
            </div>
          )}

          {/* Email Button */}
          <button
            onClick={handleResendConfirmation}
            className="cursor-pointer w-full flex items-center justify-center gap-1 text-xs font-roboto font-medium border border-[#FF6B6B] text-[#FF6B6B] px-5 py-2 rounded-lg 
             bg-white hover:bg-red-50 hover:text-[#e03a3a] 
             hover:shadow-md hover:border-[#e03a3a]
             transition-all duration-300 transform hover:scale-[1.02]"
          >
            <EmailIcon />
            Resend Confirmation Email
          </button>
          {booking.voucherStatus === false && (
            <div className="w-full flex justify-between items-center gap-2">
              <button className="min-w-[48%] p-[6px]  cursor-pointer w-full bg-gradient-to-b from-[#FF914D] to-[#F25C54] text-white px-6 py-[6px] font-roboto font-medium text-base rounded-lg hover:opacity-90 transition whitespace-nowrap" onClick={handlePayment}>
                Pay Now
              </button>

              <div className="inline-block bg-gradient-to-b from-[#FF914D] to-[#F25C54] p-[2px] rounded-lg">
                <button
                  onClick={() => setIsOpen(true)}
                  className="bg-white min-w-[48%] cursor-pointer px-6 py-1 text-base font-semibold font-nunito rounded-lg transition-all duration-300 whitespace-nowrap transform hover:scale-[1.02] hover:shadow-md"
                >
                  <span className="bg-gradient-to-b from-[#FF914D] to-[#F25C54] bg-clip-text text-transparent">
                    Cancel
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* View Details Button */}
          {booking.voucherStatus !== false && (
            <button onClick={() => setIsHotelDetailsOpen(true)} className="cursor-pointer w-full bg-[#FF6B6B] text-white px-5 py-2 font-roboto font-medium text-xs rounded-lg hover:bg-[#fc685b] transition">
              View Hotel Details
            </button>
          )}
        </div>
      </div>
      {
        isOpen && (
          <CancelReservationModal bookingHotel={booking} setBookings={setBookings} onClose={handleCloseCancleModal} />
        )
      }

      {
        isHotelDetailsOpen && (
          <HotelDetailsModal hotelDetails={booking} onClose={handleCloseHotelDetailsModal} />
        )
      }
      {isPaymentProcessing && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[9999] flex items-center justify-center">
          <div className="flex flex-col items-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7F50] mb-4"></div>
            <p className="text-lg font-medium">Confirming your booking, please wait...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function BookedHotelList({ activeFilter, onCountChange, setActiveFilter }: BookedHotelListProps) {
  const [bookings, setBookings] = useState<HotelBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<HotelBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [user] = useAtom(userAtom);

  function transformBookingData(data: any): HotelBooking[] {
    const bookings = Array.isArray(data) ? data : [data];

    return bookings.map((item) => ({
      ...item,
      rateConditions: JSON.parse(item.rateConditions),
      user: { ...item.user },
      passengers: item.passengers.map((p: any) => ({ ...p })),
    }));
  }

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const userId = user?.id;
        const response = await fetchHotelBookingHistory(userId);
        const transformed = transformBookingData(response.data);
        setBookings(transformed);
        setErrorMessage(null);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setErrorMessage("No hotel bookings found for this user.");
          setBookings([]);
        } else {
          console.error("Failed to fetch bookings", error);
          setErrorMessage("Failed to load bookings. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  useEffect(() => {
    const now = new Date();

    const filtered = bookings.filter(booking => {
      const checkIn = new Date(booking.checkInDate);

      if (activeFilter === "past") {
        return checkIn < now;
      }
      if (activeFilter === "upcoming") {
        return checkIn >= now;
      }
      if (activeFilter === "pending") {
        return booking.voucherStatus === false;
      }
      // for "all"
      return true;
    });

    setFilteredBookings(filtered);
    onCountChange(filtered.length, bookings.length);
  }, [bookings, activeFilter, onCountChange]);

  if (loading) return <div>Loading bookings...</div>;

  if (errorMessage)
    return <div className="text-center text-gray-500">{errorMessage}</div>;

  if (filteredBookings.length === 0 && bookings.length > 0)
    return (
      <div className="text-center text-gray-500">
        No bookings match the selected filter.
      </div>
    );

  if (bookings.length === 0)
    return <div className="text-center text-gray-500">No bookings available.</div>;

  return (
    <div className="space-y-4">
      {filteredBookings.map((booking, index) => (
        <div
          key={booking.id}
          className="animate-in slide-in-from-left duration-500"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <BookingCard booking={booking} setBookings={setBookings} setActiveFilter={setActiveFilter} />
        </div>
      ))}
    </div>
  );
}
