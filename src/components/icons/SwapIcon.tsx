import React from "react";

const SwapIcon = ({ ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="25"
    viewBox="0 0 24 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_57_4102)">
      <path
        d="M7 23.9375L3 19.9375L7 15.9375"
        stroke="#014569"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 13.9375V15.9375C21 16.9984 20.5786 18.0158 19.8284 18.7659C19.0783 19.5161 18.0609 19.9375 17 19.9375L3 19.9375"
        stroke="#014569"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 1.9375L21 5.9375L17 9.9375"
        stroke="#014569"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 11.9375V9.9375C3 8.87663 3.42143 7.85922 4.17157 7.10907C4.92172 6.35893 5.93913 5.9375 7 5.9375L21 5.9375"
        stroke="#014569"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_57_4102">
        <rect
          width="24"
          height="24"
          fill="white"
          transform="matrix(-1 0 0 -1 24 24.9375)"
        />
      </clipPath>
    </defs>
  </svg>
);

export default SwapIcon;
