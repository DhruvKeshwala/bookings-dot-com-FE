export type FlightData = FlightOption[][];

export interface FlightOption {
  FareInclusions: any[];
  FirstNameFormat: string | null;
  LastNameFormat: string | null;
  IsBookableIfSeatNotAvailable: boolean;
  IsFreeMealAvailable: boolean;
  IsHoldAllowedWithSSR: boolean;
  IsHoldMandatoryWithSSR: boolean;
  ResultIndex: string;
  Source: number;
  IsLCC: boolean;
  IsRefundable: boolean;
  IsPanRequiredAtBook: boolean;
  IsPanRequiredAtTicket: boolean;
  IsPassportRequiredAtBook: boolean;
  IsPassportRequiredAtTicket: boolean;
  GSTAllowed: boolean;
  IsCouponAppilcable: boolean;
  IsGSTMandatory: boolean;
  AirlineRemark: string;
  IsPassportFullDetailRequiredAtBook: boolean;
  ResultFareType: string;
  Fare: FareDetails;
  FareBreakdown: FareBreakdown[];
  Segments: Segment[][];
  LastTicketDate: string | null;
  TicketAdvisory: string | null;
  FareRules: FareRule[];
  AirlineCode: string;
  MiniFareRules: MiniFareRule[][];
  ValidatingAirline: string;
  FareClassification: FareClassification;
}

export interface FareDetails {
  ServiceFeeDisplayType: number;
  Currency: string;
  BaseFare: number;
  Tax: number;
  TaxBreakup: KeyValue[];
  YQTax: number;
  AdditionalTxnFeeOfrd: number;
  AdditionalTxnFeePub: number;
  PGCharge: number;
  OtherCharges: number;
  ChargeBU: KeyValue[];
  Discount: number;
  PublishedFare: number;
  CommissionEarned: number;
  PLBEarned: number;
  IncentiveEarned: number;
  OfferedFare: number;
  TdsOnCommission: number;
  TdsOnPLB: number;
  TdsOnIncentive: number;
  ServiceFee: number;
  TotalBaggageCharges: number;
  TotalMealCharges: number;
  TotalSeatCharges: number;
  TotalSpecialServiceCharges: number;
}

export interface FareBreakdown {
  Currency: string;
  PassengerType: number;
  PassengerCount: number;
  BaseFare: number;
  Tax: number;
  TaxBreakUp: any;
  YQTax: number;
  AdditionalTxnFeeOfrd: number;
  AdditionalTxnFeePub: number;
  PGCharge: number;
  SupplierReissueCharges: number;
}

export interface KeyValue {
  key: string;
  value: number;
}

export interface Segment {
  AccumulatedDuration: any;
  Baggage: string;
  CabinBaggage: string;
  CabinClass: number;
  SupplierFareClass: string;
  TripIndicator: number;
  SegmentIndicator: number;
  Airline: AirlineInfo;
  NoOfSeatAvailable: number;
  Origin: LocationInfo;
  Destination: LocationInfo;
  Duration: number;
  GroundTime: number;
  Mile: number;
  StopOver: boolean;
  FlightInfoIndex: string;
  StopPoint: string;
  StopPointArrivalTime: string;
  StopPointDepartureTime: string;
  Craft: string;
  Remark: string | null;
  IsETicketEligible: boolean;
  FlightStatus: string;
  Status: string;
  FareClassification: FareClassification;
}

export interface AirlineInfo {
  AirlineCode: string;
  AirlineName: string;
  FlightNumber: string;
  FareClass: string;
  OperatingCarrier: string;
}

export interface LocationInfo {
  Airport: AirportInfo;
  DepTime?: string;
  ArrTime?: string;
}

export interface AirportInfo {
  AirportCode: string;
  AirportName: string;
  Terminal: string;
  CityCode: string;
  CityName: string;
  CountryCode: string;
  CountryName: string;
}

export interface FareRule {
  Origin: string;
  Destination: string;
  Airline: string;
  FareBasisCode: string;
  FareRuleDetail: string;
  FareRestriction: string;
  FareFamilyCode: string;
  FareRuleIndex: string;
}

export interface MiniFareRule {
  JourneyPoints: string;
  Type: string;
  From: string;
  To: string;
  Unit: string;
  Details: string;
  OnlineReissueAllowed: boolean;
  OnlineRefundAllowed: boolean;
}

export interface FareClassification {
  Color?: string;
  Type: string;
}
