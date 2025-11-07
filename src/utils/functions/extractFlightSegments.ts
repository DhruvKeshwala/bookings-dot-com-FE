
export function extractFlightSegments(apiResponse: any): any {
  const segments = apiResponse?.Response?.Results?.Segments ?? [];

  return segments.flatMap((segmentGroup: any[]) =>
    segmentGroup
      .map((segment: any) => {
        const origin = segment?.Origin?.Airport?.AirportCode;
        const destination = segment?.Destination?.Airport?.AirportCode;

        if (!origin || !destination) return null;

        return {
          id: `${origin}-${destination}`,
          label: `${origin} — ${destination}`,
        };
      })
      .filter(Boolean) // remove null values if origin/destination is missing
  );
}


