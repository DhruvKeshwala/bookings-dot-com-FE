"use client";
import { useState, useRef } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import ImageGallery from "../../search/components/ImageGallery";
import { RecommendedHotelProps } from "@/types/hotel.types";
import { amenityIcons } from "../amenityIcons";
import { calculateDistanceInKm } from "@/utils/functions/distanceUtils";

export default function RecommendedHotel({ recommendedRooms, formatPrice }: RecommendedHotelProps) {

  const swiperRef = useRef<any>(null);
  const [activeHotelSlideIndex, setActiveHotelSlideIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryHotelName, setGalleryHotelName] = useState("");

  const handleImageClick = (e: React.MouseEvent, hotel: any) => {
    e.stopPropagation();

    const defaultImage = "/assets/stories/transition_page_image.png";
    let images: string[] = [];

    if (hotel.Images?.length) {
      images = hotel.Images;
    } else if (hotel.Rooms?.[0]?.Images?.length) {
      images = hotel.Rooms[0].Images;
    } else {
      images = [defaultImage];
    }

    setGalleryImages(images);
    setGalleryHotelName(hotel.HotelName || "Hotel");
    setIsGalleryOpen(true);
  };

  const HotelCard = (hotel: any, index: number) => {
    const hotelImage =
      hotel.Images?.[0] ||
      hotel.Rooms?.[0]?.Images?.[0] ||
      "/assets/stories/transition_page_image.png";

    const basePrice = hotel.Rooms?.[0]?.DayRates?.[0]?.[0]?.BasePrice;
    const totalFare = hotel.Rooms?.[0]?.TotalFare;

  const handleChooseRoom = (e: React.MouseEvent) => {
      e.stopPropagation();

      const hotelCode = hotel?.HotelCode;
      if (!recommendedRooms || !hotelCode) {
        console.warn("Recommended rooms are not available or hotel code is missing.");
        return;
      }

      // Get selected hotel data from recommendedRooms
      const selectedRoomData = recommendedRooms.find(h => h.HotelCode === hotelCode);
      if (!selectedRoomData) {
        console.warn("Selected hotel data not found in recommendedRooms.");
        return;
      }

      // Retrieve existing hotel_data from sessionStorage
      const existingDataRaw = sessionStorage.getItem("hotel_data");
      const existingData = existingDataRaw ? JSON.parse(existingDataRaw) : {};

      const existingRooms = existingData.rooms || {};

      // Add/Update this recommended hotel under dynamic key in rooms
      const updatedRooms = {
        ...existingRooms,
        [`recommend_${hotelCode}`]: selectedRoomData,
      };

      const fullHotelData = {
        ...existingData,
        rooms: updatedRooms,
      };

      // Store updated data back
      sessionStorage.setItem("hotel_data", JSON.stringify(fullHotelData));
      sessionStorage.setItem("selectedHotelCode", hotelCode);

      // Navigate to hotel detail page
      window.open(`/hotels/${hotelCode}`, "_blank");
    };

    let distanceFromAirport = null;

    try {
      const airportDataFromSession = sessionStorage.getItem("airportData");
      const airportData = airportDataFromSession ? JSON.parse(airportDataFromSession) : null;

      if (airportData && hotel.Map) {
        const [hotelLatStr, hotelLonStr] = hotel.Map.split("|");
        const hotelLat = parseFloat(hotelLatStr);
        const hotelLon = parseFloat(hotelLonStr);

        const airportLat = parseFloat(airportData[0].latitude_deg);
        const airportLon = parseFloat(airportData[0].longitude_deg);

        distanceFromAirport = calculateDistanceInKm(airportLat, airportLon, hotelLat, hotelLon);
      }
    } catch (error) {
      console.error("Error calculating distance:", error);
    }


    return (
      <div
        key={index}
        onClick={handleChooseRoom}
        className="group transition-all duration-300 ease-in-out flex flex-col p-3 gap-3 justify-between border border-black/20 rounded-2xl bg-white cursor-pointer hover:border-[#FF7F50]/40 hover:shadow-[0px_6px_20px_0px_rgba(1,59,149,0.15)] hover:-translate-y-0.5 h-full"
      >
        {/* Image */}
        <div className="relative h-[185px] rounded-2xl overflow-hidden">
          <img
            src={hotelImage}
            alt={hotel.HotelName?.toString()}
            onClick={(e) => handleImageClick(e, hotel)}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {(hotel.Images?.length || hotel.Rooms?.[0]?.Images?.length || 1)} Photos
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between gap-3">
          <div>
            <h4 className="text-lg font-bold text-black group-hover:text-[#FF7F50] transition-colors duration-300">
              {hotel.HotelName}
            </h4>
            <p className="text-sm text-black/70">
              {distanceFromAirport !== null ? `${distanceFromAirport} Km from Airport` : "7.6 Km from Airport"}
            </p>
          </div>

          {/* Amenities */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {hotel.HotelFacilities?.filter(
              (amenity: string) => amenity.length <= 25
            )
              .slice(0, 6)
              .map((amenity: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 text-black flex items-center justify-center">
                    {/* Use custom icon if available, fallback to checkmark */}
                    {amenityIcons?.[amenity] || (
                      <svg className="w-3 h-3" viewBox="0 0 24 25" fill="none">
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

        {/* Bottom Section */}
        <div className="flex justify-between items-start gap-4 pt-3 mt-auto">
          {/* Left: Price Info */}
          <div className="flex justify-between items-start gap-13">
            {/* Left: Price */}
            <div className="flex flex-col">
              <div className="text-xs text-black">
                {basePrice ? formatPrice(basePrice) : "N/A"}
              </div>
              <div className="text-[15px] mt-1 font-bold text-black whitespace-nowrap">
                {totalFare ? formatPrice(totalFare) : "N/A"} total
              </div>
              <div className="text-xs text-black/50">Includes taxes & fees</div>
            </div>

            {/* Right: Rating + Button */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 mb-1">
                 <div className="flex flex-col text-left mr-5">
                  <span className="text-sm font-bold text-black">Exceptional</span>
                  <span className="text-xs text-black/70">349 Reviews</span>
                </div>
                <div className="w-8 h-8 flex items-center justify-center bg-[#218701] text-white rounded">
                  {hotel?.HotelRating}
                </div>
              </div>

              <button
                onClick={handleChooseRoom}
                className="w-[140px] py-1 bg-gradient-to-r from-[#FF6347] to-[#FF6B6B] text-white text-sm font-medium rounded-xl hover:from-[#FF6347] hover:to-[#E04E47] transition-transform transform hover:scale-105 active:scale-95 shadow hover:shadow-md"
              >
                Choose Room
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-12">
      <h3 className="text-2xl font-bold text-black font-raleway mb-6">Recommended Hotel Rooms</h3>

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
        {recommendedRooms?.map((hotel, index) => (
          <SwiperSlide key={index} style={{ width: '330px' }} className="!h-auto">
            {HotelCard(hotel, index)}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Swiper Default Pagination (visible only on md+ screens) */}
      <div className="custom-swiper-pagination mt-6 hidden md:flex justify-center" />

      {/* Custom Pagination Dots (visible only on small screens) */}
      <div className="flex justify-center items-center gap-2 mt-6 md:hidden">
        {recommendedRooms?.map((_, index) => (
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

      {/* Image Gallery */}
      {isGalleryOpen && (
        <ImageGallery
          isOpen={true}
          onClose={() => setIsGalleryOpen(false)}
          images={galleryImages}
          hotelName={galleryHotelName}
        />
      )}
    </div>
  );
}
