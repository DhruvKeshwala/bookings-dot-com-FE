"use client";
import React from "react";
import Link from "next/link";
import Button from "@/components/ui/NewButton";

export default function NotificationSettings() {
  return (
    <div className="w-full max-w-3xl flex flex-col gap-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1">Notification</h2>
        <p className="text-gray-500 ">
          Update your personal details, preferences, and travel settings all in
          one place.
        </p>
      </div>
      <form className="flex flex-col gap-4">
        {["All booking", "Product Purchases", "For every Security Purpose"].map(
          (label) => (
            <div
              key={label}
              className="flex items-center justify-between border border-[#d1d5db] rounded px-4 py-2 bg-white"
            >
              <span className="text-gray-700 font-medium">{label}</span>
              <label className="inline-flex items-center cursor-pointer relative">
                <input
                  type="checkbox"
                  checked
                  readOnly
                  className="sr-only peer bg-[#FFFFFF] "
                />
                <div className="w-11 h-6 bg-gray-200 peer-checked:bg-[#016aa2] rounded-full transition-all"></div>
                <div className="absolute ml-[-1.5rem] w-5 h-5 bg-white  border rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
              </label>
            </div>
          )
        )}
      </form>
      <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full sm:w-auto">
        <Button
          type="submit"
          variant="solid"
          color="secondary"
          className="bg-white text-[#FF6B6B] border border-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white transition-colors"
        >
          {" "}
          <Link href="/">Back</Link>
        </Button>

        <Button type="submit" variant="solid" color="secondary">
          Save
        </Button>
      </div>
    </div>
  );
}
