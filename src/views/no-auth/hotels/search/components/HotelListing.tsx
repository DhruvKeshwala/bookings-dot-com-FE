"use client";

import { useEffect, useState } from "react";
import ImageGallery from "./ImageGallery";
import { HotelListingProps } from "@/types/hotel.types";
import { calculateDistanceInKm } from "@/utils/functions/distanceUtils";
import Image from "next/image";

// Converts hotel rating text (e.g., 'ThreeStar') to a number
function hotelRatingTextToNumber(ratingText?: string): number {
  if (!ratingText) return 0;
  const map: Record<string, number> = {
    OneStar: 1,
    TwoStar: 2,
    ThreeStar: 3,
    FourStar: 4,
    FiveStar: 5,
    All: 10
  };
  return map[ratingText] || 0;
}

export default function HotelListing({
  hotel,
  allHotelCodes,
  searchData,
  allHotels
}: HotelListingProps) {
  console.log("Hotels details :- ", hotel)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  
  const formatPrice = (price: number, currency: string = "INR") => {
    const userLocale = navigator.language || "en-US";
    return new Intl.NumberFormat(userLocale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    console.log("All hotel codes:", allHotelCodes);
    console.log("Search data:", searchData);
  }, []);


  const handleChooseRoom = (e: React.MouseEvent) => {
    e.stopPropagation();

    sessionStorage.setItem("hotelSearchData", JSON.stringify(searchData));

    const hotelCode = hotel?.HotelCode;

    // Limit recommended hotels to 10 (excluding selected one)
    const recommended = allHotels
      .filter(h => h.HotelCode !== hotelCode)
      .slice(0, 10);

    // Keep only the selected hotel in rooms
    const selectedRoomData = allHotels.find(h => h.HotelCode === hotelCode);

    const fullHotelData = {
      rooms: selectedRoomData ? [selectedRoomData] : [],
      recommended,
      searchData,
    };

    sessionStorage.setItem("hotel_data", JSON.stringify(fullHotelData));
    sessionStorage.setItem("selectedHotelCode", hotelCode || "");

    if (hotelCode) {
      window.open(`/hotels/${hotelCode}`, "_blank");
    }
  };


  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking image
    setIsGalleryOpen(true);
  };

  // Gallery images - use hotel.images if available, otherwise check Rooms[0].Images, then hotel.image, then fallback
  const defaultImage = "/assets/stories/transition_page_image.png";
  let galleryImages: string[] = [];

  // Gallery images - check hotel.Images (capital I), fallback to Rooms[0].Images, etc.
  if (hotel.Images && hotel.Images.length > 0) {
    galleryImages = hotel.Images;
  } else if (hotel.Rooms?.[0]?.Images && hotel.Rooms[0].Images.length > 0) {
    galleryImages = hotel.Rooms[0].Images;
  } else if (hotel.image) {
    galleryImages = [hotel.image];
  } else {
    galleryImages = [defaultImage];
  }


  // Fallbacks for real API data
  const hotelName = hotel.name || hotel.HotelName || 'N/A';
  const hotelRating = hotel.HotelRating || hotel.Rooms?.[0]?.Rating || hotelRatingTextToNumber(hotel.HotelRating) || 0;
  const hotelReviewsCount = hotel.reviewsCount ? `${hotel.reviewsCount} Reviews` : '';
  const hotelAmenities = hotel.HotelFacilities || [];
  const hotelPrice =
    hotel.price ||
    hotel.Rooms?.[0]?.DayRates?.[0]?.[0]?.BasePrice ||
    0;
  const hotelTotalPrice = hotel.totalPrice || hotel.Rooms?.[0]?.TotalFare || 0;
  const hotelOriginalPrice = hotel.originalPrice || hotel.Rooms?.[0]?.PublishedFare;
  const shouldShowHotelDetails = Array.isArray(hotel?.HotelFacilities) && hotel.HotelFacilities.length > 0;

  useEffect(() => {
    const airportDataFromSession = sessionStorage.getItem("airportData");
    if (!airportDataFromSession) return;

    const airportData:any = JSON.parse(airportDataFromSession);
    const airportLat:any = (airportData && airportData.length > 0 && airportData[0] && airportData[0].latitude_deg) ? parseFloat(airportData[0].latitude_deg) : 0;
    const airportLon:any = (airportData&& airportData.length > 0 && airportData[0] && airportData[0].longitude_deg)  ? parseFloat(airportData[0].longitude_deg) : 0;

    const [hotelLatStr, hotelLonStr] = hotel.Map?.split("|") ?? ["0", "0"];
    const hotelLat = parseFloat(hotelLatStr);
    const hotelLon = parseFloat(hotelLonStr);
    
    const calculatedDistance = calculateDistanceInKm(
      airportLat,
      airportLon,
      hotelLat,
      hotelLon
    );

    setDistance(calculatedDistance);
  }, [hotel]);

  const refundableValue = sessionStorage.getItem("refundable");
  const isRefundable = refundableValue === "true";

  const isRoomRefundable = hotel.Rooms?.some((room: any) => room?.IsRefundable === true);

  return (
    <>
      {shouldShowHotelDetails && (
        <>
          <div
            className="font-nunito hidden md:flex flex-col md:flex-row p-4 bg-foreground border border-[#e5e7eb] rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group"
          >
            {/* Hotel Image */}
            <div
              className="w-[180px] h-[180px] rounded-2xl overflow-hidden relative flex-shrink-0 cursor-pointer"
              onClick={handleImageClick}
            >
              <img
                src={galleryImages[0]}
                alt={hotelName}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
              {/* Gallery Icon Overlay */}
              <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {galleryImages.length} Photos
                </div>
              </div>
            </div>

            {/* Main Content Wrapper */}
            <div className="flex-[2] flex flex-row ps-4 pe-2  gap-2">

              {/* Left/Middle Column: Info & Amenities */}
              <div className="flex-1 flex flex-col justify-between gap-4">
                <div>
                  { (isRefundable || isRoomRefundable) && (
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
                  <h3
                    className="font-nunito text-xl xl:text-2xl font-bold text-[#1f2937] underline group-hover:text-[#FF914D] transition-colors duration-300 cursor-pointer"
                    onClick={handleChooseRoom}
                  >
                    {hotelName}
                  </h3>
                   <p className="text-xs xl:text-base font-medium font-nunito mb-1">{distance !== null ? `${distance} Km from Airport` : "7.6 Km from Airport"}</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-4 xl:w-5 xl:h-5"
                        viewBox="0 0 24 25"
                        fill={star <= Number(hotelRating) ? "#FCDB47" : "#E5E7EB"}
                      >
                        <path
                          d="M12 2.599L15.09 8.859L22 9.869L17 14.739L18.18 21.619L12 18.369L5.82 21.619L7 14.739L2 9.869L8.91 8.859L12 2.599Z"
                          stroke={star <= Number(hotelRating) ? "#FCDB47" : "#e5e7eb"}
                          strokeWidth="1"
                        />
                      </svg>
                    ))}
                  </div>
                </div>

                {/* Amenities grid */}
                <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                  {hotelAmenities?.slice(0, 6).map((amenity, idx) => (
                    <div className="flex items-start gap-2" key={idx}>
                      <svg className="w-4 h-4 text-gray-700 mt-1 flex-shrink-0" viewBox="0 0 24 25" fill="none">
                        <path d="M9.99997 16.185L6.70697 12.892L5.29297 14.306L9.99997 19.013L19.707 9.30603L18.293 7.89203L9.99997 16.185Z" fill="#000" />
                      </svg>
                      <span className="text-xs font-normal text-gray-800 break-words leading-snug">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="w-px bg-gray-200 mx-1 hidden md:block" />

              {/* Right Column: Review & Price */}
              <div className="flex flex-col gap-4 items-end">
                {/* Review Row */}
                <div className="flex items-center justify-end gap-1 text-right">
                  <div className="flex flex-col">
                    <span className="text-xl xl:text-2xl font-semibold leading-tight">Exceptional</span>
                    <span className="text-xs xl:text-base text-[#6b7280]">{hotelReviewsCount} Reviews</span>
                  </div>
                  <div className="bg-[#218701] text-white px-2 py-3 rounded text-sm xl:text-md flex items-center font-medium text-center">
                    {Number(hotelRating).toFixed(1)}
                  </div>
                </div>

                {/* Price and Button */}
                <div className="flex flex-col items-end">
                  {hotelOriginalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(hotelOriginalPrice)}
                    </span>
                  )}
                  <span className="text-sm text-black">
                    {formatPrice(hotelPrice, hotel.Currency)} per night
                  </span>
                  <span className="text-lg font-bold">
                    {formatPrice(hotelTotalPrice, hotel.Currency)} total
                  </span>
                  <span className="text-sm text-[#4E4A4A]">Includes taxes & fees</span>
                  <button
                    onClick={handleChooseRoom}
                    className="mt-1 px-5 xl:px-10 py-2 bg-gradient-to-r from-[#FF914D] to-[#F25C54] text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-105"
                  >
                    Choose Room
                  </button>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            {isGalleryOpen && (
              <ImageGallery
                isOpen={true}
                onClose={() => setIsGalleryOpen(false)}
                images={galleryImages}
                hotelName={hotelName}
                initialIndex={0}
              />
            )}
          </div>


          <div
           onClick={handleChooseRoom}
            className="font-nunito flex md:hidden flex-row  bg-foreground border border-[#e5e7eb] rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group"
          >
            {/* Hotel Image */}
            <div
              className="w-[180px] px-[16px] py-[12px] overflow-hidden relative flex-shrink-0 cursor-pointer bg-cover bg-center bg-blend-darken bg-[#00000027]"
              onClick={handleImageClick}
              style={{ backgroundImage: `url('${galleryImages[0]}')` }}
            >
              {/* Remove <img> tag, keep overlays and children */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
              {/* Gallery Icon Overlay */}
              <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {galleryImages.length} Photos
                </div>
              </div>

              <div className="flex items-center md:justify-end gap-2  md:text-right">
                <div className="bg-[#218701] text-white px-3 py-2 h-full rounded text-sm xl:text-md flex items-center font-medium min-w-[36px] text-center">
                  {Number(hotelRating).toFixed(1)}
                </div>
                <div className="flex flex-col">
                  <span className="text-base xl:text-2xl font-light leading-tight text-white md:text-black">Exceptional</span>
                  <span className="text-xs xl:text-base text-white font-light">{hotelReviewsCount} Reviews</span>
                </div>

              </div>
            </div>

            {/* Main Content Wrapper */}
            <div className="flex-[2] px-1 md:px-4 py-2  gap-2">

              {/* Left/Middle Column: Info & Amenities */}
              <div className="flex-1 flex flex-col xl:justify-between">
                <div className="flex flex-col gap-2">
                  <h3 className="font-nunito text-[18px] font-bold text-[#1f2937]  group-hover:text-[#FF914D] transition-colors duration-300">
                    {hotelName}
                  </h3>
                  <p className="text-sm font-medium font-nunito mb-1">{distance !== null ? `${distance} Km from Airport` : "7.6 Km from Airport"}</p>

                </div>

                {/* Amenities grid */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {hotelAmenities?.slice(0, 3).map((amenity, idx) => (
                    <div className="flex items-center gap-1" key={idx}>
                      <svg className="w-4 md:w-5 h-4 md:h-5 text-gray-500 mt-1 flex-shrink-0" viewBox="0 0 24 25" fill="none">
                        <path d="M9.99997 16.185L6.70697 12.892L5.29297 14.306L9.99997 19.013L19.707 9.30603L18.293 7.89203L9.99997 16.185Z" fill="#000" />
                      </svg>
                      <span className="line-clamp-1 text-[10px] font-normal text-gray-700 whitespace-normal break-words">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col  mt-4">
                {hotelOriginalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(hotelOriginalPrice)}
                  </span>
                )}
                <span className="text-base font-bold text-[#1f2937]">{formatPrice(hotelPrice)}</span>
                <span className="text-xs xl:text-md ">{formatPrice(hotelTotalPrice)} total</span>
                <span className="text-xs xl:text-sm ">Includes taxes & fees</span>

              </div>

            </div>

            {/* Image Gallery */}
            {isGalleryOpen && (
              <ImageGallery
                isOpen={true}
                onClose={() => setIsGalleryOpen(false)}
                images={galleryImages}
                hotelName={hotelName}
                initialIndex={0}
              />
            )}
          </div>
        </>
      )}
    </>
  );
}
