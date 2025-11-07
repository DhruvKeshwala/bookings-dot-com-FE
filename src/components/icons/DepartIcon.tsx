import * as React from "react";

const DepartIcon = ({ ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={20}
    height={24}
    viewBox="0 0 20 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="m11.906 7.59-6.09-2.284a2 2 0 0 0-1.597.085l-1.435.715a.501.501 0 0 0-.046.869l4.59 2.953L4.25 11.5l-1.819-.81a1 1 0 0 0-.853.02l-1.006.502a.5.5 0 0 0-.156.772L2.7 14.65c.19.222.469.35.76.35h4.303a1 1 0 0 0 .446-.106l8.529-4.263a6.45 6.45 0 0 0 3.15-3.5A1.208 1.208 0 0 0 18.755 5.5h-1.794a4 4 0 0 0-1.818.437zM0 19a1 1 0 0 0 1 1h18a.999.999 0 1 0 0-2H1a1 1 0 0 0-1 1"
      fill="#9ca3af"
    />
  </svg>
);
export default DepartIcon;
