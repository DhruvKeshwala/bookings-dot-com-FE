import "@/app/hotel.css";
import { PropsType, RangeValue } from "@/types/hotel.types";
import { DateRangePicker } from "@wojtekmaj/react-daterange-picker";
import "@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css";
import { format } from "date-fns";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import "react-calendar/dist/Calendar.css";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import CalenderIconOne from "../icons/CalendarIcon1";
import { LeftArrowIcon } from "../icons/LeftArrowIcon";
import { RightArrowIcon } from "../icons/RightArrowIcon";

export default function CustomDatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  rangePicker,
  calendarFareData = {},
}: Readonly<PropsType>) {
  const pathname = usePathname();
  const [openDatePicker, setOpenDatePicker] = useState(false);
  // Use type assertion to tell TypeScript this is a valid component type
  const DatePickerComponent = rangePicker
    ? (DateRangePicker as React.ComponentType<any>)
    : (DatePicker as React.ComponentType<any>);

  const [pricesByDate, setPricesByDate] = useState<
    Record<string, { fare: number; airline: string; isLowest: boolean }>
  >({});

  const [activeStartDate, setActiveStartDate] = useState<Date | null>(null);

  const handleInputClick = () => {
    if (!openDatePicker) {
      // Initialize with the current selection date if available, otherwise use today
      let dateToShow;

      if (rangePicker && Array.isArray(value) && value[0]) {
        // For range picker, use the first selected date
        dateToShow = new Date(value[0].getFullYear(), value[0].getMonth(), 1);
      } else if (!rangePicker && value instanceof Date) {
        // For single date picker, use the selected date
        dateToShow = new Date(value.getFullYear(), value.getMonth(), 1);
      } else {
        // Fallback to current month if no selection
        const today = new Date();
        dateToShow = new Date(today.getFullYear(), today.getMonth(), 1);
      }

      setActiveStartDate(dateToShow);
    } else {
      setActiveStartDate(null);
    }

    setOpenDatePicker(!openDatePicker);
  };

  useEffect(() => {
    if (calendarFareData) {
      const prices: Record<
        string,
        { fare: number; airline: string; isLowest: boolean }
      > = {};

      for (const { Response } of Object.values(calendarFareData)) {
        for (const {
          DepartureDate,
          Fare,
          AirlineName,
          IsLowestFareOfMonth,
        } of Response?.SearchResults ?? []) {
          const date = DepartureDate?.split("T")[0];
          if (date && Fare) {
            prices[date] = {
              fare: Math.round(Fare),
              airline: AirlineName,
              isLowest: IsLowestFareOfMonth,
            };
          }
        }
      }

      setPricesByDate(prices);
    }
  }, [calendarFareData]);

  // Initialize activeStartDate based on the current selection when the component mounts
  useEffect(() => {
    if (value) {
      if (rangePicker && Array.isArray(value) && value[0] instanceof Date) {
        // For range picker, use first selected date to determine month
        setActiveStartDate(
          new Date(value[0].getFullYear(), value[0].getMonth(), 1)
        );
      } else if (!rangePicker && value instanceof Date) {
        // For single date picker
        setActiveStartDate(new Date(value.getFullYear(), value.getMonth(), 1));
      }
    }
  }, [value, rangePicker]);

  const getFormattedDate = () => {
    if (!value) return "";
    return value instanceof Date
      ? format(value, "dd MMM yyyy")
      : `${value[0] ? format(value[0], "dd MMM") : "Start date"} - ${
          value[1] ? format(value[1], "dd MMM yyyy") : "End date"
        }`;
  };

  return (
    <div className="relative w-full">
      {openDatePicker && (
        <div
          className={`absolute top-full z-[100] mt-2 rounded-[12px] px-6 py-2 ${
            rangePicker ? "daterange-picker" : "single-date-picker"
          }`}
          style={{
            minHeight: rangePicker ? "480px" : "400px",
            minWidth: rangePicker ? "600px" : "350px",
            paddingLeft: "16px",
            paddingRight: "16px",
          }}
        >
          <DatePickerComponent
            isOpen={openDatePicker}
            onCalendarClose={handleInputClick}
            className="datepicker-custom-wrapper"
            onChange={(val: any) => {
              onChange(val);

              if (rangePicker && Array.isArray(val)) {
                if (val[0] instanceof Date) {
                  // Update the active month to show the first selected date
                  const start = val[0];
                  const startMonth = new Date(
                    start.getFullYear(),
                    start.getMonth(),
                    1
                  );
                  setActiveStartDate(startMonth);
                }
              } else if (!rangePicker && val instanceof Date) {
                // For single date, update active month to the selected date
                const selectedMonth = new Date(
                  val.getFullYear(),
                  val.getMonth(),
                  1
                );
                setActiveStartDate(selectedMonth);
              }
            }}
            value={value as RangeValue}
            minDate={minDate}
            maxDate={maxDate}
            calendarProps={{
              nextLabel: <RightArrowIcon />,
              prevLabel: <LeftArrowIcon />,
              showFixedNumberOfWeeks: false,
              showDoubleView:
                typeof window !== "undefined" &&
                window.innerWidth >= 1024 &&
                rangePicker,
              activeStartDate: activeStartDate ?? minDate ?? new Date(),
              onActiveStartDateChange: ({
                action,
                activeStartDate: newDate,
              }: {
                action: string;
                activeStartDate: Date | null;
              }) => {
                if (!newDate) return;
                if (
                  action === "next" ||
                  (action === "prev" &&
                    (!minDate ||
                      newDate >=
                        new Date(minDate.getFullYear(), minDate.getMonth(), 1)))
                ) {
                  setActiveStartDate(newDate);
                }
              },
              tileContent: ({ date, view }: { date: Date; view: string }) => {
                if (view !== "month") return null;

                const dateStr = date.toISOString().split("T")[0];
                const fareInfo = pricesByDate[dateStr];

                if (fareInfo) {
                  const { fare, airline, isLowest } = fareInfo;

                    const formatFare = (value: number) => {
                      if (value >= 100000) return (value / 100000).toFixed(1).replace(/\.0$/, "") + "L"; // Lakh
                      if (value >= 1000) return (value / 1000).toFixed(1).replace(/\.0$/, "") + "k"; // Thousand
                      return value.toString();
                    };

                  return (
                    <div
                      className={`text-center ${
                        isLowest ? "text-green-700 font-bold" : "text-gray-600"
                      }`}
                      title={`${airline} • ₹${fare}${
                        isLowest ? " • Lowest Fare" : ""
                      }`}
                    >
                      ₹{formatFare(fare)}
                      
                    </div>
                  );
                }

                return null;
              },
            }}
          />
        </div>
      )}
      {pathname?.startsWith("/hotels/search") ||
      pathname?.startsWith("/flights/search") ? (
        <input
          onChange={() => {}}
          value={getFormattedDate()}
          className={`text-black subheading focus:outline-0 cursor-pointer lg-col-span-3 text-balance pl-3`}
          onClick={handleInputClick}
          readOnly
        />
      ) : (
        <div className="flex items-center gap-[10px] bg-white border border-[#CBCACA] rounded-[8px] px-[12px] py-[10px]">
          <div className="w-[14px]">
            <CalenderIconOne />
          </div>

          <input
            onChange={() => {}}
            value={getFormattedDate()}
            className={`body-text text-[#646464] focus:outline-0 cursor-pointer`}
            onClick={handleInputClick}
            readOnly
          />
        </div>
      )}
    </div>
  );
}
