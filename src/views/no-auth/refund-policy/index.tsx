"use client";

export default function RefundPolicy() {


  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Tiny badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF914D]/10 to-[#F25C54]/10 border border-[#FF914D]/20 text-xs font-medium text-[#001F50] font-nunito mb-3">
          {/* Our story */} Last updated 19 Mar 2025
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold font-raleway mb-4 text-[#014569]">
         Refund Policy
        </h1>
        
        {/* Intro Paragraphs */}
        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10">
          <p>
           At Travulu, we strive to provide a smooth and transparent booking experience for flights and
            hotels. This Refund Policy outlines the conditions under which refunds may be issued and
             how refund requests are processed. By making a booking through Travulu, you agree to the
              terms described below.
          </p>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          1. General Conditions
        </h2>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
           <li>
            Travulu acts as an intermediary between customers and airlines or hotels. Refund eligibility, timelines, and amounts are governed by the cancellation and refund rules of the respective airline or hotel.
           </li>

           <li>
            Service fees charged by Travulu, including convenience or processing fees, are non-refundable unless otherwise stated.
           </li>

           <li>
            Refunds will only be processed to the original payment method used for the booking.
           </li>
          </ul>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          2. Flight Bookings
        </h2>

        {/* <p className="text-gray-800 font-nunito mb-8">
          We use your information only for purposes connected to your flight and hotel bookings:
        </p> */}

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
            <li>Refunds for cancelled, changed, or missed flights are subject to the fare rules of the airline.</li>

            <li>
                Certain fares may be non-refundable or may allow refunds only with applicable cancellation fees.
            </li>

            <li>In case of airline-initiated cancellations, schedule changes, or flight disruptions, refund or rebooking options will follow the airline’s policy.</li>

            <li>Travulu will process your refund request only after confirmation from the airline. The timeline may vary depending on the airline, typically between 7 to 21 business days.</li>

          </ul>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          3. Hotel Bookings
        </h2>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
            <li>Refunds for cancelled hotel bookings are subject to the cancellation rules of the specific hotel.</li>

            <li>Some rates may be fully refundable if cancelled before the hotel’s deadline, while others may be partially refundable or non-refundable.</li>

            <li>No-shows (failure to check in) are typically non-refundable unless specified by the hotel’s policy.
            </li>

            <li>
                Travulu will initiate the refund after the hotel confirms eligibility. Processing timelines may range from 7 to 21 business days.
            </li>
          </ul>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
           4. Service Fees and Non-Refundable Charges
        </h2>

        {/* <p className="text-gray-800 font-nunito mb-8">
         We use advanced encryption and secure systems to protect your personal data. While we take all reasonable steps to safeguard your information, no online platform can guarantee complete security.
        </p> */}

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
            <li>Travulu’s service fees, booking charges, and payment gateway charges are not refundable.</li>

            <li>Additional costs incurred due to incorrect details entered by the customer (such as names, dates, or destinations) are non-refundable..</li>

          </ul>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          5. Refund Process
        </h2>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
            <li>Submit a refund request through your Travulu account or by contacting our support team.</li>

            <li>Travulu will coordinate with the airline or hotel to verify eligibility.</li>

            <li>Once approved, the refund will be processed to your original payment method.</li>

            <li>You will receive a confirmation email with the refund status and expected timelines.</li>

          </ul>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          6. Exceptions
        </h2>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10">
          <p>
           Refunds will not be issued in the following cases:
          </p>
        </div>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
            <li>Non-refundable fares or hotel rates.</li>

            <li>No-shows or failure to provide required travel documents.</li>

            <li>Services disrupted due to circumstances beyond Travulu’s control, including but not limited to weather, strikes, natural disasters, or governmental restrictions.</li>

          </ul>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          7. Contact for Refunds
        </h2>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10">
          <p>
           For refund-related queries, please contact:
          </p>
          <p>Customer Care: </p>
          <p>Email: support@travulu.com</p>
        </div>

 
        {/* CTA Bar */}                                           
        <div className="mt-10 p-5 rounded-lg bg-gradient-to-r from-[#FF914D]/10 to-[#F25C54]/10 border border-[#FF914D]/20">
          <p className="text-[#001F50] font-nunito">
            Disclaimer: Travulu’s role is limited to assisting with refund requests. Final decisions regarding refund eligibility and amounts rest with the airline or hotel provider.
          </p>
        </div>
      </div>
    </section>
  );
}
