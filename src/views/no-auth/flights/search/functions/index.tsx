import { FlightData } from "@/common/types/flight-data.types";
import { differenceInMinutes, parseISO } from "date-fns";

// export const getFlightTotalDuration = (group: any[]) => {
//   const segments = group?.[0]?.Segments?.[0];
//   const firstSegment = segments?.[0];
//   const lastSegment = segments?.[segments.length - 1];

//   const depTime = firstSegment?.Origin?.DepTime;
//   const arrTime = lastSegment?.Destination?.ArrTime;

//   if (!depTime || !arrTime) return Infinity;

//   return differenceInMinutes(new Date(arrTime), new Date(depTime));
// };

export const getFlightTotalDuration = (group: any[]) => {
  const segments = group?.[0]?.Segments ?? [];

  if (!segments.length) return Infinity;

  let totalAccumulated = 0;
  let totalDuration = 0;
  let hasAccumulated = false;
  let hasDuration = false;

  for (const segment of segments) {
    if (!Array.isArray(segment) || !segment.length) continue;

    for (const leg of segment) {
      if (leg?.AccumulatedDuration && leg.AccumulatedDuration > 0) {
        totalAccumulated += leg.AccumulatedDuration;
        hasAccumulated = true;
      } else if (leg?.Duration && leg.Duration > 0) {
        totalDuration += leg.Duration;
        hasDuration = true;
      }
    }
  }

  // ✅ Prefer AccumulatedDuration if any present
  if (hasAccumulated) return totalAccumulated;

  // ✅ Otherwise use summed Duration
  if (hasDuration) return totalDuration;

  // ✅ Fallback: use DepTime → ArrTime calculation
  let fallbackTotal = 0;
  for (const segment of segments) {
    if (!Array.isArray(segment) || !segment.length) continue;
    const firstLeg = segment[0];
    const lastLeg = segment[segment.length - 1];
    const depTime = firstLeg?.Origin?.DepTime;
    const arrTime = lastLeg?.Destination?.ArrTime;

    if (depTime && arrTime) {
      fallbackTotal += differenceInMinutes(new Date(arrTime), new Date(depTime));
    } else {
      return Infinity;
    }
  }

  return fallbackTotal || Infinity;
};

// Short array with fare and duration for best Overall
export const bestOverall = (cloned: Array<any>) => {
  // Map to array with fare and duration
  const scored: any = cloned.map((item, index) => {
    const fare = item?.[0]?.Fare?.PublishedFare ?? Infinity;
    const duration = getFlightTotalDuration(item);
    return { index, fare, duration };
  });

  // Rank by fare
  const fareRanks: any = [...scored].sort((a, b) => a.fare - b.fare);
  fareRanks.forEach((item: any, rank: number) => {
    scored[item.index].fareRank = rank;
  });

  // Rank by duration
  const durationRanks = [...scored].sort((a, b) => a.duration - b.duration);
  durationRanks.forEach((item, rank) => {
    scored[item.index].durationRank = rank;
  });

  // Add total rank
  scored.forEach((item: any) => {
    item.totalScore = item.fareRank + item.durationRank;
  });

  // Sort by total score
  const sorted = [...scored].sort((a, b) => a.totalScore - b.totalScore);

  // Return flights in sorted order
  return sorted.map((item) => cloned[item.index]);
};

// get unique airline list
export const getAllAirlines = (data: Array<any>) => {
  return Array.from(
    new Set(
      data.flatMap((group) =>
        group.flatMap((item: any) =>
          item.Segments.flatMap((segmentGroup: any) =>
            segmentGroup.map((segment: any) => segment.Airline.AirlineName)
          )
        )
      )
    )
  ).sort();
};

const getStopLabel = (length: number) => {
  if (length === 1) return "Direct";
  if (length === 2) return "1 Stop";
  return "2 Stop +";
};

/**
 * Get the maximum flight duration (in hours) from a list of flight data.
 */
export const getMaxDurationInHours = (data: any[]): number => {
  let maxDuration = 0;

  for (const group of data) {
    const segmentsGroups = group?.[0]?.Segments ?? [];

    for (const segment of segmentsGroups) {
      if (!Array.isArray(segment) || segment.length === 0) continue;

      // 1️⃣ Try AccumulatedDuration
      const accumulated = segment.reduce(
        (sum, leg) => sum + (leg?.AccumulatedDuration ?? 0),
        0
      );

      if (accumulated > 0) {
        maxDuration = Math.max(maxDuration, accumulated / 60);
        continue;
      }

      // 2️⃣ Sum Duration fields if present
      const hasDurations = segment.some((leg: any) => leg?.Duration != null);
      if (hasDurations) {
        const segmentDuration = segment.reduce(
          (sum: number, leg: any) => sum + (leg?.Duration ?? 0),
          0
        );
        maxDuration = Math.max(maxDuration, segmentDuration / 60);
        continue;
      }

      // 3️⃣ Fallback: compute from DepTime → ArrTime
      const firstLeg = segment[0];
      const lastLeg = segment[segment.length - 1];
      const depTime = firstLeg?.Origin?.DepTime;
      const arrTime = lastLeg?.Destination?.ArrTime;

      if (depTime && arrTime) {
        try {
          const minutes = differenceInMinutes(
            parseISO(arrTime),
            parseISO(depTime)
          );
          maxDuration = Math.max(maxDuration, minutes / 60);
        } catch {
          continue; // Invalid date — skip
        }
      }
    }
  }

  return Math.ceil(maxDuration); // Round up to nearest hour
};


/**
 * Get the max and max  fare.
 */
export const getMinMaxPublishedFare = (
  data: any[]
): { minFare: number; maxFare: number } => {
  let minFare = Infinity;
  let maxFare = -Infinity;
  let hasValidFare = false;

  for (const group of data) {
    for (const flight of group) {
      const fare = flight?.Fare?.PublishedFare;

      if (typeof fare === "number" && !isNaN(fare)) {
        hasValidFare = true;
        if (fare < minFare) minFare = fare;
        if (fare > maxFare) maxFare = fare;
      }
    }
  }

  if (!hasValidFare) return { minFare: 0, maxFare: 0 };

  return {
    minFare: Math.floor(minFare),
    maxFare: Math.ceil(maxFare),
  };
};

// export const filterDataByAirlines = (
//   data: FlightData,
//   selectedAirlines: string[], // e.g., ['Air India', 'Indigo', 'SpiceJet']
//   selectedFlightStops: string[], // ["Direct", "1 Stop", "2 Stop +"]
//   durationLimit: number, // in hours
//   maxPrice: number,
//   selectedBaggage: string[], // ["carry_on_bag", "checked_bag"]
//   depTimeRange: number[] // e.g., [15, 20]
// ) => {
//   return data
//     .map((group) => {
//       // Filter individual flights in group based on max price
//       const filteredGroup = group.filter(
//         (flight) =>
//           typeof flight?.Fare?.PublishedFare === "number" &&
//           flight.Fare.PublishedFare <= maxPrice
//       );

//       if (filteredGroup.length === 0) return null;

//       // Stop filter
//       const segmentLength = filteredGroup[0]?.Segments?.[0]?.length;
//       const stopLabel = getStopLabel(segmentLength);
//       const isStopMatch =
//         selectedFlightStops.length === 0 ||
//         selectedFlightStops.includes(stopLabel);

//       // Airline filter
//       const allAirlines = filteredGroup
//         .flatMap((flight) => flight.Segments)
//         .flat()
//         .map((segment) => segment.Airline?.AirlineName);
//       const isAirlineMatch = allAirlines.some((name) =>
//         selectedAirlines.includes(name)
//       );

//       // Duration filter
//       const segments = filteredGroup?.[0]?.Segments?.[0];
//       const firstSegment = segments?.[0];
//       const lastSegment = segments?.[segments.length - 1];
//       const depTime = firstSegment?.Origin?.DepTime;
//       const arrTime = lastSegment?.Destination?.ArrTime;

//       let durationInHours = Infinity;
//       if (depTime && arrTime) {
//         try {
//           const durationInMinutes = differenceInMinutes(
//             parseISO(arrTime),
//             parseISO(depTime)
//           );
//           durationInHours = durationInMinutes / 60;
//         } catch {
//           durationInHours = Infinity;
//         }
//       }
//       const isDurationMatch = durationInHours <= durationLimit;

//       // Baggage filter
//       const allSegments = filteredGroup
//         .flatMap((flight) => flight.Segments)
//         .flat();

//       const hasCabinBaggage = allSegments.some(
//         (seg) => seg?.CabinBaggage !== null
//       );
//       const hasCheckedBaggage = allSegments.some(
//         (seg) => seg?.Baggage !== null
//       );

//       const isBaggageMatch =
//         selectedBaggage.length === 0 ||
//         (selectedBaggage.includes("carry_on_bag") && hasCabinBaggage) ||
//         (selectedBaggage.includes("checked_bag") && hasCheckedBaggage);

//       // Departure Time filter
//       let isTimeMatch = true;
//       if (depTime) {
//         const hour = parseISO(depTime).getHours();
//         const [startHour, endHour] = depTimeRange;
//         isTimeMatch = hour >= startHour && hour <= endHour;
//       }

//       // Final return
//       return isStopMatch &&
//         isAirlineMatch &&
//         isDurationMatch &&
//         isBaggageMatch &&
//         isTimeMatch
//         ? filteredGroup
//         : null;
//     })
//     .filter(Boolean)
//     .filter((group) => group !== null); // Remove nulls
// };

const getSegmentDurationInHours = (segment: any[]): number => {
  if (!Array.isArray(segment) || segment.length === 0) return Infinity;

  let totalDuration = 0;
  let hasAccumulated = false;
  let hasDuration = false;

  for (const leg of segment) {
    if (leg?.AccumulatedDuration && leg.AccumulatedDuration > 0) {
      totalDuration += leg.AccumulatedDuration;
      hasAccumulated = true;
    } else if (leg?.Duration && leg.Duration > 0) {
      totalDuration += leg.Duration;
      hasDuration = true;
    }
  }

  if (hasAccumulated || hasDuration) {
    return totalDuration / 60; // Convert minutes to hours
  }

  // Fallback using DepTime → ArrTime
  const firstLeg = segment[0];
  const lastLeg = segment[segment.length - 1];
  if (firstLeg?.Origin?.DepTime && lastLeg?.Destination?.ArrTime) {
    const minutes = differenceInMinutes(
      parseISO(lastLeg.Destination.ArrTime),
      parseISO(firstLeg.Origin.DepTime)
    );
    return minutes / 60;
  }

  return Infinity;
};

// Function to get outbound and inbound durations separately
export const getFlightDurations = (group: any[]) => {
  const segments = group?.[0]?.Segments ?? [];
  const outboundDuration = segments[0] ? getSegmentDurationInHours(segments[0]) : null;
  const inboundDuration = segments[1] ? getSegmentDurationInHours(segments[1]) : null;

  return { outboundDuration, inboundDuration };
};


export const filterDataByAirlines = (
  data: FlightData,
  selectedAirlines: string[],
  selectedFlightStops: string[],
  durationLimit: number,
  inboundLimit: number | null,
  maxPrice: number,
  selectedBaggage: string[],
  depTimeRange: number[],
  arrTimeRange: number[],
  depTimeRangeInternational: number[],
  arrTimeRangeInternational: number[]
) => {
  return data
    .map((group, groupIndex) => {
      // 💰 Filter by max price — 🟢 only apply if > 0
      const filteredGroup = group.filter(
        (flight) =>
          typeof flight?.Fare?.PublishedFare === "number" &&
          (maxPrice > 0 ? flight.Fare.PublishedFare <= maxPrice : true)
      );
      if (filteredGroup.length === 0) return null;

      // 🛑 Stops
      const segmentLength = filteredGroup[0]?.Segments?.[0]?.length;
      const stopLabel = getStopLabel(segmentLength);
      const isStopMatch =
        selectedFlightStops.length === 0 ||
        selectedFlightStops.includes(stopLabel);

      // ✈️ Airline
      const allAirlines = filteredGroup
        .flatMap((flight) => flight.Segments)
        .flat()
        .map((segment) => segment.Airline?.AirlineName);
      const isAirlineMatch =
        selectedAirlines.length === 0 ||
        allAirlines.some((name) => selectedAirlines.includes(name));

      // 🕓 Duration (outbound)
      const outbound = filteredGroup?.[0]?.Segments?.[0];
      const firstLeg = outbound?.[0];
      const lastLeg = outbound?.[outbound.length - 1];
      const depTime = firstLeg?.Origin?.DepTime;
      const arrTime = lastLeg?.Destination?.ArrTime;

      const { outboundDuration, inboundDuration } = getFlightDurations(filteredGroup);

     let isOutboundDurationMatch = true;
     const durationLimitNum = Number(durationLimit); // ensure numeric conversion
     
     if ( typeof outboundDuration === "number" && !Number.isNaN(outboundDuration) && !Number.isNaN(durationLimitNum)) {
       const tolerance = 5;
       isOutboundDurationMatch = outboundDuration <= durationLimitNum + tolerance;
     }


      let isInboundDurationMatch = true;

      const returnFlight = filteredGroup?.[0]?.Segments?.[1];
      if (Array.isArray(returnFlight)) {
        const retFirstLeg = returnFlight?.[0];
        const retLastLeg = returnFlight?.[returnFlight.length - 1];
        const retDepTime = retFirstLeg?.Origin?.DepTime;
        const retArrTime = retLastLeg?.Destination?.ArrTime;

        // 🟢 safe international dep time filter
        if (depTimeRangeInternational?.length === 2 && retDepTime) {
          const retDepHour = parseISO(retDepTime).getHours();
          const [startHour, endHour] = depTimeRangeInternational;
          if (retDepHour < startHour || retDepHour > endHour) return null;
        }

        // 🟢 safe international arr time filter
        if (arrTimeRangeInternational?.length === 2 && retArrTime) {
          const retArrHour = parseISO(retArrTime).getHours();
          const [startHour, endHour] = arrTimeRangeInternational;
          if (retArrHour < startHour || retArrHour > endHour) return null;
        }

        // 🟢 inbound limit check only if set
      const isInboundDurationMatch =
      typeof inboundLimit === "number" && inboundLimit > 0 && typeof inboundDuration === "number"
        ? inboundDuration <= inboundLimit
        : true;

      }

      // 🧳 Baggage
      const allSegments = filteredGroup.flatMap((flight) => flight.Segments).flat();
      const hasCabinBaggage = allSegments.some((seg) => seg?.CabinBaggage);
      const hasCheckedBaggage = allSegments.some((seg) => seg?.Baggage);

      const isBaggageMatch =
        selectedBaggage.length === 0 ||
        (selectedBaggage.includes("carry_on_bag") && hasCabinBaggage) ||
        (selectedBaggage.includes("checked_bag") && hasCheckedBaggage);

      // 🛫 Departure time
      let isDepTimeMatch = true;
      if (depTime && depTimeRange?.length === 2) {
        const depHour = parseISO(depTime).getHours();
        const [startHour, endHour] = depTimeRange;
        isDepTimeMatch = depHour >= startHour && depHour <= endHour;
      }

      // 🛬 Arrival time
      let isArrTimeMatch = true;
      if (arrTime && arrTimeRange?.length === 2) {
        const arrHour = parseISO(arrTime).getHours();
        const [startHour, endHour] = arrTimeRange;
        isArrTimeMatch = arrHour >= startHour && arrHour <= endHour;
      }

      const includeFlight =
        isStopMatch &&
        isAirlineMatch &&
        isOutboundDurationMatch &&
        isInboundDurationMatch &&
        isBaggageMatch &&
        isDepTimeMatch &&
        isArrTimeMatch;
      return includeFlight ? filteredGroup : null;
    })
    .filter(Boolean);
};
