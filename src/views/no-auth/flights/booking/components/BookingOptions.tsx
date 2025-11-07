import PassengerInformation from "./PassengerInformation";

export default function BookingOptions({
  fareQuote,
  passengerCount,
  setPassengerDetails,
}: Readonly<{
  fareQuote: any;
  passengerCount: any;
  setPassengerDetails: (submitData: any) => void;
}>) {
  return (
    <div className="space-y-10">
      {/* Auto-Fill Toggle */}
      {/* <div className="bg-white border-2 border-black/30 rounded-lg p-4 flex items-center justify-between max-lg:flex-col max-lg:gap-4">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-highlight rounded-full flex items-center justify-center">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/e4f85e9169de426498b1ca8b690bacff/979f21db3d7190547add6f0f8e217ccf8d1c9fae?placeholderIfAbsent=true"
              alt="Auto-fill"
              className="w-6 h-6"
            />
          </div>
          <span className="header-title">
            Save your details to use auto-fill
          </span>
        </div>

        <Switch checked onChange={() => {}} />
      </div> */}

      {/* Passenger Information */}
      <PassengerInformation
        fareQuote={fareQuote}
        passengerCount={passengerCount}
        setPassengerDetails={setPassengerDetails}
      />
    </div>
  );
}
