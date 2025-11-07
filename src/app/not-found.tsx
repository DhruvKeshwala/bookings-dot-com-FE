import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/views/no-auth/layout/Header";
import Footer from "@/views/no-auth/layout/Footer";
export default function NotFoundPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f8fa]">
          <div className="bg-white rounded-lg shadow-lg p-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex flex-col items-center md:items-start">
              <h1 className="text-6xl font-extrabold text-[#ff6b6b] mb-2">404</h1>
              <h2 className="text-3xl font-bold mb-2 text-[#222]">Page Not Found</h2>
              <p className="text-gray-500 mb-6 max-w-md text-center md:text-left">Sorry, the page you are looking for does not exist or has been moved.<br />Try searching or go back to the homepage.</p>
              <Link href="/" className="px-6 py-2 rounded bg-[#016aa2] text-white font-semibold shadow hover:bg-[#014a7c] transition">Go to Home</Link>
            </div>
            <div className="flex flex-col items-center">
              <Image src="/assets/banners/auth-banner.svg" alt="404 illustration" width={320} height={220} className="object-contain rounded-lg shadow" priority />
              {/* You can swap the image path above for any other image in your assets */}
            </div>
          </div>
        </div>
        <Footer />
      </>
    </Suspense>
  );
}