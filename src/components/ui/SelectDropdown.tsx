import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import ClassIcon from "../icons/ClassIcon";

type PropsType = {
  items: unknown[];
  selectedItem: unknown;
  setSelectedItem: (item: unknown) => void;
};

export default function SelectDropdown({
  items,
  selectedItem,
  setSelectedItem,
}: Readonly<PropsType>) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: unknown) => {
    setSelectedItem(item);
    setIsOpen(false);
  };

  const getLabel = (item: unknown): string => {
    if (!item) return "";
    if (typeof item === "object" && item !== null && "label" in item) {
      return String((item as { label: unknown }).label);
    }
    return String(item);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {pathname?.startsWith("/hotels/search") ||
      pathname?.startsWith("/flights/search") ? (
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="subheading cursor-pointer h-[27px] pl-3"
        >
          {getLabel(selectedItem)}
        </div>
      ) : (
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-[10px] bg-white border border-[#CBCACA] rounded-[8px] px-[12px] py-[10px]"
        >
          <ClassIcon />
          <span className="body-text text-[#646464]">
            {getLabel(selectedItem)}
          </span>
        </div>
      )}

      {isOpen && (
        <div
          style={{ boxShadow: "0 2px 8px #0000003a" }}
          className="absolute top-[100%] left-0 min-w-[140px] z-20 bg-white rounded-[10px] overflow-hidden"
        >
          {items.map((item, idx) => {
            const isSelected = item === selectedItem;
            return (
              <div
                key={idx}
                onClick={() => handleSelect(item)}
                className={`px-[24px] py-[15px] w-full subheading cursor-pointer transition-colors duration-200 ${
                  isSelected
                    ? "bg-primary text-white"
                    : "bg-white text-black hover:bg-primary hover:text-white"
                }`}
              >
                {getLabel(item)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
