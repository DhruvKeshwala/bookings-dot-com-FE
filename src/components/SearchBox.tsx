"use client";

import { ServiceTypeEnum } from "@/common/enums";
import HotelIcon from "@/components/icons/HotelIcon";
import PlaneIcon from "@/components/icons/PlaneIcon";
import HotelSearchInput from "@/views/no-auth/landing/components/HotelSearchInput";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FlightSearchInput from "./FlightSearchInput";

export default function SearchBox(initialValue: any) {
  const router = useRouter();
  const pathname = usePathname();

  const [activeService, setActiveService] = useState<ServiceTypeEnum>(
    ServiceTypeEnum.Flight
  );

  useEffect(() => {
    if (pathname?.includes("/flight")) setActiveService(ServiceTypeEnum.Flight);
    else if (pathname?.includes("/hotel"))
      setActiveService(ServiceTypeEnum.Hotel);
    else if (pathname?.includes("/bus")) setActiveService(ServiceTypeEnum.Bus);
    else if (pathname?.includes("/shop"))
      setActiveService(ServiceTypeEnum.Shop);
    else if (pathname?.includes("/gigs"))
      setActiveService(ServiceTypeEnum.Gigs);
    else setActiveService(ServiceTypeEnum.Flight);
  }, [pathname]);

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

  // Use prop value if provided, otherwise use local state
  const renderServiceForm = () => {
    switch (activeService) {
      case ServiceTypeEnum.Flight:
        return <FlightSearchInput initialValue={initialValue} />;
      case ServiceTypeEnum.Hotel:
        return <HotelSearchInput />;
      case ServiceTypeEnum.Bus:
        // return <div>{ServiceTypeEnum.Bus}</div>;
        return <div></div>;
      case ServiceTypeEnum.Shop:
        // return <div>{ServiceTypeEnum.Shop}</div>;
        return <div></div>;
      case ServiceTypeEnum.Gigs:
        // return <div>{ServiceTypeEnum.Gigs}</div>;
        return <div></div>;
      default:
        return <FlightSearchInput initialValue={initialValue} />;
    }
  };

  return (
    <div className="max-w-[1080px] rounded-[16px] flex flex-col mx-auto justify-center w-full bg-foreground">
      <div className="flex w-full flex-col justify-center h-full items-start mx-auto py-4 px-4">
        {/* Product Offerings Tabs */}
        <div className="flex flex-wrap text-primary w-full items-center gap-[24px] justify-start overflow-x-auto scrollbar-hide">
          {productOfferingTabs.map(({ icon, title, type, path }, index) => (
            <button
              key={`${index}-${type}`}
              type="button"
              className={`flex justify-center items-center rounded-[8px] border-[2px] gap-[5px] py-1 min-w-[84px] cursor-pointer disabled:cursor-not-allowed ${
                activeService === type ? "bg-primary text-foreground" : ""
              }`}
              onClick={() => {
                setActiveService(type);
                router.push(path);
              }}
            >
              {icon}
              <span
                className={activeService !== type ? "hidden lg:inline" : ""}
              >
                {title}
              </span>
            </button>
          ))}
        </div>
        {renderServiceForm()}
      </div>
    </div>
  );
}
