"use client";

import { useState, useMemo,useEffect } from "react";
import cn from "@/utils/functions/class-name";

interface PassengerBaggage {
  id: string;
  name: string;
  selections: Record<string, number>; // baggageCode -> quantity
}

export default function BaggageSelection({
  outBoundBaggageData,
  inBoundBaggageData,
  passenger,
  onContinue,
  onBaggageChange,
}: {
  outBoundBaggageData: any;
  inBoundBaggageData: any;
  passenger: any;
  onContinue: (payload: any) => void;
  onBaggageChange?: (total: number) => void;
}) {
  const extractSegments = (baggageData: any[][], type: "Dep" | "Return") => {
    return baggageData?.map((segmentArr) => {
      const firstItem = segmentArr[0];
      return {
        id: `${type}-${firstItem.FlightNumber}-${firstItem.Origin}-${firstItem.Destination}`,
        label: `${type} > ${firstItem.Origin} - ${firstItem.Destination}`,
        origin: firstItem.Origin,
        destination: firstItem.Destination,
        flightNumber: firstItem.FlightNumber,
        baggageOptions: segmentArr,
      };
    });
  };

  const outBoundSegments = extractSegments(outBoundBaggageData, "Dep");
  const inBoundSegments = extractSegments(inBoundBaggageData, "Return");
  const allSegments = [...outBoundSegments, ...inBoundSegments];
  // console.log("allSegments", allSegments);
  const initializePassengerBaggage = (
    segments: any[],
    passengers: any
  ): Record<string, Record<string, PassengerBaggage>> => {
    const data: Record<string, Record<string, PassengerBaggage>> = {};
    for (const segment of segments) {
      data[segment.id] = {};
      for (const key in passengers) {
        data[segment.id][key] = {
          id: passengers[key].id,
          name: passengers[key].name,
          selections: {},
        };
      }
    }
    return data;
  };

  const initialBaggageState = initializePassengerBaggage(
    allSegments,
    passenger
  );

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSegment, setActiveSegment] = useState(allSegments[0]?.id);
  const [activePassenger, setActivePassenger] = useState(
    Object.keys(initialBaggageState[allSegments[0]?.id])[0]
  );
  const [passengerBaggage, setPassengerBaggage] = useState(initialBaggageState);

  const updateBaggageQuantity = (baggageCode: string, change: number) => {
    setPassengerBaggage((prev) => {
      const newState = { ...prev };
      const segmentData = { ...newState[activeSegment] };
      const passengerData = { ...segmentData[activePassenger] };
      const selections = { ...passengerData.selections };

      const currentQuantity = selections[baggageCode] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);

      if (newQuantity === 0) {
        delete selections[baggageCode];
      } else {
        selections[baggageCode] = newQuantity;
      }

      passengerData.selections = selections;
      segmentData[activePassenger] = passengerData;
      newState[activeSegment] = segmentData;

      return newState;
    });
  };

  const { total, currency } = useMemo(() => {
    let total = 0;
    let currency = "";
    Object.entries(passengerBaggage).forEach(([segmentId, segmentData]) => {
      const segment = allSegments.find((s) => s.id === segmentId);
      const options = segment?.baggageOptions || [];
      Object.values(segmentData).forEach((passenger) => {
        Object.entries(passenger.selections).forEach(([baggageCode, qty]) => {
          const bag = options.find((b) => b.Code === baggageCode);
          if (bag) {
            total += bag.Price * qty;
            currency = bag.Currency;
          }
        });
      });
    });
    return { total, currency };
  }, [passengerBaggage]);

  const getPassengerBaggageSummary = (
    passengerId: string,
    segmentId: string
  ) => {
    const passenger = passengerBaggage[segmentId]?.[passengerId];
    if (!passenger || Object.keys(passenger.selections).length === 0) {
      return "No baggage selected";
    }
    const segment = allSegments.find((s) => s.id === segmentId);
    const options = segment?.baggageOptions || [];
    return Object.entries(passenger.selections)
      .map(([code, qty]) => {
        const bag = options.find((b) => b.Code === code);
        return bag ? `${bag.Weight}kg x${qty}` : "";
      })
      .join(", ");
  };

  const handleContinue = () => {
    const finalPayload = transformPassengerBaggage(
      passengerBaggage,
      allSegments
    );
    onContinue(finalPayload);

    setIsExpanded(false);
  };

  const activeSegmentData = allSegments.find((s) => s.id === activeSegment);
  const baggageOptions = activeSegmentData?.baggageOptions || [];

  useEffect(() => {
    if (onBaggageChange) {
      onBaggageChange(total);
    }
  }, [allSegments]);

  return isExpanded ? (
    <div className="passenger-info-expanded">
      <div className="passenger-info-header expanded">
        <div className="header-content">
          <div className="icon-container">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9.5 18H8V9H9.5V18ZM12.75 18H11.25V9H12.75V18ZM16 18H14.5V9H16V18ZM17 6H15V3C15 2.45 14.55 2 14 2H10C9.45 2 9 2.45 9 3V6H7C5.9 6 5 6.9 5 8V19C5 20.1 5.9 21 7 21C7 21.55 7.45 22 8 22C8.55 22 9 21.55 9 21H15C15 21.55 15.45 22 16 22C16.55 22 17 21.55 17 21C18.1 21 19 20.1 19 19V8C19 6.9 18.1 6 17 6ZM10.5 3.5H13.5V6H10.5V3.5ZM17 19H7V8H17V19Z"
                fill="#014569"
              />
            </svg>
          </div>
          <span className="header-title">Add Extra Baggage</span>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="collapse-button"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M8 12L16 20L24 12"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="passenger-info-content" style={{ gap: "18px" }}>
        {/* Segment Tabs */}
        <div className="meal-selection-segments mt-2">
          {allSegments.map((segment) => (
            <button
              key={segment.id}
              className={`meal-selection-segment-tab ${
                activeSegment === segment.id
                  ? "meal-selection-segment-active"
                  : ""
              }`}
              onClick={() => {
                const segmentId = segment?.id;
                const passengerData = passengerBaggage?.[segmentId];
                const firstPassengerId = passengerData
                  ? Object.keys(passengerData)[0]
                  : null;

                setActiveSegment(segmentId);
                if (firstPassengerId) {
                  setActivePassenger(firstPassengerId);
                }
              }}
            >
              <div className="meal-selection-segment-label">
                {segment?.label}
              </div>
            </button>
          ))}
        </div>

        {/* Passenger Tabs */}
        <div className="meal-selection-passengers flex">
          {passengerBaggage[activeSegment] &&
            Object.values(passengerBaggage[activeSegment])?.map((p) => (
              <button
                key={p.id}
                className={`meal-selection-passenger-tab ${
                  activePassenger === p.id
                    ? "meal-selection-passenger-active"
                    : ""
                }`}
                onClick={() => setActivePassenger(p.id)}
              >
                <div className="meal-selection-passenger-name">{p.name}</div>
                <div className="meal-selection-passenger-summary">
                  {getPassengerBaggageSummary(p.id, activeSegment)}
                </div>
              </button>
            ))}
        </div>

        {/* Baggage Options */}
        <div className="meal-selection-options">
          {baggageOptions.map((bag) => {
            const qty =
              passengerBaggage[activeSegment]?.[activePassenger]?.selections[
                bag.Code
              ] || 0;
            return (
              <div key={bag.Code} className="meal-selection-option">
                <div className="meal-selection-option-content">
                  <div className="meal-selection-option-info">
                    <h4 className="meal-selection-option-name">
                      {bag.Weight} kg Extra baggage
                    </h4>
                    {bag.Text}
                  </div>
                  <div className="meal-selection-option-controls">
                    <span className="meal-selection-option-price">
                      ₹ {bag.Price}
                    </span>
                    {/* {qty > 0 ? ( */}
                    <div className="meal-selection-quantity-controls">
                      <button
                        onClick={() => updateBaggageQuantity(bag.Code, -1)}
                        disabled={qty === 0}
                      >
                        −
                      </button>
                      <span>{qty}</span>
                      <button
                        onClick={() => updateBaggageQuantity(bag.Code, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Footer */}
        <div className="meal-selection-footer">
          <div className="meal-selection-total">
            <span>
              Total: {currency} {total}
            </span>
          </div>

          <div className="meal-selection-actions">
            <button
              className="meal-selection-back-btn"
              onClick={() => setIsExpanded(false)}
            >
              Back
            </button>
            <button
              className="meal-selection-continue-btn"
              onClick={handleContinue}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="passenger-info-collapsed">
      <button
        onClick={() => setIsExpanded(true)}
        className="passenger-info-header"
      >
        <div className="header-content">
          <div className="icon-container">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9.5 18H8V9H9.5V18ZM12.75 18H11.25V9H12.75V18ZM16 18H14.5V9H16V18ZM17 6H15V3C15 2.45 14.55 2 14 2H10C9.45 2 9 2.45 9 3V6H7C5.9 6 5 6.9 5 8V19C5 20.1 5.9 21 7 21C7 21.55 7.45 22 8 22C8.55 22 9 21.55 9 21H15C15 21.55 15.45 22 16 22C16.55 22 17 21.55 17 21C18.1 21 19 20.1 19 19V8C19 6.9 18.1 6 17 6ZM10.5 3.5H13.5V6H10.5V3.5ZM17 19H7V8H17V19Z"
                fill="#014569"
              />
            </svg>
          </div>
          <span className="header-title">Add Extra Baggage</span>
        </div>
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          className="expand-icon"
        >
          <path
            d="M8 20L16 12L24 20"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

// 🔁 Convert selections from count to repeated full baggage object
// function transformPassengerBaggage(
//   passengerBaggage: Record<string, Record<string, PassengerBaggage>>,
//   allSegments: any[]
// ) {
//   const transformed: any = {};

//   Object.entries(passengerBaggage).forEach(([segmentId, segmentPassengers]) => {
//     const segment = allSegments.find((s) => s.id === segmentId);
//     const baggageOptions = segment?.baggageOptions || [];

//     transformed[segmentId] = {};

//     Object.entries(segmentPassengers).forEach(([passengerId, passenger]) => {
//       const fullSelections: any = [];

//       Object.entries(passenger.selections).forEach(
//         ([baggageCode, quantity]) => {
//           const baggage = baggageOptions.find(
//             (b: any) => b.Code === baggageCode
//           );
//           if (baggage) {
//             for (let i = 0; i < quantity; i++) {
//               fullSelections.push({ ...baggage });
//             }
//           }
//         }
//       );

//       transformed[segmentId][passengerId] = {
//         id: passenger.id,
//         name: passenger.name,
//         selections: fullSelections,
//       };
//     });
//   });

//   return transformed;
// }

function transformPassengerBaggage(
  passengerBaggage: Record<string, Record<string, PassengerBaggage>>,
  allSegments: any[]
) {
  const transformed: any = {
    OutBound: {},
    InBound: {},
  };

  Object.entries(passengerBaggage).forEach(([segmentId, segmentPassengers]) => {
    const segment = allSegments.find((s) => s.id === segmentId);
    if (!segment) return;

    const direction = segment.id.startsWith("Dep") ? "OutBound" : "InBound";
    const routeKey = `${segment.origin}-${segment.destination}`;
    const baggageOptions = segment.baggageOptions || [];

    if (!transformed[direction][routeKey]) {
      transformed[direction][routeKey] = {};
    }

    Object.entries(segmentPassengers).forEach(([passengerId, passenger]) => {
      const fullSelections: any[] = [];

      Object.entries(passenger.selections).forEach(
        ([baggageCode, quantity]) => {
          const baggage = baggageOptions.find(
            (b: any) => b.Code === baggageCode
          );
          if (baggage) {
            for (let i = 0; i < quantity; i++) {
              fullSelections.push({ ...baggage });
            }
          }
        }
      );

      transformed[direction][routeKey][passengerId] = {
        id: passenger.id,
        name: passenger.name,
        selections: fullSelections,
      };
    });
  });

  return transformed;
}
