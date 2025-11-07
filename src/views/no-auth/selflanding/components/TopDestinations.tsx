"use client";
import { useRef, useState } from "react";
import Image from "next/image";

const destinations = [
  {
    id: 1,
    name: "Kintamani",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "Kintamani",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "Kintamani",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    name: "Kintamani",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 5,
    name: "Kintamani",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
];
type TopDestinationsProps = {
  type?: string | undefined;
};
export default function TopDestinations({ type }: TopDestinationsProps) {
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

  const heading = {
  default: "Destinations Worth Your Bucket List",
  flight: "Top Flight Destinations You’ll Love",
  hotel: "Top Hotel Destinations You’ll Love",
  }

  const subheading = {
  default: "From islands to mountains, explore beautiful places worldwide. Here are some curated destinations for you by launcherr.",
  flight: "From bustling cities to quiet escapes, here are some of the most searched and recommended flight destinations by Travulu users.",
  hotel: "From mountains to beaches, discover the most popular destinations and handpicked hotels recommended by Travulu travelers.",
  }

  return (
    <section className="py-12 bg-[#EFEBE6] full-bleed">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-[22px] font-bold text-primary tracking-tight mb-2 font-raleway">
          {heading[type as "default" | "flight" | "hotel"] || heading.default}
        </h2>
        <p className="text-[#23404a] text-base mb-6 max-w-4xl font-nunito font-medium">
          {subheading[type as "default" | "flight" | "hotel"] || subheading.default}
        </p>
        <div className="flex items-center gap-3 mb-8 font-nunito text-primary overflow-x-auto scrollbar-hide">
          <button className="px-6 py-1 rounded-lg bg-primary text-white font-semibold shadow text-base whitespace-nowrap">
            All
          </button>
          <button className="px-6 py-1 rounded-lg border-[1.5px] border-primary font-semibold shadow-2xl text-base bg-white whitespace-nowrap">
            Recommended
          </button>
          <button className="px-6 py-1 rounded-lg border-[1.5px] border-primary text-primary font-semibold shadow-2xl text-base bg-white whitespace-nowrap">
            Nature
          </button>
          <button className="px-6 py-1 rounded-lg border-[1.5px] border-primary text-primary font-semibold shadow-2xl text-base bg-white whitespace-nowrap">
            Mountain
          </button>
          <button className="px-6 py-1 rounded-lg border-[1.5px] border-primary text-primary font-semibold shadow-2xl text-base bg-white whitespace-nowrap">
            Beach
          </button>
          <span className="flex-1 min-w-[8px]"></span>
          <button className="px-3 py-1 border-[1.5px] border-primary rounded-lg bg-white text-primary font-semibold shadow-xl  text-base font-nunito  cursor-pointer hover:bg-primary hover:text-white transition">
            View All
          </button>
        </div>
        <div
           className="flex gap-8 overflow-x-auto overflow-visible pb-4 pt-8 scrollbar-hide" ref={scrollRef} onScroll={handleScroll} >
          {destinations.map((dest, idx) => (
            <div
              key={dest.id}
              className={`min-w-[240px] max-w-[230px] w-full h-[239px] rounded-2xl shadow-lg bg-white flex flex-col items-end justify-end relative border  border-[#e0e0e0] transition hover:shadow-xl hover:-translate-y-2 duration-300 ${activeIndex === idx ? "z-20" : "z-10"}`}
            >
              <Image
                src={dest.image}
                alt={dest.name}
                fill
                className="absolute inset-0 w-full h-full object-cover z-0 rounded-2xl"
                sizes="(max-width: 600px) 100vw, 240px"
                priority={dest.id === 1}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 rounded-2xl" />
              {/* <div className="relative z-20 w-full p-4 flex items-end h-full">
                <span
                  className="text-lg font-bold text-white drop-shadow"
                  style={{ textShadow: "0 1px 8px #000a" }}
                >
                  {dest.name}
                </span>
              </div> */}
            </div>
          ))}
        </div>
        {/* Scroll indicator */}
        <div className="flex justify-center mt-4 gap-2">
          {destinations.map((_, idx) => (
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
