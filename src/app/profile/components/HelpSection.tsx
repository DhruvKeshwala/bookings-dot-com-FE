"use client";
import React from "react";
import Link from "next/link";
import Button from "@/components/ui/NewButton";
import FAQDropdown from "@/components/ui/FAQDropdown";

export default function HelpSection() {
  return (
    <div className="w-full max-w-3xl flex flex-col gap-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1">Help</h2>
        <p className="text-gray-500">
          Update your personal details, preferences, and travel settings all in
          one place.
        </p>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Account</h3>
        <p className="mb-2 text-gray-700">
          This Shipping & Delivery Policy Is Part Of Our Terms & Conditions And
          Should Be Therefore Read Alongside Our Main Terms:{" "}
          <a
            href="https://launcherr.co/termsconditions.html"
            className="text-[#016aa2] underline"
          >
            https://launcherr.co/termsconditions.html
          </a>
          .
        </p>
        <p className="mb-2 text-gray-700">
          Please Carefully Review Our Shipping & Delivery Policy When Purchasing
          Our Products.
        </p>
        <p className="mb-2 text-gray-700">
          We Offer Various Shipping Options. In Some Cases, A Third-Party
          Supplier May Be Managing Our Inventory And Will Be Responsible For
          Shipping Your Products.
        </p>
        <h3 className="font-semibold mt-4 mb-2">Payment</h3>
        <p className="mb-2 text-gray-700">
          We Offer Free Standard, 5-10 Business Days Shipping On All Orders.
        </p>
        <p className="mb-2 text-gray-700">
          We Do Not Offer International Shipping.
        </p>
        <p className="mb-2 text-gray-700">
          If You Have Questions About Returns, Please Review Our Return Policy:{" "}
          <a
            href="https://launcherr.co/returnpolicy.html"
            className="text-[#016aa2] underline"
          >
            https://launcherr.co/returnpolicy.html
          </a>
          .
        </p>
        <p className="mb-2 text-gray-700">
          If You Have Any Further Questions Or Comments, You May Contact Us By:
        </p>
        <p className="mb-2 text-gray-700">
          Email:{" "}
          <a
            href="mailto:info@launcherr.co"
            className="text-[#ff6b6b] underline"
          >
            info@launcherr.co
          </a>
        </p>
      </div>
      <FAQDropdown />
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

        <Button type="button" variant="solid" color="secondary">
          Contact Us
        </Button>
      </div>
    </div>
  );
}
