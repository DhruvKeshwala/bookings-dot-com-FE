"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

const faqData: FAQSection[] = [
  {
    title: "Flights",
    items: [
      {
        question: "Can I change or cancel my flight after booking?",
        answer: "Yes, you can, but it depends on the airline's policy. Some allow free changes within 24 hours, while others may charge a fee. Please make sure to check the guidelines before booking."
      },
      {
        question: "How do I check my flight booking status?",
        answer: "You'll get an email and WhatsApp confirmation from Travulu right after booking. You can also log in to your Travulu profile and check under \"Flight Bookings\""
      },
      {
        question: "Do I need to carry a printed ticket?",
        answer: "Not always. Most airlines accept e-tickets on your phone, but we recommend keeping a printout just in case."
      },
      {
        question: "What ID documents are needed at the airport?",
        answer: "For domestic flights in India: Aadhaar, PAN, voter ID, or passport. For international flights: passport and visa (if applicable)."
      },
      {
        question: "Can I book one-way, round-trip, or multi-city flights?",
        answer: "Yes! Travulu lets you book all three. Just pick your option while searching."
      }
    ]
  },
  {
    title: "Hotels",
    items: [
      {
        question: "Can I cancel or modify my hotel booking?",
        answer: "Yes, but policies vary by hotel. Some allow free cancellations up to 24–48 hours before check-in."
      },
      {
        question: "Do I need to pay upfront for hotels?",
        answer: "Not always. Some hotels on Travulu offer \"Pay at Hotel,\" but most require advance payment so that it becomes easy for the hotel to confirm your booking. You can check it while booking the hotel."
      },
      {
        question: "Is breakfast included in my hotel booking?",
        answer: "It depends on the hotel. You'll see \"Breakfast included\" or \"Room only\" clearly before booking. On Travulu, there are multiple options to choose from. You can select breakfast with your room if you want to."
      },
      {
        question: "What if I arrive late at the hotel?",
        answer: "Don't worry! As long as you've booked, your room stays reserved. But always inform the hotel if you'll check in very late."
      },
      {
        question: "How do I find hotels near a landmark or city center?",
        answer: "Use our filters! You can sort by location, price, reviews, or even facilities like pool, spa, or free WiFi."
      }
    ]
  },
  {
    title: "Billing & Payment",
    items: [
      {
        question: "What payment methods does Travulu accept?",
        answer: "We accept UPI, credit and debit cards, net banking, and popular wallets."
      },
      {
        question: "Is my payment information secure?",
        answer: "Absolutely. All payments on Travulu are encrypted and 100% safe. We don't save your information as well, so you're safe."
      },
      {
        question: "Why did my payment fail but money got deducted?",
        answer: "Don't panic. Banks usually reverse failed transactions within 5–7 working days. If not, our support team will help."
      },
      {
        question: "Can I pay in EMI or installments?",
        answer: "No, you can't use EMI options right now but we're working on it. Once we roll out the feature, we'll let you know via email or whatsapp. Please subscribe to our newsletter."
      },
      {
        question: "Do you charge extra fees for payments?",
        answer: "No hidden charges! The price you see is the price you pay."
      },
      {
        question: "I need an invoice for my hotel booking. How can I get it?",
        answer: "Invoices are usually available in your account under \"Hotel Bookings.\" If you need a GST invoice, request it through support."
      }
    ]
  },
  {
    title: "Refund Policy",
    items: [
      {
        question: "How long does it take to get a refund?",
        answer: "Most refunds are processed within 7–10 working days, depending on your bank, airline, or hotel."
      },
      {
        question: "Can I get a full refund on cancellations?",
        answer: "Full refunds are possible only if the airline or hotel offers it. Otherwise, cancellation fees apply. Please read the refund policy before booking your flight/hotel."
      },
      {
        question: "My flight or hotel was cancelled by the provider. Will I get a refund?",
        answer: "Yes, in such cases, you are eligible for a full refund as per provider rules."
      }
    ]
  },
  {
    title: "Profile",
    items: [
      {
        question: "I forgot my password. How do I reset my Travulu password?",
        answer: "Click \"Forgot Password\" on the login page, and we'll send a reset link to your email or phone."
      },
      {
        question: "How do I update my email or phone number?",
        answer: "You can change your phone number but not email. Go to \"My Profile\" in your Travulu account and edit your contact details anytime."
      },
      {
        question: "I did not receive my OTP. What should I do?",
        answer: "Check your spam folder or wait a few minutes. If you still do not get it, click \"Resend OTP\" or contact support. If you still have the same issue, you can sign up via Google as well."
      },
      {
        question: "Do I need to create an account to book?",
        answer: "Yes, you have to create an account to book a flight or hotel because that's the requirement by our booking partners."
      },
      {
        question: "Can I change my password once I am logged in?",
        answer: "Yes, you can change your password once you're logged in. Go to Dashboard > Profile > Change Password to change your password."
      },
      {
        question: "Will Travulu share my details with third parties?",
        answer: "No. Your privacy is important to us. We only share information with airlines or hotels as required for bookings."
      }
    ]
  }
];

const ChevronDown = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path d="M8 12L16 20L24 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronUp = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path d="M8 20L16 12L24 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function FAQPage() {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    "Flights": true
  });
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({
    "Flights-0": true
  });

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const toggleItem = (sectionTitle: string, index: number) => {
    const key = `${sectionTitle}-${index}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <section className="bg-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold font-raleway text-[#014569] mb-10 capitalize">
          Frequently Asked Questions (FAQs)
        </h1>

        {/* FAQ Sections */}
        <div className="space-y-6">
          {faqData.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className="border-[1.5px] border-gray-300 rounded-2xl bg-white overflow-hidden"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex justify-between items-center px-10 py-6 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#014569] focus:ring-offset-2"
              >
                <h2 className="text-2xl md:text-3xl font-bold font-raleway text-black capitalize">
                  {section.title}
                </h2>
                <div className="text-black">
                  {expandedSections[section.title] ? <ChevronUp /> : <ChevronDown />}
                </div>
              </button>

              {/* Section Content */}
              {expandedSections[section.title] && (
                <div className="border-t border-gray-300">
                  {section.items.map((item, itemIndex) => {
                    const itemKey = `${section.title}-${itemIndex}`;
                    const isExpanded = expandedItems[itemKey];
                    const isFirst = itemIndex === 0;

                    return (
                      <div key={itemIndex} className="border-b border-gray-300 last:border-b-0">
                        {/* Question */}
                        <button
                          onClick={() => toggleItem(section.title, itemIndex)}
                          className={`w-full flex justify-between items-center px-6 py-5 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#014569] focus:ring-inset ${
                            isExpanded 
                              ? 'bg-[#014569] text-white hover:bg-[#013557]' 
                              : 'bg-[rgba(0,31,80,0.05)] text-black hover:bg-[rgba(0,31,80,0.1)]'
                          }`}
                        >
                          <h3 className="text-lg md:text-xl font-semibold font-nunito capitalize pr-4">
                            {item.question}
                          </h3>
                          <div className={isExpanded ? 'text-white' : 'text-black'}>
                            {isExpanded ? <ChevronUp /> : <ChevronDown />}
                          </div>
                        </button>

                        {/* Answer */}
                        {isExpanded && (
                          <div className="px-6 py-5 bg-white border-t border-gray-300 animate-in slide-in-from-top duration-300">
                            <div className="flex items-start gap-4">
                              <span className="text-lg font-bold font-nunito text-black capitalize shrink-0">
                                ANS:-
                              </span>
                              <p className="text-base font-medium font-nunito text-black leading-relaxed">
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}