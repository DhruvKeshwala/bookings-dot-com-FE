"use client";

import React, { useState, useCallback, useEffect } from "react";
import { GoogleMap, Marker as GoogleMapMarker, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import { MapHotel, Marker } from "@/types/hotel.types";

export default function MapView({ hotels = [] }: { hotels: MapHotel[] }) {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [showMarkers, setShowMarkers] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileOrTablet(window.innerWidth <= 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Convert hotel data to marker data
  const hotelMarkers = hotels
    .map((hotel, idx) => {
      if (!hotel || !hotel.Map) return null;
      const [lat, lng] = hotel.Map.split("|").map(Number);
      if (isNaN(lat) || isNaN(lng)) return null;
      return {
        id: hotel.HotelCode || String(idx),
        name: hotel.HotelName,
        price: hotel.Rooms?.[0]?.TotalFare ?? 0,
        lat,
        lng,
        rating: hotel.HotelRating,
      } as Marker;
    })
    .filter((marker): marker is Marker => marker !== null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    })
      .format(price)
      .replace("₹", "₹ ");
  };

  // Fallback: if no hotels, show a dummy marker in the center (Delhi)
  const markersToShow: Marker[] = hotelMarkers.length > 0 ? hotelMarkers : [
    {
      id: '1',
      name: "No Hotels Found",
      price: 0,
      lat: 28.6139,
      lng: 77.209,
    },
  ];

  // Center map on the first marker or fallback
  const center = { lat: markersToShow[0].lat, lng: markersToShow[0].lng };

  // Google Maps API key from env
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: googleMapsApiKey || '',
  });

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (!isLoaded) {
    return <div className="w-full h-[419px] flex items-center justify-center bg-gray-100 rounded-lg">Loading map...</div>;
  }

  return (
    <>
      {
        (!isMobileOrTablet || showMobileMap) && (
          <> 
            <div className="w-full h-[419px] rounded-lg overflow-hidden relative z-[1] map-view-container">
              <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={center}
                  zoom={13}
                  onLoad={onLoad}
                  onUnmount={onUnmount}
                  options={{
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                  }}
                >
                  {showMarkers &&
                    markersToShow.map((hotel) => (
                      <GoogleMapMarker
                        key={hotel.id}
                        position={{ lat: hotel.lat, lng: hotel.lng }}
                        onMouseOver={() => setSelectedHotel(hotel.id)}
                        onMouseOut={() => setSelectedHotel(null)}
                        onClick={() => setSelectedHotel(hotel.id)}
                        label={{
                          text: formatPrice(hotel.price),
                          className:
                            selectedHotel === hotel.id
                              ? "bg-[#FF914D] text-white px-2 py-1 rounded-lg font-semibold"
                              : "bg-[#013B69] text-white px-2 py-1 rounded-lg font-semibold",
                        }}
                        icon={{
                          url:
                            selectedHotel === hotel.id
                              ? "http://maps.google.com/mapfiles/ms/icons/orange-dot.png"
                              : "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                        }}
                      >
                        {selectedHotel === hotel.id && (
                          <InfoWindow onCloseClick={() => setSelectedHotel(null)}>
                            <div className="min-w-[180px]">
                              <div className="text-sm font-semibold text-black mb-1">
                                {hotel.name}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-lg font-bold text-[#FF914D]">
                                  {formatPrice(hotel.price)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <svg
                                    className="w-3 h-3 text-yellow-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="text-xs font-medium text-gray-600">
                                    {hotel.rating}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </InfoWindow>
                        )}
                      </GoogleMapMarker>
                    ))}
              </GoogleMap>

              {!showMarkers && (
                <div className="absolute top-[190px] md:top-[200px] xl:top-[190px] left-1/2 transform -translate-x-1/2">
                  <button
                    onClick={() => setShowMarkers(true)}
                    className="bg-[#013B69] text-white flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg font-medium transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Show on map
                  </button>
                </div>
              )}

              {/* Close icon button (top right) */}
              {showMarkers && (
                <button
                  onClick={() => setShowMarkers(false)}
                  className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg z-10"
                  aria-label="Close map markers"
                >
                  <svg
                    className="w-6 h-6 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}

              {/* Map Legend - Only show when markers are visible */}
              {showMarkers && (
                <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-20">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Legend</div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-3 h-3 bg-[#013B69] rounded"></div>
                    <span>Hotel Price</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                    <div className="w-3 h-3 bg-[#FF914D] rounded"></div>
                    <span>Selected</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )
      }
      {isMobileOrTablet && !showMobileMap && (
        <button
          onClick={() => setShowMobileMap(true)}
          className="bottom-6 w-full bg-[#FF6B6B] hover:bg-[#ff6b6b8f] text-white px-4 py-2 rounded-lg shadow-md z-50 transition-all duration-300"
        >
          View In a Map
        </button>
      )}
    </>
  );
}
