import React from "react";
import Image from "next/image";
import Button from "./ui/Button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const destinations = [
  {
    title: "Thailand",
    price: "$1000",
    duration: "3 Days 4 Night",
    description: "we curate exceptional travel experiences and.",
    image: "/assets/banners/auth-banner.svg", // Replace with real image
  },
  // Add more destinations as needed
  {
    title: "Thailand",
    price: "$1000",
    duration: "3 Days 4 Night",
    description: "we curate exceptional travel experiences and.",
    image: "/assets/banners/auth-banner.svg",
  },
  {
    title: "Thailand",
    price: "$1000",
    duration: "3 Days 4 Night",
    description: "we curate exceptional travel experiences and.",
    image: "/assets/banners/auth-banner.svg",
  },
  {
    title: "Thailand",
    price: "$1000",
    duration: "3 Days 4 Night",
    description: "we curate exceptional travel experiences and.",
    image: "/assets/banners/auth-banner.svg",
  },
   {
    title: "Thailand",
    price: "$1000",
    duration: "3 Days 4 Night",
    description: "we curate exceptional travel experiences and.",
    image: "/assets/banners/auth-banner.svg", // Replace with real image
  },
   {
    title: "Thailand",
    price: "$3000",
    duration: "3 Days 4 Night",
    description: "we curate exceptional travel experiences and.",
    image: "/assets/banners/auth-banner.svg", // Replace with real image
  },
  
  
];
export default function RecommendedDestinations() {
  return (
    <div className="mt-12">
      {/* Recommended Destinations */}
      <h2 className="text-2xl font-bold mb-6">Recommended Destinations</h2>
      <div className="relative mb-16">
        <Swiper
          modules={[Pagination]}
          spaceBetween={20}
          slidesPerView={4}
          pagination={{ clickable: true }}
          className="max-w-4xl"
          style={{ justifyContent: "flex-start" }}
        >
          {destinations.map((d, i) => (
            <SwiperSlide key={i}>
              <div className="bg-white rounded-[22px] shadow-lg w-full max-w-[320px] flex-shrink-0 border border-[#e5e7eb] flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-xl">
                <div className="w-full h-[120px] rounded-t-[22px] overflow-hidden">
                  <Image
                    src={d.image}
                    alt={d.title}
                    width={300}
                    height={180}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="px-3 py-4 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-800">{d.title}</span>
                    <span className="font-bold  text-gray-700">{d.price}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="#6b7280"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    {d.duration}
                  </div>
                  <div className="text-gray-500 text-xs mb-5">{d.description}</div>
                  <Button className="mt-auto border border-[#ff7e5f] text-[#ff7e5f] font-semibold rounded-xl py-2 w-full bg-white hover:bg-[#ff7e5f] hover:text-white transition">
                    Book Now
                  </Button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <style jsx global>{`
          .swiper-pagination {
            position: absolute !important;
            bottom: -32px !important;
            left: 0;
            width: 100%;
            display: flex;
            justify-content: center;
            z-index: 10;
          }
        `}</style>
      </div>

     {/* e
      <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
      <div className="relative mb-16">
        <Swiper
          modules={[Pagination]}
          spaceBetween={20}
          slidesPerView={4}
          pagination={{ clickable: true }}
          className="max-w-4xl"
          style={{ justifyContent: "flex-start" }}
        >
          {[1,2,3,4,5].map((i) => (
            <SwiperSlide key={i}>
              <div className="bg-white rounded-[16px] shadow-lg w-full max-w-[320px] flex-shrink-0 border border-[#e5e7eb] flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-xl p-3">
                <div className="relative w-full h-[120px] rounded-t-[16px] overflow-hidden mb-2">
                  <div className="absolute top-2 left-2 bg-[#20c997] text-white text-xs px-2 py-1 rounded-full">20% OFF</div>
                  <Image
                    src={"/assets/banners/auth-banner.svg"}
                    alt={"Cotton Linen: Soft Pink"}
                    width={300}
                    height={120}
                    className="object-cover w-full h-full"
                  />
                  <button className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"><svg width="18" height="18" fill="none" stroke="#ff7e5f" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></button>
                </div>
                <div className="font-bold text-gray-800 text-base mb-1">Cotton Linen: Soft Pink</div>
                <div className="text-gray-500 text-xs mb-1">This convenient condominium is located in a unique renovated Iron Works plant...</div>
                <div className="flex items-center gap-1 text-xs mb-1">
                  <span className="text-yellow-500">★</span>
                  <span>4.8</span>
                  <span className="text-gray-400">·</span>
                  <span>234 Reviews</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-lg text-gray-800">₹249.00</span>
                  <span className="line-through text-gray-400 text-sm">₹290.00</span>
                </div>
                <Button className="border border-[#ff7e5f] text-[#ff7e5f] font-semibold rounded-xl py-2 w-full bg-white hover:bg-[#ff7e5f] hover:text-white transition">
                  <span className="mr-2">🛒</span> Add to Cart
                </Button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <style jsx global>{`
          .swiper-pagination {
            position: absolute !important;
            bottom: -32px !important;
            left: 0;
            width: 100%;
            display: flex;
            justify-content: center;
            z-index: 10;
          }
        `}</style>
      </div>
 */}
      {/* Gigs You Might Like */}
      {/*<h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
      <div className="relative mb-16">
        <Swiper
          modules={[Pagination]}
          spaceBetween={20}
          slidesPerView={3}
          pagination={{ clickable: true }}
          className="max-w-4xl"
          style={{ justifyContent: "flex-start" }}
        >
          {[1,2,3].map((i) => (
            <SwiperSlide key={i}>
              <div className="bg-white rounded-[16px] shadow-lg w-full max-w-[360px] flex-shrink-0 border border-[#e5e7eb] flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#f3f4f6] rounded-full w-8 h-8 flex items-center justify-center font-bold text-[#0d6efd]">MT</div>
                    <span className="text-[#20c997] text-xs font-semibold">New</span>
                  </div>
                  <button className="bg-white rounded-full p-1 shadow"><svg width="18" height="18" fill="none" stroke="#0d6efd" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2z"/><polyline points="17 8 12 13 7 8"/></svg></button>
                </div>
                <div className="font-bold text-gray-800 text-base mb-1">Maintenance Technician</div>
                <div className="text-gray-500 text-xs mb-2">At Saputo, We Bring Good To The Table By Making High-Quality Products, Investing In Our People, And S...</div>
                <div className="flex items-center gap-2 text-xs mb-2">
                  <svg width="16" height="16" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2z"/><polyline points="17 8 12 13 7 8"/></svg>
                  <span>28 Days Ago</span>
                </div>
                <div className="flex items-center gap-2 text-xs mb-2">
                  <svg width="16" height="16" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                  <span>Saputo Cheese USA, LLC</span>
                </div>
                <div className="flex items-center gap-2 text-xs mb-2">
                  <svg width="16" height="16" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  <span>Delhi, NY728</span>
                </div>
                <div className="flex items-center gap-2 text-xs mb-4">
                  <svg width="16" height="16" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="7" rx="3"/><path d="M16 10v4"/></svg>
                  <span className="font-bold">₹1500 Per Hour</span>
                </div>
                <Button className="border border-[#ff7e5f] text-white font-semibold rounded-xl py-2 w-full bg-[#ff7e5f] hover:bg-[#ff7e5f] hover:text-white transition">
                  Easy Apply
                </Button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <style jsx global>{`
          .swiper-pagination {
            position: absolute !important;
            bottom: -32px !important;
            left: 0;
            width: 100%;
            display: flex;
            justify-content: center;
            z-index: 10;
          }
        `}</style>
      </div> */}
    </div>
  );

}