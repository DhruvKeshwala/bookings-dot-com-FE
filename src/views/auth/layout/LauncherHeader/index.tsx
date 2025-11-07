"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
// import Sidebar from "../Sidebar";
import { usePathname, useRouter } from "next/navigation";

import { useAtom } from "jotai";
import { userAtom } from "@/app/atoms/auth";
import { NewHamburgerIcon } from "@/components/icons/NewHamburgerIcon";
import { CoinIcon } from "@/components/icons/CoinIcon";
import { LikeIcon } from "@/components/icons/LikeIcon";
import { CartIcon } from "@/components/icons/CartIcon";
import { PersonIcon } from "@/components/icons/PersonIcon";

export default function LauncherHeader() {
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user] = useAtom(userAtom);
  const isLogin = !!user?.email;
  // const [isLogin, setIsLogin] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getNameInitials = (user: { firstName?: string; lastName?: string }) => {
    console.log("user", user);
    const first = user.firstName?.[0]?.toUpperCase() ?? "";
    const last = user.lastName?.[0]?.toUpperCase() ?? "";
    console.log("first", first);
    console.log("last", first);
    return first + last;
  };
  const handleLogout = () => {
    alert("aa");
    localStorage.clear();
    router.push("/"); // optional: navigate to home
    location.reload(); // refresh to clear userAtom, or reset atom if you have a setter
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const headerIconButtons = () => (
    <>
      <div className="flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 transition-transform duration-200 hover:scale-[1.02] text-[#001F50] bg-[#FDF0D5] border border-[#FFDA8C] hover:shadow-md hover:bg-[#fdf0d588]">
        <CoinIcon />
        <span className="font-raleway font-semibold text-base leading-[150%]">
          Coins
        </span>
      </div>

      {/* Join Us */}
      <button className="px-4 py-2 cursor-pointer border rounded-lg text-sm sm:text-base font-semibold font-nunito transition-colors bg-white text-primary border-primary hover:bg-[#01456925] hover:text-white hover:shadow-md">
        Join Us
      </button>
      {/* Log In */}
      {isLogin ? (
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 transition-colors hover:bg-[#34507a]"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            <div className="w-7 h-7 flex items-center justify-center bg-highlight text-primary font-bold rounded-full">
              {getNameInitials(user)}
            </div>
            <span className="text-highlight hidden md:block font-raleway font-semibold text-xl leading-[150%]">
              {user?.firstName || ""}
            </span>
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded shadow-lg z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsSignInModalOpen(true)}
          className="px-4 py-2 border rounded-lg text-sm sm:text-base font-semibold font-nunito transition-colors bg-primary text-white border-primary hover:bg-[#014569b7] hover:text-shadow-white hover:shadow-md cursor-pointer"
        >
          Sign Up/Log In
        </button>
      )}
    </>
  );

  return (
    <>
      <div className="bg-white px-8 py-10 lg:px-18 lg:py-4 border-b border-[#346a8750] lg:h-[92px]">
        <header className="max-w-[1280px] mx-auto flex lg:items-center justify-between">
          {/* Logo & Menu Section */}
          <div className="flex items-center gap-2 lg:gap-4">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex items-center justify-center w-8 h-8 cursor-pointer transition-colors"
              aria-label="Open menu"
            >
              <NewHamburgerIcon />
            </button>

            {/* Logo */}
            <Link
              href="/"
              className=" flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <Image
                src="/assets/stories/launcherr.png"
                alt="Launcher Logo"
                width={177}
                height={53}
                className="object-contain"
                priority
              />
            </Link>
          </div>

          {/* Header Icons Section */}

          <div className="lg:flex gap-6 items-center hidden">
            {headerIconButtons()}
          </div>

          <div className="flex items-center lg:hidden">
            <button className="cursor-pointer hover:shadow-md">
              <LikeIcon />
            </button>
            <button className="cursor-pointer hover:shadow-md">
              <CartIcon />
            </button>
            {isLogin ? (
              <div className="relative" ref={dropdownRef}>
                <div
                  className="flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 transition-colors hover:bg-[#34507a] hover:shadow-md"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  <div className="w-7 h-7 flex items-center justify-center bg-highlight text-primary font-bold rounded-full">
                    {getNameInitials(user)}
                  </div>
                  <span className="text-highlight font-raleway font-semibold text-xl leading-[150%]">
                    {user?.firstName || ""}
                  </span>
                </div>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded shadow-lg z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="border p-1 cursor-pointer rounded-full transition-colors bg-[#043591] border-[#043591] hover:bg-[#043591b7] hover:text-shadow-white hover:shadow-md"
              >
                <PersonIcon />
              </button>
            )}
          </div>
        </header>
      </div>
    </>
  );
}
