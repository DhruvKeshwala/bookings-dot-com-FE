import { Guests } from "@/types/hotel.types";

export const generatePaxRooms = (rooms: number, guests: Guests) => {
  const { adults, children, childrenAges } = guests;
  const paxRooms = [];

  const baseAdultsPerRoom = Math.floor(adults / rooms);
  const extraAdults = adults % rooms;

  const baseChildrenPerRoom = Math.floor(children / rooms);
  const extraChildren = children % rooms;

  let ageIndex = 0;

  for (let i = 0; i < rooms; i++) {
    const roomAdults = baseAdultsPerRoom + (i < extraAdults ? 1 : 0);
    const roomChildren = baseChildrenPerRoom + (i < extraChildren ? 1 : 0);

    const roomChildrenAges = childrenAges.slice(ageIndex, ageIndex + roomChildren);
    ageIndex += roomChildren;

    paxRooms.push({
      Adults: roomAdults,
      Children: roomChildren,
      ChildrenAges: roomChildrenAges.length > 0 ? roomChildrenAges : null,
    });
  }

  return paxRooms;
};