"use client";

import React from "react";
import clsx from "clsx";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
};

const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  className,
}) => {
  return (
    <div className={clsx("flex items-center gap-2", className)}>
      {label && <span className="text-sm text-gray-700">{label}</span>}
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          "relative cursor-pointer inline-flex h-[25px] w-[47px] items-center rounded-full transition-colors focus:outline-none",
          checked ? "bg-primary" : "bg-[#CBCBCB]"
        )}
      >
        <span
          className={clsx(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-[25px]" : "translate-x-1.5"
          )}
        />
      </button>
    </div>
  );
};

export default Switch;
