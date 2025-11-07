"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import VideoPlayIcon from "@/components/icons/VideoPlayIcon";
import Image from "next/image";

// Constants for better maintainability
const ANIMATION_CONFIG = {
  customerTarget: 1000,
  destTarget: 300,
  yearsTarget: 20,
  duration: 40,
  frameDelay: 25,
  intersectionThreshold: 0.3,
} as const;
// TypeScript Props Interface
type WhyLauncherrProps = {
  heading: string;
  subHeading: string;
  text1: string;
  text2: string;
  text3: string;
};

export default function WhyLauncherr({
  heading,
  subHeading,
  text1,
  text2,
  text3,
}: WhyLauncherrProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Animated count state
  const [customerCount, setCustomerCount] = useState(0);
  const [destCount, setDestCount] = useState(0);
  const [yearsCount, setYearsCount] = useState(0);

  // Intersection Observer for scroll-triggered animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          setIsVisible(true);
        }
      },
      { threshold: ANIMATION_CONFIG.intersectionThreshold }
    );

    const currentSection = sectionRef.current;
    if (currentSection) {
      observer.observe(currentSection);
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
      observer.disconnect();
    };
  }, [hasAnimated]);

  // Counter animation with proper cleanup
  useEffect(() => {
    if (!hasAnimated) return;

    const { customerTarget, destTarget, yearsTarget, duration, frameDelay } =
      ANIMATION_CONFIG;
    let frame = 0;
    let timeoutId: NodeJS.Timeout;

    const animate = () => {
      frame++;
      const progress = frame / duration;

      setCustomerCount(
        Math.min(Math.floor(customerTarget * progress), customerTarget)
      );
      setDestCount(Math.min(Math.floor(destTarget * progress), destTarget));
      setYearsCount(Math.min(Math.floor(yearsTarget * progress), yearsTarget));

      if (frame < duration) {
        timeoutId = setTimeout(animate, frameDelay);
      }
    };

    animate();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [hasAnimated]);

  const handlePlayVideo = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Video playback failed:", error);
        setVideoError(true);
      });
    }
  };

  const handleVideoError = () => {
    setVideoError(true);
    console.error("Video failed to load");
  };

  return (
    <section
      ref={sectionRef}
      className="w-full min-h-[550px] py-[50px] px-[20px] flex items-center bg-[#fff7f2]"
    >
      <div className="max-w-[1080px] mx-auto flex items-center justify-between gap-[40px]">
        {/* Left: Text and stats */}
        <div className="flex-1 max-w-[656px]">
          <h2
            className={`text-[22px] font-bold text-primary tracking-[2%] mb-[24px] font-raleway transition-all duration-700 ease-out ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            Why{" "}
            <span className="bg-gradient-to-t from-[#F25C54] to-[#FF914D] bg-clip-text text-transparent">
              {heading}
            </span>
          </h2>
          <p
            className={`text-[16px] mb-[28px] font-[Nunito] text-left transition-all duration-900 ease-out delay-200 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            {subHeading}
          </p>
          <div
            className={`flex items-center justify-between gap-[24px] mb-[24px] transition-all duration-900 ease-out delay-400 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <div>
              <h5 className="text-[18px] font-bold text-center mb-2 font-[Nunito] leading-[1.5]">
                {customerCount}+
              </h5>
              <p className="text-center font-[Nunito] max-w-[110px]">{text1}</p>
            </div>
            <div>
              <h5 className="text-[18px] font-bold text-center mb-2 font-[Nunito] leading-[1.5]">
                {destCount}+
              </h5>
              <p className="text-center font-[Nunito] max-w-[110px]">{text2}</p>
            </div>
            <div>
              <h5 className="text-[18px] font-bold text-center mb-2 font-[Nunito] leading-[1.5]">
                {yearsCount}+
              </h5>
              <p
                className={`text-center font-[Nunito] ${
                  text3 === "Years of Experience"
                    ? "max-w-[110px]"
                    : "max-w-[140px]"
                }`}
              >
                {text3}
              </p>
            </div>
          </div>
          <Link
            href="/about"
            className={`inline-block transition-all duration-900 ease-out delay-400 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <button className="pl-[12px] pr-[8px] py-[4px] rounded-[8px] text-white text-[18px] font-[Nunito] font-semibold bg-gradient-to-t from-[#F25C54] to-[#FF914D] flex items-center gap-[5px] cursor-pointer hover:shadow-lg transition-shadow">
              Learn More
              <svg
                width="17"
                height="17"
                viewBox="0 0 17 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.459 8.5H3.542m9.917 0-4.25 4.25m4.25-4.25-4.25-4.25"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Link>
        </div>

        {/* Right: Video with play button */}
        <div
          className={`relative max-w-[387px] w-full transition-all duration-900 ease-out delay-500 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          <div className="relative rounded-[16px] overflow-hidden shadow-lg">
            {videoError ? (
              <div className="w-[384px] h-[278px] rounded-[16px] flex items-center justify-center bg-gray-900 text-white">
                <p className="text-sm">Video temporarily unavailable</p>
              </div>
            ) : isPlaying ? (
              <video
                ref={videoRef}
                className="w-[384px] h-[278px] rounded-[16px]"
                controls={isPlaying}
                poster="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
                onError={handleVideoError}
              >
                <source src="/videos/travulu-intro.mp4" type="video/mp4" />
                <source src="/videos/travulu-intro.webm" type="video/webm" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <Image
                className="w-[384px] h-[278px] rounded-[16px]"
                width={384}
                height={278}
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
                alt="video thumbnail"
              />
            )}
            {/* Play button overlay */}
            {!isPlaying && !videoError && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 cursor-pointer hover:bg-opacity-30 transition-all"
                onClick={handlePlayVideo}
              >
                <VideoPlayIcon className="w-[53px] h-[53px]" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
