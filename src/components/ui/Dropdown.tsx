import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import TravellerIcon from "../icons/TravellerIcon";

type PropsType = {
  title: ReactNode;
  children: ReactNode;
  titleClassName?: string;
  containerClassName?: string;
};

export default function Dropdown({
  children,
  title,
  containerClassName,
  titleClassName,
}: Readonly<PropsType>) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const toggleOpen = () => setOpen(!open);
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        wrapperRef.current &&
        !(wrapperRef.current as HTMLDivElement).contains(event?.target)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="w-full">
      {pathname?.startsWith("/hotels/search") ||
      pathname?.startsWith("/flights/search") ? (
        <div
          className={`subheading cursor-pointer pl-3 ${titleClassName}`}
          onClick={toggleOpen}
        >
          {title}
        </div>
      ) : (
        <div
          onClick={toggleOpen}
          className="flex items-center gap-[10px] bg-white border border-[#CBCACA] rounded-[8px] px-[12px] py-[10px] cursor-pointer"
        >
          <TravellerIcon />
          <span className="body-text text-[#646464]">{title}</span>
        </div>
      )}

      {open && (
        <div
          className={`absolute z-20 overflow-hidden border border-black/20 rounded-[10px] shadow-lg ${containerClassName}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
