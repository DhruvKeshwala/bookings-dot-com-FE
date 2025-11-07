import { userAtom } from "@/app/atoms/auth";
import { LOCAL_KEY } from "@/common/enums";
import Button from "@/components/ui/NewButton";
import http from "@/services/http";
import { setStorageItem } from "@/services/storage";
import { generateFlightBookingId } from "@/utils/functions";
import { toCurrency } from "@/utils/functions/to-currency";
import SignInModal from "@/views/no-auth/layout/Header/SignInModal";
import { Cashfree, load } from "@cashfreepayments/cashfree-js";
import { useAtom } from "jotai";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";


export default function PricingSidebar({
  pricing,
  returnPricing,
  onPaymentSuccess,
  isValidForm,
  selectedSeats,
  baggageTotal,
  mealTotal,
  mealPayload,
  specialTotal,
}: any) {
  const searchParams = useSearchParams();
  const [cashfree, setCashfree] = useState<Cashfree | null>(null);
  const [additionalPrice, setAdditionalPrice] = useState(0);
  const orderId = generateFlightBookingId();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user] = useAtom(userAtom);
  const [ticketold, setTicketold] = useState<any>(null);
  const [error, setError] = useState("");
  const pnr =  searchParams.get("reissue_pnr");
  const bookingId = searchParams.get("reissue_bookingId");

  // 🔹 Track login
  const isLogin = !!user?.email;

  // ------------------- Seat Price Calculation -------------------
  useEffect(() => {
    if (selectedSeats) {
      const prices: number[] = [];
      ["OutBound", "InBound"].forEach((direction) => {
        const dirData = selectedSeats[direction];
        if (!dirData) return;

        Object.values(dirData).forEach((segment: any) => {
          Object.values(segment).forEach((pax: any) => {
            pax.selections?.forEach((seat: any) => {
              prices.push(seat.Price);
            });
          });
        });
      });

      setAdditionalPrice(prices.reduce((a, b) => a + b, 0));
    }
  }, [selectedSeats]);

  // ------------------- Cashfree SDK -------------------
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const cashfreeSDK = await load({ mode: "sandbox" });
        setCashfree(cashfreeSDK);
      } catch (error) {
        console.error("Failed to initialize Cashfree SDK:", error);
      }
    };
    initializeSDK();
  }, []);

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

  // console.log("old total amount", ticketold);

  // ------------------- Fare Info -------------------
  const adult_count =
    pricing?.Response?.Results?.FareBreakdown?.[0]?.PassengerCount || 0;
  const child_count =
    pricing?.Response?.Results?.FareBreakdown?.[1]?.PassengerCount || 0;
  const infant_count =
    pricing?.Response?.Results?.FareBreakdown?.[2]?.PassengerCount || 0;
  const adult_base_fare =
    pricing?.Response?.Results?.FareBreakdown?.[0]?.BaseFare || 0;
  const child_base_fare =
    pricing?.Response?.Results?.FareBreakdown?.[1]?.BaseFare || 0;
  const infant_base_fare =
    pricing?.Response?.Results?.FareBreakdown?.[2]?.BaseFare || 0;
  const total_tax = pricing?.Response?.Results?.Fare?.Tax;
  const total_fare = pricing?.Response?.Results?.Fare?.PublishedFare || 0;

  const adult_count1 =
    returnPricing?.Response?.Results?.FareBreakdown?.[0]?.PassengerCount || 0;
  const child_count1 =
    returnPricing?.Response?.Results?.FareBreakdown?.[1]?.PassengerCount || 0;
  const infant_count1 =
    returnPricing?.Response?.Results?.FareBreakdown?.[2]?.PassengerCount || 0;
  const adult_base_fare1 =
    returnPricing?.Response?.Results?.FareBreakdown?.[0]?.BaseFare || 0;
  const child_base_fare1 =
    returnPricing?.Response?.Results?.FareBreakdown?.[1]?.BaseFare || 0;
  const infant_base_fare1 =
    returnPricing?.Response?.Results?.FareBreakdown?.[2]?.BaseFare || 0;
  const total_tax1 = returnPricing?.Response?.Results?.Fare?.Tax;
  const total_fare1 =
    returnPricing?.Response?.Results?.Fare?.PublishedFare || 0;

  // ------------------- Required Validators -------------------
  const requiredFields = pricing?.Response?.Results?.RequiredFieldValidators || {};
  const { IsMealRequired = false, IsSeatRequired = false } = requiredFields;

  // ------------------- Check Seat Selection -------------------
  const hasSelectedSeats = useMemo(() => {
    if (!selectedSeats) return false;
    return Object.values(selectedSeats).some((direction: any) =>
      Object.values(direction || {}).some((segment: any) =>
        Object.values(segment || {}).some((pax: any) =>
          Array.isArray(pax.selections) && pax.selections.length > 0
        )
      )
    );
  }, [selectedSeats]);

  // ------------------- Check Meal Selection -------------------
  const hasSelectedMeals = useMemo(() => {
    return mealPayload && Object.keys(mealPayload).length > 0;
  }, [mealPayload]);

  // ------------------- Validation Message & Button -------------------
  const validationMessage = useMemo(() => {
    if (!isLogin) return "Login required";
    if (!isValidForm) return "Passenger info required";
    if (IsSeatRequired && !hasSelectedSeats) return "Seat selection required";
    if (IsMealRequired && !hasSelectedMeals) return "Meal selection required";
    return null;
  }, [isLogin, isValidForm, IsSeatRequired, IsMealRequired, hasSelectedSeats, hasSelectedMeals]);

  // ------------------- Payment Handler -------------------
  const createOrder = async () => {
    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await http.post("/payments/create-order", {
        orderId,
        amount:
          total_fare +
          total_fare1 +
          additionalPrice +
          baggageTotal +
          mealTotal +
          Number(specialTotal),
        order_currency: "INR",
        order_note: "Flight Booking",
        customer: {
          name: user?.name || "",
          id: user?.id || "",
          email: user?.email || "",
          phone: user?.phone || "",
        },
      });

      if (data) {
        setStorageItem(LOCAL_KEY.ORDER_ID, JSON.stringify(data?.order_id));
        const checkoutOptions = {
          paymentSessionId: data?.payment_session_id,
          redirectTarget: "_modal",
        };
        (cashfree as any)?.checkout(checkoutOptions).then((result: any) => {
          if (result.error) console.log("Payment popup closed or error:", result.error);
          if (result.redirect) console.log("Payment will be redirected");
          if (result.paymentDetails) {
            // console.log("Payment complete:", result.paymentDetails.paymentMessage);
            onPaymentSuccess(data);
          }
        });
      }
    } catch (err) {
      console.error("FareQuote Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border-1 border-black/30 rounded-2xl p-6 font-[Nunito]">
      {pnr && bookingId &&(
       <div>
          <h3 className="text-xl font-extrabold text-black mb-5">
            Old Flight: {pricing?.Response?.Results?.FareRules?.[0]?.Origin ?? "--"} to{" "}
            {
              pricing?.Response?.Results?.FareRules?.[
                pricing?.Response?.Results?.FareRules?.length - 1
              ]?.Destination ?? "--"
            }
          </h3>

          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-black">
              Base Fare
            </span>
            <span className="text-base font-bold text-black">
              INR {ticketold?.fare?.PublishedFare.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-lg font-medium underline bg-gradient-to-b from-[#FF914D] to-[#F25C54] bg-clip-text text-transparent capitalize">
              Taxes & Fees
            </span>
            <span className="text-base font-bold text-black">
              INR {ticketold?.fare?.Tax.toLocaleString()}
            </span>
          </div>

           <div className="flex justify-between items-center">
            <span className="text-lg font-medium underline bg-gradient-to-b from-[#FF914D] to-[#F25C54] bg-clip-text text-transparent capitalize">
              Add-ons
            </span>
            <span className="text-base font-bold text-black">
              INR {ticketold?.fare?.TotalBaggageCharges + ticketold?.fare?.TotalMealCharges + ticketold?.fare?.TotalSeatCharges + ticketold?.fare?.TotalSpecialServiceCharges}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-black">
              Seat Selection
            </span>
            <span className="text-base font-bold text-black">
              INR {ticketold?.fare?.TotalSeatCharges.toLocaleString()}
            </span>
          </div>
           <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-black">
              Meals
            </span>
            <span className="text-base font-bold text-black">
              INR {ticketold?.fare?.TotalMealCharges.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-black">
              Extra baggage
            </span>
            <span className="text-base font-bold text-black">
              INR {ticketold?.fare?.TotalBaggageCharges.toLocaleString()}
            </span>
          </div>
           <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-black">
              Priority Check-in
            </span>
            <span className="text-base font-bold text-black">
              INR {ticketold?.fare?.TotalSpecialServiceCharges.toLocaleString()}
            </span>
          </div>

          

       </div>
      )
      }
      <div className="pb-6">
        <h3 className="text-xl font-extrabold text-black mb-5">
          {pnr && bookingId ? "New Flight: " : ""}
          {pricing?.Response?.Results?.FareRules?.[0]?.Origin ?? "--"} to{" "}
          {
            pricing?.Response?.Results?.FareRules?.[
              pricing?.Response?.Results?.FareRules?.length - 1
            ]?.Destination ?? "--"
          }
        </h3>
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-black">
              {adult_count} * Adults
            </span>
            <span className="text-base font-bold text-black">
              INR {adult_base_fare.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-black">
              {child_count} * Children
            </span>
            <span className="text-base font-bold text-black">
              INR {child_base_fare.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-black">
              {infant_count} * Infants
            </span>
            <span className="text-base font-bold text-black">
              INR {infant_base_fare.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium underline bg-gradient-to-b from-[#FF914D] to-[#F25C54] bg-clip-text text-transparent capitalize">
              Taxes & Fees
            </span>
            <span className="text-base font-bold text-black">
              INR {total_tax?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Return fare details */}
      <div className="pb-6 border-b border-primary/40">
        {returnPricing?.Response?.Results && (
          <>
            <h3 className="text-xl font-extrabold text-black mb-5">
              {returnPricing?.Response?.Results?.FareRules?.[0]?.Origin ?? "--"}{" "}
              to{" "}
              {
                returnPricing?.Response?.Results?.FareRules?.[
                  returnPricing?.Response?.Results?.FareRules?.length - 1
                ]?.Destination ?? "--"
              }
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-black">
                  {adult_count1} * Adults
                </span>
                <span className="text-base font-bold text-black">
                  INR {adult_base_fare1.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-black">
                  {child_count1} * Children
                </span>
                <span className="text-base font-bold text-black">
                  INR {child_base_fare1.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-black">
                  {infant_count1} * Infants
                </span>
                <span className="text-base font-bold text-black">
                  INR {infant_base_fare1.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium underline bg-gradient-to-b from-[#FF914D] to-[#F25C54] bg-clip-text text-transparent capitalize">
                  Taxes & Fees
                </span>
                <span className="text-base font-bold text-black">
                  INR {total_tax1?.toLocaleString()}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Promo */}
        {/* <div className="mb-3">
          <div className="text-lg font-normal text-black mb-4">
            Enter Promo Code
          </div>
          <div className="border border-primary rounded-lg p-3 flex items-center justify-between bg-white">
            <span className="text-lg font-normal text-black">Enter code</span>
            <span className="text-lg font-bold text-[#FF6F61]">Apply </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-black">
            Coupon discount
          </span>
          <span className="text-base font-bold text-black">
            INR {pricing?.couponDiscount?.toLocaleString()}
          </span>
        </div> */}
      </div>

          <div className="flex justify-between items-center">
            <span className="text-lg font-medium underline bg-gradient-to-b from-[#FF914D] to-[#F25C54] bg-clip-text text-transparent capitalize">
              Add-ons
            </span>
            <span className="text-base font-bold text-black">
              INR {additionalPrice +
              baggageTotal +
              mealTotal +
              Number(specialTotal)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-black">
              Seat Selection
            </span>
            <span className="text-base font-bold text-black">
              INR {additionalPrice.toLocaleString()}
            </span>
          </div>
           <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-black">
              Meals
            </span>
            <span className="text-base font-bold text-black">
              INR {mealTotal.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-black">
              Extra baggage
            </span>
            <span className="text-base font-bold text-black">
              INR {baggageTotal.toLocaleString()}
            </span>
          </div>
           <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-black">
              Priority Check-in
            </span>
            <span className="text-base font-bold text-black">
              INR {Number(specialTotal).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-black">
              Fare Difference
            </span>
            <span className="text-base font-bold text-black">
              INR {pricing?.Response?.Results?.Fare?.ReissueDifferenceAmount}
            </span>
          </div>
           <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-black">
              Airline Change Fee
            </span>
            <span className="text-base font-bold text-black">
              INR {pricing?.Response?.Results?.Fare?.SupplierReissueCharges}
            </span>
          </div>


      {/* Total */}
      <div className="flex justify-between items-center py-6 text-black">
        <span className="text-[16px] font-semibold">Payable Amount</span>
        <span className="text-2xl font-bold">
          {toCurrency(
            total_fare +
              total_fare1 +
              additionalPrice +
              baggageTotal +
              mealTotal +
              Number(specialTotal)
          ).replace("₹", "INR ")}
        </span>
      </div>

      {/* ------------------- Proceed Button with Validation ------------------- */}
      <Button
        isLoading={isLoading}
        onClick={createOrder}
        size="md"
        color="secondary"
        className="w-full rounded-xl text-lg font-semibold hover:opacity-90 mt-5 disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={!!validationMessage}
      >
        {validationMessage ? validationMessage : "Proceed to pay"}
      </Button>

      {isSignInModalOpen && (
        <SignInModal
          isOpen={isSignInModalOpen}
          onClose={() => setIsSignInModalOpen(false)}
          onSwitchToSignUp={() => setIsSignInModalOpen(false)}
        />
      )}
    </div>
  );
}
