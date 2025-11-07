"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface Hotel {
  id: string;
  name: string;
  distance: string;
  image: string;
  features: string[];
  price: string;
  totalPrice: string;
  rating: string;
  reviewCount: string;
  score: string;
}

const hotels: Hotel[] = [
  {
    id: "1",
    name: "Hotel Sarovar by Goyal Hotel",
    distance: "7.6 Km from Airport",
    image: "https://api.builder.io/api/v1/image/assets/TEMP/4d65900f2130e5967fbb92307ceea025d39241ad?width=520",
    features: ["Free Breakfast", "Swimming Pool", "Free Wi - Fi", "Private beach"],
    price: "₹ 5,488",
    totalPrice: "₹23,475 total",
    rating: "Exceptional",
    reviewCount: "349 Reviews",
    score: "8.9"
  },
  {
    id: "2",
    name: "Hotel Sarovar by Goyal Hotel",
    distance: "7.6 Km from Airport",
    image: "https://api.builder.io/api/v1/image/assets/TEMP/4d65900f2130e5967fbb92307ceea025d39241ad?width=520",
    features: ["Free Breakfast", "Swimming Pool", "Free Wi - Fi", "Private beach"],
    price: "₹ 5,488",
    totalPrice: "₹23,475 total",
    rating: "Exceptional",
    reviewCount: "349 Reviews",
    score: "8.9"
  },
  {
    id: "3",
    name: "Hotel Sarovar by Goyal Hotel",
    distance: "7.6 Km from Airport",
    image: "https://api.builder.io/api/v1/image/assets/TEMP/4d65900f2130e5967fbb92307ceea025d39241ad?width=520",
    features: ["Free Breakfast", "Swimming Pool", "Free Wi - Fi", "Private beach"],
    price: "₹ 5,488",
    totalPrice: "₹23,475 total",
    rating: "Exceptional",
    reviewCount: "349 Reviews",
    score: "8.9"
  },
  {
    id: "4",
    name: "Hotel Sarovar by Goyal Hotel",
    distance: "7.6 Km from Airport",
    image: "https://api.builder.io/api/v1/image/assets/TEMP/4d65900f2130e5967fbb92307ceea025d39241ad?width=520",
    features: ["Free Breakfast", "Swimming Pool", "Free Wi - Fi", "Private beach"],
    price: "₹ 5,488",
    totalPrice: "₹23,475 total",
    rating: "Exceptional",
    reviewCount: "349 Reviews",
    score: "8.9"
  }
];

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M7.15015 11.9883L4.79875 9.63693L3.78906 10.6466L7.15015 14.0077L14.0816 7.0763L13.0719 6.06662L7.15015 11.9883Z" fill="black" />
  </svg>
);

export default function RecommendedDestinations() {
  return (
    <div className="w-full relative py-6">
      <h2 className="text-2xl font-bold text-black font-raleway mb-4">Recommended Destinations</h2>

      <Swiper
        slidesPerView={1}
        spaceBetween={10}
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 1.2 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        modules={[Pagination]}
        className="!pb-10"
      >
        {hotels.map((hotel) => (
          <SwiperSlide key={hotel.id}>
            <div
              className="group transition-all duration-300 ease-in-out flex flex-col p-3 gap-3 justify-between border border-black/20 rounded-2xl bg-white cursor-pointer hover:border-[#FF7F50]/40 hover:shadow-[0px_6px_20px_0px_rgba(1,59,149,0.15)] hover:-translate-y-0.5 h-full"
            >
              {/* Hotel Image with overlay */}
              <div className="relative h-[185px] rounded-2xl overflow-hidden">
                <img
                  src={hotel.image}
                  alt={hotel.name}
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
                    6 Photos
                  </div>
                </div>
              </div>

              {/* Hotel Info */}
              <div className="flex flex-col justify-between gap-3">
                <div>
                  <h4 className="text-lg font-bold text-black group-hover:text-[#FF7F50] transition-colors duration-300">
                    {hotel.name}
                  </h4>
                  <p className="text-sm text-black/70">{hotel.distance}</p>
                </div>

                {/* Amenities */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {hotel.features
                    .filter((feature) => feature.length <= 25)
                    .slice(0, 6)
                    .map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-4 h-4 text-black flex items-center justify-center">
                           <CheckIcon />
                        </div>
                        <span className="text-xs text-black font-nunito truncate">{feature}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Bottom Section */}
              <div className="flex justify-between items-start gap-4 pt-3 mt-auto">
                <div className="flex flex-col">
                  <div className="text-xs text-black">{hotel.price}</div>
                  <div className="text-[15px] mt-1 font-bold text-black">{hotel.totalPrice}</div>
                  <div className="text-xs text-black/50">Includes taxes & fees</div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex flex-col text-left mr-5">
                      <span className="text-sm font-bold text-black">{hotel.rating}</span>
                      <span className="text-xs text-black/70">{hotel.reviewCount}</span>
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center bg-[#218701] text-white rounded">
                      {hotel.score}
                    </div>
                  </div>

                  <button
                    className="w-[140px] py-1 bg-gradient-to-r from-[#FF6347] to-[#FF6B6B] text-white text-sm font-medium rounded-xl hover:from-[#FF6347] hover:to-[#E04E47] transition-transform transform hover:scale-105 active:scale-95 shadow hover:shadow-md"
                  >
                    Choose Room
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
