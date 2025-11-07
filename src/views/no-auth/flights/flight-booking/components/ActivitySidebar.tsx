"use client";

import Button from "@/components/ui/NewButton";
import Image from "next/image";
import { useEffect, useState } from "react";
import http from "@/services/http";
import { UpcomingNotification } from "@/types/upcoming-notification.types";

export default function ActivitySidebar() {
  const [upcoming, setUpcoming] = useState<UpcomingNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcoming = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await http.get("/users/upcoming-notifications");
        setUpcoming(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        setError("Failed to load upcoming notifications");
      } finally {
        setLoading(false);
      }
    };
    fetchUpcoming();
  }, []);

  return (
    <div className="w-80 space-y-6">
      {/* Upcoming Activity Section */}
      <aside className="bg-white rounded-xl shadow px-3 py-3 border border-[#e5e7eb]">
        <div className="font-semibold mb-4">Upcoming Activity</div>
        {loading ? (
          <div className="text-xs text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-xs text-red-400">{error}</div>
        ) : upcoming.length === 0 ? (
          <div className="text-xs text-gray-400">No upcoming activity</div>
        ) : (
          <ul className="space-y-4 mb-4">
            {upcoming.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#DBEAFE] rounded-full flex items-center justify-center ">
                  <Image src="/icons/flight.svg" alt="Flight" width={20} height={20} />
                </div>
                <div>
                  <div className="font-semibold">
                    {item.segments[0]?.origin} → {item.segments[item.segments.length-1]?.destination}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {new Date(item.segments[0]?.departureTime).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="font-semibold mb-3">Recent Notifications</div>
        <ul className="space-y-2 text-xs">
          <li className="bg-[#eaf6ff] text-[#016aa2] px-2 py-2 rounded-lg font-medium">Your flight to New York has been confirmed!</li>
          <li className="bg-red-100 text-[#f25c54] px-2 py-2 rounded-lg font-medium">Limited time offer: 20% off all hotel bookings!</li>
        </ul>
      </aside>
      {/* Contact Us Button */}
      <Button variant="solid" type="button" color="secondary" className="w-full">
        Contact Us
      </Button>
    </div>
  );
}
