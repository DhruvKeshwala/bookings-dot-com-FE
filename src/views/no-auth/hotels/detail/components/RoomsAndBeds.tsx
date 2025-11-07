"use client";

import { useEffect, useRef, useState } from "react";
import { amenityIcons } from "../amenityIcons";
import { RoomsAndBedsProps, RoomType } from "@/types/hotel.types";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import Image from "next/image";

export default function RoomsAndBeds({
  rooms,
  roomQuantities,
  onIncrementQuantity,
  onDecrementQuantity,
}: RoomsAndBedsProps) {

  type TruncatedTooltipTextProps = {
    text: string;
    maxLength?: number;
    className?: string;
  };


  function TruncatedTooltipText({
    text,
    maxLength = 10,
    className = "",
  }: TruncatedTooltipTextProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const containerRef = useRef<HTMLSpanElement>(null);

    const handleClick = () => {
      setShowTooltip((prev) => !prev);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };

    useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const isTruncated = text.length > maxLength;
    const displayedText = isTruncated ? `${text.slice(0, maxLength)}...` : text;

    return (
      <span
        ref={containerRef}
        className={`relative inline-block cursor-pointer ${className}`}
        onClick={handleClick}
      >
        <span className="block truncate">{displayedText}</span>

        {showTooltip && isTruncated && (
          <div className="absolute top-full mt-1 left-0 bg-white text-black text-xs px-2 py-1 rounded shadow-lg w-max max-w-xs whitespace-normal break-words z-[9999]">
            {text}
          </div>
        )}
      </span>
    );
  }

  const RoomName = ({ name }: { name: string }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkIsMobile = () => setIsMobile(window.innerWidth <= 768);
      checkIsMobile();
      window.addEventListener("resize", checkIsMobile);
      return () => window.removeEventListener("resize", checkIsMobile);
    }, []);

    const handleClick = () => {
      if (isMobile) {
        setShowTooltip((prev) => !prev);
      }
    };

    return (
      <div className="relative inline-block">
        <h4
          className="text-md md:text-xl font-bold text-black font-nunito leading-5 text-left cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap max-w-[220px]"
          title={!isMobile ? name : undefined}
          onClick={handleClick}
        >
          {name}
        </h4>

        {showTooltip && isMobile && (
          <div className="absolute left-0 bg-white border border-gray-300 text-sm text-black p-2 rounded shadow-md z-50 w-max max-w-xs whitespace-normal">
            {name}
          </div>
        )}
      </div>
    );
  };
  const swiperRef = useRef<any>(null);
  const [activeHotelSlideIndex, setActiveHotelSlideIndex] = useState(0);


  function useResponsiveFlags() {
    const [isMobileView, setIsMobileView] = useState(false);
    const [isSmallMobileView, setIsSmallMobileView] = useState(false);

    useEffect(() => {
      const handleResize = () => {
        const width = window.innerWidth;

        setIsSmallMobileView(width < 1023);
        setIsMobileView(width >= 1023 && width < 1240);
      };

      handleResize();

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return { isMobileView, isSmallMobileView };
  }

  const { isMobileView, isSmallMobileView } = useResponsiveFlags();

  const RoomCard = (hotel: any, room: any, roomIndex: number) => {
    const hotelImage =
      "https://cdn.builder.io/api/v1/image/assets/TEMP/5056b1d1c5e61f48e1bea98f54039548a277c27e?width=774";

    const hotelAmenities = hotel?.HotelFacilities;
    // const hotelRating = hotel?.HotelRating ?? "8.9";
    const formatPrice = (price: number) =>
      `₹${price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
    const totalPrice = room.TotalFare;

    return (
      <div
        key={roomIndex}
        className="group transition-all duration-300 ease-in-out flex flex-col p-3 gap-3 justify-between border border-black/20 rounded-2xl bg-white cursor-pointer hover:border-[#FF7F50]/40 hover:shadow-md hover:-translate-y-0.5 h-full"
      >
        {/* Image */}
        <div className="relative h-[185px] rounded-2xl overflow-hidden">
          <img
            src={hotelImage}
            alt={hotel.HotelName?.toString()}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Room Info */}
        {room?.IsRefundable && (
          <div className="flex items-center gap-1 mb-1">
            <Image
              src="/icons/percentage.svg"
              alt="Refundable percentage icon"
              width={25}
              height={25}
            />
            <span className="text-[#ff6e6a] font-bold text-[16px]">
              Buy Now, Pay Later for ₹0
            </span>
          </div>
        )}
        <h3 className="font-nunito text-[18px] font-bold text-[#1f2937] group-hover:text-[#FF914D] transition-colors duration-300">
          <TruncatedTooltipText
            text={room.Name?.[0]}
            maxLength={25}
            className="font-nunito text-[18px] font-bold text-[#1f2937] group-hover:text-[#FF914D] transition-colors duration-300"
          />
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 mb-2">
          {hotelAmenities
            ?.filter((amenity: any) => amenity.length <= 25)
            .slice(0, 8)
            .map((amenity: any, idx: number) => (
              <div className="flex items-center gap-1" key={idx}>
                <div className="w-4 h-4 text-black flex items-center justify-center">
                  {amenityIcons[amenity] || (
                    <svg className="w-3 h-3" viewBox="0 0 24 25" fill="none">
                      <path
                        d="M9.99997 16.185L6.70697 12.892L5.29297 14.306L9.99997 19.013L19.707 9.30603L18.293 7.89203L9.99997 16.185Z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-[10px] font-normal text-gray-700 whitespace-normal break-words">
                  {amenity}
                </span>
              </div>
            ))}
        </div>

        {/* Bottom */}
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center md:justify-end gap-2 ">
            {/* <div className="bg-[#218701] text-white px-3 py-2 h-full rounded text-sm xl:text-md flex items-center font-medium text-center">
              {(hotelRating)}
            </div> */}
            <div className="flex flex-col">
              <TruncatedTooltipText
                text={room.RoomPromotion?.[0]?.split("|")[0] || "Exceptional"}
                maxLength={10}
                className="text-base xl:text-2xl font-light leading-tight text-black"
              />
              <TruncatedTooltipText
                text={
                  room?.CancelPolicies?.[0]?.ChargeType === "Percentage"
                    ? `${rooms[0]?.Rooms[0]?.CancelPolicies?.[0]?.CancellationCharge}% Cancellation Fee`
                    : "No Cancellation Fee"
                }
                maxLength={15}
                className="text-xs xl:text-base text-black font-light"
              />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg font-semibold text-black">
              {formatPrice(totalPrice)}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onDecrementQuantity(roomIndex)}
                className="flex w-6 h-6 items-center justify-center rounded bg-[#014569] hover:bg-[#013855] transition-colors"
              >
                <span className="text-white font-roboto text-lg font-normal leading-none">-</span>
              </button>
              <div className="flex w-8 h-6 items-center justify-center rounded border border-[#014569] bg-white">
                <span className="text-[#014569] font-nunito text-sm font-normal">
                  {roomQuantities[roomIndex] || 0}
                </span>
              </div>
              <button
                onClick={() => onIncrementQuantity(roomIndex)}
                className="flex w-6 h-6 items-center justify-center rounded bg-[#014569] hover:bg-[#013855] transition-colors"
              >
                <span className="text-white font-roboto text-lg font-normal leading-none">+</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };


  function renderMidSizedMobileView() {
    return (
      <div className="flex flex-col gap-4">
        {rooms.length > 0 &&
          rooms[0]?.Rooms?.map((room: RoomType, roomIndex: number) => {
            const galleryImages = [
              "https://cdn.builder.io/api/v1/image/assets/TEMP/5056b1d1c5e61f48e1bea98f54039548a277c27e?width=774"
            ];
            const hotelName = room.Name?.[0] ?? "Room";
            // const hotelRating = rooms[0]?.HotelRating ?? "8.9";
            const hotelAmenities = rooms[0]?.HotelFacilities;
            const formatPrice = (price: number) =>
              `₹${price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
            const perNightBasePrice =
              room.DayRates?.[0]?.[0]?.BasePrice ?? 0;
            const totalPrice = room.TotalFare;
            return (
              <div
                key={room.BookingCode || roomIndex}
                onClick={() => console.log("Handle room selection")} // replace with your logic
                className="font-nunito flex flex-row bg-foreground border border-[#e5e7eb] rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group"
              >
                {/* Room Image */}
                <div
                  className="w-[180px] px-[16px] py-[12px] overflow-visible relative flex-shrink-0 cursor-pointer bg-cover bg-center bg-blend-darken bg-[#00000027]"
                  style={{ backgroundImage: `url('${galleryImages[0]}')` }}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>

                  {/* Rating */}
                  <div className="flex items-center md:justify-end gap-2 md:text-right mr-[-7px]">
                    {/* <div className="bg-[#218701] text-white px-2 py-1 h-full rounded text-sm xl:text-md flex items-center font-medium  text-center">
                      {(hotelRating)}
                    </div> */}
                    <div className="flex flex-col">
                      <TruncatedTooltipText
                        text={room.RoomPromotion?.[0]?.split("|")[0] || "Exceptional"}
                        maxLength={15}
                        className="text-base xl:text-2xl font-light leading-tight text-white"
                      />
                      <TruncatedTooltipText
                        text={
                          rooms[0]?.Rooms[0]?.CancelPolicies?.[0]?.ChargeType === "Percentage"
                            ? `${rooms[0]?.Rooms[0]?.CancelPolicies?.[0]?.CancellationCharge}% Cancellation Fee`
                            : "No Cancellation Fee"
                        }
                        maxLength={18}
                        className="text-xs xl:text-base text-white font-light"
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-[2] px-1 md:px-4 py-2 gap-2">
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex flex-col gap-2">
                      {room?.IsRefundable && (
                        <div className="flex items-center gap-1 mb-1">
                          <Image
                            src="/icons/percentage.svg"
                            alt="Refundable percentage icon"
                            width={25}
                            height={25}
                          />
                          <span className="text-[#ff6e6a] font-bold text-[16px]">
                            Buy Now, Pay Later for ₹0
                          </span>
                        </div>
                      )}
                      <h3 className="font-nunito text-[18px] font-bold text-[#1f2937] group-hover:text-[#FF914D] transition-colors duration-300">
                        <TruncatedTooltipText
                          text={hotelName}
                          maxLength={38}
                          className="font-nunito text-[18px] font-bold text-[#1f2937] group-hover:text-[#FF914D] transition-colors duration-300"
                        />
                      </h3>

                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 mb-4">
                      {hotelAmenities
                        ?.filter((amenity: any) => amenity.length <= 25)
                        .slice(0, 6)
                        .map((amenity: any, idx: number) => (
                          <div className="flex items-center gap-1" key={idx}>
                            <div className="w-4 h-4 text-black flex items-center justify-center">
                              {amenityIcons[amenity] || (
                                <svg className="w-3 h-3" viewBox="0 0 24 25" fill="none">
                                  <path
                                    d="M9.99997 16.185L6.70697 12.892L5.29297 14.306L9.99997 19.013L19.707 9.30603L18.293 7.89203L9.99997 16.185Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              )}
                            </div>
                            <span className="text-[10px] font-normal text-gray-700 whitespace-normal break-words">
                              {amenity}
                            </span>
                          </div>
                        ))}
                    </div>

                  </div>

                  {/* Pricing */}
                  <div className="flex flex-col lg:flex-row items-end justify-between gap-2 lg:gap-4 w-full lg:w-auto">
                    {/* 💰 Price Section */}
                    <div className="flex flex-col items-start text-right">
                      <span className="text-base font-bold text-[#1f2937]">
                        {formatPrice(perNightBasePrice)}
                      </span>
                      <span className="text-xs xl:text-md">
                        {formatPrice(totalPrice)} total
                      </span>
                      <span className="text-xs xl:text-sm">
                        Includes taxes & fees
                      </span>
                    </div>

                    {/* ➕ Quantity Selector */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDecrementQuantity(roomIndex)}
                        className="flex w-6 h-6 items-center justify-center rounded bg-[#014569] hover:bg-[#013855] transition-colors"
                      >
                        <span className="text-white font-roboto text-lg font-normal leading-none">-</span>
                      </button>
                      <div className="flex w-8 h-6 items-center justify-center rounded border border-[#014569] bg-white">
                        <span className="text-[#014569] font-nunito text-sm font-normal">
                          {roomQuantities[roomIndex] || 0}
                        </span>
                      </div>
                      <button
                        onClick={() => onIncrementQuantity(roomIndex)}
                        className="flex w-6 h-6 items-center justify-center rounded bg-[#014569] hover:bg-[#013855] transition-colors"
                      >
                        <span className="text-white font-roboto text-lg font-normal leading-none">+</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-4 font-raleway text-black">
        Rooms & beds
      </h3>
      {isSmallMobileView ? (
        <div>
          <Swiper
            modules={[Pagination]}
            spaceBetween={32} // same as margin-right in your inspect
            slidesPerView="auto" // allows manual width
            pagination={{
              clickable: true,
              el: ".custom-swiper-pagination",
            }}
            grabCursor={true}
            onSlideChange={(swiper) => setActiveHotelSlideIndex(swiper.activeIndex)}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            className="w-full"
          >
            {rooms.flatMap((hotel, hotelIndex) =>
              hotel.Rooms?.map((room: any, roomIndex: number) => {
                const reactKey = `${hotelIndex}-${roomIndex}`;
                return (
                  <SwiperSlide key={reactKey} style={{ width: '320px' }}>
                    {RoomCard(hotel, room, roomIndex)} {/* number here */}
                  </SwiperSlide>
                );
              })
            )}
          </Swiper>

          {/* Swiper Default Pagination (visible only on md+ screens) */}
          <div className="custom-swiper-pagination mt-6 hidden md:flex justify-center" />

          {/* Custom Pagination Dots (visible only on small screens) */}
          <div className="flex justify-center items-center gap-2 mt-6 md:hidden">
            {rooms?.map((_, index) => (
              <button
                key={index}
                onClick={() => swiperRef.current?.slideTo(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeHotelSlideIndex
                  ? 'bg-[#00B4D8] scale-110'
                  : 'bg-gray-300'
                  }`}
              />
            ))}
          </div>
        </div>
      ) : isMobileView ? (
        renderMidSizedMobileView()
      ) : (
        <div className={`flex ${isSmallMobileView ? "flex-row" : "flex-col"} gap-4`}>
          {rooms.length > 0 &&
            rooms[0]?.Rooms?.map((room: RoomType, roomIndex: number) => {
              const perNightBasePrice =
                room.DayRates?.[0]?.[0]?.BasePrice ?? 0;

              const totalPrice = room.TotalFare;

              return (
                <div
                  key={room.BookingCode || roomIndex}
                  className="flex p-4 gap-3 border border-black/20 rounded-2xl bg-white hover:border-[#FF7F50]/40 hover:shadow-md transition-all duration-200 flex-col lg:flex-row"
                >
                  {/* Room Image */}
                  <div className="w-full flex-shrink-0 lg:w-[200px]">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/5056b1d1c5e61f48e1bea98f54039548a277c27e?width=774"
                      alt={room.Name[0]}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Room Details Section */}
                  <div className="flex-1 flex flex-col gap-3 justify-between">
                    <div className="flex flex-col gap-2">
                      {room?.IsRefundable && (
                        <div className="flex items-center gap-1 mb-1">
                          <Image
                            src="/icons/percentage.svg"
                            alt="Refundable percentage icon"
                            width={25}
                            height={25}
                          />
                          <span className="text-[#ff6e6a] font-bold text-[16px]">
                            Buy Now, Pay Later for ₹0
                          </span>
                        </div>
                      )}
                      <RoomName name={room.Name[0]} />

                      {/* Amenities Grid */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {rooms[0].HotelFacilities?.filter(
                          (amenity: any) => amenity.length <= 25
                        )
                          .slice(0, 10)
                          .map((amenity: any, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-4 h-4 text-black flex items-center justify-center">
                                {amenityIcons[amenity] || (
                                  <svg
                                    className="w-3 h-3"
                                    viewBox="0 0 24 25"
                                    fill="none"
                                  >
                                    <path
                                      d="M9.99997 16.185L6.70697 12.892L5.29297 14.306L9.99997 19.013L19.707 9.30603L18.293 7.89203L9.99997 16.185Z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span className="text-xs text-black font-nunito truncate">
                                {amenity}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Price, Rating and Quantity (Right Section) */}
                  <div className="flex flex-col items-end justify-between w-full lg:w-auto gap-3 lg:pl-4 pt-2 lg:pt-0">
                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="text-start">
                        <TruncatedTooltipText
                          text={room.RoomPromotion?.[0]?.split("|")[0] || "Exceptional"}
                          maxLength={15}
                          className="text-base font-light font-semibold leading-tight text-black"
                        />
                        <div>
                          <TruncatedTooltipText
                            text={
                              rooms[0]?.Rooms[0]?.CancelPolicies?.[0]?.ChargeType === "Percentage"
                                ? `${rooms[0]?.Rooms[0]?.CancelPolicies?.[0]?.CancellationCharge}% Cancellation Fee`
                                : "No Cancellation Fee"
                            }
                            maxLength={18}
                            className="text-xs xl:text-base text-black font-light mt-[-5px]"
                          />
                        </div>
                      </div>
                      {/* <div className="bg-[#218701] rounded px-2 py-1 text-center">
                        <span className="text-xs font-medium text-white font-roboto">
                          {rooms[0]?.HotelRating || "8.9"}
                        </span>
                      </div> */}
                    </div>

                    {/*  Price + Total (Stacked neatly using flex-col) */}
                    <div className="flex flex-col items-end text-right">
                      {/* Per Night Price */}
                      <div className="flex ">

                        <span className="text-base text-black font-nunito">
                          ₹{perNightBasePrice.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </span>
                        <div className="text-base text-black font-nunito ml-1">per night</div>
                      </div>

                      {/* Total Price */}
                      <div className="text-lg font-bold text-black font-nunito">
                        ₹{totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })} total
                      </div>
                      <div className="text-xs text-gray-500 font-nunito">
                        Includes taxes & fees
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDecrementQuantity(roomIndex)}
                        className="flex w-6 h-6 items-center justify-center rounded bg-[#014569] hover:bg-[#013855] transition-colors"
                      >
                        <span className="text-white font-roboto text-lg font-normal leading-none">
                          -
                        </span>
                      </button>
                      <div className="flex w-8 h-6 items-center justify-center rounded border border-[#014569] bg-white">
                        <span className="text-[#014569] font-nunito text-sm font-normal">
                          {roomQuantities[roomIndex] || 0}
                        </span>
                      </div>
                      <button
                        onClick={() => onIncrementQuantity(roomIndex)}
                        className="flex w-6 h-6 items-center justify-center rounded bg-[#014569] hover:bg-[#013855] transition-colors"
                      >
                        <span className="text-white font-roboto text-lg font-normal leading-none">
                          +
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}