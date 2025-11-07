// components/Popover.tsx
import { useEffect, useRef, useState, ReactNode } from "react";
import cn from "@/utils/functions/class-name";

interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const Popover = ({
  trigger,
  children,
  position = "bottom",
  className = "",
}: PopoverProps) => {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const togglePopover = () => setOpen((prev) => !prev);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      popoverRef.current &&
      !popoverRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const positionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-1",
    left: "right-full mr-2",
    right: "left-full ml-2",
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <div onClick={togglePopover} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          className={cn(
            "absolute z-50 bg-white rounded min-w-[150px]",
            positionClasses[position],
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};
