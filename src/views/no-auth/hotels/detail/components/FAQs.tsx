"use client";

import { FAQ, FAQsProps } from "@/types/hotel.types";
import { useState } from "react";

export default function FAQs({ hotel }: FAQsProps) {
  // State for FAQs
  const [isFaqsExpanded, setIsFaqsExpanded] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqsData: FAQ[] = [
    {
      question: "Does this hotel have a pool?",
      answer: "Yes, this property has a pool.",
    },
    {
      question: "What are the check-in and check-out times?",
      answer: `Check-in is from ${
        hotel?.checkInTime || "3:00 PM"
      }. Check-out is until ${hotel?.checkOutTime || "11:00 AM"}.`,
    },
    {
      question: "Is parking available at the hotel?",
      answer:
        "Yes, free self parking and valet parking are available at the property.",
    },
    {
      question: "Are pets allowed at the hotel?",
      answer:
        "Pet policies vary. It's best to contact the hotel directly for the most up-to-date information.",
    },
    {
      question: "Is there an airport shuttle service?",
      answer:
        hotel && hotel?.hasAirportShuttle
          ? "Yes, an airport shuttle is available."
          : "An airport shuttle service is not listed as an amenity. Please contact the hotel to confirm.",
    },
    {
      question: "Can I host an event at this hotel?",
      answer:
        "Yes, the hotel has conference spaces available. Please contact them for details on hosting events.",
    },
  ];

  const toggleFaqs = () => setIsFaqsExpanded(!isFaqsExpanded);

  const handleToggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-6 p-3 md:p-6 border-[1.5px] border-black/30 rounded-2xl bg-white">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl md:text-2xl font-bold text-black font-raleway capitalize">
            Frequently asked questions (FAQs)
          </h3>
          <svg
            onClick={toggleFaqs}
            className={`w-8 h-8 cursor-pointer transition-transform duration-200 ${
              isFaqsExpanded ? "" : "rotate-180"
            }`}
            viewBox="0 0 32 33"
            fill="none"
          >
            <path
              d="M8 20.0259L16 12.0259L24 20.0259"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* FAQ Items */}
        {isFaqsExpanded && (
          <div className="flex flex-col border-0 rounded-2xl overflow-hidden">
            {faqsData.map((faq, index) => (
              <div key={index} className="flex flex-col">
                <div
                  className={`flex justify-between items-center p-5 cursor-pointer transition-colors ${
                    openFaqIndex === index
                      ? "bg-[#014569]"
                      : "bg-[#014569]/5 hover:bg-[#014569]/10"
                  }`}
                  onClick={() => handleToggleFaq(index)}
                >
                  <h4
                    className={`text-sm md:text-xl font-bold font-nunito capitalize ${
                      openFaqIndex === index
                        ? "text-white"
                        : "text-black"
                    }`}
                  >
                    {faq.question}
                  </h4>
                  <svg
                    className={`w-8 h-8 transition-transform duration-200 ${
                      openFaqIndex === index ? "" : "rotate-180"
                    }`}
                    viewBox="0 0 32 33"
                    fill="none"
                  >
                    <path
                      d="M8 20.0259L16 12.0259L24 20.0259"
                      stroke={
                        openFaqIndex === index ? "white" : "black"
                      }
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {openFaqIndex === index && (
                  <div className="flex items-center gap-4 p-5 bg-white border-l border-r border-b border-black/30">
                    <span className="text-xs md:text-base font-bold text-black font-nunito capitalize">
                      ANS:-
                    </span>
                    <span className="text-xs text-black font-nunito capitalize">
                      {faq.answer}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 