import cn from "@/utils/functions/class-name";
import React, { useEffect } from "react";

type GlobalLoaderProps = {
  isLoading: boolean;
};

const GlobalLoader: React.FC<GlobalLoaderProps> = ({ isLoading }) => {
  useEffect(() => {
    if (isLoading) {
      // Disable scroll
      document.body.style.overflow = "hidden";
    } else {
      // Enable scroll
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isLoading]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 transition-opacity",
        isLoading
          ? "visible opacity-100 pointer-events-auto"
          : "invisible opacity-0 pointer-events-none"
      )}
      aria-hidden={!isLoading}
    >
      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default GlobalLoader;
