"use client";

import Select, { StylesConfig } from "react-select";
import { AgeOption, GuestCounterProps, GuestsDropdownProps } from "@/types/hotel.types";
import { useState, useRef, useEffect } from "react";

const ageOptions: AgeOption[] = Array.from({ length: 18 }, (_, i) => ({
  value: i.toString(),
  label: `${i} year${i !== 1 ? "s" : ""}`,
}));


function GuestCounter({
  label,
  count,
  setCount,
  min = 0,
  max = 10,
}: GuestCounterProps) {
  return (
    <div className="flex justify-between items-center w-full">
      <div className="text-lg font-bold text-black font-nunito">{label}</div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCount(Math.max(count - 1, min))}
          className="w-7 h-7 flex items-center justify-center rounded bg-primary text-white text-xl font-roboto"
          disabled={count <= min}
        >
          –
        </button>
        <div className="w-12 h-7 flex items-center justify-center rounded border border-primary bg-white text-primary text-base font-nunito">
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

const customSelectStyles: StylesConfig<AgeOption, false> = {
  control: (base) => ({
    ...base,
    fontSize: "1rem",
    fontWeight: "bold",
    borderRadius: "0.5rem",
    borderColor: "rgba(0,0,0,0.15)",
    minHeight: "32px",
    boxShadow: "none",
    paddingLeft: "6px",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.5rem",
    overflow: "hidden",
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#f0faff" : "white",
    color: "#000",
    cursor: "pointer",
  }),
  dropdownIndicator: () => ({ display: "none" }),
  indicatorSeparator: () => ({ display: "none" }),
  singleValue: (base) => ({
    ...base,
    color: "#000",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#888",
    fontWeight: "normal",
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "2px 6px",
  }),
};

export default function GuestsDropdown({
  guests,
  setGuests,
}: GuestsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalGuests = guests.adults + guests.children;

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

  const handleGuestChange = (
    type: "adults" | "children",
    value: number
  ) => {
    if (type === "children") {
      let newChildrenAges = guests.childrenAges ?? [];
      if (value > newChildrenAges.length) {
        newChildrenAges = [
          ...newChildrenAges,
          ...Array(value - newChildrenAges.length).fill("0"),
        ];
      } else if (value < newChildrenAges.length) {
        newChildrenAges = newChildrenAges.slice(0, value);
      }
      setGuests({
        ...guests,
        children: value,
        childrenAges: newChildrenAges,
      });
    } else {
      setGuests({
        ...guests,
        [type]: value,
      });
    }
  };

  const handleChildAgeChange = (index: number, age: string) => {
    const newChildrenAges = guests.childrenAges ? [...guests.childrenAges] : [];
    newChildrenAges[index] = age;
    setGuests({
      ...guests,
      childrenAges: newChildrenAges,
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="cursor-pointer flex justify-between "
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="text-[14px] lg:text-[17.6px] font-bold text-black ">
          {totalGuests} Guest{totalGuests !== 1 ? "s" : ""}
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-[280px] bg-white border border-black/20 rounded-lg shadow-lg p-4">
          <div className="flex flex-col gap-4">
            <GuestCounter
              label="Adult"
              count={guests.adults}
              setCount={(value) => handleGuestChange("adults", value)}
              min={1}
              max={8}
            />
            <GuestCounter
              label="Child"
              count={guests.children}
              setCount={(value) => handleGuestChange("children", value)}
              min={0}
              max={4}
            />

            {guests.children > 0 && guests.childrenAges && (
              <div>
                <div className="font-bold mb-1 font-nunito">Children Ages</div>
                {guests.childrenAges.map((age, index) => (
                  <Select<AgeOption>
                    key={index}
                    options={ageOptions}
                    value={ageOptions.find((opt) => opt.value === age) ?? null}
                    onChange={(selected) => {
                      if (selected) handleChildAgeChange(index, selected.value);
                    }}
                    className="w-full mb-2"
                    isSearchable={false}
                    styles={customSelectStyles} // You can define or reuse your custom styles here
                    aria-label={`Select age for child ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
