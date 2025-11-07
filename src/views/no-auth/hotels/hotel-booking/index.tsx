"use client";
import { usePathname } from "next/navigation";
import SidebarMenu from "@/components/SidebarMenu";
import HotelBookings from "@/views/auth/hotel-bookings";

export default function HotelBooking() {
  const activePath = usePathname();

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-[250px]">
        <SidebarMenu activePath={activePath} />
      </div>

      {/* Main Content */}
      <main className="flex-1 px-6 py-6 overflow-x-hidden ml-[50px]">
        <div className="max-w-screen-xl mx-auto">
          <HotelBookings />
        </div>
      </main>
    </div>
  );
}

