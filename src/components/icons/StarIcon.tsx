import React from "react";

interface StarIconProps {
  filled?: boolean;
  id: string | number;
  index: number;
}

export const StarIcon: React.FC<StarIconProps> = ({
  filled = false,
  id,
  index,
}) => {
  const gradientId = filled
    ? `star-filled-${id}-${index}`
    : `star-empty-${id}-${index}`;

  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.164.584a.89.89 0 0 1 1.672 0l1.826 4.592a.91.91 0 0 0 .764.58l4.74.398c.802.067 1.128 1.115.516 1.663l-3.61 3.236a.97.97 0 0 0-.292.94l1.103 4.837c.187.82-.666 1.467-1.353 1.028l-4.058-2.592a.87.87 0 0 0-.944 0L4.47 17.858c-.687.44-1.54-.209-1.353-1.028l1.103-4.838a.97.97 0 0 0-.291-.94L.318 7.818C-.294 7.27.032 6.221.835 6.154l4.739-.398a.91.91 0 0 0 .764-.58z"
        fill={`url(#${gradientId})`}
      />
      <defs>
        <linearGradient
          id={gradientId}
          x1={9}
          y1={18}
          x2={9}
          y2={0}
          gradientUnits="userSpaceOnUse"
        >
          {filled ? (
            <>
              <stop stopColor="#F25C54" />
              <stop offset={1} stopColor="#FF914D" />
            </>
          ) : (
            <>
              <stop stopColor="#FFFFFF" />
              <stop offset={1} stopColor="#FFFFFF" />
            </>
          )}
        </linearGradient>
      </defs>
    </svg>
  );
};
