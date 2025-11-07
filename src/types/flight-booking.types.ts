export interface FlightBooking {
  id: number;
  bookingId: number;
  pnr: string;
  isDomestic: boolean;
  origin: string;
  destination: string;
  airlineCode: string;
  segments: FlightSegment[];
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    googleId: string;
    otp: string;
    otpExpiry: string;
    isverified: boolean;
    resetToken: string;
    resetTokenExpiry: string;
    createdAt: string;
    updatedAt: string;
  };
  passengers: Passenger[];
}

export interface FlightSegment {
  id: number;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
}

export interface Passenger {
  id: number;
  paxId: number;
  firstName: string;
  lastName: string;
  paxType: number;
  dateOfBirth: string;
  contactNo: string;
  email: string;
  fare: Fare;
  baggage: any;
  meal: any;
  ticket: Ticket;
}

export interface Fare {
  Tax: number;
  YQTax: number;
  BaseFare: number;
  ChargeBU: ChargeBU[];
  Currency: string;
  Discount: number;
  PGCharge: number;
  TdsOnPLB: number;
  PLBEarned: number;
  ServiceFee: number;
  TaxBreakup: TaxBreakup[];
  OfferedFare: number;
  OtherCharges: number;
  PublishedFare: number;
  TdsOnIncentive: number;
  IncentiveEarned: number;
  TdsOnCommission: number;
  CommissionEarned: number;
  TotalMealCharges: number;
  TotalSeatCharges: number;
  AdditionalTxnFeePub: number;
  TotalBaggageCharges: number;
  AdditionalTxnFeeOfrd: number;
  ServiceFeeDisplayType: number;
  TotalSpecialServiceCharges: number;
}

export interface ChargeBU {
  key: string;
  value: number;
}

export interface TaxBreakup {
  key: string;
  value: number;
}

export interface Ticket {
  Status: string;
  Remarks: string;
  TicketId: number;
  IssueDate: string;
  TicketType: string;
  TicketNumber: string;
  ConjunctionNumber: string;
  ValidatingAirline: string;
  ServiceFeeDisplayType: string;
}

export interface FlightHistoryResponse {
  data: FlightBooking[];
  message?: string;
  success?: boolean;
}
