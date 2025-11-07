"use client";

import Image from "next/image";
import { useState, useMemo ,useEffect} from "react";

export default function MealSelection({
  mealDataOutBound,
  mealDataInBound,
  flightSegmentOutBound,
  flightSegmentInBound,
  passengerDataOutBound,
  passengerDataInBound,
  onContinue,
  onMealChange
}: Readonly<{
  mealDataOutBound: any[];
  mealDataInBound: any[];
  flightSegmentOutBound: any[];
  flightSegmentInBound: any[];
  passengerDataOutBound: any;
  passengerDataInBound: any;
  onContinue: (payload: any) => void;
  onMealChange?: (total: number) => void;
}>) {

  const tabDataMap = useMemo(() => {
    const getSegmentMeals = (segmentId: string, data: any[]) => {
      if (!segmentId || !Array.isArray(data)) return [];

      const isFlatMealList =
        data.length > 0 &&
        !("Origin" in data[0]) &&
        !("Destination" in data[0]);

      if (isFlatMealList) {
        return data.map((meal) => ({
          Code: meal.Code,
          Description: meal.Description,
          AirlineDescription: meal.AirlineDescription ?? meal.Description,
          Price: meal.Price ?? 0,
          Currency: meal.Currency ?? "INR",
        }));
      }

      const [origin, destination] = segmentId.split("-");
      const filtered = data.filter(
        (meal) => meal.Origin === origin && meal.Destination === destination
      );
      if (!data.length || !filtered.length) {
        return [
          {
            id: "no-meal",
            Origin: origin,
            Destination: destination,
            name: "No meals available",
          },
        ];
      }
      return filtered.length > 0 ? filtered : data;
    };

    const outboundTabs = (flightSegmentOutBound || []).map((segment) => ({
      ...segment,
      direction: "outbound",
      meals: getSegmentMeals(segment?.id, mealDataOutBound || []),
    }));

    const inboundTabs = (flightSegmentInBound || []).map((segment) => ({
      ...segment,
      direction: "inbound",
      meals: getSegmentMeals(segment.id, mealDataInBound || []),
    }));
    return [...outboundTabs, ...inboundTabs];
  }, [
    flightSegmentOutBound,
    flightSegmentInBound,
    mealDataOutBound,
    mealDataInBound,
  ]);

  const mergedPassengerData = useMemo(() => {
    return {
      ...passengerDataOutBound,
      ...passengerDataInBound,
    };
  }, [passengerDataOutBound, passengerDataInBound]);

  const defaultSegmentId = tabDataMap?.[0]?.id ?? "";
  const defaultPassengerId = mergedPassengerData?.[defaultSegmentId]
    ? Object.keys(mergedPassengerData[defaultSegmentId])[0]
    : "";

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSegment, setActiveSegment] = useState<string>(defaultSegmentId);
  const [activePassenger, setActivePassenger] = useState(defaultPassengerId);
  const [passengerMeals, setPassengerMeals] = useState(mergedPassengerData);

  const currentTab = tabDataMap.find((tab) => tab.id === activeSegment);

  const normalizedMeals = useMemo(() => {
    if (!currentTab) return [];
    const meals = currentTab.meals;
    return meals?.map((meal: any) => ({
      Code: meal?.Code,
      Description: meal?.Description,
      AirlineDescription: meal?.AirlineDescription,
      Price: meal?.Price,
      Currency: meal?.Currency,
    }));
  }, [currentTab]);

  const { total, currency, inboundTotal, outboundTotal } = useMemo(() => {
    let total = 0;
    let inboundTotal = 0;
    let outboundTotal = 0;
    let currency = "INR";

    Object.entries(passengerMeals).forEach(([segmentId, segmentData]) => {
      const direction =
        tabDataMap.find((t) => t.id === segmentId)?.direction || "outbound";

      Object.values(segmentData as any)?.forEach((passenger: any) => {
        Object.entries(passenger.selections).forEach(([mealCode, qty]: any) => {
          const meal =
            tabDataMap
              .find((t) => t.id === segmentId)
              ?.meals?.find((m: any) => m.Code === mealCode) ?? null;

          if (meal) {
            const price = meal.Price ?? 0;
            const segmentCurrency = meal.Currency ?? "INR";
            total += price * qty;
            if (direction === "inbound") inboundTotal += price * qty;
            else outboundTotal += price * qty;
            currency = segmentCurrency;
          }
        });
      });
    });

    return { total, currency, inboundTotal, outboundTotal };
  }, [passengerMeals, tabDataMap]);

  const updateMealQuantity = (mealCode: string, delta: number) => {
    setPassengerMeals((prev: any) => {
      const prevSegment = prev[activeSegment] || {};
      if (!prevSegment[activePassenger]) return prev;

      const prevPassenger = prevSegment[activePassenger];
      const prevSelections = prevPassenger.selections || {};
      const currentQty = prevSelections[mealCode] ?? 0;
      const newQty = Math.max(0, currentQty + delta);

      const updatedSelections = { ...prevSelections };
      if (newQty === 0) {
        delete updatedSelections[mealCode];
      } else {
        updatedSelections[mealCode] = newQty;
      }

      const updatedPassenger = {
        ...prevPassenger,
        selections: updatedSelections,
      };

      const updatedSegment = {
        ...prevSegment,
        [activePassenger]: updatedPassenger,
      };

      return {
        ...prev,
        [activeSegment]: updatedSegment,
      };
    });
  };

  const getPassengerMealSummary = (passengerId: string) => {
    const passenger = passengerMeals[activeSegment]?.[passengerId];
    if (!passenger || !Object.keys(passenger.selections).length)
      return "No meal selected";

    return (
      Object.entries(passenger.selections)
        .filter(([_, qty]: any) => qty > 0)
        .map(([mealCode, qty]) => {
          const meal = normalizedMeals.find((m: any) => m.Code === mealCode);
          const name =
            meal?.AirlineDescription || meal?.Description || mealCode;
          return `${name} x ${qty}`;
        })
        .filter(Boolean)
        .join(", ") || "No meal selected"
    );
  };

  const handleContinue = () => {
    const detailedPassengerMeals = expandPassengerMeals(
      passengerMeals,
      tabDataMap
    );
    onContinue(detailedPassengerMeals);

    setIsExpanded(false);
  };

  useEffect(() => {
    if (onMealChange) {
      onMealChange(total);
    }
  }, [total]);

  return isExpanded ? (
    <div className="passenger-info-expanded">
      <div className="passenger-info-header expanded">
        <div className="header-content">
          <div className="icon-container">
            <Image
              src="https://cdn.builder.io/api/v1/image/assets/e4f85e9169de426498b1ca8b690bacff/7d01e42ba425d2e9650e961363b1715424c48357?placeholderIfAbsent=true"
              alt="Meal"
              className="p-2 w-12 h-12"
              width={100}
              height={100}
            />
          </div>
          <span className="header-title">Add Meal</span>
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
          {tabDataMap.map((tab) => (
            <button
              key={tab.id}
              className={`meal-selection-segment-tab ${
                activeSegment === tab.id ? "meal-selection-segment-active" : ""
              }`}
              onClick={() => {
                setActiveSegment(tab.id);
                const firstPassenger = Object.keys(
                  mergedPassengerData?.[tab.id] ?? {}
                )[0];
                if (firstPassenger) {
                  setActivePassenger(firstPassenger);
                }
              }}
            >
              <div className="meal-selection-segment-label">
                {tab.label.split(" — ").map((p: string, i: number) => (
                  <span key={i}>{p}</span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Passenger Tabs */}
        <div className="meal-selection-passengers flex">
          {Object.values(passengerMeals[activeSegment] ?? {}).map(
            (passenger: any) => (
              <button
                key={passenger.id}
                className={`meal-selection-passenger-tab ${
                  activePassenger === passenger.id
                    ? "meal-selection-passenger-active"
                    : ""
                }`}
                onClick={() => setActivePassenger(passenger.id)}
              >
                <div className="meal-selection-passenger-name">
                  {passenger.name}
                </div>
                <div className="meal-selection-passenger-summary">
                  {getPassengerMealSummary(passenger.id)}
                </div>
              </button>
            )
          )}
        </div>

        {/* Meal Cards */}
        <div className="meal-selection-options">
          {normalizedMeals?.map((meal: any) => {
            const qty =
              passengerMeals[activeSegment]?.[activePassenger]?.selections?.[
                meal.Code
              ] ?? 0;
            return (
              <div key={meal.Code} className="meal-selection-option">
                <Image
                  src="https://cdn.builder.io/api/v1/image/assets/e4f85e9169de426498b1ca8b690bacff/c505f1d3c4209a408f4486e286d8ab03e874f474?placeholderIfAbsent=true"
                  alt={meal.AirlineDescription || meal.Description || meal.Code}
                  width={120}
                  height={100}
                  className="w-[120px] h-[100px]"
                />
                <div className="meal-selection-option-content">
                  <div className="meal-selection-option-info">
                    <h4 className="meal-selection-option-name">
                      {meal.AirlineDescription || meal.Description}
                    </h4>
                  </div>
                  <div className="meal-selection-option-controls">
                    <span className="meal-selection-option-price">
                      {meal.Price > 0
                        ? `${meal.Currency} ${meal.Price}`
                        : "Included"}
                    </span>
                    {qty > 0 ? (
                      <div className="meal-selection-quantity-controls">
                        <button
                          onClick={() => updateMealQuantity(meal.Code, -1)}
                        >
                          −
                        </button>
                        <span>{qty}</span>
                        <button
                          onClick={() => updateMealQuantity(meal.Code, 1)}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => updateMealQuantity(meal.Code, 1)}>
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="meal-selection-footer">
          <div className="meal-selection-total">
            <span>Total :</span>
            <span>
              {currency} {total}
            </span>
          </div>
          <div className="meal-selection-breakdown text-sm text-gray-600">
            <span>
              Inbound: {currency} {inboundTotal}
            </span>{" "}
            &nbsp;|&nbsp;
            <span>
              Outbound: {currency} {outboundTotal}
            </span>
          </div>
          <div className="meal-selection-actions">
            <button className="meal-selection-back-btn">Back</button>
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
            <Image
              src="https://cdn.builder.io/api/v1/image/assets/e4f85e9169de426498b1ca8b690bacff/7d01e42ba425d2e9650e961363b1715424c48357?placeholderIfAbsent=true"
              alt="Meal"
              className="p-2 w-12 h-12"
              width={100}
              height={100}
            />
          </div>
          <span className="header-title">Add Meal</span>
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

function expandPassengerMeals(passengerMeals: any, tabDataMap: any[]) {
  const result: Record<"InBound" | "OutBound", Record<string, any>> = {
    InBound: {},
    OutBound: {},
  };

  for (const segmentId of Object.keys(passengerMeals)) {
    const segmentData = passengerMeals[segmentId];
    const tab = tabDataMap.find((t) => t.id === segmentId);
    const direction = tab?.direction === "inbound" ? "InBound" : "OutBound";
    const meals = tab?.meals || [];

    if (!result[direction][segmentId]) {
      result[direction][segmentId] = {};
    }

    for (const passengerId of Object.keys(segmentData)) {
      const passenger = segmentData[passengerId];
      const selections = passenger.selections || {};

      const detailedSelections: any[] = [];

      for (const [mealCode, qty] of Object.entries(
        selections as Record<string, number>
      )) {
        const mealMeta = meals.find((m: any) => m.Code === mealCode);
        if (!mealMeta) continue;

        for (let i = 0; i < qty; i++) {
          detailedSelections.push({
            ...mealMeta,
            Quantity: 1,
          });
        }
      }

      result[direction][segmentId][passengerId] = {
        ...passenger,
        selections: detailedSelections,
      };
    }
  }

  return result;
}
