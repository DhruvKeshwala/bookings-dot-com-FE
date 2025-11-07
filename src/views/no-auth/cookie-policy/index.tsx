"use client";

export default function CookiePolicy() {


  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Tiny badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF914D]/10 to-[#F25C54]/10 border border-[#FF914D]/20 text-xs font-medium text-[#001F50] font-nunito mb-3">
          {/* Our story */} Last updated 19 Mar 2025
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold font-raleway mb-4 text-[#014569]">
         Cookie Policy
        </h1>
        
        {/* Intro Paragraphs */}
        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10">
          <p>
           This Cookie Policy explains how Travulu uses cookies and similar technologies
            on our website and mobile application. By continuing to use our platform for 
            flight and hotel bookings, you agree to the use of cookies as described below.
          </p>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          1. What Are Cookies?
        </h2>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10">
          <p>
           Cookies are small text files that are placed on your device when you visit a website. They help us improve functionality, enhance user experience, and provide personalized services such as remembering your flight searches or preferred hotel choices.
          </p>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          2. Why We Use Cookies
        </h2>

        <p className="text-gray-800 font-nunito mb-8">
          Travulu uses cookies for the following purposes:
        </p>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
           <li>Essential Cookies
               These are required for the website to function properly. For example, keeping you logged into your Travulu account or ensuring your booking session remains active while you complete a flight or hotel reservation.
           </li>

           <li>Performance Cookies
               These help us understand how users interact with our website. They allow us to improve speed, fix issues, and make booking flights and hotels more seamless.
           </li>

           <li>
            Functionality Cookies
            These remember your preferences, such as language, currency, or previously searched routes and hotels, to provide a more personalized experience.
           </li>

           <li>
            Advertising Cookies
            These are used to deliver relevant promotions, travel offers, and retargeted ads based on your browsing behavior.
           </li>

          </ul>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          3. Third-Party Cookies
        </h2>
        <p className="text-gray-800 font-nunito mb-8">
         Travulu may allow third-party service providers, such as analytics tools and advertising networks, to place cookies on your device. These third parties collect information about your browsing habits to deliver personalized ads and improve services.
        </p>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          4. Managing Cookies
        </h2>
        <p className="text-gray-800 font-nunito mb-8">
         You have control over cookies and can manage them through your browser settings. You may choose to block or delete cookies, but please note that doing so may affect your ability to use some features of the Travulu website, including completing flight or hotel bookings.
        </p>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
           5. Data Collected by Cookies
        </h2>
        <p className="text-gray-800 font-nunito mb-8">
         Cookies may collect:
        </p>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
            <li>Search history for flights and hotels</li>

            <li>Session details such as login status</li>

            <li>Device and browser information</li>

            <li>Preferences such as language and currency</li>
          </ul>
        </div>

        <p className="text-gray-800 font-nunito mb-8">
         This data is processed in accordance with our Privacy Notice.
        </p>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          6. Updates to This Policy
        </h2>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10">
          <p>
            Travulu may update this Cookie Policy from time to time to reflect changes in technology, law, or business practices. Updates will be posted on this page with a revised date.
          </p>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          7. Contact Us
        </h2>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10">
          <p>
           If you have any questions about this Cookie Policy, please contact:
          </p>
        </div>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10">
          <p>
           Email: privacy@travulu.com
          </p>
          <p>Customer Care: </p>

        </div>

 
        {/* CTA Bar */}                                           
        <div className="mt-10 p-5 rounded-lg bg-gradient-to-r from-[#FF914D]/10 to-[#F25C54]/10 border border-[#FF914D]/20">
          <p className="text-[#001F50] font-nunito">
            Disclaimer: By continuing to browse Travulu’s website or app, you consent to the use of cookies for enhancing your flight and hotel booking experience.
          </p>
        </div>
      </div>
    </section>
  );
}
