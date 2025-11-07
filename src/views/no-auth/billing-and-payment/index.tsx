"use client";

export default function BillingAndPayment() {


  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Tiny badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF914D]/10 to-[#F25C54]/10 border border-[#FF914D]/20 text-xs font-medium text-[#001F50] font-nunito mb-3">
          {/* Our story */} Last updated 19 Mar 2025
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold font-raleway mb-4 text-[#014569]">
         Billing and Payment
        </h1>
        
        {/* Intro Paragraphs */}
        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10">
          <p>
           This Billing and Payment Policy explains how payments are processed for bookings
            made through Travulu. By completing a booking for flights or hotels on our platform,
             you agree to the terms outlined below.
          </p>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          1. Accepted Payment Methods
        </h2>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10">
          <p>
            Travulu accepts a variety of secure payment methods, including:
          </p>
        </div>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
          <li>Credit cards (Visa, MasterCard, American Express, RuPay)</li>

          <li>Debit cards issued by recognized banks</li>

          <li>Net banking (major Indian banks)</li>

          <li>UPI payments</li>

          <li>Mobile wallets (where available)</li>

          </ul>
        </div>
        <p className="text-gray-800 font-nunito mb-8">
         Payments are processed through trusted third-party payment gateways to ensure security.
        </p>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          2. Currency
        </h2>
      
        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
            <li>All transactions on Travulu are processed in Indian Rupees (INR) unless otherwise specified.</li>

            <li>If you are using an international card, your bank may apply additional conversion charges or fees, which are beyond Travulu’s control.</li>

          </ul>
        </div>


        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          3. Payment Timing
        </h2>
          <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
           <li>Full payment is required at the time of booking flights or hotels.</li>

           <li>Bookings are confirmed only after payment is successfully processed.</li>

           <li>In case of payment failure, Travulu will not be responsible for holding or securing reservations.</li>

          </ul>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          Security of Transactions
        </h2>
          <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
           <li>Travulu does not store full credit or debit card details on its servers.</li>

           <li>All payment information is encrypted and handled by secure third-party gateways compliant with industry standards (PCI-DSS).</li>

           <li>Users are responsible for ensuring that their payment details are accurate and up to date.</li>

          </ul>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          5. Invoices and Billing
        </h2>
          <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
           <li>After successful payment, a booking confirmation and invoice will be sent to your registered email address.</li>

           <li>The invoice will include the booking reference number, details of flights or hotels booked, total charges, and applicable taxes.</li>

           <li>Any discrepancies in billing must be reported to Travulu within 7 days of receipt.</li>

          </ul>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          6. Refunds and Cancellations
        </h2>
          <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
           <li>Refunds for cancelled bookings are subject to the Refund Policy and the cancellation rules of the respective airline or hotel.</li>

           <li>Service fees, convenience charges, or gateway charges levied by Travulu are non-refundable.</li>

           <li>Refunds will be credited back to the original payment method used during booking.</li>

          </ul>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          7. Failed or Declined Transactions
        </h2>
          <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
           <li>Travulu is not responsible for failed or declined payments caused by incorrect details, insufficient funds, network issues, or restrictions imposed by your bank.</li>

           <li>In case of payment failure, please contact your bank or payment provider.</li>

          </ul>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
         8. Fraudulent Transactions
        </h2>
          <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
           <li>Travulu reserves the right to cancel any booking suspected of being fraudulent.</li>

           <li>If fraud is detected, Travulu may block your account, cancel associated bookings, and report the matter to relevant authorities.</li>

          </ul>
        </div>


        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          9. Customer Support
        </h2>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10">
          <p>
           For billing and payment-related questions, please contact:
          </p>
        </div>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10">
          <p>
            Email: billing@travulu.com
          </p>
          <p>Customer Care: </p>

        </div>

 
        {/* CTA Bar */}                                           
        <div className="mt-10 p-5 rounded-lg bg-gradient-to-r from-[#FF914D]/10 to-[#F25C54]/10 border border-[#FF914D]/20">
          <p className="text-[#001F50] font-nunito">
            Disclaimer: By completing a transaction on Travulu, you authorize us to process your payment securely and agree to the terms described above.
          </p>
        </div>
      </div>
    </section>
  );
}
