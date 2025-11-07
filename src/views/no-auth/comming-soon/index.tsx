import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ComingSoonPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f8fa]">
          <div className="bg-white rounded-lg shadow-lg p-10 flex flex-col md:flex-row items-center gap-10">
            {/* Left Section: Text */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h1 className="text-6xl font-extrabold text-[#016aa2] mb-2">
                Coming Soon
              </h1>
              <h2 className="text-3xl font-bold mb-2 text-[#222]">
                We’re working hard 🚀
              </h2>
              <p className="text-gray-500 mb-6 max-w-md">
                This page is under construction. Stay tuned — exciting things
                are on the way!
              </p>
              <Link
                href="/"
                className="px-6 py-2 rounded bg-[#016aa2] text-white font-semibold shadow hover:bg-[#014a7c] transition"
              >
                Back to Home
              </Link>
            </div>

            {/* Right Section: Illustration */}
            <div className="flex flex-col items-center">
              <Image src="/assets/banners/auth-banner.svg" alt="404 illustration" width={320} height={220} className="object-contain rounded-lg shadow" priority />
              {/* Swap the illustration with your own image */}
            </div>
          </div>
        </div>

    </Suspense>
  );
}
