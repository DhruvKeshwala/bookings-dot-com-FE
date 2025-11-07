"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
// import Sidebar from "../Sidebar";
import { HamburgerIcon } from "@/components/icons/HamburgerIcon";
import { usePathname, useRouter } from "next/navigation";

import { useAtom } from "jotai";
import { userAtom } from "@/app/atoms/auth";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user] = useAtom(userAtom);
  const isLogin = !!user?.email;
  // const [isLogin, setIsLogin] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
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
      <div className="flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 transition-transform duration-200 hover:scale-[1.02] hover:shadow-md hover:bg-[#34507a]">
        <svg
          width="24"
          height="24"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_1233_8208)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.00016 16C3.00016 23.18 8.82016 29 16.0002 29C23.1802 29 29.0002 23.18 29.0002 16C29.0002 8.82004 23.1802 3.00004 16.0002 3.00004C8.82016 3.00004 3.00016 8.82004 3.00016 16ZM16.0002 31.6667C7.3475 31.6667 0.333496 24.6527 0.333496 16C0.333496 7.34737 7.3475 0.333374 16.0002 0.333374C24.6528 0.333374 31.6668 7.34737 31.6668 16C31.6668 24.6527 24.6528 31.6667 16.0002 31.6667ZM14.2722 7.63804C15.0435 6.31337 16.9568 6.31337 17.7288 7.63804L19.3668 10.4514C19.46 10.6113 19.5855 10.7502 19.7353 10.859C19.8851 10.9678 20.0559 11.0442 20.2368 11.0834L23.4188 11.772C24.9168 12.0967 25.5082 13.9167 24.4868 15.0594L22.3175 17.4874C22.1942 17.6255 22.101 17.7877 22.0438 17.9638C21.9867 18.1398 21.9668 18.3259 21.9855 18.51L22.3135 21.7487C22.4675 23.274 20.9202 24.3987 19.5168 23.7807L16.5382 22.4674C16.3687 22.3927 16.1856 22.3542 16.0005 22.3542C15.8154 22.3542 15.6322 22.3927 15.4628 22.4674L12.4835 23.7807C11.0808 24.3987 9.53283 23.274 9.6875 21.7487L10.0148 18.51C10.0335 18.3259 10.0136 18.1398 9.95648 17.9638C9.89933 17.7877 9.80613 17.6255 9.68283 17.4874L7.5135 15.0594C6.49216 13.9167 7.0835 12.0967 8.5815 11.7727L11.7635 11.0834C11.9444 11.0442 12.1152 10.9678 12.265 10.859C12.4148 10.7502 12.5403 10.6113 12.6335 10.4514L14.2722 7.63804Z"
              fill={"var(--highlight-color)"}
            />
          </g>
          <defs>
            <clipPath id="clip0_1233_8208">
              <rect width="32" height="32" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <span className="text-highlight font-raleway font-semibold text-xl leading-[150%]">
          Points
        </span>
      </div>

      {/* Join Us */}
      <div className="flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 transition-transform duration-200 hover:scale-[1.02] hover:shadow-md hover:bg-[#34507a]">
        <svg
          width="28"
          height="28"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.40814 7.4206C2.4317 12.1008 4.68439 15.1456 7.41602 16.8306C5.34958 16.3425 3.35027 15.6129 1.27539 14.5278C2.86914 19.3708 6.3482 20.5163 9.39452 20.1997C7.7112 21.0904 5.93252 21.781 4.14845 22.2485C8.48883 24.945 11.6553 23.2772 13.4153 20.9162C13.2866 20.8008 13.1571 20.6862 13.0268 20.5726C12.7022 20.3415 12.3938 20.0757 12.1031 19.7782C11.7301 19.4598 11.3503 19.1348 10.9673 18.7951C8.86433 16.9303 6.7187 14.6942 6.62795 11.7432L6.62783 11.7338C5.43114 10.3553 4.34833 8.90234 3.4082 7.42053L3.40814 7.4206ZM28.5919 7.4206C27.6519 8.90216 26.5689 10.3545 25.3722 11.7327L25.3725 11.7375C25.4592 14.6105 23.2802 16.9038 21.1245 18.8242C20.2576 19.5963 19.3832 20.3132 18.6305 20.9767C20.3991 23.3054 23.5481 24.922 27.8517 22.2485C26.0678 21.781 24.2905 21.0904 22.6073 20.1998C25.6534 20.5158 29.1311 19.3698 30.7246 14.5279C28.6498 15.6131 26.6504 16.3427 24.584 16.8307C27.3155 15.1456 29.5683 12.101 28.5918 7.42072L28.5919 7.4206ZM20.3156 7.66916C18.9315 7.67978 17.4785 8.40978 16.5016 10.0667L16.0151 10.8917L15.5316 10.0649C14.3146 7.98453 12.132 7.33847 10.3973 7.83053H10.3966C8.86626 8.26472 7.68502 9.51535 7.75245 11.7085C7.82664 14.1217 9.66508 16.1368 11.7137 17.9534C12.7381 18.8617 13.7987 19.7111 14.677 20.5484C15.1993 21.0464 15.663 21.5385 16.0102 22.0573C16.3582 21.5749 16.8179 21.1108 17.3363 20.6285C18.2351 19.792 19.3273 18.9183 20.3763 17.9839C22.4742 16.1152 24.3166 14.0392 24.2481 11.7715C24.1783 9.46066 22.828 8.12278 21.2095 7.7636C20.9161 7.69843 20.6162 7.6667 20.3156 7.66903L20.3156 7.66916Z"
            fill="var(--highlight-color)"
          />
        </svg>
        <span className="text-highlight font-raleway font-semibold text-xl leading-[150%]">
          Join Us
        </span>
      </div>
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
            <span className="text-highlight font-raleway font-semibold text-xl leading-[150%]">
              {user?.firstName || ""}
            </span>
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded shadow-lg z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsSignInModalOpen(true)}
          className="flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 transition-transform duration-200 hover:scale-[1.02] hover:shadow-md hover:bg-[#34507a]"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M16.0003 5.33329C14.1347 5.33295 12.3016 5.82194 10.684 6.75146C9.06635 7.68098 7.72083 9.01852 6.78169 10.6306C5.84256 12.2426 5.34266 14.0728 5.33189 15.9384C5.32113 17.804 5.79987 19.6398 6.72034 21.2626C7.34249 20.4541 8.14225 19.7994 9.05779 19.3493C9.97333 18.8991 10.9801 18.6656 12.0003 18.6666H20.0003C21.0206 18.6656 22.0274 18.8991 22.9429 19.3493C23.8584 19.7994 24.6582 20.4541 25.2803 21.2626C26.2008 19.6398 26.6796 17.804 26.6688 15.9384C26.658 14.0728 26.1581 12.2426 25.219 10.6306C24.2799 9.01852 22.9343 7.68098 21.3167 6.75146C19.6991 5.82194 17.866 5.33295 16.0003 5.33329ZM26.591 24.1013C26.7581 23.8835 26.9181 23.6604 27.071 23.432C28.5492 21.2356 29.3371 18.6475 29.3337 16C29.3337 8.63596 23.3643 2.66663 16.0003 2.66663C8.63634 2.66663 2.66701 8.63596 2.66701 16C2.6628 18.929 3.62706 21.7772 5.40967 24.1013L5.40301 24.1253L5.87634 24.676C7.12685 26.138 8.67952 27.3114 10.4273 28.1155C12.1751 28.9195 14.0765 29.335 16.0003 29.3333C16.2883 29.3333 16.5746 29.3244 16.859 29.3066C19.2649 29.1549 21.5839 28.3506 23.567 26.98C24.5154 26.3257 25.375 25.5512 26.1243 24.676L26.5977 24.1253L26.591 24.1013ZM16.0003 7.99996C14.9395 7.99996 13.9221 8.42139 13.1719 9.17153C12.4218 9.92168 12.0003 10.9391 12.0003 12C12.0003 13.0608 12.4218 14.0782 13.1719 14.8284C13.9221 15.5785 14.9395 16 16.0003 16C17.0612 16 18.0786 15.5785 18.8288 14.8284C19.5789 14.0782 20.0003 13.0608 20.0003 12C20.0003 10.9391 19.5789 9.92168 18.8288 9.17153C18.0786 8.42139 17.0612 7.99996 16.0003 7.99996Z"
              fill="var(--highlight-color)"
            />
          </svg>
          <span className="text-highlight font-raleway font-semibold text-xl leading-[150%]">
            Log In
          </span>
        </button>
      )}
    </>
  );

  return (
    <>
      <div className="bg-primary px-8 py-10 lg:px-18 lg:py-4 border-b border-[#346a87] lg:h-[92px]">
        <header className="max-w-[1280px] mx-auto flex lg:items-center justify-between">
          {/* Logo & Menu Section */}
          <div className="flex items-center ">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex items-center justify-center w-8 h-8 cursor-pointer transition-colors"
              aria-label="Open menu"
            >
              <HamburgerIcon />
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <Image
                src="https://cdn.builder.io/api/v1/image/assets%2Fe4f85e9169de426498b1ca8b690bacff%2Fbefa79fdfaae570631f37f18fedb30ac5d120e65"
                alt="Travulu Logo"
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
        </header>
      </div>
    </>
  );
}
