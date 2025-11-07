"use client";

type SortTabsProps = {
  sortBy: string;
  setSortBy: (sort: string) => void;
};

const sortOptions = [
  { id: "recommended", label: "Recommended" },
  { id: "top-reviews", label: "Top Reviews" },
  { id: "low-to-high", label: "Low to High Price" },
  { id: "high-to-low", label: "High to Low Price" },
];

export default function SortTabs({ sortBy, setSortBy }: SortTabsProps) {
  return (
    <div className="flex h-12 border-[1.5px] border-black/30 rounded-2xl bg-foreground overflow-scroll md:overflow-hidden ">
      {sortOptions.map((option, index) => {
        const isActive = sortBy === option.id;
        const isFirst = index === 0;
        const isLast = index === sortOptions.length - 1;

        return (
          <div key={option.id} className="flex flex-1">
            <button
              onClick={() => setSortBy(option.id)}
              className={`
                flex-1 flex items-center justify-center px-4 py-3 text-xs md:text-base text-nowrap max-w-[120px] md:max-w-[320px] font-medium font-roboto transition-colors
                ${
                  isActive
                    ? "bg-primary text-foreground"
                    : "bg-foreground text-black/60 hover:text-black"
                }
                ${isFirst ? "rounded-l-2xl" : ""}
                ${isLast ? "rounded-r-2xl" : ""}
                ${isActive && isFirst ? "shadow-[0px_2px_4px_0px_rgba(1,59,149,0.12),0px_2px_16px_0px_rgba(1,59,149,0.32)]" : ""}
              `}
            >
              {option.label}
            </button>

            {!isLast && !isActive && sortBy !== sortOptions[index + 1]?.id && (
              <div className="w-[0.4px] h-10 bg-black/60 self-center"></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
