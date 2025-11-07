type FareBreakdownItem = {
  PassengerType: number;
  PassengerCount: number;
};

type PassengerData = {
  id: string;
  type: string;
  name: string;
  selections: Record<string, number>;
};

export const generatePassengerMap = (
  fareBreakdown: FareBreakdownItem[] = [],
  passInfant: boolean = true
): Record<string, PassengerData> => {
  const passengerTypeMap: Record<number, string> = {
    1: "Adult",
    2: "Child",
    3: "Infant",
  };

  const passengerMap: Record<string, PassengerData> = {};
  let counter = 1;

  fareBreakdown.forEach(({ PassengerType, PassengerCount }) => {
    const type = passengerTypeMap[PassengerType] || "Unknown";

    // 👇 Skip infant passengers if flag is false
    if (!passInfant && PassengerType === 3) return;

    for (let i = 0; i < PassengerCount; i++) {
      const id = `guest-${counter}`;
      passengerMap[id] = {
        id,
        type,
        name: `Guest ${counter}`,
        selections: {},
      };
      counter++;
    }
  });

  return passengerMap;
};
