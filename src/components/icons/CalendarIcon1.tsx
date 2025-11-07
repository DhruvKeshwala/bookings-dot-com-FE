import * as React from "react";
const CalenderIconOne = ({ ...props }: React.SVGProps<SVGSVGElement>) => (
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
        d="M3 5v1H1.5A1.5 1.5 0 0 0 0 7.5V9h14V7.5A1.5 1.5 0 0 0 12.5 6H11V5a.999.999 0 1 0-2 0v1H5V5a.999.999 0 1 0-2 0m11 5H0v8.5A1.5 1.5 0 0 0 1.5 20h11a1.5 1.5 0 0 0 1.5-1.5z"
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
export default CalenderIconOne;
