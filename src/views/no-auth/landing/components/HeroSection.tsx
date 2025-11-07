"use client";
import { ServiceTypeEnum } from "@/common/enums";
import HotelIcon from "@/components/icons/HotelIcon";
import PlaneIcon from "@/components/icons/PlaneIcon";
import SignInModal from "@/views/no-auth/layout/Header/SignInModal";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FlightSearchInput from "./FlightSearchInput";
import HotelSearchInput from "./HotelSearchInput";
import Lottie from "lottie-react";
import MapIcon from "@/components/icons/MapIcon";

export default function HeroSection() {
  const router = useRouter();
  const pathname = usePathname();
  const [sessionRecord, setSessionRecord] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  const [activeService, setActiveService] = useState<ServiceTypeEnum>(
    ServiceTypeEnum.Home
  );
  const [isVisible, setIsVisible] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false);
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch("/animations/flight-hero.json")
      .then((response) => response.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Failed to load animation:", err));
  }, []);

  useEffect(() => {
    if (pathname?.includes("/flight")) setActiveService(ServiceTypeEnum.Flight);
    else if (pathname?.includes("/hotel"))
      setActiveService(ServiceTypeEnum.Hotel);
    else if (pathname?.includes("/bus")) setActiveService(ServiceTypeEnum.Bus);
    else if (pathname?.includes("/shop"))
      setActiveService(ServiceTypeEnum.Shop);
    else if (pathname?.includes("/gigs"))
      setActiveService(ServiceTypeEnum.Gigs);
    else setActiveService(ServiceTypeEnum.Home);
  }, [pathname]);

  useEffect(() => {
    setIsTextVisible(true);
    setTimeout(() => setIsVisible(true), 200);
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const URI = process.env.NEXT_PUBLIC_BASE_URI;
        if (!URI) {
          console.error("❌ Missing NEXT_PUBLIC_API_BASE_URL");
          return;
        }

        axios.defaults.baseURL = URI;

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("access-token")
            : null;

        const response = await axios.get("/auth/session", {
          baseURL: URI,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setSessionRecord(response?.data?.valid || response.data);
        // setIsSignInModalOpen(response?.data?.valid ? false : true);
        setError("");
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Error fetching session"
        );
        console.error("Session check error:", err);
        setTimeout(() => {
          setIsSignInModalOpen(true);
        }, 3000000);
      }
    };

    fetchSession();
  }, []);

  const productOfferingTabs = [
    {
      icon: <PlaneIcon />,
      title: "Flight",
      type: ServiceTypeEnum.Flight,
      path: "/flight",
    },
    // {
    //   icon: <BusIcon />,
    //   title: "Bus",
    //   type: ServiceTypeEnum.Bus,
    //   path: "/bus",
    // },
    {
      icon: <HotelIcon />,
      title: "Hotel",
      type: ServiceTypeEnum.Hotel,
      path: "/hotel",
    },
    // {
    //   icon: <ShopIcon />,
    //   title: "Shop",
    //   type: ServiceTypeEnum.Shop,
    //   path: "/shop",
    // },
    // {
    //   icon: <WorldIcon />,
    //   title: "Gigs",
    //   type: ServiceTypeEnum.Gigs,
    //   path: "/gigs",
    // },
  ];

  const renderServiceForm = () => {
    switch (activeService) {
      case ServiceTypeEnum.Flight:
        return <FlightSearchInput />;
      case ServiceTypeEnum.Hotel:
        return <HotelSearchInput />;
      case ServiceTypeEnum.Bus:
        return <div></div>;
      case ServiceTypeEnum.Shop:
        return <div></div>;
      case ServiceTypeEnum.Gigs:
        return <div></div>;
      default:
        return <FlightSearchInput />;
    }
  };

  return (
    <div className="px-5 pb-[70px]">
      <div className="py-[24px]">
        <div className="flex justify-between gap-8 max-w-[1080px] w-full mx-auto">
          <div className="max-w-[576px] w-full">
            <h1
              className={` hero-text text-white mb-[16px] transition-all duration-500 ease-out ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-12 opacity-0"
              }`}
            >
              Discover Your Next Adventure
            </h1>

            <div className="bg-[#E8F3FB] p-[24px] rounded-[16px]">
              {renderServiceForm()}
            </div>
          </div>
          <div className="relative max-h-[319px]">
            <div className="max-w-[433px] max-h-[319px] w-full overflow-hidden rounded-[24px]">
              {animationData ? (
                <Lottie
                  animationData={animationData}
                  loop={true}
                  autoplay={true}
                  style={{ width: "568px" }}
                />
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-white">Loading animation...</p>
                </div>
              )}
            </div>{" "}
            <div className="h-[36px] w-[36px] bg-white rounded-full flex items-center justify-center absolute left-[-16px] bottom-[-18px] z-20">
              <MapIcon />
            </div>
          </div>
        </div>
      </div>
      {/* <div className="bg-white h-full"/> */}
      {isSignInModalOpen && (
        <SignInModal
          isOpen={isSignInModalOpen}
          onClose={() => setIsSignInModalOpen(false)}
          onSwitchToSignUp={() => setIsSignInModalOpen(false)}
        />
      )}
    </div>
  );
}
