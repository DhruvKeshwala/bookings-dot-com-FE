import * as React from "react";
const ClassIcon = ({ ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={21}
    height={21}
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.375 6.125a3.5 3.5 0 1 1 3.5 3.5H12.25a.875.875 0 0 1-.875-.875zm-8.75 0a3.5 3.5 0 1 1 7 0V8.75a.875.875 0 0 1-.875.875H6.125a3.5 3.5 0 0 1-3.5-3.5m0 8.75a3.5 3.5 0 0 1 3.5-3.5H8.75a.875.875 0 0 1 .875.875v2.625a3.5 3.5 0 1 1-7 0m8.75-2.625a.875.875 0 0 1 .875-.875h2.625a3.5 3.5 0 1 1-3.5 3.5z"
      fill="#9ca3af"
    />
  </svg>
);
export default ClassIcon;
