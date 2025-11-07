import React, { useState } from "react";

const faqs = [
  {
    question: "Does Riverfront Delight On The Cumberland",
    answer: "Yes, This Property Has A Pool.",
  },
  // Add more FAQ items as needed
  {
    question: "Does Riverfront Delight On The Cumberland",
    answer: "Yes, This Property Has A Pool.",
  },
  {
    question: "Does Riverfront Delight On The Cumberland",
    answer: "Yes, This Property Has A Pool.",
  },
  {
    question: "Does Riverfront Delight On The Cumberland",
    answer: "Yes, This Property Has A Pool.",
  },
  {
    question: "Does Riverfront Delight On The Cumberland",
    answer: "Yes, This Property Has A Pool.",
  },
];

export default function FAQDropdown() {
  const [openIndex, setOpenIndex] = useState(0);

  const handleToggle = (idx: number) => {
    setOpenIndex(idx === openIndex ? -1 : idx);
  };

  return (
    <div className="bg-white border rounded-lg p-6 mt-8">
      <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions (FAQs)</h3>
      <div>
        {faqs.map((faq, idx) => (
          <div key={idx} className="border-b">
            <button
              className={`w-full text-left py-4 px-2 font-medium flex justify-between items-center ${openIndex === idx ? "bg-[#016aa2] text-white" : "text-gray-800"}`}
              onClick={() => handleToggle(idx)}
            >
              {faq.question}
              <span>{openIndex === idx ? "▲" : "▼"}</span>
            </button>
            {openIndex === idx && (
              <div className="py-2 px-4 bg-[#f7f8fa] text-gray-700">
                <span className="font-semibold">ANS:- </span>
                <span>{faq.answer}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
