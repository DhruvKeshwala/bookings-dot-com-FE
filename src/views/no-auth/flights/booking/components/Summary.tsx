"use client";

import { format } from "date-fns";
import Image from "next/image";

export default function Summary({
  passengerDetails,
  mealPayload,
  baggagePayload,
}: any) {
  const extractSelectionsByPassenger = (
    payload: any,
    type: "meal" | "baggage"
  ) => {
    const selections: Record<
      string,
      Record<string, Record<string, any[]>>
    > = {}; // { guest-1: { OutBound: { AMD-PNQ: [..] }, InBound: {..} } }

    if (!payload) return selections;

    Object.entries(payload).forEach(([direction, segments]: any) => {
      Object.entries(segments || {}).forEach(
        ([segmentKey, passengers]: any) => {
          Object.entries(passengers || {}).forEach(
            ([passengerId, passengerData]: any) => {
              if (!selections[passengerId]) selections[passengerId] = {};
              if (!selections[passengerId][direction])
                selections[passengerId][direction] = {};
              if (!selections[passengerId][direction][segmentKey])
                selections[passengerId][direction][segmentKey] = [];

              passengerData.selections?.forEach((item: any) => {
                selections[passengerId][direction][segmentKey].push(item);
              });
            }
          );
        }
      );
    });

    return selections;
  };

  const mealSelections = extractSelectionsByPassenger(mealPayload, "meal");
  const baggageSelections = extractSelectionsByPassenger(
    baggagePayload,
    "baggage"
  );

  return (
    <div className="mt-10">
      <h1 className="text-3xl font-bold font-nunito text-black mb-10">
        Summary
      </h1>

      <div className="flex flex-wrap gap-6">
        {passengerDetails?.personInfo?.map((passenger: any, index: number) => {
          const passengerId = `guest-${index + 1}`;
          const meals = mealSelections[passengerId] || {};
          const baggages = baggageSelections[passengerId] || {};

          return (
            <div
              key={index}
              className="w-full md:w-[48%] bg-white border border-black/20 rounded-xl p-6 shadow-md"
            >
              {/* Passenger Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/e4f85e9169de426498b1ca8b690bacff/cc4e7f8ad5601ecb4e69ed8d4b22347da8c1acb3"
                      alt="User"
                      className="w-6 h-6"
                    />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-black">
                      {passenger?.Title} {passenger?.FirstName}{" "}
                      {passenger?.LastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {passenger?.gender},{" "}
                      {passenger?.DateOfBirth &&
                        format(passenger?.DateOfBirth, "dd MMM yyyy")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Baggage Info */}
              <div className="space-y-3 mb-4">
                <div className="text-black font-semibold text-lg">
                  Luggage Info
                </div>
                <div className="text-base text-gray-700">
                  <Image
                    src="/icons/small_personal_item.svg"
                    width={24}
                    height={24}
                    alt="small_personal_item"
                  />
                   1 Personal Item -{" "}
                  <p>8 x 14 x 8 inches (45 x 35 x 20 cm) Fits under the seat in front of you</p>
                  <span className="text-green-600 font-semibold">Included</span>
                  <br />
                  <Image
                    src="/icons/Carryonbaggage_availabe.svg"
                    width={24}
                    height={24}
                    alt="Carry-on baggage available"
                  />
                   1 Carry-on Bag -{" "}
                  <p>22 x 14 x 9 inches (56 x 36 x 23 cm) Stored in the overhead bin</p>
                  <span className="text-green-600 font-semibold">Included</span>
                </div>
                {passenger?.checkedBag && (
                  <div className="text-base text-gray-800">
                    <Image
                      src="/icons/Checkedin_baggage_available.svg"
                      width={24}
                      height={24}
                      alt="Checked-in baggage available"
                    />
                     Checked Bag:{" "}
                    <p>62 inches (158 cm) Stored in the cargo hold</p>
                    <strong>
                      {passenger?.checkedBag.weight} - ₹
                      {passenger?.checkedBag.price.toLocaleString()}
                    </strong>
                  </div>
                )}
              </div>

              {/* Meal Selections */}
              {Object.keys(meals).length > 0 && (
                <div className="mb-4">
                  <div className="text-black font-semibold text-lg mb-1">
                    🍱 Meal Selections
                  </div>
                  {Object.entries(meals).map(
                    ([direction, segments]: any, i) => (
                      <div key={i}>
                        <div className="font-semibold text-orange-600 mt-2">
                          {direction}
                        </div>
                        {Object.entries(segments).map(
                          ([segment, items]: any, j) => (
                            <div
                              key={j}
                              className="pl-3 text-sm text-gray-700 space-y-1"
                            >
                              <div className="mt-1 font-medium">
                                ✈️ {segment}
                              </div>
                              {items.map((meal: any, idx: number) => (
                                <div key={idx} className="ml-3">
                                  🍽️{" "}
                                  {meal.AirlineDescription || meal.Code} ×{" "}
                                  {meal.Quantity}
                                </div>
                              ))}
                            </div>
                          )
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Baggage Selections */}
              {Object.keys(baggages).length > 0 && (
                <div>
                  <div className="text-black font-semibold text-lg mb-1">
                    🧳 Extra Baggage
                  </div>
                  {Object.entries(baggages).map(
                    ([direction, segments]: any, i) => (
                      <div key={i}>
                        <div className="font-semibold text-blue-600 mt-2">
                          {direction}
                        </div>
                        {Object.entries(segments).map(
                          ([segment, items]: any, j) => (
                            <div
                              key={j}
                              className="pl-3 text-sm text-gray-700 space-y-1"
                            >
                              <div className="mt-1 font-medium">
                                ✈️ {segment}
                              </div>
                              {items.map((bag: any, idx: number) => (
                                <div key={idx} className="ml-3">
                                  💼 {bag.Weight}kg – ₹
                                  {bag.Price?.toLocaleString()}
                                </div>
                              ))}
                            </div>
                          )
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
