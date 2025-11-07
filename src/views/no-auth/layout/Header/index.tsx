"use client";

import { userAtom } from "@/app/atoms/auth";
import { appLoadingAtom } from "@/app/atoms/ui";
import { HamburgerIcon } from "@/components/icons/HamburgerIcon";
import { SessionManager } from "@/utils/functions/SessionManager";
import SearchSummary from "@/views/no-auth/hotels/search/components/SearchSummary";
import { useAtom } from "jotai";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../Sidebar";
import AuthModalController from "./AuthModalController";
import ArrowIcon from "@/components/icons/ArrowIcon";
import Link from "next/link";
import ProfileIcon from "@/components/icons/ProfileIcon";

interface HeaderProps {
  activeService?: string;
  onServiceSelect?: (service: string) => void;
  className?: string;
}

type AuthModalMode = false | "signin" | "signup";

interface ParsedSearchParams {
  location?: string;
  locationCityCode?: string;
  locationNationality?: string;
  checkin?: string;
  checkout?: string;
  rooms?: string;
  guestssearch?: string;
}

interface GuestsData {
  adults: number;
  children: number;
  childrenAges: [];
}

// Separate UserDropdown component for better organization
const UserDropdown = ({
  user,
  isOpen,
  onToggle,
  onClose,
  onLogout,
  onDashboard,
}: {
  user: any;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onLogout: () => void;
  onDashboard: () => void;
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-2 transition-colors hover:bg-[#016aa2a3]"
        onClick={onToggle}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div
          className="w-7 h-7 flex items-center justify-center bg-highlight text-primary font-bold rounded-full"
          aria-hidden="true"
        >
          {/* Avatar placeholder */}
        </div>
        <span className="text-highlight font-raleway font-semibold text-lg">
          {user?.firstName || "Guest"}
        </span>
        <ArrowIcon
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg z-50">
          <button
            onClick={onDashboard}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:text-[#016aa2] border-gray-200 border-b cursor-pointer rounded-t-xl transition-colors"
          >
            Dashboard
          </button>
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:text-[#d9534f] cursor-pointer rounded-b-xl transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default function Header({
  activeService = "flight",
  onServiceSelect,
  className = "",
}: Readonly<HeaderProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const rawParams = useSearchParams();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<AuthModalMode>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Scroll behavior states
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const [user] = useAtom(userAtom);
  const [appLoading] = useAtom(appLoadingAtom);

  const isLogin = !!user?.email;
  const isHotelSearchPage = pathname?.startsWith("/hotels/search");

  // Scroll behavior handler
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Add shadow when scrolled past threshold
          setIsScrolled(currentScrollY > 10);

          // Show/hide based on scroll direction
          if (currentScrollY < 10) {
            // Always show at top
            setIsVisible(true);
          } else if (
            currentScrollY > lastScrollY.current &&
            currentScrollY > 100
          ) {
            // Scrolling down - hide
            setIsVisible(false);
          } else if (currentScrollY < lastScrollY.current) {
            // Scrolling up - show
            setIsVisible(true);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Memoized handlers
  const handleLogout = useCallback(() => {
    localStorage.clear();
    sessionStorage.clear();
    router.push("/");
    location.reload();
  }, [router]);

  const handleLogoClick = useCallback(() => {
    SessionManager.clearSession();
  }, []);

  const handleServiceSelect = useCallback(
    (service: string) => {
      onServiceSelect?.(service);
      setIsMenuOpen(false);
    },
    [onServiceSelect]
  );

  const handleDashboard = useCallback(() => {
    setIsDropdownOpen(false);
    router.push("/dashboard");
  }, [router]);

  const handleDropdownLogout = useCallback(() => {
    setIsDropdownOpen(false);
    handleLogout();
  }, [handleLogout]);

  // Parse search params for hotel search
  const searchData = useMemo(() => {
    if (!isHotelSearchPage) return null;

    try {
      const paramsStr = rawParams.get("params");
      if (!paramsStr) return null;

      const parsedParams: ParsedSearchParams = JSON.parse(
        decodeURIComponent(paramsStr)
      );

      const guestsData: GuestsData = parsedParams?.guestssearch
        ? JSON.parse(parsedParams.guestssearch)
        : { adults: 2, children: 0, childrenAges: [] as [] };

      return {
        location: parsedParams?.location || "",
        dateRange: "",
        guests: (guestsData?.adults || 0) + (guestsData?.children || 0),
        rooms: parseInt(parsedParams?.rooms || "1"),
        locationCityCode: parsedParams?.locationCityCode || null,
        locationNationality: parsedParams?.locationNationality || null,
        checkin: parsedParams?.checkin || null,
        checkout: parsedParams?.checkout || null,
        guestsData,
      };
    } catch (error) {
      console.error("Error parsing search params:", error);
      return null;
    }
  }, [isHotelSearchPage, rawParams]);

  return (
    <header>
      <div
        className={`bg-primary px-5 h-[85px] py-[10px] fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } ${isScrolled ? "shadow-lg" : ""} ${className}`}
      >
        <div className="max-w-[1080px] h-[65px] mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="flex items-center justify-center cursor-pointer"
              aria-label="Go to homepage"
            >
              <Image
                src="/Logo.png"
                alt="Travulu Logo"
                width={140}
                height={40}
                priority
              />
            </Link>
          </div>

          <div className="flex items-center">
            <div className="items-center md:flex hidden">
              <Link
                href="/flight"
                className="text-white heading-2 rounded-lg px-2 py-[6px] transition-transform duration-400 hover:shadow-md hover:bg-white/20"
              >
                Flight
              </Link>
              <Link
                href="/hotel"
                className="text-white heading-2 rounded-lg px-2 py-[6px] transition-transform duration-400 hover:shadow-md hover:bg-white/20"
              >
                Hotel
              </Link>
              <Link
                href="/blogs"
                className="text-white heading-2 rounded-lg px-2 py-[6px] transition-transform duration-400 hover:shadow-md hover:bg-white/20"
              >
                About
              </Link>
              <Link
                href="/blogs"
                className="text-white heading-2 rounded-lg px-2 py-[6px] transition-transform duration-400 hover:shadow-md hover:bg-white/20"
              >
                Blog
              </Link>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="w-[30px] h-[30px] flex items-center justify-center cursor-pointer md:hidden block"
                aria-label="Open menu"
              >
                <HamburgerIcon />
              </button>
              {isLogin ? (
                <UserDropdown
                  user={user}
                  isOpen={isDropdownOpen}
                  onToggle={() => setIsDropdownOpen((prev) => !prev)}
                  onClose={() => setIsDropdownOpen(false)}
                  onLogout={handleDropdownLogout}
                  onDashboard={handleDashboard}
                />
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen("signin")}
                  className="flex items-center gap-[5px] cursor-pointer rounded-lg px-2 py-[6px] transition-transform duration-400 hover:shadow-md hover:bg-white/20 heading-2"
                  aria-label="Log in"
                >
                  <ProfileIcon className="w-[25px] h-[25px]" />
                  <span className="text-highlight heading-2 md:block hidden">
                    Log In
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Summary for Hotel Search Page */}
      {isHotelSearchPage && !appLoading && searchData && (
        <div
          className={`bg-primary px-8 pb-6 lg:px-18 fixed left-0 w-full z-40 transition-all duration-300 ${
            isVisible ? "top-[85px]" : "top-0"
          } ${isScrolled ? "shadow-lg" : ""}`}
        >
          <div className="max-w-[1280px] mx-auto">
            <SearchSummary data={searchData} className="mt-0" />
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeService={activeService}
        onServiceSelect={handleServiceSelect}
      />

      {/* Authentication Modal */}
      <AuthModalController
        isOpen={!!isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={isAuthModalOpen === "signup" ? "signup" : "signin"}
      />
    </header>
  );
}
