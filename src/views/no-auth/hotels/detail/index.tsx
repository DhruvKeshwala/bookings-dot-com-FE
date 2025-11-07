"use client";

import { userAtom } from "@/app/atoms/auth";
import "@/app/hotel.css";
import { LOCAL_KEY } from "@/common/enums";
import http from "@/services/http";
import { getStorageItem } from "@/services/storage";
import {
  HotelDetailProps,
  HotelRoomData,
  RecommendedHotel,
} from "@/types/hotel.types";
import { generateHotelBookingId } from "@/utils/functions";
import { SessionManager } from "@/utils/functions/SessionManager";
import {
  createHotelBooking,
  createPaymentOrder,
  fetchBookingDetails,
  fetchUserIp,
  saveBookingDetails,
  sendBookingRequest,
  sendConfirmationMail,
  sendFailedMail,
  sendPendingMail,
} from "@/utils/functions/hotelBookingApi";
import { generatePaxRooms } from "@/utils/functions/paxRooms";
import { Cashfree, load } from "@cashfreepayments/cashfree-js";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingTransition from "../../components/LoadingTransition";
import SignInModal from "../../layout/Header/SignInModal";
import SignUpModal from "../../layout/Header/SignUpModal";
import { amenityIcons } from "./amenityIcons";
import AboutProperty from "./components/AboutProperty";
import Amenities from "./components/Amenities";
import BookingSummary from "./components/BookingSummary";
import GuestDetailsModal from "./components/GuestDetailsModal";
import HotelImages from "./components/HotelImages";
import ImportantInformationComponent from "./components/ImportantInformation";
import LocationRating from "./components/LocationRating";
import PoliciesComponent from "./components/Policies";
import RecentReviewsComponent from "./components/RecentReviews";
import RecommendedHotelComponent from "./components/RecommendedHotel";
import RoomsAndBeds from "./components/RoomsAndBeds";

export default function HotelDetail({ hotelId }: HotelDetailProps) {
  const router = useRouter();
  const [user] = useAtom(userAtom);
  const isLogin = !!user?.email;
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [cashfree, setCashfree] = useState<Cashfree | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [hotel, setHotel] = useState<any>(null);
  const [rooms, setRooms] = useState<HotelRoomData[]>([]);
  const [recommendedRooms, setRecommendedRooms] = useState<
    RecommendedHotel[] | null
  >(null);
  const hotelSearchDataRaw = sessionStorage.getItem("hotelSearchData");

  const hotelSearchData = hotelSearchDataRaw
    ? JSON.parse(hotelSearchDataRaw)
    : null;

  const [loading, setLoading] = useState(true);
  const [roomQuantities, setRoomQuantities] = useState<{
    [key: number]: number;
  }>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  });

  const [prebookCalledForRooms, setPrebookCalledForRooms] = useState<{
    [key: number]: boolean;
  }>({});
  const [netAmount, setNetAmount] = useState(0);
  const [prebookDataForRooms, setPrebookDataForRooms] = useState<{
    [key: number]: {
      netAmount: number;
      bookingCode: string;
      isRefundable: boolean;
    };
  }>({});
  const [prebookData, setPrebookData] = useState<any>();

  const [isPrebookLoading, setIsPrebookLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [bookingOption, setBookingOption] = useState<"reserve" | "instant">(
    "reserve"
  );
  const [guestCount, setGuestCount] = useState<number>(1);

  const refundableValue = sessionStorage.getItem("refundable");
  const isRefundable = refundableValue === "true";

  const hasRefundableRooms =
    hotel?.Rooms?.some((room: any) => room?.IsRefundable === true) || false;

  const hasSelectedRefundableRoom = Object.keys(roomQuantities).some(
    (roomIndexStr) => {
      const roomIndex = parseInt(roomIndexStr);
      const quantity = roomQuantities[roomIndex] || 0;
      if (quantity > 0 && prebookDataForRooms[roomIndex]) {
        return prebookDataForRooms[roomIndex].isRefundable === true;
      }
      return false;
    }
  );

  useEffect(() => {
    try {
      const searchData = JSON.parse(
        sessionStorage.getItem("hotelSearchData") || "{}"
      );
      const adults = searchData?.guestsData?.adults || 1;
      const children = searchData?.guestsData?.children || 0;
      setGuestCount(adults + children);
    } catch (e) {
      console.error("Failed to parse hotelSearchData from sessionStorage");
    }
  }, []);

  // State for guest details modal
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [guestDetails, setGuestDetails] = useState({
    adults: [
      {
        id: 1,
        title: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
      },
    ],
    children: hotelSearchData?.guestsData?.children
      ? Array.from({ length: hotelSearchData.guestsData.children }, (_, i) => ({
          id: i + 1,
          title: "",
          firstName: "",
          lastName: "",
          dateOfBirth: "",
        }))
      : [],
    infants: [],
  });

  // State for reviews modal and slider
  const [canFetch, setCanFetch] = useState(false);
  const [rateConditionsList, setRateConditionsList] = useState<string[][]>([]);
  const [validationInfo, setValidationInfo] = useState<any>(null);
  const [arrivalTransportType, setArrivalTransportType] = useState<
    number | null
  >(null);
  const [transportInfoId, setTransportInfoId] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [departureTransportType, setDepartureTransportType] = useState<
    number | null
  >(null);
  const [departureTransportInfoId, setDepartureTransportInfoId] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [allPrebookData, setAllPrebookData] = useState<{
    [roomIndex: number]: any;
  }>({});
  const [isBooking, setIsBooking] = useState(false);
  const token = getStorageItem(LOCAL_KEY.ACCESS_TOKEN);

  useEffect(() => {
    if (hotelSearchData) {
      setCanFetch(true);
    } else {
      console.log(
        "HotelDetail: Missing required data, redirecting to search page"
      );
      router.push("/hotels/search");
    }
  }, [hotelSearchData, hotelId, router]);

  const orderId = generateHotelBookingId();

  // Initialize Cashfree SDK
  useEffect(() => {
    const initializeCashfree = async () => {
      try {
        const cashfreeSDK = await load({
          mode: "sandbox", // or "production"
        });
        setCashfree(cashfreeSDK);
        console.log("Cashfree SDK initialized");
      } catch (error) {
        console.error("Failed to initialize Cashfree SDK:", error);
      }
    };

    initializeCashfree();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const isValid = SessionManager.isSessionValid();
      if (!isValid) {
        clearInterval(interval);
        toast.error("Session expired. Please start a new search.");
        SessionManager.clearSession();
        router.push("/");
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    if (isBooking) {
      document.documentElement.classList.add("no-scroll");
      document.body.classList.add("no-scroll");
    } else {
      document.documentElement.classList.remove("no-scroll");
      document.body.classList.remove("no-scroll");
    }

    return () => {
      document.documentElement.classList.remove("no-scroll");
      document.body.classList.remove("no-scroll");
    };
  }, [isBooking]);

  const paxRooms = generatePaxRooms(
    hotelSearchData.rooms,
    hotelSearchData.guestsData
  );

  useEffect(() => {
    if (!hotelId) {
      console.warn("No hotelId provided to HotelDetail component.");
      setLoading(false);
      return;
    }

    const cached = sessionStorage.getItem("hotel_data");

    if (cached) {
      const parsed = JSON.parse(cached);

      const roomsObj = parsed.rooms || {};
      const recommendedList = parsed.recommended || [];

      // Try to find the matching room using hotelId
      const hotelKey = `recommend_${hotelId}`;
      const matchedRoom = roomsObj[hotelKey];

      if (matchedRoom) {
        // Exact match found
        setHotel(matchedRoom);
      } else {
        // Fallback: use the first room in roomsObj if available
        const roomsArray = Object.values(roomsObj);
        const selectedHotel = roomsArray.length ? roomsArray[0] : null;

        setHotel(selectedHotel); // fallback hotel
      }

      // Always set the rooms list
      setRooms(Object.values(roomsObj));
      setRecommendedRooms(recommendedList);
      setLoading(false);
    } else {
      console.warn("No hotel_data found in sessionStorage.");
      setHotel(null);
      setRooms([]);
      setRecommendedRooms([]);
      setLoading(false);
    }
  }, [hotelId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    })
      .format(price)
      .replace("₹", "₹ ");
  };

  const handleBookNow = () => {
    if (!isLogin) {
      setIsSignInModalOpen(true);
      return;
    }

    const requiredAdults = hotelSearchData?.guestsData?.adults || 1;
    const requiredChildren = hotelSearchData?.guestsData?.children || 0;
    const childrenAges = hotelSearchData?.guestsData?.childrenAges || [];

    const initialAdults = Array.from(
      { length: requiredAdults },
      (_, index) => ({
        id: index + 1,
        title: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
      })
    );

    const initialChildren = Array.from(
      { length: requiredChildren },
      (_, index) => ({
        id: index + 1,
        title: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        expectedAge: childrenAges[index] || "",
      })
    );

    setGuestDetails({
      adults: initialAdults,
      children: initialChildren,
      infants: [],
    });

    setIsGuestModalOpen(true);
  };

  const handleCloseGuestModal = () => {
    setIsGuestModalOpen(false);
  };

  const handleAddAdult = () => {
    const newAdult = {
      id: guestDetails.adults.length + 1,
      title: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
    };
    setGuestDetails((prev) => ({
      ...prev,
      adults: [...prev.adults, newAdult],
    }));
  };

  const handleGuestDetailChange = (
    guestId: number,
    field: string,
    value: string,
    type: "adult" | "child" = "adult"
  ) => {
    setGuestDetails((prev) => ({
      ...prev,
      [type === "adult" ? "adults" : "children"]: prev[
        type === "adult" ? "adults" : "children"
      ].map((guest) =>
        guest.id === guestId ? { ...guest, [field]: value } : guest
      ),
    }));
  };

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const buildHotelRoomsDetails = (
    paxRooms: {
      Adults: number;
      Children: number;
      ChildrenAges: string[] | null;
    }[],
    guestDetails: { adults: any[]; children: any[] },
    user: { email?: string; phone?: string },
    validationInfo: {
      PanMandatory?: boolean;
      PassportMandatory?: boolean;
      PanCountRequired?: number;
    }
  ) => {
    let adultIndex = 0;
    let childIndex = 0;

    // 🔐 Extract PANs if needed
    let panList: string[] = [];
    if (validationInfo?.PanMandatory && validationInfo?.PanCountRequired) {
      panList = guestDetails.adults
        .map((adult) => adult.panNumber)
        .filter((pan): pan is string => !!pan) // remove undefined/null
        .slice(0, validationInfo.PanCountRequired); // take only required PANs
    }

    let panAssignIndex = 0; // for rotating through panList

    const hotelRoomsDetails = paxRooms.map((room) => {
      const roomPassengers: any[] = [];

      // 🔹 Add Adults
      for (let i = 0; i < room.Adults; i++) {
        const adult = guestDetails.adults[adultIndex];
        if (!adult) continue;

        const isLead = i === 0;
        const age = calculateAge(adult.dateOfBirth);

        const passenger: any = {
          Title: adult.title,
          FirstName: adult.firstName,
          LastName: adult.lastName,
          PaxType: 1,
          LeadPassenger: isLead,
          Age: age,
        };

        if (isLead) {
          passenger.Email = user?.email || "";
          passenger.Phoneno = user?.phone || "";
        }

        // 🔐 Assign PAN
        if (validationInfo?.PanMandatory) {
          const requiredCount = validationInfo?.PanCountRequired || 0;

          if (requiredCount === 1 && panList.length > 0) {
            // Use the first PAN for all
            passenger.PAN = panList[0];
          } else if (requiredCount > 1 && panList.length > 0) {
            // Distribute PANs in round-robin if more than 1 required
            passenger.PAN = panList[panAssignIndex % panList.length];
            panAssignIndex++;
          } else if (!requiredCount && adult.panNumber) {
            // Default behavior: use individual's PAN if available
            passenger.PAN = adult.panNumber;
          }
        }

        // 🔐 Add Passport if mandatory
        if (validationInfo?.PassportMandatory) {
          if (adult.passportNo) passenger.PassportNo = adult.passportNo;
          if (adult.passportIssueDate)
            passenger.PassportIssueDate = adult.passportIssueDate;
          if (adult.passportExpDate)
            passenger.PassportExpDate = adult.passportExpDate;
        }

        roomPassengers.push(passenger);
        adultIndex++;
      }

      // 🔹 Add Children
      for (let i = 0; i < room.Children; i++) {
        const child = guestDetails.children[childIndex];
        if (!child) continue;

        const age = calculateAge(child.dateOfBirth);

        const passenger: any = {
          Title: child.title || "Master",
          FirstName: child.firstName,
          LastName: child.lastName,
          PaxType: 2,
          LeadPassenger: false,
          Age: age,
        };

        // 🔐 Add Passport if mandatory
        if (validationInfo?.PassportMandatory) {
          if (child.passportNo) passenger.PassportNo = child.passportNo;
          if (child.passportIssueDate)
            passenger.PassportIssueDate = child.passportIssueDate;
          if (child.passportExpDate)
            passenger.passportExpDate = child.passportExpDate;
        }

        roomPassengers.push(passenger);
        childIndex++;
      }

      return {
        HotelPassenger: roomPassengers,
      };
    });

    return hotelRoomsDetails;
  };

  const onPaymentSuccess = async (data: any) => {
    console.log("Payment successful:", data);
    setIsGuestModalOpen(false);
    setIsBooking(true);

    if (!SessionManager.isSessionValid()) {
      toast.error("Your session has expired. Please start a new search.");
      SessionManager.clearSession();
      router.push("/");
      return;
    }

    try {
      const ipResponse = await fetchUserIp();
      const userIp = ipResponse.ip || "192.168.31.130";

      if (!userIp) {
        toast.error("Unable to fetch IP. Cannot proceed with booking.");
        return;
      }

      const selectedBookingCodes = Object.keys(roomQuantities)
        .filter((roomIndexStr) => {
          const roomIndex = parseInt(roomIndexStr);
          return roomQuantities[roomIndex] > 0;
        })
        .map((roomIndexStr) => {
          const roomIndex = parseInt(roomIndexStr);
          return prebookDataForRooms[roomIndex]?.bookingCode;
        })
        .filter(Boolean);

      const bookingCode = selectedBookingCodes.join(",");

      // Build HotelRoomsDetails with PAN included if required
      const HotelRoomsDetails = buildHotelRoomsDetails(
        paxRooms,
        guestDetails,
        user,
        validationInfo || {}
      );

      const netAmount = (() => {
        const netAmounts: string[] = [];

        Object.keys(roomQuantities).forEach((roomIndexStr) => {
          const roomIndex = parseInt(roomIndexStr);
          const quantity = roomQuantities[roomIndex] || 0;
          const roomPrebookData = prebookDataForRooms[roomIndex];

          if (quantity > 0 && roomPrebookData) {
            const totalRoomAmount = roomPrebookData.netAmount * quantity;
            netAmounts.push(totalRoomAmount.toString());
          }
        });

        return netAmounts.join(",");
      })();

      if (!bookingCode || !userIp || !HotelRoomsDetails.length || !netAmount) {
        toast.error("Missing data. Cannot proceed.");
        return;
      }

      const payload: any = {
        BookingCode: bookingCode,
        IsVoucherBooking: true,
        GuestNationality: "IN",
        EndUserIp: userIp,
        RequestedBookingMode: 5,
        NetAmount: netAmount,
        HotelRoomsDetails,
        ...(validationInfo?.PackageFare ? { IsPackageFare: true } : {}),
        ...(validationInfo?.PackageDetailsMandatory
          ? {
              ArrivalTransport: {
                ArrivalTransportType: arrivalTransportType,
                TransportInfoId: transportInfoId,
                Time: time,
              },
            }
          : {}),
        ...(validationInfo?.DepartureDetailsMandatory
          ? {
              DepartureTransport: {
                DepartureTransportType: departureTransportType,
                TransportInfoId: departureTransportInfoId,
                Time: departureTime,
              },
            }
          : {}),
      };

      const response = await sendBookingRequest(payload);

      const bookingsArray = Array.isArray(response.data)
        ? response.data
        : [response.data];

      let allBookingsSuccessful = true;

      for (const bookingResponse of bookingsArray) {
        const bookingResult = bookingResponse?.data?.BookResult;
        const bookingCode = bookingResponse?.BookingCode;

        if (
          bookingResult?.Error?.ErrorMessage !== undefined &&
          bookingResult?.Error?.ErrorCode !== 0
        ) {
          console.error(
            "Booking API responded with error:",
            bookingResult?.Error?.ErrorMessage
          );

          try {
            const failedMailResponse = await sendFailedMail(token);

            if (!failedMailResponse?.data) {
              throw new Error("Empty response from booking-failed mail API");
            }

            toast.success("Booking failure email sent to support.");
          } catch (failedMailError) {
            console.error(
              "Error sending booking-failed mail:",
              failedMailError
            );
            toast.error("Failed to send booking failure email.");
          }

          toast.error(
            bookingResult?.Error?.ErrorMessage ||
              "Booking failed. Please try again."
          );
          return;
        }

        if (
          bookingResult?.Error?.ErrorCode === 0 &&
          bookingResult?.Error?.ErrorMessage === ""
        ) {
          const bookingId = bookingResult?.BookingId;
          const userId = user?.id || "1";

          try {
            const confirmationMailResponse = await sendConfirmationMail(
              bookingId,
              token
            );

            if (!confirmationMailResponse?.data) {
              throw new Error(`Empty response from confirmation mail API`);
            }

            toast.success("Booking confirmation email sent successfully.");
          } catch (mailError) {
            console.error(
              `Error sending confirmation mail for Booking ID ${bookingId}:`,
              mailError
            );
            toast.error("Failed to send confirmation email.");
          }

          try {
            await saveBookingDetails(bookingId.toString(), userId.toString());
          } catch (detailsError) {
            allBookingsSuccessful = false;
            console.error(
              `Error fetching booking details for BookingCode ${bookingCode}:`,
              detailsError
            );
          }

          try {
            const timeout = 60000;

            const bookingDetailsPromise = fetchBookingDetails(
              bookingId.toString(),
              userIp
            );

            const hotelBookingDetailsResponse: any = await Promise.race([
              bookingDetailsPromise,
              new Promise((_, reject) =>
                setTimeout(
                  () => reject(new Error("Booking details request timed out")),
                  timeout
                )
              ),
            ]);

            const hotelDetails =
              hotelBookingDetailsResponse.data.GetBookingDetailResult;

            const allPassengers = hotelDetails?.Rooms?.flatMap(
              (room: any) => room?.HotelPassenger || []
            );

            // Find lead and non-lead passengers
            const leadPassenger = allPassengers?.find(
              (p: any) => p?.LeadPassenger === true
            );
            const nonLeadPassenger = allPassengers?.find(
              (p: any) => p?.LeadPassenger === false
            );

            // Build the name
            const selectedPassenger = leadPassenger || nonLeadPassenger;

            const guestFullName = selectedPassenger
              ? `${selectedPassenger?.FirstName || ""} ${
                  selectedPassenger?.LastName || ""
                }`.trim()
              : "Guest";

            const guestEmail = selectedPassenger?.Email;
            const guestPhone = selectedPassenger?.Phoneno;

            const numberOfGuests =
              hotelDetails?.Rooms?.reduce(
                (total: number, room: any) =>
                  total + (room?.AdultCount || 0) + (room?.ChildCount || 0),
                0
              ) || 0;

            const rawRoomTypeName =
              hotelDetails?.Rooms?.[0]?.RoomTypeName || "";
            const roomType = rawRoomTypeName.split("Room")[0]?.trim();

            const inclusionText = hotelDetails?.Rooms?.[0]?.Inclusion || "";
            const mealPlan = inclusionText.toLowerCase().includes("breakfast")
              ? "breakfast_only"
              : "room_only";

            const createPayload = {
              booking_date: hotelDetails?.BookingDate,
              booking_reference: hotelDetails?.BookingRefNo,
              check_in_date: hotelDetails?.CheckInDate,
              check_out_date: hotelDetails?.CheckOutDate,
              guest_country: hotelDetails?.GuestNationality,
              guest_email: guestEmail,
              guest_name: guestFullName,
              guest_phone: guestPhone,
              hotel_id: String(hotelDetails?.HotelId),
              hotel_name: hotelDetails?.HotelName,
              meal_plan: mealPlan,
              name: guestFullName,
              number_of_guests: numberOfGuests,
              number_of_rooms: hotelDetails?.NoOfRooms,
              room_type: roomType || "Room",
            };

            await createHotelBooking(createPayload);
          } catch (bookingDetailsError) {
            console.error(
              `Error or timeout in /hotels/booking-details for BookingCode ${bookingCode}:`,
              bookingDetailsError
            );

            // Fallback: Send pending booking mail
            try {
              const pendingMailResponse = await sendPendingMail(token);

              if (!pendingMailResponse?.data) {
                throw new Error("Empty response from booking-pending mail API");
              }

              toast.success(
                "Booking details are still being processed. A pending booking email has been sent. Please wait while we fetch your booking details."
              );
            } catch (pendingMailError) {
              console.error(
                "Error sending booking-pending mail:",
                pendingMailError
              );
              toast.error("Failed to send pending booking email.");
            }
          }
        } else {
          allBookingsSuccessful = false;
          toast.error(bookingResult?.Error?.ErrorMessage || "Booking failed");
        }
      }

      if (allBookingsSuccessful) {
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          router.push("/");
        }, 5000);
      }
    } catch (bookingApiError) {
      console.error("Error during booking process:", bookingApiError);

      // Fallback: Send failed booking mail
      try {
        const failedMailResponse = await sendFailedMail(token);

        if (!failedMailResponse?.data) {
          throw new Error("Empty response from booking-failed mail API");
        }

        toast.success("Booking failure email sent to support.");
      } catch (failedMailError) {
        console.error("Error sending booking-failed mail:", failedMailError);
        toast.error("Failed to send pending booking email.");
      }

      toast.error("Booking failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleProceedToPay = async () => {
    try {
      const requiredAdults = hotelSearchData?.guestsData?.adults || 1;
      const requiredChildren = hotelSearchData?.guestsData?.children || 0;

      // Step 1: Validate adult count
      if (guestDetails.adults.length < requiredAdults) {
        toast.error(
          `Please add details for all ${requiredAdults} adult(s) before proceeding.`
        );
        return;
      }

      if (guestDetails.children.length < requiredChildren) {
        toast.error(
          `Please add details for all ${requiredChildren} child(ren) before proceeding.`
        );
        return;
      }

      // Step 2: Validate adult details
      const incompleteAdults = guestDetails.adults
        .slice(0, requiredAdults)
        .filter((adult) => {
          const customerName = `${adult.firstName} ${adult.lastName}`.trim();
          return !customerName || !adult.title;
        });

      if (incompleteAdults.length > 0) {
        toast.error(
          `Please complete details for all ${requiredAdults} adult(s) before proceeding.`
        );
        return;
      }

      // Step 3: Validate children ages (add here)
      const isChildrenAgeValid = guestDetails.children.every((child, index) => {
        const actualAge = calculateAge(child.dateOfBirth);
        const expectedAge = parseInt(
          hotelSearchData?.guestsData?.childrenAges?.[index] || "-1"
        );
        return actualAge === expectedAge;
      });

      if (!isChildrenAgeValid) {
        toast.error("One or more children's age does not match expected age.");
        return;
      }

      // Step 4: Validate selected rooms
      const combinedNetAmount = calculateCombinedAmount(roomQuantities);
      if (combinedNetAmount <= 0) {
        toast.error("Please select at least one room before proceeding.");
        return;
      }

      // Step 4.5: Check if session is still valid
      if (!SessionManager.isSessionValid()) {
        toast.error("Your session has expired. Please start a new search.");
        SessionManager.clearSession();
        router.push("/");
        return;
      }

      // Step 5: Prepare payment payload
      const paymentPayload = {
        orderId,
        amount: Math.round(combinedNetAmount),
        order_currency: "INR",
        customer: {
          id: JSON.stringify(user?.id),
          name: `${guestDetails.adults[0].firstName} ${guestDetails.adults[0].lastName}`,
          email: user?.email,
          phone: user?.phone || "9999999999",
        },
        order_meta: {
          return_url: "https://travulu.com/thankyou",
        },
        order_note: "hotel booking payment",
      };

      // Step 6: Initiate payment
      const { data } = await createPaymentOrder(paymentPayload);

      if (data) {
        const checkoutOptions = {
          paymentSessionId: data?.payment_session_id,
          redirectTarget: "_modal",
        };

        (cashfree as any)?.checkout(checkoutOptions).then((result: any) => {
          if (result.error) {
            console.log(
              "User has closed the popup or there is some payment error."
            );
            console.log(result.error);
          }
          if (result.redirect) {
            console.log("Payment will be redirected");
          }
          if (result.paymentDetails) {
            console.log("Payment completed. Check for payment status.");
            onPaymentSuccess(data);
          }
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    }
  };

  const handleReserveProceedToPay = async () => {
    setIsBooking(true);
    try {
      const requiredAdults = hotelSearchData?.guestsData?.adults || 1;
      const requiredChildren = hotelSearchData?.guestsData?.children || 0;

      // Step 1: Validate adult count
      if (guestDetails.adults.length < requiredAdults) {
        toast.error(
          `Please add details for all ${requiredAdults} adult(s) before proceeding.`
        );
        return;
      }

      if (guestDetails.children.length < requiredChildren) {
        toast.error(
          `Please add details for all ${requiredChildren} child(ren) before proceeding.`
        );
        return;
      }

      // Step 2: Validate adult details
      const incompleteAdults = guestDetails.adults
        .slice(0, requiredAdults)
        .filter((adult) => {
          const customerName = `${adult.firstName} ${adult.lastName}`.trim();
          return !customerName || !adult.title;
        });

      if (incompleteAdults.length > 0) {
        toast.error(
          `Please complete details for all ${requiredAdults} adult(s) before proceeding.`
        );
        return;
      }

      // Step 3: Validate children ages
      const isChildrenAgeValid = guestDetails.children.every((child, index) => {
        const actualAge = calculateAge(child.dateOfBirth);
        const expectedAge = parseInt(
          hotelSearchData?.guestsData?.childrenAges?.[index] || "-1"
        );
        return actualAge === expectedAge;
      });

      if (!isChildrenAgeValid) {
        toast.error("One or more children's age does not match expected age.");
        return;
      }

      // Step 4: Validate selected rooms
      const combinedNetAmount = calculateCombinedAmount(roomQuantities);
      if (combinedNetAmount <= 0) {
        toast.error("Please select at least one room before proceeding.");
        return;
      }

      // Step 4.5: Session check
      if (!SessionManager.isSessionValid()) {
        toast.error("Your session has expired. Please start a new search.");
        SessionManager.clearSession();
        router.push("/");
        return;
      }

      setIsGuestModalOpen(false);

      const ipResponse = await fetchUserIp();
      const userIp = ipResponse.ip || "192.168.31.130";

      if (!userIp) {
        toast.error("Unable to fetch IP. Cannot proceed with booking.");
        return;
      }

      const selectedBookingCodes = Object.keys(roomQuantities)
        .filter((roomIndexStr) => {
          const roomIndex = parseInt(roomIndexStr);
          return roomQuantities[roomIndex] > 0;
        })
        .map((roomIndexStr) => {
          const roomIndex = parseInt(roomIndexStr);
          return prebookDataForRooms[roomIndex]?.bookingCode;
        })
        .filter(Boolean);

      const bookingCode = selectedBookingCodes.join(",");

      const HotelRoomsDetails = buildHotelRoomsDetails(
        paxRooms,
        guestDetails,
        user,
        validationInfo || {}
      );

      const netAmount = (() => {
        const netAmounts: string[] = [];
        Object.keys(roomQuantities).forEach((roomIndexStr) => {
          const roomIndex = parseInt(roomIndexStr);
          const quantity = roomQuantities[roomIndex] || 0;
          const roomPrebookData = prebookDataForRooms[roomIndex];

          if (quantity > 0 && roomPrebookData) {
            const totalRoomAmount = roomPrebookData.netAmount * quantity;
            netAmounts.push(totalRoomAmount.toString());
          }
        });
        return netAmounts.join(",");
      })();

      if (!bookingCode || !userIp || !HotelRoomsDetails.length || !netAmount) {
        toast.error("Missing data. Cannot proceed.");
        return;
      }

      const payload: any = {
        BookingCode: bookingCode,
        IsVoucherBooking: bookingOption !== "reserve",
        GuestNationality: "IN",
        EndUserIp: userIp,
        RequestedBookingMode: 5,
        NetAmount: netAmount,
        HotelRoomsDetails,
        ...(validationInfo?.PackageFare ? { IsPackageFare: true } : {}),
        ...(validationInfo?.PackageDetailsMandatory
          ? {
              ArrivalTransport: {
                ArrivalTransportType: arrivalTransportType,
                TransportInfoId: transportInfoId,
                Time: time,
              },
            }
          : {}),
        ...(validationInfo?.DepartureDetailsMandatory
          ? {
              DepartureTransport: {
                DepartureTransportType: departureTransportType,
                TransportInfoId: departureTransportInfoId,
                Time: departureTime,
              },
            }
          : {}),
      };

      const response = await sendBookingRequest(payload);
      const bookingResult = response?.data?.[0]?.data?.BookResult;

      const bookingId = bookingResult?.BookingId?.toString();

      if (
        bookingResult?.Error?.ErrorCode === 0 &&
        bookingResult?.Error?.ErrorMessage === ""
      ) {
        // Send confirmation mail immediately
        try {
          const confirmationMailResponse = await sendConfirmationMail(
            bookingId,
            token
          );

          if (!confirmationMailResponse?.data) {
            throw new Error(`Empty response from confirmation mail API`);
          }

          toast.success("Booking confirmation email sent successfully.");
        } catch (mailError) {
          console.error(
            `Error sending confirmation mail for Booking ID ${bookingId}:`,
            mailError
          );
          toast.error("Failed to send confirmation email.");
        }

        // Setup timeout for long booking detail fetch
        const bookingDetailsPromise = fetchBookingDetails(bookingId, userIp);

        const timeoutPromise = new Promise(
          (_, reject) =>
            setTimeout(
              () => reject(new Error("Booking details timeout")),
              60000
            ) // 60 sec
        );

        try {
          const hotelBookingDetailsResponse: any = await Promise.race([
            bookingDetailsPromise,
            timeoutPromise,
          ]);

          const hotelDetails =
            hotelBookingDetailsResponse.data.GetBookingDetailResult;
          console.log("hotelDetails", hotelDetails);
        } catch (detailsError) {
          console.warn("Booking details fetch timeout or error:", detailsError);

          // Send pending email
          try {
            const pendingMailResponse = await sendPendingMail(token);

            if (!pendingMailResponse?.data) {
              throw new Error("Empty response from booking-pending mail API");
            }

            console.log(
              "Pending booking mail sent successfully:",
              pendingMailResponse.data
            );
            toast.success(
              "Booking details are still being processed. A pending booking email has been sent. Please wait while we fetch your booking details."
            );
          } catch (pendingMailError) {
            console.error(
              "Error sending booking-pending mail:",
              pendingMailError
            );
            toast.error("Failed to send pending booking email.");
          }
        }

        // Save details internally
        try {
          const detailsResponse = await saveBookingDetails(
            bookingId,
            user?.id?.toString()
          );
          console.log("Booking details response:", detailsResponse.data);
        } catch (e) {
          console.warn("Booking details save failed:", e);
        }

        // Final success
        toast.success("Booking successful!");
        router.push("/");
      } else if (
        bookingResult?.Error?.ErrorMessage !== undefined &&
        bookingResult?.Error?.ErrorCode !== 0
      ) {
        try {
          const failedMailResponse = await sendFailedMail(token);

          if (!failedMailResponse?.data) {
            throw new Error("Empty response from booking-failed mail API");
          }

          console.log(
            "Booking failed mail sent successfully:",
            failedMailResponse.data
          );
          toast.success("Booking failure email sent to support.");
        } catch (failedMailError) {
          console.error("Error sending booking-failed mail:", failedMailError);
          toast.error("Failed to send booking failure email.");
        }

        toast.error(
          bookingResult?.Error?.ErrorMessage ||
            "Booking failed. Please try again."
        );
        return;
      } else {
        toast.error("Unexpected booking response. Please try again.");
        return;
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const decodeAndCleanConditions = (rawConditions: string[]): string[] => {
    const parser = new DOMParser();

    return rawConditions.flatMap((rawItem) => {
      // 1. Decode HTML entities
      const decoded =
        parser.parseFromString(rawItem, "text/html").body.textContent || "";

      // 2. Remove all HTML tags
      const noTags = decoded.replace(/<\/?[^>]+(>|$)/g, "");

      // 3. Split into sentences or list items
      const items = noTags.split(/[\r\n]+|(?<=\.)\s+|(?<=\!)\s+|(?<=\?)\s+/);

      // 4. Trim and filter empty strings
      return items.map((item) => item.trim()).filter(Boolean);
    });
  };

  const calculateCombinedAmount = (quantities: { [key: number]: number }) => {
    let totalAmount = 0;

    Object.keys(quantities).forEach((roomIndexStr) => {
      const roomIndex = parseInt(roomIndexStr);
      const quantity = quantities[roomIndex] || 0;
      const roomPrebookData = prebookDataForRooms[roomIndex];

      if (quantity > 0 && roomPrebookData) {
        totalAmount += roomPrebookData.netAmount * quantity;
      }
    });

    return totalAmount;
  };

  const incrementQuantity = async (roomIndex: number) => {
    // Calculate total quantity selected before increment
    const totalSelected = Object.values(roomQuantities).reduce(
      (sum, qty) => sum + qty,
      0
    );

    if (totalSelected >= guestCount) {
      // Need to reduce from other rooms before adding here

      // Copy of current quantities to modify
      const updatedQuantities = { ...roomQuantities };

      // Amount we want to add: 1
      let excess = totalSelected + 1 - guestCount; // will be at least 1 here

      // Reduce excess from other rooms first, excluding current room
      // For example: reduce from lowest index rooms first (FIFO)
      for (const key of Object.keys(updatedQuantities)) {
        const idx = Number(key);
        if (idx === roomIndex) continue; // skip current room

        if (updatedQuantities[idx] > 0 && excess > 0) {
          const reduceBy = Math.min(updatedQuantities[idx], excess);
          updatedQuantities[idx] -= reduceBy;
          excess -= reduceBy;

          if (updatedQuantities[idx] === 0) {
            // Clear prebook data for that room
            setPrebookDataForRooms((prevData) => {
              const newData = { ...prevData };
              delete newData[idx];
              return newData;
            });

            setPrebookCalledForRooms((prev) => ({
              ...prev,
              [idx]: false,
            }));

            setAllPrebookData((prevData) => {
              const newData = { ...prevData };
              delete newData[idx];
              return newData;
            });

            setRateConditionsList((prev) => {
              const updated = { ...prev };
              delete updated[idx];
              return updated;
            });
          }
        }
        if (excess <= 0) break;
      }

      if (excess > 0) {
        // Could not free enough slots, so cannot add more rooms
        toast.error(`You can select only up to ${guestCount} room(s) total.`);
        return;
      }

      // Now increment the current room
      updatedQuantities[roomIndex] = (updatedQuantities[roomIndex] ?? 0) + 1;

      setRoomQuantities(updatedQuantities);

      // Update combined amount and other states
      const combinedAmount = calculateCombinedAmount(updatedQuantities);
      setNetAmount(combinedAmount);

      setIsButtonDisabled(false);
      setIsPrebookLoading(false);

      // Call prebook API if not called yet for current room
      if (!prebookCalledForRooms[roomIndex]) {
        try {
          if (!SessionManager.isSessionValid()) {
            toast.error("Your session has expired. Please start a new search.");
            SessionManager.clearSession();
            router.push("/");
            return;
          }

          const room = rooms[0]?.Rooms[roomIndex];
          if (room?.BookingCode) {
            const payload = {
              BookingCode: room.BookingCode,
              PaymentMode: "Limit",
            };
            const response = await http.post("/hotels/prebook", payload);

            setPrebookData(response.data);

            setAllPrebookData((prev) => ({
              ...prev,
              [roomIndex]: response.data,
            }));

            setValidationInfo(response.data?.ValidationInfo || null);

            const rateConditions =
              response?.data?.HotelResult?.[0]?.RateConditions || [];
            const parsedConditions = decodeAndCleanConditions(rateConditions);

            setRateConditionsList((prev) => ({
              ...prev,
              [roomIndex]: parsedConditions,
            }));

            if (
              response.data?.Status?.Code === 201 &&
              response.data?.Status?.Description ===
                "No Available rooms for given criteria"
            ) {
              toast.error("No Available rooms for given criteria");
              setIsButtonDisabled(true);
              setPrebookCalledForRooms((prev) => ({
                ...prev,
                [roomIndex]: false,
              }));
              setIsPrebookLoading(false);
              return;
            }

            const netAmount = response.data.HotelResult[0].Rooms[0].NetAmount;
            const isRoomRefundable = room?.IsRefundable || false;
            setPrebookDataForRooms((prev) => ({
              ...prev,
              [roomIndex]: {
                netAmount,
                bookingCode: room.BookingCode,
                isRefundable: isRoomRefundable,
              },
            }));

            setPrebookCalledForRooms((prev) => ({
              ...prev,
              [roomIndex]: true,
            }));
          }
        } catch (error) {
          console.error("Error calling prebook API:", error);
          toast.error("Failed to check room availability. Please try again.");
          setIsButtonDisabled(true);
          setPrebookCalledForRooms((prev) => ({
            ...prev,
            [roomIndex]: false,
          }));
          setIsPrebookLoading(false);
        }
      }

      return; // exit function after updating
    }

    // If totalSelected < guestCount, simply increment quantity normally
    const newQuantity = (roomQuantities[roomIndex] ?? 0) + 1;

    setRoomQuantities((prev) => ({
      ...prev,
      [roomIndex]: newQuantity,
    }));

    const combinedAmount = calculateCombinedAmount({
      ...roomQuantities,
      [roomIndex]: newQuantity,
    });

    setNetAmount(combinedAmount);
    setIsButtonDisabled(false);
    setIsPrebookLoading(false);

    // Call prebook API if needed (same logic as original)
    if (!prebookCalledForRooms[roomIndex]) {
      try {
        if (!SessionManager.isSessionValid()) {
          toast.error("Your session has expired. Please start a new search.");
          SessionManager.clearSession();
          router.push("/");
          return;
        }

        const room = rooms[0]?.Rooms[roomIndex];
        if (room?.BookingCode) {
          const payload = {
            BookingCode: room.BookingCode,
            PaymentMode: "Limit",
          };
          const response = await http.post("/hotels/prebook", payload);

          setPrebookData(response.data);

          setAllPrebookData((prev) => ({
            ...prev,
            [roomIndex]: response.data,
          }));

          setValidationInfo(response.data?.ValidationInfo || null);

          const rateConditions =
            response?.data?.HotelResult?.[0]?.RateConditions || [];
          const parsedConditions = decodeAndCleanConditions(rateConditions);

          setRateConditionsList((prev) => ({
            ...prev,
            [roomIndex]: parsedConditions,
          }));

          if (
            response.data?.Status?.Code === 201 &&
            response.data?.Status?.Description ===
              "No Available rooms for given criteria"
          ) {
            toast.error("No Available rooms for given criteria");
            setIsButtonDisabled(true);
            setPrebookCalledForRooms((prev) => ({
              ...prev,
              [roomIndex]: false,
            }));
            setIsPrebookLoading(false);
            return;
          }

          const netAmount = response.data.HotelResult[0].Rooms[0].NetAmount;
          const isRoomRefundable = room?.IsRefundable || false;
          setPrebookDataForRooms((prev) => ({
            ...prev,
            [roomIndex]: {
              netAmount,
              bookingCode: room.BookingCode,
              isRefundable: isRoomRefundable,
            },
          }));

          setPrebookCalledForRooms((prev) => ({
            ...prev,
            [roomIndex]: true,
          }));
        }
      } catch (error) {
        console.error("Error calling prebook API:", error);
        toast.error("Failed to check room availability. Please try again.");
        setIsButtonDisabled(true);
        setPrebookCalledForRooms((prev) => ({
          ...prev,
          [roomIndex]: false,
        }));
        setIsPrebookLoading(false);
      }
    }
  };

  const decrementQuantity = (roomIndex: number) => {
    setRoomQuantities((prev) => {
      const currentQuantity = prev[roomIndex] ?? 0;
      if (currentQuantity <= 0) return prev; // Nothing to decrement

      const newQuantity = currentQuantity - 1;
      const updated = {
        ...prev,
        [roomIndex]: newQuantity,
      };

      if (newQuantity === 0) {
        delete updated[roomIndex];

        // Clear related prebook data when quantity goes to zero
        setPrebookDataForRooms((prevData) => {
          const newData = { ...prevData };
          delete newData[roomIndex];
          return newData;
        });

        setPrebookCalledForRooms((prev) => ({
          ...prev,
          [roomIndex]: false,
        }));

        setAllPrebookData((prevData) => {
          const newData = { ...prevData };
          delete newData[roomIndex];
          return newData;
        });

        setRateConditionsList((prev) => {
          const updated = { ...prev };
          delete updated[roomIndex];
          return updated;
        });
      }

      // Calculate combined amount with updated quantities
      const combinedAmount = calculateCombinedAmount(updated);
      setNetAmount(combinedAmount);

      const hasSelectedRoom = Object.values(updated).some((qty) => qty > 0);
      if (!hasSelectedRoom) {
        setIsButtonDisabled(false);
        setIsPrebookLoading(false);
      }

      return updated;
    });
  };

  // Auto-select first room when rooms are loaded
  useEffect(() => {
    if (rooms.length > 0 && rooms[0]?.Rooms && rooms[0].Rooms.length > 0) {
      // Check if no room is currently selected
      const hasSelectedRoom = Object.values(roomQuantities).some(
        (quantity) => quantity > 0
      );

      if (!hasSelectedRoom) {
        // Auto-select the first room
        incrementQuantity(0);
      }
    }
  }, [rooms]);

  const proceedToPayHandler =
    bookingOption === "instant"
      ? handleProceedToPay
      : isRefundable || hasRefundableRooms
      ? handleReserveProceedToPay
      : handleProceedToPay;

  // Check if we have the required data to fetch hotel details
  if (!hotelSearchData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Missing Search Data
          </h2>
          <p className="text-gray-600 mb-4">
            Please return to the search page and try again.
          </p>
          <button
            onClick={() => router.push("/hotels/search")}
            className="px-6 py-2 bg-[#FF7F50] text-white rounded-lg hover:bg-[#FF6347] transition-colors"
          >
            Go to Search
          </button>
        </div>
      </div>
    );
  }

  if (!canFetch || loading || !hotel) {
    return <LoadingTransition />;
  }

  // Step 1: Collect inclusions from allPrebookData (if available)
  const allInclusionsFromAllPrebook = Object.values(
    allPrebookData ?? {}
  ).flatMap((data) => {
    const rooms = data?.HotelResult?.[0]?.Rooms ?? [];
    return rooms.flatMap(
      (room: any) =>
        room?.Inclusion?.split(",").map((item: string) => item.trim()) ?? []
    );
  });

  //  Step 2: If allPrebookData is empty, fallback to prebookData
  const allInclusionsFromPrebook = Array.isArray(prebookData?.HotelResult)
    ? prebookData?.HotelResult[0]?.Rooms?.flatMap(
        (room: any) =>
          room?.Inclusion?.split(",").map((item: string) => item.trim()) ?? []
      ) ?? []
    : [];

  // Step 3: Combine + deduplicate
  const allInclusions: string[] =
    allInclusionsFromAllPrebook.length > 0
      ? allInclusionsFromAllPrebook
      : allInclusionsFromPrebook;

  const uniqueInclusions: string[] = [...new Set(allInclusions)].filter(
    Boolean
  );

  //  Step 1: Extract from allPrebookData (flatten nested Supplements)
  const allSupplementsFromAllPrebook = Object.values(
    allPrebookData ?? {}
  ).flatMap((data) => {
    const rooms = data?.HotelResult?.[0]?.Rooms ?? [];
    return rooms.flatMap((room: any) =>
      Array.isArray(room?.Supplements) ? room.Supplements.flat() : []
    );
  });

  //  Step 2: Extract from prebookData if allPrebookData is empty
  const allSupplementsFromPrebook =
    prebookData?.HotelResult?.[0]?.Rooms?.flatMap((room: any) =>
      Array.isArray(room?.Supplements) ? room.Supplements.flat() : []
    ) ?? [];

  //  Step 3: Use fallback if needed
  const allSupplementsRaw =
    allSupplementsFromAllPrebook.length > 0
      ? allSupplementsFromAllPrebook
      : allSupplementsFromPrebook;

  //  Step 4: Deduplicate by Type + Description + Price
  const uniqueSupplementsMap = new Map();

  allSupplementsRaw.forEach((supplement: any) => {
    const key = `${supplement.Type}-${supplement.Description}-${supplement.Price}-${supplement.Currency}`;
    if (!uniqueSupplementsMap.has(key)) {
      uniqueSupplementsMap.set(key, supplement);
    }
  });

  const uniqueSupplements = Array.from(uniqueSupplementsMap.values());

  return (
    <>
      {loading ? (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7F50] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading hotel details...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="min-h-screen bg-white text-black font-normal">
            <div className="max-w-[1440px] mx-auto px-20 py-8 max-lg:px-5">
              {/* Hotel Header Section  */}
              <div className="w-full max-w-[1280px] mb-8">
                {/* Top Tags and Title Section */}
                <div className="w-full mb-6">
                  {/* Tags Row */}
                  <div className="flex flex-col items-start gap-6 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                      {hotel && hotel.hasAirportShuttle && (
                        <div className="flex items-center gap-4">
                          <svg
                            className="w-6 h-6 bg-[#00B4D8] rounded p-1"
                            viewBox="0 0 24 25"
                            fill="none"
                          >
                            <rect
                              y="0.5"
                              width="24"
                              height="24"
                              rx="4"
                              fill="#00B4D8"
                            />
                            <path
                              d="M6.53921 18.7888H7.18382V10.4089H6.53921C6.19729 10.4089 5.86937 10.5447 5.6276 10.7865C5.38583 11.0283 5.25 11.3562 5.25 11.6981V17.4995C5.25 17.8415 5.38583 18.1694 5.6276 18.4112C5.86937 18.6529 6.19729 18.7888 6.53921 18.7888ZM16.8529 10.4089H12.3407L13.0639 8.23786C13.1284 8.0441 13.146 7.83778 13.1152 7.6359C13.0844 7.43402 13.006 7.24234 12.8866 7.07667C12.7672 6.91099 12.6102 6.77605 12.4284 6.68297C12.2466 6.58988 12.0453 6.54131 11.8411 6.54126H11.6961L8.47303 10.0466V18.7888H15.5637L18.0854 13.2477L18.1421 12.9873V11.6981C18.1421 11.3562 18.0063 11.0283 17.7645 10.7865C17.5227 10.5447 17.1948 10.4089 16.8529 10.4089Z"
                              fill="white"
                            />
                          </svg>
                          <span className="text-black text-lg font-normal font-nunito">
                            Airport shuttle
                          </span>
                        </div>
                      )}

                      {uniqueInclusions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {uniqueInclusions.map((inclusion, index) => (
                            <div
                              key={index}
                              className="min-h-6/12 whitespace-nowrap flex items-center gap-2 px-2 py-1 border-[2px] border-[#014569] rounded-2xl"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="26"
                                height="26"
                                viewBox="0 0 18 19"
                                fill="none"
                              >
                                <path
                                  d="M4 6.5C4 7.82608 4.52678 9.09785 5.46447 10.0355C6.40215 10.9732 7.67392 11.5 9 11.5C10.3261 11.5 11.5979 10.9732 12.5355 10.0355C13.4732 9.09785 14 7.82608 14 6.5C14 5.17392 13.4732 3.90215 12.5355 2.96447C11.5979 2.02678 10.3261 1.5 9 1.5C7.67392 1.5 6.40215 2.02678 5.46447 2.96447C4.52678 3.90215 4 5.17392 4 6.5Z"
                                  stroke="#014569"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M8.99898 14L11.8323 18.9083L13.164 16.2142L16.1623 16.4075L13.329 11.5M4.66732 11.5L1.83398 16.4083L4.83232 16.2142L6.16398 18.9075L8.99732 14"
                                  stroke="#014569"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span className="text-[#014569] text-lg font-semibold font-nunito">
                                {inclusion}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hotel Name */}
                  <h1 className="text-black text-xl md:text-[32px] font-bold font-raleway leading-[48px] mb-4">
                    {hotel?.HotelName}
                  </h1>

                  <LocationRating hotel={hotel} />
                </div>

                <HotelImages hotel={hotel} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Hotel Details */}
                <div className="lg:col-span-2">
                  {/* Amenities Section */}
                  <Amenities
                    amenityIcons={amenityIcons}
                    prebookData={prebookData}
                    allPrebookData={allPrebookData}
                  />

                  {/* About this property Section */}
                  <AboutProperty hotel={hotel} />

                  {uniqueSupplements.length > 0 && (
                    <div className="mt-8 space-y-4">
                      <h3 className="text-xl font-semibold">Supplements</h3>

                      {uniqueSupplements.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-md p-4 mb-5"
                        >
                          <div className="mb-2">
                            <span className="text-gray-600 text-sm">Type</span>
                            <div className="text-gray-900 font-medium">
                              {item.Type}
                            </div>
                          </div>

                          <div className="mb-2">
                            <span className="text-gray-600 text-sm">
                              Description
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {typeof item.Description === "string" &&
                                item.Description.split(",").map(
                                  (desc: string, i: number) => (
                                    <span
                                      key={i}
                                      className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded"
                                    >
                                      {desc.replace(/_/g, " ")}
                                    </span>
                                  )
                                )}
                            </div>
                          </div>

                          <div>
                            <span className="text-gray-600 text-sm">Price</span>
                            <div className="text-gray-900 font-semibold">
                              {item.Currency} {item.Price}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rooms & beds Section */}
                  <RoomsAndBeds
                    rooms={rooms}
                    roomQuantities={roomQuantities}
                    onIncrementQuantity={incrementQuantity}
                    onDecrementQuantity={decrementQuantity}
                  />
                </div>

                {/* Right Column - Enhanced Booking Summary */}
                <BookingSummary
                  hotel={hotel}
                  rooms={rooms}
                  roomQuantities={roomQuantities}
                  hotelSearchData={hotelSearchData}
                  onBookNow={handleBookNow}
                  formatPrice={formatPrice}
                  disabled={isButtonDisabled}
                  amount={netAmount}
                  prebook={isPrebookLoading}
                  prebookDataForRooms={prebookDataForRooms}
                  prebookData={prebookData}
                  allPrebookData={allPrebookData}
                  bookingOption={bookingOption}
                  setBookingOption={setBookingOption}
                />
              </div>
              {/* Policies Section */}
              <PoliciesComponent
                hotel={hotel}
                prebookData={prebookData}
                allPrebookData={allPrebookData}
              />

              {/* Important Information Section */}
              <ImportantInformationComponent
                rateConditionsList={Object.values(rateConditionsList)}
              />

              {/* FAQs Section */}
              {/* <FAQsComponent hotel={hotel} /> */}

              {/* Recent Reviews Section */}
              <RecentReviewsComponent hotel={hotel} />

              {/* Similar Hotels Recommendations Section */}
              <RecommendedHotelComponent
                recommendedRooms={recommendedRooms}
                formatPrice={formatPrice}
              />
            </div>

            {/* Guest Details Modal */}
            <GuestDetailsModal
              isOpen={isGuestModalOpen}
              onClose={handleCloseGuestModal}
              guestDetails={guestDetails}
              onGuestDetailChange={handleGuestDetailChange}
              onAddAdult={handleAddAdult}
              onProceedToPay={proceedToPayHandler}
              validationInfo={validationInfo}
              arrivalTransportType={arrivalTransportType}
              setArrivalTransportType={setArrivalTransportType}
              transportInfoId={transportInfoId}
              setTransportInfoId={setTransportInfoId}
              time={time}
              setTime={setTime}
              departureTransportType={departureTransportType}
              setDepartureTransportType={setDepartureTransportType}
              departureTransportInfoId={departureTransportInfoId}
              setDepartureTransportInfoId={setDepartureTransportInfoId}
              departureTime={departureTime}
              setDepartureTime={setDepartureTime}
              bookingOption={bookingOption}
              hasSelectedRefundableRoom={hasSelectedRefundableRoom}
            />
          </div>
        </>
      )}

      {/* Sign In Modal */}
      {isSignInModalOpen && (
        <SignInModal
          isOpen={isSignInModalOpen}
          onClose={() => setIsSignInModalOpen(false)}
          onSwitchToSignUp={() => {
            setIsSignInModalOpen(false);
            setIsSignUpModalOpen(true);
          }}
        />
      )}

      {/* Sign Up Modal */}
      {isSignUpModalOpen && (
        <SignUpModal
          isOpen={isSignUpModalOpen}
          onClose={() => setIsSignUpModalOpen(false)}
          onSwitchToSignIn={() => {
            setIsSignUpModalOpen(false);
            setIsSignInModalOpen(true);
          }}
        />
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <div>
            <h3 className="font-semibold">Payment Successful!</h3>
            <p className="text-sm">Your hotel booking has been confirmed.</p>
          </div>
          <button
            onClick={() => setShowSuccessMessage(false)}
            className="ml-4 text-white hover:text-gray-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {isBooking && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[9999] flex items-center justify-center">
          <div className="flex flex-col items-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7F50] mb-4"></div>
            <p className="text-lg font-medium">
              Processing your booking, please wait...
            </p>
          </div>
        </div>
      )}
    </>
  );
}
