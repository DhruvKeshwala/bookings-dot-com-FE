"use client";
import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { StarIcon } from "@/components/icons/StarIcon";
// TypeScript Types
type Testimonial = {
  id: number;
  name: string;
  address: string;
  text: string;
  rating: number;
};

type CustomerSuccessProps = {
  heading: string;
  subheading: string;
  review: Testimonial[];
};

export default function CustomerSuccessStories({
  heading,
  subheading,
  review,
}: CustomerSuccessProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(1);
  const sectionRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  // Calculate slides per view based on breakpoint
  const getSlidesPerView = () => {
    if (typeof window === "undefined") return 1;
    const width = window.innerWidth;
    if (width >= 900) return 3;
    if (width >= 668) return 2;
    return 1;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Set initial value
    setSlidesPerView(getSlidesPerView());

    const handleResize = () => setSlidesPerView(getSlidesPerView());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section ref={sectionRef} className="py-[90px] px-4 bg-[#fff7f2]">
      <div className="max-w-[1080px] mx-auto">
        <h2
          className={`heading-1 text-primary transition-all duration-700 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {heading}
        </h2>
        <p
          className={`text-black mb-10 max-w-2xl font-sans transition-all duration-900 ease-out delay-100 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {subheading}
        </p>

        <div className="relative testimonial-swiper">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={32}
            slidesPerView={1}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              480: { slidesPerView: 1, spaceBetween: 20 },
              668: { slidesPerView: 2, spaceBetween: 24 },
              900: { slidesPerView: 3, spaceBetween: 32 },
            }}
            className="pb-4"
          >
            {review.map((t) => (
              <SwiperSlide key={t.id}>
                <div className="flex flex-col items-start relative min-h-[230px]">
                  <div className="flex items-center gap-[4px] mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        filled={i < t.rating}
                        id={t.id}
                        index={i}
                      />
                    ))}
                  </div>
                  <div className="text-black text-[16px] mb-6 break-words w-full overflow-hidden">
                    &quot;{t.text}&quot;
                  </div>
                  <div className="flex items-center gap-3 mt-auto">
                    <span className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-[#0a4256] font-bold text-lg">
                      {t.name[0]}
                    </span>
                    <div>
                      <div className="text-black heading-2">{t.name}</div>
                      <div className="text-black body-text">{t.address}</div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Custom Pagination dots */}
        <div
          className={`flex justify-center mt-8 gap-2 transition-all duration-700 ease-out delay-[700ms] ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {Array.from({
            length: Math.ceil(review.length / slidesPerView),
          }).map((_, i) => (
            <span
              key={i}
              onClick={() => swiperRef.current?.slideTo(i * slidesPerView)}
              className={
                i === Math.floor(activeIndex / slidesPerView)
                  ? "inline-block w-7 h-2.5 rounded-full bg-gradient-to-r from-[#FF7A3D] to-[#FFB199] transition-all duration-200 cursor-pointer"
                  : "inline-block w-2.5 h-2.5 rounded-full bg-[#DADADA] transition-all duration-200 cursor-pointer hover:bg-[#C0C0C0]"
              }
            ></span>
          ))}
        </div>
      </div>
    </section>
  );
}
