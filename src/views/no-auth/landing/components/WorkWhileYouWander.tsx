"use client";
import Image from "next/image";

const trips = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    title: "Thailand",
    price: "$1000",
    duration: "3 Days 4 Night",
    desc: "we curate exceptional travel experiences and...",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    title: "Thailand",
    price: "$1000",
    duration: "3 Days 4 Night",
    desc: "we curate exceptional travel experiences and...",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    title: "Thailand",
    price: "$1000",
    duration: "3 Days 4 Night",
    desc: "we curate exceptional travel experiences and...",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    title: "Thailand",
    price: "$1000",
    duration: "3 Days 4 Night",
    desc: "we curate exceptional travel experiences and...",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    title: "Thailand",
    price: "$1000",
    duration: "3 Days 4 Night",
    desc: "we curate exceptional travel experiences and...",
  },
  
];

import Button from "@/components/ui/NewButton";
import React, { useRef, useState } from "react";

export default function WorkWhileYouWander() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const cardWidth = 280; // min-w + gap

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const idx = Math.round(scrollLeft / cardWidth);
      setActiveIndex(idx);
    }
  };

  return (
    <section className="w-full py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[22px] font-bold text-[#184363] font-roboto ">
            Work While You Wander
          </h2>
             <button className="px-3 py-1 border-[1.5px] border-primary rounded-lg bg-white text-primary font-semibold shadow-xl  text-base font-nunito  cursor-pointer hover:bg-primary hover:text-white transition">
            View All
          </button>
        </div>
        <div
          className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide"
          ref={scrollRef}
          onScroll={handleScroll}
        >
          {trips.map((trip) => (
            <div
              key={trip.id}
              className=" min-w-[260px] max-w-[230px] bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden border border-[#e0e0e0] transition hover:shadow-xl hover:-translate-y-2 duration-300"
            >
              <Image
                src={trip.image}
                alt={trip.title}
                width={400}
                height={176}
                className="w-full h-44 object-cover rounded-t-2xl"
              />
              <div className="p-5 flex flex-col flex-1 font-nunito">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-2xl  text-[#181D27]">
                    {trip.title}
                  </span>
                  <span className="font-semibold text-2xl text-[#222]">
                    {trip.price}
                  </span>
                </div>
                <div className="flex items-center gap-2  text-base  mb-1">
                  <span>🕒</span>
                  <span className="text-gray-400 font-medium">
                    {trip.duration}
                  </span>
                </div>
                <div className="text-xs  text-gray-500 mb-4">{trip.desc}</div>
                <Button variant="solid" color="secondary">
                  Book Now
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-4 gap-2">
          {trips.map((_, idx) => (
            <span
              key={idx}
              className={
                activeIndex === idx
                  ? "inline-block w-7 h-2.5 rounded-full bg-gradient-to-r from-[#FF7A3D] to-[#FF914D] transition-all duration-200"
                  : "inline-block w-2.5 h-2.5 rounded-full bg-[#DADADA] transition-all duration-200"
              }
            ></span>
          ))}
        </div>
      </div>
    </section>
  );
}
