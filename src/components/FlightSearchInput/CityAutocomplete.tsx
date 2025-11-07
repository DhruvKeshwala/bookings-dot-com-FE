"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Select, { OptionProps, StylesConfig } from "react-select";

type SelectedCityType = {
  id: number;
  code: string;
  city: string;
  country: string;
};

type Props = {
  title: string;
  placement?: "left" | "right";
  containerClassName?: string;
  selectedCity: SelectedCityType | null;
  setSelectedCity: (city: SelectedCityType | null) => void;
};

export default function CityAutocomplete({
  title,
  containerClassName,
  placement = "right",
  selectedCity,
  setSelectedCity,
}: Props) {
  const [options, setOptions] = useState<SelectedCityType[]>([]);

  useEffect(() => {
    const fetchIataCodes = async () => {
      try {
        const res = await fetch("https://api.launcherr.co/api/allIataCodes");
        const json = await res.json();
        let cities: SelectedCityType[] = json.data.map((item: any) => ({
          id: item.id,
          code: item.iata_code,
          city: item.city,
          country: item.country,
        }));

        cities = cities.sort((a, b) => {
          if (a.city === "New Delhi") return -1;
          if (b.city === "New Delhi") return 1;

          if (a.country === "India" && b.country !== "India") return -1;
          if (a.country !== "India" && b.country === "India") return 1;

          return a.city.localeCompare(b.city);
        });

        setOptions(cities);
      } catch (error) {
        console.error("Error fetching IATA codes:", error);
      }
    };

    fetchIataCodes();
  }, []);

  useEffect(() => {
    // console.log("selected city", selectedCity)
  }, [selectedCity]);

  const CustomOption = ({
    innerProps,
    data,
    isFocused,
  }: OptionProps<SelectedCityType>) => {
    const isLast = data.code === options.at(-1)?.code;
    return (
      <div
        {...innerProps}
        className={`cursor-pointer bg-foreground p-6 flex gap-2 font-nunito text-xl border-primary ${
          isLast ? "" : "border-b-1"
        } ${isFocused ? "bg-highlight" : ""}`}
      >
        <Image
          src={`/icons/plane_take_off${isFocused ? "_active" : ""}.svg`}
          width={30}
          height={30}
          alt="Plane"
        />
        <div>
          <h4 className={`font-semibold ${isFocused ? "text-primary" : ""}`}>
            {data.city}
          </h4>
          <p className={isFocused ? "text-primary" : ""}>{data.country}</p>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`border-b border-black/40 flex flex-col font-[Nunito] text-black justify-center pt-3 px-1.5 ${containerClassName}`}
    >
      <div className="text-black text-lg lg:text-xl font-medium opacity-60">
        {title}
      </div>
      <Select
        instanceId="city_autocomplete"
        value={selectedCity}
        onChange={(value) => setSelectedCity(value as SelectedCityType)}
        options={options}
        getOptionValue={(option) => option.code}
        getOptionLabel={(option) => option.city}
        menuPortalTarget={
          typeof document !== "undefined" ? document.body : null
        }
        components={{ Option: CustomOption }}
        styles={customStyles(placement)}
      />
    </div>
  );
}

const customStyles = (placement: "left" | "right"): StylesConfig<any> => ({
  control: (base) => ({
    ...base,
    fontSize: "1.5rem",
    fontWeight: "bold",
    backgroundColor: "transparent",
    border: "none",
    boxShadow: "none",
    padding: 0,
    margin: 0,
  }),
  dropdownIndicator: () => ({ display: "none" }),
  indicatorSeparator: () => ({ display: "none" }),
  menu: (base) => ({
    ...base,
    minWidth: 300,
    borderRadius: "1rem",
    overflow: "hidden",
    ...(placement === "left" ? { right: 0 } : {}),
  }),
  option: (base) => ({ ...base }),
  singleValue: (base) => ({ ...base }),
  valueContainer: (base) => ({ ...base, padding: "0.5rem 0" }),
});
