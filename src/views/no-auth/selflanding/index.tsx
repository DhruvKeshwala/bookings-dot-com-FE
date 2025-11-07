import {
  flightPageLauncherrData,
  FlightTestimonials,
  hotelPageLauncherrData,
  HotelTestimonials,
} from "@/utils/data/home";
import CustomerSuccessStories from "../landing/components/CustomerSuccessStories";
import WhyLauncherr from "../landing/components/WhyLauncherr";
import LatestBlogPosts from "./components/LatestBlogPosts";
import HeroSection from "../landing/components/HeroSection";

type SelfLandingProps = {
  type?: string | undefined;
};

export default function SelfLanding({ type }: SelfLandingProps) {
  return (
    <>
      <div className="bg-primary mt-[85px]">
        <HeroSection />
      </div>
      {type === "flight" ? (
        <CustomerSuccessStories {...FlightTestimonials} />
      ) : (
        <CustomerSuccessStories {...HotelTestimonials} />
      )}

      <LatestBlogPosts type={type} />
      {type === "flight" ? (
        <WhyLauncherr {...flightPageLauncherrData} />
      ) : (
        <WhyLauncherr {...hotelPageLauncherrData} />
      )}
    </>
  );
}
