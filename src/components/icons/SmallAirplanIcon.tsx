import * as React from "react";

const SmallAirLaneIcon = ({ ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={23}
    height={24}
    viewBox="0 0 23 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_377_7873)">
      <path
        d="M0.0078125 9.11932V6.24618H2.88095L5.75408 9.11932H11.5003L8.62722 3.37305H11.5003L17.2466 9.11932H22.9929V11.9924H2.88095"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_377_7873">
        <rect
          width={22.9851}
          height={22.9851}
          fill="white"
          transform="translate(0.0078125 0.5)"
        />
      </clipPath>
    </defs>
  </svg>
);
export default SmallAirLaneIcon;
