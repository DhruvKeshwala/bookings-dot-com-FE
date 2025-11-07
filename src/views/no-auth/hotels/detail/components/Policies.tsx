import { PoliciesProps } from "@/types/hotel.types";
import { useState } from "react";

export default function Policies({ hotel, prebookData, allPrebookData }: PoliciesProps) {
  const [isPoliciesExpanded, setIsPoliciesExpanded] = useState(false);

  const togglePolicies = () => setIsPoliciesExpanded(!isPoliciesExpanded);

  function extractPolicySections(html: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const allParagraphs = Array.from(doc.querySelectorAll("p"));
    const result: { [key: string]: string } = {};

    allParagraphs.forEach((p) => {
      const text = p.textContent || "";
      if (text.includes("CheckIn Instructions")) {
        result.checkInInstructions = text
          .replace("CheckIn Instructions :", "")
          .trim();
      } else if (text.includes("Special Instructions")) {
        result.specialInstructions = text
          .replace("Special Instructions :", "")
          .trim();
      }
    });

    const disclaimer = doc.querySelector("b")?.textContent;
    if (disclaimer) {
      result.disclaimer = disclaimer;
    }

    return result;
  }

  // Extract policy data
  const rawHTML = hotel?.policies?.[0] || "";
  const { checkInInstructions, specialInstructions, disclaimer } =
    extractPolicySections(rawHTML);

  /// Step 1: Extract rooms from allPrebookData or fallback to prebookData
  const allRooms =
    Object.values(allPrebookData ?? {}).flatMap((data) => data?.HotelResult?.[0]?.Rooms ?? []) ||
    prebookData?.HotelResult?.[0]?.Rooms ||
    [];

  // Step 2: Build cancel policies grouped by room
  const cancelPoliciesGrouped = allRooms.map((room: any, index: number) => {
    const policies = room?.CancelPolicies ?? [];
    return {
      roomIndex: index + 1,
      policies,
    };
  }).filter((entry) => entry.policies.length > 0);

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-6 p-3 md:p-6 border-[1.5px] border-black/30 rounded-2xl bg-white">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl md:text-2xl font-bold text-black font-raleway capitalize">
            Policies
          </h3>
          <svg
            onClick={togglePolicies}
            className={`w-6 h-6 cursor-pointer transition-transform duration-200 ${isPoliciesExpanded ? "" : "rotate-180"
              }`}
            viewBox="0 0 24 25"
            fill="none"
          >
            <path
              d="M4 16.0259L12 8.02588L20 16.0259"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Content */}
        {isPoliciesExpanded && (
          <div className="flex flex-col gap-4">
            {/* House Rules */}
            <div className="flex flex-col gap-2">
              <h4 className="text-base md:text-xl font-bold text-black font-nunito capitalize">
                House Rules
              </h4>
              <ul className="list-disc pl-5 text-xs md:text-base text-black font-nunito leading-6 capitalize">
                <li>Check in after {hotel?.checkInTime || "N/A"}</li>
                <li>Check out before {hotel?.checkOutTime || "N/A"}</li>
              </ul>
            </div>

            {cancelPoliciesGrouped.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-base md:text-xl font-bold text-black font-nunito capitalize">
                  Cancellation Policy
                </h4>

                {cancelPoliciesGrouped.map(({ roomIndex, policies }, groupIndex) => (
                  <div key={groupIndex} className="mb-3">
                    {cancelPoliciesGrouped.length > 1 && (
                      <h5 className="text-sm md:text-lg font-semibold text-black mb-1">
                        Room {roomIndex}
                      </h5>
                    )}
                    <ul className="list-disc pl-5 text-xs md:text-base text-black font-nunito leading-6 capitalize">
                      {policies.map((policy: any, index: number) => {
                        const [datePart, timePart] = policy.FromDate.split(" ");
                        const [day, month, year] = datePart.split("-");
                        const [hour, minute] = timePart.split(":");

                        const dateObj = new Date(
                          Number(year),
                          Number(month) - 1,
                          Number(day),
                          Number(hour),
                          Number(minute)
                        );

                        const optionsDate = { day: "numeric", month: "long" } as const;
                        const formattedDate = dateObj.toLocaleDateString(undefined, optionsDate);
                        const formattedHour = dateObj.getHours() % 12 || 12;
                        const ampm = dateObj.getHours() >= 12 ? "PM" : "AM";

                        let message = "";

                        if (policy.ChargeType === "Fixed") {
                          if (policy.CancellationCharge === 0) {
                            message = `Cancellations made before ${formattedHour} ${ampm} on ${formattedDate} are fully refundable.`;
                          } else {
                            message = `Cancellations made before ${formattedHour} ${ampm} on ${formattedDate} will incur a charge of ₹${policy.CancellationCharge}.`;
                          }
                        } else if (policy.ChargeType === "Percentage") {
                          if (policy.CancellationCharge === 100) {
                            message = `Cancellations made after ${formattedHour} ${ampm} on ${formattedDate} are non-refundable.`;
                          } else {
                            message = `Cancellations made after ${formattedHour} ${ampm} on ${formattedDate} will incur a charge of ${policy.CancellationCharge}%.`;
                          }
                        }

                        return <li key={index}>{message}</li>;
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Check-in Instructions */}
            {checkInInstructions && (
              <div className="flex flex-col gap-2">
                <h4 className="text-base md:text-xl font-bold text-black font-nunito capitalize">
                  Check-in Instructions
                </h4>
                <p className="text-xs text-black font-nunito capitalize">
                  {checkInInstructions}
                </p>
              </div>
            )}

            {/* Special Instructions */}
            {specialInstructions && (
              <div className="flex flex-col gap-2">
                <h4 className="text-base md:text-xl font-bold text-black font-nunito capitalize">
                  Special Instructions
                </h4>
                <p className="text-xs text-black font-nunito capitalize">
                  {specialInstructions}
                </p>
              </div>
            )}

            {/* Disclaimer */}
            {disclaimer && (
              <div className="flex flex-col gap-2">
                <h4 className="text-base md:text-xl font-bold text-black font-nunito capitalize">
                  Disclaimer
                </h4>
                <p className="text-xs text-black font-nunito capitalize">
                  {disclaimer}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};