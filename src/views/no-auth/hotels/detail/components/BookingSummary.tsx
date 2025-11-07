"use client";

import { BookingSummaryProps } from "@/types/hotel.types";
import { formatAddress } from "@/utils/functions/formatAddress";
import React, { useEffect, useState } from "react";
import { FaUtensils } from "react-icons/fa";

const BookingSummary: React.FC<BookingSummaryProps> = ({
  rooms,
  roomQuantities,
  hotelSearchData,
  onBookNow,
  formatPrice,
  disabled,
  amount,
  prebook,
  prebookDataForRooms = {},
  prebookData,
  allPrebookData = {},
  bookingOption,
  setBookingOption
}) => {
  const formattedAddress = formatAddress(rooms[0].Address);
  
  const hasSelectedRefundableRoom = Object.keys(roomQuantities).some((roomIndexStr) => {
    const roomIndex = parseInt(roomIndexStr);
    const quantity = roomQuantities[roomIndex] || 0;
    if (quantity > 0 && prebookDataForRooms[roomIndex]) {
      return prebookDataForRooms[roomIndex].isRefundable === true;
    }
    return false;
  });

  const [hotelsInfo, setHotelsInfo] = useState<any[]>([]);

  useEffect(() => {
    if (!allPrebookData) return;

    const resultArray: any[] = [];

    Object.values(allPrebookData).forEach((hotelBlock: any) => {
      if (!hotelBlock?.HotelResult) return;

      const deadlines: string[] = [];
      let netAmount: number | null = null;

      hotelBlock.HotelResult.forEach((hotel: any) => {
        if (!hotel.Rooms) return;

        hotel.Rooms.forEach((room: any, roomIndex: number) => {
          if (roomIndex === 0 && typeof room.NetAmount === "number") {
            netAmount = room.NetAmount;
          }

          if (room.LastCancellationDeadline) {
            deadlines.push(room.LastCancellationDeadline);
          }


        });
      });

      let formattedDeadline: string | null = null;
      if (deadlines.length > 0) {
        const dateObjects = deadlines.map((d) => {
          const [day, month, rest] = d.split("-");
          const [year] = rest.split(" ");
          return new Date(`${year}-${month}-${day}`);
        });

        const latestDate = new Date(Math.max(...dateObjects.map((d) => d.getTime())));
        formattedDeadline = latestDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      resultArray.push({
        amount: netAmount,
        deadline: formattedDeadline,
      });
    });

    setHotelsInfo(resultArray);
  }, [allPrebookData]);

  return (
    <div className="lg:col-span-1">
      <div className="lg:sticky lg:top-6 z-30 flex flex-col gap-6">
        {/* Booking Summary Card */}
        <div className="shadow-2xl rounded-2xl mb-6 w-full mx-auto lg:max-w-none bg-white border-[1.5px] border-black/30 p-4 sm:p-6">
          <div className="bg-[#78797a23] p-4 rounded-[8px] font-nunito flex justify-center items-center text-sm mb-8">
            1K+ people booked this Hotel in last 3 months
          </div>
          <div className="mb-8">
            {Object.keys(allPrebookData || {}).length > 0 ? (
              Object.entries(allPrebookData ?? {}).map(([roomIndex, data]: [string, any]) => {
                const roomName =
                  data?.HotelResult?.[0]?.Rooms?.[0]?.Name || "Deluxe Room, 1 King Bed";
                return (
                  <h3
                    key={roomIndex}
                    className="text-base md:text-2xl font-extrabold text-black font-nunito capitalize mb-3"
                  >
                    {roomName}
                  </h3>
                );
              })
            ) : (
              <h3 className="text-base md:text-2xl font-extrabold text-black font-nunito capitalize mb-3">
                {prebookData?.HotelResult?.[0]?.Rooms?.[0]?.Name || "Deluxe Room, 1 King Bed"}
              </h3>
            )}
            <p className="text-sm md:text-[18px] font-medium font-nunito text-[#5f5e5e4d]">
              {rooms.length > 0 && rooms[0]?.Address
                ? formattedAddress
                : "Heritage Apt 1@Hauz Khas Village"}
            </p>
          </div>

          <div className="flex flex-col gap-2 mb-10">
            <div className="flex gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <g opacity="0.6">
                  <path
                    d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM9 14H7V12H9V14ZM13 14H11V12H13V14ZM17 14H15V12H17V14ZM9 18H7V16H9V18ZM13 18H11V16H13V18ZM17 18H15V16H17V18Z"
                    fill="black"
                  />
                </g>
              </svg>
              <span className="text-sm md:text-[18px] font-bold font-nunito">
                {hotelSearchData?.checkin && hotelSearchData?.checkout
                  ? (() => {
                    const checkinDate = new Date(hotelSearchData.checkin);
                    const checkoutDate = new Date(hotelSearchData.checkout);
                    const nights = Math.ceil(
                      (checkoutDate.getTime() - checkinDate.getTime()) /
                      (1000 * 60 * 60 * 24)
                    );

                    const formatDate = (date: Date) => {
                      const days = [
                        "Sun",
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                      ];
                      const months = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ];
                      return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]
                        }`;
                    };

                    return `${formatDate(checkinDate)} - ${formatDate(
                      checkoutDate
                    )} - ${nights} Night${nights > 1 ? "s" : ""}`;
                  })()
                  : "Sat, 19 Apr - Sun, 20 Apr - 1 Night"}
              </span>
            </div>
            <div className="flex gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <g opacity="0.6">
                  <path
                    d="M12 6C13.1 6 14 6.9 14 8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 8C10 6.9 10.9 6 12 6ZM12 16C14.7 16 17.8 17.29 18 18H6C6.23 17.28 9.31 16 12 16ZM12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                    fill="black"
                  />
                </g>
              </svg>
              <span className="text-sm md:text-[18px] font-bold font-nunito">
                {hotelSearchData?.rooms && hotelSearchData?.guests
                  ? `${hotelSearchData.rooms} Room${hotelSearchData.rooms > 1 ? "s" : ""}, ${hotelSearchData.guests} Guest${hotelSearchData.guests > 1 ? "s" : ""}`
                  : "1 Room, 2 Guest"}
              </span>
            </div>

            <div className="flex flex-col gap-2 ml-[3px]">
              {Object.keys(allPrebookData ?? {}).length > 0 ? (
                Object.entries(allPrebookData ?? {}).map(([roomIndex, data]) => {
                  const mealType =
                    data?.HotelResult?.[0]?.Rooms?.[0]?.MealType || "Room Only";
                  return (
                    <div
                      key={roomIndex}
                      className="flex items-center gap-4"
                    >
                      {/* Fork & Knife Icon */}
                      <FaUtensils fill="#6b6b6b" />

                      <span className="text-sm md:text-[18px] font-bold font-nunito">
                        {mealType}
                      </span>
                    </div>
                  );
                })
              ) : (
                prebookData && (
                  <div className="flex items-center gap-4">
                    {/* Fork & Knife Icon */}
                    <FaUtensils fill="#6b6b6b" />

                    <span className="text-sm md:text-[18px] font-bold font-nunito">
                      {prebookData.HotelResult?.[0]?.Rooms?.[0]?.MealType || "Room Only"}
                    </span>
                  </div>
                )
              )}
            </div>

          </div>

          {/* Pricing Details - Only show when quantity is added and prebook is successful */}
          {(() => {
            const hasSelectedRooms = Object.values(roomQuantities).some(
              (quantity) => quantity > 0
            );

            if (!hasSelectedRooms || prebook) {
              return null;
            }

            const guestCount = hotelSearchData?.guests || 1;
            const roomGuestText = `${guestCount} Guest${guestCount > 1 ? "s" : ""}`;

            let nightsText = "1 Night";
            if (hotelSearchData?.checkin && hotelSearchData?.checkout) {
              const checkinDate = new Date(hotelSearchData.checkin);
              const checkoutDate = new Date(hotelSearchData.checkout);
              const nights = Math.ceil(
                (checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24)
              );

              nightsText = `${nights} Night${nights > 1 ? "s" : ""}`;
            }

            return (
              <>
                <div className="flex flex-col gap-4 mb-4">
                  <div className="flex justify-between">
                    <h6 className="text-xs md:text-base font-nunito font-normal">
                      Room price for {nightsText} & {roomGuestText}
                    </h6>
                    <span className="text-base md:text-xl font-nunito font-bold">
                      {(() => {
                        let combinedBasePrice = 0;
                        let selectedRoomCount = 0;

                        Object.keys(roomQuantities).forEach((roomIndexStr) => {
                          const roomIndex = parseInt(roomIndexStr);
                          const quantity = roomQuantities[roomIndex] || 0;

                          if (quantity > 0 && rooms[0]?.Rooms?.[roomIndex]) {
                            const room = rooms[0].Rooms[roomIndex];
                            const basePrice =
                              room?.DayRates?.[0]?.[0]?.BasePrice || 0;
                            combinedBasePrice += basePrice * quantity;
                            selectedRoomCount += quantity;
                          }
                        });

                        if (selectedRoomCount > 0) {
                          return `Rs. ${combinedBasePrice.toLocaleString(
                            "en-IN",
                            {
                              maximumFractionDigits: 0,
                            }
                          )}`;
                        }

                        return rooms.length > 0 &&
                          rooms[0]?.Rooms?.length > 0 &&
                          rooms[0].Rooms[0]?.DayRates?.length > 0 &&
                          rooms[0].Rooms[0].DayRates[0]?.length > 0
                          ? `Rs. ${rooms[0].Rooms[0].DayRates[0][0].BasePrice}`
                          : "Rs. 8700";
                      })()}
                    </span>
                  </div>
                </div>

                {/* Hotel Details Timeline */}
                {!hasSelectedRefundableRoom && (
                  <div className="flex flex-col gap-6 mb-6">
                    <div className="flex justify-between items-center border-t border-black/40 pt-6">
                      <span className="text-base md:text-xl text-black font-nunito capitalize font-semibold">
                        Payable Amount
                      </span>
                      <span className="text-base md:text-[28px] font-bold text-black font-nunito">
                        {(() => {
                          let combinedNetAmount = 0;
                          let selectedRoomCount = 0;

                          Object.keys(roomQuantities).forEach((roomIndexStr) => {
                            const roomIndex = parseInt(roomIndexStr);
                            const quantity = roomQuantities[roomIndex] || 0;

                            if (quantity > 0) {
                              const roomPrebookData =
                                prebookDataForRooms[roomIndex];
                              if (roomPrebookData) {
                                combinedNetAmount +=
                                  roomPrebookData.netAmount * quantity;
                                selectedRoomCount += quantity;
                              } else if (rooms[0]?.Rooms?.[roomIndex]) {
                                const room = rooms[0].Rooms[roomIndex];
                                const basePrice =
                                  room?.DayRates?.[0]?.[0]?.BasePrice || 0;
                                combinedNetAmount += basePrice * quantity;
                                selectedRoomCount += quantity;
                              }
                            }
                          });

                          if (selectedRoomCount > 0) {
                            return formatPrice(combinedNetAmount);
                          }

                          return formatPrice(amount);
                        })()}
                      </span>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
          {hasSelectedRefundableRoom && (

            <div className="flex justify-between items-center border-t border-black/40">
              <div className="mt-6 mb-3">
                <h4 className="text-sm mb-2">Booking Options</h4>
                <div className="flex flex-col gap-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bookingOption"
                      value="reserve"
                      checked={bookingOption === "reserve"}
                      onChange={() => setBookingOption("reserve")}
                      className="form-radio accent-[#014569] w-3 h-3 scale-130"
                    // onChange handler if needed
                    />
                    <span className="text-base font-medium">RESERVE NOW, PAY LATER</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bookingOption"
                      value="instant"
                      checked={bookingOption === "instant"}
                      onChange={() => setBookingOption("instant")}
                      className="form-radio accent-[#014569] w-3 h-3 scale-130"
                    // onChange handler if needed
                    />
                    <span className="text-base font-medium">INSTANT BOOKING, PAY NOW</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {bookingOption === "instant" && hasSelectedRefundableRoom && (
            <div className="flex flex-col gap-6 mb-6">
              <div className="flex justify-between items-center border-t border-black/40 pt-6">
                <span className="text-base md:text-xl text-black font-nunito capitalize font-semibold">
                  Payable Amount
                </span>
                <span className="text-base md:text-[28px] font-bold text-black font-nunito">
                  {(() => {
                    let combinedNetAmount = 0;
                    let selectedRoomCount = 0;

                    Object.keys(roomQuantities).forEach((roomIndexStr) => {
                      const roomIndex = parseInt(roomIndexStr);
                      const quantity = roomQuantities[roomIndex] || 0;

                      if (quantity > 0) {
                        const roomPrebookData =
                          prebookDataForRooms[roomIndex];
                        if (roomPrebookData) {
                          combinedNetAmount +=
                            roomPrebookData.netAmount * quantity;
                          selectedRoomCount += quantity;
                        } else if (rooms[0]?.Rooms?.[roomIndex]) {
                          const room = rooms[0].Rooms[roomIndex];
                          const basePrice =
                            room?.DayRates?.[0]?.[0]?.BasePrice || 0;
                          combinedNetAmount += basePrice * quantity;
                          selectedRoomCount += quantity;
                        }
                      }
                    });

                    if (selectedRoomCount > 0) {
                      return formatPrice(combinedNetAmount);
                    }

                    return formatPrice(amount);
                  })()}
                </span>
              </div>
            </div>
          )}

          {/* Due Today Section */}
          {bookingOption === "reserve" && hasSelectedRefundableRoom && !prebook && (
            <div className=" border-t border-black/40 pt-3">
              <div className="flex justify-between items-center mb-2">
                <h5 className="text-lg font-semibold">Due Today</h5>
                <p className="text-lg font-semibold">₹0</p>
              </div>
              <div className="space-y-2">
                {hotelsInfo.length > 0 ? (
                  hotelsInfo.map((info, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center mb-2"
                    >
                      <p className="text-lg font-semibold text-[#FF7F50]">
                        Due By {info.deadline ?? "N/A"}
                      </p>
                      <p className="text-xl font-bold text-[#FF7F50]">
                        ₹{info.amount ? info.amount.toFixed(2) : "N/A"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-lg font-semibold text-[#FF7F50]">Due By N/A</p>
                    <p className="text-xl font-bold text-[#FF7F50]">₹N/A</p>
                  </div>
                )}
              </div>

              {/* Full-width button */}
              <button
                onClick={onBookNow}
                type="button"
                className={`w-full px-8 py-2 font-medium text-base font-roboto rounded-xl
          transition-all duration-200 shadow-md 
              bg-[#FF7F50] text-white hover:bg-[#FF5555] transform hover:scale-105 hover:shadow-lg active:scale-95
          `}
              >
                Reserve Now
              </button>

              {/* Payment notice */}
              <p className="mt-3 text-xs text-[#014569]">
                Payment must be completed by {hotelsInfo[0]?.deadline ?? "the due date"}  . to secure your booking. Reservations not paid by this date will be automatically cancelled.
              </p>
            </div>
          )}


          {/* Proceed to Pay Button - Show when any room is selected and not loading */}
          {(bookingOption === "instant" || !hasSelectedRefundableRoom) && (() => {
            const totalQuantity = Object.values(roomQuantities).reduce(
              (sum, qty) => sum + qty,
              0
            );

            // Show button only if any room is selected and not loading
            if (totalQuantity === 0 || prebook) return null;

            return (
              <div className="space-y-2">
                <button
                  onClick={onBookNow}
                  disabled={disabled}
                  className={`w-full px-8 py-3 font-medium text-base font-roboto rounded-xl
          transition-all duration-200 shadow-md ${disabled
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-[#FF7F50] text-white hover:bg-[#FF5555] transform hover:scale-105 hover:shadow-lg active:scale-95"
                    }`}
                >
                  {disabled ? "Room Not Available" : "Proceed to Pay"}
                </button>
              </div>
            );
          })()}

          {/* Loading Indicator - Show when checking room availability */}
          {(() => {
            const totalQuantity = Object.values(roomQuantities).reduce(
              (sum, qty) => sum + qty,
              0
            );
            if (totalQuantity === 0) return null;

            // Check if prebook API was successful and netAmount is available
            const isPrebookSuccessful = amount > 0;

            // Show loading indicator when quantity is added but prebook is not successful yet
            if (!isPrebookSuccessful && prebook) {
              return (
                <div className="flex flex-col items-center justify-center py-8 mb-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7F50] mb-4"></div>
                  <p className="text-lg font-medium text-black font-nunito">
                    Checking room availability...
                  </p>
                  <p className="text-sm text-gray-600 font-nunito mt-2">
                    Please wait while we verify availability and pricing
                  </p>
                </div>
              );
            }

            return null;
          })()}
        </div>

        {/* Promo Codes Section */}
        <div className="hidden md:flex flex-col gap-6 mb-8">
          <h3 className="text-xl md:text-3xl font-bold text-black font-raleway capitalize">
            Select A Promo Code
          </h3>

          <div className="flex flex-col gap-6">
            {[
              {
                code: "SAVE10",
                discount: "10% Off",
                description: "Save INR 2k on This Booking",
                maxDiscount: "INR 4k",
                minBooking: "20k",
              },
              {
                code: "WELCOME20",
                discount: "20% Off",
                description: "Welcome Discount on First Booking",
                maxDiscount: "INR 5k",
                minBooking: "25k",
              },
              {
                code: "FLASH15",
                discount: "15% Off",
                description: "Flash Sale - Limited Time Offer",
                maxDiscount: "INR 3k",
                minBooking: "15k",
              },
            ].map((promo, index) => (
              <div
                key={index}
                className={`flex items-stretch border border-black/30 rounded-xl bg-white ${index === 0
                  ? "shadow-[0px_2px_16px_0px_rgba(1,59,149,0.32)]"
                  : ""
                  } hover:shadow-lg transition-shadow overflow-hidden`}
              >
                <div className="flex items-center justify-center w-[76px] bg-[#014569] relative">
                  <div className="text-white text-sm md:text-lg font-semibold font-nunito whitespace-nowrap transform -rotate-90 py-3 px-6">
                    {promo.discount}
                  </div>
                </div>

                <div className="flex-1 p-3 pr-4 pl-3">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-0.5">
                      <h4 className="text-sm md:text-base font-bold text-black font-nunito capitalize">
                        {promo.code}
                      </h4>
                      <p className="text-xs md:text-sm font-medium text-black font-nunito capitalize">
                        {promo.description}
                      </p>
                    </div>
                    <button className="text-base md:text-lg font-bold text-[#FF7F50] font-nunito capitalize hover:text-[#FF5555] transition-colors">
                      Apply
                    </button>
                  </div>
                  <p className="text-xs text-black font-nunito capitalize">
                    Maximum Discount Up To {promo.maxDiscount} On Booking Above{" "}
                    {promo.minBooking}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
