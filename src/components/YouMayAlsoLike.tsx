import React from "react";
import Image from "next/image";
import Button from "./ui/Button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function YouMayAlsoLike() {
  return (
    <div className="relative mb-16">
      <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
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
  );
}
