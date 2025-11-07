"use client";
import React from "react";
import {
  Bell,
  CreditCard,
  HelpCircle,
  Pencil,
  Settings,
  LockKeyhole,
} from "lucide-react";

interface ProfileSidebarProps {
  activeMenu: string;
  onMenuClick: (value: string) => void;
}

const sidebarOptions = [
  {
    label: "Edit profile",
    value: "edit",
    icon: <Pencil className="w-5 h-5" />,
  },
  // {
  //   label: "Notification",
  //   value: "notification",
  //   icon: <Bell className="w-5 h-5" />,
  // },
  // {
  //   label: "Payment",
  //   value: "payment",
  //   icon: <CreditCard className="w-5 h-5" />,
  // },
  {
    label: "Security",
    value: "security",
    icon: <LockKeyhole className="w-5 h-5" />,
  },
  {
    label: "Settings",
    value: "settings",
    icon: <Settings className="w-5 h-5" />,
  },
  { label: "Help", value: "help", icon: <HelpCircle className="w-5 h-5" /> },
];

export default function ProfileSidebar({ activeMenu, onMenuClick }: ProfileSidebarProps) {
  return (
    <aside className="w-64 bg-white flex flex-col py-8 px-4">
      <div className="border-r-2 w-61 border-gray-200 h-full px-4 py-6">
        <nav className="space-y-2">
          {sidebarOptions.map((opt) => {
            const isActive = opt.value === activeMenu;
            return (
              <button
                key={opt.value}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-black font-medium w-full text-left hover:bg-[#eaf3fa] ${
                  isActive ? "bg-[#eaf3fa] text-[#016aa2]" : ""
                }`}
                onClick={() => onMenuClick(opt.value)}
              >
                {opt.icon}
                {opt.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
} 