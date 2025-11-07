export function generateBookPassAPIPayload(
  personDetails: any,
  Quote: any,
  baggagePayload: any,
  mealPayload: any,
  passengerSeatSelections: any
) {
  const fareMap = Quote.FareBreakdown.reduce((acc: any, item: any) => {
    acc[item.PassengerType] = {
      Currency: item.Currency,
      BaseFare: item.BaseFare / item.PassengerCount,
      Tax: item.Tax / item.PassengerCount,
      YQTax: item.YQTax,
      AdditionalTxnFeePub: item.AdditionalTxnFeePub,
      AdditionalTxnFeeOfrd: item.AdditionalTxnFeeOfrd,
    };
    return acc;
  }, {});

  const paxTypeMap: any = {
    adult: 1,
    child: 2,
    infrunt: 3,
  };

  return personDetails.personInfo.map((person: any, index: any) => {
    const paxType = paxTypeMap[person.type];
    const fare = fareMap[paxType];

    const guestId = `guest-${index + 1}`;

    // Baggage collection
    const baggageSelections: any[] = [];
    if (baggagePayload && typeof baggagePayload === "object") {
      Object.values(baggagePayload).forEach((segment: any) => {
        const guestData = segment?.[guestId];
        if (guestData?.selections?.length) {
          baggageSelections.push(
            ...guestData.selections.map((item: any) => ({
              ...item,
              Description: String(item.Description ?? ""),
              WayType: String(item.WayType ?? ""),
            }))
          );
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

    // const seatDynamic: any[] = [];

    // if (
    //   passengerSeatSelections &&
    //   typeof passengerSeatSelections === "object"
    // ) {
    //   Object.entries(passengerSeatSelections).forEach(
    //     ([segmentKey, segmentPassengers]: any) => {
    //       const guestData = segmentPassengers?.[guestId];
    //       if (guestData?.selections?.length) {
    //         seatDynamic.push({
    //           SegmentSeat: [
    //             {
    //               RowSeats: guestData.selections.map((selection: any) => ({
    //                 Seats: [
    //                   {
    //                     AirlineCode: selection.AirlineCode,
    //                     FlightNumber: selection.FlightNumber,
    //                     CraftType: selection.CraftType,
    //                     Origin: selection.Origin,
    //                     Destination: selection.Destination,
    //                     AvailablityType: selection.AvailablityType,
    //                     Description: selection.Description,
    //                     Code: selection.Code || "NoSeat",
    //                     RowNo: selection.RowNo || "0",
    //                     SeatNo: selection.SeatNo || null,
    //                     SeatType: selection.SeatType || 0,
    //                     SeatWayType: selection.SeatWayType || 2,
    //                     Compartment: selection.Compartment || 0,
    //                     Deck: selection.Deck || 0,
    //                     Currency: selection.Currency || "INR",
    //                     Price: selection.Price || 0,
    //                   },
    //                 ],
    //               })),
    //             },
    //           ],
    //         });
    //       }
    //     }
    //   );
    // }

    return {
      Title: person.Title,
      FirstName: `${person.FirstName || ""} ${person.MiddleName || ""}`.trim(),
      LastName: person.LastName,
      PaxType: paxType,
      DateOfBirth: `${person.DateOfBirth}T00:00:00`,
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
      AddressLine1: personDetails.contactInfo.region || "Delhi",
      AddressLine2: "",
      Fare: {
        Currency: fare.Currency,
        BaseFare: fare.BaseFare,
        Tax: fare.Tax,
        YQTax: fare.YQTax,
        AdditionalTxnFeePub: fare.AdditionalTxnFeePub,
        AdditionalTxnFeeOfrd: fare.AdditionalTxnFeeOfrd,
        OtherCharges: Quote.Fare.OtherCharges,
        Discount: Quote.Fare.Discount,
        PublishedFare: Quote.Fare.PublishedFare,
        OfferedFare: Quote.Fare.OfferedFare,
        TdsOnCommission: Quote.Fare.TdsOnCommission,
        TdsOnPLB: Quote.Fare.TdsOnPLB,
        TdsOnIncentive: Quote.Fare.TdsOnIncentive,
        ServiceFee: Quote.Fare.ServiceFee,
      },
      City: personDetails.contactInfo.region,
      CountryCode: person.Nationality || "IN",
      CellCountryCode: personDetails.contactInfo?.countryCode || "+91",
      ContactNo: personDetails.contactInfo.phoneNo,
      Email: personDetails.contactInfo.email,
      IsLeadPax: index === 0,
      FFAirlineCode: person?.FFAirlineCode || null,
      FFNumber: person.flyerMembership || "",
      GSTCompanyAddress: "",
      GSTCompanyContactNumber: "",
      GSTCompanyName: "",
      GSTNumber: "",
      GSTCompanyEmail: "",
      Baggage: baggageSelections,
      MealDynamic: mealSelections,
      SeatDynamic: seatDynamic,
    };
  });
}
