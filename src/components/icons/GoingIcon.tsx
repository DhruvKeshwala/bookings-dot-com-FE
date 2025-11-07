import * as React from "react";
const GoingIcon = ({ ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={20}
    height={24}
    viewBox="0 0 20 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        d="M.01 9.216 0 6.125a.5.5 0 0 1 .61-.49l1.112.246c.331.072.6.31.719.625L3 8l3.978 1.175-1.297-4.538A.5.5 0 0 1 6.162 4h1.254c.362 0 .693.194.871.51l3.407 6.056 3.35.99a4 4 0 0 1 1.365.713l1.075.862c.75.6.566 1.79-.334 2.131a6.64 6.64 0 0 1-4.025.22l-9.322-2.426a2 2 0 0 1-.915-.528L.297 9.918a1 1 0 0 1-.29-.702zM1 18h18a.999.999 0 1 1 0 2H1a.999.999 0 1 1 0-2m3-2.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0m4-.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2"
        fill="#9ca3af"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path d="M0 4h20v16H0z" fill="#fff" />
      </clipPath>
    </defs>
  </svg>
);
export default GoingIcon;
