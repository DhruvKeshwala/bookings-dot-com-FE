"use client";

import { useEffect, useMemo, useState } from "react";

const AVAILABILITY = {
  NotSet: 0,
  Open: 1,
  Reserved: 3,
  Blocked: 4,
  NoSeat: 5,
};

const getSeatType = (
  availability: number
): "available" | "unavailable" | "selected" | "selectedByOther" => {
  if (availability === AVAILABILITY.Open) return "available";
  if ([AVAILABILITY.Reserved, AVAILABILITY.Blocked].includes(availability))
    return "unavailable";
  return "unavailable";
};

export default function SeatSelection({
  outBoundSSR,
  inBoundSSR,
  passenger,
  onSeatChange,
  onContinue,
}: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [activePassenger, setActivePassenger] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    setIsClient(true);
    const passengers = Object.keys(passenger || {});
    if (passengers.length > 0) {
      setActivePassenger(passengers[0]);
    }
  }, [passenger]);

  //  Flatten journeys dynamically
  const journeys = useMemo(() => {
    const all: any[] = [];

    const processSSR = (ssr: any, direction: "OutBound" | "InBound") => {
      ssr?.forEach((dyn: any, dynIdx: number) => {
        dyn.SegmentSeat?.forEach((seg: any, segIdx: number) => {
          const origin = seg?.RowSeats?.[0]?.Seats?.[0]?.Origin ?? "?";
          const destination = seg?.RowSeats?.[0]?.Seats?.[0]?.Destination ?? "?";

          all.push({
            key: `${direction}-${dynIdx}-${segIdx}`,
            direction,
            index: segIdx,
            origin,
            destination,
            rows: seg?.RowSeats || [],
          });
        });
      });
    };

    processSSR(outBoundSSR, "OutBound");
    processSSR(inBoundSSR, "InBound");

    return all;
  }, [outBoundSSR, inBoundSSR]);

  //  Handle seat click
  const handleSeatClick = (seatCode: string, seat: any, journeyKey: string) => {
    if (!activePassenger) return;

    const key = `${journeyKey}-${seatCode}`;
    const newSelected = { ...selectedSeats };

    // remove previous selection for this passenger in same journey
    for (const [code, value] of Object.entries(newSelected)) {
      const parsed = JSON.parse(value);
      if (parsed.passenger === activePassenger && parsed.journeyKey === journeyKey) {
        delete newSelected[code];
        break;
      }
    }

    newSelected[key] = JSON.stringify({
      passenger: activePassenger,
      journeyKey,
    });

    setSelectedSeats(newSelected);
  };

  //  Passenger selections summary
  const passengerSeatSelections = useMemo(() => {
    const result: Record<
      "OutBound" | "InBound",
      Record<string, Record<string, any>>
    > = {
      OutBound: {},
      InBound: {},
    };

    Object.entries(selectedSeats).forEach(([seatCode, data]) => {
      const { passenger: pid, journeyKey } = JSON.parse(data);
      const [direction] = journeyKey.split("-") as ["OutBound" | "InBound"];

      const journey = journeys.find((j) => j.key === journeyKey);
      if (!journey) return;

      const seat = journey.rows
        ?.flatMap((row: any) => row.Seats)
        .find((s: any) => `${journeyKey}-${s.Code}` === seatCode);

      if (!seat) return;

      const segmentKey = `${journey.origin}-${journey.destination}`;

      if (!result[direction][segmentKey]) {
        result[direction][segmentKey] = {};
      }

      if (!result[direction][segmentKey][pid]) {
        result[direction][segmentKey][pid] = {
          id: pid,
          name: passenger[pid]?.name,
          selections: [],
        };
      }

      result[direction][segmentKey][pid].selections.push(seat);
    });

    return result;
  }, [selectedSeats, journeys, passenger]);

  useEffect(() => {
    if (onSeatChange) onSeatChange(passengerSeatSelections);
  }, [selectedSeats]);

  //  Total price
const totalPrice = useMemo(() => {
  let total = 0;
  // console.log("selected seat", selectedSeats);

  Object.entries(selectedSeats).forEach(([seatKey]) => {
    // Example: "OutBound-1-0-1E"
    const parts = seatKey.split("-");
    const journeyKey = parts.slice(0, -1).join("-"); // "OutBound-1-0"
    const code = parts[parts.length - 1];            // "1E"

    const journey = journeys.find((j) => j.key === journeyKey);
    if (!journey) return;
    console.log("journey", journey);

    // Find seat by Code (like "1E")
    const seat = journey.rows
      ?.flatMap((r: any) => r.Seats)
      .find((s: any) => s.Code === code);

    console.log("seat", seat);

    if (seat?.Price) {
      total += Number(seat.Price); // make sure it's numeric
    }
  });

  return total;
}, [selectedSeats, journeys]);



  //  Build seat map
  const buildSeatMap = (rows: any[], journeyKey: string) => {
    const map: Record<string, { seat: any; status: string }[]> = {};

    rows.forEach((row: any) => {
      row.Seats.forEach((seat: any) => {
        const { Code, RowNo, AvailablityType, SeatNo } = seat;
        if (!RowNo || Code === "NoSeat" || !SeatNo) return;

        const seatType = getSeatType(AvailablityType);
        const key = `${journeyKey}-${Code}`;
        const data = selectedSeats[key];
        const parsed = data ? JSON.parse(data) : null;

        const isSelectedByCurrent =
          parsed && parsed.passenger === activePassenger && parsed.journeyKey === journeyKey;
        const isSelectedByOther =
          parsed && parsed.passenger !== activePassenger && parsed.journeyKey === journeyKey;

        if (!map[RowNo]) map[RowNo] = [];

        map[RowNo].push({
          seat,
          status: isSelectedByCurrent
            ? "selected"
            : isSelectedByOther
            ? "selectedByOther"
            : seatType,
        });
      });
    });

    return map;
  };

  // Render seats
  const renderSeats = (rows: any[], journeyKey: string) => {
    const seatMapByRow = buildSeatMap(rows, journeyKey);
    const rowNumbers = Object.keys(seatMapByRow).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );

    return rowNumbers.map((rowNo) => (
      <div key={rowNo} className="flex items-center mb-2">
        {seatMapByRow[rowNo]?.map(({ seat: s, status }) => (
          <button
            key={s.Code}
            onClick={() => handleSeatClick(s.Code, s, journeyKey)}
            disabled={status === "unavailable"}
            className={`w-12 h-12 rounded-md border flex items-center justify-center
              ${
                status === "selected"
                  ? "bg-green-500 text-white"
                  : status === "selectedByOther"
                  ? "bg-yellow-400 text-white"
                  : status === "available"
                  ? "bg-white hover:bg-gray-400 border-gray-300"
                  : "bg-gray-400 cursor-not-allowed text-white"
              }`}
          >
            {s.SeatNo}
          </button>
        ))}
      </div>
    ));
  };

  const handleContinue = () => {
    onContinue(passengerSeatSelections);
    setIsExpanded(false);
  };

  if (!isClient) return <div>Loading...</div>;

  return isExpanded ? (
    <div className="passenger-info-expanded">
      {/* Header */}
      <div className="passenger-info-header expanded">
        <div className="header-content">
          <div className="icon-container">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5.9C12.2758 5.9 12.5489 5.95432 12.8036 6.05985C13.0584 6.16539 13.2899 6.32007 13.4849 6.51508C13.6799 6.71008 13.8346 6.94158 13.9401 7.19636C14.0457 7.45115 14.1 7.72422 14.1 8C14.1 8.27578 14.0457 8.54885 13.9401 8.80364C13.8346 9.05842 13.6799 9.28992 13.4849 9.48492C13.2899 9.67993 13.0584 9.83461 12.8036 9.94015C12.5489 10.0457 12.2758 10.1 12 10.1C11.443 10.1 10.9089 9.87875 10.5151 9.48492C10.1212 9.0911 9.9 8.55695 9.9 8C9.9 7.44305 10.1212 6.9089 10.5151 6.51508C10.9089 6.12125 11.443 5.9 12 5.9ZM12 14.9C14.97 14.9 18.1 16.36 18.1 17V18.1H5.9V17C5.9 16.36 9.03 14.9 12 14.9ZM12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4ZM12 13C9.33 13 4 14.34 4 17V20H20V17C20 14.34 14.67 13 12 13Z"
                fill="#014569"
              />
            </svg>
          </div>
          <span className="header-title">Choose Your Seat</span>
        </div>
        <button onClick={() => setIsExpanded(false)} className="collapse-button">
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

      <div className="passenger-info-content">
        {/* Passenger Tabs */}
        <div className="meal-selection-passengers flex flex-wrap gap-4 mb-4">
          {Object.keys(passenger).map((p) => (
            <button
              key={p}
              className={`meal-selection-passenger-tab ${
                p === activePassenger ? "meal-selection-passenger-active" : ""
              }`}
              onClick={() => setActivePassenger(p)}
            >
              <div className="meal-selection-passenger-name">
                {passenger[p].name}
              </div>
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="seat-selection-legend flex gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white border border-gray-400"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-400"></div>
            <span>Unavailable</span>
          </div>
        </div>

        {/* Journeys */}
        {journeys.map((j) => (
          <div key={j.key} className="mb-8">
            <h3 className="font-semibold mb-2">
              {j.direction} – {j.origin} → {j.destination}
            </h3>
            <div className="flex flex-col items-center">{renderSeats(j.rows, j.key)}</div>
          </div>
        ))}

        {/* Summary */}
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h4 className="font-semibold mb-2">Selected Seats</h4>
          {Object.entries(passengerSeatSelections).map(([dir, segments]) => (
            <div key={dir} className="mb-3">
              <p className="font-medium">{dir}</p>
              {Object.entries(segments).map(([seg, pax]) => (
                <div key={seg} className="ml-4">
                  <p className="italic">{seg}</p>
                  {Object.values(pax).map((p: any) => (
                    <p key={p.id} className="ml-6">
                      {p.name}: {p.selections.map((s: any) => s.SeatNo).join(", ")}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="meal-selection-footer mt-4">
          <div className="meal-selection-total">
            <span>Total Price: ₹{totalPrice}</span>
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
                d="M12 5.9C12.2758 5.9 12.5489 5.95432 12.8036 6.05985C13.0584 6.16539 13.2899 6.32007 13.4849 6.51508C13.6799 6.71008 13.8346 6.94158 13.9401 7.19636C14.0457 7.45115 14.1 7.72422 14.1 8C14.1 8.27578 14.0457 8.54885 13.9401 8.80364C13.8346 9.05842 13.6799 9.28992 13.4849 9.48492C13.2899 9.67993 13.0584 9.83461 12.8036 9.94015C12.5489 10.0457 12.2758 10.1 12 10.1C11.443 10.1 10.9089 9.87875 10.5151 9.48492C10.1212 9.0911 9.9 8.55695 9.9 8C9.9 7.44305 10.1212 6.9089 10.5151 6.51508C10.9089 6.12125 11.443 5.9 12 5.9ZM12 14.9C14.97 14.9 18.1 16.36 18.1 17V18.1H5.9V17C5.9 16.36 9.03 14.9 12 14.9ZM12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4ZM12 13C9.33 13 4 14.34 4 17V20H20V17C20 14.34 14.67 13 12 13Z"
                fill="#014569"
              />
            </svg>
          </div>
          <span className="header-title">Choose Your Seat</span>
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
