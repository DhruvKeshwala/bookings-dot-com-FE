"use client";

import { ImageGalleryProps } from "@/types/hotel.types";
import { useState, useEffect } from "react";
import ReactDOM from "react-dom";

export default function ImageGallery({
  isOpen,
  onClose,
  images,
  hotelName,
  initialIndex,
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex ?? 0);

  useEffect(() => {
    setCurrentIndex(initialIndex ?? 0);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        goToPrevious(e);
      } else if (e.key === "ArrowRight") {
        goToNext(e);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex]);

  const goToNext = (e: any) => {
     e.stopPropagation(); 
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = (e:any) => {
     e.stopPropagation(); 
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  if (!isOpen) return null;

  // Use portal to render modal at the root of the DOM
  return ReactDOM.createPortal(
    (
      <div className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm bg-opacity-80 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0"
          onClick={(e) => {
            e.stopPropagation(); // Prevent bubbling to parent
            onClose(); // Your existing close logic
          }} />
        <div className="">
          {/* Left Arrow */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:scale-110 transition"
          >
            <svg
              className="w-6 h-6 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:scale-110 transition"
          >
            <svg
              className="w-6 h-6 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent bubbling to parent
              onClose(); // Your existing close logic
            }}
            className="absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:scale-110 transition"
          >
            <svg
              className="w-6 h-6 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative w-full max-w-[900px] max-h-[90vh] rounded-xl overflow-hidden shadow-2xl">
            {/* Image */}
            <img
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              className="w-full h-[600px] object-cover rounded-xl"
            />

            {/* Pagination Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`transition-all ${index === currentIndex
                      ? "w-8 h-3 bg-[#00B4D8] rounded-full"
                      : "w-3 h-3 bg-white/80 rounded-full hover:bg-white"
                      }`}
                  />
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    ),
    typeof window !== "undefined" ? document.body : (null as any)
  );
}