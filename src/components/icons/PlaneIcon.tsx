import React from "react";

const PlaneIcon = ({ ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M17.5614 0.909609C18.1514 1.49961 18.1514 2.44961 17.5614 3.02961L13.6714 6.91961L15.7914 16.1096L14.3814 17.5296L10.5014 10.0996L6.60141 13.9996L6.96141 16.4696L5.89141 17.5296L4.13141 14.3496L0.941406 12.5796L2.00141 11.4996L4.50141 11.8696L8.37141 7.99961L0.941406 4.08961L2.36141 2.67961L11.5514 4.79961L15.4414 0.909609C16.0014 0.329609 17.0014 0.329609 17.5614 0.909609Z"
      fill="currentColor"
    />
  </svg>
);

export default PlaneIcon;
