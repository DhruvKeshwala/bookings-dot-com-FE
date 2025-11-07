"use client";
import { useState, useMemo, useRef, useEffect } from "react";

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

export interface Passenger {
  id: string;
  name: string;
  type: "Adult" | "Child";
}

interface SpecialOffersProps {
  outBoundBaggageData: TripSpecialService[];
  inBoundBaggageData?: TripSpecialService[];
  passenger: Record<string, Passenger>;
  onContinue: (payload: any) => void;
  onSpecialChange: (
    service: SpecialService,
    tripIndex: number,
    passengerId: string,
    isSelected: boolean,
    allSelections: Record<string, Record<string, Record<string, boolean>>>,
    combinedTrips: TripSpecialService[],
  ) => void;
}

export default function SpecialOffers({
  outBoundBaggageData,
  inBoundBaggageData = [],
  passenger,
  onContinue,
  onSpecialChange,
}: SpecialOffersProps) {
  const trips = [...(outBoundBaggageData || []), ...(inBoundBaggageData || [])];

  // Initialize passenger selections (booleans)
  const initializeSelections = () => {
    const data: Record<string, Record<string, Record<string, boolean>>> = {};
    trips.forEach((_, tripIndex) => {
      const tripKey = `trip-${tripIndex}`;
      data[tripKey] = {};
      Object.values(passenger)
        .filter((p) => p.type === "Adult" || p.type === "Child")
        .forEach((p) => {
          data[tripKey][p.id] = {}; // no selections initially
        });
    });
    return data;
  };

  const [activeTripIndex, setActiveTripIndex] = useState(0);
  const [activePassengerId, setActivePassengerId] = useState(
    Object.values(passenger).find((p) => p.type === "Adult" || p.type === "Child")?.id || ""
  );
  const [passengerSelections, setPassengerSelections] = useState(() => initializeSelections());

  const activeTrip = trips[activeTripIndex];

  // 👇 Track the last user change
  const lastChangeRef = useRef<{
    service: SpecialService;
    passengerId: string;
    isSelected: boolean;
  } | null>(null);

  // Derive passenger totals
  const passengerTotals = useMemo(() => {
    const totals: Record<string, number> = {};

    Object.keys(passengerSelections).forEach((tripKey) => {
      const m = tripKey.match(/^trip-(\d+)$/);
      if (!m) return;
      const tripIndex = Number(m[1]);
      const trip = trips[tripIndex];
      if (!trip) return;

      // Build price lookup for this trip
      const servicesList = (trip.SegmentSpecialService || []).flatMap((seg) => seg.SSRService || []);
      const priceByCode: Record<string, number> = {};
      servicesList.forEach((s) => {
        priceByCode[s.Code] = s.Price ?? 0;
      });

      const perTripSelections = passengerSelections[tripKey] || {};
      Object.entries(perTripSelections).forEach(([pid, selObj]) => {
        Object.keys(selObj || {}).forEach((code) => {
          const price = priceByCode[code] ?? 0;
          totals[pid] = (totals[pid] || 0) + price;
        });
      });
    });

    return totals;
  }, [passengerSelections, trips]);

  const grandTotal = useMemo(
    () => Object.values(passengerTotals).reduce((a, b) => a + b, 0),
    [passengerTotals]
  );

  // 🔥 Only notify parent AFTER user changes something
  useEffect(() => {
    if (!lastChangeRef.current) return;

    const { service, passengerId, isSelected } = lastChangeRef.current;
    lastChangeRef.current = null; // reset after using once

    const combinedTrips = [...outBoundBaggageData, ...(inBoundBaggageData || [])];

    onSpecialChange(
      service,
      activeTripIndex,
      passengerId,
      isSelected,
      passengerSelections,
      combinedTrips,
    );
  }, [passengerSelections]); // runs only when user toggles

  const handleContinue = () => {
    onContinue({
      selections: passengerSelections,
      totals: passengerTotals,
      grandTotal,
    });
  };

  const handleServiceChange = (service: SpecialService, passengerId: string) => {
    setPassengerSelections((prev) => {
      const tripKey = `trip-${activeTripIndex}`;
      const tripSel = { ...(prev[tripKey] || {}) };
      const passengerSel = { ...(tripSel[passengerId] || {}) };

      const currentlySelected = !!passengerSel[service.Code];
      if (currentlySelected) {
        delete passengerSel[service.Code];
      } else {
        passengerSel[service.Code] = true;
      }

      tripSel[passengerId] = passengerSel;

      // 👉 mark the last change
      lastChangeRef.current = {
        service,
        passengerId,
        isSelected: !currentlySelected,
      };

      return { ...prev, [tripKey]: tripSel };
    });
  };

  if (!trips.length) return null;

  // Helper: currency display fallback
  const currency =
    activeTrip?.SegmentSpecialService?.[0]?.SSRService?.[0]?.Currency ?? "INR";

  return (
    <div className="border rounded-lg p-4 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full">
            <span role="img" aria-label="baggage">🧳</span>
          </div>
          <span className="font-semibold text-lg">Add Extra Services</span>
        </div>
        <button
          className="text-sm text-gray-600 hover:text-black"
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>

      {/* Trip Tabs */}
      <div className="flex border rounded-lg overflow-hidden mt-4">
        {trips.map((trip, index) => {
          const ssr = trip.SegmentSpecialService?.[0]?.SSRService?.[0];
          const label = ssr ? `Dep > ${ssr.Origin} - ${ssr.Destination}` : `Trip ${index + 1}`;
          return (
            <button
              key={index}
              className={`flex-1 py-2 px-4 text-sm font-medium ${
                activeTripIndex === index ? "bg-red-500 text-white" : "bg-transparent text-gray-700"
              }`}
              onClick={() => setActiveTripIndex(index)}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Passenger Tabs */}
      <div className="flex mt-4 gap-2">
        {Object.values(passenger)
          .filter((p) => p.type === "Adult" || p.type === "Child")
          .map((p) => (
            <button
              key={p.id}
              className={`px-3 py-1 border rounded ${
                activePassengerId === p.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setActivePassengerId(p.id)}
            >
              {p.name}
              {passengerTotals[p.id] ? ` - ${passengerTotals[p.id]} ${currency}` : ""}
            </button>
          ))}
      </div>

      {/* SSR Options */}
      <div className="mt-4 space-y-3">
        {activeTrip?.SegmentSpecialService?.flatMap((seg, segIndex) =>
          seg.SSRService.map((service, i) => {
            const selected =
              !!passengerSelections[`trip-${activeTripIndex}`]?.[activePassengerId]?.[service.Code];
            return (
              <div
                key={`${segIndex}-${i}`}
                className={`flex items-center justify-between border p-3 rounded-md cursor-pointer hover:bg-gray-50 ${
                  selected ? "bg-blue-100" : ""
                }`}
                onClick={() => handleServiceChange(service, activePassengerId)}
              >
                <div>
                  <p className="text-sm font-medium">{service.Text}</p>
                  <p className="text-xs text-gray-500">
                    {service.Origin} → {service.Destination} | {service.AirlineCode} {service.FlightNumber}
                  </p>
                </div>
                <p className="font-semibold">{service.Currency} {service.Price}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Grand Total */}
      <div className="mt-4 text-right font-bold text-lg">
        Total: {grandTotal} {currency}
      </div>
    </div>
  );
}
