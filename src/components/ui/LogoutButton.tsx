"use client";
import React from "react";
import { logoutUser } from "@/utils/functions/logout";

interface LogoutButtonProps {
  variant?: "default" | "sidebar" | "header";
  className?: string;
  children?: React.ReactNode;
}

export default function LogoutButton({ 
  variant = "default", 
  className = "",
  children 
}: LogoutButtonProps) {
  const baseClasses = "cursor-pointer transition-all duration-200 font-semibold font-[Nunito]";
  
  const variantClasses = {
    default: "flex items-center gap-3 py-2 px-3 rounded-lg text-black hover:bg-gray-50",
    sidebar: "flex items-center gap-3 py-2 px-3 rounded-lg text-black hover:bg-gray-50 w-full text-left",
    header: "w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <button
      onClick={logoutUser}
      className={combinedClasses}
    >
      {children || (
        <>
          <svg 
            width="28" 
            height="28" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            viewBox="0 0 24 24"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <path d="M16 17l5-5-5-5"/>
            <path d="M21 12H9"/>
          </svg>
          Logout
        </>
      )}
    </button>
  );
} 