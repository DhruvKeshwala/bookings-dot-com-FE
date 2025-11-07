import * as React from "react";
const TravellerIcon = ({ ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={14}
    height={24}
    viewBox="0 0 14 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        d="M7 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8m-1.428 1.5A5.57 5.57 0 0 0 0 19.072c0 .512.416.928.928.928h12.144a.93.93 0 0 0 .928-.928A5.57 5.57 0 0 0 8.428 13.5z"
        fill="#9ca3af"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path d="M0 4h14v16H0z" fill="#fff" />
      </clipPath>
    </defs>
  </svg>
);
export default TravellerIcon;
