"use client";

import { userAtom } from "@/app/atoms/auth";
import { LOCAL_KEY } from "@/common/enums";
import GlobalLoader from "@/components/ui/GlobalLoader";
import http from "@/services/http";
import { getStorageItem } from "@/services/storage";
import { fetchIP } from "@/utils/functions";
import { extractFlightSegments } from "@/utils/functions/extractFlightSegments";
import { generateBookPassAPIPayload } from "@/utils/functions/generateBookPassAPIPayload";
import { generatePassengerMap } from "@/utils/functions/generatePassengerMap";
import { generatePassengersPayload } from "@/utils/functions/generatePassengersPayload";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import LoadingTransition from "../../components/LoadingTransition";
import BaggageSelection from "./components/BaggageSelection";
import BookingOptions from "./components/BookingOptions";
import FlightDetails from "./components/FlightDetails";
import MealSelection from "./components/MealSelection";
import PricingSidebar from "./components/PricingSidebar";
import PromoCodeSection from "./components/PromoCodeSection";
import SeatSelection from "./components/SeatSelection";
import SpecialOffers from "./components/SpecialOffres";
import Summary from "./components/Summary";
import TripSummary from "./components/TripSummary";

export enum LoadingState {
  Book_Loading = "Book_Loading",
  LCC_Loading = "LCC_Loading",
  NON_LCC_Loading = "NON_LCC_Loading",
}

export interface SpecialService {
  Origin: string;
  Destination: string;
  DepartureTime: string;
  AirlineCode: string;
  FlightNumber: string;
  Code: string;
  ServiceType: number;
  Text: string;
  WayType: number;
  Currency: string;
  Price: number;
}

export interface SegmentSpecialService {
  SSRService: SpecialService[];
}

export interface TripSpecialService {
  SegmentSpecialService: SegmentSpecialService[];
}

export default function FlightBooking() {
  const searchParams = useSearchParams();
  const [user] = useAtom(userAtom);
  const traceid = searchParams.get("traceid");
  const flightId = searchParams.get("flightId");
  const flightId1 = searchParams.get("flightId1");
  const pnr =  searchParams.get("reissue_pnr");
  const bookingId = searchParams.get("reissue_bookingId");
  const isRoundTrip = !!flightId1;
  const [ticketold, setTicketold] = useState<any>(null);
  const [error, setError] = useState("");
  // ----- local states -----
  const [parentSelectedSeats, setParentSelectedSeats] = useState({});
  const [selectedBaggageTotal, setSelectedBaggageTotal] = useState(0);
  const [selectedMealTotal, setSelectedMealTotal] = useState(0);
  const [selectedSpecialTotal, setSelectedSpecialTotal] = useState(0);

  const [specialServicesData, setSpecialServicesData] = useState<{
    passengerServices: Record<string, { SSRService: SpecialService[] }>;
    totalPricePerPassenger: Record<string, number>;
    grandTotal: number;
  } | null>(null);

  const [specialServicesPayload, setSpecialServicesPayload] = useState<
  Record<string, { SSRService: SpecialService[] }>
  >({});


  const [passengerDetails, setPassengerDetails] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState<LoadingState | "">("");
  const [currentUserIp, setCurrentUserIp] = useState<string>("");
  const [baggagePayload, setBaggagePayload] = useState<any>({});
  const [mealPayload, setMealPayload] = useState<any>({});
  const [specialPayload, setSpecialPayload] = useState<any>({});
  const [passengerSeatSelections, setPassengerSeatSelections] = useState<any>(
    {}
  );
  const [isFinalizingBooking, setIsFinalizingBooking] = useState(false);
  const [bookingOut, setBookingOut] = useState<{
    PNR: string;
    BookingId: string;
  } | null>(null);
  const [bookingIn, setBookingIn] = useState<{
    PNR: string;
    BookingId: string;
  } | null>(null);
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);

  // Quote states
  const [quote, setQuote] = useState<any>(null);
  const [quote1, setQuote1] = useState<any>(null);

  // SSR states
  const [ssr, setSSR] = useState<any>(null);
  const [ssr1, setSSR1] = useState<any>(null);

  // SSR flags
  const [isSuccessOutSSR, setIsSuccessOutSSR] = useState(false);
  const [isSessionOutExpired, setIsSessionOutExpired] = useState(false);
  const [isSuccessSSR1, setIsSuccessSSR1] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // ----------------------
  // ✅ FareQuote Outbound
  // ----------------------
  const {
    data: fareQuoteOut,
    isSuccess: isFareQuoteOutSuccess,
    isLoading: isLoadingFareOut,
  } = useQuery<any>({
    queryKey: ["fareQuote-out", flightId, traceid],
    enabled: !!flightId && !!traceid,
    queryFn: async ({ queryKey }: any) => {
      const [_key, flightId, traceid] = queryKey;
      const { data } = await http.post("/fareQuote", {
        ResultIndex: flightId,
        TraceId: traceid,
      });
      return data;
    },
    onError: (err: any) => console.error("FareQuote Outbound Error:", err),
  } as any);

  // ----------------------
  // ✅ FareQuote Inbound
  // ----------------------
  const {
    data: fareQuoteIn,
    isSuccess: isFareQuoteInSuccess,
    isLoading: isLoadingFareIn,
  } = useQuery<any>({
    queryKey: ["fareQuote-in", flightId1, traceid],
    enabled: !!flightId1 && !!traceid,
    queryFn: async ({ queryKey }: any) => {
      const [_key, flightId1, traceid] = queryKey;
      const { data } = await http.post("/fareQuote", {
        ResultIndex: flightId1,
        TraceId: traceid,
      });
      return data;
    },
    onError: (err: any) => console.error("FareQuote Inbound Error:", err),
  } as any);

  // ----------------------
  // ✅ SSR Outbound
  // ----------------------
  const { data: ssrOut } = useQuery<any>({
    queryKey: ["getSSR-out", flightId, traceid],
    enabled: isFareQuoteOutSuccess,
    queryFn: async ({ queryKey }: any) => {
      const [_key, flightId, traceid] = queryKey;
      const { data } = await http.post("/getSSR", {
        ResultIndex: flightId,
        TraceId: traceid,
      });

      const response = data?.Response;
      const errorCode = response?.Error?.ErrorCode;

    const cleanSection = (section: any[], codeToRemove: string, valueKey: string) => {
      return (section || [])
        .map((group: any[]) =>
          (group || []).filter(
            (item: any) => item.Code !== codeToRemove && (item[valueKey] ?? 0) > 0
          )
        )
        .filter((group: any[]) => group.length > 0);
    };

    // Clean Baggage
    const filteredBaggage = cleanSection(response?.Baggage, "NoBaggage", "Weight");

    // Clean MealDynamic
    const filteredMeal = cleanSection(response?.MealDynamic, "NoMeal", "Quantity");

    // Construct cleaned response
    const responseCleaned: any = { ...response };
    if (filteredBaggage.length > 0) responseCleaned.Baggage = filteredBaggage;
    else delete responseCleaned.Baggage;

    if (filteredMeal.length > 0) responseCleaned.MealDynamic = filteredMeal;
    else delete responseCleaned.MealDynamic;


      return {
        // fullData: data,
         fullData: {
        ...data,
        Response: responseCleaned,
      },
        isSuccessSSR: response?.ResponseStatus === 1 && errorCode === 0,
        isSessionExpired: errorCode === 5,
        errorMessage: response?.Error?.ErrorMessage,
      };
    },
    onError: (err: any) => console.error("SSR Outbound Error:", err),
  } as any);

  // ----------------------
  // ✅ SSR Inbound
  // ----------------------
  const { data: ssrIn } = useQuery<any>({
    queryKey: ["getSSR-in", flightId1, traceid],
    enabled: !!flightId1 && isFareQuoteInSuccess,
    queryFn: async ({ queryKey }: any) => {
      const [_key, flightId1, traceid] = queryKey;
      const { data } = await http.post("/getSSR", {
        ResultIndex: flightId1,
        TraceId: traceid,
      });

      const response = data?.Response;
      const errorCode = response?.Error?.ErrorCode;
    
    const cleanSection = (section: any[], codeToRemove: string, valueKey: string) => {
      return (section || [])
        .map((group: any[]) =>
          (group || []).filter(
            (item: any) => item.Code !== codeToRemove && (item[valueKey] ?? 0) > 0
          )
        )
        .filter((group: any[]) => group.length > 0);
    };

    // Clean Baggage
    const filteredBaggage = cleanSection(response?.Baggage, "NoBaggage", "Weight");

    // Clean MealDynamic
    const filteredMeal = cleanSection(response?.MealDynamic, "NoMeal", "Quantity");

    // Construct cleaned response
    const responseCleaned: any = { ...response };
    if (filteredBaggage.length > 0) responseCleaned.Baggage = filteredBaggage;
    else delete responseCleaned.Baggage;

    if (filteredMeal.length > 0) responseCleaned.MealDynamic = filteredMeal;
    else delete responseCleaned.MealDynamic;

      return {
        // fullData: data,
       fullData: {
        ...data,
        Response: responseCleaned,
      },
        isSuccessSSR: response?.ResponseStatus === 1 && errorCode === 0,
        isSessionExpired: errorCode === 5,
        errorMessage: response?.Error?.ErrorMessage,
      };
    },
    onError: (err: any) => console.error("SSR Inbound Error:", err),
  } as any);

  // ----------------------
  // 🔁 Side Effects
  // ----------------------

  useEffect(() => {
    if (fareQuoteOut) {
      setQuote(fareQuoteOut);
    }
  }, [fareQuoteOut]);

  useEffect(() => {
    if (fareQuoteIn) {
      setQuote1(fareQuoteIn);
    }
  }, [fareQuoteIn]);

  useEffect(() => {
    if (!ssrOut) return;

    if (ssrOut.isSuccessSSR) {
      setSSR(ssrOut.fullData);
      setIsSuccessOutSSR(true);
    } else if (ssrOut.isSessionExpired) {
      setIsSessionOutExpired(true);
      console.warn("Outbound SSR session expired.");
    } else {
      console.error("Outbound SSR Error:", ssrOut.errorMessage);
    }
  }, [ssrOut]);

  useEffect(() => {
    if (!ssrIn) return;

    if (ssrIn.isSuccessSSR) {
      setSSR1(ssrIn.fullData);
      setIsSuccessSSR1(true);
    } else if (ssrIn.isSessionExpired) {
      setIsSessionExpired(true);
      console.warn("Inbound SSR session expired.");
    } else {
      console.error("Inbound SSR Error:", ssrIn.errorMessage);
    }
  }, [ssrIn]);

  const isFareQuoteLoading =
    isLoadingFareOut || (isRoundTrip && isLoadingFareIn);

  const isFareQuoteSuccess =
    isFareQuoteOutSuccess && (!isRoundTrip || isFareQuoteInSuccess);

  // ✅ SSR Loading and Success (with session expiry fallback)
  const isSSRLoading =
    (isFareQuoteSuccess && (!ssrOut || !isSuccessOutSSR)) ||
    (isRoundTrip && (!ssrIn || !isSuccessSSR1));

  const isSSRSuccess =
    (isSuccessOutSSR || isSessionOutExpired) &&
    (!isRoundTrip || isSuccessSSR1 || isSessionExpired);

  // ----------------------
  // ✅ All API Combined
  // ----------------------
  const isAllApiLoading = isFareQuoteLoading || isSSRLoading;
  const isAllApiSuccess = isFareQuoteSuccess && isSSRSuccess;

  useEffect(() => {
    const getIP = async () => {
      const ip = await fetchIP();
      if (ip) {
        setCurrentUserIp(ip);
      }
    };
    getIP();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFinalizingBooking) {
        e.preventDefault();
        e.returnValue =
          "Booking is in progress. Are you sure you want to leave?";
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (isFinalizingBooking) {
        window.history.pushState(null, "", window.location.href);
        alert("Booking is in progress. Please wait until it completes.");
      }
    };

    if (isFinalizingBooking) {
      // Push dummy history state to trap back button
      window.history.pushState(null, "", window.location.href);
      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("popstate", handlePopState);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isFinalizingBooking]);

  useEffect(() => {
    if (!isFinalizingBooking) return;

    // Push a dummy state into the history stack
    window.history.pushState(null, "", window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      // Push the state again to prevent back
      window.history.pushState(null, "", window.location.href);
      alert("Booking is in progress. Please wait until it completes.");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isFinalizingBooking]);

  useEffect(() => {
    if (
      isFinalizingBooking === false &&
      flightId &&
      bookingOut?.PNR &&
      (!flightId1 || (flightId1 && bookingIn?.PNR))
    ) {
      setIsBookingSuccess(true);
    }
  }, [isFinalizingBooking, bookingOut, bookingIn, flightId, flightId1]);

  useEffect(() => {
  if(!bookingId || !pnr) return;
      const token = typeof window !== "undefined" ? localStorage.getItem("access-token") : null;
      http
        .get(`/flight/history?bookingid=${bookingId}`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
        .then(res => {
          setTicketold(res.data.data || res.data);
          setError("");
        })
        .catch(err => setError(err?.response?.data?.message || err.message || "Error fetching ticket details"))
    }, [bookingId, pnr]);
    
  // console.log("old total amount", ticketold?.invoice?.[0]?.InvoiceAmount);

  const canFetch = useMemo(
    () => traceid !== null && flightId !== null,
    [traceid, flightId]
  );

  const {
    flightSegmentOutBound,
    flightSegmentInBound,
    passengerData,
    passengerDataInBound,
    passengerCount,
  } = useMemo(() => {
    if (!quote && !quote1) {
      return {
        flightSegmentOutBound: [],
        flightSegmentInBound: [],
        passengerDataInBound: [],
        passengerData: {},
        passengerCount: {},
      };
    }

    const flightSegmentOutBound = extractFlightSegments(quote);
    const flightSegmentInBound = extractFlightSegments(quote1);

    const fareBreakdown = quote?.Response?.Results?.FareBreakdown ?? [];
    const totalGuests = fareBreakdown.reduce(
      (sum: number, fb: any) => sum + (fb?.PassengerCount ?? 0),
      0
    );

    const passengerData = Object.fromEntries(
      flightSegmentOutBound.map(({ id }: any) => {
        const guests = Object.fromEntries(
          Array.from({ length: totalGuests }, (_, i) => {
            const guestId = `guest-${i + 1}`;
            return [
              guestId,
              { id: guestId, name: `Guest ${i + 1}`, selections: {} },
            ];
          })
        );
        return [id, guests];
      })
    );

    const fareBreakdownInBound = quote1?.Response?.Results?.FareBreakdown ?? [];
    const totalGuestsInBound = fareBreakdownInBound.reduce(
      (sum: number, fb: any) => sum + (fb?.PassengerCount ?? 0),
      0
    );

    const passengerDataInBound = Object.fromEntries(
      flightSegmentInBound.map(({ id }: any) => {
        const guests = Object.fromEntries(
          Array.from({ length: totalGuestsInBound }, (_, i) => {
            const guestId = `guest-${i + 1}`;
            return [
              guestId,
              { id: guestId, name: `Guest ${i + 1}`, selections: {} },
            ];
          })
        );
        return [id, guests];
      })
    );

    const passengerCount = {
      adult: quote?.Response?.Results?.FareBreakdown?.[0]?.PassengerCount ?? 0,
      child: quote?.Response?.Results?.FareBreakdown?.[1]?.PassengerCount ?? 0,
      infant:
        quote?.Response?.Results?.FareBreakdown?.[2]?.PassengerCount ?? 0,
    };

    return {
      flightSegmentOutBound,
      flightSegmentInBound,
      passengerData,
      passengerDataInBound,
      passengerCount,
    };
  }, [quote, quote1]);

  const mealDataOutBound = Array.isArray(ssr?.Response?.MealDynamic?.[0])
    ? ssr?.Response?.MealDynamic.flat()
    : ssr?.Response?.MealDynamic ?? ssr?.Response?.Meal ?? null;

    // console.log("mealData", mealDataOutBound);

  const mealDataInBound = Array.isArray(ssr1?.Response?.MealDynamic?.[0])
    ? ssr1?.Response?.MealDynamic.flat()
    : ssr1?.Response?.MealDynamic ?? ssr1?.Response?.Meal ?? null;

  const passengerMap = generatePassengerMap(
    quote?.Response?.Results?.FareBreakdown || [],
    false
  );

  const handleSeatPayload = (finalPayload: any) => {
    setPassengerSeatSelections(finalPayload);
  };

  const handleBaggagePayload = (finalPayload: any) => {
    setBaggagePayload(finalPayload);
  };

  const handleMealPayload = (finalPayload: any) => {
    setMealPayload(finalPayload);
  };

  const handleSpecialPayload = (finalPayload: any) => {
    setSpecialPayload(finalPayload);
  };

  // Get Book Detail API Call
  const getBookingDetails = async (pnrNo: any, bookingId: any) => {
    setBookingLoading(LoadingState.NON_LCC_Loading);
    const payload = {
      PNR: pnrNo,
      BookingId: bookingId,
      userId: user?.id.toString() || "",
    };
    try {
      const { data } = await http.post("/get-booking-details", payload);
      if (data) {
        const rawInvoiceNumber = getStorageItem(LOCAL_KEY.ORDER_ID);
        const invoiceNumber = JSON.parse(rawInvoiceNumber || '""');
        await http.post("/flight-api-log", {
          order_id: invoiceNumber,
          api_name: "GET_BOOKING_DETAIL",
          status_code: 200,
          response_data: {
            pnr: payload.PNR || "PNR_STORED_IN_FLIGHT_MODULE",
            booking_ref: payload.BookingId || "BOOKING_REF_STORED_IN_FLIGHT_MODULE",
          },
        });
      }
    } catch (err) {
      console.error("Non Lcc Ticket Error:", err);
    } finally {
      setBookingLoading("");
    }
  };

  const handleBook = async ({
    ResultIndex,
    isLcc,
    quoteData,
    direction,
  }: {
    ResultIndex: string;
    isLcc: boolean;
    quoteData: any;
    direction: "OutBound" | "InBound";
  }) => {
    try {
      setBookingLoading(LoadingState.Book_Loading);

      const baggage = baggagePayload?.[direction];
      const meal = mealPayload?.[direction];
      const seat = passengerSeatSelections?.[direction];

      if (!bookingId && !pnr) {
      if (isLcc) {
        setBookingLoading(LoadingState.LCC_Loading);
        const Passengers = generatePassengersPayload(
          passengerDetails,
          quoteData?.FareBreakdown,
          baggage,
          meal,
          seat,
          specialServicesPayload 
        );
        // console.log("passanger passport details" , Passengers );
        // const { data } = await http.post("/", {
        const { data } = await http.post("/lcc-ticket", {
          TraceId: traceid,
          ResultIndex,
          Passengers,
        });

        const response = data?.Response?.Response;

        if (response?.PNR && response?.BookingId) {
          await getBookingDetails(response.PNR, response.BookingId);

          const record = { PNR: response.PNR, BookingId: response.BookingId };
          if (direction === "OutBound") {
            setBookingOut(record);
          } else {
            setBookingIn(record);
          }
          const rawInvoiceNumber = getStorageItem(LOCAL_KEY.ORDER_ID);
          const invoiceNumber = JSON.parse(rawInvoiceNumber || '""');
          await http.post("/flight-api-log", {
            order_id: invoiceNumber,
            api_name: "TICKET",
            status_code: 200,
            response_data: {
              pnr: response.PNR,
              booking_ref: response.BookingId,
            },
          });
        }else{
          const token = localStorage.getItem("access-token");
          await http.get("/flight/booking-failed/mail", {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        return;
      }
      }

      if (bookingId && pnr) {
        setBookingLoading(LoadingState.LCC_Loading);
        const Passengers = generatePassengersPayload(
          passengerDetails,
          quoteData?.FareBreakdown,
          baggage,
          meal,
          seat,
          specialServicesPayload 
        );
        const { data } = await http.post("/ticket-reissue", {
          TraceId: traceid,
          ResultIndex,
          Passengers,
          PNR: pnr,
          BookingId: Number(bookingId),
        });

        const response = data?.Response?.FlightItinerary || data?.Response?.Response;

        if (response?.PNR && response?.BookingId) {
          await getBookingDetails(response.PNR, response.BookingId);

          const record = { PNR: response.PNR, BookingId: response.BookingId };
          if (direction === "OutBound") {
            setBookingOut(record);
          } else {
            setBookingIn(record);
          }
          const rawInvoiceNumber = getStorageItem(LOCAL_KEY.ORDER_ID);
          const invoiceNumber = JSON.parse(rawInvoiceNumber || '""');
          await http.post("/flight-api-log", {
            order_id: invoiceNumber,
            api_name: "TICKET",
            status_code: 200,
            response_data: {
              pnr: response.PNR,
              booking_ref: response.BookingId,
            },
          });
        }else{
          const token = localStorage.getItem("access-token");
          await http.get("/flight/booking-failed/mail", {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        return;
      }

      // Non-LCC flow
      const Passengers = generateBookPassAPIPayload(
        passengerDetails,
        quoteData,
        baggage,
        meal,
        seat
      );

      const bookPayload = {
        ResultIndex,
        Passengers,
        TraceId: traceid,
        EndUserIp: currentUserIp,
        TokenId: "",
      };

      const { data } = await http.post("/book", bookPayload);
      // const { data } = await http.post("/", bookPayload);
      const PNR = data?.Response?.Response?.PNR;
      const BookingId = data?.Response?.Response?.BookingId;
      if (PNR && BookingId) {
        const rawInvoiceNumber = getStorageItem(LOCAL_KEY.ORDER_ID);
        const invoiceNumber = JSON.parse(rawInvoiceNumber || '""');
        await http.post("/flight-api-log", {
          order_id: invoiceNumber,
          api_name: "BOOK",
          status_code: 200,
          response_data: {
            pnr: PNR,
            booking_ref: BookingId,
          },
        });
      }else{
        const token = localStorage.getItem("access-token");
          await http.get("/flight/booking-failed/mail", {
            headers: { Authorization: `Bearer ${token}` },
          });
      }

      if (PNR && BookingId) {
        const ticketPayload = { TraceId: traceid, PNR, BookingId };

        const ticketRes = await http.post("/non-lcc-ticket", ticketPayload);
        // const ticketRes = await http.post("/", ticketPayload);

        const bookedPNR = ticketRes?.data?.Response?.Response?.PNR;
        const bookedBookingId = ticketRes?.data?.Response?.Response?.BookingId;

        if (bookedPNR && bookedBookingId) {
          await getBookingDetails(bookedPNR, bookedBookingId);

          const record = { PNR: bookedPNR, BookingId: bookedBookingId };
          if (direction === "OutBound") {
            setBookingOut(record);
          } else {
            setBookingIn(record);
          }
          const rawInvoiceNumber = getStorageItem(LOCAL_KEY.ORDER_ID);
          const invoiceNumber = JSON.parse(rawInvoiceNumber || '""');
          await http.post("/flight-api-log", {
            order_id: invoiceNumber,
            api_name: "TICKET",
            status_code: 200,
            response_data: {
              pnr: bookedPNR,
              booking_ref: bookedBookingId,
            },
          });
        }
      }else{
        const token = localStorage.getItem("access-token");
          await http.get("/flight/booking-failed/mail", {
            headers: { Authorization: `Bearer ${token}` },
          });
      }
    } catch (err) {
      console.error(`[${direction}] Booking Error:`, err);
      const token = localStorage.getItem("access-token");
          await http.get("/flight/booking-failed/mail", {
            headers: { Authorization: `Bearer ${token}` },
          });
    } finally {
      setBookingLoading("");
    }
  };

  // ----------------------
  // Part 3 content (payment + special handling)
  // ----------------------

  const onPaymentSuccess = async (paymentData: any) => {
    if (!passengerDetails) {
      alert("Passenger details missing.");
      return;
    }

    setIsFinalizingBooking(true); // 🔒 Lock UI

    try {
      // Step 1: Book outbound
      if (flightId) {
        await handleBook({
          ResultIndex: flightId,
          isLcc: quote?.Response?.Results?.IsLCC,
          quoteData: quote?.Response?.Results,
          direction: "OutBound",
        });
      }

      // Step 2: Book inbound only after outbound
      if (flightId1) {
        await handleBook({
          ResultIndex: flightId1,
          isLcc: quote1?.Response?.Results?.IsLCC,
          quoteData: quote1?.Response?.Results,
          direction: "InBound",
        });
      }
    } catch (error) {
      console.error("Booking sequence error:", error);
    } finally {
      setIsFinalizingBooking(false);
    }
  };

  const handleSeatChange = (seats: Record<string, string>) => {
    setParentSelectedSeats(seats);
  };
  const handleBaggageChange = (total: number) => {
    setSelectedBaggageTotal(total);
  };
  const handleMealChange = (total: number) => {
    setSelectedMealTotal(total);
  };


  // ----------------------
  // Special change logic - UPDATED
  // ----------------------

  // --- CHANGED: make handleSpecialChange PURE (no setState here) ---
  const handleSpecialChange = (
    service: SpecialService,
    tripIndex: number,
    passengerId: string,
    isSelected: boolean,
    allSelections: Record<string, Record<string, Record<string, boolean>>>,
    combinedTrips: TripSpecialService[],
  ) => {
    // Build passenger-wise selected services
    const passengerServices: Record<string, { SSRService: SpecialService[] }> = {};

    for (const [tripKey, passengers] of Object.entries(allSelections)) {
      const tripIdx = parseInt(tripKey.replace("trip-", ""));
      const trip = combinedTrips[tripIdx];
      if (!trip) continue;

      for (const [pid, services] of Object.entries(passengers)) {
        if (!passengerServices[pid]) {
          passengerServices[pid] = { SSRService: [] };
        }

        for (const [code, selected] of Object.entries(services)) {
          if (!selected) continue;

          trip.SegmentSpecialService?.forEach((seg) => {
            seg.SSRService.forEach((srv) => {
              if (srv.Code === code) {
                passengerServices[pid].SSRService.push(srv);
              }
            });
          });
        }
      }
    }

    // Calculate total price per passenger
    const totalPricePerPassenger: Record<string, number> = {};
    for (const [pid, { SSRService }] of Object.entries(passengerServices)) {
      totalPricePerPassenger[pid] = SSRService.reduce((sum, srv) => sum + (srv.Price || 0), 0);
    }

    // Calculate grand total
    const grandTotal = Object.values(totalPricePerPassenger).reduce((sum, price) => sum + price, 0);
    // console.log("Special Change Result:", passengerServices);

    const specialPayload: Record<string, { selections: SpecialService[] }> = {};
    for (const [pid, { SSRService }] of Object.entries(passengerServices)) {
      specialPayload[pid] = { selections: SSRService };
    }

    // const baggage = baggagePayload?.["inbound"];
    //   const meal = mealPayload?.["inbound"];
    //   const seat = passengerSeatSelections?.["inbound"];
    //   const quoteData = quote?.Response?.Results?.FareBreakdown;
    // const Passengers = generatePassengersPayload(
    //       passengerDetails,
    //       quoteData,
    //       baggage,
    //       meal,
    //       seat,
    //       specialPayload 
    //     );
    // console.log("Special Change Passengers Payload:", Passengers);
    // Return the computed data (pure function)
    return {
      passengerServices,
      totalPricePerPassenger,
      grandTotal,
      specialPayload,
    };
  };

  // --- CHANGED: wrapper that stores result into specialServicesData (safe to setState here) ---
 const handleSpecialChangeWrapper = (
  service: SpecialService,
  tripIndex: number,
  passengerId: string,
  isSelected: boolean,
  allSelections: Record<string, Record<string, Record<string, boolean>>>,
  combinedTrips: TripSpecialService[],
) => {
  const result = handleSpecialChange(
    service,
    tripIndex,
    passengerId,
    isSelected,
    allSelections,
    combinedTrips
  );

  if (result) {
    // Store everything for pricing UI
    setSpecialServicesData(result);

    // 🔥 Prepare pure payload for passenger mapping
    const specialServicesPayload: Record<
      string,
      { SSRService: SpecialService[] }
    > = result.passengerServices;

    // Save in state so we can pass to generatePassengersPayload
    // setStorageItem("specialServicesPayload", JSON.stringify(specialServicesPayload));
    setSpecialServicesPayload(specialServicesPayload); // 👈 NEW STATE
  }
};


  // --- CHANGED: sync selectedSpecialTotal from specialServicesData via effect ---
  useEffect(() => {
    if (specialServicesData) {
      setSelectedSpecialTotal(specialServicesData.grandTotal);
    }
  }, [specialServicesData]);

  // ----------------------
  // Validation: RequiredFieldValidators (seat/meal required enforcement)
  // ----------------------

  // --- CHANGED: Extract required validators from quotes (defensive checks) ---
  const requiredValidatorsOut = quote?.Response?.Results?.RequiredFieldValidators ?? {};
  const requiredValidatorsIn = quote1?.Response?.Results?.RequiredFieldValidators ?? {};

  const isSeatRequiredOut = !!requiredValidatorsOut.IsSeatRequired;
  const isMealRequiredOut = !!requiredValidatorsOut.IsMealRequired;

  const isSeatRequiredIn = !!requiredValidatorsIn.IsSeatRequired;
  const isMealRequiredIn = !!requiredValidatorsIn.IsMealRequired;

  // --- CHANGED: determine whether user has selected seats/meals per direction ---
  const seatsSelectedOut = Boolean(passengerSeatSelections?.OutBound && Object.keys(passengerSeatSelections.OutBound).length > 0);
  const seatsSelectedIn = Boolean(passengerSeatSelections?.InBound && Object.keys(passengerSeatSelections.InBound).length > 0);

  // For meals, we can use the mealPayload or selectedMealTotal as proxy (either works)
  const mealsSelectedOut = Boolean(mealPayload?.OutBound && Object.keys(mealPayload.OutBound).length > 0) || selectedMealTotal > 0;
  const mealsSelectedIn = Boolean(mealPayload?.InBound && Object.keys(mealPayload.InBound).length > 0) || selectedMealTotal > 0;

  const hasSelections = (payload: any, direction: "OutBound" | "InBound") => {
  if (!payload || !payload[direction]) return false;
  return Object.values(payload[direction]).some(
    (guest: any) => Array.isArray(guest?.selections) && guest.selections.length > 0
  );
  };

  // --- CHANGED: assemble canProceedToPayment (respecting round-trip requirements) ---
  const isSeatValidOut = !isSeatRequiredOut || seatsSelectedOut;
  const isMealValidOut = !isMealRequiredOut || mealsSelectedOut;

  const isSeatValidIn = !isRoundTrip || !isSeatRequiredIn || seatsSelectedIn;
  const isMealValidIn = !isRoundTrip || !isMealRequiredIn || mealsSelectedIn;

  const isFormValid = Boolean(passengerDetails);

  const canProceedToPayment = isFormValid && isSeatValidOut && isMealValidOut && isSeatValidIn && isMealValidIn;

  // Optional: expose messages to show why disabled (you can pass these down to PricingSidebar)
  const paymentValidationDetails = {
    isFormValid,
    isSeatValidOut,
    isMealValidOut,
    isSeatValidIn,
    isMealValidIn,
  };

  // ----------------------
  // amount calculation (ensure numeric)
  // ----------------------

  // --- CHANGED: gather base fares defensively and ensure numeric addition ---
  const totalFareOut = Number(quote?.Response?.Results?.Fare?.TotalFare ?? quote?.Response?.Results?.TotalFare ?? 0);
  const totalFareIn = Number(quote1?.Response?.Results?.Fare?.TotalFare ?? quote1?.Response?.Results?.TotalFare ?? 0);
  const additionalPrice = 0; // left as 0 unless you have another source

  const amount = (
    totalFareOut +
    totalFareIn +
    Number(additionalPrice || 0) +
    Number(selectedBaggageTotal || 0) +
    Number(selectedMealTotal || 0) +
    Number(selectedSpecialTotal || 0)
  );

  // --- CHANGED: clean console log for specialTotal (print number only) ---
  // console.log("PricingSidebar Props - specialTotal:", selectedSpecialTotal);

  if (isAllApiLoading || !canFetch) {
    return <LoadingTransition />;
  }

  return (
    <>
      {isFinalizingBooking && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm text-white text-xl">
          Finalizing your booking... Please do not refresh or close this page.
        </div>
      )}

      {isBookingSuccess && (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-green-50 text-green-900 p-6">
          <h2 className="text-3xl font-bold mb-4">🎉 Booking Confirmed!</h2>

          {bookingOut && (
            <div className="mb-3 text-center">
              <h3 className="font-semibold text-xl">OutBound Booking</h3>
              <p>
                PNR: <span className="font-mono">{bookingOut.PNR}</span>
              </p>
              <p>
                Booking ID:{" "}
                <span className="font-mono">{bookingOut.BookingId}</span>
              </p>
            </div>
          )}

          {bookingIn && (
            <div className="mb-3 text-center">
              <h3 className="font-semibold text-xl">InBound Booking</h3>
              <p>
                PNR: <span className="font-mono">{bookingIn.PNR}</span>
              </p>
              <p>
                Booking ID:{" "}
                <span className="font-mono">{bookingIn.BookingId}</span>
              </p>
            </div>
          )}

          {flightId1 && !bookingIn && (
            <p className="text-red-600">
              Inbound booking failed. Please contact support.
            </p>
          )}

          {!isBookingSuccess && !isFinalizingBooking && (
            <div className="text-red-600 text-center mt-10">
              Payment received, but booking failed. Please contact support with
              your transaction ID.
            </div>
          )}

          <button
            className="mt-6 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            onClick={() => (window.location.href = "/dashboard/flight-booking")}
          >
            View My Bookings
          </button>

          <button
            className="mt-3 text-sm underline text-green-800"
            onClick={() => (window.location.href = "/")}
          >
            Search Another Flight
          </button>
        </div>
      )}

      <div className="min-h-screen bg-white">
        <GlobalLoader
          isLoading={[
            LoadingState.Book_Loading,
            LoadingState.LCC_Loading,
            LoadingState.NON_LCC_Loading,
          ].includes(bookingLoading as LoadingState)}
        />
        <div className="max-w-[1280px] mx-auto px-4 py-4">
          <TripSummary
            flightSegmentOutBound={flightSegmentOutBound}
            flightSegmentInBound={flightSegmentInBound}
          />
          <div className="flex gap-10 max-lg:flex-col">
            {/* Main Content */}
            <div className="flex-1 space-y-10">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <FlightDetails fareQuote={quote?.Response?.Results} />
                {quote1?.Response?.Results && (
                  <FlightDetails
                    isReturn
                    fareQuote={quote1?.Response?.Results}
                  />
                )}
              </div>

              <BookingOptions
                fareQuote = {quote?.Response?.Results}
                passengerCount={passengerCount}
                setPassengerDetails={setPassengerDetails}
              />

              {isSuccessOutSSR &&
                (!isRoundTrip || isSuccessSSR1) &&
                ssr?.Response?.Baggage && (
                  <SeatSelection
                    outBoundSSR={ssr?.Response?.SeatDynamic}
                    inBoundSSR={
                      isRoundTrip && isSuccessSSR1
                        ? ssr1?.Response?.SeatDynamic ?? []
                        : []
                    }
                    passenger={passengerMap}
                    onContinue={handleSeatPayload}
                    onSeatChange={handleSeatChange}
                  />
                )}

              {isSuccessOutSSR &&
                (!isRoundTrip || isSuccessSSR1) &&
                ssr?.Response?.Baggage && (
                  <BaggageSelection
                    outBoundBaggageData={ssr?.Response?.Baggage}
                    inBoundBaggageData={
                      isRoundTrip && isSuccessSSR1
                        ? ssr1?.Response?.Baggage ?? []
                        : []
                    }
                    passenger={passengerMap}
                    onContinue={handleBaggagePayload}
                    onBaggageChange={handleBaggageChange}
                  />
                )}

              {isSuccessOutSSR &&
                (!isRoundTrip || isSuccessSSR1) && (
                <MealSelection
                  mealDataOutBound={mealDataOutBound}
                  mealDataInBound={mealDataInBound}
                  flightSegmentOutBound={flightSegmentOutBound}
                  flightSegmentInBound={flightSegmentInBound}
                  passengerDataOutBound={passengerData}
                  passengerDataInBound={passengerDataInBound}
                  onContinue={handleMealPayload}
                  onMealChange={handleMealChange}
                />
              )}

              {isSuccessOutSSR &&
                (!isRoundTrip || isSuccessSSR1) &&
                ssr?.Response?.SpecialServices && (
                  <SpecialOffers
                    outBoundBaggageData={ssr?.Response?.SpecialServices}
                    inBoundBaggageData={
                      isRoundTrip && isSuccessSSR1
                        ? ssr1?.Response?.SpecialServices ?? []
                        : []
                    }
                    passenger={Object.fromEntries(
                      Object.entries(passengerMap).filter(
                        ([_, p]) => p.type === "Adult" || p.type === "Child"
                      )
                    ) as Record<string, any>}
                    onContinue={handleSpecialPayload}
                    onSpecialChange={handleSpecialChangeWrapper} // safe wrapper
                  />
                )}
            </div>

            {/* Sidebar */}
            <div className="w-[330px] max-lg:w-full space-y-15">
              <PricingSidebar
                isValidForm={Boolean(passengerDetails)}
                pricing={quote}
                returnPricing={quote1}
                selectedSeats={parentSelectedSeats}
                baggageTotal={selectedBaggageTotal}
                mealTotal={selectedMealTotal}
                mealPayload={mealPayload}
                specialTotal={selectedSpecialTotal}
                amount={amount} // --- CHANGED: numeric total passed
                canProceedToPayment={canProceedToPayment} // --- CHANGED: validation flag
                paymentValidationDetails={paymentValidationDetails} // optional details
                onPaymentSuccess={onPaymentSuccess}
              />
              <PromoCodeSection />
            </div>
          </div>
          {passengerDetails?.personInfo.length > 0 && (
            <Summary
              passengerDetails={passengerDetails}
              mealPayload={mealPayload}
              baggagePayload={baggagePayload}
            />
          )}
        </div>
      </div>
    </>
  );
}
