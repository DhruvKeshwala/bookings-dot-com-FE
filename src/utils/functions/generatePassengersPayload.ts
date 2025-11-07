export function generatePassengersPayload(
  personDetails: any,
  fareBreakdown: any,
  baggagePayload: any,
  mealPayload: any,
  passengerSeatSelections: any,
  specialServicesPayload: any
) {
  const fareMap = fareBreakdown.reduce((acc: any, fb: any) => {
    acc[fb.PassengerType] = {
      BaseFare: fb.BaseFare / fb.PassengerCount,
      Tax: fb.Tax / fb.PassengerCount,
      YQTax: fb.YQTax,
      AdditionalTxnFeeOfrd: fb.AdditionalTxnFeeOfrd,
      AdditionalTxnFeePub: fb.AdditionalTxnFeePub,
      PGCharge: fb.PGCharge,
    };
    return acc;
  }, {} as Record<number, any>);

  const typeToPaxType: Record<string, number> = {
    adult: 1,
    child: 2,
    infrunt: 3,
  };

  const { phoneNo, email, region } = personDetails.contactInfo;

  return personDetails.personInfo.map((person: any, index: number) => {
    const PaxType = typeToPaxType[person.type];
    const fare = fareMap[PaxType];

    const guestId = `guest-${index + 1}`;

    // Baggage collection
    const baggageSelections: any[] = [];
    if (baggagePayload && typeof baggagePayload === "object") {
      Object.values(baggagePayload).forEach((segment: any) => {
        const guestData = segment?.[guestId];
        if (guestData?.selections?.length) {
          baggageSelections.push(...guestData.selections);
        }
      });
    }

    // MealDynamic collection
    const mealSelections: any[] = [];
    if (mealPayload && typeof mealPayload === "object") {
      Object.values(mealPayload).forEach((segment: any) => {
        const guestData = segment?.[guestId];
        if (guestData?.selections?.length) {
          mealSelections.push(...guestData.selections);
        }
      });
    }

    // SeatDynamic collection
    const seatDynamic: any[] = [];
    if (
      passengerSeatSelections &&
      typeof passengerSeatSelections === "object"
    ) {
      Object.values(passengerSeatSelections).forEach(
        (segmentPassengers: any) => {
          const guestData = segmentPassengers?.[guestId];
          if (guestData?.selections?.length) {
            guestData.selections.forEach((selection: any) => {
              seatDynamic.push({
                AirlineCode: selection.AirlineCode,
                FlightNumber: selection.FlightNumber,
                CraftType: selection.CraftType,
                Origin: selection.Origin,
                Destination: selection.Destination,
                AvailablityType: selection.AvailablityType,
                Description: selection.Description,
                Code: selection.Code || "NoSeat",
                RowNo: selection.RowNo || "0",
                SeatNo: selection.SeatNo || null,
                SeatType: selection.SeatType || 0,
                SeatWayType: selection.SeatWayType || 2,
                Compartment: selection.Compartment || 0,
                Deck: selection.Deck || 0,
                Currency: selection.Currency || "INR",
                Price: selection.Price || 0,
              });
            });
          }
        }
      );
    }

    const specialServices: any[] = [];
    if (specialServicesPayload && typeof specialServicesPayload === "object") {
      const guestData = specialServicesPayload?.[guestId];
      if (guestData?.SSRService?.length) {
        specialServices.push(...guestData.SSRService);
      }
    }

    return {
      Title: person.Title,
      // FirstName: person.FirstName,
      FirstName: `${person.FirstName || ""} ${person.MiddleName || ""}`.trim(),
      LastName: person.LastName,
      PaxType,
      Gender: person.Gender === "Male" ? 1 : person.Gender === "Female" ? 2 : 1,
      Nationality: person.Nationality || "",
      PassportNo: person.passportNumber || "",
      PassportIssueDate: person.PassportIssueDate
        ? `${person.PassportIssueDate}T00:00:00`
        : "",
      PassportExpiry: person.PassportExpiry
        ? `${person.PassportExpiry}T00:00:00`
        : "",
      PassportIssueCountryCode: person.PassportIssueCountryCode,
      DateOfBirth: `${person.DateOfBirth}T00:00:00`,
      AddressLine1: "Delhi",
      City: region || "Delhi",
      CountryCode: person?.Nationality || "IN",
      CountryName: person?.CountryName || "India",
      ContactNo: phoneNo,
      Email: email,
      IsLeadPax: index === 0,
      ...(person.FFNumber
        ? {
            FFAirlineCode: person.FFAirlineCode,
            FFNumber: person.FFNumber,
          }
        : {}),
      Fare: fare,
      Baggage: baggageSelections,
      MealDynamic: mealSelections,
      SeatDynamic: seatDynamic,
      SpecialService: specialServices,
    };
  });
}
