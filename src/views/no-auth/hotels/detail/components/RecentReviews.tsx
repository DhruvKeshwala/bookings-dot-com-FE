"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { RecentReviewsProps, Review } from "@/types/hotel.types";
import http from "@/services/http";

export default function RecentReviews({ hotel }: RecentReviewsProps) {
  // State for reviews
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [userTotalReviews, setUserTotalReviews] = useState<number | null>(null);


  const [expandedReviews, setExpandedReviews] = useState<Record<string | number, boolean>>({});

  const toggleReadMore = (id: string | number) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    async function fetchReviews() {
      if (!hotel?.HotelName) return;

      setLoading(true);
      try {
        const encodedName = encodeURIComponent(hotel.HotelName);

        const { data } = await http.get(`/hotels/reviews/byname/${encodedName}`);

        if (data.success && Array.isArray(data.reviews)) {
          setRating(data.rating);
          setUserTotalReviews(data.userTotalReviews);
          const mappedReviews = data.reviews.map((review: any) => ({
            id: review.time,
            initial: review.author_name?.[0]?.toUpperCase() || "?",
            name: review.author_name,
            location: review.relative_time_description,
            review: review.text,
            profile_photo_url: review.profile_photo_url,
            rating: review.rating,
          }));

          setReviews(mappedReviews);
        } else {
          console.error("Failed to load reviews:", data.message || data.error);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [hotel]);


  const reviewsData: Review[] = [
    {
      id: 1,
      initial: "N",
      name: "Name Surname",
      location: "Maharashtra, India",
      review:
        '"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat."',
    },
    {
      id: 2,
      initial: "A",
      name: "Name Surname",
      location: "Maharashtra, India",
      review:
        '"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat."',
    },
    {
      id: 3,
      initial: "D",
      name: "Name Surname",
      location: "Maharashtra, India",
      review:
        '"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat."',
    },
    {
      id: 4,
      initial: "R",
      name: "Name Surname",
      location: "Maharashtra, India",
      review:
        '"Amazing stay with excellent service and beautiful rooms. Highly recommended for families."',
    },
    {
      id: 5,
      initial: "S",
      name: "Name Surname",
      location: "Karnataka, India",
      review:
        '"Great location and friendly staff. Will definitely visit again next time."',
    },
  ];


  const getVisibleReviews = () => {
    const visibleCount = 5;
    const source = reviews.length > 0 ? reviews : reviewsData;

    const visible = source.slice(0, visibleCount).map((review) => {
      if ('author_name' in review) {
        return {
          id: review.author_name || `review-${review.time}` || `review-${Math.random()}`,
          initial: review.author_name ? review.author_name.charAt(0).toUpperCase() : "?",
          name: review.author_name,
          location: review.relative_time_description,
          review: `"${review.text}"`,
          profile_photo_url: review.profile_photo_url || null,
          rating: review.rating,
        };
      } else {
        return review;
      }
    });

    return visible;
  };

  const toggleReviews = () => setIsReviewsExpanded(!isReviewsExpanded);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          width="15"
          height="15"
          fill={i <= rating ? "#ffbb29" : "#d1d5db"}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 .587l3.668 7.568L24 9.423l-6 5.848 1.417 8.27L12 18.897l-7.417 4.644L6 15.27 0 9.423l8.332-1.268z" />
        </svg>
      );
    }
    return <div className="flex gap-1">{stars}</div>;
  };


  return (
    <div className="mb-8">
      <div className="flex flex-col gap-6 p-3 md:p-6 border-[1.5px] border-black/30 rounded-2xl bg-white">
        {/* Header */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl md:text-2xl font-bold text-black font-raleway capitalize">
                Recent reviews
              </h3>
              <svg
                onClick={toggleReviews}
                className={`w-8 h-8 cursor-pointer ${isReviewsExpanded ? "" : "rotate-180"
                  }`}
                viewBox="0 0 32 33"
                fill="none"
              >
                <path
                  d="M8 20.0259L16 12.0259L24 20.0259"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-xs text-black font-nunito capitalize">
              Reviews are verified unless labeled otherwise.
            </p>
          </div>

          {/* Rating Summary */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <div className="flex w-11 h-11 px-1.5 py-0.75 flex-col justify-center items-center gap-1.5 rounded bg-[#218701]">
                <span className="text-white text-center font-roboto text-base font-normal leading-6">
                  {rating !== null ? rating.toFixed(1) : "8.9"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm md:text-lg font-bold text-black font-nunito">
                  Exceptional
                </span>
                <span className="text-xs md:text-base text-black font-nunito opacity-80">
                  {userTotalReviews !== null ? `${userTotalReviews} Reviews on Google` : "349 Reviews"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {isReviewsExpanded && (
          <>
            {loading ? (
              <div className="w-full py-8 flex justify-center items-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-4 border-[#F25C54] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500 font-nunito">Fetching reviews...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Review Cards with Navigation */}
                <div className="relative overflow-hidden">

                  {/* Slidable Review Cards */}
                  {/* Desktop Reviews - Hidden on mobile */}
                  <div className="hidden md:flex w-full overflow-x-auto hide-scrollbar gap-6 flex-row transition-transform duration-300">
                    {getVisibleReviews().map((review) => (
                      <div
                        key={review.id}
                        className="flex flex-1 flex-col gap-4 p-4 border-[1.5px] border-black/30 rounded-lg bg-white"
                      >
                        <div className="w-[300px] flex flex-col gap-4">
                          {/* Reviewer Header */}
                          <div className="flex items-center gap-4">
                            <div className="flex w-15 h-15 rounded-full bg-[#FDF0D5] overflow-hidden justify-center items-center">
                              {review.profile_photo_url ? (
                                <img
                                  src={review.profile_photo_url}
                                  alt={review.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span className="text-2xl font-medium text-black font-raleway capitalize">
                                  {review.initial}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <h5 className="text-base md:text-2xl font-bold text-black font-raleway capitalize">
                                {review.name}
                              </h5>
                              <div className="flex items-center gap-2">
                                {typeof review.rating === 'number' && renderStars(review.rating)}
                                <p className="text-xs text-black font-raleway capitalize">{review.location}</p>
                              </div>
                            </div>
                          </div>

                          {/* Review Content */}
                          <div className="flex flex-col gap-4">
                            <p
                              className={`text-xs md:text-base text-black font-nunito leading-[140%] w-[300px] 
                            ${expandedReviews[review.id] ? 'max-h-60 overflow-y-auto pr-2' : ''}`}
                              style={{
                                whiteSpace: 'pre-wrap',
                                width: window.innerWidth >= 1400 ? '300px' : 'auto',
                              }}
                            >
                              {expandedReviews[review.id]
                                ? review.review
                                : review.review.length > 300
                                  ? `${review.review.slice(0, 300)}...`
                                  : review.review}
                            </p>

                            {review.review.length > 300 && (
                              <button
                                onClick={() => toggleReadMore(review.id)}
                                className="cursor-pointer text-base font-bold text-[#F25C54] font-nunito leading-[140%] underline text-left hover:text-[#d5352dc2] transition-colors"
                              >
                                {expandedReviews[review.id] ? "Read Less" : "Read More"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile Reviews - Swiper - Only visible on mobile */}
                  <div className="md:hidden w-full">
                    <Swiper
                      modules={[Pagination]}
                      spaceBetween={16}
                      slidesPerView={1.2}
                      grabCursor={true}
                      className="w-full"
                      onSwiper={(swiper) => {
                        // Store swiper instance for custom pagination
                        (window as any).reviewSwiper = swiper;
                      }}
                      onSlideChange={(swiper) => {
                        setActiveSlideIndex(swiper.activeIndex);
                      }}
                      breakpoints={{
                        440: {
                          slidesPerView: 1,
                          spaceBetween: 20,
                        },
                        640: {
                          slidesPerView: 2,
                          spaceBetween: 24,
                        }
                      }}
                    >
                      {getVisibleReviews().map((review) => (
                        <SwiperSlide key={review.id}>
                          <div className="flex flex-1 flex-col gap-4 p-4 border-[1.5px] border-black/30 rounded-lg bg-white">
                            <div className="w-full flex flex-col gap-4">
                              {/* Reviewer Header */}
                              <div className="flex items-center gap-4">
                                <div className="flex w-15 h-15 rounded-full bg-[#FDF0D5] overflow-hidden justify-center items-center">
                                  {review.profile_photo_url ? (
                                    <img
                                      src={review.profile_photo_url}
                                      alt={review.name}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <span className="text-2xl font-medium text-black font-raleway capitalize">
                                      {review.initial}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <h5 className="text-base md:text-2xl font-bold text-black font-raleway capitalize">
                                    {review.name}
                                  </h5>
                                  <p className="text-xs text-black font-raleway capitalize">
                                    {review.location}
                                  </p>
                                </div>
                              </div>

                              {/* Review Content */}
                              <div className="flex flex-col gap-4">
                                <p className="text-xs md:text-base text-black font-nunito leading-[140%]">
                                  {expandedReviews[review.id]
                                    ? review.review
                                    : review.review.length > 300
                                      ? `${review.review.slice(0, 300)}...`
                                      : review.review}
                                </p>
                                {review.review.length > 300 && (
                                  <button
                                    onClick={() => toggleReadMore(review.id)}
                                    className="cursor-pointer text-base font-bold text-[#F25C54] font-nunito leading-[140%] underline text-left hover:text-[#d5352dc2] transition-colors"
                                  >
                                    {expandedReviews[review.id] ? "Read Less" : "Read More"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    {/* Custom Pagination */}
                    <div className="flex justify-center items-center gap-2 mt-6">
                      {getVisibleReviews().map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            const swiper = (window as any).reviewSwiper;
                            if (swiper) {
                              swiper.slideTo(index);
                            }
                          }}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeSlideIndex
                            ? 'bg-[#00B4D8] scale-110'
                            : 'bg-[#d1d5db] opacity-50 hover:opacity-75'
                            }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

              </>
            )}
          </>
        )}
      </div>
    </div>
  );
} 