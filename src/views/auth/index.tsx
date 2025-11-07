"use client";

import { ReactNode } from "react";
import Sidebar from "./layout/Sidebar";
import Footer from "../no-auth/layout/Footer";
import LauncherHeader from "./layout/LauncherHeader";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <LauncherHeader />
      <div className="flex flex-col lg:flex-row py-0 lg:py-10 max-2xl:px-5 w-full max-w-[1280px] 2xl:max-w-[1440px] mx-auto max-lg:max-w-full">
        {/* Sidebar (hidden below lg) */}
        <aside className="hidden lg:block lg:!w-[280px]">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 items-center justify-center ps-2 w-full lg:w-10/12">
          <div>
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
