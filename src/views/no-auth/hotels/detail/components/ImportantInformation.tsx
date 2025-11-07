"use client";


import { ImportantInformationProps } from "@/types/hotel.types";
import { useState } from "react";

function decodeHtmlEntities(text: string): string {
  const txt = document.createElement("textarea");
  txt.innerHTML = text;
  return txt.value;
}

function stripHtmlTags(htmlString: string): string[] {
  // First decode HTML entities (so &lt;li&gt; becomes <li>)
  const decodedString = decodeHtmlEntities(htmlString);

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = decodedString;

  const liElements = tempDiv.querySelectorAll("li");
  if (liElements.length > 0) {
    // Extract all li texts as an array
    return Array.from(liElements).map(li => li.textContent?.trim() || "");
  }

  // If no <li>, just return the plain text decoded
  const text = tempDiv.textContent || "";
  return [text.trim()];
}

const ImportantInformation: React.FC<ImportantInformationProps> = ({ rateConditionsList }) => {
  const [isImportantInfoExpanded, setIsImportantInfoExpanded] = useState(false);

  const toggleImportantInfo = () =>
    setIsImportantInfoExpanded(!isImportantInfoExpanded);

  const processedList = rateConditionsList.map(block =>
    block.flatMap(item => {
      // Always decode and extract <li> if any, else just plain text
      return stripHtmlTags(item);
    })
  );

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 p-6 border-[1.5px] border-black/30 rounded-2xl bg-white">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl md:text-2xl font-bold text-black font-raleway capitalize">
            Important information
          </h3>
          <svg
            onClick={toggleImportantInfo}
            className={`w-6 h-6 cursor-pointer transition-transform duration-200 ${isImportantInfoExpanded ? "" : "rotate-180"
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
        {isImportantInfoExpanded && (
          <div className="flex flex-col gap-4">
            <h4 className="text-base md:text-xl font-bold text-black font-nunito capitalize">
              You need to know
            </h4>

            {processedList.map((conditions, idx) => (
              <div key={`rate-condition-${idx}`} className="mb-6">
                {processedList.length > 1 && (
                  <h5 className="text-sm md:text-lg font-semibold text-black font-nunito mb-2">
                    Room {idx + 1}
                  </h5>
                )}
                <ul className="text-xs md:text-base text-black font-nunito leading-6 list-disc pl-5">
                  {conditions.map((item, index) => (
                    <li key={`condition-${idx}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportantInformation;