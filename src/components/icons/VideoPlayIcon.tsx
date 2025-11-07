import * as React from "react";

const VideoPlayIcon = ({ ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={54}
    height={54}
    viewBox="0 0 54 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 26.667C0 11.939 11.94 0 26.667 0a26.667 26.667 0 0 1 26.666 26.667c0 14.727-11.939 26.666-26.666 26.666S0 41.394 0 26.667M21.787 38.08l15.546-9.707a2.027 2.027 0 0 0 0-3.413l-15.6-9.707a2 2 0 0 0-3.066 1.68V36.4a2 2 0 0 0 3.12 1.68"
      fill="#fff"
    />
  </svg>
);
export default VideoPlayIcon;
