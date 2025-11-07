"use client";

import ClassIcon from "@/components/icons/ClassIcon";
import { RoomCounterProps, RoomsDropdownProps } from "@/types/hotel.types";
import { useState, useRef, useEffect } from "react";

function RoomCounter({
  label,
  count,
  setCount,
  min = 1,
  max = 6,
}: RoomCounterProps) {
  return (
    <div className="flex justify-between items-center gap-6 w-full">
      <p className="subheading">{label}</p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCount(Math.max(count - 1, min))}
          className="w-7 h-7 flex items-center justify-center rounded bg-primary text-white text-xl font-roboto"
          disabled={count <= min}
        >
          –
        </button>
        <div className="w-7 h-7 flex items-center justify-center rounded border border-primary bg-white text-primary text-base font-nunito">
          {count}
        </div>
        <button
          onClick={() => setCount(Math.min(count + 1, max))}
          className="w-7 h-7 flex items-center justify-center rounded bg-primary text-white text-xl font-roboto"
          disabled={count >= max}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function RoomsDropdown({
  rooms,
  setRooms,
  maxRooms = 6,
}: RoomsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-[10px] bg-white border border-[#CBCACA] rounded-[8px] px-[12px] py-[10px]"
      >
        <ClassIcon />
        <span className="body-text text-[#646464]">{rooms}</span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 min-w-[140px] bg-white border border-black/20 rounded-lg shadow-lg p-4">
          <RoomCounter
            label="Rooms"
            count={rooms}
            setCount={setRooms}
            min={1}
            max={maxRooms}
          />
        </div>
      )}
    </div>
  );
}
