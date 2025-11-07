import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { FlightData } from "@/common/types/flight-data.types";
import { Popover } from "@/components/ui/Popover";
import Slider from "@/components/ui/Slider";
import RangeSlider from "@/components/ui/RangeSlider";
import Switch from "@/components/ui/Switch";
import { CarryBagIcon } from "@/components/icons/CarryBag";
import { CheckedBagIcon } from "@/components/icons/CheckdBag";
import {
  getAllAirlines,
  getMaxDurationInHours,
  getMinMaxPublishedFare,
} from "../functions";
import { toCurrency } from "@/utils/functions/to-currency";

interface FilterControlsProps {
  isRoundTrip: boolean;
  data: FlightData;
  totalResults: number;
  filteredResults: number;
  setSelectedFilter: (data: {
    airlines: string[];
    stops: string[];
    duration: number;
    inboundLimit: number | null;
    maxPrice: number;
    baggages: string[];
    depTimeRange: [number, number];
    arrTimeRange?: [number, number];
    depTimeRangeInternational: [number, number];
    arrTimeRangeInternational?: [number, number];
  }) => void;
  isPureInternationalReturn: boolean;
}

const FLIGHT_STOPS = ["Direct", "1 Stop", "2 Stop +"];

const BAGGAGE_OPTIONS = [
  { icon: <CarryBagIcon />, label: "Carry-on Bag", value: "carry_on_bag" },
  { icon: <CheckedBagIcon />, label: "Checked Bag", value: "checked_bag" },
];

function valueToPercent(value: number, min: number, max: number) {
  if (max === min) return 0;
  const clamped = Math.max(min, Math.min(max, value));
  return ((clamped - min) / (max - min)) * 100;
}

export default function FilterControls({
  isRoundTrip,
  data,
  totalResults,
  filteredResults,
  setSelectedFilter,
  isPureInternationalReturn,
}: Readonly<FilterControlsProps>) {
  const airlineList = useMemo(() => getAllAirlines(data), [data]);

  const [selectAllFlight, setSelectAllFlight] = useState(true);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedBaggages, setSelectedBaggages] = useState<string[]>([]);
  const [selectedFlightStops, setSelectedFlightStops] = useState<string[]>([]);
  const [flightDuration, setFlightDuration] = useState(50);
  const [maxFlightDuration, setMaxFlightDuration] = useState(50);
  const [flightDurationInternational, setFlightDurationInternational] =
    useState(50);
  const [maxFlightDurationInternational, setMaxFlightDurationInternational] =
    useState(50);
  const [depTimeRange, setDepTimeRange] = useState<[number, number]>([0, 24]);
  const [arrTimeRange, setArrTimeRange] = useState<[number, number]>([0, 24]);
  const [depTimeRangeInternational, setDepTimeRangeInternational] = useState<
    [number, number]
  >([0, 24]);
  const [arrTimeRangeInternational, setArrTimeRangeInternational] = useState<
    [number, number]
  >([0, 24]);
  const [flightPrice, setFlightPrice] = useState(0);
  const [maxFlightPrice, setMaxFlightPrice] = useState(0);
  const [minFlightPrice, setMinFlightPrice] = useState(0);

  // Tooltip states & refs
  const rangeWrapperRef = useRef<HTMLDivElement | null>(null);
  const priceWrapperRef = useRef<HTMLDivElement | null>(null);
  const durationWrapperRef = useRef<HTMLDivElement | null>(null);

  const [isRangeHover, setIsRangeHover] = useState(false);
  const [isRangeDragging, setIsRangeDragging] = useState(false);

  const [isPriceHover, setIsPriceHover] = useState(false);
  const [isPriceDragging, setIsPriceDragging] = useState(false);

  const [isDurationHover, setIsDurationHover] = useState(false);
  const [isDurationDragging, setIsDurationDragging] = useState(false);

  // Setup max values and default filters
  useEffect(() => {
    const maxDuration = getMaxDurationInHours(data);
    const { minFare, maxFare } = getMinMaxPublishedFare(data);

    setMaxFlightDuration(maxDuration);
    setFlightDuration(maxDuration);
    setMaxFlightDurationInternational(maxDuration);
    setFlightDurationInternational(maxDuration);

    setMinFlightPrice(minFare);
    setMaxFlightPrice(maxFare);
    setFlightPrice(maxFare);
  }, [data]);

  useEffect(() => {
    setSelectedAirlines(airlineList);
  }, [airlineList]);

  const toggleItemInList = useCallback(
    (item: string, list: string[], setList: (list: string[]) => void) => {
      setList(
        list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
      );
    },
    []
  );

  const handleAirlineToggle = useCallback(
    (checked: boolean) => {
      setSelectedAirlines(checked ? airlineList : []);
      setSelectAllFlight(checked);
    },
    [airlineList]
  );

  useEffect(() => {
    setSelectAllFlight(selectedAirlines.length === airlineList.length);

    setSelectedFilter({
      airlines: selectedAirlines,
      stops: selectedFlightStops,
      duration: flightDuration,
      inboundLimit: flightDurationInternational,
      maxPrice: flightPrice,
      baggages: selectedBaggages,
      depTimeRange,
      arrTimeRange,
      depTimeRangeInternational,
      arrTimeRangeInternational,
    });
  }, [
    selectedAirlines,
    selectedFlightStops,
    flightDuration,
    flightDurationInternational,
    flightPrice,
    selectedBaggages,
    depTimeRange,
    arrTimeRange,
    depTimeRangeInternational,
    arrTimeRangeInternational,
    airlineList.length,
    setSelectedFilter,
  ]);

  // global pointerup to stop dragging (cleanup safe)
  useEffect(() => {
    const onPointerUp = () => {
      setIsRangeDragging(false);
      setIsPriceDragging(false);
      setIsDurationDragging(false);
    };
    window.addEventListener("pointerup", onPointerUp);
    return () => window.removeEventListener("pointerup", onPointerUp);
  }, []);

  return (
    <div className="flex items-center justify-between mt-[28px] mb-[20px] max-lg:flex-col max-lg:gap-4 max-lg:items-start relative">
      {/* Filter Panel */}
      <div className="relative ">
        <Popover
          trigger={
            <button className="flex items-center gap-1 px-[6px] py-[3px] border-[1px] border-[#b3b3b3] rounded-[8px] bg-white hover:shadow-md transition-shadow">
              <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                <path
                  d="M16.6667 30H23.3333V26.6667H16.6667V30ZM5 10V13.3333H35V10H5ZM10 21.6667H30V18.3333H10V21.6667Z"
                  fill="#014569"
                />
              </svg>
              <span className="btn-text text-primary">Filter</span>
            </button>
          }
          position="bottom"
          className="border-[#b3b3b3] border rounded-2xl rounded-l-none shadow-2xl bg-white z-[9999] max-h-[80vh] overflow-visible"
        >
          <div className="z-[100] w-[378px] px-6 py-5 space-y-4 divide-y divide-[#999999] font-nunito max-h-[70vh] overflow-y-auto no-scrollbar">
            {/* Airlines */}
            <FilterSection title="Airlines">
              <div className="flex justify-between items-center mb-3">
                <p className="body-text">Select all airlines</p>
                <Switch
                  checked={selectAllFlight}
                  onChange={handleAirlineToggle}
                />
              </div>
              <CheckboxList
                items={airlineList}
                selected={selectedAirlines}
                onToggle={(val) =>
                  toggleItemInList(val, selectedAirlines, setSelectedAirlines)
                }
              />
            </FilterSection>

            {/* Stops */}
            <FilterSection
              title="Stops"
              onClear={() => setSelectedFlightStops([])}
            >
              <CheckboxList
                items={FLIGHT_STOPS}
                selected={selectedFlightStops}
                onToggle={(val) =>
                  toggleItemInList(
                    val,
                    selectedFlightStops,
                    setSelectedFlightStops
                  )
                }
              />
            </FilterSection>

            {/* Baggage */}
            <FilterSection
              title="Baggage"
              onClear={() => setSelectedBaggages([])}
            >
              <ul className="space-y-[10px]">
                {BAGGAGE_OPTIONS.map(({ value, label, icon }) => (
                  <li key={value}>
                    <label
                      htmlFor={value}
                      className="flex gap-2 items-center cursor-pointer"
                    >
                      <input
                        id={value}
                        type="checkbox"
                        checked={selectedBaggages.includes(value)}
                        onChange={() =>
                          toggleItemInList(
                            value,
                            selectedBaggages,
                            setSelectedBaggages
                          )
                        }
                        className="w-4 h-4 rounded-md accent-black"
                      />
                      <div className="flex items-center gap-2">
                        {icon}
                        <span className="body-text">{label}</span>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            </FilterSection>

            {/* Departure Times */}
            <FilterSection
              title="Departure"
              onClear={() => setDepTimeRange([0, 24])}
            >
              <div className="body-text mb-2">
                {isRoundTrip ? "Outbound" : "Return"}
              </div>
              <div
                ref={rangeWrapperRef}
                className="relative py-1"
                onMouseEnter={() => setIsRangeHover(true)}
                onMouseLeave={() => {
                  setIsRangeHover(false);
                  // only keep dragging state if pointer still down (pointerup handler resets)
                }}
                onPointerDown={() => setIsRangeDragging(true)}
              >
                {/* Tooltip: start thumb */}
                <div
                  className={`absolute -top-8 pointer-events-none transform -translate-x-1/2 z-10 transition-opacity duration-200 ${
                    isRangeHover || isRangeDragging
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                  style={{
                    left: `${valueToPercent(depTimeRange[0], 0, 24)}%`,
                  }}
                  aria-hidden
                >
                  <div className="bg-primary px-2 py-1 rounded-[7px] text-white text-[12px] whitespace-nowrap relative">
                    {String(depTimeRange[0]).padStart(2, "0")}:00
                    <div className="bg-primary w-[10px] h-[10px] rounded-[2px] rotate-45 absolute bottom-[-5px] right-[10px]" />
                  </div>
                </div>

                {/* Tooltip: end thumb */}
                <div
                  className={`absolute -top-8 pointer-events-none transform -translate-x-1/2 z-10 transition-opacity duration-200 ${
                    isRangeHover || isRangeDragging
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                  style={{
                    left: `${valueToPercent(depTimeRange[1], 0, 24)}%`,
                  }}
                  aria-hidden
                >
                  <div className="bg-primary px-2 py-1 rounded-[7px] text-white text-[12px] whitespace-nowrap relative">
                    {String(depTimeRange[1]).padStart(2, "0")}:00
                    <div className="bg-primary w-[10px] h-[10px] rounded-[2px] rotate-45 absolute bottom-[-5px]" />
                  </div>
                </div>

                <RangeSlider
                  min={0}
                  max={24}
                  step={1}
                  value={depTimeRange}
                  onChange={setDepTimeRange}
                />
              </div>
              <div className="flex justify-between text-[16px] mt-1">
                <span>00:00</span>
                <span>24:00</span>
              </div>
            </FilterSection>

            {/* Arrival Times */}
            <FilterSection
              title="Arrival"
              onClear={() => setArrTimeRange([0, 24])}
            >
              <div className="text-[16px] mb-2">
                {isRoundTrip ? "Outbound" : "Return"}
              </div>
              <div
                ref={rangeWrapperRef}
                className="relative py-2"
                onMouseEnter={() => setIsRangeHover(true)}
                onMouseLeave={() => {
                  setIsRangeHover(false);
                  // only keep dragging state if pointer still down (pointerup handler resets)
                }}
                onPointerDown={() => setIsRangeDragging(true)}
              >
                {/* Tooltip: start thumb */}
                <div
                  className={`absolute -top-7 pointer-events-none transform -translate-x-1/2 z-10 transition-opacity duration-200 ${
                    isRangeHover || isRangeDragging
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                  style={{
                    left: `${valueToPercent(arrTimeRange[0], 0, 24)}%`,
                  }}
                  aria-hidden
                >
                  <div className="bg-primary px-2 py-1 rounded-[7px] text-white text-[12px] whitespace-nowrap relative">
                    {String(arrTimeRange[0]).padStart(2, "0")}:00
                    <div className="bg-primary w-[10px] h-[10px] rounded-[2px] rotate-45 absolute bottom-[-5px] right-[10px]" />
                  </div>
                </div>

                {/* Tooltip: end thumb */}
                <div
                  className={`absolute -top-7 pointer-events-none transform -translate-x-1/2 z-10 transition-opacity duration-200 ${
                    isRangeHover || isRangeDragging
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                  style={{
                    left: `${valueToPercent(arrTimeRange[1], 0, 24)}%`,
                  }}
                  aria-hidden
                >
                  <div className="bg-primary px-2 py-1 rounded-[7px] text-white text-[12px] whitespace-nowrap relative">
                    {String(arrTimeRange[1]).padStart(2, "0")}:00
                    <div className="bg-primary w-[10px] h-[10px] rounded-[2px] rotate-45 absolute bottom-[-5px]" />
                  </div>
                </div>
                <RangeSlider
                  min={0}
                  max={24}
                  step={1}
                  value={arrTimeRange}
                  onChange={setArrTimeRange}
                />
              </div>
              <div className="flex justify-between text-[16px] mt-1">
                <span>00:00</span>
                <span>24:00</span>
              </div>
            </FilterSection>

            {/* case of pure international return flight, show both dep and arr time filters */}

            {isPureInternationalReturn && (
              <>
                {/* Departure Times */}
                <FilterSection
                  title="Departure"
                  onClear={() => setDepTimeRangeInternational([0, 24])}
                >
                  <div className="text-[16px] mb-2">{"Return"}</div>
                  <div
                    ref={rangeWrapperRef}
                    className="relative py-2"
                    onMouseEnter={() => setIsRangeHover(true)}
                    onMouseLeave={() => {
                      setIsRangeHover(false);
                      // only keep dragging state if pointer still down (pointerup handler resets)
                    }}
                    onPointerDown={() => setIsRangeDragging(true)}
                  >
                    {/* Tooltip: start thumb */}
                    <div
                      className={`absolute -top-7 pointer-events-none transform -translate-x-1/2 z-10 transition-opacity duration-200 ${
                        isRangeHover || isRangeDragging
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                      style={{
                        left: `${valueToPercent(
                          depTimeRangeInternational[0],
                          0,
                          24
                        )}%`,
                      }}
                      aria-hidden
                    >
                      <div className="bg-primary px-2 py-1 rounded-[7px] text-white text-[12px] whitespace-nowrap relative">
                        {String(depTimeRangeInternational[0]).padStart(2, "0")}
                        :00
                        <div className="bg-primary w-[10px] h-[10px] rounded-[2px] rotate-45 absolute bottom-[-5px] right-[10px]" />
                      </div>
                    </div>

                    {/* Tooltip: end thumb */}
                    <div
                      className={`absolute -top-7 pointer-events-none transform -translate-x-1/2 z-10 transition-opacity duration-200 ${
                        isRangeHover || isRangeDragging
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                      style={{
                        left: `${valueToPercent(
                          depTimeRangeInternational[1],
                          0,
                          24
                        )}%`,
                      }}
                      aria-hidden
                    >
                      <div className="bg-primary px-2 py-1 rounded-[7px] text-white text-[12px] whitespace-nowrap relative">
                        {String(depTimeRangeInternational[1]).padStart(2, "0")}
                        :00
                        <div className="bg-primary w-[10px] h-[10px] rounded-[2px] rotate-45 absolute bottom-[-5px]" />
                      </div>
                    </div>
                    <RangeSlider
                      min={0}
                      max={24}
                      step={1}
                      value={depTimeRangeInternational}
                      onChange={setDepTimeRangeInternational}
                    />
                  </div>
                  <div className="flex justify-between text-[16px] mt-1">
                    <span>00:00</span>
                    <span>24:00</span>
                  </div>
                </FilterSection>

                {/* Arrival Times */}
                <FilterSection
                  title="Arrival"
                  onClear={() => setArrTimeRangeInternational([0, 24])}
                >
                  <div className="text-[16px] mb-2">{"Return"}</div>
                  <div
                    ref={rangeWrapperRef}
                    className="relative py-2"
                    onMouseEnter={() => setIsRangeHover(true)}
                    onMouseLeave={() => {
                      setIsRangeHover(false);
                      // only keep dragging state if pointer still down (pointerup handler resets)
                    }}
                    onPointerDown={() => setIsRangeDragging(true)}
                  >
                    {/* Tooltip: start thumb */}
                    <div
                      className={`absolute -top-7 pointer-events-none transform -translate-x-1/2 z-10 transition-opacity duration-200 ${
                        isRangeHover || isRangeDragging
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                      style={{
                        left: `${valueToPercent(
                          arrTimeRangeInternational[0],
                          0,
                          24
                        )}%`,
                      }}
                      aria-hidden
                    >
                      <div className="bg-primary px-2 py-1 rounded-[7px] text-white text-[12px] whitespace-nowrap relative">
                        {String(arrTimeRangeInternational[0]).padStart(2, "0")}
                        :00
                        <div className="bg-primary w-[10px] h-[10px] rounded-[2px] rotate-45 absolute bottom-[-5px] right-[10px]" />
                      </div>
                    </div>

                    {/* Tooltip: end thumb */}
                    <div
                      className={`absolute -top-7 pointer-events-none transform -translate-x-1/2 z-10 transition-opacity duration-200 ${
                        isRangeHover || isRangeDragging
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                      style={{
                        left: `${valueToPercent(
                          arrTimeRangeInternational[1],
                          0,
                          24
                        )}%`,
                      }}
                      aria-hidden
                    >
                      <div className="bg-primary px-2 py-1 rounded-[7px] text-white text-[12px] whitespace-nowrap relative">
                        {String(arrTimeRangeInternational[1]).padStart(2, "0")}
                        :00
                        <div className="bg-primary w-[10px] h-[10px] rounded-[2px] rotate-45 absolute bottom-[-5px]" />
                      </div>
                    </div>
                    <RangeSlider
                      min={0}
                      max={24}
                      step={1}
                      value={arrTimeRangeInternational}
                      onChange={setArrTimeRangeInternational}
                    />
                  </div>
                  <div className="flex justify-between text-[16px] mt-1">
                    <span>00:00</span>
                    <span>24:00</span>
                  </div>
                </FilterSection>
              </>
            )}

            {/* end of pure international return flight, show both dep and arr time filters */}

            {/* Price */}
            <FilterSection
              title="Price"
              onClear={() => setFlightPrice(maxFlightPrice)}
            >
              <div className="body-text mb-2">
                Up to {toCurrency(flightPrice)}
              </div>
              <div
                ref={priceWrapperRef}
                className="relative py-2"
                onMouseEnter={() => setIsPriceHover(true)}
                onMouseLeave={() => setIsPriceHover(false)}
                onPointerDown={() => setIsPriceDragging(true)}
              >
                <div
                  className={`absolute -top-7 pointer-events-none transform -translate-x-1/2 z-10 transition-opacity duration-200 ${
                    isPriceHover || isPriceDragging
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                  style={{
                    left: `${valueToPercent(
                      flightPrice,
                      minFlightPrice,
                      maxFlightPrice
                    )}%`,
                  }}
                  aria-hidden
                >
                  <div className="bg-primary px-2 py-1 rounded-[7px] text-white text-[12px] whitespace-nowrap relative">
                    {toCurrency(flightPrice)}
                    <div className="bg-primary w-[10px] h-[10px] rounded-[2px] rotate-45 absolute bottom-[-5px] left-[20%]" />
                  </div>
                </div>
                <Slider
                  min={minFlightPrice}
                  max={maxFlightPrice}
                  step={300}
                  value={flightPrice}
                  onChange={setFlightPrice}
                />
              </div>
              <div className="flex justify-between body-text">
                <span>{toCurrency(minFlightPrice)}</span>
                <span>{toCurrency(maxFlightPrice)}</span>
              </div>
            </FilterSection>

            {/* Duration */}
            <FilterSection
              title="Duration"
              onClear={() => setFlightDuration(maxFlightDuration)}
            >
              <div className="text-[16px] mb-2">
                Under {flightDuration} hours
              </div>
              <div
                ref={durationWrapperRef}
                className="relative py-2"
                onMouseEnter={() => setIsDurationHover(true)}
                onMouseLeave={() => setIsDurationHover(false)}
                onPointerDown={() => setIsDurationDragging(true)}
              >
                <div
                  className={`absolute -top-7 pointer-events-none transform -translate-x-1/2 z-10 transition-opacity duration-200 ${
                    isDurationHover || isDurationDragging
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                  style={{
                    left: `${valueToPercent(
                      flightDuration,
                      1,
                      maxFlightDuration
                    )}%`,
                  }}
                  aria-hidden
                >
                  <div className="bg-primary px-2 py-1 rounded-[7px] text-white text-[12px] whitespace-nowrap relative min-w-6">
                    {flightDuration}h
                    <div className="bg-primary w-[10px] h-[10px] rounded-[2px] rotate-45 absolute bottom-[-5px]" />
                  </div>
                </div>
                <Slider
                  min={1}
                  max={maxFlightDuration}
                  value={flightDuration}
                  onChange={setFlightDuration}
                />
              </div>
              <div className="flex justify-between text-[16px] mt-1">
                <span>{1} hr</span>
                <span>{maxFlightDuration} hr</span>
              </div>
            </FilterSection>

            {isPureInternationalReturn && (
              <FilterSection
                title="DurationReturn"
                onClear={() =>
                  setFlightDurationInternational(maxFlightDurationInternational)
                }
              >
                <div className="text-[16px] mb-2">
                  Under {flightDurationInternational} hours
                </div>
                <div
                  ref={durationWrapperRef}
                  className="relative pb-6"
                  onMouseEnter={() => setIsDurationHover(true)}
                  onMouseLeave={() => setIsDurationHover(false)}
                  onPointerDown={() => setIsDurationDragging(true)}
                >
                  <div
                    className={`absolute -top-10 pointer-events-none transform -translate-x-1/2 z-10 transition-opacity duration-200 ${
                      isDurationHover || isDurationDragging
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                    style={{
                      left: `${valueToPercent(
                        flightDurationInternational,
                        1,
                        maxFlightDurationInternational
                      )}%`,
                    }}
                    aria-hidden
                  >
                    <div className="px-2 py-1 rounded-md text-white bg-[#001F50] text-xs whitespace-nowrap shadow-lg">
                      {flightDurationInternational}h
                    </div>
                  </div>
                  <Slider
                    min={1}
                    max={maxFlightDurationInternational}
                    value={flightDurationInternational}
                    onChange={setFlightDurationInternational}
                  />
                </div>
                <div className="flex justify-between text-[16px] mt-1">
                  <span>{1} hr</span>
                  <span>{maxFlightDurationInternational} hr</span>
                </div>
              </FilterSection>
            )}
          </div>
        </Popover>
      </div>

      {/* Results Count */}
      <div className="text-primary btn-text">
        {filteredResults} out of {totalResults} results
      </div>
    </div>
  );
}

// Reusable Section Wrapper
function FilterSection({
  title,
  onClear,
  children,
}: Readonly<{
  title: string;
  onClear?: () => void;
  children: React.ReactNode;
}>) {
  return (
    <div className="pb-4">
      <div className="flex justify-between mb-3">
        <p className="btn-text">{title}</p>
        {onClear && (
          <button
            className="text-primary btn-text cursor-pointer"
            onClick={onClear}
          >
            Clear
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// Reusable Checkbox List
function CheckboxList({
  items,
  selected,
  onToggle,
}: Readonly<{
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
}>) {
  return (
    <ul className="rounded-lg space-y-2">
      {items.map((item) => (
        <li key={item}>
          <label
            htmlFor={item}
            className="flex items-center gap-4 cursor-pointer"
          >
            <input
              id={item}
              type="checkbox"
              checked={selected.includes(item)}
              onChange={() => onToggle(item)}
              className="w-4 h-4 rounded-lg accent-black"
            />
            <span className="text-black body-text">{item}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}
