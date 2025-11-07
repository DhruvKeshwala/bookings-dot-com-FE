import Dropdown from "@/components/ui/Dropdown";
import { Dispatch, SetStateAction } from "react";
import TravellerCounter from "./TravellerCounter";
import { usePathname } from "next/navigation";

type PropsType = {
  travellers: {
    adults: number;
    children: number;
    infants: number;
  };
  setTravellers: Dispatch<
    SetStateAction<{
      adults: number;
      children: number;
      infants: number;
    }>
  >;
};

export default function TravellerDropdown({
  travellers,
  setTravellers,
}: Readonly<PropsType>) {
  const pathname = usePathname();
  const { adults, children, infants } = travellers;
  return (
    <Dropdown
      title={`${adults + children + infants || 1} Traveller`}
      titleClassName={`text-black font-bold opacity-80 py-[2px] h-[24px] ${
        pathname?.startsWith("/hotels/search") ? "" : "text-lg"
      }`}
      containerClassName="p-4 bg-white flex font-semi-bold flex-col gap-3"
    >
      {(
        [
          ["Adult", "adults"],
          ["Child", "children"],
          ["Infant", "infants"],
        ] as const
      ).map(([label, key], index) => {
        const count = travellers[key];
        const setCount = (value: number) =>
          setTravellers((prev) => ({ ...prev, [key]: value }));

        return (
          <TravellerCounter
            key={index}
            label={label}
            count={count}
            setCount={setCount}
            min={key === "adults" ? 1 : 0}
            max={key === "adults" ? 7 : 6}
          />
        );
      })}
    </Dropdown>
  );
}
