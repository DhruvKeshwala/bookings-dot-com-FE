import React from "react";
import cn from "@/utils/functions/class-name";

type ButtonVariant = "solid" | "flat" | "outline" | "text";
type ButtonColor = "primary" | "secondary" | "danger";

type ButtonSize = "sm" | "md" | "lg" | "xl";

interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  showResponsiveButton?: boolean;
}

const baseClasses = "rounded text-center cursor-pointer font-nunito transition-opacity";

const variantClass: Record<ButtonVariant, string> = {
  solid:
    "flex justify-center items-center whitespace-nowrap min-w-[140px] bg-gradient flex-shrink-0",
  outline:
    "border-2 text-center transition-all duration-400 focus:outline-none",
  flat: "text-orange-500 px-3 py-1 border-2 border-orange-500 dark:bg-neutral-800 dark:text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-500",
  text: "text-gray-900 bg-green-200",
};

const responsivePadding = {
  base: "py-1 px-5 rounded-md",
  responsive: "py-0.5 px-2.5 rounded-md md:py-1 md:px-5",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "text-[12px]",
  md: "text-md py-3 px-6 rounded-lg",
  lg: "text-lg",
  xl: "text-xl py-3 px-6 rounded-lg lg:h-[62px] h-[48px]",
};

const colorClass: Record<ButtonColor, string> = {
  primary:
    "bg-primary text-white font-nunito hover:opacity-90 transition-opacity",
  secondary: "bg-gradient text-white",
  danger: "",
};

function Button({
  className,
  children,
  onClick,
  isLoading = false,
  isDisabled = false,
  variant = "solid",
  color = "primary",
  size = "md",
  showResponsiveButton = false,
  ...props
}: Readonly<IButtonProps>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading || isDisabled}
      className={cn(
        "relative ",
        baseClasses,
        showResponsiveButton
          ? responsivePadding.responsive
          : responsivePadding.base,
        variantClass[variant],
        colorClass[color],
        sizeClass[size],
        (isLoading || isDisabled) &&
          "disabled:opacity-60 disabled:pointer-events-none",
        className
      )}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}

export default Button;
