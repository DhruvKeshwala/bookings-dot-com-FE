// Type definitions for react-calendar and related modules

declare module 'react-calendar' {
  import React from 'react';

  export interface CalendarProps {
    activeStartDate?: Date;
    allowPartialRange?: boolean;
    calendarType?: 'ISO 8601' | 'US' | 'Arabic' | 'Hebrew';
    className?: string;
    defaultActiveStartDate?: Date;
    defaultValue?: Date | Date[];
    defaultView?: 'century' | 'decade' | 'year' | 'month';
    formatDay?: (locale: string | undefined, date: Date) => string;
    formatLongDate?: (locale: string | undefined, date: Date) => string;
    formatMonth?: (locale: string | undefined, date: Date) => string;
    formatMonthYear?: (locale: string | undefined, date: Date) => string;
    formatShortWeekday?: (locale: string | undefined, date: Date) => string;
    formatYear?: (locale: string | undefined, date: Date) => string;
    locale?: string;
    maxDate?: Date;
    maxDetail?: 'century' | 'decade' | 'year' | 'month';
    minDate?: Date;
    minDetail?: 'century' | 'decade' | 'year' | 'month';
    navigationAriaLabel?: string;
    navigationLabel?: (
      { date, view, label }: { date: Date; view: string; label: string }
    ) => React.ReactNode;
    next2AriaLabel?: string;
    next2Label?: React.ReactNode;
    nextAriaLabel?: string;
    nextLabel?: React.ReactNode;
    onActiveStartDateChange?: (
      props: {
        activeStartDate: Date;
        value: Date | Date[];
        view: 'century' | 'decade' | 'year' | 'month';
      }
    ) => void;
    onChange?: (value: Date | Date[]) => void;
    onClickDay?: (value: Date) => void;
    onClickDecade?: (value: Date) => void;
    onClickMonth?: (value: Date) => void;
    onClickWeekNumber?: (weekNumber: number, date: Date) => void;
    onClickYear?: (value: Date) => void;
    onDrillDown?: (
      props: {
        activeStartDate: Date;
        view: 'century' | 'decade' | 'year' | 'month';
      }
    ) => void;
    onDrillUp?: (
      props: {
        activeStartDate: Date;
        view: 'century' | 'decade' | 'year' | 'month';
      }
    ) => void;
    onViewChange?: (
      props: {
        activeStartDate: Date;
        value: Date | Date[];
        view: 'century' | 'decade' | 'year' | 'month';
      }
    ) => void;
    prev2AriaLabel?: string;
    prev2Label?: React.ReactNode;
    prevAriaLabel?: string;
    prevLabel?: React.ReactNode;
    returnValue?: 'start' | 'end' | 'range';
    selectRange?: boolean;
    showDoubleView?: boolean;
    showFixedNumberOfWeeks?: boolean;
    showNavigation?: boolean;
    showNeighboringMonth?: boolean;
    showWeekNumbers?: boolean;
    tileClassName?: 
      | string
      | string[]
      | ((props: { date: Date; view: string }) => string | string[] | null);
    tileContent?: 
      | React.ReactNode
      | ((props: { date: Date; view: string }) => React.ReactNode);
    tileDisabled?: (props: { date: Date; view: string }) => boolean;
    value?: Date | Date[] | null;
    view?: 'century' | 'decade' | 'year' | 'month';
    [key: string]: any; // Allow any other props
  }

  const Calendar: React.FC<CalendarProps>;
  
  export default Calendar;
}

// CSS module declarations
declare module 'react-calendar/dist/Calendar.css';
declare module 'react-date-picker/dist/DatePicker.css';
declare module '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';

// DateRangePicker module declarations
declare module '@wojtekmaj/react-daterange-picker' {
  import React from 'react';
  import { CalendarProps } from 'react-calendar';

  export interface DateRangePickerProps {
    calendarProps?: CalendarProps;
    className?: string;
    clearIcon?: React.ReactNode;
    closeCalendar?: boolean;
    dayAriaLabel?: string;
    dayPlaceholder?: string;
    disabled?: boolean;
    disableCalendar?: boolean;
    format?: string;
    isOpen?: boolean;
    locale?: string;
    maxDate?: Date;
    maxDetail?: 'month' | 'year' | 'decade' | 'century';
    minDate?: Date;
    monthAriaLabel?: string;
    monthPlaceholder?: string;
    name?: string;
    nativeInputAriaLabel?: string;
    onChange?: (value: [Date | null, Date | null] | null) => void;
    onCalendarClose?: () => void;
    onCalendarOpen?: () => void;
    required?: boolean;
    showLeadingZeros?: boolean;
    value?: [Date | null, Date | null] | null;
    yearAriaLabel?: string;
    yearPlaceholder?: string;
    [key: string]: any; // Allow any other props
  }

  export class DateRangePicker extends React.Component<DateRangePickerProps> {}
}

// DatePicker module declarations
declare module 'react-date-picker' {
  import React from 'react';
  import { CalendarProps } from 'react-calendar';

  export interface DatePickerProps {
    calendarProps?: CalendarProps;
    className?: string;
    clearIcon?: React.ReactNode;
    closeCalendar?: boolean;
    dayAriaLabel?: string;
    dayPlaceholder?: string;
    disabled?: boolean;
    disableCalendar?: boolean;
    format?: string;
    isOpen?: boolean;
    locale?: string;
    maxDate?: Date;
    maxDetail?: 'month' | 'year' | 'decade' | 'century';
    minDate?: Date;
    monthAriaLabel?: string;
    monthPlaceholder?: string;
    name?: string;
    nativeInputAriaLabel?: string;
    onChange?: (value: Date | null) => void;
    onCalendarClose?: () => void;
    onCalendarOpen?: () => void;
    required?: boolean;
    showLeadingZeros?: boolean;
    value?: Date | null;
    yearAriaLabel?: string;
    yearPlaceholder?: string;
    [key: string]: any; // Allow any other props
  }

  export default class DatePicker extends React.Component<DatePickerProps> {}
}
