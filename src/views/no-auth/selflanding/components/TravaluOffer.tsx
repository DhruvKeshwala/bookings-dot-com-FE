"use client";
import React, { useRef, useState } from "react";
import "./TravaluOfferScrollbar.css";
import Button from "@/components/ui/NewButton";



type TravaluOfferProps = {
  type?: string | undefined;
};


const dummyOffers: Record<string, any[]> = {
  default: [
    {
      id: 1,
      title: "Save up to 35% on flight bookings",
      date: "Till 21 Feb '25",
      image: "/assets/banners/1.svg",
      bg: "bg-[#F6E9E6]",
    },
    {
      id: 2,
      title: "Save up to 35% on flight bookings",
      date: "Till 21 Feb '25",
      image: "/assets/banners/2.svg",
      bg: "bg-[#E6F0FA]",
    },
    {
      id: 3,
      title: "Save up to 35% on flight bookings",
      date: "Till 21 Feb '25",
      image: "/assets/banners/3.svg",
      bg: "bg-[#E6F0FA]",
    },
    {
      id: 4,
      title: "Save up to 35% on flight bookings",
      date: "Till 21 Feb '25",
      image: "/assets/banners/4.svg",
      bg: "bg-[#E6F0FA]",
    },
    {
      id: 5,
      title: "Save up to 35% on flight bookings",
      date: "Till 21 Feb '25",
      image: "/assets/banners/5.svg",
      bg: "bg-[#E6F0FA]",
    },
    {
      id: 6,
      title: "Save up to 35% on flight bookings",
      date: "Till 21 Feb '25",
      image: "/assets/banners/7.svg",
      bg: "bg-[#E6F0FA]",
    },
  ],
  flight: [
    {
      id: 1,
      title: "Save up to 35% on domestic flights",
      date: "Till 21 Nov '2025",
      image: "/assets/banners/1.svg",
      bg: "bg-[#F6E9E6]",
    },
    {
      id: 2,
      title: "Flat ₹2,000 off on international routes",
      date: "Till 21 Nov '2025",
      image: "/assets/banners/2.svg",
      bg: "bg-[#E6F0FA]",
    },
    {
      id: 3,
      title: "Special student fares for 2025 trips",
      date: "Till 21 Nov '2025",
      image: "/assets/banners/3.svg",
      bg: "bg-[#E6F0FA]",
    },
    {
      id: 4,
      title: "Early bird offers for summer vacations",
      date: "Till 21 Nov '2025",
      image: "/assets/banners/4.svg",
      bg: "bg-[#E6F0FA]",
    },
    {
      id: 5,
      title: "Cashback rewards on selected airlines",
      date: "Till 21 Nov '2025",
      image: "/assets/banners/5.svg",
      bg: "bg-[#E6F0FA]",
    },
    {
      id: 6,
      title: "Cashback rewards on selected airlines",
      date: "Till 21 Nov '2025",
      image: "/assets/banners/7.svg",
      bg: "bg-[#E6F0FA]",
    },
  ],
  hotel: [
    {
      id: 1,
      title: "Save up to 40% on selected 5-star hotels",
      date: "Till 21 Nov '2025",
      image: "/assets/banners/1.svg",
      bg: "bg-[#F6E9E6]",
    },
    {
      id: 2,
      title: "Flat ₹1,500 off on bookings above ₹10,000",
      date: "Till 21 Nov '2025",
      image: "/assets/banners/2.svg",
      bg: "bg-[#E6F0FA]",
    },
    {
      id: 3,
      title: "Pay later with free cancellation at top hotels",
      date: "Till 21 Nov '2025",
      image: "/assets/banners/3.svg",
      bg: "bg-[#E6F0FA]",
    },
    {
      id: 4,
      title: "Stay 3 nights and get the 4th night free",
      date: "Till 21 Nov '2025",
      image: "/assets/banners/4.svg",
      bg: "bg-[#E6F0FA]",
    },
    {
      id: 5,
      title: "Early check-in and late checkout offers",
      date: "Till 21 Nov '2025",
      image: "/assets/banners/5.svg",
      bg: "bg-[#E6F0FA]",
    },
    {
      id: 6,
      title: "Early check-in and late checkout offers",
      date: "Till 21 Nov '2025",
      image: "/assets/banners/7.svg",
      bg: "bg-[#E6F0FA]",
    },
  ]
};

export default function TravuluOffers({ type }: TravaluOfferProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const cardWidth = 248; // min-w-[240px] + gap

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const idx = Math.round(scrollLeft / cardWidth);
      setActiveIndex(idx);
    }
  };

const subhseading = {
  default: "Grab Exclusive Travulu Offers",
  flight: "Grab Exclusive Flight Offers and",
  hotel: "Grab Exclusive Hotel Offers and",
}

  return (
    <section className="w-full py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-[22px] font-bold text-primary tracking-tight font-raleway">
             {subhseading[type as "default" | "flight" | "hotel"] || subhseading.default}
            <span className="text-primary"> &amp; Deals</span>
          </h2>
          <button className="px-3 py-1 border-[1.5px] border-primary rounded-lg bg-white text-primary font-semibold shadow-xl  text-base font-nunito  cursor-pointer hover:bg-primary hover:text-white transition">
            View All
          </button>
        </div>
        {/* Set overflow-visible to allow cards to pop out on hover */}
        <div
          className="flex gap-8 overflow-x-auto overflow-visible pb-4 pt-8 scrollbar-hide"
          ref={scrollRef}
          onScroll={handleScroll}
        >
          {(dummyOffers[type as "default" | "flight" | "hotel"] || dummyOffers.default).map((offer, idx) => (
            <div
              key={offer.id}
              className={`min-w-[230px] h-[239px] w-full rounded-2xl shadow-lg flex flex-col items-center relative border border-[#e0e0e0] transition hover:shadow-xl hover:-translate-y-2 duration-300 cursor-pointer ${
                activeIndex === idx ? "z-20" : "z-10"
              }`}
              style={{
                backgroundImage: `url(${offer.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Overlay for darken effect */}
              <div className="absolute inset-0  pointer-events-none" />
              <div className="flex flex-col items-center justify-center h-full w-full relative z-10 px-6 py-8">
                <span
                  className="text-base text-white font-semibold mb-5 drop-shadow font-nunito"
                  style={{ textShadow: "0 1px 4px #0008" }}
                >
                  {offer.date}
                </span>
                <div
                  className="text-xl font-bold text-white  w-[230px] text-center mb-6 drop-shadow font-nunito"
                  style={{ textShadow: "0 1px 8px #000a" }}
                >
                  {offer.title.split(" on ")[0]} <span className="text-[#ffd700]">{offer.title.includes("on") ? "on" : ""}</span> 
                  <br />
                  {offer.title.split(" on ")[1] || ""}
                </div>
                <Button
                  variant="solid"
                  color="danger"
                  className="text-white px-4 py-2"
                >
                  Learn more
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-4 gap-2">
          {(dummyOffers[type as "default" | "flight" | "hotel"] || dummyOffers.default).map((_, idx) => (
            <span
              key={idx}
              className={
                activeIndex === idx
                  ? "inline-block w-7 h-2.5 rounded-full bg-gradient-to-r from-[#FF7A3D] to-[#FFB199] transition-all duration-200"
                  : "inline-block w-2.5 h-2.5 rounded-full bg-[#DADADA] transition-all duration-200"
              }
            ></span>
          ))}
        </div>
      </div>
    </section>
  );
}
