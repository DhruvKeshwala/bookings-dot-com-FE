// "use client";

// import { useState } from "react";
// import Link from "next/link";

// export default function ContactPage() {
//   const [formData, setFormData] = useState({
//     name: "",
//     subject: "",
//     email: "",
//     message: "",
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log("Form submitted:", formData);
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   return (
//     <section className="bg-white py-10 lg:py-14 px-6 lg:px-20">
//       <div className="max-w-[1100px] mx-auto">
//         <h1 className="text-primary text-[22px] md:text-3xl font-bold font-raleway capitalize leading-[150%] mb-6">
//           Contact Us
//         </h1>

//         {/* Intro + Image */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center mb-10">
//           <div className="space-y-4">
//             <p className="text-black text-base md:text-[17px] font-normal font-nunito leading-[170%]">
//               Send an email to
//               <a
//                 href="mailto:support@travulu.com"
//                 className="ml-1 text-[#FF6B6B] font-semibold hover:underline"
//               >
//                 support@travulu.com
//               </a>
//               , check out our
//               <Link href="/faq" className="ml-1 text-primary underline hover:no-underline font-semibold">
//                 FAQ page
//               </Link>
//               , check general questions in live chat, or send us a message using the form below.
//             </p>

//             <div className="flex flex-wrap gap-3">
//               <a
//                 href="mailto:support@travulu.com"
//                 className="inline-flex items-center rounded-lg bg-primary/5 text-primary px-3 py-2 font-nunito text-sm font-semibold ring-1 ring-primary/20 hover:bg-primary/10"
//               >
//                 Email Support
//               </a>
//               <Link
//                 href="/faq"
//                 className="inline-flex items-center rounded-lg bg-gradient-to-b from-[#FF914D] to-[#F25C54] text-white px-3 py-2 font-nunito text-sm font-semibold hover:opacity-90"
//               >
//                 Visit FAQs
//               </Link>
//             </div>
//           </div>

//           <div className="relative w-full">
//             <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#FF914D]/15 to-[#F25C54]/15 rounded-xl blur-2xl" />
//             <img
//               src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop"
//               alt="Scenic travel view from airplane window"
//               className="w-full h-56 md:h-64 object-cover rounded-xl shadow-lg ring-1 ring-black/10"
//               loading="lazy"
//             />
//           </div>
//         </div>

//         {/* Contact Form */}
//         <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[560px]">
//           <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-5 md:p-6 space-y-5">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="flex flex-col gap-1.5">
//                 <label htmlFor="name" className="text-black text-sm font-bold font-nunito capitalize">
//                   Full Name
//                 </label>
//                 <input
//                   type="text"
//                   id="name"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   placeholder="Name"
//                   className="h-12 px-3 rounded-lg border border-black/15 bg-white text-black text-base font-medium font-nunito focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                   required
//                 />
//               </div>

//               <div className="flex flex-col gap-1.5">
//                 <label htmlFor="subject" className="text-black text-sm font-bold font-nunito capitalize">
//                   Subject
//                 </label>
//                 <input
//                   type="text"
//                   id="subject"
//                   name="subject"
//                   value={formData.subject}
//                   onChange={handleChange}
//                   placeholder="Subject"
//                   className="h-12 px-3 rounded-lg border border-black/15 bg-white text-black text-base font-medium font-nunito focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="flex flex-col gap-1.5">
//               <label htmlFor="email" className="text-black text-sm font-bold font-nunito capitalize">
//                 Email Address
//               </label>
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 placeholder="email"
//                 className="h-12 px-3 rounded-lg border border-black/15 bg-white text-black text-base font-medium font-nunito focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                 required
//               />
//             </div>

//             <div className="flex flex-col gap-1.5">
//               <label htmlFor="message" className="text-black text-sm font-bold font-nunito capitalize">
//                 Message
//               </label>
//               <textarea
//                 id="message"
//                 name="message"
//                 value={formData.message}
//                 onChange={handleChange}
//                 placeholder="Your message..."
//                 rows={6}
//                 className="px-3 py-3 rounded-lg border border-black/15 bg-white text-black text-base font-medium font-nunito resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                 required
//               />
//             </div>

//             <button
//               type="submit"
//               className="h-12 px-8 rounded-xl bg-gradient-to-b from-[#FF914D] to-[#F25C54] text-white text-base font-semibold font-nunito capitalize hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
//             >
//               Submit
//             </button>
//           </div>
//         </form>
//       </div>
//     </section>
//   );
// }


"use client";

import { useState } from "react";
import Link from "next/link";

type FormData = {
  name: string;
  subject: string;
  email: string;
  message: string;
};

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    subject: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URI}/helpdesk/ticket`;
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(`Submitted successfully`);
        setFormData({ name: "", subject: "", email: "", message: "" });
      } else {
        setErrorMsg(data.error || "Something went wrong");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white py-10 lg:py-14 px-6 lg:px-20">
      <div className="max-w-[1100px] mx-auto">
        <h1 className="text-primary text-[22px] md:text-3xl font-bold font-raleway capitalize leading-[150%] mb-6">
          Contact Us
        </h1>

        {/* Intro + Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center mb-10">
          <div className="space-y-4">
            <p className="text-black text-base md:text-[17px] font-normal font-nunito leading-[170%]">
              Send an email to
              <a
                href="mailto:support@travulu.com"
                className="ml-1 text-[#FF6B6B] font-semibold hover:underline"
              >
                support@travulu.com
              </a>
              , check out our
              <Link
                href="/faq"
                className="ml-1 text-primary underline hover:no-underline font-semibold"
              >
                FAQ page
              </Link>
              , check general questions in live chat, or send us a message using the form below.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:support@travulu.com"
                className="inline-flex items-center rounded-lg bg-primary/5 text-primary px-3 py-2 font-nunito text-sm font-semibold ring-1 ring-primary/20 hover:bg-primary/10"
              >
                Email Support
              </a>
              <Link
                href="/faq"
                className="inline-flex items-center rounded-lg bg-gradient-to-b from-[#FF914D] to-[#F25C54] text-white px-3 py-2 font-nunito text-sm font-semibold hover:opacity-90"
              >
                Visit FAQs
              </Link>
            </div>
          </div>

          <div className="relative w-full">
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#FF914D]/15 to-[#F25C54]/15 rounded-xl blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop"
              alt="Scenic travel view from airplane window"
              className="w-full h-56 md:h-64 object-cover rounded-xl shadow-lg ring-1 ring-black/10"
              loading="lazy"
            />
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[560px]">
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-5 md:p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="name"
                  className="text-black text-sm font-bold font-nunito capitalize"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name"
                  className="h-12 px-3 rounded-lg border border-black/15 bg-white text-black text-base font-medium font-nunito focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="subject"
                  className="text-black text-sm font-bold font-nunito capitalize"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  className="h-12 px-3 rounded-lg border border-black/15 bg-white text-black text-base font-medium font-nunito focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-black text-sm font-bold font-nunito capitalize"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email"
                className="h-12 px-3 rounded-lg border border-black/15 bg-white text-black text-base font-medium font-nunito focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="message"
                className="text-black text-sm font-bold font-nunito capitalize"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message..."
                rows={6}
                className="px-3 py-3 rounded-lg border border-black/15 bg-white text-black text-base font-medium font-nunito resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 px-8 rounded-xl bg-gradient-to-b from-[#FF914D] to-[#F25C54] text-white text-base font-semibold font-nunito capitalize hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>

            {/* Success/Error messages */}
            {successMsg && <p className="text-green-600">{successMsg}</p>}
            {errorMsg && <p className="text-red-600">{errorMsg}</p>}
          </div>
        </form>
      </div>
    </section>
  );
}
