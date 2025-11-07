import React from "react";
import Button from "./ui/Button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function GigsYouMightLike() {
  return (
    <div className="relative mb-16">
      <h2 className="text-2xl font-bold mb-6">Gigs You Might Like</h2>
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
    </div>
  );
}
