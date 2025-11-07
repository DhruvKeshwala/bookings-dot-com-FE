"use client";

import Loader from "@/components/ui/loader";
import Header from "@/views/no-auth/layout/Header";
import Footer from "@/views/no-auth/layout/Footer";
import { useState, useEffect } from "react";

export default function NoAuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mounted, setMounted] = useState(false);
  const [activeService, setActiveService] = useState("flight");
  useEffect(() => setMounted(true), []);

  if (!mounted)
    return (
      <div className="min-h-screen flex items-center justify-center px-3 lg:px-0">
        <Loader />
      </div>
    );

  return (
    <>
      <Header
        activeService={activeService}
        onServiceSelect={setActiveService}
      />
      <main>{children}</main>
      <Footer />
    </>
  );
}
