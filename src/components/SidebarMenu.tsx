"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/ui/LogoutButton";
import Image from "next/image";

const menuItems = [
  {
    section: "Main",
    items: [
      { label: "Dashboard", icon: "home", href: "/dashboard" },
      {
        label: "Flight Bookings",
        icon: "plane",
        href: "/dashboard/flight-booking",
      },
      { label: "Bus Bookings", icon: "bus", href: "/bus" },
      { label: "Hotel Bookings", icon: "hotel", href: "/dashboard/hotel-booking" },
      { label: "Product Orders", icon: "box", href: "/orders" },
      { label: "Wishlist", icon: "heart", href: "/wishlist" },
    ],
  },
  {
    section: "Gigs",
    items: [
      { label: "Applied Gigs", icon: "gift", href: "/gigs/applied" },
      { label: "Saved Gigs", icon: "bookmark", href: "/gigs/saved" },
      { label: "Post a Gigs", icon: "plus", href: "/gigs/post" },
      { label: "Completed Gigs", icon: "check", href: "/gigs/completed" },
      { label: "Gig Inbox", icon: "chat", href: "/gigs/inbox" },
    ],
  },
  {
    section: "AI",
    items: [
      {
        label: "Ask Ai For Your Next Destination",
        icon: "robot",
        href: "/ai/ask",
      },
    ],
  },
  {
    section: "Account",
    items: [
      { label: "Profile", icon: "user", href: "/profile" },
      { label: "subscriptions", icon: "credit-card", href: "/subscriptions" },
      { label: "Settings", icon: "settings", href: "/settings" },
      { label: "Logout", icon: "logout", href: "#", isLogout: true },
    ],
  },
];

const icons = {
  home: <Image src="/icons/home.svg" alt="Home" width={20} height={20} />,
  plane: <Image src="/icons/flight.svg" alt="Flight" width={20} height={20} />,
  bus: <Image src="/icons/bus.svg" alt="Bus" width={20} height={20} />,
  hotel: (
    <Image
      src="/icons/black_bed.svg"
      alt="Hotel"
      width={20}
      height={20}
      color="black"
    />
  ),
  box: (
    <Image
      src="/icons/cart.svg"
      alt="Hotel"
      width={20}
      height={20}
      color="black"
    />
  ),
  heart: (
    <Image
      src="/icons/heart.svg"
      alt="Wishlist"
      width={20}
      height={20}
      color="black"
    />
  ),
  gift: (
    <Image
      src="/icons/gigs.svg"
      alt="Gift"
      width={20}
      height={20}
      color="black"
    />
  ),
  bookmark: (
    <Image
      src="/icons/saved.svg"
      alt="Wishlist"
      width={20}
      height={20}
      color="black"
    />
  ),
  plus: (
    <Image
      src="/icons/plus.svg"
      alt="Wishlist"
      width={20}
      height={20}
      color="black"
    />
  ),
  check: (
    <Image
      src="/icons/black_confirmed.svg"
      alt="Wishlist"
      width={20}
      height={20}
      color="black"
    />
  ),
  chat: (
    <Image
      src="/icons/chat.svg"
      alt="Wishlist"
      width={20}
      height={20}
      color="black"
    />
  ),
  robot: (
    <Image
      src="/icons/ai.svg"
      alt="Wishlist"
      width={20}
      height={20}
      color="black"
    />
  ),
  user: (
    <Image
      src="/icons/Frame.svg"
      alt="Wishlist"
      width={20}
      height={20}
      color="black"
    />
  ),
  "credit-card": (
    <Image
      src="/icons/Frame.svg"
      alt="Wishlist"
      width={20}
      height={20}
      color="black"
    />
  ),
  settings: (
    <Image
      src="/icons/setting.svg"
      alt="Wishlist"
      width={20}
      height={20}
      color="black"
    />
  ),
  logout: (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  ),
};


export default function SidebarMenu({ activePath }: { activePath: string }) {
  const router = useRouter();

  // Flatten all hrefs
  const allHrefs = menuItems.flatMap(section => section.items.map(i => i.href));
  // Find the best match (longest prefix match)
  let bestMatchHref = allHrefs[0];
  for (const href of allHrefs) {
    if (
      (href !== "/" && (activePath === href || activePath.startsWith(href + "/"))) &&
      href.length > bestMatchHref.length
    ) {
      bestMatchHref = href;
    }
    if (href === activePath) {
      bestMatchHref = href;
    }
  }

  return (
    <aside className="w-72 bg-white rounded-2xl mt-6 ml-3  p-6 h-[1030px] flex-shrink-0 border border-[#f2f2f2] shadow-md inline-block">
      {menuItems.map((section) => (
        <div key={section.section} className="mb-6">
          <div className="font-semibold text-gray-500 mb-2 text-sm">
            {section.section}
          </div>
          <ul className="space-y-3">
            {section.items.map((item) => (
              <li key={item.label}>
                {item.isLogout ? (
                  <LogoutButton variant="sidebar" />
                ) : (
                  <Link href={item.href} legacyBehavior>
                    <a
                      className={`flex items-center gap-3  px-3 py-2 rounded-lg transition-colors text-base font-medium ${
                        (item.href === "/"
                          ? activePath === "/"
                          : item.href === bestMatchHref)
                          ? "bg-[#eaf6ff] text-[#016aa2]"
                          : "text-black hover:bg-[#f7fafd]"
                      }`}
                    >
                      <span className="w-5 h-5 flex items-center justify-center">
                        {icons[item.icon as keyof typeof icons]}
                      </span>
                      {item.label}
                    </a>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}
