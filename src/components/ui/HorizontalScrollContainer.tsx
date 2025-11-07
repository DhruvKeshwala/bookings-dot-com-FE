import { useEffect, useRef, useState, ReactNode } from "react";
import { LeftArrowIcon } from "../icons/LeftArrowIcon";
import { RightArrowIcon } from "../icons/RightArrowIcon";

type HorizontalScrollContainerProps = {
  children: ReactNode;
  className?: string;
  scrollAmount?: number; // default: 300px
};

export const HorizontalScrollContainer = ({
  children,
  className = "",
  scrollAmount = 300,
}: HorizontalScrollContainerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 0);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === "left" ? -scrollAmount : scrollAmount;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => checkScroll();
    el.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  return (
    <div className="relative w-full">
      {showLeft && (
        <button
          className=" cursor-pointer absolute -left-8 top-1/2 -translate-y-1/2 z-10 bg-white backdrop-blur-2xl shadow-md rounded-full p-6"
          onClick={() => scroll("left")}
        >
          <LeftArrowIcon className="w-5 h-5" />
        </button>
      )}

      <div
        ref={scrollRef}
        className={`flex overflow-x-auto scrollbar-hide scroll-smooth gap-4 ${className}`}
      >
        {children}
      </div>

      {showRight && (
        <button
          className=" cursor-pointer absolute -right-8 top-1/2 -translate-y-1/2 z-10 bg-white backdrop-blur-2xl shadow-md rounded-full p-6"
          onClick={() => scroll("right")}
        >
          <RightArrowIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
