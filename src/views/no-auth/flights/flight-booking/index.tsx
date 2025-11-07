"use client";
import { usePathname } from "next/navigation";
import SidebarMenu from "@/components/SidebarMenu";
import FlightBookingContent from "./components/FlightBookingContent";
import RecommendedDestinations from "@/components/RecommendedDestinations";

export default function FlightBooking() {
  const activePath = usePathname();

  return (
    <div className="flex bg-white">
      <SidebarMenu activePath={activePath} />
      <main className="px-3 py-6  ">
        <FlightBookingContent />
        <RecommendedDestinations />
      </main>
    </div>
  );
}
