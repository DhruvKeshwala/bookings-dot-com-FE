import React, { useState } from "react";
import ImageGallery from "../../search/components/ImageGallery";
import { HotelImageGalleryProps } from "@/types/hotel.types";

const fallbackImages = [
  "https://images.unsplash.com/photo-1549294413-26f195200c16?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1576675783361-998aa39de3d7?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1501117716987-c8e1ecb2101f?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1552924920-e1e6d8b4b5a4?w=800&h=600&fit=crop",
];

const HotelImages: React.FC<HotelImageGalleryProps> = ({ hotel }) => {
  const images = hotel.Images?.length ? hotel.Images : fallbackImages;
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const defaultImage = "/assets/stories/transition_page_image.png";
  const galleryImages = hotel.Images?.length ? hotel.Images : [defaultImage];

  const handleImageClick = (index: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setStartIndex(index);
    setIsGalleryOpen(true);
  };

  return (
    <>
      {/* 🖥 Desktop Image Layout */}
      <div className="w-full h-[400px] gap-1 rounded-2xl overflow-hidden hidden md:flex">
        {/* Left Large Image */}
        <div className="w-1/2 h-full">
          <img
            src={images[0]}
            alt={hotel.name}
            className="w-full h-full object-cover cursor-pointer"
            onClick={handleImageClick(0)}
          />
        </div>

        {/* Right 2x2 Grid */}
        <div className="w-1/2 grid grid-cols-2 grid-rows-2 gap-1">
          {images.slice(1, 5).map((img, index) => (
            <img
              key={index + 1}
              src={img}
              alt={`${hotel.name} ${index + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={handleImageClick(index + 1)}
            />
          ))}
        </div>
      </div>

      {/* 📱 Mobile / Tablet View */}
      <div className="w-full h-auto rounded-2xl overflow-hidden md:hidden">
        <img
          src={images[0]}
          alt={hotel.name}
          className="w-full h-full object-cover"
          onClick={handleImageClick(0)}
        />
      </div>

      {/* 🔍 Fullscreen Gallery Modal */}
      {isGalleryOpen && (
        <ImageGallery
          isOpen={true}
          onClose={() => setIsGalleryOpen(false)}
          images={galleryImages}
          initialIndex={startIndex}
          hotelName={hotel.name}
        />
      )}
    </>
  );
};

export default HotelImages;
