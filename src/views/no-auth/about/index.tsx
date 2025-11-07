"use client";

import { useRef, useState } from "react";

export default function AboutPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Tiny badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF914D]/10 to-[#F25C54]/10 border border-[#FF914D]/20 text-xs font-medium text-[#001F50] font-nunito mb-3">
          {/* Our story */} Last updated 19 Mar 2025
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold font-raleway mb-4 text-[#014569]">
          About Us
        </h1>
        <p className="text-[#001F50]/70 font-nunito mb-8">
          Welcome to Travulu, your happy place for all things travel.
        </p>

          {/* Video Section */}
        <div className="group relative w-full overflow-hidden rounded-2xl p-[2px] bg-gradient-to-r from-[#FF914D] to-[#F25C54] transition-transform duration-300 hover:shadow-2xl hover:-translate-y-1">
          <div className="rounded-[14px] bg-white">
            <div className="relative aspect-video overflow-hidden rounded-xl">
              {/* Ambient overlay on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-transparent via-transparent to-[#F25C54]/10" />

              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                controls
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                poster="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1600&auto=format&fit=crop"
              >
                <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Center play/pause control */}
              <button
                type="button"
                aria-label={isPlaying ? "Pause video" : "Play video"}
                onClick={togglePlay}
                className="absolute inset-0 m-auto h-14 w-14 flex items-center justify-center rounded-full bg-white text-[#001F50] shadow-lg ring-2 ring-white/60 transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#FF914D]/40"
                style={{ top: "50%", transform: "translateY(-50%)" }}
              >
                {/* Icon */}
                {isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="4" y="3" width="4" height="14" rx="1" fill="#001F50"/>
                    <rect x="12" y="3" width="4" height="14" rx="1" fill="#001F50"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 4L16 10L5 16V4Z" fill="#001F50"/>
                  </svg>
                )}
              </button>

              {/* Subtle bottom gradient and caption */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/30 to-transparent text-white text-sm font-nunito">
                A glimpse into how we craft seamless journeys
              </div>
            </div>
          </div>
        </div>

        {/* Intro Paragraphs */}
        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10">
          <p>
            We started Travulu with one simple thought: travel should feel exciting,
             not stressful. From the moment you dream of your trip until the time you
              come back with memories, we are here to make it smoother, easier, and way more fun.
          </p>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          Who we are
        </h2>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10">
          <p>
           Travulu is your travel buddy that helps you explore the world without breaking your bank
            or your spirit. Whether you want cheap flights or comfy hotels,
              we’ve got it all under one roof.
          </p>
          <p>We were earlier known as Launcherr, but we evolved into Travulu to create a bigger,
             brighter, and more traveler-friendly space. Think of us as your pocket-sized genie 
             that helps you fly smarter and stay better.
          </p>                        
        </div>

         <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
         What We Offer
        </h2>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Flights and Hotels: Book quickly, save money, and get reminders that keep you stress-free.
            </li>

            {/* <li>
              Travel Gigs: Post a gig if you need a helping hand or apply for one if you want to earn while exploring. It’s free for both sides.
            </li>

            <li>
              Travel Essentials: From quirky must-haves to life-saving gear, shop items that make your journey lighter and cooler.
            </li> */}

            <li>
              Inspiration: Explore “Featured Escapes” that surprise you, “Plans” that fit your style, and “Reviews” that keep it real.
            </li>
          </ul>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
         Our Promise
        </h2>

         <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10">
          <p>
           Travulu isn’t just another booking site. We care about your trip like it’s ours.
            That’s why we go the extra mile after you book with us. Expect packing checklists, baggage
             reminders, hotel perks, and a lot of small touches that make a big difference.
          </p>                       
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
         Why Travulu?
        </h2>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10">
          <p>
           Because travel is not just about reaching a place. It’s about the laughs, the late-night snacks,
            the strangers-turned-friends, and the stories you’ll tell for years. We want to be part of all
             that magic with you.
          </p>                       
        </div>

        {/* CTA Bar */}                                           
        <div className="mt-10 p-5 rounded-lg bg-gradient-to-r from-[#FF914D]/10 to-[#F25C54]/10 border border-[#FF914D]/20">
          <p className="text-[#001F50] font-nunito">
            {/* Have questions or feedback? We're here to help you make the most of every trip. */}
            So next time you plan a getaway, remember, Travulu has your back, front, and suitcase too.
          </p>
        </div>
      </div>
    </section>
  );
}
