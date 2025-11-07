"use client";

export default function AccessibilityStatement() {


  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Tiny badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF914D]/10 to-[#F25C54]/10 border border-[#FF914D]/20 text-xs font-medium text-[#001F50] font-nunito mb-3">
          {/* Our story */} Last updated 19 Mar 2025
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold font-raleway mb-4 text-[#014569]">
         Accessibility Statement
        </h1>
        
        {/* Intro Paragraphs */}
        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10">
          <p>
           Travulu is committed to ensuring that our platform is accessible and usable by all customers,
            including individuals with disabilities. We believe that travel should be easy,
             inclusive, and available to everyone. This Accessibility Statement outlines our ongoing
              efforts to make our website and services user-friendly for all.
          </p>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          1. Our Commitment
        </h2>

        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
          <li>We strive to provide equal access to our flight and hotel booking services for all users.</li>

          <li>Our website is designed with accessibility features in mind so that customers with diverse abilities can search, compare, and complete bookings with ease.</li>

          <li>Net banking (major Indian banks)</li>

          <li>We aim to comply with recognized accessibility standards, including the Web Content Accessibility Guidelines (WCAG) 2.1, wherever feasible.</li>

          </ul>
        </div>
        

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          2. Accessibility Features
        </h2>
        <p className="text-gray-800 font-nunito mb-8">
         To improve the user experience, Travulu’s website includes:
        </p>
      
        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
            <li>
                Compatibility with screen readers and assistive technologies.
            </li>

            <li>
                Alt text for images where possible to describe visuals.
            </li>

            <li>
                Adjustable font sizes and zoom features supported by most browsers.
            </li>

            <li>
                Clear navigation structure to help users find flights and hotels quickly.
            </li>

            <li>
                High-contrast elements and readable fonts for better visibility.
            </li>
          </ul>
        </div>


        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          3. Ongoing Improvements
        </h2>
          <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10"> 
          <ul className="list-disc pl-6 space-y-2">
           <li>Accessibility is an ongoing priority at Travulu. We continuously review and update our platform to address usability issues.</li>

           <li>We are working to ensure that forms, booking steps, and confirmation pages are accessible to all users, including those with assistive technologies.</li>

           <li>As we expand beyond flights and hotels, accessibility standards will continue to guide new features and services.</li>

          </ul>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          4. Third-Party Content
        </h2>
        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10">
          <p>
           Some services, such as flight availability from airlines or hotel information provided directly by properties, may involve third-party platforms. Travulu does not control the accessibility of these external systems but advocates for inclusivity wherever possible.
          </p>
        </div>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          5. Feedback and Assistance
        </h2>
        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10">
          <p>
            Your feedback is valuable in helping us improve. If you encounter any accessibility barriers while using Travulu, please reach out to us.
          </p>
          <p>
            📧 Email: accessibility@travulu.com
          </p>
          <p>
            📞 Customer Care: 
          </p>
        </div>
         <p className="text-gray-800 font-nunito mb-8">
         We will make every effort to respond promptly and provide alternative solutions if required.
        </p>

        <h2 className="text-2xl md:text font-bold font-raleway mb-4 ">
          6. Future Commitment
        </h2>
        <div className="space-y-4 text-gray-800 font-nunito leading-7 mb-10">
          <p>
           Travulu is dedicated to building a travel platform where everyone can explore and book confidently. As we evolve, accessibility will remain a central focus to ensure that no traveler is left behind.
          </p>
        </div>


        {/* CTA Bar */}                                           
        <div className="mt-10 p-5 rounded-lg bg-gradient-to-r from-[#FF914D]/10 to-[#F25C54]/10 border border-[#FF914D]/20">
          <p className="text-[#001F50] font-nunito">
           Disclaimer: While Travulu makes every effort to maintain accessibility across our website and services, certain limitations may arise due to third-party integrations or technical constraints.
          </p>
        </div>
      </div>
    </section>
  );
}
