import { footerColumns, socialIcons } from "@/utils/data/footer";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-primary px-5 py-[60px]">
      <div className="max-w-[1080px] w-full mx-auto">
        <div className="flex justify-between gap-[12px] w-full pt-[30px] pb-[40px] mb-[40px] border-b border-white">
          {/* links */}
          <div className="flex justify-between w-full">
            <Link
              href="/"
              className="flex items-center justify-center cursor-pointer"
              aria-label="Go to homepage"
            >
              <Image
                src="/Logo.png"
                alt="Travulu Logo"
                width={140}
                height={40}
                priority
              />
            </Link>
            <div className="flex gap-[20px]">
              {footerColumns.map((column, index) => (
                <div key={index} className="pr-6 text-white">
                  <h3 className="heading-2 mb-[5px]">{column.title}</h3>
                  <div className="flex flex-col gap-[5px]">
                    {column.links.map((link, linkIndex) => (
                      <Link
                        className="body-text"
                        key={linkIndex}
                        href={link.href}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Newsletter */}
          <div className="max-w-[364px] pl-2">
            <h5 className="text-white heading-2 mb-[5px]">
              Don&apos;t Miss the Adventure!
            </h5>
            <p className="text-white body-3-small">
              Subscribe for insider offers and travel tips
            </p>
            <div className="flex gap-[9px] my-[14px]">
              <input
                className="bg-white p-[12px] body-3-small rounded-[4px] "
                placeholder="Enter your email"
                type="email"
              />
              <button className="btn-cta bg-gradient rounded-[4px] text-white px-[20px] py-[8px]">
                Subscribe
              </button>
            </div>
            <p className="text-white body-3-small mb-[14px]">
              By subscribing, you agree to our Privacy Policy and consent to
              receive email updates.
            </p>
            <div className="flex gap-[12px] items-center justify-end">
              {socialIcons.map((icon, index) => (
                <Link href="/" key={index}>
                  <Image
                    src={icon}
                    alt={`Social icon ${index + 1}`}
                    width={24}
                    height={24}
                    className="aspect-square object-contain object-center w-6"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-[24px] text-white body-3-small ">
        <p>© 2023-2025 Travulu. All rights reserved.</p>
        <Link href="">Privacy Policy</Link>
        <Link href="">Terms of Service</Link>
      </div>
    </footer>
  );
};

export default Footer;
