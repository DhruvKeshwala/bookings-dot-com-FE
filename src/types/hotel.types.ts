import { ReactNode } from "react";
import { LocationOption } from "./LocationOption";

export interface ApiHotelDetails {
  HotelCode: string;
  HotelName: string;
  Description: string;
  HotelFacilities: string[];
  Attractions: {
    [key: string]: string;
  };
  Address: string;
  PinCode: string;
  CityId: string;
  CountryName: string;
  PhoneNumber: string;
  FaxNumber: string;
  Map: string;
  HotelRating: number;
  Images: string[];
  TripAdvisorRating: string;
  CityName: string;
  CountryCode: string;
  CheckInTime: string;
  CheckOutTime: string;
}

export type Hotel = {
  id: string;
  name: string;
  distance: string;
  image: string;
  images?: string[];
  rating: number;
  tripAdvisorRating: number;
  ratingText: string;
  reviewsCount: number;
  price: number;
  amenities: string[];
  originalPrice?: number;
  discount?: string;
  description: string;
  facilities: string[];
  totalPrice?: number;
  location: {
    address: string;
    city: string;
    country: string;
    postalCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    fax: string;
  };
  checkInTime: string;
  checkOutTime: string;
  hasAirportShuttle?: boolean;
  hasSustainabilityReefCertification?: boolean;
  attractions: {
    name: string;
    distance: string;
  }[];
  policies: string[];
  map: string;
};

export type RecommendedHotel = ApiHotelDetails & {
  Rooms?: RoomType[];
};

export interface HotelDetailProps {
  hotelId: string;
}

export type DayRate = {
  BasePrice: number;
};

export type RoomType = {
  HotelRating: ReactNode;
  Name: string[];
  BookingCode: string;
  Inclusion: string;
  DayRates: DayRate[][];
  TotalFare: number;
  TotalTax: number;
  RoomPromotion: string[];
  CancelPolicies: Array<{
    FromDate: string;
    ChargeType: string;
    CancellationCharge: number;
  }>;
  MealType: string;
  IsRefundable: boolean;
  WithTransfers: boolean;
  Images?: string[];
};

export type HotelRoomData = {
  HotelCode: string;
  Currency: string;
  Rooms: RoomType[];
  HotelName: string;
  Description: string;
  HotelFacilities: string[];
  Address: string;
  PinCode: string;
  CityId: string;
  CountryName: string;
  PhoneNumber: string;
  Map: string;
  HotelRating: number;
  CityName: string;
  CountryCode: string;
  CheckInTime: string;
  CheckOutTime: string;
}; 

export interface AboutPropertyProps {
  hotel: {
    Description: string;
    Attractions:
      | Array<{
          name: string;
          distance?: string;
        }>
      | Record<string, string>;
  } | null;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface FAQsProps {
  hotel?: {
    checkInTime?: string;
    checkOutTime?: string;
    hasAirportShuttle?: boolean;
  };
}

export interface HotelData {
  checkInTime?: string;
  checkOutTime?: string;
  policies?: string[];
}

export interface PoliciesProps {
  hotel?: HotelData;
  prebookData?: any;
  allPrebookData?: { [key: number]: any };
}

export interface Review {
  id: number;
  initial: string;
  name: string;
  location: string;
  review: string;
  profile_photo_url?: string;
  author_name?: string;
  rating?: number;
  relative_time_description?: string;
  text?: string;
  time?: string;
}

export interface RecentReviewsProps {
  hotel: any;
}

export interface RecommendedHotelProps {
  recommendedRooms: RecommendedHotel[] | null;
  formatPrice: (price: number) => string;
}

export interface FilterControlsProps {
  filters: any;
  onApply: (filters: any) => void;
  filteredCount: number;
  totalCount: number;
  allFetchedHotels: number;
  hasFiltersApplied: boolean;
}

export interface FilterState {
  bookingFeatures: {
    freeCancellation: boolean;
    breakfastIncluded: boolean;
  };
  priceRanges: string[];
  reviewScores: string[];
  starRatings: number[];
  showDiscountsOnly: boolean;
  roomTypes: string[];
  amenities: string[];
}

export interface FilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filtersState: FilterState) => void;
  filters: FilterState;
}

export type LocationRatingProps = {
  hotel: {
    HotelName: string;
    Address: string;
    HotelRating: number;
    Map: string;
  };
};

export interface MapHotel {
  HotelCode: string;
  HotelName: string;
  Map: string;
  HotelRating?: string;
  Rooms?: Array<{
    TotalFare: number;
  }>;
}

export interface Marker {
  id: string;
  name: string;
  price: number;
  lat: number;
  lng: number;
  rating?: string;
}

export type DateValuePiece = Date | null;
export type DateValueType = DateValuePiece | [DateValuePiece, DateValuePiece];

export type SelectedCityType = {
  id: number;
  cityCode: string;
  city: string;
  country: string;
  countryCode: string;
};

export interface RoomsDropdownProps {
  rooms: number;
  setRooms: (rooms: number) => void;
  maxRooms?: number;
}

export type RoomCounterProps = {
  label: string;
  count: number;
  setCount: (count: number) => void;
  min?: number;
  max?: number;
};

export type LocationAutoCompleteProps = {
  selectedLocation: LocationOption | null;
  onLocationSelect: (location: LocationOption) => void;
  onCitySelected?: (cityCode: string) => void;
};

export type GuestsDropdownProps = {
  guests: {
    adults: number;
    children: number;
    childrenAges: string[],
  };
  setGuests: (guests: {
    adults: number;
    children: number;
    childrenAges: string[],
  }) => void;
};

export type GuestCounterProps = {
  label: string;
  count: number;
  setCount: (count: number) => void;
  min?: number;
  max?: number;
};

export type SearchSummaryProps = {
  data: {
    location: string;
    dateRange: string;
    guests: number;
    rooms: number;
    locationCityCode?: string | null;
    locationNationality?: string | null;
    checkin?: string | null;
    checkout?: string | null;
    guestsData?: { adults: number; children: number; childrenAges: [];};
  };
  className?: string;
};


export interface ImageGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  hotelName: string;
  initialIndex?: number;
}

export interface BookingSummaryProps {
  hotel: any;
  rooms: any[];
  roomQuantities: { [key: number]: number };
  hotelSearchData: any;
  onBookNow: () => void;
  formatPrice: (price: number) => string;
  disabled: boolean;
  amount: number;
  prebook: boolean;
  prebookDataForRooms?: { [key: number]: { netAmount: number; bookingCode: string; isRefundable: boolean } };
  prebookData?: any;
  allPrebookData?: { [key: number]: any };
  bookingOption?: any;
  setBookingOption?: any;
}

export type DateValue = Date | null;
export type RangeValue = [Date | null, Date | null];

export type PropsType = {
  value: DateValueType;
  onChange: (value: DateValueType) => void;
  minDate?: Date;
  maxDate?: Date;
  rangePicker?: boolean;
  calendarFareData?: Record<string, any>;
};

export interface HotelBooking {
  roomNumber: string;
  nights: string;
  id: number;
  bookingId: string;
  confirmationNo: string;
  hotelName: string;
  address: string;
  city: string;
  starRating: string;
  totalAmount: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  guestNationality: string;
  hotelCode: string;
  hotelId: number;
  tboHotelCode: string;
  hotelConfirmationNo: string | null;
  countryCode: string;
  latitude: string;
  longitude: string;
  rateConditions: string[];
  bookingSource: string;
  invoiceNo: string;
  invoiceCreatedOn: string;
  cancellationPolicy: string;
  bookingDate: string;
  lastCancellationDate: string;
  roomTypeName: string;
  roomType: string;
  user: BookingUser;
  passengers: Passenger[];
  rooms: Room[];
  voucherStatus: boolean;
  lastCancellationDeadline: string;
  netAmount: string;
}

export interface BookingUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  otp: string;
  otpExpiry: string | null;
  isverified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Passenger {
  id: number;
  paxId: string;
  firstName: string;
  lastName: string;
  paxType: string;
  phoneNo: string;
  email: string;
  title: string;
  age: number;
  passportNo: string | null;
  passportIssueDate: string | null;
  passportExpDate: string | null;
  pan: string | null;
  middleName: string | null;
  fileDocument: string | null;
  GSTCompanyAddress: string | null;
  GSTCompanyContactNumber: string | null;
  GSTCompanyEmail: string | null;
  GSTCompanyName: string | null;
  GSTNumber: string | null;
  GuardianDetail: string | null;
  LeadPassenger: boolean;
}

export interface Room {
  id: number;
  roomId: number;
  roomIndex: number;
  roomTypeCode: string;
  roomTypeName: string;
  roomDescription: string;
  ratePlanCode: string;
  ratePlan: number;
  isPerStay: boolean;
  adultCount: number;
  childCount: number;
  availabilityType: string;
  smokingPreference: string;
  bedTypes: string[];
  requireAllPaxDetails: boolean;
  amenities: string[];
  inclusion: string;
  roomPromotion: string | null;
  lastCancellationDate: string;
  lastVoucherDate: string;
  cancellationPolicy: string;
  cancelPolicies: CancelPolicy[];
  cancellationPolicies: any; 
  roomStatus: number;
  priceBreakUp: PriceBreakUp;
  taxBreakup: any[];    
  supplements: any[];      
  hotelBookingId: number;
}

export interface CancelPolicy {
  ToDate: string;       
  Currency: string;
  FromDate: string;  
  ChargeType: number;
  CancellationCharge: number;
}

export interface TaxBreakup {
  TaxType: string;
  TaxAmount: number;
}

export interface PriceBreakUp {
  roomTax: number;
  roomRate: number;
  serviceFee: number;
  taxBreakup: TaxBreakup[];
  currencyCode: string;
  agentCommission: number;
  roomChildCharges: number;
  roomExtraGuestCharges: number;
}

export interface BookedHotelListProps {
  activeFilter: "all" | "past" | "upcoming" | "pending";
  onCountChange: (shownCount: number, totalCount: number) => void;
  setActiveFilter: (filter: "all" | "past" | "upcoming" | "pending") => void;
}

export type HotelListing = {
  id?: number;
  Address?: string;
  CityName?: string;
  CountryCode?: string;
  CountryName?: string;
  Currency?: string;
  HotelCode: string;
  HotelName?: string;
  HotelRating?: string;
  Latitude?: string;
  Longitude?: string;
  Rooms?: Array<{
    BookingCode?: string;
    CancelPolicies?: Array<{
      CancellationCharge?: number;
      ChargeType?: string;
      FromDate?: string;
    }>;
    DayRates?: Array<{
      BasePrice?: number;
    }>[];
    Inclusion?: string;
    IsRefundable?: boolean;
    MealType?: string;
    Name?: Array<string>;
    RoomPromotion?: Array<string>;
    TotalFare?: number;
    TotalTax?: number;
    WithTransfers?: boolean;
    Images?: string[];
    PublishedFare?: number;
    Discount?: string;
    Rating?: number;
    HotelRating?: string;
    ReviewsCount?: number;
  }>;
  message?: string;
  Images?: string[];
  image?: string;
  name?: string;
  distance?: string;
  rating?: number;
  ratingText?: string;
  reviewsCount?: number;
  price?: number;
  totalPrice?: number;
  amenities?: string[];
  originalPrice?: number;
  discount?: string;
  HotelFacilities?: string[];
  Map?: string | undefined
};

export type HotelListingProps = {
  hotel: HotelListing;
  allHotelCodes: string[];
  searchData:any;
  allHotels: any[];
};

export interface ImportantInformationProps {
  rateConditionsList: string[][];
}

export interface ModifySearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    location: string;
    dateRange: string;
    guests: number;
    rooms: number;
  };
}

export interface RoomsAndBedsProps {
  rooms: any[];
  roomQuantities: { [key: number]: number };
  onIncrementQuantity: (roomIndex: number) => void;
  onDecrementQuantity: (roomIndex: number) => void;
}

export type AgeOption = {
  value: string;
  label: string;
};

export interface Guests {
  adults: number;
  children: number;
  childrenAges: string[],
}

export interface Guest {
  id: number;
  title?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  panNumber?: string;
  passportNo?: string;
  passportIssueDate?: string;
  passportExpDate?: string;
}

export interface GuestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestDetails: {
    adults: Guest[];
    children: Guest[];
    infants: Guest[];
  };
  onGuestDetailChange: (
    guestId: number,
    field: string,
    value: string,
    type?: "adult" | "child"
  ) => void;
  onAddAdult: () => void;
  onProceedToPay: () => void;
  validationInfo: any | null;
  arrivalTransportType: number | null;
  setArrivalTransportType: React.Dispatch<React.SetStateAction<number | null>>;
  transportInfoId: string;
  setTransportInfoId: React.Dispatch<React.SetStateAction<string>>;
  time: string;
  setTime: React.Dispatch<React.SetStateAction<string>>;
  departureTransportType: number | null;
  setDepartureTransportType: (type: number) => void;
  departureTransportInfoId: string;
  setDepartureTransportInfoId: (id: string) => void;
  departureTime: string;
  setDepartureTime: (time: string) => void;
  bookingOption: string;
  hasSelectedRefundableRoom?: boolean;
}

export type HotelImageGalleryProps = {
  hotel: {
    name: string;
    Images?: string[];
  };
};

export interface AmenitiesProps {
  amenityIcons: { [key: string]: ReactNode };
  prebookData?: any;
  allPrebookData?: { [key: number]: any };
}

export interface ImportantInformationProps {
  rateConditionsList: string[][];
}

export interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewsData: Review[];
  overallRating: number | null;
}