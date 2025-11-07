import { homePageLauncherrData, testimonialsHome } from "@/utils/data/home";
import AiSearchSection from "./components/AiSearchBar";
import CustomerSuccessStories from "./components/CustomerSuccessStories";
import HeroSection from "./components/HeroSection";
import LatestBlogPosts from "./components/LatestBlogPosts";
import WhyLauncherr from "./components/WhyLauncherr";

export default function Landing() {
  return (
    <>
      <div className="bg-primary mt-[85px]">
        <HeroSection />
      </div>
      <AiSearchSection/>
      <CustomerSuccessStories {...testimonialsHome} />
      <LatestBlogPosts />
      <WhyLauncherr {...homePageLauncherrData} />
    </>
  );
}
