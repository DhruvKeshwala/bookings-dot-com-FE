"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SidebarMenu from "@/components/SidebarMenu";
import RecommendedDestinations from "@/components/RecommendedDestinations";
import http from "@/services/http";
import { getStorageItem } from "@/services/storage";
import { LOCAL_KEY } from "@/common/enums";
import GigsYouMightLike from "@/components/GigsYouMightLike";
import YouMayAlsoLike from "@/components/YouMayAlsoLike";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getInitials = (first = "", last = "") => {
    return `${first[0] || ""}${last[0] || ""}`.toUpperCase();
  };

  useEffect(() => {
    async function fetchUser() {
      try {
        const storedUser = getStorageItem(LOCAL_KEY.USER);
        const userObj = storedUser ? JSON.parse(storedUser) : null;
        if (!userObj) {
          router.push("/");
          return;
        }
        // Always fetch latest user from API (GET, with token)
        const token = getStorageItem(LOCAL_KEY.ACCESS_TOKEN);
        let latestUser = null;
        if (token) {
          try {
            const res = await http.get("/users/user-detail", {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data && res.data.user) {
              latestUser = res.data.user;
              setUser(latestUser);
              // Save full user object (with profile/avatar) to localStorage
              localStorage.setItem(LOCAL_KEY.USER, JSON.stringify(latestUser));
            } else {
              setUser(userObj);
            }
          } catch {
            setUser(userObj);
          }
        } else {
          setUser(userObj);
        }
      } catch (err) {
        // If API fails, do not clear user, just log error
        console.error("Failed to fetch user from API", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  // Redirect if no user after loading
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);

  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";

  // Show loading state
  if (loading) {
    return (
      <div className="flex bg-[#f7fafd] min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Don't render if no user
  if (!user) {
    return null;
  }
  console.log("User data:", user);

  return (
    <div className="flex bg-[#f7fafd] ">
      {/* Sidebar */}
      <SidebarMenu activePath={pathname} />
      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              Welcome back, {user?.firstName || "user"}!
            </h2>
            <p className="text-gray-600">
              Every journey begins with a single booking where are we off to
              next?
            </p>
          </div>
          <button className="px-5 py-2 border border-[#2FAEFF] rounded-lg text-[#2FAEFF] font-semibold shadow hover:bg-[#eaf6ff]">
            Upgrade Membership
          </button>
        </div>
        <div className="flex gap-8 items-start mb-8">
          {/* Calendar & Stats */}
          <section>
            {/* Tabs */}

            {/* Real Calendar - wide and perfect UI */}
            <div className="bg-white rounded-2xl shadow p-6 mb-6  mx-auto border border-[#e5e7eb]">
              <div className="flex gap-4 mb-6">
                <button className="px-4 py-1 rounded-xl  text-lg bg-[#0a2a4d] text-white border-2 border-[#0a2a4d] shadow">
                  All
                </button>
                <button className="px-4 py-1 rounded-xl  text-lg bg-white border-2 border-[#0a2a4d] text-[#0a2a4d]">
                  Flight
                </button>
                <button className="px-4 py-1 rounded-xl  text-lg bg-white border-2 border-[#0a2a4d] text-[#0a2a4d]">
                  Bus
                </button>
                <button className="px-4 py-1 rounded-xl  text-lg bg-white border-2 border-[#0a2a4d] text-[#0a2a4d]">
                  Hotel
                </button>
                <button className="px-4 py-1 rounded-xl  text-lg bg-white border-2 border-[#0a2a4d] text-[#0a2a4d]">
                  Products
                </button>
                <button className="px-4 py-1 rounded-xl  text-lg bg-white border-2 border-[#0a2a4d] text-[#0a2a4d]">
                  Gigs
                </button>
              </div>

              {/* Custom Calendar */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">May 2025</h3>
                  <div className="flex gap-2">
                    <button className="p-1 rounded-full hover:bg-gray-100">
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100">
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["Sun", "Mon", "Tus", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center font-medium text-gray-500 py-2"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {/* Previous month days */}
                  {[27, 28, 29, 30].map((day) => (
                    <div
                      key={`prev-${day}`}
                      className="text-center py-2 text-gray-400"
                    >
                      {day}
                    </div>
                  ))}

                  {/* Current month days */}
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <div
                      key={`current-${day}`}
                      className="text-center py-2 relative"
                    >
                      {day}
                      {/* Events */}
                      {day === 5 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded-b-lg">
                          Hotel Check-In
                        </div>
                      )}
                      {day === 22 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-green-100 text-green-800 text-xs px-1 py-0.5 rounded-b-lg">
                          Product Delivery
                        </div>
                      )}
                      {day === 29 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-red-100 text-red-800 text-xs px-1 py-0.5 rounded-b-lg">
                          Gig Deadline
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          {/* Profile & Activity */}
          <div className="flex flex-col gap-4  flex-shrink-0">
            {/* Profile Card */}
            <aside
              className="bg-white rounded-xl shadow p-2 border border-[#e5e7eb]"
              key={user.avatar || user.firstName + user.lastName}
            >
              <div className="flex items-center gap-4">
                {/* Profile image with fallback to initials */}
                <div className="relative w-12 h-12">
                  {/* Prefer user.profile.avatarUrl, fallback to user.avatarUrl, then user.avatar */}
                  {user &&
                  (user.profile?.avatarUrl || user.avatarUrl || user.avatar) ? (
                    <Image
                      src={(() => {
                        const raw =
                          user.profile?.avatarUrl ||
                          user.avatarUrl ||
                          user.avatar;
                        if (/^https?:\/\//.test(raw)) return raw;
                        return `https://api.travulu.com${
                          raw.startsWith("/") ? raw : "/" + raw
                        }`;
                      })()}
                      alt="Profile"
                      width={48}
                      height={48}
                      className="rounded-full object-cover w-12 h-12"
                      onError={(e) => {
                        // Hide image and show initials if image fails
                        const img = e.currentTarget;
                        img.style.display = "none";
                        const fallback = img.parentElement?.querySelector(
                          ".dashboard-initials-fallback"
                        );
                        if (fallback)
                          (fallback as HTMLElement).style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="dashboard-initials-fallback w-12 h-12 flex items-center justify-center bg-[#eaf6ff] text-[#2FAEFF] font-bold rounded-full text-xl absolute top-0 left-0"
                    style={{
                      display:
                        user &&
                        (user.profile?.avatarUrl ||
                          user.avatarUrl ||
                          user.avatar)
                          ? "none"
                          : "flex",
                    }}
                  >
                    {user ? getInitials(user.firstName, user.lastName) : "?"}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-base">
                    {user
                      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                      : "User"}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    Premium Member
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm">
                      Loyalty points:-
                    </span>
                    <span className="font-bold text-[#f25c54] text-sm">
                      ₹1500
                    </span>
                  </div>
                </div>
              </div>
            </aside>
            {/* Activity & Notifications Card */}
            <aside className="bg-white rounded-xl shadow px-3 py-3 border border-[#e5e7eb]">
              <div className="font-semibold mb-4">Upcoming Activity</div>
              <ul className="space-y-4 mb-4">
                <li className="flex items-center gap-3">
                  <span className="bg-purple-100 p-2 rounded-full flex items-center justify-center">
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="#a78bfa"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M2.5 19.5L21.5 12L2.5 4.5L6.5 12L2.5 19.5Z" />
                    </svg>
                  </span>
                  <div>
                    <div className="font-semibold">Flight to New York</div>
                    <div className="text-gray-400 text-xs">
                      Tomorrow, 10:30 AM
                    </div>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <span className="bg-blue-100 p-2 rounded-full flex items-center justify-center">
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <rect x="4" y="8" width="16" height="8" />
                      <rect x="9" y="12" width="6" height="4" />
                    </svg>
                  </span>
                  <div>
                    <div className="font-semibold">Hotel Check-in</div>
                    <div className="text-gray-400 text-xs">
                      Tomorrow, 10:30 AM
                    </div>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <span className="bg-green-100 p-2 rounded-full flex items-center justify-center">
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="10" cy="10" r="8" />
                      <path d="M10 6v4l3 3" />
                    </svg>
                  </span>
                  <div>
                    <div className="font-semibold">Product Delivery</div>
                    <div className="text-gray-400 text-xs">25, May 2025</div>
                  </div>
                </li>
              </ul>
              <div className="font-semibold mb-3">Recent Notifications</div>
              <ul className="space-y-2 text-xs">
                <li className="bg-[#eaf6ff] text-[#016aa2] px-2 py-2 rounded-lg font-medium">
                  Your flight to New York has been confirmed!
                </li>
                <li className="bg-red-100 text-[#f25c54] px-2 py-2 rounded-lg font-medium">
                  Limited time offer: 20% off all hotel bookings!
                </li>
              </ul>
            </aside>
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {/* Flight Bookings */}
          <div className="bg-white rounded-lg p-3 shadow flex flex-col items-start border border-[#e5e7eb]">
            <div className="flex justify-between items-center w-full mb-2">
              <div className="text-gray-500 text-sm">Flight Bookings</div>
              <span className="bg-purple-100 p-2 rounded-full">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M2.5 19.5L21.5 12L2.5 4.5L6.5 12L2.5 19.5Z" />
                </svg>
              </span>
            </div>
            <div className="font-bold text-xl mb-1">12</div>
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <span>▲</span>
              <span>+2 from last month</span>
            </div>
          </div>
          {/* Bus Bookings */}
          <div className="bg-white rounded-lg p-3 shadow flex flex-col items-start border border-[#e5e7eb]">
            <div className="flex justify-between items-center w-full mb-2">
              <div className="text-gray-500 text-sm">Bus Bookings</div>
              <span className="bg-yellow-100 p-2 rounded-full">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="#facc15"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <rect x="8" y="8" width="8" height="8" />
                </svg>
              </span>
            </div>
            <div className="font-bold text-xl mb-1">5</div>
            <div className="flex items-center gap-1 text-red-500 text-xs">
              <span>▼</span>
              <span>-1 from last month</span>
            </div>
          </div>
          {/* Hotel Bookings */}
          <div className="bg-white rounded-lg p-3 shadow flex flex-col items-start border border-[#e5e7eb]">
            <div className="flex justify-between items-center w-full mb-2">
              <div className="text-gray-500 text-sm">Hotel Bookings</div>
              <span className="bg-blue-100 p-2 rounded-full">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect x="4" y="8" width="16" height="8" />
                  <rect x="9" y="12" width="6" height="4" />
                </svg>
              </span>
            </div>
            <div className="font-bold text-xl mb-1">18</div>
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <span>▲</span>
              <span>+5 from last month</span>
            </div>
          </div>
          {/* Product Orders */}
          <div className="bg-white rounded-lg p-3 shadow flex flex-col items-start border border-[#e5e7eb]">
            <div className="flex justify-between items-center w-full mb-2">
              <div className="text-gray-500 text-sm">Product Orders</div>
              <span className="bg-green-100 p-2 rounded-full">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
              </span>
            </div>
            <div className="font-bold text-xl mb-1">18</div>
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <span>▲</span>
              <span>+12 from last month</span>
            </div>
          </div>
          {/* Completed Gigs */}
          <div className="bg-white rounded-lg p-3 shadow flex flex-col items-start border border-[#e5e7eb]">
            <div className="flex justify-between items-center w-full mb-2">
              <div className="text-gray-500 text-sm">Completed Gigs</div>
              <span className="bg-red-100 p-2 rounded-full">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="#f87171"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
              </span>
            </div>
            <div className="font-bold text-xl mb-1">13</div>
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <span>▲</span>
              <span>+5 from last month</span>
            </div>
          </div>
        </div>
        {/* Recommended Destinations Slider */}
        <RecommendedDestinations />
        <YouMayAlsoLike />
        <GigsYouMightLike />
      </main>
    </div>
  );
}
