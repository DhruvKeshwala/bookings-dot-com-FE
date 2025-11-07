"use client";

export default function PrivacyPolicy() {


  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Tiny badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF914D]/10 to-[#F25C54]/10 border border-[#FF914D]/20 text-xs font-medium text-[#001F50] font-nunito mb-3">
          {/* Our story */} Last updated 19 Mar 2025
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold font-raleway mb-4 text-[#014569]">
          Privacy Notice
        </h1>
        
        {/* Intro Paragraphs */}
        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10">
          <p>
            Travulu values your privacy and is committed to protecting the personal
             information you share with us when booking flights and hotels.
              This Privacy Notice explains how we collect, use, store,
               and safeguard your information to ensure a secure and reliable travel experience.
          </p>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          Information We Collect
        </h2>

        <p className="text-gray-800 font-nunito mb-8">
          When you use Travulu to book flights or hotels, we may collect the following information:
        </p>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Personal details: Full name, email address, phone number, and identification details required for flight and hotel reservations.
            </li>

            <li>Booking details: Travel dates, destinations, hotel check-in and check-out dates, and passenger or guest information.</li>
             
            <li>Payment information: Credit card, debit card, UPI, or other payment details provided during checkout. These are processed through secure third-party gateways and are not stored by Travulu.</li>

            <li>Technical data: IP address, browser type, device information, and cookies to improve website functionality and provide a smooth booking experience.</li>
          </ul>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
         How We Use Your Information
        </h2>

        <p className="text-gray-800 font-nunito mb-8">
          We use your information only for purposes connected to your flight and hotel bookings:
        </p>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
            <li>To confirm and manage your reservations.</li>

            <li>
                To send booking confirmations, invoices, and travel updates.
            </li>

            <li>To provide customer support and respond to inquiries.</li>

            <li>To personalize your travel experience and improve our website.</li>

            <li>To comply with legal requirements, including identity verification for bookings.</li>
          </ul>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          Sharing of Information
        </h2>

        <p className="text-gray-800 font-nunito mb-8">
          Travulu shares your information only with trusted third parties necessary to complete your booking:
        </p>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
            <li>Airlines for issuing tickets and managing flight reservations.</li>

            <li>Hotels for securing and managing your room reservations.</li>

            <li>Payment providers for processing secure transactions.
                We do not sell or rent your personal information to any third party.
            </li>
          </ul>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          Data Security
        </h2>

        <p className="text-gray-800 font-nunito mb-8">
         We use advanced encryption and secure systems to protect your personal data. While we take all reasonable steps to safeguard your information, no online platform can guarantee complete security.
        </p>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          Your Rights
        </h2>

        <p className="text-gray-800 font-nunito mb-8">
         As a Travulu user, you have the right to:
        </p>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
            <li>Access the personal data we hold about you.</li>

            <li>Request corrections to inaccurate or incomplete data.</li>

            <li>Request deletion of your personal information, subject to legal and contractual obligations.</li>
          </ul>
        </div>

        <p className="text-gray-800 font-nunito mb-8">
          To exercise these rights, please contact us at support@travulu.com.
        </p>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          Updates to this Privacy Notice
        </h2>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10">
          <p>
            We may update this Privacy Notice to reflect changes in our services,
            legal requirements, or business practices. Any updates will be posted on this page,
            and the revised date will be indicated at the top.
          </p>
        </div>

        
 
        {/* CTA Bar */}                                           
        <div className="mt-10 p-5 rounded-lg bg-gradient-to-r from-[#FF914D]/10 to-[#F25C54]/10 border border-[#FF914D]/20">
          <p className="text-[#001F50] font-nunito">
            Disclaimer: By using Travulu for booking flights and hotels, you consent to the collection and use of your information as outlined in this Privacy Notice.
          </p>
        </div>
      </div>
    </section>
  );
}
