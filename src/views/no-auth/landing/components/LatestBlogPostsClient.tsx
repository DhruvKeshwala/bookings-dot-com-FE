// "use client";

// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";

// type BlogPost = {
//   id: number;
//   title: string;
//   excerpt: string;
//   category: string;
//   created: string;
//   thumbnail: string;
//   slug: string;
// };

// type Props = {
//   posts: BlogPost[];
// };

// export default function LatestBlogPostsClient({ posts }: Props) {
//   const [isVisible, setIsVisible] = useState(false);
//   const sectionRef = React.useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             setIsVisible(true);
//           }
//         });
//       },
//       { threshold: 0.1 } // Trigger when 10% of the section is visible
//     );

//     if (sectionRef.current) {
//       observer.observe(sectionRef.current);
//     }

//     return () => {
//       if (sectionRef.current) {
//         observer.unobserve(sectionRef.current);
//       }
//     };
//   }, []);

//   if (!posts.length) {
//     return (
//       <div className="text-center text-black">
//         <h2 className="text-[22px] font-bold mb-4">No blogs available</h2>
//         <p className="font-nunito">Please check back later.</p>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <div
//         className={`flex justify-between mb-[16px] transition-all duration-700 ease-out ${
//           isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
//         }`}
//       >
//         <div>
//           <h5 className="text-[22px] text-[#014569] tracking-[2%] font-bold font-raleway">
//             Travel Tips, Trends & More
//           </h5>
//           <p className="text-[18px] font-[Nunito] leading-[1.5]">
//             Read blogs that make travel planning fun and easy.
//           </p>
//         </div>
//         <Link href="/blogs">
//           <button className="px-[8px] py-[4px] rounded-[8px] text-white text-[16px] font-[Nunito] font-semibold bg-[#014569] flex items-center gap-[5px] cursor-pointer">
//             View All
//           </button>
//         </Link>
//       </div>
//       <article ref={sectionRef} className="w-full bg-white">
//         <Swiper
//           modules={[Navigation]}
//           spaceBetween={20}
//           slidesPerView={1}
//           navigation={false}
//           breakpoints={{
//             480: { slidesPerView: 2 },
//             768: { slidesPerView: 3 },
//             1024: { slidesPerView: 4 },
//             1280: { slidesPerView: 4 },
//           }}
//         >
//           {posts.map((post, index) => (
//             <SwiperSlide key={post.id} className="py-10">
//               <Link
//                 href={`/blog/${post.slug.split("/").pop()}`}
//                 className="block max-w-[250px] w-full mx-auto"
//               >
//                 <div
//                   className={`bg-white rounded-[12px] shadow-md hover:shadow-lg hover:scale-105 transition-all duration-500 min-h-[360px] border border-[#E8E9F1] ${
//                     isVisible
//                       ? "translate-y-0 opacity-100"
//                       : "translate-y-12 opacity-0"
//                   }`}
//                   style={{ transitionDelay: `${100 + index * 300}ms` }}
//                 >
//                   <div className="w-full h-[145px] overflow-hidden bg-gray-100 rounded-t-[12px]">
//                     {post.thumbnail && post.thumbnail !== "none" ? (
//                       <Image
//                         src={`https://odoo.travulu.in${post.thumbnail.replace(
//                           /^url\((['"]?)(.*?)\1\)$/,
//                           "$2"
//                         )}`}
//                         alt={post.title}
//                         width={250}
//                         height={145}
//                         className="w-full h-full object-cover transition duration-300 "
//                       />
//                     ) : (
//                       <Image
//                         src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
//                         alt="placeholder"
//                         width={250}
//                         height={192}
//                         className="w-full h-full object-cover"
//                       />
//                     )}
//                   </div>

//                   <div className="p-3 min-h-[215px] flex flex-col gap-[] justify-between font-nunito">
//                     <div>
//                       <div className="flex items-center justify-between gap-3 mb-2">
//                         <span className="bg-[#E8E9F1] text-[13px] px-3 py-[4px] rounded-[8px] text-primary leading-none">
//                           {post.category}
//                         </span>
//                         <span className="text-[13px] text-black">
//                           {new Date(post.created).toLocaleDateString("en-US", {
//                             month: "short",
//                             day: "numeric",
//                             year: "numeric",
//                           })}
//                         </span>
//                       </div>

//                       <p className="font-semibold text-[16px] font-[Nunito] mb-2 line-clamp-1 overflow-hidden text-ellipsis whitespace-nowrap">
//                         {post.title}
//                       </p>

//                       <p className="text-[#484848] text-[16px] font-[Nunito] leading-auto line-clamp-4 overflow-hidden">
//                         {post.excerpt}
//                       </p>
//                     </div>

//                     <span className="text-black font-[Nunito] font-[600] flex items-center gap-1 hover:underline group">
//                       Read more
//                       <svg
//                         width="18"
//                         height="18"
//                         viewBox="0 0 18 18"
//                         fill="none"
//                         xmlns="http://www.w3.org/2000/svg"
//                       >
//                         <path
//                           d="M7.28023 14.5605L11.5605 10.2802L7.28023 6L6.21973 7.0605L9.43948 10.2802L6.21973 13.5L7.28023 14.5605Z"
//                           fill="black"
//                         />
//                       </svg>
//                     </span>
//                   </div>
//                 </div>
//               </Link>
//             </SwiperSlide>
//           ))}
//         </Swiper>
//       </article>
//     </div>
//   );
// }
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type BlogPost = {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  created: string;
  thumbnail: string;
  slug: string;
};

type Props = {
  posts: BlogPost[];
};

export default function LatestBlogPostsClient({ posts }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const getSlidesPerView = () => {
    if (typeof window === "undefined") return 1;
    const width = window.innerWidth;
    if (width >= 1024) return 4;
    if (width >= 768) return 3;
    if (width >= 480) return 2;
    return 1;
  };
  const [slidesPerView, setSlidesPerView] = useState(getSlidesPerView());

  useEffect(() => {
    const handleResize = () => setSlidesPerView(getSlidesPerView());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
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

  if (!posts.length) {
    return (
      <div className="text-center text-black">
        <h2 className="text-[22px] font-bold mb-4">No blogs available</h2>
        <p className="font-nunito">Please check back later.</p>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`flex justify-between mb-[16px] transition-all duration-700 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div>
          <h5 className="text-[22px] text-[#014569] tracking-[2%] font-bold font-raleway">
            Travel Tips, Trends & More
          </h5>
          <p className="text-[18px] font-[Nunito] leading-[1.5]">
            Read blogs that make travel planning fun and easy.
          </p>
        </div>
        <Link href="/blogs">
          <button className="px-[8px] py-[4px] rounded-[8px] text-white text-[16px] font-[Nunito] font-semibold bg-[#014569] flex items-center gap-[5px] cursor-pointer">
            View All
          </button>
        </Link>
      </div>
      <article ref={sectionRef} className="w-full bg-white">
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation={false}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.activeIndex);
          }}
          breakpoints={{
            480: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 4 },
          }}
        >
          {posts.map((post, index) => (
            <SwiperSlide key={post.id} className="py-10">
              <Link
                href={`/blog/${post.slug.split("/").pop()}`}
                className="block max-w-[250px] w-full mx-auto"
              >
                <div
                  className={`bg-white rounded-[12px] shadow-md hover:shadow-lg hover:scale-105 transition-all duration-500 min-h-[360px] border border-[#E8E9F1] ${
                    isVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-12 opacity-0"
                  }`}
                  style={{ transitionDelay: `${100 + index * 300}ms` }}
                >
                  <div className="w-full h-[145px] overflow-hidden bg-gray-100 rounded-t-[12px]">
                    {post.thumbnail && post.thumbnail !== "none" ? (
                      <Image
                        src={`https://odoo.travulu.in${post.thumbnail.replace(
                          /^url\((['"]?)(.*?)\1\)$/,
                          "$2"
                        )}`}
                        alt={post.title}
                        width={250}
                        height={145}
                        className="w-full h-full object-cover transition duration-300 "
                      />
                    ) : (
                      <Image
                        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                        alt="placeholder"
                        width={250}
                        height={192}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="p-3 min-h-[215px] flex flex-col gap-[] justify-between font-nunito">
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="bg-[#E8E9F1] text-[13px] px-3 py-[4px] rounded-[8px] text-primary leading-none">
                          {post.category}
                        </span>
                        <span className="text-[13px] text-black">
                          {new Date(post.created).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <p className="font-semibold text-[16px] font-[Nunito] mb-2 line-clamp-1 overflow-hidden text-ellipsis whitespace-nowrap">
                        {post.title}
                      </p>

                      <p className="text-[#484848] text-[16px] font-[Nunito] leading-auto line-clamp-4 overflow-hidden">
                        {post.excerpt}
                      </p>
                    </div>

                    <span className="text-black font-[Nunito] font-[600] flex items-center gap-1 hover:underline group">
                      Read more
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.28023 14.5605L11.5605 10.2802L7.28023 6L6.21973 7.0605L9.43948 10.2802L6.21973 13.5L7.28023 14.5605Z"
                          fill="black"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Pagination dots */}
        <div
          className={`flex justify-center gap-2 transition-all duration-700 ease-out delay-[700ms] ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {Array.from({
            length: Math.ceil(posts.length / slidesPerView),
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
      </article>
    </div>
  );
}
